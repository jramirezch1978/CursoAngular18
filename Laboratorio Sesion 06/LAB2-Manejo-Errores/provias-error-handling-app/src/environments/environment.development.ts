/**
 * ENTORNO DE DESARROLLO - LAB 2: Manejo de Errores
 * 
 * Configuración específica para desarrollo con énfasis en debugging
 * y manejo de errores detallado.
 */

export const environment = {
  production: false,
  development: true,
  
  // API Configuration
  apiUrl: 'http://localhost:3000/api',
  
  // Error Handling Configuration
  enableDetailedErrors: true,
  enableConsoleLogging: true,
  enableErrorReporting: false, // En desarrollo no enviamos errores a servicios externos
  
  // Retry Configuration
  retryAttempts: 3,
  retryDelay: 1000,
  maxRetryDelay: 10000,
  
  // Development specific
  debugMode: true,
  mockErrors: true, // Permite simular errores para testing
  
  // App Information
  appName: 'PROVIAS - LAB2 Error Handling',
  version: '2.0.0-dev',
  
  // Feature Flags para LAB2
  features: {
    advancedErrorHandling: true,
    loadingStates: true,
    retryStrategies: true,
    errorSimulation: true,
    performanceMonitoring: true
  }
};
