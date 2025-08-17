/**
 * AUTH INTERCEPTOR - LAB 3: HTTP Interceptors
 * 
 * Interceptor funcional para manejo automático de autenticación.
 * Agrega tokens automáticamente y maneja refresh de tokens expirados.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. INTERCEPTOR FUNCIONAL (ANGULAR 15+):
 *    - Más simple que interceptors basados en clases
 *    - Mejor para testing y composición
 *    - Integración natural con dependency injection
 * 
 * 2. AUTOMATIZACIÓN DE AUTENTICACIÓN:
 *    - Headers automáticos en todas las requests
 *    - Refresh automático de tokens expirados
 *    - Manejo de errores 401/403
 * 
 * 3. FLUJO DE RECUPERACIÓN:
 *    - Intento de refresh en errores 401
 *    - Retry de request original con nuevo token
 *    - Logout automático si refresh falla
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/**
 * Interceptor funcional para autenticación automática
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // ========================================
  // VERIFICAR SI ES URL PÚBLICA
  // ========================================
  
  if (authService.isPublicUrl(req.url)) {
    console.log(`📂 [AuthInterceptor] Public URL, skipping auth: ${req.url}`);
    return next(req);
  }
  
  // ========================================
  // AGREGAR TOKEN DE AUTENTICACIÓN
  // ========================================
  
  const token = authService.token();
  
  if (!token) {
    console.warn(`⚠️ [AuthInterceptor] No token available for: ${req.url}`);
    
    // Redirigir a login si no hay token y no es una URL pública
    if (authService.isAuthenticated()) {
      // Usuario debería estar autenticado pero no hay token - logout
      authService.logout().subscribe(() => {
        router.navigate(['/login']);
      });
    } else {
      router.navigate(['/login']);
    }
    
    return throwError(() => new Error('Authentication required'));
  }
  
  // Clonar request y agregar headers de autenticación
  const authReq = req.clone({
    setHeaders: {
      ...authService.getAuthHeaders(),
      'X-Timestamp': new Date().toISOString(),
      'X-Request-ID': generateRequestId()
    }
  });
  
  console.log(`🔐 [AuthInterceptor] Auth headers added to: ${req.method} ${req.url}`);
  
  // ========================================
  // PROCESAR REQUEST CON MANEJO DE ERRORES
  // ========================================
  
  return next(authReq).pipe(
    tap(event => {
      // Log successful requests (opcional)
      if (event.type === 4) { // HttpEventType.Response
        console.log(`✅ [AuthInterceptor] Authenticated request successful: ${req.method} ${req.url}`);
      }
    }),
    
    catchError((error: HttpErrorResponse) => {
      console.error(`❌ [AuthInterceptor] Request failed: ${req.method} ${req.url}`, error.status);
      
      // ========================================
      // MANEJO DE ERRORES DE AUTENTICACIÓN
      // ========================================
      
      if (error.status === 401) {
        return handle401Error(req, next, authService, router);
      }
      
      if (error.status === 403) {
        return handle403Error(error, authService, router);
      }
      
      // Para otros errores, propagar sin modificar
      return throwError(() => error);
    })
  );
};

/**
 * Manejar error 401 (Unauthorized)
 * Intenta refresh del token y retry de la request original
 */
function handle401Error(
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  
  console.warn('⚠️ [AuthInterceptor] 401 Unauthorized - Attempting token refresh');
  
  // Verificar si tenemos refresh token
  if (!authService.refreshToken()) {
    console.error('❌ [AuthInterceptor] No refresh token available');
    return handleAuthFailure(authService, router);
  }
  
  // Intentar refresh del token
  return authService.refreshAuthToken().pipe(
    switchMap(() => {
      console.log('✅ [AuthInterceptor] Token refreshed, retrying original request');
      
      // Retry de la request original con el nuevo token
      const newToken = authService.token();
      if (!newToken) {
        return handleAuthFailure(authService, router);
      }
      
      const retryReq = originalReq.clone({
        setHeaders: {
          ...authService.getAuthHeaders(),
          'X-Retry': 'true',
          'X-Retry-Reason': 'token-refresh'
        }
      });
      
      return next(retryReq);
    }),
    
    catchError(refreshError => {
      console.error('❌ [AuthInterceptor] Token refresh failed:', refreshError);
      return handleAuthFailure(authService, router);
    })
  );
}

/**
 * Manejar error 403 (Forbidden)
 * Usuario autenticado pero sin permisos
 */
function handle403Error(
  error: HttpErrorResponse,
  authService: AuthService,
  router: Router
): Observable<never> {
  
  console.error('❌ [AuthInterceptor] 403 Forbidden - Insufficient permissions');
  
  const user = authService.user();
  if (user) {
    console.log(`👤 [AuthInterceptor] User ${user.email} (${user.role}) lacks permissions for this resource`);
  }
  
  // No hacer logout automático en 403, solo mostrar error
  // El usuario está autenticado pero no tiene permisos
  
  // Opcional: redirigir a página de "acceso denegado"
  // router.navigate(['/access-denied']);
  
  return throwError(() => error);
}

/**
 * Manejar fallo de autenticación
 * Logout y redirección a login
 */
function handleAuthFailure(
  authService: AuthService,
  router: Router
): Observable<never> {
  
  console.log('🚪 [AuthInterceptor] Authentication failure - Logging out');
  
  return authService.logout().pipe(
    tap(() => {
      router.navigate(['/login'], {
        queryParams: { returnUrl: router.url, reason: 'session-expired' }
      });
    }),
    switchMap(() => throwError(() => new Error('Authentication failed')))
  );
}

/**
 * Generar ID único para la request (para tracking)
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verificar si una request es un retry
 */
function isRetryRequest(req: HttpRequest<unknown>): boolean {
  return req.headers.has('X-Retry');
}

/**
 * Obtener información de debug de la request
 */
function getRequestDebugInfo(req: HttpRequest<unknown>): object {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers.keys().reduce((acc, key) => {
      // No incluir tokens en logs por seguridad
      if (key.toLowerCase().includes('authorization') || key.toLowerCase().includes('token')) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = req.headers.get(key);
      }
      return acc;
    }, {} as any),
    hasBody: !!req.body,
    isRetry: isRetryRequest(req)
  };
}

/**
 * Log detallado para debugging (solo en desarrollo)
 */
function debugLog(message: string, data?: any): void {
  if (!environment.production) {
    console.log(`🔍 [AuthInterceptor Debug] ${message}`, data || '');
  }
}
