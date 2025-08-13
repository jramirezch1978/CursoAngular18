import { Injectable, signal, computed, effect } from '@angular/core';
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
