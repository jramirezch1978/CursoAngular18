import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LOGGER_TOKEN, 
  Logger,
  APP_CONFIG 
} from '../../../core/tokens/config.tokens';
import { ConsoleLoggerService } from '../../../core/services/loggers/console-logger.service';

@Component({
  selector: 'app-logger-demo',
  standalone: true,
  imports: [CommonModule],
  providers: [
    // Override del logger a nivel de componente
    {
      provide: LOGGER_TOKEN,
      useClass: ConsoleLoggerService
    }
  ],
  template: `
    <div class="logger-demo">
      <p class="info">
        Este componente siempre usa ConsoleLogger, independientemente de la configuración global.
        Esto demuestra la jerarquía de inyectores.
      </p>
      
      <div class="button-grid">
        <button class="btn btn-info" (click)="logInfo()">
          ℹ️ Log Info
        </button>
        <button class="btn btn-success" (click)="logSuccess()">
          ✅ Log Success
        </button>
        <button class="btn btn-warning" (click)="logWarning()">
          ⚠️ Log Warning
        </button>
        <button class="btn btn-danger" (click)="logError()">
          ❌ Log Error
        </button>
        <button class="btn btn-debug" (click)="logDebug()">
          🐛 Log Debug
        </button>
      </div>
      
      <div class="config-info">
        <h4>Configuración actual:</h4>
        <ul>
          <li>Environment: {{ config.environment }}</li>
          <li>Debug Mode: {{ config.features.enableDebugMode ? 'Enabled' : 'Disabled' }}</li>
          <li>Logger: ConsoleLogger (Override local)</li>
        </ul>
      </div>
      
      <div class="hint">
        💡 Abre la consola del navegador para ver los logs
      </div>
    </div>
  `,
  styles: [`
    .logger-demo {
      .info {
        background: #d1ecf1;
        border: 1px solid #bee5eb;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        color: #0c5460;
      }
      
      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      .btn {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        &.btn-info {
          background: #17a2b8;
          color: white;
        }
        
        &.btn-success {
          background: #28a745;
          color: white;
        }
        
        &.btn-warning {
          background: #ffc107;
          color: #212529;
        }
        
        &.btn-danger {
          background: #dc3545;
          color: white;
        }
        
        &.btn-debug {
          background: #6f42c1;
          color: white;
        }
      }
      
      .config-info {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        
        h4 {
          margin: 0 0 0.5rem 0;
          color: #495057;
        }
        
        ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #6c757d;
        }
      }
      
      .hint {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 1rem;
        background: #fff3cd;
        border-radius: 8px;
      }
    }
  `]
})
export class LoggerDemoComponent {
  private readonly logger = inject<Logger>(LOGGER_TOKEN);
  readonly config = inject(APP_CONFIG);
  
  private counter = 0;
  
  logInfo(): void {
    this.logger.info(`Mensaje informativo #${++this.counter}`, { 
      timestamp: new Date().toISOString(),
      component: 'LoggerDemoComponent' 
    });
  }
  
  logSuccess(): void {
    this.logger.log(`Operación exitosa #${++this.counter}`, { 
      status: 'success',
      duration: Math.floor(Math.random() * 1000) + 'ms' 
    });
  }
  
  logWarning(): void {
    this.logger.warn(`Advertencia #${++this.counter}: Revise esta operación`, {
      level: 'medium',
      code: 'WARN_' + Math.floor(Math.random() * 1000)
    });
  }
  
  logError(): void {
    this.logger.error(`Error simulado #${++this.counter}`, {
      error: new Error('Error de demostración'),
      stack: 'Stack trace aquí...'
    });
  }
  
  logDebug(): void {
    this.logger.debug(`Debug info #${++this.counter}`, {
      debugMode: this.config.features.enableDebugMode,
      details: 'Información detallada para debugging'
    });
    
    if (!this.config.features.enableDebugMode) {
      alert('Debug mode está deshabilitado. Los logs debug no se mostrarán.');
    }
  }
}
