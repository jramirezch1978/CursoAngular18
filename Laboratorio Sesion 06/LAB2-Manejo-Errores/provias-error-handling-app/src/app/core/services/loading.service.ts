/**
 * LOADING SERVICE - LAB 2: Manejo Profesional de Errores
 * 
 * Servicio para gestión inteligente de estados de carga múltiples y granulares.
 * Permite tracking por URL específica y operaciones concurrentes.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. LOADING STATES GRANULARES:
 *    - No solo "cargando" vs "no cargando"
 *    - Estados específicos por operación
 *    - Tracking de múltiples requests simultáneas
 * 
 * 2. SIGNALS REACTIVOS:
 *    - Estado que se actualiza automáticamente
 *    - UI reactiva sin subscripciones manuales
 *    - Computed signals para lógica derivada
 * 
 * 3. UX MEJORADA:
 *    - Mensajes descriptivos de lo que está pasando
 *    - Progress tracking para operaciones largas
 *    - Estados contextuales por tipo de operación
 */

import { Injectable, signal, computed } from '@angular/core';

/**
 * Interface para estado de loading individual
 */
interface LoadingState {
  url: string;
  message?: string;
  progress?: number;
  startTime: number;
  operation?: string;
}

/**
 * Tipos de operaciones para mejor UX
 */
export type LoadingOperation = 
  | 'loading' 
  | 'saving' 
  | 'deleting' 
  | 'uploading' 
  | 'downloading' 
  | 'searching' 
  | 'validating';

/**
 * Interface para configuración de loading
 */
export interface LoadingConfig {
  message?: string;
  operation?: LoadingOperation;
  showProgress?: boolean;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  // ========================================
  // ESTADO INTERNO
  // ========================================
  
  /**
   * Map de requests activas con su estado
   */
  private activeRequests = new Map<string, LoadingState>();
  
  /**
   * Signal para estados de loading
   */
  private loadingStatesSignal = signal<LoadingState[]>([]);
  
  // ========================================
  // COMPUTED SIGNALS PÚBLICOS
  // ========================================
  
  /**
   * Indica si hay alguna operación cargando
   */
  isLoading = computed(() => this.loadingStatesSignal().length > 0);
  
  /**
   * Array de todos los estados de loading actuales
   */
  loadingStates = computed(() => this.loadingStatesSignal());
  
  /**
   * Número de operaciones en progreso
   */
  loadingCount = computed(() => this.loadingStatesSignal().length);
  
  /**
   * Mensaje de loading global
   */
  globalMessage = computed(() => {
    const states = this.loadingStatesSignal();
    if (states.length === 0) return '';
    if (states.length === 1) return states[0].message || this.getDefaultMessage(states[0].operation);
    return `Procesando ${states.length} operaciones...`;
  });
  
  /**
   * Operación más reciente
   */
  currentOperation = computed(() => {
    const states = this.loadingStatesSignal();
    if (states.length === 0) return null;
    
    // Retornar la operación más reciente (mayor startTime)
    return states.reduce((latest, current) => 
      current.startTime > latest.startTime ? current : latest
    );
  });
  
  /**
   * Progreso promedio de todas las operaciones
   */
  averageProgress = computed(() => {
    const states = this.loadingStatesSignal();
    const statesWithProgress = states.filter(s => s.progress !== undefined);
    
    if (statesWithProgress.length === 0) return undefined;
    
    const totalProgress = statesWithProgress.reduce((sum, state) => sum + (state.progress || 0), 0);
    return Math.round(totalProgress / statesWithProgress.length);
  });
  
  /**
   * Tiempo total de carga (operación más antigua)
   */
  totalLoadingTime = computed(() => {
    const states = this.loadingStatesSignal();
    if (states.length === 0) return 0;
    
    const oldestState = states.reduce((oldest, current) => 
      current.startTime < oldest.startTime ? current : oldest
    );
    
    return Date.now() - oldestState.startTime;
  });
  
  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================
  
  /**
   * Iniciar loading para una URL específica
   */
  setLoading(url: string, loading: boolean, config?: LoadingConfig): void {
    if (loading) {
      const state: LoadingState = {
        url,
        message: config?.message,
        progress: config?.showProgress ? 0 : undefined,
        startTime: Date.now(),
        operation: config?.operation
      };
      
      this.activeRequests.set(url, state);
      console.log(`🔄 Loading started for: ${url}`, config?.message || '');
      
      // Timeout opcional
      if (config?.timeout) {
        setTimeout(() => {
          if (this.activeRequests.has(url)) {
            console.warn(`⏰ Loading timeout for: ${url}`);
            this.setLoading(url, false);
          }
        }, config.timeout);
      }
    } else {
      const state = this.activeRequests.get(url);
      if (state) {
        const duration = Date.now() - state.startTime;
        console.log(`✅ Loading completed for: ${url} (${duration}ms)`);
        this.activeRequests.delete(url);
      }
    }
    
    this.updateLoadingSignal();
  }
  
  /**
   * Actualizar progreso de una operación
   */
  updateProgress(url: string, progress: number, message?: string): void {
    const state = this.activeRequests.get(url);
    if (state) {
      state.progress = Math.max(0, Math.min(100, progress)); // Clamp entre 0-100
      if (message) state.message = message;
      
      console.log(`📊 Progress updated for ${url}: ${progress}%`, message || '');
      this.updateLoadingSignal();
    }
  }
  
  /**
   * Actualizar mensaje de una operación
   */
  updateMessage(url: string, message: string): void {
    const state = this.activeRequests.get(url);
    if (state) {
      state.message = message;
      console.log(`💬 Message updated for ${url}: ${message}`);
      this.updateLoadingSignal();
    }
  }
  
  /**
   * Verificar si una URL específica está cargando
   */
  isLoadingUrl(url: string): boolean {
    return this.activeRequests.has(url);
  }
  
  /**
   * Obtener estado de loading para una URL específica
   */
  getLoadingState(url: string): LoadingState | undefined {
    return this.activeRequests.get(url);
  }
  
  /**
   * Obtener mensaje para una URL específica
   */
  getMessageForUrl(url: string): string | undefined {
    const state = this.activeRequests.get(url);
    return state?.message || this.getDefaultMessage(state?.operation);
  }
  
  /**
   * Obtener progreso para una URL específica
   */
  getProgressForUrl(url: string): number | undefined {
    return this.activeRequests.get(url)?.progress;
  }
  
  /**
   * Limpiar loading para URLs que coincidan con un patrón
   */
  clearPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete: string[] = [];
    
    this.activeRequests.forEach((_, url) => {
      if (regex.test(url)) {
        keysToDelete.push(url);
      }
    });
    
    keysToDelete.forEach(url => {
      console.log(`🧹 Clearing loading for pattern match: ${url}`);
      this.activeRequests.delete(url);
    });
    
    if (keysToDelete.length > 0) {
      this.updateLoadingSignal();
    }
  }
  
  /**
   * Limpiar todas las operaciones de loading
   */
  clear(): void {
    const count = this.activeRequests.size;
    this.activeRequests.clear();
    this.updateLoadingSignal();
    
    if (count > 0) {
      console.log(`🧹 Cleared ${count} loading operations`);
    }
  }
  
  /**
   * Obtener estadísticas de loading
   */
  getStats(): {
    total: number;
    byOperation: Record<string, number>;
    averageDuration: number;
    longestRunning: LoadingState | null;
  } {
    const states = this.loadingStatesSignal();
    const now = Date.now();
    
    // Contar por tipo de operación
    const byOperation: Record<string, number> = {};
    states.forEach(state => {
      const op = state.operation || 'unknown';
      byOperation[op] = (byOperation[op] || 0) + 1;
    });
    
    // Calcular duración promedio
    const totalDuration = states.reduce((sum, state) => sum + (now - state.startTime), 0);
    const averageDuration = states.length > 0 ? totalDuration / states.length : 0;
    
    // Encontrar la operación más larga
    const longestRunning = states.reduce((longest, current) => {
      if (!longest) return current;
      return current.startTime < longest.startTime ? current : longest;
    }, null as LoadingState | null);
    
    return {
      total: states.length,
      byOperation,
      averageDuration,
      longestRunning
    };
  }
  
  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================
  
  /**
   * Actualizar signal con estados actuales
   */
  private updateLoadingSignal(): void {
    this.loadingStatesSignal.set(Array.from(this.activeRequests.values()));
  }
  
  /**
   * Obtener mensaje por defecto según el tipo de operación
   */
  private getDefaultMessage(operation?: string): string {
    const messages: Record<LoadingOperation, string> = {
      loading: 'Cargando...',
      saving: 'Guardando...',
      deleting: 'Eliminando...',
      uploading: 'Subiendo archivo...',
      downloading: 'Descargando...',
      searching: 'Buscando...',
      validating: 'Validando...'
    };
    
    return messages[operation as LoadingOperation] || 'Procesando...';
  }
  
  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================
  
  /**
   * Crear configuración de loading con valores por defecto
   */
  static createConfig(
    message?: string, 
    operation?: LoadingOperation, 
    showProgress = false,
    timeout?: number
  ): LoadingConfig {
    return { message, operation, showProgress, timeout };
  }
  
  /**
   * Wrapper para operaciones async con loading automático
   */
  async withLoading<T>(
    url: string,
    operation: () => Promise<T>,
    config?: LoadingConfig
  ): Promise<T> {
    try {
      this.setLoading(url, true, config);
      const result = await operation();
      return result;
    } finally {
      this.setLoading(url, false);
    }
  }
  
  /**
   * Debug: Imprimir estado actual
   */
  debugState(): void {
    console.group('🔍 Loading Service Debug State');
    console.log('Active requests:', this.activeRequests.size);
    console.log('Loading states:', this.loadingStatesSignal());
    console.log('Is loading:', this.isLoading());
    console.log('Global message:', this.globalMessage());
    console.log('Stats:', this.getStats());
    console.groupEnd();
  }
}
