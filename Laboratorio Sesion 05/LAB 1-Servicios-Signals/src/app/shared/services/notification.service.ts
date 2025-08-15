import { Injectable, signal, computed } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  
  notifications = computed(() => this.notificationsSignal());
  hasNotifications = computed(() => this.notificationsSignal().length > 0);
  
  show(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      duration: notification.duration || 5000
    };
    
    this.notificationsSignal.update(current => [...current, newNotification]);
    
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, newNotification.duration);
    }
  }
  
  success(title: string, message?: string): void {
    this.show({ type: 'success', title, message });
  }
  
  error(title: string, message?: string): void {
    this.show({ type: 'error', title, message, duration: 0 });
  }
  
  warning(title: string, message?: string): void {
    this.show({ type: 'warning', title, message });
  }
  
  info(title: string, message?: string): void {
    this.show({ type: 'info', title, message });
  }
  
  remove(id: string): void {
    this.notificationsSignal.update(current => 
      current.filter(n => n.id !== id)
    );
  }
  
  clear(): void {
    this.notificationsSignal.set([]);
  }
}
