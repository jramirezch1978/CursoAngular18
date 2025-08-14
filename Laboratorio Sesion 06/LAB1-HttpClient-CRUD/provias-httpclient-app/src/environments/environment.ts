/**
 * CONFIGURACIÓN DE ENTORNO - PRODUCCIÓN
 * 
 * Este archivo contiene la configuración para el entorno de producción.
 * Es más restrictivo y optimizado para rendimiento y seguridad.
 */

export const environment = {
  // ========================================
  // CONFIGURACIÓN BÁSICA
  // ========================================
  
  production: true,
  
  /**
   * URL de la API en producción
   * - HTTPS obligatorio en producción
   * - Dominio real de PROVIAS
   */
  apiUrl: 'https://api.provias.gob.pe/v1',
  
  appName: 'PROVIAS Angular App',
  version: '1.0.0',
  
  // ========================================
  // CONFIGURACIÓN DE CARACTERÍSTICAS
  // ========================================
  
  features: {
    // Sin logging detallado en producción (performance)
    enableLogging: false,
    
    // Sin modo debug en producción (seguridad)
    enableDebugMode: false,
    
    // Cache más agresivo en producción
    enableCache: true,
    
    // Cache más duradero en producción (10 minutos)
    cacheTimeout: 600000,
    
    // Nunca mock data en producción
    enableMockData: false,
    
    // Notificaciones activas para usuarios
    enableNotifications: true,
    
    // Analytics activos en producción
    enableAnalytics: true
  },
  
  // ========================================
  // CONFIGURACIÓN DE RETRY Y TIMEOUTS
  // ========================================
  
  retry: {
    // Menos reintentos en producción (servidor estable)
    count: 3,
    delay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  },
  
  timeouts: {
    // Timeouts más estrictos en producción
    http: 15000,       // 15 segundos
    upload: 60000,     // 1 minuto
    critical: 5000     // 5 segundos
  },
  
  // ========================================
  // CONFIGURACIÓN DE UI/UX
  // ========================================
  
  ui: {
    loadingDelay: 200,
    searchDebounce: 300,
    pageSize: 50,      // Más elementos por página en producción
    defaultTheme: 'light',
    defaultLanguage: 'es'
  },
  
  // ========================================
  // CONFIGURACIÓN DE PRODUCCIÓN
  // ========================================
  
  production_config: {
    /**
     * Service Worker para cache offline
     */
    enableServiceWorker: true,
    
    /**
     * Comprensión de respuestas
     */
    enableCompression: true,
    
    /**
     * Métricas de rendimiento
     */
    enablePerformanceMonitoring: true,
    
    /**
     * Reporting de errores
     */
    enableErrorReporting: true,
    
    /**
     * CDN para assets estáticos
     */
    cdnUrl: 'https://cdn.provias.gob.pe',
    
    /**
     * Configuración de seguridad
     */
    security: {
      enableCSP: true,
      enableHSTS: true,
      enableXFrameOptions: true
    }
  }
};
