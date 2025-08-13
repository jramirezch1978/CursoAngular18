import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskStateService } from '../../core/services/task-state.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  // Demostración de inject() para servicios y router
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskStateService);
  private readonly notificationService = inject(NotificationService);

  // Signals para badges y contadores
  taskCount = this.taskService.statistics;
  notificationCount = this.notificationService.notifications;

  // Navegación de la aplicación
  navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Métricas y estadísticas',
      badge: () => this.taskService.urgentTasks().length
    },
    {
      path: '/task-list',
      label: 'Lista de Tareas',
      icon: '📋',
      description: 'Gestión de tareas',
      badge: () => this.taskService.tasks().length
    },
    {
      path: '/task-form',
      label: 'Crear Tarea',
      icon: '📝',
      description: 'Formulario de nuevas tareas',
      badge: () => null
    },
    {
      path: '/notifications',
      label: 'Notificaciones',
      icon: '🔔',
      description: 'Centro de notificaciones',
      badge: () => this.notificationService.notifications().length
    }
  ];

  isActiveRoute(path: string): boolean {
    return this.router.url === path;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  // Método de demostración para mostrar navegación reactiva
  showNavigationDemo() {
    this.notificationService.info(
      '🚀 Navegación Reactiva',
      'Los badges se actualizan automáticamente con Signals'
    );
  }
}
