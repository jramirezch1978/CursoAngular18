import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LOGGER_TOKEN, 
  TASK_VALIDATORS, 
  CACHE_STRATEGY,
  APP_CONFIG,
  TaskValidator,
  Logger,
  CacheStrategy
} from '../../../core/tokens/config.tokens';
import { ConsoleLoggerService } from '../../../core/services/loggers/console-logger.service';
import { RemoteLoggerService } from '../../../core/services/loggers/remote-logger.service';
import { MemoryCacheStrategy } from '../../../core/services/cache/memory-cache.strategy';
import { LocalStorageCacheStrategy } from '../../../core/services/cache/localstorage-cache.strategy';
import { 
  RequiredFieldsValidator, 
  DateRangeValidator,
  PriorityValidator
} from '../../../core/services/validators/task-validators';

interface Task {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  justification?: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    // Logger provider con factory basado en environment
    {
      provide: LOGGER_TOKEN,
      useFactory: (config: any) => {
        return config.environment === 'production' 
          ? new RemoteLoggerService()
          : new ConsoleLoggerService();
      },
      deps: [APP_CONFIG]
    },
    // Multi-provider para validadores
    { 
      provide: TASK_VALIDATORS, 
      useClass: RequiredFieldsValidator, 
      multi: true 
    },
    { 
      provide: TASK_VALIDATORS, 
      useClass: DateRangeValidator, 
      multi: true 
    },
    { 
      provide: TASK_VALIDATORS, 
      useClass: PriorityValidator, 
      multi: true 
    },
    // Cache strategy provider con factory
    {
      provide: CACHE_STRATEGY,
      useFactory: (config: any) => {
        switch (config.cache.strategy) {
          case 'localStorage':
            return new LocalStorageCacheStrategy();
          case 'memory':
          default:
            return new MemoryCacheStrategy();
        }
      },
      deps: [APP_CONFIG]
    }
  ],
  template: `
    <div class="task-form-container">
      <!-- Validation Errors -->
      @if (validationErrors().length > 0) {
        <div class="validation-errors">
          <h4>⚠️ Errores de validación:</h4>
          <ul>
            @for (error of validationErrors(); track error) {
              <li>{{ error }}</li>
            }
          </ul>
        </div>
      }

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="success-message">
          ✅ {{ successMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Título *</label>
          <input 
            type="text" 
            [(ngModel)]="task.title" 
            (ngModelChange)="onFormChange()"
            name="title"
            placeholder="Título de la tarea"
            class="form-control">
        </div>

        <div class="form-group">
          <label>Descripción *</label>
          <textarea 
            [(ngModel)]="task.description" 
            (ngModelChange)="onFormChange()"
            name="description"
            placeholder="Descripción detallada (mínimo 10 caracteres)"
            rows="3"
            class="form-control"></textarea>
        </div>

        <div class="form-group">
          <label>Asignado a *</label>
          <select 
            [(ngModel)]="task.assigneeId" 
            (ngModelChange)="onFormChange()"
            name="assigneeId"
            class="form-control">
            <option value="">Seleccionar usuario</option>
            <option value="user-1">Carlos López</option>
            <option value="user-2">Ana García</option>
            <option value="user-3">María Rodriguez</option>
            <option value="user-4">Jorge Mendoza</option>
          </select>
        </div>

        <div class="form-group">
          <label>Fecha de vencimiento *</label>
          <input 
            type="date" 
            [(ngModel)]="task.dueDate" 
            (ngModelChange)="onFormChange()"
            name="dueDate"
            [min]="minDate"
            class="form-control">
        </div>

        <div class="form-group">
          <label>Prioridad *</label>
          <select 
            [(ngModel)]="task.priority" 
            (ngModelChange)="onFormChange()"
            name="priority"
            class="form-control">
            <option value="">Seleccionar prioridad</option>
            <option value="low">🟢 Baja</option>
            <option value="medium">🟡 Media</option>
            <option value="high">🟠 Alta</option>
            <option value="urgent">🔴 Urgente</option>
            <option value="critical">🚨 Crítica</option>
          </select>
        </div>

        @if (task.priority === 'critical') {
          <div class="form-group">
            <label>Justificación (requerida para prioridad crítica) *</label>
            <textarea 
              [(ngModel)]="task.justification" 
              (ngModelChange)="onFormChange()"
              name="justification"
              placeholder="Explique por qué esta tarea es crítica"
              rows="2"
              class="form-control"></textarea>
          </div>
        }

        <button type="submit" class="btn btn-primary">
          ✅ Crear Tarea
        </button>
      </form>

      <!-- Provider Info -->
      <section class="provider-info">
        <h3>🔧 Providers Configurados</h3>
        <div class="info-grid">
          <div class="info-item">
            <strong>Logger:</strong>
            <span>{{ config.environment === 'production' ? 'RemoteLogger' : 'ConsoleLogger' }}</span>
          </div>
          <div class="info-item">
            <strong>Cache Strategy:</strong>
            <span>{{ config.cache.strategy }}</span>
          </div>
          <div class="info-item">
            <strong>Validators:</strong>
            <span>{{ validators.length }} validadores activos</span>
          </div>
          <div class="info-item">
            <strong>Environment:</strong>
            <span>{{ config.environment }}</span>
          </div>
          <div class="info-item">
            <strong>Debug Mode:</strong>
            <span>{{ config.features.enableDebugMode ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <div class="info-item">
            <strong>Cache TTL:</strong>
            <span>{{ config.cache.ttl / 1000 }}s</span>
          </div>
        </div>
        
        <div class="validators-list">
          <h4>Validadores activos:</h4>
          <ul>
            @for (validator of validators; track validator.name) {
              <li>{{ validator.name }}</li>
            }
          </ul>
        </div>
      </section>
      
      <!-- Cache Viewer -->
      <section class="cache-viewer">
        <h3>💾 Datos en Cache ({{ config.cache.strategy }})</h3>
        <div class="cache-content">
          <h4>📝 Borrador del Formulario (draft-task):</h4>
          @if (cachedData()) {
            <div class="cached-data">
              <pre>{{ cachedData() | json }}</pre>
              <small>Última actualización: {{ lastCacheUpdate() | date:'HH:mm:ss' }}</small>
            </div>
          } @else {
            <div class="no-cache">
              <p>No hay datos en cache todavía. Empieza a escribir en el formulario.</p>
            </div>
          }
          
          <div class="cache-actions">
            <button type="button" (click)="refreshCacheView()" class="btn btn-secondary">
              🔄 Actualizar Vista
            </button>
            <button type="button" (click)="clearCacheData()" class="btn btn-danger">
              🗑️ Limpiar Cache
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
  // Inyección de tokens
  private readonly logger = inject<Logger>(LOGGER_TOKEN);
  readonly validators = inject<TaskValidator[]>(TASK_VALIDATORS);
  private readonly cache = inject<CacheStrategy>(CACHE_STRATEGY);
  readonly config = inject(APP_CONFIG);
  
  validationErrors = signal<string[]>([]);
  successMessage = signal<string>('');
  cachedData = signal<Task | null>(null);
  lastCacheUpdate = signal<Date | null>(null);
  
  task: Task = {
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 'medium',
    justification: ''
  };
  
  minDate = new Date().toISOString().split('T')[0];
  
  ngOnInit(): void {
    this.logger.info('TaskFormComponent initialized');
    this.logger.debug('Configuration:', this.config);
    this.logger.debug('Validators loaded:', this.validators.map(v => v.name));
    
    // Cargar tarea desde caché si existe
    const cachedTask = this.cache.get<Task>('draft-task');
    if (cachedTask) {
      this.task = cachedTask;
      this.cachedData.set(cachedTask);
      this.lastCacheUpdate.set(new Date());
      this.logger.info('Loaded draft task from cache');
    }
  }
  
  onSubmit(): void {
    this.logger.info('Form submission started');
    this.validationErrors.set([]);
    this.successMessage.set('');
    
    // Ejecutar todos los validadores
    const allErrors: string[] = [];
    
    for (const validator of this.validators) {
      this.logger.debug(`Running validator: ${validator.name}`);
      const result = validator.validate(this.task);
      
      if (!result.valid && result.errors) {
        allErrors.push(...result.errors);
      }
    }
    
    if (allErrors.length > 0) {
      this.validationErrors.set(allErrors);
      this.logger.warn('Validation failed:', allErrors);
      return;
    }
    
    // Simular guardado
    this.logger.info('Task created successfully:', this.task);
    this.successMessage.set('¡Tarea creada exitosamente!');
    
    // Limpiar caché y formulario
    this.cache.remove('draft-task');
    this.resetForm();
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.successMessage.set('');
    }, 3000);
  }
  
  private resetForm(): void {
    this.task = {
      title: '',
      description: '',
      assigneeId: '',
      dueDate: '',
      priority: 'medium',
      justification: ''
    };
  }
  
  // Guardar borrador en caché cuando cambia el formulario
  onFormChange(): void {
    this.cache.set('draft-task', this.task, 600000); // 10 minutos
    this.cachedData.set(this.task);
    this.lastCacheUpdate.set(new Date());
    this.logger.debug('Draft saved to cache');
  }
  
  // Actualizar vista del cache
  refreshCacheView(): void {
    const cached = this.cache.get<Task>('draft-task');
    this.cachedData.set(cached);
    if (cached) {
      this.lastCacheUpdate.set(new Date());
    }
    this.logger.info('Cache view refreshed');
  }
  
  // Limpiar datos del cache
  clearCacheData(): void {
    this.cache.remove('draft-task');
    this.cachedData.set(null);
    this.lastCacheUpdate.set(null);
    this.logger.info('Cache cleared');
    this.successMessage.set('✅ Cache limpiado exitosamente');
    
    setTimeout(() => {
      this.successMessage.set('');
    }, 2000);
  }
}
