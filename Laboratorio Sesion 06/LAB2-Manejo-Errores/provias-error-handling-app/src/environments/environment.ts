/**
 * ENTORNO DE PRODUCCIÓN - LAB 2: Manejo de Errores
 * 
 * Configuración optimizada para producción con logging limitado
 * y manejo de errores optimizado para usuarios finales.
 */

export const environment = {
  production: true,
  development: false,
  
  // API Configuration
  apiUrl: 'https://api.provias.gob.pe/v1',
  
  // Error Handling Configuration
  enableDetailedErrors: false,
  enableConsoleLogging: false,
  enableErrorReporting: true, // En producción sí enviamos errores para monitoreo
  
  // Retry Configuration
  retryAttempts: 2,
  retryDelay: 2000,
  maxRetryDelay: 8000,
  
  // Production specific
  debugMode: false,
  mockErrors: false,
  
  // App Information
  appName: 'PROVIAS - Sistema de Gestión',
  version: '2.0.0',
  
  // Feature Flags para LAB2
  features: {
    advancedErrorHandling: true,
    loadingStates: true,
    retryStrategies: true,
    errorSimulation: false, // No simular errores en producción
    performanceMonitoring: true
  }
};
