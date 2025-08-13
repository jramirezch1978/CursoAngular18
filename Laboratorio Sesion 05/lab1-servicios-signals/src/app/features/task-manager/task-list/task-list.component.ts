import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskStateService } from '../../../core/services/task-state.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TaskStatus, TaskPriority, TaskFilter } from '../../../core/interfaces/task.interface';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  
  // Inyección con inject() en lugar de constructor
  private readonly taskService = inject(TaskStateService);
  private readonly notificationService = inject(NotificationService);
  
  // Signals del servicio
  tasks = this.taskService.filteredTasks;
  loading = this.taskService.loading;
  error = this.taskService.error;
  statistics = this.taskService.statistics;
  urgentTasks = this.taskService.urgentTasks;
  
  // Signals locales para UI
  viewMode = signal<'grid' | 'list' | 'kanban'>('grid');
  selectedStatuses = signal<TaskStatus[]>([]);
  selectedPriorities = signal<TaskPriority[]>([]);
  searchTerm = signal('');
  showFilters = signal(true);
  showStatistics = signal(true);
  
  // Computed para filtros activos
  activeFilter = computed((): TaskFilter => ({
    status: this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
    priority: this.selectedPriorities().length > 0 ? this.selectedPriorities() : undefined,
    searchTerm: this.searchTerm() || undefined
  }));
  
  hasActiveFilters = computed(() => {
    const filter = this.activeFilter();
    return !!(filter.status?.length || filter.priority?.length || filter.searchTerm);
  });
  
  // Enums para el template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  
  // Arrays para selects
  allStatuses = Object.values(TaskStatus);
  allPriorities = Object.values(TaskPriority);
  
  ngOnInit(): void {
    console.log('TaskListComponent initialized with inject()');
    this.loadTasks();
  }
  
  loadTasks(): void {
    this.taskService.loadTasks();
    this.notificationService.info('Cargando tareas', 'Por favor espere...');
  }
  
  applyFilters(): void {
    this.taskService.updateFilter(this.activeFilter());
    
    if (this.hasActiveFilters()) {
      const taskCount = this.tasks().length;
      this.notificationService.success(
        'Filtros aplicados',
        `Mostrando ${taskCount} tareas`
      );
    }
  }
  
  clearFilters(): void {
    this.selectedStatuses.set([]);
    this.selectedPriorities.set([]);
    this.searchTerm.set('');
    this.applyFilters();
  }
  
  toggleStatus(status: TaskStatus): void {
    this.selectedStatuses.update(current => {
      const index = current.indexOf(status);
      if (index > -1) {
        return current.filter(s => s !== status);
      }
      return [...current, status];
    });
    this.applyFilters();
  }
  
  togglePriority(priority: TaskPriority): void {
    this.selectedPriorities.update(current => {
      const index = current.indexOf(priority);
      if (index > -1) {
        return current.filter(p => p !== priority);
      }
      return [...current, priority];
    });
    this.applyFilters();
  }
  
  onSearchTermChange(): void {
    this.applyFilters();
  }
  
  changeViewMode(mode: 'grid' | 'list' | 'kanban'): void {
    this.viewMode.set(mode);
  }
  
  selectTask(taskId: string): void {
    this.taskService.selectTask(taskId);
  }
  
  updateTaskStatus(taskId: string, status: TaskStatus): void {
    this.taskService.changeTaskStatus(taskId, status);
    this.notificationService.success('Estado actualizado', `Tarea movida a ${status}`);
  }
  
  updateProgress(taskId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const percentage = parseInt(target.value);
    this.taskService.updateProgress(taskId, percentage);
  }
  
  deleteTask(taskId: string): void {
    if (confirm('¿Está seguro de eliminar esta tarea?')) {
      this.taskService.deleteTask(taskId);
      this.notificationService.warning('Tarea eliminada');
    }
  }
  
  getStatusClass(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]: 'status-pending',
      [TaskStatus.IN_PROGRESS]: 'status-progress',
      [TaskStatus.IN_REVIEW]: 'status-review',
      [TaskStatus.COMPLETED]: 'status-completed',
      [TaskStatus.CANCELLED]: 'status-cancelled',
      [TaskStatus.ON_HOLD]: 'status-hold'
    };
    return classes[status];
  }
  
  getPriorityClass(priority: TaskPriority): string {
    const classes: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: 'priority-low',
      [TaskPriority.MEDIUM]: 'priority-medium',
      [TaskPriority.HIGH]: 'priority-high',
      [TaskPriority.URGENT]: 'priority-urgent',
      [TaskPriority.CRITICAL]: 'priority-critical'
    };
    return classes[priority];
  }
  
  getPriorityIcon(priority: TaskPriority): string {
    const icons: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: '🟢',
      [TaskPriority.MEDIUM]: '🟡',
      [TaskPriority.HIGH]: '🟠',
      [TaskPriority.URGENT]: '🔴',
      [TaskPriority.CRITICAL]: '🚨'
    };
    return icons[priority];
  }
}
