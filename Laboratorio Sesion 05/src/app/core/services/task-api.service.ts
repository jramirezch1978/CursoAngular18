import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, catchError, retry, throwError, tap } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../interfaces/task.interface';
import { AppConfig } from '../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${AppConfig.api.baseUrl}/tasks`;
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.getAuthToken()
    })
  };

  constructor() {
    console.log('🌐 TaskApiService initialized with HttpClient');
  }

  getTasks(): Observable<Task[]> {
    console.log('📡 API: Getting all tasks...');
    
    // En desarrollo, simular respuesta de API
    if (AppConfig.app.environment === 'development') {
      return this.getMockTasks().pipe(
        delay(AppConfig.api.retryDelay),
        tap(tasks => console.log('📦 API: Retrieved', tasks.length, 'tasks'))
      );
    }
    
    return this.http.get<Task[]>(this.apiUrl, this.httpOptions)
      .pipe(
        retry(AppConfig.api.retryAttempts),
        tap(tasks => console.log('📦 API: Retrieved', tasks.length, 'tasks')),
        catchError(this.handleError)
      );
  }

  getTask(id: string): Observable<Task> {
    console.log('📡 API: Getting task', id);
    
    if (AppConfig.app.environment === 'development') {
      const mockTasks = this.generateMockTasks();
      const task = mockTasks.find(t => t.id === id);
      if (!task) {
        return throwError(() => new Error('Task not found'));
      }
      return of(task).pipe(
        delay(500),
        tap(task => console.log('📦 API: Retrieved task', task.title))
      );
    }
    
    return this.http.get<Task>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        retry(AppConfig.api.retryAttempts),
        tap(task => console.log('📦 API: Retrieved task', task.title)),
        catchError(this.handleError)
      );
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    console.log('📡 API: Creating task', dto.title);
    
    if (AppConfig.app.environment === 'development') {
      const newTask: Task = {
        id: `api-task-${Date.now()}`,
        ...dto,
        status: 'pending' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        actualHours: 0,
        completionPercentage: 0,
        attachments: [],
        comments: [],
        tags: dto.tags || []
      };
      
      return of(newTask).pipe(
        delay(1000),
        tap(task => console.log('✅ API: Created task', task.title))
      );
    }
    
    return this.http.post<Task>(this.apiUrl, dto, this.httpOptions)
      .pipe(
        tap(task => console.log('✅ API: Created task', task.title)),
        catchError(this.handleError)
      );
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    console.log('📡 API: Updating task', id);
    
    if (AppConfig.app.environment === 'development') {
      // Simular actualización
      const mockTask: Task = {
        id,
        title: dto.title || 'Updated Task',
        description: dto.description || 'Updated description',
        status: dto.status || 'pending' as any,
        priority: dto.priority || 'medium' as any,
        assigneeId: dto.assigneeId || 'user-1',
        projectId: dto.projectId || 'project-1',
        dueDate: dto.dueDate || new Date(),
        createdAt: new Date(Date.now() - 86400000), // 1 día atrás
        updatedAt: new Date(),
        estimatedHours: dto.estimatedHours || 8,
        actualHours: dto.actualHours || 0,
        completionPercentage: dto.completionPercentage || 0,
        attachments: [],
        comments: [],
        tags: []
      };
      
      return of(mockTask).pipe(
        delay(800),
        tap(task => console.log('🔄 API: Updated task', task.title))
      );
    }
    
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, dto, this.httpOptions)
      .pipe(
        tap(task => console.log('🔄 API: Updated task', task.title)),
        catchError(this.handleError)
      );
  }

  deleteTask(id: string): Observable<void> {
    console.log('📡 API: Deleting task', id);
    
    if (AppConfig.app.environment === 'development') {
      return of(void 0).pipe(
        delay(600),
        tap(() => console.log('🗑️ API: Deleted task', id))
      );
    }
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
      .pipe(
        tap(() => console.log('🗑️ API: Deleted task', id)),
        catchError(this.handleError)
      );
  }

  uploadAttachment(taskId: string, file: File): Observable<any> {
    console.log('📡 API: Uploading attachment for task', taskId);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (AppConfig.app.environment === 'development') {
      // Simular upload de archivo
      const mockAttachment = {
        id: `attachment-${Date.now()}`,
        filename: file.name,
        url: `https://api.provias.gob.pe/files/${file.name}`,
        size: file.size,
        uploadedBy: 'current-user',
        uploadedAt: new Date()
      };
      
      return of(mockAttachment).pipe(
        delay(2000), // Simular tiempo de upload
        tap(attachment => console.log('📎 API: Uploaded attachment', attachment.filename))
      );
    }
    
    return this.http.post(
      `${this.apiUrl}/${taskId}/attachments`,
      formData,
      { 
        headers: new HttpHeaders({ 
          'Authorization': 'Bearer ' + this.getAuthToken() 
        }) 
      }
    ).pipe(
      tap(attachment => console.log('📎 API: Uploaded attachment', attachment.filename)),
      catchError(this.handleError)
    );
  }

  // Método adicional para búsqueda de tareas
  searchTasks(query: string): Observable<Task[]> {
    console.log('📡 API: Searching tasks with query:', query);
    
    if (AppConfig.app.environment === 'development') {
      const mockTasks = this.generateMockTasks();
      const filteredTasks = mockTasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase())
      );
      
      return of(filteredTasks).pipe(
        delay(700),
        tap(tasks => console.log('🔍 API: Found', tasks.length, 'tasks matching:', query))
      );
    }
    
    return this.http.get<Task[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, this.httpOptions)
      .pipe(
        retry(AppConfig.api.retryAttempts),
        tap(tasks => console.log('🔍 API: Found', tasks.length, 'tasks')),
        catchError(this.handleError)
      );
  }

  // Método para obtener estadísticas de la API
  getTaskStatistics(): Observable<any> {
    console.log('📡 API: Getting task statistics...');
    
    if (AppConfig.app.environment === 'development') {
      const mockStats = {
        total: 25,
        completed: 8,
        inProgress: 12,
        pending: 5,
        overdue: 3,
        avgCompletionTime: 4.2,
        totalHours: 156
      };
      
      return of(mockStats).pipe(
        delay(600),
        tap(stats => console.log('📊 API: Retrieved statistics', stats))
      );
    }
    
    return this.http.get<any>(`${this.apiUrl}/statistics`, this.httpOptions)
      .pipe(
        retry(AppConfig.api.retryAttempts),
        tap(stats => console.log('📊 API: Retrieved statistics', stats)),
        catchError(this.handleError)
      );
  }

  private getMockTasks(): Observable<Task[]> {
    return of(this.generateMockTasks());
  }

  private getAuthToken(): string {
    // En producción, obtener de un servicio de autenticación
    return localStorage.getItem('auth_token') || 'mock-provias-token-2024';
  }

  private handleError(error: any): Observable<never> {
    console.error('💥 API Error:', error);
    
    let errorMessage = 'Error del servidor';
    if (error.status === 401) {
      errorMessage = 'No autorizado - Token inválido';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar al servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Generar datos mock para desarrollo/demostración
  private generateMockTasks(): Task[] {
    const projects = ['PRY-001', 'PRY-002', 'PRY-003', 'PRY-004'];
    const assignees = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
    const tags = ['backend', 'frontend', 'database', 'api', 'testing', 'documentation', 'security'];
    const priorities = ['low', 'medium', 'high', 'urgent', 'critical'] as const;
    const statuses = ['pending', 'in_progress', 'in_review', 'completed', 'cancelled', 'on_hold'] as const;
    
    const taskTitles = [
      'Implementar autenticación OAuth 2.0',
      'Optimizar consultas de base de datos',
      'Diseñar dashboard de métricas PROVIAS',
      'Corregir bug en formulario de tareas',
      'Actualizar documentación de API',
      'Configurar pipeline CI/CD',
      'Migrar servicios a Angular 18',
      'Implementar sistema de caché Redis',
      'Refactorizar componentes legacy',
      'Crear tests unitarios completos',
      'Integrar sistema de notificaciones',
      'Desarrollar módulo de reportes',
      'Optimizar performance del frontend',
      'Implementar lazy loading avanzado',
      'Configurar monitoreo de aplicación',
      'Desarrollar API para mobile app',
      'Implementar backup automático',
      'Crear sistema de logging centralizado',
      'Desarrollar panel de administración',
      'Integrar pasarela de pagos'
    ];
    
    return Array.from({ length: 20 }, (_, i) => {
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      return {
        id: `api-task-${i + 1}`,
        title: taskTitles[i] || `Tarea API ${i + 1}`,
        description: `Descripción detallada de la tarea ${i + 1} generada desde TaskApiService para demostración`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        assigneeId: assignees[Math.floor(Math.random() * assignees.length)],
        projectId: projects[Math.floor(Math.random() * projects.length)],
        dueDate,
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        tags: tags.slice(0, Math.floor(Math.random() * 4) + 1),
        estimatedHours: Math.floor(Math.random() * 40) + 8,
        actualHours: Math.floor(Math.random() * 30),
        completionPercentage: Math.floor(Math.random() * 101),
        attachments: [],
        comments: []
      } as Task;
    });
  }
}
