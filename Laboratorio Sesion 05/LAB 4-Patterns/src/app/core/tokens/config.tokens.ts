import { InjectionToken } from '@angular/core';

export interface AppConfiguration {
  apiUrl: string;
  environment: 'development' | 'production' | 'staging';
  version: string;
  features: {
    enableNotifications: boolean;
    enableAutoSave: boolean;
    enableDebugMode: boolean;
    enableAnalytics: boolean;
    maxTasksPerPage: number;
  };
  cache: {
    strategy: 'memory' | 'localStorage' | 'sessionStorage';
    ttl: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of items
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    remoteUrl?: string;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfiguration>('APP_CONFIG');

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export const LOGGER_TOKEN = new InjectionToken<Logger>('LOGGER_TOKEN', {
  providedIn: 'root',
  factory: () => ({
    debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
    info: (message: string, ...args: any[]) => console.info(`[INFO] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  })
});
