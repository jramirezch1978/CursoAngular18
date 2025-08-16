import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Logger, APP_CONFIG } from '../../tokens/config.tokens';

@Injectable()
export class RemoteLoggerService implements Logger {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly logQueue: any[] = [];
  private readonly prefix = '[PROVIAS-REMOTE]';
  
  log(message: string, ...args: any[]): void {
    this.sendLog('log', message, args);
  }
  
  error(message: string, ...args: any[]): void {
    this.sendLog('error', message, args);
  }
  
  warn(message: string, ...args: any[]): void {
    this.sendLog('warn', message, args);
  }
  
  info(message: string, ...args: any[]): void {
    this.sendLog('info', message, args);
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.config.features.enableDebugMode) {
      this.sendLog('debug', message, args);
    }
  }
  
  private sendLog(level: string, message: string, args: any[]): void {
    const logEntry = {
      level,
      message: `${this.prefix} ${message}`,
      args,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      version: this.config.version
    };
    
    // Also log to console in development
    if (this.config.environment === 'development') {
      const logMethod = console[level as keyof Console];
      if (typeof logMethod === 'function') {
        logMethod.apply(console, [`${this.prefix} ${message}`, ...args]);
      }
    }
    
    // Queue the log for batch sending
    this.logQueue.push(logEntry);
    
    // In a real implementation, you would batch send logs to the server
    // For demo purposes, we're just storing them
    if (this.logQueue.length > 10) {
      this.flushLogs();
    }
  }
  
  private flushLogs(): void {
    // In production, this would send logs to the server
    // this.http.post(`${this.config.apiUrl}/logs`, this.logQueue).subscribe();
    console.log('Flushing logs to remote server:', this.logQueue);
    this.logQueue.length = 0;
  }
}
