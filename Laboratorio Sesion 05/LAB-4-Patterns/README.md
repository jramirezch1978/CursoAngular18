# LAB 4: ARQUITECTURA DE SERVICIOS EMPRESARIALES

**Duración:** 25 minutos  
**Objetivo:** Implementar patrones empresariales (Repository, Unit of Work, Store Pattern)

## 🎯 QUÉ VAS A APRENDER

- Repository Pattern para abstracción de datos
- Unit of Work para gestión de transacciones
- Global Store con Signals
- Patrones de diseño empresariales
- Arquitectura escalable y mantenible

## 📋 PASO 1: Implementar Repository Pattern (10 minutos)

### 1.1 Crear repository base abstracto

Crear archivo `src/app/core/patterns/repository.pattern.ts`:

```typescript
import { Observable } from 'rxjs';

export interface Entity {
  id: string;
}

export abstract class Repository<T extends Entity> {
  abstract getAll(): Observable<T[]>;
  abstract getById(id: string): Observable<T | null>;
  abstract create(entity: Omit<T, 'id'>): Observable<T>;
  abstract update(id: string, entity: Partial<T>): Observable<T>;
  abstract delete(id: string): Observable<boolean>;
  abstract exists(id: string): Observable<boolean>;
  abstract count(): Observable<number>;
  abstract query(criteria: any): Observable<T[]>;
}
```

### 1.2 Implementar Task Repository

Crear archivo `src/app/core/repositories/task.repository.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, delay } from 'rxjs';
import { Repository } from '../patterns/repository.pattern';
import { Task } from '../interfaces/task.interface';
import { APP_CONFIG } from '../tokens/config.tokens';

@Injectable({
  providedIn: 'root'
})
export class TaskRepository extends Repository<Task> {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.apiUrl}/tasks`;
  
  // Mock data para desarrollo
  private mockTasks: Task[] = this.generateMockTasks();
  
  getAll(): Observable<Task[]> {
    if (this.config.environment === 'development') {
      return of(this.mockTasks).pipe(delay(500));
    }
    
    return this.http.get<Task[]>(this.apiUrl).pipe(
      catchError(() => of(this.mockTasks))
    );
  }
  
  getById(id: string): Observable<Task | null> {
    if (this.config.environment === 'development') {
      const task = this.mockTasks.find(t => t.id === id);
      return of(task || null).pipe(delay(300));
    }
    
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(null))
    );
  }
  
  create(entity: Omit<Task, 'id'>): Observable<Task> {
    const newTask: Task = {
      ...entity,
      id: `task-${Date.now()}`
    } as Task;
    
    if (this.config.environment === 'development') {
      this.mockTasks.push(newTask);
      return of(newTask).pipe(delay(500));
    }
    
    return this.http.post<Task>(this.apiUrl, entity);
  }
  
  update(id: string, entity: Partial<Task>): Observable<Task> {
    if (this.config.environment === 'development') {
      const index = this.mockTasks.findIndex(t => t.id === id);
      if (index > -1) {
        this.mockTasks[index] = { ...this.mockTasks[index], ...entity };
        return of(this.mockTasks[index]).pipe(delay(300));
      }
      throw new Error('Task not found');
    }
    
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, entity);
  }
  
  delete(id: string): Observable<boolean> {
    if (this.config.environment === 'development') {
      const index = this.mockTasks.findIndex(t => t.id === id);
      if (index > -1) {
        this.mockTasks.splice(index, 1);
        return of(true).pipe(delay(300));
      }
      return of(false);
    }
    
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
  
  exists(id: string): Observable<boolean> {
    return this.getById(id).pipe(
      map(task => task !== null)
    );
  }
  
  count(): Observable<number> {
    return this.getAll().pipe(
      map(tasks => tasks.length)
    );
  }
  
  query(criteria: any): Observable<Task[]> {
    return this.getAll().pipe(
      map(tasks => this.filterTasks(tasks, criteria))
    );
  }
  
  private filterTasks(tasks: Task[], criteria: any): Task[] {
    let filtered = [...tasks];
    
    if (criteria.status) {
      filtered = filtered.filter(t => t.status === criteria.status);
    }
    
    if (criteria.assigneeId) {
      filtered = filtered.filter(t => t.assigneeId === criteria.assigneeId);
    }
    
    if (criteria.priority) {
      filtered = filtered.filter(t => t.priority === criteria.priority);
    }
    
    return filtered;
  }
  
  private generateMockTasks(): Task[] {
    // Generar datos mock para desarrollo
    return Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i + 1}`,
      title: `Tarea de ejemplo ${i + 1}`,
      description: `Descripción de la tarea ${i + 1}`,
      status: 'pending',
      priority: 'medium',
      assigneeId: `user-${(i % 4) + 1}`,
      projectId: `PRY-00${(i % 3) + 1}`,
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['development'],
      estimatedHours: Math.floor(Math.random() * 40) + 8,
      actualHours: 0,
      completionPercentage: 0,
      attachments: [],
      comments: []
    } as any));
  }
}
```

## 🔄 PASO 2: Implementar Unit of Work Pattern (10 minutos)

### 2.1 Crear Unit of Work

Crear archivo `src/app/core/patterns/unit-of-work.pattern.ts`:

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, forkJoin, of, map, catchError } from 'rxjs';
import { TaskRepository } from '../repositories/task.repository';
import { Task } from '../interfaces/task.interface';
import { LOGGER_TOKEN } from '../tokens/config.tokens';

interface TrackedEntity<T> {
  entity: T;
  state: 'unchanged' | 'added' | 'modified' | 'deleted';
  originalEntity?: T;
}

@Injectable({
  providedIn: 'root'
})
export class UnitOfWork {
  private readonly taskRepository = inject(TaskRepository);
  private readonly logger = inject(LOGGER_TOKEN);
  
  // Tracking de entidades
  private trackedTasks = signal<Map<string, TrackedEntity<Task>>>(new Map());
  
  // Computed para obtener cambios
  hasChanges = computed(() => {
    const tracked = this.trackedTasks();
    for (const [_, entity] of tracked) {
      if (entity.state !== 'unchanged') return true;
    }
    return false;
  });
  
  changesCount = computed(() => {
    const tracked = this.trackedTasks();
    let count = 0;
    for (const [_, entity] of tracked) {
      if (entity.state !== 'unchanged') count++;
    }
    return count;
  });
  
  // Registrar entidad para tracking
  registerTask(task: Task): void {
    const tracked = this.trackedTasks();
    if (!tracked.has(task.id)) {
      tracked.set(task.id, {
        entity: { ...task },
        state: 'unchanged',
        originalEntity: { ...task }
      });
      this.trackedTasks.set(new Map(tracked));
      this.logger.debug('Task registered for tracking:', task.id);
    }
  }
  
  // Marcar como nuevo
  markAsNew(task: Omit<Task, 'id'>): Task {
    const newTask: Task = {
      ...task,
      id: `temp-${Date.now()}`
    } as Task;
    
    const tracked = this.trackedTasks();
    tracked.set(newTask.id, {
      entity: newTask,
      state: 'added'
    });
    this.trackedTasks.set(new Map(tracked));
    
    this.logger.info('New task marked for creation:', newTask.id);
    return newTask;
  }
  
  // Marcar como modificado
  markAsModified(task: Task): void {
    const tracked = this.trackedTasks();
    const existing = tracked.get(task.id);
    
    if (existing) {
      existing.entity = { ...task };
      existing.state = existing.state === 'added' ? 'added' : 'modified';
      this.trackedTasks.set(new Map(tracked));
      this.logger.debug('Task marked as modified:', task.id);
    } else {
      this.registerTask(task);
      this.markAsModified(task);
    }
  }
  
  // Marcar como eliminado
  markAsDeleted(taskId: string): void {
    const tracked = this.trackedTasks();
    const existing = tracked.get(taskId);
    
    if (existing) {
      if (existing.state === 'added') {
        // Si es nuevo y no se ha guardado, simplemente lo removemos
        tracked.delete(taskId);
      } else {
        existing.state = 'deleted';
      }
      this.trackedTasks.set(new Map(tracked));
      this.logger.info('Task marked for deletion:', taskId);
    }
  }
  
  // Commit de todos los cambios
  commit(): Observable<any> {
    const operations: Observable<any>[] = [];
    const tracked = this.trackedTasks();
    
    this.logger.info(`Committing ${this.changesCount()} changes...`);
    
    for (const [id, trackedEntity] of tracked) {
      switch (trackedEntity.state) {
        case 'added':
          operations.push(
            this.taskRepository.create(trackedEntity.entity)
          );
          break;
          
        case 'modified':
          operations.push(
            this.taskRepository.update(id, trackedEntity.entity)
          );
          break;
          
        case 'deleted':
          operations.push(
            this.taskRepository.delete(id)
          );
          break;
      }
    }
    
    if (operations.length === 0) {
      this.logger.info('No changes to commit');
      return of(null);
    }
    
    return forkJoin(operations).pipe(
      map(results => {
        this.logger.info('All changes committed successfully');
        this.clear();
        return results;
      }),
      catchError(error => {
        this.logger.error('Commit failed:', error);
        throw error;
      })
    );
  }
  
  // Rollback de cambios
  rollback(): void {
    const tracked = this.trackedTasks();
    const rolledBack = new Map<string, TrackedEntity<Task>>();
    
    for (const [id, trackedEntity] of tracked) {
      if (trackedEntity.state === 'added') {
        // No agregar entidades nuevas
        continue;
      } else if (trackedEntity.originalEntity) {
        // Restaurar al estado original
        rolledBack.set(id, {
          entity: { ...trackedEntity.originalEntity },
          state: 'unchanged',
          originalEntity: { ...trackedEntity.originalEntity }
        });
      }
    }
    
    this.trackedTasks.set(rolledBack);
    this.logger.info('Changes rolled back');
  }
  
  // Limpiar tracking
  clear(): void {
    this.trackedTasks.set(new Map());
    this.logger.debug('Unit of Work cleared');
  }
  
  // Obtener cambios pendientes
  getPendingChanges(): { added: Task[], modified: Task[], deleted: string[] } {
    const tracked = this.trackedTasks();
    const changes = {
      added: [] as Task[],
      modified: [] as Task[],
      deleted: [] as string[]
    };
    
    for (const [id, trackedEntity] of tracked) {
      switch (trackedEntity.state) {
        case 'added':
          changes.added.push(trackedEntity.entity);
          break;
        case 'modified':
          changes.modified.push(trackedEntity.entity);
          break;
        case 'deleted':
          changes.deleted.push(id);
          break;
      }
    }
    
    return changes;
  }
}
```

## 🗄️ PASO 3: Implementar Global Store con Signals (5 minutos)

### 3.1 Crear Store Global

Crear archivo `src/app/core/store/app.store.ts`:

```typescript
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { TaskRepository } from '../repositories/task.repository';
import { Task, TaskStatus, TaskPriority } from '../interfaces/task.interface';
import { LOGGER_TOKEN } from '../tokens/config.tokens';

interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  tasks: Task[];
  selectedTaskId: string | null;
  filters: {
    status: TaskStatus | null;
    priority: TaskPriority | null;
    searchTerm: string;
  };
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    language: 'es' | 'en';
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  private readonly taskRepository = inject(TaskRepository);
  private readonly logger = inject(LOGGER_TOKEN);
  
  // Estado principal
  private state = signal<AppState>({
    user: null,
    tasks: [],
    selectedTaskId: null,
    filters: {
      status: null,
      priority: null,
      searchTerm: ''
    },
    ui: {
      sidebarOpen: true,
      theme: 'light',
      language: 'es'
    }
  });
  
  // Selectores computados
  user = computed(() => this.state().user);
  tasks = computed(() => this.state().tasks);
  selectedTask = computed(() => {
    const state = this.state();
    return state.tasks.find(t => t.id === state.selectedTaskId) || null;
  });
  
  filteredTasks = computed(() => {
    const state = this.state();
    let filtered = [...state.tasks];
    
    if (state.filters.status) {
      filtered = filtered.filter(t => t.status === state.filters.status);
    }
    
    if (state.filters.priority) {
      filtered = filtered.filter(t => t.priority === state.filters.priority);
    }
    
    if (state.filters.searchTerm) {
      const term = state.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  });
  
  statistics = computed(() => {
    const tasks = this.tasks();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      critical: tasks.filter(t => t.priority === TaskPriority.CRITICAL).length,
      urgent: tasks.filter(t => t.priority === TaskPriority.URGENT).length
    };
  });
  
  ui = computed(() => this.state().ui);
  
  constructor() {
    // Effect para persistencia
    effect(() => {
      const state = this.state();
      this.saveToLocalStorage(state);
    });
    
    // Effect para logging
    effect(() => {
      const stats = this.statistics();
      this.logger.debug('Store statistics updated:', stats);
    });
    
    // Cargar estado inicial
    this.loadFromLocalStorage();
    this.loadTasks();
  }
  
  // Actions
  setUser(user: AppState['user']): void {
    this.state.update(s => ({ ...s, user }));
    this.logger.info('User set:', user?.name);
  }
  
  loadTasks(): void {
    this.taskRepository.getAll().subscribe(tasks => {
      this.state.update(s => ({ ...s, tasks }));
      this.logger.info(`${tasks.length} tasks loaded`);
    });
  }
  
  addTask(task: Task): void {
    this.state.update(s => ({
      ...s,
      tasks: [...s.tasks, task]
    }));
    this.logger.info('Task added:', task.id);
  }
  
  updateTask(taskId: string, updates: Partial<Task>): void {
    this.state.update(s => ({
      ...s,
      tasks: s.tasks.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      )
    }));
    this.logger.info('Task updated:', taskId);
  }
  
  deleteTask(taskId: string): void {
    this.state.update(s => ({
      ...s,
      tasks: s.tasks.filter(t => t.id !== taskId)
    }));
    this.logger.info('Task deleted:', taskId);
  }
  
  selectTask(taskId: string | null): void {
    this.state.update(s => ({ ...s, selectedTaskId: taskId }));
  }
  
  updateFilters(filters: Partial<AppState['filters']>): void {
    this.state.update(s => ({
      ...s,
      filters: { ...s.filters, ...filters }
    }));
  }
  
  toggleSidebar(): void {
    this.state.update(s => ({
      ...s,
      ui: { ...s.ui, sidebarOpen: !s.ui.sidebarOpen }
    }));
  }
  
  setTheme(theme: 'light' | 'dark'): void {
    this.state.update(s => ({
      ...s,
      ui: { ...s.ui, theme }
    }));
    document.body.className = theme;
  }
  
  // Persistencia
  private saveToLocalStorage(state: AppState): void {
    try {
      localStorage.setItem('app_state', JSON.stringify({
        user: state.user,
        ui: state.ui,
        filters: state.filters
      }));
    } catch (error) {
      this.logger.error('Failed to save state:', error);
    }
  }
  
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('app_state');
      if (stored) {
        const data = JSON.parse(stored);
        this.state.update(s => ({
          ...s,
          user: data.user || null,
          ui: data.ui || s.ui,
          filters: data.filters || s.filters
        }));
        this.logger.info('State loaded from localStorage');
      }
    } catch (error) {
      this.logger.error('Failed to load state:', error);
    }
  }
  
  // Reset
  reset(): void {
    this.state.set({
      user: null,
      tasks: [],
      selectedTaskId: null,
      filters: {
        status: null,
        priority: null,
        searchTerm: ''
      },
      ui: {
        sidebarOpen: true,
        theme: 'light',
        language: 'es'
      }
    });
    localStorage.removeItem('app_state');
    this.logger.info('Store reset to initial state');
  }
}
```

## 🧪 TESTING

### Test para Repository

```typescript
import { TestBed } from '@angular/core/testing';
import { TaskRepository } from './task.repository';

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(TaskRepository);
  });

  it('should create', () => {
    expect(repository).toBeTruthy();
  });

  it('should get all tasks', (done) => {
    repository.getAll().subscribe(tasks => {
      expect(Array.isArray(tasks)).toBe(true);
      done();
    });
  });
});
```

## 🚀 COMANDOS PARA VERIFICACIÓN

```bash
# Compilar proyecto
ng build

# Verificar patrones implementados
grep -r "Repository" src/app/core/patterns/
grep -r "UnitOfWork" src/app/core/patterns/

# Ejecutar tests
ng test --include='**/repositories/**/*.spec.ts'

# Verificar store
grep -r "AppStore" src/app/core/store/
```

## ✅ CHECKLIST LAB 4

- [ ] Repository Pattern implementado correctamente
- [ ] TaskRepository con CRUD completo funcionando
- [ ] Unit of Work con tracking de entidades
- [ ] AppStore con estado global usando Signals
- [ ] Patrones empresariales aplicados
- [ ] Persistencia automática funcionando
- [ ] Effects para logging integrados
- [ ] Tests básicos pasando
- [ ] Aplicación compilando sin errores

## 🎯 ¡Laboratorios Completados!

¡Felicitaciones! Has completado todos los laboratorios de la Sesión 5. Has implementado una arquitectura moderna de Angular con:

- ✅ Servicios reactivos con Signals
- ✅ Componentes Standalone
- ✅ Providers avanzados con InjectionTokens
- ✅ Patrones empresariales (Repository, Unit of Work, Store)
- ✅ Arquitectura escalable y mantenible

¡Estás listo para construir aplicaciones Angular profesionales! 🚀
