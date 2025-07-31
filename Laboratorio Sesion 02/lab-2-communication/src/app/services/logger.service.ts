import { Injectable } from '@angular/core';

/**
 * 📊 Niveles de logging según severidad
 * DEBUG < INFO < WARN < ERROR
 */
export enum LogLevel {
  DEBUG = 0,  // Información detallada para desarrollo
  INFO = 1,   // Información general del flujo
  WARN = 2,   // Advertencias que no rompen funcionalidad
  ERROR = 3   // Errores que requieren atención inmediata
}

/**
 * 📝 Estructura de una entrada de log
 * Contiene toda la información necesaria para debugging
 */
export interface LogEntry {
  timestamp: Date;      // Cuándo ocurrió
  level: LogLevel;      // Qué tan importante es
  component: string;    // Dónde ocurrió
  message: string;      // Qué pasó
  data?: any;          // Información adicional opcional
}

/**
 * 🔧 Configuración del Logger Service
 */
export interface LoggerConfig {
  minLevel: LogLevel;           // Nivel mínimo a mostrar
  maxEntries: number;          // Máximo de logs a mantener
  persistToStorage: boolean;   // Guardar en localStorage
  enableConsoleOutput: boolean; // Mostrar en console del browser
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  // 📚 Array para almacenar todos los logs
  private logs: LogEntry[] = [];
  
  // ⚙️ Configuración por defecto
  private config: LoggerConfig = {
    minLevel: LogLevel.DEBUG,
    maxEntries: 100,
    persistToStorage: false,
    enableConsoleOutput: true
  };
  
  constructor() {
    this.info('LoggerService', 'Logger service inicializado correctamente');
    this.loadStoredLogs();
  }
  
  // 🎯 Métodos públicos para cada nivel de log
  
  /**
   * 🐛 Log nivel DEBUG - Para información muy detallada
   * Uso: Debugging, variables internas, flujo detallado
   */
  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }
  
  /**
   * ℹ️ Log nivel INFO - Para información general
   * Uso: Inicialización, operaciones normales, confirmaciones
   */
  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }
  
  /**
   * ⚠️ Log nivel WARN - Para advertencias
   * Uso: Situaciones inusuales pero no críticas, deprecations
   */
  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }
  
  /**
   * ❌ Log nivel ERROR - Para errores críticos
   * Uso: Exceptions, fallos de API, errores de validación
   */
  error(component: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data);
  }
  
  // 🔧 Métodos de configuración y gestión
  
  /**
   * 📝 Método principal de logging
   * Centraliza toda la lógica de logging
   */
  private log(level: LogLevel, component: string, message: string, data?: any): void {
    // 🚫 Filtrar por nivel mínimo configurado
    if (level < this.config.minLevel) {
      return;
    }
    
    // 📦 Crear entrada de log
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      data
    };
    
    // 💾 Agregar al array de logs
    this.logs.push(logEntry);
    
    // 🧹 Mantener solo los últimos N logs para evitar memory leaks
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }
    
    // 🖥️ Mostrar en console si está habilitado
    if (this.config.enableConsoleOutput) {
      this.consoleLog(logEntry);
    }
    
    // 💾 Persistir si está configurado
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }
  
  /**
   * 🖥️ Mostrar log en console con formato y colores
   * Cada nivel tiene su propio estilo visual
   */
  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const levelEmoji = this.getLevelEmoji(entry.level);
    const message = `${levelEmoji} [${timestamp}] [${entry.component}] ${entry.message}`;
    
    // 🎨 Estilos específicos por nivel
    const styles = this.getLevelStyles(entry.level);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${message}`, styles, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`%c${message}`, styles, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`%c${message}`, styles, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`%c${message}`, styles, entry.data || '');
        break;
    }
  }
  
  /**
   * 🎨 Obtener emoji representativo para cada nivel
   */
  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.DEBUG]: '🐛',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌'
    };
    return emojis[level] || '📝';
  }
  
  /**
   * 🎨 Obtener estilos CSS para console.log con colores
   */
  private getLevelStyles(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: #6c757d; font-weight: normal;',
      [LogLevel.INFO]: 'color: #007bff; font-weight: bold;',
      [LogLevel.WARN]: 'color: #ffc107; font-weight: bold; background: #fff3cd;',
      [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold; background: #f8d7da;'
    };
    return styles[level] || 'color: #333;';
  }
  
  // 🔍 Métodos de consulta y gestión
  
  /**
   * 📋 Obtener todos los logs (copia para evitar mutación)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * 🔍 Obtener logs filtrados por nivel
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * 🔍 Obtener logs de un componente específico
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
  }
  
  /**
   * 🧹 Limpiar todos los logs
   */
  clearLogs(): void {
    this.logs = [];
    if (this.config.persistToStorage) {
      localStorage.removeItem('angular-logs');
    }
    this.info('LoggerService', 'Todos los logs han sido limpiados');
  }
  
  /**
   * ⚙️ Cambiar nivel mínimo de logging
   */
  setLogLevel(level: LogLevel): void {
    this.config.minLevel = level;
    this.info('LoggerService', `Nivel de logging cambiado a ${LogLevel[level]}`);
  }
  
  /**
   * ⚙️ Actualizar configuración del logger
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.info('LoggerService', 'Configuración del logger actualizada', newConfig);
  }
  
  // 💾 Métodos de persistencia
  
  /**
   * 💾 Guardar logs en localStorage
   */
  private saveToStorage(): void {
    try {
      const logsToSave = this.logs.slice(-50); // Solo los últimos 50
      localStorage.setItem('angular-logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Error guardando logs en localStorage:', error);
    }
  }
  
  /**
   * 📥 Cargar logs desde localStorage
   */
  private loadStoredLogs(): void {
    if (!this.config.persistToStorage) return;
    
    try {
      const storedLogs = localStorage.getItem('angular-logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        this.info('LoggerService', `${this.logs.length} logs cargados desde localStorage`);
      }
    } catch (error) {
      this.error('LoggerService', 'Error cargando logs desde localStorage', error);
    }
  }
  
  // 📊 Métodos de estadísticas
  
  /**
   * 📊 Obtener estadísticas de logs
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      debug: this.getLogsByLevel(LogLevel.DEBUG).length,
      info: this.getLogsByLevel(LogLevel.INFO).length,
      warn: this.getLogsByLevel(LogLevel.WARN).length,
      error: this.getLogsByLevel(LogLevel.ERROR).length,
      components: [...new Set(this.logs.map(log => log.component))].length
    };
    
    this.debug('LoggerService', 'Estadísticas de logs calculadas', stats);
    return stats;
  }
  
  /**
   * 📤 Exportar logs en formato texto
   */
  exportLogs(): string {
    return this.logs.map(log => {
      const timestamp = log.timestamp.toISOString();
      const level = LogLevel[log.level];
      const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `[${timestamp}] [${level}] [${log.component}] ${log.message}${data}`;
    }).join('\n');
  }
}