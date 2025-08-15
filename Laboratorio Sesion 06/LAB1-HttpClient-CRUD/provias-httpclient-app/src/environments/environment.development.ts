/**
 * CONFIGURACIÓN DE ENTORNO - DESARROLLO
 * 
 * Este archivo contiene la configuración específica para el entorno de desarrollo.
 * Las variables de entorno permiten tener diferentes configuraciones sin cambiar código.
 * 
 * CONCEPTOS EDUCATIVOS:
 * - Separación de configuración del código
 * - Diferentes comportamientos por ambiente
 * - Seguridad: URLs y secrets no hardcodeados
 */

export const environment = {
  // ========================================
  // CONFIGURACIÓN BÁSICA
  // ========================================
  
  /**
   * Indica si estamos en producción
   * - false: modo desarrollo (logs, debugging, hot reload)
   * - true: modo producción (optimizaciones, sin logs)
   */
  production: false,
  
  /**
   * URL base de la API REST
   * - En desarrollo: JSON Server local (puerto 3000)
   * - Permite trabajar sin backend real
   * - Fácil cambio entre APIs locales y remotas
   */
  apiUrl: 'http://localhost:3000/',
  
  /**
   * Información de la aplicación
   * - Útil para logs, debugging, soporte técnico
   * - Permite identificar versión en errores
   */
  appName: 'PROVIAS Angular App - DESARROLLO',
  version: '1.0.0-dev',
  
  // ========================================
  // CONFIGURACIÓN DE CARACTERÍSTICAS
  // ========================================
  
  /**
   * Flags de características (feature flags)
   * Permiten activar/desactivar funcionalidades:
   * - A/B testing
   * - Rollout gradual de features
   * - Debugging en desarrollo
   */
  features: {
    /**
     * Logging detallado en consola
     * - true: logs de HTTP, errores, debugging
     * - false: solo errores críticos
     */
    enableLogging: true,
    
    /**
     * Modo debug con información adicional
     * - true: información extra en UI, mock data
     * - false: comportamiento normal
     */
    enableDebugMode: true,
    
    /**
     * Cache de respuestas HTTP
     * - true: cachea GET requests para mejor performance
     * - false: siempre pide datos frescos al servidor
     */
    enableCache: true,
    
    /**
     * Tiempo de vida del cache en milisegundos
     * - 300000ms = 5 minutos
     * - Después de este tiempo, se consideran obsoletos
     */
    cacheTimeout: 300000,
    
    /**
     * Simulación de datos (para desarrollo sin backend)
     * - true: usa datos mock/simulados
     * - false: usa API real
     */
    enableMockData: false,
    
    /**
     * Notificaciones toast/snackbar
     * - true: muestra notificaciones al usuario
     * - false: solo logs en consola
     */
    enableNotifications: true,
    
    /**
     * Analytics y métricas
     * - false en desarrollo (no contaminar datos)
     * - true en producción
     */
    enableAnalytics: false
  },
  
  // ========================================
  // CONFIGURACIÓN DE RETRY Y TIMEOUTS
  // ========================================
  
  /**
   * Configuración para reintentos automáticos
   * Cuando una petición HTTP falla, se puede reintentar:
   */
  retry: {
    /**
     * Número máximo de reintentos
     * - 3 es un buen balance entre persistencia y no abrumar
     */
    count: 3,
    
    /**
     * Delay inicial en milisegundos
     * - Primera reintento después de 1 segundo
     */
    delay: 1000,
    
    /**
     * Delay máximo en milisegundos
     * - Evita esperas muy largas
     * - 5 segundos es razonable para UX
     */
    maxDelay: 5000,
    
    /**
     * Factor de multiplicación para backoff exponencial
     * - 2 significa: 1s, 2s, 4s, etc.
     */
    backoffFactor: 2
  },
  
  // ========================================
  // CONFIGURACIÓN DE TIMEOUTS
  // ========================================
  
  /**
   * Timeouts para diferentes operaciones
   * Evita que la aplicación se cuelgue esperando respuestas
   */
  timeouts: {
    /**
     * Timeout para requests HTTP normales
     * - 30 segundos es generoso para desarrollo
     */
    http: 30000,
    
    /**
     * Timeout para uploads de archivos
     * - Más tiempo porque los archivos pueden ser grandes
     */
    upload: 120000,
    
    /**
     * Timeout para operaciones críticas
     * - Menos tiempo para fallar rápido
     */
    critical: 10000
  },
  
  // ========================================
  // CONFIGURACIÓN DE UI/UX
  // ========================================
  
  /**
   * Configuración de interfaz de usuario
   */
  ui: {
    /**
     * Delay para mostrar loading spinners
     * - 200ms evita parpadeos en operaciones rápidas
     */
    loadingDelay: 200,
    
    /**
     * Tiempo de debounce para búsquedas
     * - 300ms espera después de que el usuario termine de escribir
     */
    searchDebounce: 300,
    
    /**
     * Elementos por página en listas paginadas
     */
    pageSize: 20,
    
    /**
     * Tema por defecto
     */
    defaultTheme: 'light',
    
    /**
     * Idioma por defecto
     */
    defaultLanguage: 'es'
  },
  
  // ========================================
  // CONFIGURACIÓN DE DESARROLLO
  // ========================================
  
  /**
   * Configuraciones específicas para desarrollo
   */
  development: {
    /**
     * Mock delay para simular latencia de red
     * - 500ms simula conexión normal
     * - Útil para probar loading states
     */
    mockDelay: 500,
    
    /**
     * Auto-refresh de datos
     * - false: manual refresh
     * - true: polling automático
     */
    autoRefresh: false,
    
    /**
     * Intervalo de auto-refresh en milisegundos
     * - 30 segundos para no abrumar en desarrollo
     */
    autoRefreshInterval: 30000,
    
    /**
     * Mostrar información de debugging en UI
     */
    showDebugInfo: true,
    
    /**
     * Permitir edición de datos mock
     */
    allowMockEditing: true
  }
};
