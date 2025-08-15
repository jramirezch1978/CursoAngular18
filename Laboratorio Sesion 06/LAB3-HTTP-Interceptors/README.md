# LAB 3: IMPLEMENTACIÓN DE HTTP INTERCEPTORS
**PROVIAS DESCENTRALIZADO - Angular v18 - Sesión 6**  
**Duración:** 45 minutos  
**Objetivo:** Implementar interceptors para autenticación, logging y transformación de datos

## 📋 DESCRIPCIÓN DEL LABORATORIO

Los Interceptors son los guardias de seguridad y asistentes automáticos de tu aplicación. Cada petición HTTP que sale y cada respuesta que entra pasa por ellos, permitiendo automatizar tareas comunes como autenticación, logging, y transformación de datos.

### ¿Qué construiremos?
- **Auth Interceptor**: Autenticación automática con tokens JWT
- **Logging Interceptor**: Registro detallado de todas las peticiones
- **Transform Interceptor**: Transformación automática de datos
- **Cache Interceptor**: Cache inteligente de respuestas
- **Error Interceptor**: Manejo global de errores

## 🎯 CONCEPTOS EDUCATIVOS CLAVE

### 1. **¿Qué son los Interceptors?**
```typescript
// Interceptor = Middleware para HTTP
request → interceptor1 → interceptor2 → servidor
response ← interceptor2 ← interceptor1 ← servidor

// Cada interceptor puede:
// - Modificar la request antes de enviarla
// - Procesar la response antes de devolverla
// - Manejar errores globalmente
// - Agregar headers automáticamente
```

### 2. **Functional vs Class Interceptors**
```typescript
// ❌ Forma antigua (clases)
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Implementación compleja
  }
}

// ✅ Forma moderna (funciones) - Angular 15+
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Implementación simple y funcional
  return next(req);
};
```

### 3. **Orden de Ejecución**
```typescript
// En app.config.ts
withInterceptors([
  authInterceptor,      // 1º en requests, 4º en responses
  loggingInterceptor,   // 2º en requests, 3º en responses  
  cacheInterceptor,     // 3º en requests, 2º en responses
  errorInterceptor      // 4º en requests, 1º en responses
])
```

## 🚀 COMANDOS PARA EJECUTAR EL LABORATORIO

### Paso 1: Navegar al proyecto
```bash
cd LAB3-HTTP-Interceptors/provias-interceptors-app
```

### Paso 2: Instalar dependencias
```bash
npm install
npm install --save-dev concurrently
```

### Paso 3: Ejecutar aplicación
```bash
npm run dev
```

### Paso 4: Probar interceptors
```bash
# Ver logs en la consola del navegador (F12)
# Probar login/logout para ver auth interceptor
# Observar headers automáticos en Network tab
```

## 📁 INTERCEPTORS IMPLEMENTADOS

### 🔐 Auth Interceptor
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Skip rutas públicas
  if (authService.isPublicUrl(req.url)) {
    return next(req);
  }
  
  // Agregar token automáticamente
  const token = authService.token();
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-Auth-Token': token
      }
    });
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado - intentar refresh
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.token();
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(retryReq);
            }),
            catchError(() => {
              // Refresh falló - logout y redirect
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
  
  // Sin token - redirect a login
  router.navigate(['/login']);
  return throwError(() => new Error('Authentication required'));
};
```

### 📊 Logging Interceptor
```typescript
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const loggingService = inject(LoggingService);
  const started = Date.now();
  
  // Log request
  console.group(`🚀 ${req.method} ${req.urlWithParams}`);
  console.log('Headers:', req.headers.keys().map(key => 
    `${key}: ${req.headers.get(key)}`
  ));
  if (req.body) console.log('Body:', req.body);
  
  loggingService.logHttpRequest(req.method, req.url, req.body);
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsed = Date.now() - started;
          console.log(`✅ Response ${event.status} in ${elapsed}ms`);
          console.log('Response body:', event.body);
          console.groupEnd();
          
          loggingService.logHttpResponse(
            req.method, req.url, event.status, elapsed, event.body
          );
        }
      },
      error: (error: HttpErrorResponse) => {
        const elapsed = Date.now() - started;
        console.error(`❌ Error ${error.status} in ${elapsed}ms`);
        console.error('Error details:', error);
        console.groupEnd();
        
        loggingService.logHttpError(req.method, req.url, error.status, error);
      }
    }),
    finalize(() => {
      const elapsed = Date.now() - started;
      console.log(`⏱️ Total time: ${elapsed}ms`);
    })
  );
};
```

### 🔄 Transform Interceptor
```typescript
export const transformInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        return event.clone({
          body: transformResponse(event.body)
        });
      }
      return event;
    })
  );
};

function transformResponse(body: any): any {
  if (!body) return body;
  
  // Extraer data de wrapper del backend
  if (body.success && body.data) {
    body = body.data;
  }
  
  // Convertir fechas string a Date objects
  return transformDates(body);
}

function transformDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformDates(item));
  }
  
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string' && isIsoDateString(value)) {
          transformed[key] = new Date(value);
        } else {
          transformed[key] = transformDates(value);
        }
      }
    }
    return transformed;
  }
  
  return obj;
}
```

### 💾 Cache Interceptor
```typescript
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);
  
  // Solo cachear GET requests
  if (req.method !== 'GET') {
    return next(req);
  }
  
  // Skip si tiene header x-skip-cache
  if (req.headers.has('x-skip-cache')) {
    return next(req);
  }
  
  const cacheKey = `${req.method}:${req.urlWithParams}`;
  
  // Verificar cache
  const cachedResponse = cacheService.get(cacheKey);
  if (cachedResponse) {
    console.log(`📦 Cache hit: ${req.url}`);
    return of(cachedResponse);
  }
  
  console.log(`🌐 Cache miss: ${req.url}`);
  
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        // Extraer TTL del header Cache-Control
        const cacheControl = event.headers.get('cache-control');
        let ttl: number | undefined;
        
        if (cacheControl) {
          const maxAge = cacheControl.match(/max-age=(\d+)/);
          if (maxAge) {
            ttl = parseInt(maxAge[1]) * 1000;
          }
        }
        
        cacheService.set(cacheKey, event, ttl);
      }
    }),
    shareReplay(1)
  );
};
```

## 🔧 SERVICIOS DE SOPORTE

### AuthService
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(null);
  private userSignal = signal<User | null>(null);
  
  token = computed(() => this.tokenSignal());
  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());
  
  publicUrls = ['/auth/login', '/auth/register', '/public'];
  
  isPublicUrl(url: string): boolean {
    return this.publicUrls.some(publicUrl => url.includes(publicUrl));
  }
  
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        this.userSignal.set(response.user);
        localStorage.setItem('auth_token', response.token);
      })
    );
  }
  
  refreshToken(): Observable<LoginResponse> {
    const token = this.tokenSignal();
    return this.http.post<LoginResponse>('/api/auth/refresh', { token }).pipe(
      tap(response => {
        this.tokenSignal.set(response.token);
        localStorage.setItem('auth_token', response.token);
      })
    );
  }
  
  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem('auth_token');
  }
}
```

### CacheService
```typescript
@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private defaultTTL = 300000; // 5 minutos
  
  get(key: string): HttpResponse<any> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.response.clone();
  }
  
  set(key: string, response: HttpResponse<any>, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      response: response.clone(),
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  clearPattern(pattern: RegExp): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => pattern.test(key));
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
```

## 🧪 TESTING DE INTERCEPTORS

### Verificar Auth Interceptor
```typescript
// En tests
it('should add auth header to requests', () => {
  const token = 'test-token';
  authService.setToken(token);
  
  httpMock.expectOne(req => {
    return req.headers.get('Authorization') === `Bearer ${token}`;
  }).flush(mockData);
});

it('should redirect to login on 401', () => {
  httpMock.expectOne('/api/protected').flush(null, {
    status: 401,
    statusText: 'Unauthorized'
  });
  
  expect(router.navigate).toHaveBeenCalledWith(['/login']);
});
```

### Verificar Logging Interceptor
```typescript
it('should log all HTTP requests', () => {
  spyOn(console, 'group');
  spyOn(console, 'log');
  
  http.get('/api/test').subscribe();
  httpMock.expectOne('/api/test').flush({});
  
  expect(console.group).toHaveBeenCalledWith(
    jasmine.stringMatching('🚀 GET')
  );
});
```

## 💡 CASOS DE USO AVANZADOS

### Conditional Interceptors
```typescript
export const conditionalInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo aplicar a ciertos endpoints
  if (req.url.includes('/api/secure')) {
    // Lógica especial para endpoints seguros
    return next(addSecurityHeaders(req));
  }
  
  return next(req);
};
```

### Request/Response Transformation
```typescript
export const apiVersionInterceptor: HttpInterceptorFn = (req, next) => {
  // Agregar versión de API automáticamente
  const versionedReq = req.clone({
    setHeaders: {
      'API-Version': 'v2',
      'Accept': 'application/vnd.api+json'
    }
  });
  
  return next(versionedReq);
};
```

### Performance Monitoring
```typescript
export const performanceInterceptor: HttpInterceptorFn = (req, next) => {
  const start = performance.now();
  
  return next(req).pipe(
    finalize(() => {
      const duration = performance.now() - start;
      
      // Enviar métricas a servicio de monitoring
      analytics.track('http_request', {
        url: req.url,
        method: req.method,
        duration,
        timestamp: Date.now()
      });
    })
  );
};
```

## 🎉 RESULTADOS ESPERADOS

Al completar este laboratorio tendrás:

### ✅ **Automatización Completa**
- Headers automáticos en todas las requests
- Logging transparente sin código extra
- Cache inteligente para mejor performance
- Manejo de autenticación sin esfuerzo manual

### ✅ **Arquitectura Limpia**
- Separación de concerns muy clara
- Código de componentes más simple
- Lógica transversal centralizada
- Fácil testing y mantenimiento

### ✅ **Experiencia de Desarrollo Superior**
- Debugging facilitado con logs automáticos
- Testing simplificado con interceptors mockeables
- Performance optimizada con cache automático
- Seguridad reforzada con auth automática

## 🚀 ¿QUÉ SIGUE?

**Siguiente laboratorio:** LAB 4 - Caching y Optimización

En el siguiente laboratorio aprenderás:
- Estrategias avanzadas de caching
- Optimización de búsquedas con debounce
- Técnicas de performance para aplicaciones grandes
- Métricas y monitoring de rendimiento

---

**¡Excelente trabajo automatizando tareas HTTP con Interceptors! ⚡**

*Este laboratorio te da superpoderes de automatización para que tu código sea más limpio y tu aplicación más robusta.*
