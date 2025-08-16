import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { APP_CONFIG } from './core/tokens/config.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_CONFIG,
      useValue: {
        apiUrl: 'https://api.provias.gob.pe/v1',
        environment: 'development',
        version: '3.0.0',
        features: {
          enableNotifications: true,
          enableAutoSave: true,
          enableDebugMode: true,
          enableAnalytics: false,
          maxTasksPerPage: 20
        },
        cache: {
          strategy: 'localStorage',
          ttl: 600000,
          maxSize: 50
        },
        logging: {
          level: 'debug',
          remoteUrl: 'https://logs.provias.gob.pe/api/logs'
        }
      }
    }
  ]
};
