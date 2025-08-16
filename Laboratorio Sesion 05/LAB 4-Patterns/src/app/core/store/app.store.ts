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
    user: {
      id: 'user-1',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@provias.gob.pe',
      role: 'Administrador'
    },
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
    const stats = {
      total: tasks.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      critical: 0,
      urgent: 0
    };
    
    tasks.forEach(task => {
      switch(task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.inProgress++;
          break;
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
      }
      
      switch(task.priority) {
        case TaskPriority.CRITICAL:
          stats.critical++;
          break;
        case TaskPriority.URGENT:
          stats.urgent++;
          break;
      }
    });
    
    return stats;
  });
  
  ui = computed(() => this.state().ui);
  filters = computed(() => this.state().filters);
  
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
      tasks: s.tasks.filter(t => t.id !== taskId),
      selectedTaskId: s.selectedTaskId === taskId ? null : s.selectedTaskId
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
      localStorage.setItem('app_state_lab4', JSON.stringify({
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
      const stored = localStorage.getItem('app_state_lab4');
      if (stored) {
        const data = JSON.parse(stored);
        this.state.update(s => ({
          ...s,
          user: data.user || s.user,
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
    localStorage.removeItem('app_state_lab4');
    this.logger.info('Store reset to initial state');
  }
}
