import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { 
  Task, 
  TaskFilters, 
  TaskStatistics, 
  TaskManagerState,
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskViewConfig
} from '../../models/task.interface';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.scss'
})
export class TaskManagerComponent implements OnInit, OnDestroy {
  
  // 📊 Observables del servicio
  tasks$: Observable<Task[]>;
  filteredTasks$: Observable<Task[]>;
  statistics$: Observable<TaskStatistics>;
  state$: Observable<TaskManagerState>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  // 🔍 Control de búsqueda con debounce
  private searchSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchSubject.asObservable();

  // 🎛️ Configuración local
  searchTerm = '';
  selectedType: TaskType | 'all' = 'all';
  selectedPriority: TaskPriority | 'all' = 'all';
  selectedStatus: TaskStatus | 'all' = 'all';
  selectedRegion = 'all';
  showCompletedTasks = true;
  viewMode: 'list' | 'grid' | 'kanban' = 'list';
  sortBy: keyof Task = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // 📱 Estado de la UI
  isFilterPanelOpen = false;
  selectedTaskIds: number[] = [];
  currentPage = 1;
  itemsPerPage = 20;

  // 📋 Opciones para filtros
  taskTypes: Array<{value: TaskType | 'all', label: string}> = [
    { value: 'all', label: 'Todos los Tipos' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'supervision', label: 'Supervisión' },
    { value: 'presupuesto', label: 'Presupuesto' },
    { value: 'equipos', label: 'Equipos' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'documentacion', label: 'Documentación' },
    { value: 'inspeccion', label: 'Inspección' }
  ];

  taskPriorities: Array<{value: TaskPriority | 'all', label: string, color: string}> = [
    { value: 'all', label: 'Todas las Prioridades', color: '#6b7280' },
    { value: 'baja', label: 'Baja', color: '#10b981' },
    { value: 'media', label: 'Media', color: '#3b82f6' },
    { value: 'alta', label: 'Alta', color: '#f59e0b' },
    { value: 'critica', label: 'Crítica', color: '#ef4444' },
    { value: 'urgente', label: 'Urgente', color: '#dc2626' }
  ];

  taskStatuses: Array<{value: TaskStatus | 'all', label: string, color: string}> = [
    { value: 'all', label: 'Todos los Estados', color: '#6b7280' },
    { value: 'pendiente', label: 'Pendiente', color: '#9ca3af' },
    { value: 'en-progreso', label: 'En Progreso', color: '#3b82f6' },
    { value: 'en-revision', label: 'En Revisión', color: '#f59e0b' },
    { value: 'pausada', label: 'Pausada', color: '#ef4444' },
    { value: 'completada', label: 'Completada', color: '#10b981' },
    { value: 'cancelada', label: 'Cancelada', color: '#6b7280' },
    { value: 'vencida', label: 'Vencida', color: '#dc2626' }
  ];

  regions = [
    { value: 'all', label: 'Todas las Regiones' },
    { value: 'Lima', label: 'Lima' },
    { value: 'La Libertad', label: 'La Libertad' },
    { value: 'Arequipa', label: 'Arequipa' },
    { value: 'Cusco', label: 'Cusco' },
    { value: 'Piura', label: 'Piura' },
    { value: 'Junín', label: 'Junín' },
    { value: 'Loreto', label: 'Loreto' },
    { value: 'San Martín', label: 'San Martín' }
  ];

  // 🗑️ Cleanup
  private destroy$ = new Subject<void>();

  constructor(private taskService: TaskService) {
    // Inicializar observables
    this.tasks$ = this.taskService.tasks$;
    this.filteredTasks$ = this.taskService.filteredTasks$;
    this.statistics$ = this.taskService.statistics$;
    this.state$ = this.taskService.state$;
    this.loading$ = this.taskService.loading$;
    this.error$ = this.taskService.error$;
  }

  ngOnInit(): void {
    console.log('📋 TaskManagerComponent inicializado');
    
    // Configurar búsqueda con debounce
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.taskService.updateSearch(searchTerm);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔍 Métodos de búsqueda y filtrado
  onSearchChange(): void {
    console.log(`🔍 Búsqueda: "${this.searchTerm}"`);
    this.searchSubject.next(this.searchTerm);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('🔍 Búsqueda ejecutada con Enter');
    }
    
    if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
    console.log('🧹 Búsqueda limpiada');
  }

  onTypeChange(): void {
    const type = this.selectedType === 'all' ? undefined : this.selectedType;
    this.taskService.updateFilters({ type });
    console.log(`📂 Tipo filtrado: ${this.selectedType}`);
  }

  onPriorityChange(): void {
    const priority = this.selectedPriority === 'all' ? undefined : this.selectedPriority;
    this.taskService.updateFilters({ priority });
    console.log(`⚡ Prioridad filtrada: ${this.selectedPriority}`);
  }

  onStatusChange(): void {
    const status = this.selectedStatus === 'all' ? undefined : this.selectedStatus;
    this.taskService.updateFilters({ status });
    console.log(`📊 Estado filtrado: ${this.selectedStatus}`);
  }

  onRegionChange(): void {
    const region = this.selectedRegion === 'all' ? undefined : this.selectedRegion;
    this.taskService.updateFilters({ region });
    console.log(`🗺️ Región filtrada: ${this.selectedRegion}`);
  }

  onShowCompletedChange(): void {
    this.taskService.updateViewConfig({ showCompletedTasks: this.showCompletedTasks });
    console.log(`✅ Mostrar completadas: ${this.showCompletedTasks}`);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'all';
    this.selectedPriority = 'all';
    this.selectedStatus = 'all';
    this.selectedRegion = 'all';
    this.showCompletedTasks = true;
    
    this.searchSubject.next('');
    this.taskService.clearFilters();
    this.taskService.updateViewConfig({ showCompletedTasks: true });
    
    console.log('🔄 Todos los filtros reiniciados');
  }

  // 📊 Métodos de vista
  toggleViewMode(): void {
    const modes: Array<'list' | 'grid' | 'kanban'> = ['list', 'grid', 'kanban'];
    const currentIndex = modes.indexOf(this.viewMode);
    this.viewMode = modes[(currentIndex + 1) % modes.length];
    
    this.taskService.updateViewConfig({ viewMode: this.viewMode });
    console.log(`👁️ Modo de vista: ${this.viewMode}`);
  }

  changeSortBy(field: keyof Task): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    
    this.taskService.updateViewConfig({ 
      sortBy: this.sortBy, 
      sortDirection: this.sortDirection 
    });
    
    console.log(`🔤 Ordenar por: ${this.sortBy} (${this.sortDirection})`);
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
    console.log(`🎛️ Panel de filtros: ${this.isFilterPanelOpen ? 'abierto' : 'cerrado'}`);
  }

  // 📝 Métodos de gestión de tareas
  selectTask(taskId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.selectedTaskIds.push(taskId);
    } else {
      this.selectedTaskIds = this.selectedTaskIds.filter(id => id !== taskId);
    }
    
    console.log(`📌 Tareas seleccionadas: ${this.selectedTaskIds.length}`);
  }

  selectAllTasks(tasks: Task[], event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.selectedTaskIds = tasks.map(task => task.id);
    } else {
      this.selectedTaskIds = [];
    }
    
    console.log(`📌 Selección masiva: ${this.selectedTaskIds.length} tareas`);
  }

  updateTaskStatus(taskId: number, newStatus: TaskStatus): void {
    this.taskService.updateTask(taskId, { status: newStatus }).subscribe(
      updatedTask => {
        if (updatedTask) {
          console.log(`📊 Estado actualizado: ${updatedTask.title} -> ${newStatus}`);
        }
      }
    );
  }

  updateTaskProgress(taskId: number, newProgress: number): void {
    this.taskService.updateTask(taskId, { progress: newProgress }).subscribe(
      updatedTask => {
        if (updatedTask) {
          console.log(`📈 Progreso actualizado: ${updatedTask.title} -> ${newProgress}%`);
        }
      }
    );
  }

  deleteSelectedTasks(): void {
    if (this.selectedTaskIds.length === 0) return;
    
    const confirmMessage = `¿Está seguro de eliminar ${this.selectedTaskIds.length} tarea(s)?`;
    
    if (confirm(confirmMessage)) {
      this.selectedTaskIds.forEach(taskId => {
        this.taskService.deleteTask(taskId).subscribe();
      });
      
      this.selectedTaskIds = [];
      console.log('🗑️ Tareas seleccionadas eliminadas');
    }
  }

  // 🎨 Métodos de presentación y utilidad
  getTaskTypeIcon(type: TaskType): string {
    const icons = {
      'construccion': '🏗️',
      'mantenimiento': '🔧',
      'supervision': '👁️',
      'presupuesto': '💰',
      'equipos': '🚜',
      'seguridad': '🦺',
      'documentacion': '📄',
      'inspeccion': '🔍'
    };
    return icons[type] || '📋';
  }

  getPriorityColor(priority: TaskPriority): string {
    const priorityConfig = this.taskPriorities.find(p => p.value === priority);
    return priorityConfig?.color || '#6b7280';
  }

  getStatusColor(status: TaskStatus): string {
    const statusConfig = this.taskStatuses.find(s => s.value === status);
    return statusConfig?.color || '#6b7280';
  }

  getProgressColor(progress: number): string {
    if (progress >= 90) return '#10b981'; // Verde
    if (progress >= 70) return '#3b82f6'; // Azul
    if (progress >= 40) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  }

  isOverdue(dueDate: Date, status: TaskStatus): boolean {
    if (status === 'completada' || status === 'cancelada') return false;
    return new Date(dueDate) < new Date();
  }

  getDaysUntilDue(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTaskClasses(task: Task): { [key: string]: boolean } {
    return {
      'task-card': true,
      'task-selected': this.selectedTaskIds.includes(task.id),
      'task-overdue': this.isOverdue(task.dueDate, task.status),
      'task-high-priority': task.priority === 'critica' || task.priority === 'urgente',
      'task-completed': task.status === 'completada',
      'task-paused': task.status === 'pausada',
      [`task-${task.type}`]: true,
      [`task-${task.status}`]: true,
      [`task-${task.priority}`]: true
    };
  }

  // 📊 Track functions para performance
  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  trackByValue(index: number, item: any): any {
    return item.value || item;
  }

  // 📄 Métodos de paginación
  get paginatedTasks(): Observable<Task[]> {
    return this.filteredTasks$.pipe(
      takeUntil(this.destroy$)
    );
  }

  changePage(page: number): void {
    this.currentPage = page;
    console.log(`📄 Página: ${page}`);
  }

  // 🔄 Métodos de actualización
  refreshTasks(): void {
    console.log('🔄 Refrescando tareas...');
    // En una aplicación real, esto recargaría los datos del servidor
    location.reload();
  }

  // 📊 Métodos de estadísticas
  getCompletionPercentage(stats: TaskStatistics): number {
    return stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  }

  getBudgetUtilization(stats: TaskStatistics): number {
    return stats.budgetTotal > 0 ? (stats.budgetUsed / stats.budgetTotal) * 100 : 0;
  }

  // 📱 Responsive helpers
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  get isTablet(): boolean {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }

  get isDesktop(): boolean {
    return window.innerWidth >= 1024;
  }

  // 🎯 Formatters
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-PE').format(value);
  }

  // 📅 Método para obtener fecha actual
  getCurrentTime(): Date {
    return new Date();
  }

  // 🔧 Métodos auxiliares para template
  getAbsoluteDays(days: number): number {
    return Math.abs(days);
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId).subscribe(
      success => {
        if (success) {
          console.log(`🗑️ Tarea eliminada: ${taskId}`);
        }
      }
    );
  }

  getTasksByStatus(tasks: Task[], status: string): Task[] {
    if (status === 'all') return tasks;
    return tasks.filter(task => task.status === status);
  }

  getRegionKeys(byRegion: { [region: string]: number }): string[] {
    return Object.keys(byRegion);
  }
}