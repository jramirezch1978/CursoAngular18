import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logs: LogEntry[] = [];
  private currentLogLevel: LogLevel = LogLevel.DEBUG;
  
  constructor() {
    this.info('LoggerService', 'Logger service inicializado');
  }
  
  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }
  
  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }
  
  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }
  
  error(component: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data);
  }
  
  private log(level: LogLevel, component: string, message: string, data?: any): void {
    if (level >= this.currentLogLevel) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        component,
        message,
        data
      };
      
      this.logs.push(logEntry);
      this.consoleLog(logEntry);
      
      // Mantener solo los últimos 100 logs
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(-100);
      }
    }
  }
  
  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const levelEmoji = this.getLevelEmoji(entry.level);
    const message = `${levelEmoji} [${timestamp}] [${entry.component}] ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data || '');
        break;
    }
  }
  
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🐛';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      default: return '📝';
    }
  }
  
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
    this.info('LoggerService', 'Logs limpiados');
  }
  
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info('LoggerService', `Log level cambiado a ${LogLevel[level]}`);
  }
}
