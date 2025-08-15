export const environment = {
  production: true,
  apiUrl: 'https://api.provias.gob.pe/v1',
  appName: 'PROVIAS Angular App',
  version: '1.0.0',
  features: {
    enableLogging: false,
    enableDebugMode: false,
    enableCache: true,
    cacheTimeout: 600000 // 10 minutos
  },
  retry: {
    count: 3,
    delay: 1000,
    maxDelay: 5000
  }
};