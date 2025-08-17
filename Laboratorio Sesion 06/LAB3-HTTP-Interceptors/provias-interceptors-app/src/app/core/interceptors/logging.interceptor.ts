/**
 * LOGGING INTERCEPTOR - LAB 3: HTTP Interceptors
 * 
 * Interceptor para logging automático y detallado de todas las requests/responses HTTP.
 * Proporciona debugging avanzado y métricas de rendimiento.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. LOGGING ESTRUCTURADO:
 *    - Información consistente para todas las requests
 *    - Agrupación visual en console para mejor debugging
 *    - Métricas de tiempo y rendimiento
 * 
 * 2. DEBUGGING AVANZADO:
 *    - Headers, body, y parámetros de requests
 *    - Status codes y tiempo de respuesta
 *    - Identificación de requests lentas o fallidas
 * 
 * 3. PRODUCCIÓN VS DESARROLLO:
 *    - Logging detallado en desarrollo
 *    - Logging mínimo en producción
 *    - Envío de métricas a servicios externos
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, finalize, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface para información de request
 */
interface RequestInfo {
  id: string;
  method: string;
  url: string;
  startTime: number;
  headers: { [key: string]: string };
  hasBody: boolean;
  bodySize?: number;
}

/**
 * Interface para información de response
 */
interface ResponseInfo {
  status: number;
  statusText: string;
  headers: { [key: string]: string };
  bodySize?: number;
  duration: number;
}

/**
 * Interface para métricas de rendimiento
 */
interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: string;
  userAgent: string;
}

/**
 * Interceptor funcional para logging de HTTP requests/responses
 */
export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  
  // ========================================
  // PREPARAR INFORMACIÓN DE REQUEST
  // ========================================
  
  const requestInfo: RequestInfo = {
    id: generateRequestId(),
    method: req.method,
    url: req.urlWithParams,
    startTime: performance.now(),
    headers: extractHeaders(req.headers),
    hasBody: !!req.body,
    bodySize: req.body ? getBodySize(req.body) : undefined
  };
  
  // ========================================
  // LOG DE REQUEST (DESARROLLO)
  // ========================================
  
  if (shouldLogInDevelopment()) {
    logRequest(requestInfo, req);
  }
  
  // ========================================
  // PROCESAR REQUEST Y RESPONSE
  // ========================================
  
  return next(req).pipe(
    tap(event => {
      // Solo procesar respuestas completas
      if (event.type === HttpEventType.Response) {
        const response = event as HttpResponse<unknown>;
        const responseInfo = createResponseInfo(response, requestInfo.startTime);
        
        if (shouldLogInDevelopment()) {
          logResponse(requestInfo, responseInfo, response);
        }
        
        // Enviar métricas en producción
        if (shouldSendMetrics()) {
          sendMetrics(createMetrics(requestInfo, responseInfo, true));
        }
      }
    }),
    
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        const responseInfo = createErrorResponseInfo(error, requestInfo.startTime);
        
        if (shouldLogInDevelopment()) {
          logError(requestInfo, responseInfo, error);
        }
        
        if (shouldSendMetrics()) {
          sendMetrics(createMetrics(requestInfo, responseInfo, false));
        }
      }
      
      throw error;
    }),
    
    finalize(() => {
      const duration = performance.now() - requestInfo.startTime;
      
      if (shouldLogInDevelopment()) {
        logFinalize(requestInfo, duration);
      }
    })
  );
};

// ========================================
// FUNCIONES DE LOGGING
// ========================================

/**
 * Log de request saliente
 */
function logRequest(requestInfo: RequestInfo, req: HttpRequest<unknown>): void {
  const emoji = getMethodEmoji(requestInfo.method);
  
  console.group(`${emoji} ${requestInfo.method} ${requestInfo.url}`);
  console.log(`🆔 Request ID: ${requestInfo.id}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  // Headers (filtrar sensitivos)
  const safeHeaders = filterSensitiveHeaders(requestInfo.headers);
  if (Object.keys(safeHeaders).length > 0) {
    console.log('📋 Headers:', safeHeaders);
  }
  
  // Body (si existe y no es muy grande)
  if (requestInfo.hasBody && req.body) {
    const bodyLog = getBodyForLogging(req.body);
    if (bodyLog) {
      console.log('📦 Body:', bodyLog);
    }
  }
  
  // Información adicional
  if (requestInfo.bodySize) {
    console.log(`📏 Body size: ${formatBytes(requestInfo.bodySize)}`);
  }
}

/**
 * Log de response exitosa
 */
function logResponse(requestInfo: RequestInfo, responseInfo: ResponseInfo, response: HttpResponse<unknown>): void {
  const statusEmoji = getStatusEmoji(responseInfo.status);
  
  console.log(`${statusEmoji} Response ${responseInfo.status} ${responseInfo.statusText}`);
  console.log(`⏱️ Duration: ${responseInfo.duration.toFixed(2)}ms`);
  
  // Headers de respuesta
  const responseHeaders = filterSensitiveHeaders(responseInfo.headers);
  if (Object.keys(responseHeaders).length > 0) {
    console.log('📋 Response Headers:', responseHeaders);
  }
  
  // Body de respuesta (limitado)
  if (response.body) {
    const bodyLog = getBodyForLogging(response.body);
    if (bodyLog) {
      console.log('📦 Response Body:', bodyLog);
    }
  }
  
  if (responseInfo.bodySize) {
    console.log(`📏 Response size: ${formatBytes(responseInfo.bodySize)}`);
  }
  
  // Alertas de rendimiento
  if (responseInfo.duration > 2000) {
    console.warn(`🐌 Slow request detected: ${responseInfo.duration.toFixed(2)}ms`);
  }
  
  console.groupEnd();
}

/**
 * Log de error de response
 */
function logError(requestInfo: RequestInfo, responseInfo: ResponseInfo, error: HttpErrorResponse): void {
  const statusEmoji = getStatusEmoji(responseInfo.status);
  
  console.error(`${statusEmoji} Error ${responseInfo.status} ${responseInfo.statusText}`);
  console.error(`⏱️ Duration: ${responseInfo.duration.toFixed(2)}ms`);
  console.error('❌ Error details:', {
    message: error.message,
    error: error.error,
    url: error.url
  });
  
  console.groupEnd();
}

/**
 * Log de finalización
 */
function logFinalize(requestInfo: RequestInfo, totalDuration: number): void {
  if (shouldLogInDevelopment()) {
    console.log(`🏁 Request ${requestInfo.id} completed in ${totalDuration.toFixed(2)}ms`);
  }
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Generar ID único para request
 */
function generateRequestId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Extraer headers de HttpHeaders
 */
function extractHeaders(httpHeaders: any): { [key: string]: string } {
  const headers: { [key: string]: string } = {};
  
  if (httpHeaders && httpHeaders.keys) {
    httpHeaders.keys().forEach((key: string) => {
      headers[key] = httpHeaders.get(key) || '';
    });
  }
  
  return headers;
}

/**
 * Crear información de response exitosa
 */
function createResponseInfo(response: HttpResponse<unknown>, startTime: number): ResponseInfo {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: extractHeaders(response.headers),
    bodySize: response.body ? getBodySize(response.body) : undefined,
    duration: performance.now() - startTime
  };
}

/**
 * Crear información de response de error
 */
function createErrorResponseInfo(error: HttpErrorResponse, startTime: number): ResponseInfo {
  return {
    status: error.status,
    statusText: error.statusText,
    headers: extractHeaders(error.headers),
    bodySize: error.error ? getBodySize(error.error) : undefined,
    duration: performance.now() - startTime
  };
}

/**
 * Crear métricas de rendimiento
 */
function createMetrics(requestInfo: RequestInfo, responseInfo: ResponseInfo, success: boolean): PerformanceMetrics {
  return {
    requestId: requestInfo.id,
    method: requestInfo.method,
    url: requestInfo.url,
    duration: responseInfo.duration,
    status: responseInfo.status,
    success,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
}

/**
 * Obtener emoji para método HTTP
 */
function getMethodEmoji(method: string): string {
  const emojis: { [key: string]: string } = {
    'GET': '📥',
    'POST': '📤',
    'PUT': '✏️',
    'PATCH': '🔧',
    'DELETE': '🗑️',
    'OPTIONS': '❓',
    'HEAD': '👀'
  };
  
  return emojis[method] || '🌐';
}

/**
 * Obtener emoji para status code
 */
function getStatusEmoji(status: number): string {
  if (status >= 200 && status < 300) return '✅';
  if (status >= 300 && status < 400) return '↩️';
  if (status >= 400 && status < 500) return '⚠️';
  if (status >= 500) return '❌';
  return '❓';
}

/**
 * Filtrar headers sensitivos para logging
 */
function filterSensitiveHeaders(headers: { [key: string]: string }): { [key: string]: string } {
  const sensitiveKeys = ['authorization', 'cookie', 'x-auth-token', 'x-api-key'];
  const filtered: { [key: string]: string } = {};
  
  Object.keys(headers).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      filtered[key] = '[REDACTED]';
    } else {
      filtered[key] = headers[key];
    }
  });
  
  return filtered;
}

/**
 * Obtener tamaño del body
 */
function getBodySize(body: any): number {
  if (!body) return 0;
  
  if (typeof body === 'string') {
    return new Blob([body]).size;
  }
  
  if (body instanceof FormData) {
    // Estimación para FormData
    return 1024; // Placeholder
  }
  
  try {
    return new Blob([JSON.stringify(body)]).size;
  } catch {
    return 0;
  }
}

/**
 * Obtener body para logging (limitado y seguro)
 */
function getBodyForLogging(body: any): any {
  if (!body) return null;
  
  // Limitar tamaño para logging
  const maxSize = 1000; // caracteres
  
  if (typeof body === 'string') {
    return body.length > maxSize ? body.substring(0, maxSize) + '...' : body;
  }
  
  if (body instanceof FormData) {
    return '[FormData]';
  }
  
  try {
    const jsonString = JSON.stringify(body, null, 2);
    return jsonString.length > maxSize ? 
      jsonString.substring(0, maxSize) + '...' : 
      JSON.parse(jsonString);
  } catch {
    return '[Unable to serialize body]';
  }
}

/**
 * Formatear bytes en formato legible
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Verificar si debe hacer logging en desarrollo
 */
function shouldLogInDevelopment(): boolean {
  return !environment.production;
}

/**
 * Verificar si debe enviar métricas
 */
function shouldSendMetrics(): boolean {
  return environment.production && environment.enableMetrics;
}

/**
 * Enviar métricas a servicio externo (placeholder)
 */
function sendMetrics(metrics: PerformanceMetrics): void {
  // En un entorno real, esto enviaría métricas a un servicio como:
  // - Google Analytics
  // - Application Insights
  // - Custom metrics endpoint
  
  console.log('📊 Metrics (would be sent to external service):', metrics);
  
  // Ejemplo de implementación real:
  // fetch('/api/metrics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metrics)
  // }).catch(error => console.warn('Failed to send metrics:', error));
}


