import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { NotificationService, Notification } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LAB 1 - Servicios con Signals - PROVIAS';
  
  // Demostración de inject() en el componente raíz
  private readonly notificationService = inject(NotificationService);
  
  // Signals para notificaciones globales (toasts)
  notifications = this.notificationService.notifications;

  ngOnInit() {
    console.log('🚀 LAB 1 - PROVIAS iniciado con Angular + Signals');
    
    // Notificación de bienvenida
    setTimeout(() => {
      this.notificationService.success(
        '¡Bienvenido al LAB 1!',
        'Sistema de gestión de tareas con Signals e inject()'
      );
    }, 1000);
  }

  removeNotification(id: string) {
    this.notificationService.remove(id);
  }

  executeAction(notification: Notification) {
    if (notification.action) {
      notification.action.callback();
      this.removeNotification(notification.id);
    }
  }

  getNotificationIcon(type: string): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }
}
