// Configuración global de la aplicación
export const AppConfig = {
  // API Configuration
  api: {
    baseUrl: 'https://api.provias.gob.pe/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Cache Configuration
  cache: {
    defaultTTL: 300000, // 5 minutos
    maxSize: 100,
    strategy: 'memory' as 'memory' | 'localStorage' | 'sessionStorage'
  },
  
  // Logging Configuration
  logging: {
    level: 'debug' as 'debug' | 'info' | 'warn' | 'error',
    enableRemote: false,
    remoteUrl: 'https://logs.provias.gob.pe'
  },
  
  // Feature Flags
  features: {
    enableSignals: true,
    enableStandalone: true,
    enableNewTaskManager: true,
    enableAdvancedReporting: false
  },
  
  // Application Metadata
  app: {
    name: 'PROVIAS Task Management System',
    version: '2.0.0',
    environment: 'development'
  }
};
