# LAB 4: CACHING Y OPTIMIZACIÓN AVANZADA
**PROVIAS DESCENTRALIZADO - Angular v18 - Sesión 6**  
**Duración:** 25 minutos  
**Objetivo:** Implementar estrategias de caching y optimización para máximo rendimiento

## 📋 DESCRIPCIÓN DEL LABORATORIO

Este es el laboratorio final donde convertirás tu aplicación de buena a extraordinaria. Implementarás técnicas avanzadas de caching, optimización de búsquedas, y estrategias de rendimiento que harán que tu aplicación se sienta instantánea.

### ¿Qué construiremos?
- **Memory Cache Service**: Cache inteligente en memoria con TTL
- **IndexedDB Cache**: Persistencia local para grandes volúmenes
- **Smart Search**: Búsquedas optimizadas con debounce y cancelación
- **Request Batching**: Agrupación de peticiones para eficiencia
- **Performance Monitoring**: Métricas de rendimiento en tiempo real

## 🎯 CONCEPTOS EDUCATIVOS CLAVE

### 1. **Estrategias de Cache**
```typescript
// Memory Cache (rápido, volátil)
const memoryCache = new Map<string, CacheEntry>();

// IndexedDB (persistente, grande)
const dbCache = await openDB('app-cache', 1);

// Service Worker (offline, automático)
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});
```

### 2. **Cache Invalidation**
```typescript
// El problema más difícil en computación:
// 1. Naming things
// 2. Cache invalidation
// 3. Off-by-one errors

// Estrategias:
// - TTL (Time To Live): expira después de X tiempo
// - Tags: invalida por etiquetas (user:123, products)
// - Events: invalida cuando ocurre un evento
// - Manual: invalida explícitamente
```

### 3. **Performance Optimization**
```typescript
// ❌ Sin optimización
searchSubject.subscribe(term => {
  this.http.get(`/search?q=${term}`).subscribe(results => {
    // Nueva petición por cada letra
  });
});

// ✅ Con optimización
searchSubject.pipe(
  debounceTime(300),           // Esperar que termine de escribir
  distinctUntilChanged(),      // Solo si cambió el valor
  switchMap(term =>            // Cancelar búsqueda anterior
    this.http.get(`/search?q=${term}`)
  ),
  shareReplay(1)              // Compartir resultado
);
```

## 🚀 COMANDOS PARA EJECUTAR EL LABORATORIO

### Paso 1: Navegar al proyecto
```bash
cd LAB4-Caching-Optimizacion/provias-optimization-app
```

### Paso 2: Instalar dependencias
```bash
npm install
npm install --save-dev concurrently
npm install idb  # Para IndexedDB
```

### Paso 3: Ejecutar aplicación
```bash
npm run dev
```

### Paso 4: Medir performance
```bash
# En DevTools > Network:
# - Disable cache para ver diferencia
# - Throttling para simular conexión lenta
# - Performance tab para métricas detalladas
```

## 📁 FUNCIONALIDADES IMPLEMENTADAS

### 💾 Memory Cache Service
```typescript
@Injectable({ providedIn: 'root' })
export class MemoryCacheService {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private defaultTTL = 300000; // 5 minutos
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    entry.lastAccessed = Date.now();
    return entry.data;
  }
  
  set<T>(key: string, data: T, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU(); // Eliminar menos usado recientemente
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      lastAccessed: Date.now()
    });
  }
  
  // Estadísticas para debugging
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      mostUsed: entries.sort((a, b) => b.hits - a.hits)[0]?.hits || 0
    };
  }
}
```

### 🗄️ IndexedDB Cache Service
```typescript
@Injectable({ providedIn: 'root' })
export class IndexedDbCacheService {
  private db: IDBPDatabase | null = null;
  
  async init(): Promise<void> {
    this.db = await openDB('provias-cache', 1, {
      upgrade(db) {
        // Store para cache de datos
        const store = db.createObjectStore('cache', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('tag', 'tag');
        
        // Store para métricas
        db.createObjectStore('metrics', { keyPath: 'id' });
      }
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    const entry = await this.db.get('cache', key);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      await this.db.delete('cache', key);
      return null;
    }
    
    // Actualizar estadísticas
    entry.hits++;
    entry.lastAccessed = Date.now();
    await this.db.put('cache', entry);
    
    return entry.data;
  }
  
  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    if (!this.db) await this.init();
    
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: options?.ttl || 3600000, // 1 hora por defecto
      tag: options?.tag,
      hits: 0,
      lastAccessed: Date.now()
    };
    
    await this.db.put('cache', entry);
  }
  
  // Limpiar por etiquetas
  async clearByTag(tag: string): Promise<void> {
    if (!this.db) return;
    
    const tx = this.db.transaction('cache', 'readwrite');
    const index = tx.store.index('tag');
    
    for await (const cursor of index.iterate(tag)) {
      cursor.delete();
    }
  }
}
```

### 🔍 Smart Search Service
```typescript
@Injectable({ providedIn: 'root' })
export class SmartSearchService {
  private searchSubject = new Subject<string>();
  private cache = inject(MemoryCacheService);
  
  // Observable de búsquedas optimizado
  search$ = this.searchSubject.pipe(
    debounceTime(300),               // Esperar 300ms
    distinctUntilChanged(),          // Solo si cambió
    filter(term => term.length >= 2), // Mínimo 2 caracteres
    tap(term => console.log(`🔍 Searching: ${term}`)),
    switchMap(term => this.performSearch(term)),
    shareReplay(1)                   // Compartir resultado
  );
  
  search(term: string): void {
    this.searchSubject.next(term);
  }
  
  private performSearch(term: string): Observable<any[]> {
    const cacheKey = `search:${term}`;
    
    // Verificar cache primero
    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for search: ${term}`);
      return of(cached);
    }
    
    // Petición real con timeout
    return this.http.get<any[]>(`/api/search?q=${term}`).pipe(
      timeout(5000),
      tap(results => {
        // Cachear resultados por 5 minutos
        this.cache.set(cacheKey, results, 300000);
        console.log(`💾 Cached search results for: ${term}`);
      }),
      catchError(error => {
        console.error(`❌ Search failed for: ${term}`, error);
        return of([]); // Retornar array vacío en caso de error
      })
    );
  }
  
  // Búsqueda predictiva
  getSuggestions(term: string): Observable<string[]> {
    if (term.length < 2) return of([]);
    
    const cacheKey = `suggestions:${term}`;
    const cached = this.cache.get<string[]>(cacheKey);
    
    if (cached) return of(cached);
    
    return this.http.get<string[]>(`/api/suggestions?q=${term}`).pipe(
      tap(suggestions => this.cache.set(cacheKey, suggestions, 600000)) // 10 min
    );
  }
}
```

### 📊 Performance Monitor Service
```typescript
@Injectable({ providedIn: 'root' })
export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  
  // Medir tiempo de operación
  measureOperation<T>(name: string, operation: () => Observable<T>): Observable<T> {
    const start = performance.now();
    
    return operation().pipe(
      tap(() => {
        const duration = performance.now() - start;
        this.recordMetric({
          name,
          duration,
          timestamp: Date.now(),
          type: 'operation'
        });
      }),
      catchError(error => {
        const duration = performance.now() - start;
        this.recordMetric({
          name,
          duration,
          timestamp: Date.now(),
          type: 'operation',
          error: error.message
        });
        throw error;
      })
    );
  }
  
  // Medir Core Web Vitals
  measureWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.recordMetric({
        name: 'LCP',
        duration: lastEntry.startTime,
        timestamp: Date.now(),
        type: 'web-vital'
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric({
          name: 'FID',
          duration: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          type: 'web-vital'
        });
      });
    }).observe({ entryTypes: ['first-input'] });
  }
  
  // Obtener estadísticas
  getStatistics(): PerformanceStats {
    const operations = this.metrics.filter(m => m.type === 'operation');
    const webVitals = this.metrics.filter(m => m.type === 'web-vital');
    
    return {
      totalOperations: operations.length,
      averageResponseTime: this.calculateAverage(operations.map(m => m.duration)),
      slowestOperation: Math.max(...operations.map(m => m.duration)),
      fastestOperation: Math.min(...operations.map(m => m.duration)),
      errorRate: operations.filter(m => m.error).length / operations.length,
      webVitals: {
        lcp: webVitals.find(m => m.name === 'LCP')?.duration,
        fid: webVitals.find(m => m.name === 'FID')?.duration
      }
    };
  }
}
```

## 🎛️ Cache Strategy Pattern
```typescript
export abstract class CacheStrategy {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, data: T, options?: CacheOptions): Promise<void>;
}

export class MultiTierCacheStrategy extends CacheStrategy {
  constructor(
    private memoryCache: MemoryCacheService,
    private dbCache: IndexedDbCacheService
  ) {
    super();
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Nivel 1: Memory cache (más rápido)
    let data = this.memoryCache.get<T>(key);
    if (data) {
      console.log(`📦 L1 Cache hit: ${key}`);
      return data;
    }
    
    // Nivel 2: IndexedDB cache
    data = await this.dbCache.get<T>(key);
    if (data) {
      console.log(`💾 L2 Cache hit: ${key}`);
      // Promover a L1 cache
      this.memoryCache.set(key, data);
      return data;
    }
    
    console.log(`❌ Cache miss: ${key}`);
    return null;
  }
  
  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    // Escribir en ambos niveles
    this.memoryCache.set(key, data, options?.ttl);
    await this.dbCache.set(key, data, options);
  }
}
```

## 🔄 Request Batching
```typescript
@Injectable({ providedIn: 'root' })
export class BatchRequestService {
  private pendingRequests = new Map<string, Observable<any>>();
  private batchQueue: BatchRequest[] = [];
  private batchTimer: any;
  
  // Agrupar requests similares
  batchSimilarRequests<T>(url: string, params?: any): Observable<T> {
    const key = this.generateKey(url, params);
    
    // Si ya hay una petición pendiente, compartirla
    if (this.pendingRequests.has(key)) {
      console.log(`🔗 Sharing request: ${key}`);
      return this.pendingRequests.get(key)!;
    }
    
    // Crear nueva petición compartida
    const request$ = this.http.get<T>(url, { params }).pipe(
      shareReplay(1),
      finalize(() => {
        this.pendingRequests.delete(key);
      })
    );
    
    this.pendingRequests.set(key, request$);
    return request$;
  }
  
  // Agrupar múltiples requests en uno solo
  addToBatch(request: BatchRequest): Observable<any> {
    return new Observable(observer => {
      request.observer = observer;
      this.batchQueue.push(request);
      
      // Programar ejecución del batch
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.executeBatch(), 50);
      }
    });
  }
  
  private executeBatch(): void {
    if (this.batchQueue.length === 0) return;
    
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;
    
    console.log(`📦 Executing batch of ${batch.length} requests`);
    
    // Agrupar por endpoint
    const grouped = this.groupByEndpoint(batch);
    
    // Ejecutar cada grupo
    Object.entries(grouped).forEach(([endpoint, requests]) => {
      this.executeBatchGroup(endpoint, requests);
    });
  }
}
```

## 📊 Métricas de Performance
```typescript
// Component para mostrar métricas en tiempo real
@Component({
  selector: 'app-performance-dashboard',
  template: `
    <div class="performance-dashboard">
      <h3>📊 Performance Metrics</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Cache Hit Rate</h4>
          <div class="metric-value">{{ cacheStats.hitRate | percent }}</div>
        </div>
        
        <div class="metric-card">
          <h4>Avg Response Time</h4>
          <div class="metric-value">{{ performanceStats.averageResponseTime | number:'1.0-0' }}ms</div>
        </div>
        
        <div class="metric-card">
          <h4>Memory Usage</h4>
          <div class="metric-value">{{ cacheStats.memoryUsage | number:'1.0-0' }}KB</div>
        </div>
        
        <div class="metric-card">
          <h4>Error Rate</h4>
          <div class="metric-value" [class.high]="performanceStats.errorRate > 0.05">
            {{ performanceStats.errorRate | percent }}
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="clearCache()">🗑️ Clear Cache</button>
        <button (click)="refreshStats()">🔄 Refresh Stats</button>
        <button (click)="exportMetrics()">📥 Export Metrics</button>
      </div>
    </div>
  `
})
export class PerformanceDashboardComponent implements OnInit {
  cacheStats$ = interval(1000).pipe(
    map(() => this.cacheService.getStats())
  );
  
  performanceStats$ = interval(5000).pipe(
    map(() => this.performanceMonitor.getStatistics())
  );
}
```

## 🧪 TESTING DE PERFORMANCE

### Benchmark Tests
```typescript
describe('Performance Tests', () => {
  it('should cache GET requests', fakeAsync(() => {
    const start = performance.now();
    
    // Primera petición (sin cache)
    service.getProducts().subscribe();
    httpMock.expectOne('/api/products').flush(mockProducts);
    tick();
    
    const firstCallDuration = performance.now() - start;
    
    // Segunda petición (con cache)
    const cacheStart = performance.now();
    service.getProducts().subscribe();
    // No debe haber nueva petición HTTP
    httpMock.verify();
    tick();
    
    const cachedCallDuration = performance.now() - cacheStart;
    
    expect(cachedCallDuration).toBeLessThan(firstCallDuration);
  }));
  
  it('should debounce search requests', fakeAsync(() => {
    const spy = spyOn(http, 'get').and.returnValue(of([]));
    
    // Simular escritura rápida
    searchService.search('a');
    searchService.search('an');
    searchService.search('ang');
    searchService.search('angu');
    searchService.search('angul');
    searchService.search('angular');
    
    // Esperar debounce
    tick(300);
    
    // Solo debe haber una petición
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/api/search?q=angular');
  }));
});
```

## 🎉 RESULTADOS ESPERADOS

Al completar este laboratorio tendrás:

### ✅ **Performance Excepcional**
- Cache multi-nivel para respuestas instantáneas
- Búsquedas optimizadas que no saturan el servidor
- Batching automático para reducir requests
- Métricas en tiempo real para monitoring

### ✅ **Experiencia de Usuario Superior**
- Aplicación que se siente instantánea
- Búsquedas fluidas sin lag
- Funcionalidad offline básica
- Loading times optimizados

### ✅ **Código de Producción**
- Arquitectura escalable para aplicaciones grandes
- Monitoring integrado para debugging
- Configuración flexible por ambiente
- Testing comprehensivo de performance

## 🚀 PRÓXIMOS PASOS

Has completado todos los laboratorios de la Sesión 6. Ahora tienes:

1. **LAB 1**: HttpClient CRUD completo ✅
2. **LAB 2**: Manejo profesional de errores ✅  
3. **LAB 3**: Interceptors para automatización ✅
4. **LAB 4**: Optimización y caching avanzado ✅

### Para la Sesión 7 (Asincronía y RxJS):
- Operadores avanzados de RxJS
- Patrones reactivos complejos
- Signals vs Observables comparación profunda
- Estado global con programación reactiva

---

**¡Felicitaciones! Has dominado la comunicación HTTP profesional en Angular v18! 🎉**

*Tu aplicación ahora se comunica eficientemente, maneja errores gracefully, se autentica automáticamente, y rinde como una aplicación de clase mundial. ¡Excelente trabajo!*
