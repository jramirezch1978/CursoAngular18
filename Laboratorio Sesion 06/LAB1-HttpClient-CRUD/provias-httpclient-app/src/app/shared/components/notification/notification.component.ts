import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div 
          class="notification notification-{{ notification.type }}"
          [class.notification-enter]="true">
          
          <div class="notification-icon">
            @switch (notification.type) {
              @case ('success') {
                <span class="icon">✅</span>
              }
              @case ('error') {
                <span class="icon">❌</span>
              }
              @case ('warning') {
                <span class="icon">⚠️</span>
              }
              @case ('info') {
                <span class="icon">ℹ️</span>
              }
            }
          </div>
          
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          
          <button 
            class="notification-close"
            (click)="notificationService.remove(notification.id)"
            title="Cerrar notificación">
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
