/**
 * ERROR HANDLER SERVICE - LAB 2: Manejo Profesional de Errores
 * 
 * Servicio centralizado para manejo robusto de errores HTTP y de aplicación.
 * Proporciona traducción de errores, retry strategies y notificaciones al usuario.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. MANEJO CENTRALIZADO DE ERRORES:
 *    - Un solo lugar para toda la lógica de errores
 *    - Consistencia en mensajes y comportamiento
 *    - Fácil mantenimiento y debugging
 * 
 * 2. RETRY STRATEGIES:
 *    - Exponential backoff para evitar sobrecargar el servidor
 *    - Jitter para evitar thundering herd
 *    - Exclusión de códigos que no deben reintentarse
 * 
 * 3. USER EXPERIENCE:
 *    - Mensajes amigables en lugar de códigos técnicos
 *    - Categorización por severidad
 *    - Acciones sugeridas para el usuario
 */

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, delayWhen, tap, take } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';
import { environment } from '../../../environments/environment.development';

/**
 * Interface para errores de API estandarizados
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path?: string;
  details?: any;
  userMessage?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Interface para errores de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

/**
 * Configuración para retry strategies
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  excludedStatusCodes: number[];
  onRetry?: (attempt: number, error: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private notificationService = inject(NotificationService);

  /**
   * Configuración por defecto para retry
   */
  private defaultRetryConfig: RetryConfig = {
    maxAttempts: environment.retryAttempts || 3,
    initialDelay: environment.retryDelay || 1000,
    maxDelay: environment.maxRetryDelay || 10000,
    backoffFactor: 2,
    excludedStatusCodes: [400, 401, 403, 404, 422], // No reintentar errores del cliente
  };

  /**
   * Manejo centralizado de errores HTTP
   */
  handleError(error: HttpErrorResponse, context?: string): Observable<never> {
    const apiError = this.transformError(error, context);
    
    // Mostrar notificación al usuario
    this.showErrorNotification(apiError);
    
    // Log para desarrollo
    this.logError(apiError, error);
    
    return throwError(() => apiError);
  }

  /**
   * Transformar HttpErrorResponse a ApiError
   */
  private transformError(error: HttpErrorResponse, context?: string): ApiError {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Error del cliente o de red
      apiError = {
        message: this.handleClientError(error.error),
        code: 'CLIENT_ERROR',
        status: 0,
        timestamp: new Date().toISOString(),
        severity: 'critical',
        userMessage: 'Problema de conexión. Verifique su internet e intente nuevamente.'
      };
    } else {
      // Error del servidor
      apiError = {
        message: this.handleServerError(error),
        code: `HTTP_${error.status}`,
        status: error.status,
        timestamp: new Date().toISOString(),
        path: error.url || undefined,
        details: error.error,
        severity: this.getErrorSeverity(error.status),
        userMessage: this.getUserFriendlyMessage(error.status)
      };
    }

    if (context) {
      apiError.details = { ...apiError.details, context };
    }

    return apiError;
  }

  /**
   * Manejo de errores del cliente
   */
  private handleClientError(error: ErrorEvent): string {
    const errorMessages: Record<string, string> = {
      'Failed to fetch': 'No se pudo conectar con el servidor',
      'Network request failed': 'Error de red',
      'CORS': 'Error de configuración del servidor (CORS)',
      'Timeout': 'La solicitud tardó demasiado tiempo'
    };

    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message.includes(key)) {
        return message;
      }
    }

    return `Error de cliente: ${error.message}`;
  }

  /**
   * Manejo de errores del servidor
   */
  private handleServerError(error: HttpErrorResponse): string {
    // Verificar si el servidor envió un mensaje personalizado
    if (error.error?.message) {
      return error.error.message;
    }

    // Mensajes por código de estado
    const statusMessages: Record<number, string> = {
      0: 'No se pudo conectar con el servidor',
      400: 'Solicitud incorrecta. Verifique los datos enviados.',
      401: 'No autorizado. Por favor inicie sesión nuevamente.',
      403: 'Acceso denegado. No tiene permisos para esta operación.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Conflicto. El recurso ya existe o hay un conflicto con el estado actual.',
      422: 'Los datos enviados no son válidos.',
      429: 'Demasiadas solicitudes. Por favor espere un momento.',
      500: 'Error interno del servidor. El equipo técnico ha sido notificado.',
      502: 'Error de puerta de enlace. El servidor no está disponible.',
      503: 'Servicio no disponible. Por favor intente más tarde.',
      504: 'Tiempo de espera agotado. El servidor tardó demasiado en responder.'
    };

    return statusMessages[error.status] || `Error ${error.status}: ${error.statusText}`;
  }

  /**
   * Determinar severidad del error
   */
  private getErrorSeverity(status: number): ApiError['severity'] {
    if (status === 0 || status >= 500) return 'critical';
    if (status >= 400 && status < 500) return 'error';
    if (status >= 300 && status < 400) return 'warning';
    return 'info';
  }

  /**
   * Obtener mensaje amigable para el usuario
   */
  private getUserFriendlyMessage(status: number): string {
    const userMessages: Record<number, string> = {
      0: 'Sin conexión a internet. Verifique su conexión.',
      400: 'Por favor revise la información ingresada.',
      401: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'La información solicitada no existe.',
      409: 'Ya existe un registro con esta información.',
      422: 'Por favor corrija los errores en el formulario.',
      429: 'Demasiadas solicitudes. Espere un momento antes de intentar nuevamente.',
      500: 'Error del servidor. Nuestro equipo ha sido notificado.',
      502: 'Servicio temporalmente no disponible.',
      503: 'Servicio en mantenimiento. Intente más tarde.',
      504: 'El servidor está tardando en responder. Intente nuevamente.'
    };

    return userMessages[status] || 'Ha ocurrido un error inesperado.';
  }

  /**
   * Mostrar notificación de error al usuario
   */
  private showErrorNotification(apiError: ApiError): void {
    const message = apiError.userMessage || apiError.message;
    
    switch (apiError.severity) {
      case 'critical':
        this.notificationService.error('Error Crítico', message);
        break;
      case 'error':
        this.notificationService.error('Error', message);
        break;
      case 'warning':
        this.notificationService.warning('Advertencia', message);
        break;
      default:
        this.notificationService.info('Información', message);
    }
  }

  /**
   * Log de errores para desarrollo
   */
  private logError(apiError: ApiError, originalError: HttpErrorResponse): void {
    if (environment.enableConsoleLogging) {
      console.group(`🔴 ${apiError.severity.toUpperCase()} - ${apiError.code}`);
      console.error('Timestamp:', apiError.timestamp);
      console.error('Status:', apiError.status);
      console.error('Message:', apiError.message);
      console.error('User Message:', apiError.userMessage);
      if (apiError.path) console.error('Path:', apiError.path);
      if (apiError.details) console.error('Details:', apiError.details);
      console.error('Original Error:', originalError);
      console.groupEnd();
    }
  }

  /**
   * Extraer errores de validación del response
   */
  extractValidationErrors(error: HttpErrorResponse): ValidationError[] {
    if (error.status === 422 && error.error?.errors) {
      return Object.entries(error.error.errors).map(([field, messages]) => ({
        field,
        message: Array.isArray(messages) ? messages[0] : messages as string,
        code: 'VALIDATION_ERROR'
      }));
    }
    return [];
  }

  /**
   * Retry strategy con backoff exponencial
   */
  retryWithBackoff<T>(config: Partial<RetryConfig> = {}) {
    const finalConfig = { ...this.defaultRetryConfig, ...config };

    return (source: Observable<T>) => {
      return source.pipe(
        retryWhen(errors =>
          errors.pipe(
            tap({
              next: (error) => {
                // Este tap se ejecuta en el stream de errores
              },
              error: (error) => {
                console.log(`🔄 Processing error for retry:`, error.status);
              }
            }),
            delayWhen((error, index) => {
              const attempt = index + 1;
              const delay = this.calculateDelay(attempt, finalConfig);
              console.log(`⏱️ Waiting ${delay}ms before retry...`);
              return timer(delay);
            }),
            take(finalConfig.maxAttempts)
          )
        )
      );
    };
  }

  /**
   * Determinar si se debe reintentar
   */
  private shouldRetry(error: any, attempt: number, config: RetryConfig): boolean {
    // Verificar número máximo de intentos
    if (attempt > config.maxAttempts) {
      return false;
    }

    // Verificar códigos de estado excluidos
    if (error?.status && config.excludedStatusCodes.includes(error.status)) {
      console.log(`⚠️ Status code ${error.status} is excluded from retry`);
      return false;
    }

    // Siempre reintentar errores de red (status 0)
    if (error?.status === 0) {
      return true;
    }

    // Reintentar errores 5xx del servidor
    if (error?.status >= 500) {
      return true;
    }

    // No reintentar por defecto
    return false;
  }

  /**
   * Calcular delay con backoff exponencial y jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1);
    
    // Añadir jitter (±20%) para evitar thundering herd
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    const finalDelay = exponentialDelay + jitter;
    
    return Math.min(finalDelay, config.maxDelay);
  }

  /**
   * Retry inteligente basado en el tipo de error
   */
  intelligentRetry<T>() {
    return (source: Observable<T>) => {
      return source.pipe(
        retryWhen(errors =>
          errors.pipe(
            tap((error) => {
              console.log(`🧠 Intelligent retry analysis:`, error.status);
            }),
            delayWhen((error, index) => {
              const attempt = index + 1;
              let delay = 1000;

              // Error de red - retry rápido
              if (error?.status === 0) {
                if (attempt <= 5) {
                  delay = 500 * attempt;
                  console.log(`🌐 Network error - Quick retry ${attempt}/5 after ${delay}ms`);
                  return timer(delay);
                }
              }

              // Error 5xx del servidor - retry con backoff
              if (error?.status >= 500 && error?.status < 600) {
                if (attempt <= 3) {
                  delay = 1000 * Math.pow(2, attempt);
                  console.log(`🖥️ Server error ${error.status} - Retry ${attempt}/3 after ${delay}ms`);
                  return timer(delay);
                }
              }

              // Error 429 (Too Many Requests) - esperar más tiempo
              if (error?.status === 429) {
                const retryAfter = error.headers?.get('Retry-After');
                delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
                console.log(`⏱️ Rate limited - Waiting ${delay}ms`);
                return timer(delay);
              }

              // No reintentar otros errores
              throw error;
            }),
            take(5) // Máximo 5 intentos para intelligent retry
          )
        )
      );
    };
  }

  /**
   * Limpiar recursos y resetear estado
   */
  clearErrors(): void {
    // Implementar limpieza si es necesario
    console.log('🧹 Error handler cleared');
  }
}
