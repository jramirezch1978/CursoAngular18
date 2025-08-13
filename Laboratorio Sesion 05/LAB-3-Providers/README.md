# LAB 3: PROVIDERS Y JERARQUÍA DE INYECTORES

**Duración:** 45 minutos  
**Objetivo:** Dominar providers avanzados, InjectionTokens y jerarquía de inyectores

## 🎯 QUÉ VAS A APRENDER

- InjectionTokens para configuración y servicios no-clase
- Multi-providers para extensibilidad  
- Factory providers para lógica condicional
- Estrategias intercambiables con tokens
- Jerarquía de inyectores en la práctica
- Sistema de logging multi-nivel
- Sistema de caché con estrategias

## 📋 PASO 1: Crear Tokens de Inyección (10 minutos)

### 1.1 Crear tokens para configuración

Crear archivo `src/app/core/tokens/config.tokens.ts`:

```typescript
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
```

## 🔧 PASO 2: Implementar Providers Personalizados (15 minutos)

### 2.1 Crear implementaciones de Logger

Crear archivo `src/app/core/services/loggers/console-logger.service.ts`:

```typescript
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
```

### 2.2 Crear estrategias de caché

Crear archivo `src/app/core/services/cache/memory-cache.strategy.ts`:

```typescript
import { Injectable } from '@angular/core';
import { CacheStrategy } from '../../tokens/config.tokens';

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

@Injectable()
export class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }
  
  set<T>(key: string, value: T, ttl: number = 300000): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }
  
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

### 2.3 Crear validadores de tareas

Crear archivo `src/app/core/services/validators/task-validators.ts`:

```typescript
import { Injectable } from '@angular/core';
import { TaskValidator } from '../../tokens/config.tokens';

@Injectable()
export class RequiredFieldsValidator implements TaskValidator {
  name = 'RequiredFieldsValidator';
  
  validate(task: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    if (!task.title || task.title.trim().length === 0) {
      errors.push('El título es requerido');
    }
    
    if (!task.description || task.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }
    
    if (!task.assigneeId) {
      errors.push('Debe asignar la tarea a un usuario');
    }
    
    if (!task.dueDate) {
      errors.push('La fecha de vencimiento es requerida');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

@Injectable()
export class DateRangeValidator implements TaskValidator {
  name = 'DateRangeValidator';
  
  validate(task: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (dueDate < now) {
      errors.push('La fecha de vencimiento no puede ser en el pasado');
    }
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    
    if (dueDate > maxDate) {
      errors.push('La fecha de vencimiento no puede ser mayor a 2 años');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}
```

## 📝 PASO 3: Configurar Providers en Componente (10 minutos)

### 3.1 Crear componente con providers personalizados

Crear `src/app/features/task-manager/task-form/task-form.component.ts`:

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MemoryCacheStrategy } from '../../../core/services/cache/memory-cache.strategy';
import { 
  RequiredFieldsValidator, 
  DateRangeValidator 
} from '../../../core/services/validators/task-validators';

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
      <h2>📝 Formulario con Providers Avanzados</h2>
      
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

      <form (ngSubmit)="onSubmit()">
        <!-- Form fields here -->
        <button type="submit" class="btn btn-primary">
          ✅ Crear Tarea
        </button>
      </form>

      <!-- Provider Info -->
      <section class="provider-info">
        <h3>🔧 Providers Configurados</h3>
        <ul>
          <li>Logger: {{ config.environment === 'production' ? 'RemoteLogger' : 'ConsoleLogger' }}</li>
          <li>Cache Strategy: {{ config.cache.strategy }}</li>
          <li>Validators: {{ validators.length }} validadores activos</li>
          <li>Environment: {{ config.environment }}</li>
          <li>Debug Mode: {{ config.features.enableDebugMode ? 'Enabled' : 'Disabled' }}</li>
        </ul>
      </section>
    </div>
  `,
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent implements OnInit {
  // Inyección de tokens
  private readonly logger = inject<Logger>(LOGGER_TOKEN);
  private readonly validators = inject<TaskValidator[]>(TASK_VALIDATORS);
  private readonly cache = inject<CacheStrategy>(CACHE_STRATEGY);
  readonly config = inject(APP_CONFIG);
  
  validationErrors = signal<string[]>([]);
  
  ngOnInit(): void {
    this.logger.info('TaskFormComponent initialized');
    this.logger.debug('Configuration:', this.config);
    this.logger.debug('Validators loaded:', this.validators.map(v => v.name));
  }
  
  onSubmit(): void {
    this.logger.info('Form submission started');
    // Implementation here
  }
}
```

## 🧪 TESTING

### Test para verificar providers

```typescript
import { TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { LOGGER_TOKEN, TASK_VALIDATORS } from '../../../core/tokens/config.tokens';

describe('TaskFormComponent - Providers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskFormComponent]
    });
  });

  it('should inject logger correctly', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const logger = TestBed.inject(LOGGER_TOKEN);
    expect(logger).toBeTruthy();
  });

  it('should inject multiple validators', () => {
    const fixture = TestBed.createComponent(TaskFormComponent);
    const validators = TestBed.inject(TASK_VALIDATORS);
    expect(validators.length).toBeGreaterThan(0);
  });
});
```

## 🚀 COMANDOS PARA VERIFICACIÓN

```bash
# Compilar proyecto
ng build

# Verificar InjectionTokens
grep -r "InjectionToken" src/app/core/tokens/

# Verificar providers
grep -r "provide:" src/app/features/

# Ejecutar tests
ng test --include='**/task-form.component.spec.ts'
```

## ✅ CHECKLIST LAB 3

- [ ] InjectionTokens creados correctamente
- [ ] ConsoleLoggerService implementado
- [ ] MemoryCacheStrategy funcionando
- [ ] Validadores con multi-provider configurados
- [ ] Factory providers implementados
- [ ] Componente con providers personalizados funcionando
- [ ] Jerarquía de inyectores configurada
- [ ] Tests de providers pasando
- [ ] Aplicación compilando sin errores

## 🎯 ¡Siguiente: LAB 4!

¡Excelente! Has dominado los providers avanzados. Ahora implementaremos patrones empresariales como Repository y Unit of Work.
