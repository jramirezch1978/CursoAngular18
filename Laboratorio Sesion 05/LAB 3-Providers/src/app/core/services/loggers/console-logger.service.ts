import { Injectable } from '@angular/core';
import { Logger } from '../../tokens/config.tokens';

@Injectable()
export class ConsoleLoggerService implements Logger {
  private readonly prefix = '[PROVIAS]';
  
  log(message: string, ...args: any[]): void {
    console.log(`${this.prefix} ${message}`, ...args);
  }
  
  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ERROR: ${message}`, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} WARN: ${message}`, ...args);
  }
  
  info(message: string, ...args: any[]): void {
    console.info(`${this.prefix} INFO: ${message}`, ...args);
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.isDebugEnabled()) {
      console.debug(`${this.prefix} DEBUG: ${message}`, ...args);
    }
  }
  
  private isDebugEnabled(): boolean {
    return !!(window as any).debugMode || localStorage.getItem('debug') === 'true';
  }
}
