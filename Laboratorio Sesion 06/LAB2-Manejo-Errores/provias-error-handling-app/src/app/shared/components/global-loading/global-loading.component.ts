/**
 * GLOBAL LOADING COMPONENT - LAB 2: Manejo Profesional de Errores
 * 
 * Componente para mostrar estados de carga globales con overlay modal,
 * barras de progreso y mensajes descriptivos.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. OVERLAY MODAL:
 *    - Bloquea la interacción durante operaciones críticas
 *    - Feedback visual claro de que algo está procesando
 *    - Evita acciones concurrentes que puedan causar problemas
 * 
 * 2. PROGRESSIVE DISCLOSURE:
 *    - Información básica por defecto
 *    - Detalles adicionales si hay múltiples operaciones
 *    - Progreso visual cuando está disponible
 * 
 * 3. RESPONSIVE DESIGN:
 *    - Funciona en móvil y desktop
 *    - Tamaños apropiados para diferentes pantallas
 *    - Accesibilidad con ARIA labels
 */

import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShow()) {
      <div 
        class="loading-overlay" 
        [class.transparent]="transparent"
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="loading-title"
        aria-describedby="loading-description">
        
        <div class="loading-content" [class.compact]="compact">
          
          <!-- Spinner Principal -->
          <div class="spinner-container">
            <div class="spinner" [class.large]="!compact"></div>
          </div>
          
          <!-- Mensaje Principal -->
          <h2 id="loading-title" class="loading-title">
            {{ loadingService.globalMessage() || 'Cargando...' }}
          </h2>
          
          <!-- Progreso Global -->
          @if (loadingService.averageProgress() !== undefined) {
            <div class="progress-container">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="loadingService.averageProgress()">
                </div>
              </div>
              <span class="progress-text">
                {{ loadingService.averageProgress() }}%
              </span>
            </div>
          }
          
          <!-- Información Adicional -->
          @if (showDetails && loadingService.loadingCount() > 1) {
            <div class="loading-details" id="loading-description">
              <p class="details-header">
                Procesando {{ loadingService.loadingCount() }} operaciones:
              </p>
              
              @for (state of loadingService.loadingStates(); track state.url) {
                <div class="loading-item">
                  <!-- Progreso Individual -->
                  @if (state.progress !== undefined) {
                    <div class="item-progress">
                      <div class="mini-progress-bar">
                        <div 
                          class="mini-progress-fill" 
                          [style.width.%]="state.progress">
                        </div>
                      </div>
                      <span class="mini-progress-text">{{ state.progress }}%</span>
                    </div>
                  }
                  
                  <!-- Mensaje Individual -->
                  <span class="item-message">
                    {{ state.message || getOperationMessage(state.operation) }}
                  </span>
                  
                  <!-- Tiempo Transcurrido -->
                  @if (showTimings) {
                    <span class="item-timing">
                      ({{ getElapsedTime(state.startTime) }})
                    </span>
                  }
                </div>
              }
            </div>
          }
          
          <!-- Tiempo Total -->
          @if (showTimings && loadingService.totalLoadingTime() > 5000) {
            <div class="total-time">
              Tiempo total: {{ formatDuration(loadingService.totalLoadingTime()) }}
            </div>
          }
          
          <!-- Botón de Cancelar (Opcional) -->
          @if (showCancel && onCancel) {
            <button 
              type="button" 
              class="cancel-button"
              (click)="handleCancel()"
              aria-label="Cancelar operación">
              Cancelar
            </button>
          }
          
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.3s ease-out;
    }
    
    .loading-overlay.transparent {
      background: rgba(0, 0, 0, 0.3);
    }
    
    .loading-content {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      min-width: 300px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }
    
    .loading-content.compact {
      padding: 1.5rem;
      min-width: 250px;
    }
    
    .spinner-container {
      margin-bottom: 1.5rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    
    .spinner.large {
      width: 60px;
      height: 60px;
      border-width: 6px;
    }
    
    .loading-title {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .progress-container {
      margin: 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s ease;
      border-radius: 4px;
    }
    
    .progress-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: #667eea;
      min-width: 40px;
    }
    
    .loading-details {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      text-align: left;
    }
    
    .details-header {
      margin: 0 0 1rem 0;
      font-weight: 600;
      color: #555;
      text-align: center;
    }
    
    .loading-item {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid #667eea;
    }
    
    .item-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .mini-progress-bar {
      flex: 1;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .mini-progress-fill {
      height: 100%;
      background: #667eea;
      transition: width 0.3s ease;
      border-radius: 2px;
    }
    
    .mini-progress-text {
      font-size: 0.8rem;
      color: #667eea;
      font-weight: 600;
      min-width: 35px;
    }
    
    .item-message {
      display: block;
      font-size: 0.9rem;
      color: #333;
      margin-bottom: 0.25rem;
    }
    
    .item-timing {
      font-size: 0.8rem;
      color: #666;
      font-style: italic;
    }
    
    .total-time {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      font-size: 0.9rem;
      color: #666;
    }
    
    .cancel-button {
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      transition: background-color 0.2s ease;
    }
    
    .cancel-button:hover {
      background: #c82333;
    }
    
    .cancel-button:focus {
      outline: 2px solid #dc3545;
      outline-offset: 2px;
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      .loading-content {
        margin: 1rem;
        min-width: auto;
        max-width: none;
        padding: 1.5rem;
      }
      
      .loading-title {
        font-size: 1.1rem;
      }
      
      .spinner.large {
        width: 50px;
        height: 50px;
        border-width: 5px;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .loading-content {
        background: #2d3748;
        color: #e2e8f0;
      }
      
      .loading-title {
        color: #e2e8f0;
      }
      
      .loading-item {
        background: #4a5568;
        color: #e2e8f0;
      }
      
      .details-header {
        color: #cbd5e0;
      }
    }
  `]
})
export class GlobalLoadingComponent {
  loadingService = inject(LoadingService);
  
  // ========================================
  // INPUTS CONFIGURABLES
  // ========================================
  
  @Input() showDetails = true;           // Mostrar detalles de múltiples operaciones
  @Input() showTimings = false;          // Mostrar tiempos transcurridos
  @Input() showCancel = false;           // Mostrar botón de cancelar
  @Input() compact = false;              // Modo compacto
  @Input() transparent = false;          // Overlay más transparente
  @Input() minDuration = 500;            // Duración mínima para mostrar (evita flashes)
  @Input() onCancel?: () => void;        // Callback para cancelar
  
  // ========================================
  // ESTADO INTERNO
  // ========================================
  
  private showStartTime = 0;
  
  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================
  
  /**
   * Determinar si se debe mostrar el loading
   */
  shouldShow(): boolean {
    const isLoading = this.loadingService.isLoading();
    
    if (isLoading && this.showStartTime === 0) {
      this.showStartTime = Date.now();
    }
    
    if (!isLoading) {
      this.showStartTime = 0;
      return false;
    }
    
    // Mostrar solo si ha pasado la duración mínima
    return Date.now() - this.showStartTime >= this.minDuration;
  }
  
  /**
   * Obtener mensaje descriptivo para una operación
   */
  getOperationMessage(operation?: string): string {
    const messages: Record<string, string> = {
      loading: 'Cargando datos...',
      saving: 'Guardando cambios...',
      deleting: 'Eliminando elemento...',
      uploading: 'Subiendo archivo...',
      downloading: 'Descargando archivo...',
      searching: 'Buscando...',
      validating: 'Validando información...'
    };
    
    return messages[operation || ''] || 'Procesando...';
  }
  
  /**
   * Calcular tiempo transcurrido desde un timestamp
   */
  getElapsedTime(startTime: number): string {
    const elapsed = Date.now() - startTime;
    return this.formatDuration(elapsed);
  }
  
  /**
   * Formatear duración en formato legible
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.round((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  /**
   * Manejar cancelación
   */
  handleCancel(): void {
    if (this.onCancel) {
      this.onCancel();
    } else {
      // Cancelación por defecto: limpiar todos los loading states
      this.loadingService.clear();
    }
  }
  
  /**
   * Obtener estadísticas para debugging
   */
  getDebugInfo(): any {
    return {
      isLoading: this.loadingService.isLoading(),
      loadingCount: this.loadingService.loadingCount(),
      globalMessage: this.loadingService.globalMessage(),
      averageProgress: this.loadingService.averageProgress(),
      totalTime: this.loadingService.totalLoadingTime(),
      shouldShow: this.shouldShow(),
      showStartTime: this.showStartTime
    };
  }
}
