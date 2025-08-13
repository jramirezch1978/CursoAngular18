import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../shared/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  // Demostración de inject() para servicios
  private readonly notificationService = inject(NotificationService);

  // Signals del servicio - Estado reactivo
  notifications = this.notificationService.notifications;
  hasNotifications = this.notificationService.hasNotifications;

  ngOnInit() {
    console.log('🔔 NotificationsComponent inicializado con inject()');
  }

  removeNotification(id: string) {
    this.notificationService.remove(id);
  }

  clearAll() {
    this.notificationService.clear();
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

  getNotificationClass(type: string): string {
    return `notification-${type}`;
  }

  // Métodos de demostración para estudiantes
  showDemoNotifications() {
    // Simular diferentes tipos de notificaciones
    setTimeout(() => {
      this.notificationService.success('¡Operación exitosa!', 'Los datos se guardaron correctamente');
    }, 500);

    setTimeout(() => {
      this.notificationService.info('Información importante', 'Nueva actualización disponible');
    }, 1000);

    setTimeout(() => {
      this.notificationService.warning('Advertencia', 'El sistema será reiniciado en 10 minutos');
    }, 1500);

    setTimeout(() => {
      this.notificationService.show({
        type: 'info',
        title: 'Notificación con acción',
        message: 'Haz clic en el botón para realizar una acción',
        duration: 0, // No auto-dismiss
        action: {
          label: 'Ejecutar',
          callback: () => {
            this.notificationService.success('¡Acción ejecutada!', 'La acción se completó exitosamente');
          }
        }
      });
    }, 2000);

    setTimeout(() => {
      this.notificationService.error('Error del sistema', 'No se pudo conectar con el servidor');
    }, 2500);
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  }
}
