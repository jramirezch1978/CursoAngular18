/**
 * CACHE INTERCEPTOR - LAB 4: Caching y Optimización
 * 
 * Interceptor para caching automático de requests HTTP con estrategias inteligentes.
 * Implementa cache transparente sin modificar servicios existentes.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. CACHING TRANSPARENTE:
 *    - Los servicios no necesitan saber sobre el cache
 *    - Interceptor maneja automáticamente el caching
 *    - Configuración centralizada por URL patterns
 * 
 * 2. ESTRATEGIAS INTELIGENTES:
 *    - GET requests: Cache-First por defecto
 *    - POST/PUT/DELETE: Invalidación automática
 *    - Headers de cache HTTP respetados
 * 
 * 3. OPTIMIZACIÓN AUTOMÁTICA:
 *    - Deduplicación de requests simultáneas
 *    - Prefetching basado en patrones
 *    - Invalidación inteligente por relaciones
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map, shareReplay } from 'rxjs/operators';
import { CacheService, CacheStrategy, CacheConfig } from '../services/cache.service';
import { environment } from '../../../environments/environment';

/**
 * Configuración de cache por URL pattern
 */
interface CacheRule {
  pattern: RegExp;
  config: Partial<CacheConfig>;
  methods: string[];
  invalidatePatterns?: RegExp[];
  prefetchPatterns?: RegExp[];
}

/**
 * Map para tracking de requests en vuelo
 */
const inflightRequests = new Map<string, Observable<any>>();

/**
 * Reglas de cache por defecto
 */
const DEFAULT_CACHE_RULES: CacheRule[] = [
  // Productos - Cache agresivo
  {
    pattern: /\/api\/products(\?.*)?$/,
    config: {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 10 * 60 * 1000, // 10 minutos
      tags: ['products'],
      compress: true
    },
    methods: ['GET'],
    invalidatePatterns: [/\/api\/products\/\d+/],
    prefetchPatterns: [/\/api\/products\/\d+/]
  },
  
  // Producto individual - Cache medio
  {
    pattern: /\/api\/products\/\d+$/,
    config: {
      strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
      ttl: 5 * 60 * 1000, // 5 minutos
      tags: ['products', 'product-detail']
    },
    methods: ['GET']
  },
  
  // Categorías - Cache largo
  {
    pattern: /\/api\/categories/,
    config: {
      strategy: CacheStrategy.CACHE_FIRST,
      ttl: 30 * 60 * 1000, // 30 minutos
      tags: ['categories']
    },
    methods: ['GET']
  },
  
  // Usuarios - Cache corto
  {
    pattern: /\/api\/users/,
    config: {
      strategy: CacheStrategy.NETWORK_FIRST,
      ttl: 2 * 60 * 1000, // 2 minutos
      tags: ['users']
    },
    methods: ['GET']
  },
  
  // Búsquedas - Cache muy corto
  {
    pattern: /\/api\/search/,
    config: {
      strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
      ttl: 30 * 1000, // 30 segundos
      tags: ['search']
    },
    methods: ['GET']
  },
  
  // Estadísticas - Network first
  {
    pattern: /\/api\/stats/,
    config: {
      strategy: CacheStrategy.NETWORK_FIRST,
      ttl: 1 * 60 * 1000, // 1 minuto
      tags: ['stats']
    },
    methods: ['GET']
  }
];

/**
 * Interceptor funcional para caching automático
 */
export const cacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  
  const cacheService = inject(CacheService);
  
  // ========================================
  // VERIFICAR SI DEBE SER CACHEADO
  // ========================================
  
  const cacheRule = findCacheRule(req);
  
  if (!cacheRule || !cacheRule.methods.includes(req.method)) {
    // No cacheable, procesar normalmente
    return handleNonCacheableRequest(req, next, cacheService);
  }
  
  // ========================================
  // PROCESAR REQUEST CACHEABLE
  // ========================================
  
  if (req.method === 'GET') {
    return handleGetRequest(req, next, cacheService, cacheRule);
  } else {
    return handleMutatingRequest(req, next, cacheService, cacheRule);
  }
};

// ========================================
// HANDLERS POR TIPO DE REQUEST
// ========================================

/**
 * Manejar requests GET (cacheables)
 */
function handleGetRequest(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  cacheService: CacheService,
  cacheRule: CacheRule
): Observable<HttpEvent<unknown>> {
  
  const cacheKey = generateCacheKey(req);
  
  console.log(`📋 [CacheInterceptor] Processing GET request: ${req.url}`);
  
  // ========================================
  // DEDUPLICACIÓN DE REQUESTS
  // ========================================
  
  // Verificar si ya hay una request en vuelo para esta clave
  const inflightRequest = inflightRequests.get(cacheKey);
  if (inflightRequest) {
    console.log(`🔄 [CacheInterceptor] Deduplicating request: ${cacheKey}`);
    return inflightRequest;
  }
  
  // ========================================
  // APLICAR ESTRATEGIA DE CACHE
  // ========================================
  
  const networkFn = () => {
    console.log(`🌐 [CacheInterceptor] Making network request: ${req.url}`);
    return next(req);
  };
  
  const cachedResponse$ = cacheService.getWithStrategy(
    cacheKey,
    networkFn,
    cacheRule.config
  ).pipe(
    map(data => {
      // Si los datos vienen del cache, crear HttpResponse
      if (data && typeof data === 'object' && 'body' in data) {
        return data as HttpEvent<unknown>;
      } else {
        // Crear HttpResponse para datos del cache
        return new HttpResponse({
          body: data,
          status: 200,
          statusText: 'OK',
          headers: req.headers.set('X-Cache', 'HIT')
        }) as HttpEvent<unknown>;
      }
    }),
    tap(() => {
      // Remover de requests en vuelo cuando complete
      inflightRequests.delete(cacheKey);
    }),
    shareReplay(1)
  );
  
  // Agregar a requests en vuelo
  inflightRequests.set(cacheKey, cachedResponse$);
  
  // ========================================
  // PREFETCHING AUTOMÁTICO
  // ========================================
  
  if (cacheRule.prefetchPatterns) {
    schedulePrefetch(req, cacheRule, cacheService);
  }
  
  return cachedResponse$;
}

/**
 * Manejar requests que modifican datos (POST, PUT, DELETE)
 */
function handleMutatingRequest(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  cacheService: CacheService,
  cacheRule: CacheRule
): Observable<HttpEvent<unknown>> {
  
  console.log(`✏️ [CacheInterceptor] Processing mutating request: ${req.method} ${req.url}`);
  
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
        // Request exitosa, invalidar cache relacionado
        invalidateRelatedCache(req, cacheRule, cacheService);
      }
    })
  );
}

/**
 * Manejar requests no cacheables
 */
function handleNonCacheableRequest(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  cacheService: CacheService
): Observable<HttpEvent<unknown>> {
  
  console.log(`🚫 [CacheInterceptor] Non-cacheable request: ${req.method} ${req.url}`);
  
  // Aún así, verificar si necesita invalidar cache
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          // Invalidación genérica basada en URL
          const urlPattern = extractUrlPattern(req.url);
          if (urlPattern) {
            cacheService.invalidateByPattern(urlPattern);
          }
        }
      })
    );
  }
  
  return next(req);
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Encontrar regla de cache para una request
 */
function findCacheRule(req: HttpRequest<unknown>): CacheRule | null {
  return DEFAULT_CACHE_RULES.find(rule => rule.pattern.test(req.url)) || null;
}

/**
 * Generar clave de cache para una request
 */
function generateCacheKey(req: HttpRequest<unknown>): string {
  const url = req.urlWithParams;
  const method = req.method;
  
  // Incluir headers relevantes para cache
  const relevantHeaders = ['Accept', 'Authorization'];
  const headerString = relevantHeaders
    .map(header => `${header}:${req.headers.get(header) || ''}`)
    .join('|');
  
  return `${method}:${url}:${btoa(headerString)}`;
}

/**
 * Invalidar cache relacionado después de mutación
 */
function invalidateRelatedCache(
  req: HttpRequest<unknown>,
  cacheRule: CacheRule,
  cacheService: CacheService
): void {
  
  // Invalidar por tags si están configurados
  if (cacheRule.config.tags) {
    const invalidated = cacheService.invalidateByTags(cacheRule.config.tags);
    console.log(`🗑️ [CacheInterceptor] Invalidated ${invalidated} entries by tags:`, cacheRule.config.tags);
  }
  
  // Invalidar por patrones específicos
  if (cacheRule.invalidatePatterns) {
    let totalInvalidated = 0;
    cacheRule.invalidatePatterns.forEach(pattern => {
      const invalidated = cacheService.invalidateByPattern(pattern);
      totalInvalidated += invalidated;
    });
    
    if (totalInvalidated > 0) {
      console.log(`🗑️ [CacheInterceptor] Invalidated ${totalInvalidated} entries by patterns`);
    }
  }
  
  // Invalidación inteligente basada en la URL de la request
  const intelligentPatterns = generateIntelligentInvalidationPatterns(req);
  intelligentPatterns.forEach(pattern => {
    cacheService.invalidateByPattern(pattern);
  });
}

/**
 * Generar patrones de invalidación inteligente
 */
function generateIntelligentInvalidationPatterns(req: HttpRequest<unknown>): RegExp[] {
  const patterns: RegExp[] = [];
  const url = req.url;
  
  // Si es una operación en un producto específico, invalidar listas de productos
  if (/\/api\/products\/\d+/.test(url)) {
    patterns.push(/\/api\/products(\?.*)?$/);
    patterns.push(/\/api\/search.*products/);
  }
  
  // Si es una operación en categorías, invalidar productos relacionados
  if (/\/api\/categories/.test(url)) {
    patterns.push(/\/api\/products/);
  }
  
  // Si es una operación en usuarios, invalidar estadísticas
  if (/\/api\/users/.test(url)) {
    patterns.push(/\/api\/stats/);
  }
  
  return patterns;
}

/**
 * Programar prefetching automático
 */
function schedulePrefetch(
  req: HttpRequest<unknown>,
  cacheRule: CacheRule,
  cacheService: CacheService
): void {
  
  if (!cacheRule.prefetchPatterns) return;
  
  // Prefetch después de un pequeño delay para no interferir con la request actual
  setTimeout(() => {
    cacheRule.prefetchPatterns!.forEach(pattern => {
      const prefetchUrls = generatePrefetchUrls(req.url, pattern);
      
      prefetchUrls.forEach(url => {
        const prefetchKey = generateCacheKey(new HttpRequest('GET', url));
        
        if (!cacheService.has(prefetchKey)) {
          console.log(`🔮 [CacheInterceptor] Prefetching: ${url}`);
          
          // Aquí harías la request de prefetch real
          // Por simplicidad, solo loggeamos
        }
      });
    });
  }, 100);
}

/**
 * Generar URLs para prefetch basadas en patrones
 */
function generatePrefetchUrls(currentUrl: string, pattern: RegExp): string[] {
  const urls: string[] = [];
  
  // Lógica simple de prefetch - en una app real sería más sofisticada
  if (pattern.test('/api/products/')) {
    // Si estamos viendo la lista de productos, prefetch los primeros detalles
    for (let i = 1; i <= 5; i++) {
      urls.push(`/api/products/${i}`);
    }
  }
  
  return urls;
}

/**
 * Extraer patrón de URL para invalidación genérica
 */
function extractUrlPattern(url: string): RegExp | null {
  // Convertir URLs específicas en patrones genéricos
  
  // /api/products/123 -> /api/products/
  if (/\/api\/products\/\d+/.test(url)) {
    return /\/api\/products/;
  }
  
  // /api/users/456 -> /api/users/
  if (/\/api\/users\/\d+/.test(url)) {
    return /\/api\/users/;
  }
  
  // /api/categories/789 -> /api/categories/
  if (/\/api\/categories\/\d+/.test(url)) {
    return /\/api\/categories/;
  }
  
  return null;
}

/**
 * Verificar si una request debe ser cacheada basándose en headers HTTP
 */
function shouldCacheByHeaders(req: HttpRequest<unknown>): boolean {
  // Verificar Cache-Control header
  const cacheControl = req.headers.get('Cache-Control');
  if (cacheControl) {
    if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
      return false;
    }
  }
  
  // Verificar Pragma header
  const pragma = req.headers.get('Pragma');
  if (pragma === 'no-cache') {
    return false;
  }
  
  return true;
}

/**
 * Extraer TTL de headers de respuesta
 */
function extractTTLFromResponse(response: HttpResponse<any>): number | null {
  const cacheControl = response.headers.get('Cache-Control');
  
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
      return parseInt(maxAgeMatch[1]) * 1000; // Convertir a milisegundos
    }
  }
  
  const expires = response.headers.get('Expires');
  if (expires) {
    const expiresDate = new Date(expires);
    const now = new Date();
    return Math.max(0, expiresDate.getTime() - now.getTime());
  }
  
  return null;
}

/**
 * Log de debug para cache
 */
function debugLog(message: string, data?: any): void {
  if (!environment.production) {
    console.log(`🔍 [CacheInterceptor Debug] ${message}`, data || '');
  }
}
