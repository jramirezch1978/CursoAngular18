import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, delay } from 'rxjs';
import { Repository } from '../patterns/repository.pattern';
import { Task, TaskStatus, TaskPriority, TaskComment } from '../interfaces/task.interface';
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
    const statuses = Object.values(TaskStatus);
    const priorities = Object.values(TaskPriority);
    const projects = ['PRY-001', 'PRY-002', 'PRY-003', 'PRY-004'];
    const tags = ['frontend', 'backend', 'database', 'testing', 'deployment', 'bug', 'feature'];
    const titles = [
      'Implementar autenticación OAuth',
      'Optimizar consultas de base de datos',
      'Crear dashboard de analytics',
      'Migrar a nueva versión de Angular',
      'Implementar sistema de notificaciones',
      'Refactorizar módulo de pagos',
      'Añadir tests unitarios',
      'Documentar API REST',
      'Configurar CI/CD pipeline',
      'Resolver bugs críticos en producción'
    ];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i + 1}`,
      title: titles[i],
      description: `Descripción detallada de: ${titles[i]}. Esta tarea requiere atención especial y debe completarse según los estándares establecidos.`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assigneeId: `user-${(i % 4) + 1}`,
      projectId: projects[i % projects.length],
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      tags: this.getRandomTags(tags, Math.floor(Math.random() * 3) + 1),
      estimatedHours: Math.floor(Math.random() * 40) + 8,
      actualHours: Math.floor(Math.random() * 20),
      completionPercentage: Math.floor(Math.random() * 100),
      attachments: [],
      comments: this.generateMockComments(Math.floor(Math.random() * 3))
    }));
  }
  
  private getRandomTags(allTags: string[], count: number): string[] {
    const shuffled = [...allTags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  private generateMockComments(count: number): TaskComment[] {
    const comments = [
      'Necesitamos revisar los requisitos con el cliente',
      'He actualizado la documentación',
      'Encontré un edge case que debemos considerar',
      'Todo listo para revisión',
      'Necesito más información sobre este punto'
    ];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `comment-${Date.now()}-${i}`,
      text: comments[Math.floor(Math.random() * comments.length)],
      authorId: `user-${Math.floor(Math.random() * 4) + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
  }
}
