import { InjectionToken } from '@angular/core';

// Token para configuración de la aplicación
export interface AppConfiguration {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableOfflineMode: boolean;
    enableDebugMode: boolean;
  };
  cache: {
    strategy: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
    ttl: number;
    maxSize: number;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfiguration>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    apiUrl: 'https://api.provias.gob.pe/v1',
    environment: 'development',
    version: '2.0.0',
    features: {
      enableAnalytics: false,
      enableNotifications: true,
      enableOfflineMode: false,
      enableDebugMode: true
    },
    cache: {
      strategy: 'memory',
      ttl: 300000,
      maxSize: 100
    }
  })
});

// Token para logger
export interface Logger {
  log(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export const LOGGER_TOKEN = new InjectionToken<Logger>('LOGGER_TOKEN');

// Token para validadores múltiples
export interface TaskValidator {
  name: string;
  validate(task: any): { valid: boolean; errors?: string[] };
}

export const TASK_VALIDATORS = new InjectionToken<TaskValidator[]>('TASK_VALIDATORS');

// Token para estrategia de caché
export interface CacheStrategy {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  remove(key: string): void;
  clear(): void;
}

export const CACHE_STRATEGY = new InjectionToken<CacheStrategy>('CACHE_STRATEGY');
