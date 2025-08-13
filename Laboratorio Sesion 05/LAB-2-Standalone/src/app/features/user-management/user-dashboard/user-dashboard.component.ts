import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MetricsService } from '../services/metrics.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  // Servicios inyectados con inject()
  private userService = inject(UserService);
  private metricsService = inject(MetricsService);
  private notificationService = inject(NotificationService);
  
  // Signals del servicio
  users = this.userService.users;
  loading = this.userService.loading;
  metrics = this.metricsService.metrics;
  departmentMetrics = this.metricsService.departmentMetrics;
  trends = this.metricsService.trends;
  usersByRole = this.userService.usersByRole;
  
  // Signals locales
  selectedPeriod = signal<'day' | 'week' | 'month' | 'year'>('month');
  showChart = signal(true);
  selectedDepartment = signal<string | null>(null);
  viewMode = signal<'grid' | 'table'>('grid');
  
  // Computed para datos del gráfico
  chartData = computed(() => {
    const metrics = this.metrics();
    const period = this.selectedPeriod();
    
    return this.prepareChartData(metrics, period);
  });

  // Computed para usuarios filtrados
  filteredUsers = computed(() => {
    const users = this.users();
    const selectedDept = this.selectedDepartment();
    
    if (!selectedDept) return users;
    
    return users.filter(user => user.department === selectedDept);
  });

  // Array de departamentos para el selector
  departments = computed(() => {
    const deptMap = this.userService.usersByDepartment();
    return Array.from(deptMap.keys()).sort();
  });
  
  constructor() {
    // Effect para logging
    effect(() => {
      const userCount = this.users().length;
      console.log(`📊 Dashboard: ${userCount} usuarios cargados`);
    });

    // Effect para notificaciones automáticas
    effect(() => {
      const metrics = this.metrics();
      if (metrics.totalUsers > 0) {
        const inactivePercentage = (metrics.inactiveUsers / metrics.totalUsers) * 100;
        if (inactivePercentage > 20) {
          this.notificationService.warning(
            'Alto porcentaje de usuarios inactivos',
            `${Math.round(inactivePercentage)}% de usuarios están inactivos`
          );
        }
      }
    });
  }
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.notificationService.info('Cargando usuarios', 'Obteniendo datos del servidor...');
    
    this.userService.loadUsers().subscribe({
      next: () => {
        this.notificationService.success('Usuarios cargados', 'Datos actualizados correctamente');
        console.log('✅ Usuarios cargados exitosamente');
      },
      error: (err) => {
        this.notificationService.error('Error al cargar usuarios', err.message);
        console.error('❌ Error cargando usuarios:', err);
      }
    });
  }
  
  changePeriod(period: 'day' | 'week' | 'month' | 'year'): void {
    this.selectedPeriod.set(period);
    this.notificationService.info('Período actualizado', `Mostrando datos de: ${period}`);
  }

  selectDepartment(department: string | null): void {
    this.selectedDepartment.set(department);
    const message = department 
      ? `Filtrando por: ${department}` 
      : 'Mostrando todos los departamentos';
    this.notificationService.info('Filtro aplicado', message);
  }

  changeViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  selectUser(userId: string): void {
    this.userService.selectUser(userId);
    const user = this.userService.selectedUser();
    if (user) {
      this.notificationService.info('Usuario seleccionado', `${user.name} - ${user.role}`);
    }
  }

  toggleUserStatus(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      this.userService.updateUser(userId, { active: !user.active });
      const status = !user.active ? 'activado' : 'desactivado';
      this.notificationService.success('Estado actualizado', `Usuario ${status}`);
    }
  }

  deleteUser(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user && confirm(`¿Está seguro de eliminar a ${user.name}?`)) {
      this.userService.deleteUser(userId);
      this.notificationService.warning('Usuario eliminado', `${user.name} fue eliminado del sistema`);
    }
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      admin: '👑',
      manager: '👔',
      developer: '💻',
      viewer: '👁️'
    };
    return icons[role] || '👤';
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      admin: '#dc3545',
      manager: '#fd7e14',
      developer: '#20c997',
      viewer: '#6f42c1'
    };
    return colors[role] || '#6c757d';
  }

  getDepartmentColor(department: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const index = department.charCodeAt(0) % colors.length;
    return colors[index];
  }
  
  private prepareChartData(metrics: any, period: string): any {
    // Lógica de preparación de datos para gráficos
    return {
      labels: this.getLabelsForPeriod(period),
      datasets: [{
        label: 'Usuarios Activos',
        data: this.getDataForPeriod(metrics, period),
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2
      }]
    };
  }
  
  private getLabelsForPeriod(period: string): string[] {
    switch (period) {
      case 'day': return ['00:00', '06:00', '12:00', '18:00', '24:00'];
      case 'week': return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      case 'month': return ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      case 'year': return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      default: return [];
    }
  }
  
  private getDataForPeriod(metrics: any, period: string): number[] {
    // Datos simulados basados en métricas
    const base = metrics.activeUsers || 0;
    switch (period) {
      case 'day': return [base * 0.6, base * 0.8, base, base * 0.9, base * 0.7];
      case 'week': return Array(7).fill(0).map(() => base + Math.random() * 10);
      case 'month': return Array(4).fill(0).map(() => base + Math.random() * 20);
      case 'year': return Array(12).fill(0).map(() => base + Math.random() * 30);
      default: return [];
    }
  }
}
