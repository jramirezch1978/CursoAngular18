/**
 * TRANSFORM INTERCEPTOR - LAB 3: HTTP Interceptors
 * 
 * Interceptor para transformación automática de requests y responses.
 * Estandariza formatos de datos y convierte tipos automáticamente.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. TRANSFORMACIÓN DE DATOS:
 *    - Normalización de respuestas del backend
 *    - Conversión automática de tipos (fechas, números)
 *    - Estandarización de formatos de error
 * 
 * 2. ADAPTACIÓN DE APIS:
 *    - Diferentes backends pueden tener formatos distintos
 *    - El interceptor actúa como adaptador
 *    - Frontend recibe datos consistentes
 * 
 * 3. PROCESAMIENTO AUTOMÁTICO:
 *    - Sin código repetitivo en servicios
 *    - Transformaciones aplicadas globalmente
 *    - Configuración centralizada
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interface para respuesta estandarizada del backend
 */
interface BackendResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    version?: string;
  };
}

/**
 * Interface para configuración de transformación
 */
interface TransformConfig {
  transformDates: boolean;
  transformNumbers: boolean;
  normalizeResponses: boolean;
  trimStrings: boolean;
  removeNullValues: boolean;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: TransformConfig = {
  transformDates: true,
  transformNumbers: true,
  normalizeResponses: true,
  trimStrings: true,
  removeNullValues: false
};

/**
 * Interceptor funcional para transformación de datos
 */
export const transformInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  
  // ========================================
  // TRANSFORMAR REQUEST (SALIENTE)
  // ========================================
  
  const transformedReq = transformRequest(req);
  
  // ========================================
  // PROCESAR Y TRANSFORMAR RESPONSE
  // ========================================
  
  return next(transformedReq).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        return transformResponse(event);
      }
      return event;
    })
  );
};

// ========================================
// TRANSFORMACIÓN DE REQUESTS
// ========================================

/**
 * Transformar request saliente
 */
function transformRequest(req: HttpRequest<unknown>): HttpRequest<unknown> {
  if (!req.body) {
    return req;
  }
  
  let transformedBody = req.body;
  
  // Transformar body según el tipo de contenido
  const contentType = req.headers.get('Content-Type') || '';
  
  if (contentType.includes('application/json')) {
    transformedBody = transformRequestBody(req.body);
  }
  
  // Si no hubo cambios, retornar request original
  if (transformedBody === req.body) {
    return req;
  }
  
  // Clonar request con body transformado
  return req.clone({ body: transformedBody });
}

/**
 * Transformar body de request
 */
function transformRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const config = DEFAULT_CONFIG;
  let transformed = { ...body };
  
  // Transformar fechas a formato ISO
  if (config.transformDates) {
    transformed = transformDatesInObject(transformed, 'toISO');
  }
  
  // Limpiar strings
  if (config.trimStrings) {
    transformed = trimStringsInObject(transformed);
  }
  
  // Remover valores null si está configurado
  if (config.removeNullValues) {
    transformed = removeNullValuesInObject(transformed);
  }
  
  console.log('📤 [TransformInterceptor] Request body transformed');
  return transformed;
}

// ========================================
// TRANSFORMACIÓN DE RESPONSES
// ========================================

/**
 * Transformar response entrante
 */
function transformResponse<T>(response: HttpResponse<T>): HttpResponse<T> {
  if (!response.body) {
    return response;
  }
  
  let transformedBody = response.body;
  
  // Normalizar estructura de respuesta
  if (DEFAULT_CONFIG.normalizeResponses) {
    transformedBody = normalizeResponseStructure(transformedBody);
  }
  
  // Transformar tipos de datos
  transformedBody = transformResponseData(transformedBody);
  
  // Si no hubo cambios, retornar response original
  if (transformedBody === response.body) {
    return response;
  }
  
  console.log('📥 [TransformInterceptor] Response body transformed');
  
  // Clonar response con body transformado
  return response.clone({ body: transformedBody });
}

/**
 * Normalizar estructura de respuesta del backend
 */
function normalizeResponseStructure<T>(body: T): T {
  // Si el body tiene estructura de BackendResponse, extraer los datos
  if (body && typeof body === 'object' && 'data' in body) {
    const backendResponse = body as BackendResponse<any>;
    
    // Si la respuesta fue exitosa y tiene datos, retornar solo los datos
    if (backendResponse.success && backendResponse.data !== undefined) {
      console.log('📋 [TransformInterceptor] Normalized backend response structure');
      return backendResponse.data as T;
    }
    
    // Si hay error, mantener la estructura completa para manejo de errores
    if (!backendResponse.success) {
      return body;
    }
  }
  
  return body;
}

/**
 * Transformar tipos de datos en response
 */
function transformResponseData<T>(body: T): T {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const config = DEFAULT_CONFIG;
  let transformed = body;
  
  // Transformar fechas string a Date objects
  if (config.transformDates) {
    transformed = transformDatesInObject(transformed, 'toDate') as T;
  }
  
  // Transformar strings numéricos a números
  if (config.transformNumbers) {
    transformed = transformNumbersInObject(transformed) as T;
  }
  
  // Limpiar strings
  if (config.trimStrings) {
    transformed = trimStringsInObject(transformed) as T;
  }
  
  return transformed;
}

// ========================================
// FUNCIONES DE TRANSFORMACIÓN
// ========================================

/**
 * Transformar fechas en un objeto recursivamente
 */
function transformDatesInObject(obj: any, direction: 'toDate' | 'toISO'): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return direction === 'toISO' ? obj.toISOString() : obj;
  }
  
  if (typeof obj === 'string') {
    if (direction === 'toDate' && isIsoDateString(obj)) {
      const date = new Date(obj);
      return isNaN(date.getTime()) ? obj : date;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformDatesInObject(item, direction));
  }
  
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        transformed[key] = transformDatesInObject(obj[key], direction);
      }
    }
    return transformed;
  }
  
  return obj;
}

/**
 * Transformar strings numéricos a números
 */
function transformNumbersInObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // Verificar si es un número válido
    if (isNumericString(obj)) {
      const num = Number(obj);
      return isNaN(num) ? obj : num;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformNumbersInObject(item));
  }
  
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        transformed[key] = transformNumbersInObject(obj[key]);
      }
    }
    return transformed;
  }
  
  return obj;
}

/**
 * Limpiar strings en un objeto recursivamente
 */
function trimStringsInObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return obj.trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => trimStringsInObject(item));
  }
  
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        transformed[key] = trimStringsInObject(obj[key]);
      }
    }
    return transformed;
  }
  
  return obj;
}

/**
 * Remover valores null de un objeto
 */
function removeNullValuesInObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== null)
      .map(item => removeNullValuesInObject(item));
  }
  
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== null) {
        transformed[key] = removeNullValuesInObject(obj[key]);
      }
    }
    return transformed;
  }
  
  return obj;
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Verificar si un string es una fecha ISO válida
 */
function isIsoDateString(value: string): boolean {
  // Patrón para fechas ISO 8601
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  
  if (!isoDatePattern.test(value)) {
    return false;
  }
  
  // Verificar que sea una fecha válida
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Verificar si un string representa un número válido
 */
function isNumericString(value: string): boolean {
  // No transformar strings vacíos o que claramente no son números
  if (!value || value.trim() === '') {
    return false;
  }
  
  // No transformar strings que parecen IDs o códigos
  if (value.length > 15) {
    return false;
  }
  
  // Verificar si es un número válido
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Verificar si una URL debe ser transformada
 */
function shouldTransformUrl(url: string): boolean {
  // URLs que no deben ser transformadas
  const excludePatterns = [
    '/auth/',
    '/public/',
    '/static/',
    '/assets/'
  ];
  
  return !excludePatterns.some(pattern => url.includes(pattern));
}

/**
 * Obtener configuración específica para una URL
 */
function getConfigForUrl(url: string): TransformConfig {
  // Configuraciones específicas por endpoint
  const urlConfigs: { [pattern: string]: Partial<TransformConfig> } = {
    '/api/users': { removeNullValues: true },
    '/api/products': { transformNumbers: true },
    '/api/orders': { transformDates: true }
  };
  
  // Buscar configuración específica
  for (const pattern in urlConfigs) {
    if (url.includes(pattern)) {
      return { ...DEFAULT_CONFIG, ...urlConfigs[pattern] };
    }
  }
  
  return DEFAULT_CONFIG;
}

/**
 * Log de transformación para debugging
 */
function logTransformation(type: 'request' | 'response', url: string, changes: string[]): void {
  if (!environment.production && changes.length > 0) {
    console.log(`🔄 [TransformInterceptor] ${type} transformed for ${url}:`, changes);
  }
}

// Declaración de environment
declare const environment: any;
