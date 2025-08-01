import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserRole } from '../../models/user';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent implements OnChanges {
  // Props de entrada desde el parent
  @Input({ required: true }) user!: User;
  @Input() isSelected = false;
  
  // Eventos hacia el parent
  @Output() userSelected = new EventEmitter<User>();
  @Output() userToggleStatus = new EventEmitter<User>();
  @Output() userDelete = new EventEmitter<User>();

  constructor(private logger: LoggerService) {
    this.logger.debug('UserCardComponent', 'Constructor ejecutado');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.logger.debug('UserCardComponent', 'Usuario actualizado en card', this.user?.name);
    }
    
    if (changes['isSelected']) {
      this.logger.debug('UserCardComponent', `Estado selección: ${this.isSelected}`);
    }
  }

  onCardClick(): void {
    this.logger.info('UserCardComponent', 'Card clickeada, emitiendo evento userSelected');
    this.userSelected.emit(this.user);
  }

  onToggleStatus(event: Event): void {
    event.stopPropagation(); // Evitar que se propague al click de la card
    this.logger.info('UserCardComponent', 'Toggle status clickeado');
    this.userToggleStatus.emit(this.user);
  }

  onDelete(event: Event): void {
    event.stopPropagation(); // Evitar que se propague al click de la card
    this.logger.warn('UserCardComponent', 'Delete clickeado');
    this.userDelete.emit(this.user);
  }

  getRoleClass(): string {
    const roleClasses = {
      [UserRole.ADMIN]: 'role-admin',
      [UserRole.PROJECT_MANAGER]: 'role-manager',
      [UserRole.ENGINEER]: 'role-engineer',
      [UserRole.TECHNICIAN]: 'role-technician'
    };
    return roleClasses[this.user.role];
  }

  getRoleDisplayName(): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.PROJECT_MANAGER]: 'Jefe de Proyecto',
      [UserRole.ENGINEER]: 'Ingeniero',
      [UserRole.TECHNICIAN]: 'Técnico'
    };
    return roleNames[this.user.role];
  }

  getLastLoginFormatted(): string {
    if (!this.user.lastLogin) return 'Nunca';
    
    const now = new Date();
    const loginDate = new Date(this.user.lastLogin);
    const diffMs = now.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return loginDate.toLocaleDateString('es-PE');
  }
}