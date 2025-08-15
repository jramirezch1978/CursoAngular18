export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'PROVIAS Angular App - DEV',
  version: '1.0.0',
  features: {
    enableLogging: true,
    enableDebugMode: true,
    enableCache: true,
    cacheTimeout: 300000 // 5 minutos
  },
  retry: {
    count: 3,
    delay: 1000,
    maxDelay: 5000
  }
};