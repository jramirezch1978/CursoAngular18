import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStateService } from '../../core/services/task-state.service';
import { TaskApiService } from '../../core/services/task-api.service';
import { NotificationService } from '../../shared/services/notification.service';
import { TaskStatus, TaskPriority } from '../../core/interfaces/task.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Demostración de inject() - Nueva forma de inyección en Angular
  private readonly taskService = inject(TaskStateService);
  private readonly taskApiService = inject(TaskApiService);
  private readonly notificationService = inject(NotificationService);

  // Signals del servicio - Estado reactivo
  tasks = this.taskService.tasks;
  statistics = this.taskService.statistics;
  urgentTasks = this.taskService.urgentTasks;
  loading = this.taskService.loading;

  // Computed signals avanzados - Cálculos reactivos automáticos
  completionRate = computed(() => {
    const stats = this.statistics();
    if (stats.total === 0) return 0;
    return Math.round((stats.byStatus[TaskStatus.COMPLETED] / stats.total) * 100);
  });

  productivityScore = computed(() => {
    const stats = this.statistics();
    const completed = stats.byStatus[TaskStatus.COMPLETED] || 0;
    const inProgress = stats.byStatus[TaskStatus.IN_PROGRESS] || 0;
    const overdue = stats.overdue;
    
    // Fórmula de productividad: (completadas * 2 + en progreso) - tareas vencidas
    return Math.max(0, (completed * 2 + inProgress) - overdue);
  });

  riskLevel = computed(() => {
    const stats = this.statistics();
    const urgent = stats.byPriority[TaskPriority.URGENT] || 0;
    const critical = stats.byPriority[TaskPriority.CRITICAL] || 0;
    const overdue = stats.overdue;
    
    const riskScore = (critical * 3) + (urgent * 2) + overdue;
    
    if (riskScore >= 10) return { level: 'ALTO', color: 'danger' };
    if (riskScore >= 5) return { level: 'MEDIO', color: 'warning' };
    return { level: 'BAJO', color: 'success' };
  });

  averageHoursPerTask = computed(() => {
    const stats = this.statistics();
    if (stats.total === 0) return 0;
    return Math.round(stats.totalEstimatedHours / stats.total * 10) / 10;
  });

  progressTrend = computed(() => {
    const stats = this.statistics();
    const completedThisWeek = stats.completedThisWeek;
    const inProgress = stats.byStatus[TaskStatus.IN_PROGRESS] || 0;
    
    if (completedThisWeek > inProgress) return { trend: 'POSITIVA', icon: '📈' };
    if (completedThisWeek < inProgress) return { trend: 'NECESITA ATENCIÓN', icon: '📉' };
    return { trend: 'ESTABLE', icon: '➡️' };
  });

  // Enums para el template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  ngOnInit() {
    console.log('📊 Dashboard inicializado con Signals reactivos');
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.taskService.loadTasks();
    this.notificationService.info('Dashboard actualizado', 'Datos cargados exitosamente');
  }

  refreshDashboard() {
    this.loadDashboardData();
    this.notificationService.success('¡Actualizado!', 'Dashboard refrescado con nuevos datos');
  }

  exportData() {
    const data = {
      statistics: this.statistics(),
      completionRate: this.completionRate(),
      productivityScore: this.productivityScore(),
      riskLevel: this.riskLevel(),
      exportDate: new Date().toISOString()
    };
    
    console.log('📤 Datos exportados:', data);
    this.notificationService.success('Datos exportados', 'Revisa la consola para ver los datos');
  }

  // Método para demostrar cómo los signals se actualizan automáticamente
  simulateChanges() {
    this.notificationService.info('Simulando cambios', 'Observa cómo se actualizan automáticamente las estadísticas');
    
    // Simular agregar una tarea
    setTimeout(() => {
      this.taskService.addTask({
        title: 'Tarea de demostración',
        description: 'Esta tarea demuestra la reactividad de los signals',
        priority: TaskPriority.HIGH,
        assigneeId: 'demo-user',
        projectId: 'demo-project',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        estimatedHours: 4
      });
      this.notificationService.success('Tarea agregada', 'Observa cómo se actualizaron las estadísticas automáticamente');
    }, 1000);
  }

  // Método para demostrar TaskApiService
  loadTasksFromApi() {
    this.notificationService.info('🌐 Cargando desde API', 'Demonstrando TaskApiService con HttpClient');
    
    this.taskApiService.getTasks().subscribe({
      next: (apiTasks) => {
        console.log('📦 Tareas cargadas desde API:', apiTasks);
        this.notificationService.success(
          '✅ API Response',
          `Se cargaron ${apiTasks.length} tareas desde TaskApiService`
        );
      },
      error: (error) => {
        console.error('💥 Error de API:', error);
        this.notificationService.error('❌ Error de API', error.message);
      }
    });
  }

  // Método para demostrar búsqueda con API
  searchTasksWithApi() {
    const searchTerm = 'OAuth';
    this.notificationService.info('🔍 Buscando tareas', `Buscando: "${searchTerm}"`);
    
    this.taskApiService.searchTasks(searchTerm).subscribe({
      next: (foundTasks) => {
        console.log('🔍 Resultados de búsqueda:', foundTasks);
        this.notificationService.success(
          '🔍 Búsqueda completada',
          `Se encontraron ${foundTasks.length} tareas con "${searchTerm}"`
        );
      },
      error: (error) => {
        this.notificationService.error('❌ Error en búsqueda', error.message);
      }
    });
  }

  // Método para demostrar estadísticas de API
  getApiStatistics() {
    this.notificationService.info('📊 Obteniendo estadísticas', 'Consultando estadísticas desde API');
    
    this.taskApiService.getTaskStatistics().subscribe({
      next: (stats) => {
        console.log('📊 Estadísticas de API:', stats);
        this.notificationService.success(
          '📊 Estadísticas obtenidas',
          `Total: ${stats.total}, Completadas: ${stats.completed}`
        );
      },
      error: (error) => {
        this.notificationService.error('❌ Error en estadísticas', error.message);
      }
    });
  }

  getStatusColor(status: TaskStatus): string {
    const colors = {
      [TaskStatus.PENDING]: '#ffc107',
      [TaskStatus.IN_PROGRESS]: '#17a2b8',
      [TaskStatus.IN_REVIEW]: '#6c757d',
      [TaskStatus.COMPLETED]: '#28a745',
      [TaskStatus.CANCELLED]: '#dc3545',
      [TaskStatus.ON_HOLD]: '#6f42c1'
    };
    return colors[status];
  }

  getPriorityColor(priority: TaskPriority): string {
    const colors = {
      [TaskPriority.LOW]: '#28a745',
      [TaskPriority.MEDIUM]: '#ffc107',
      [TaskPriority.HIGH]: '#fd7e14',
      [TaskPriority.URGENT]: '#dc3545',
      [TaskPriority.CRITICAL]: '#721c24'
    };
    return colors[priority];
  }
}
