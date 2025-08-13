# LAB 1: SISTEMA DE GESTIÓN CON SERVICIOS Y SIGNALS

**Duración:** 45 minutos  
**Objetivo:** Dominar la inyección de dependencias moderna con inject() y crear servicios reactivos con Signals

## 🎯 QUÉ VAS A APRENDER

- Servicios reactivos con Signals en lugar de Observables
- Función `inject()` moderna vs constructor injection
- Computed signals para estadísticas automáticas
- Effects para persistencia automática
- Filtrado reactivo con signals

## 📋 PASO 1: Crear Interfaces del Sistema (5 minutos)

Crear archivo `src/app/core/interfaces/task.interface.ts`:

```typescript
// Interfaces para el sistema de gestión de tareas PROVIAS
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  completionPercentage: number;
  attachments: Attachment[];
  comments: Comment[];
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  dueDate: Date;
  estimatedHours: number;
  tags?: string[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
  actualHours?: number;
  completionPercentage?: number;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string[];
  projectId?: string;
  tags?: string[];
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  completedThisWeek: number;
  averageCompletionTime: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}
```

### Comando para crear la interfaz:

```bash
ng generate interface core/interfaces/task
```

## 🔧 PASO 2: Crear Servicio Principal con Signals (10 minutos)

### 2.1 Generar servicio de tareas

```bash
ng generate service core/services/task-state --skip-tests
```

### 2.2 Implementar servicio con signals

Actualizar `src/app/core/services/task-state.service.ts`:

```typescript
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  CreateTaskDto, 
  UpdateTaskDto,
  TaskFilter,
  TaskStatistics 
} from '../interfaces/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskStateService {
  // Signals privados para el estado
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private filterSignal = signal<TaskFilter>({});
  private selectedTaskSignal = signal<Task | null>(null);

  // Computed signals públicos
  tasks = computed(() => this.tasksSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  selectedTask = computed(() => this.selectedTaskSignal());
  
  // Tareas filtradas
  filteredTasks = computed(() => {
    const tasks = this.tasksSignal();
    const filter = this.filterSignal();
    
    return this.applyFilters(tasks, filter);
  });

  // Estadísticas computadas
  statistics = computed((): TaskStatistics => {
    const tasks = this.filteredTasks();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const byStatus = Object.values(TaskStatus).reduce((acc, status) => {
      acc[status] = tasks.filter(t => t.status === status).length;
      return acc;
    }, {} as Record<TaskStatus, number>);
    
    const byPriority = Object.values(TaskPriority).reduce((acc, priority) => {
      acc[priority] = tasks.filter(t => t.priority === priority).length;
      return acc;
    }, {} as Record<TaskPriority, number>);
    
    return {
      total: tasks.length,
      byStatus,
      byPriority,
      overdue: tasks.filter(t => 
        t.status !== TaskStatus.COMPLETED && 
        new Date(t.dueDate) < now
      ).length,
      completedThisWeek: tasks.filter(t => 
        t.status === TaskStatus.COMPLETED &&
        new Date(t.updatedAt) > weekAgo
      ).length,
      averageCompletionTime: this.calculateAverageCompletionTime(tasks),
      totalEstimatedHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      totalActualHours: tasks.reduce((sum, t) => sum + t.actualHours, 0)
    };
  });

  // Tareas urgentes
  urgentTasks = computed(() => {
    const tasks = this.filteredTasks();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return tasks.filter(t => 
      (t.priority === TaskPriority.URGENT || t.priority === TaskPriority.CRITICAL) ||
      (new Date(t.dueDate) <= tomorrow && t.status !== TaskStatus.COMPLETED)
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  constructor() {
    console.log('🚀 TaskStateService initialized with Signals');
    
    // Effect para logging de cambios
    effect(() => {
      const taskCount = this.tasks().length;
      console.log(`📊 Tasks updated: ${taskCount} tasks in state`);
    });
    
    // Effect para persistencia local
    effect(() => {
      const tasks = this.tasks();
      if (tasks.length > 0) {
        this.saveToLocalStorage(tasks);
      }
    });
    
    // Cargar datos iniciales
    this.loadFromLocalStorage();
  }

  // Métodos públicos para gestión de tareas
  loadTasks(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    // Simular carga desde API
    setTimeout(() => {
      try {
        const mockTasks = this.generateMockTasks();
        this.tasksSignal.set(mockTasks);
        this.loadingSignal.set(false);
      } catch (error) {
        this.errorSignal.set('Error al cargar tareas');
        this.loadingSignal.set(false);
      }
    }, 1000);
  }

  addTask(dto: CreateTaskDto): Task {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...dto,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      actualHours: 0,
      completionPercentage: 0,
      attachments: [],
      comments: [],
      tags: dto.tags || []
    };
    
    this.tasksSignal.update(tasks => [...tasks, newTask]);
    return newTask;
  }

  updateTask(id: string, dto: UpdateTaskDto): void {
    this.tasksSignal.update(tasks =>
      tasks.map(task =>
        task.id === id
          ? { ...task, ...dto, updatedAt: new Date() }
          : task
      )
    );
  }

  deleteTask(id: string): void {
    this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
  }

  selectTask(id: string): void {
    const task = this.tasksSignal().find(t => t.id === id);
    this.selectedTaskSignal.set(task || null);
  }

  updateFilter(filter: TaskFilter): void {
    this.filterSignal.set(filter);
  }

  changeTaskStatus(id: string, status: TaskStatus): void {
    this.updateTask(id, { 
      status,
      completionPercentage: status === TaskStatus.COMPLETED ? 100 : undefined
    });
  }

  updateProgress(taskId: string, percentage: number): void {
    const validPercentage = Math.max(0, Math.min(100, percentage));
    this.updateTask(taskId, { 
      completionPercentage: validPercentage,
      status: validPercentage === 100 ? TaskStatus.COMPLETED : undefined
    });
  }

  // Métodos privados
  private applyFilters(tasks: Task[], filter: TaskFilter): Task[] {
    let filtered = [...tasks];
    
    if (filter.status?.length) {
      filtered = filtered.filter(t => filter.status!.includes(t.status));
    }
    
    if (filter.priority?.length) {
      filtered = filtered.filter(t => filter.priority!.includes(t.priority));
    }
    
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }

  private calculateAverageCompletionTime(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.updatedAt).getTime();
      return sum + (completed - created);
    }, 0);
    
    return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // días
  }

  private saveToLocalStorage(tasks: Task[]): void {
    try {
      localStorage.setItem('provias_tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('provias_tasks');
      if (stored) {
        const tasks = JSON.parse(stored);
        this.tasksSignal.set(tasks);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  private generateMockTasks(): Task[] {
    const projects = ['PRY-001', 'PRY-002', 'PRY-003'];
    const assignees = ['user-1', 'user-2', 'user-3', 'user-4'];
    const tags = ['Frontend', 'Backend', 'Database', 'API', 'Testing', 'Documentation'];
    
    return Array.from({ length: 15 }, (_, i) => ({
      id: `task-${i + 1}`,
      title: `Tarea ${i + 1}: ${this.getRandomTaskTitle()}`,
      description: `Descripción detallada de la tarea ${i + 1}`,
      status: Object.values(TaskStatus)[Math.floor(Math.random() * 6)] as TaskStatus,
      priority: Object.values(TaskPriority)[Math.floor(Math.random() * 5)] as TaskPriority,
      assigneeId: assignees[Math.floor(Math.random() * assignees.length)],
      projectId: projects[Math.floor(Math.random() * projects.length)],
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      tags: tags.slice(0, Math.floor(Math.random() * 3) + 1),
      estimatedHours: Math.floor(Math.random() * 40) + 8,
      actualHours: Math.floor(Math.random() * 40),
      completionPercentage: Math.floor(Math.random() * 101),
      attachments: [],
      comments: []
    }));
  }

  private getRandomTaskTitle(): string {
    const titles = [
      'Implementar autenticación OAuth',
      'Optimizar consultas de base de datos',
      'Diseñar dashboard de métricas',
      'Corregir bug en formulario',
      'Actualizar documentación API',
      'Configurar pipeline CI/CD',
      'Migrar a Angular 18',
      'Implementar sistema de caché',
      'Refactorizar servicios',
      'Crear tests unitarios'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }
}
```

## 📧 PASO 3: Crear Servicios Complementarios (10 minutos)

### 3.1 Crear servicio de notificaciones

```bash
ng generate service shared/services/notification --skip-tests
```

Actualizar `src/app/shared/services/notification.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  
  notifications = computed(() => this.notificationsSignal());
  hasNotifications = computed(() => this.notificationsSignal().length > 0);
  
  show(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      duration: notification.duration || 5000
    };
    
    this.notificationsSignal.update(current => [...current, newNotification]);
    
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, newNotification.duration);
    }
  }
  
  success(title: string, message?: string): void {
    this.show({ type: 'success', title, message });
  }
  
  error(title: string, message?: string): void {
    this.show({ type: 'error', title, message, duration: 0 });
  }
  
  warning(title: string, message?: string): void {
    this.show({ type: 'warning', title, message });
  }
  
  info(title: string, message?: string): void {
    this.show({ type: 'info', title, message });
  }
  
  remove(id: string): void {
    this.notificationsSignal.update(current => 
      current.filter(n => n.id !== id)
    );
  }
  
  clear(): void {
    this.notificationsSignal.set([]);
  }
}
```

## 📋 PASO 4: Crear Componente con Inject() (20 minutos)

### 4.1 Generar componente de lista de tareas

```bash
ng generate component features/task-manager/task-list --standalone
```

### 4.2 Implementar componente con inject()

Actualizar `src/app/features/task-manager/task-list/task-list.component.ts`:

Ver archivo completo en el directorio del laboratorio...

### 4.3 Crear template del componente

Ver archivo `task-list.component.html` en el directorio del laboratorio...

### 4.4 Agregar estilos

Ver archivo `task-list.component.scss` en el directorio del laboratorio...

## 🧪 TESTING

Crear archivo `src/app/core/services/task-state.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { TaskStateService } from './task-state.service';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

describe('TaskStateService', () => {
  let service: TaskStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new task', () => {
    const initialCount = service.tasks().length;
    
    const newTask = service.addTask({
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 8
    });

    expect(newTask).toBeDefined();
    expect(service.tasks().length).toBe(initialCount + 1);
  });
});
```

## 🚀 COMANDOS PARA VERIFICACIÓN

```bash
# Compilar proyecto
ng build

# Ejecutar servidor de desarrollo
ng serve --open

# Ejecutar tests
ng test --include='**/task-state.service.spec.ts'

# Verificar tamaño del bundle
ng build --configuration production --stats-json
```

## ✅ CHECKLIST LAB 1

- [ ] Interfaces de Task creadas correctamente
- [ ] TaskStateService con signals implementado
- [ ] NotificationService funcionando
- [ ] Componente TaskList con inject() creado
- [ ] Template con sintaxis @if/@for funcionando
- [ ] Estadísticas reactivas calculándose automáticamente
- [ ] Persistencia en localStorage funcionando
- [ ] Tests básicos pasando
- [ ] Aplicación compilando sin errores

## 🎯 ¡Siguiente: LAB 2!

Ahora que dominas los servicios con Signals, ¡es hora de migrar a componentes standalone!
