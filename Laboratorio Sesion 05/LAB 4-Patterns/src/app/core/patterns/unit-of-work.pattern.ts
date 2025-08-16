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
