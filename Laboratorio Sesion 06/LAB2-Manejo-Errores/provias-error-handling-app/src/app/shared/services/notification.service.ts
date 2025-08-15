import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  private nextId = 1;
  
  // Computed para obtener las notificaciones
  notifications = this.notificationsSignal.asReadonly();
  
  /**
   * Mostrar notificación de éxito
   */
  success(title: string, message: string, duration: number = 4000): void {
    this.addNotification('success', title, message, duration);
  }
  
  /**
   * Mostrar notificación de error
   */
  error(title: string, message: string, duration: number = 6000): void {
    this.addNotification('error', title, message, duration);
  }
  
  /**
   * Mostrar notificación de advertencia
   */
  warning(title: string, message: string, duration: number = 5000): void {
    this.addNotification('warning', title, message, duration);
  }
  
  /**
   * Mostrar notificación informativa
   */
  info(title: string, message: string, duration: number = 4000): void {
    this.addNotification('info', title, message, duration);
  }
  
  /**
   * Eliminar notificación por ID
   */
  remove(id: string): void {
    this.notificationsSignal.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }
  
  /**
   * Limpiar todas las notificaciones
   */
  clear(): void {
    this.notificationsSignal.set([]);
  }
  
  /**
   * Agregar nueva notificación
   */
  private addNotification(
    type: Notification['type'], 
    title: string, 
    message: string, 
    duration?: number
  ): void {
    const notification: Notification = {
      id: `notification-${this.nextId++}`,
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };
    
    // Agregar a la lista
    this.notificationsSignal.update(notifications => [
      ...notifications,
      notification
    ]);
    
    // Auto-eliminar después del tiempo especificado
    if (duration && duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
    
    console.log(`📢 Notification [${type.toUpperCase()}]: ${title} - ${message}`);
  }
}
