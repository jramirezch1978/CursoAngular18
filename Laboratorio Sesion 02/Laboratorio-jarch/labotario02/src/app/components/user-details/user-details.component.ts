import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User, UserRole } from '../../models/user';
import { UserManagementService } from '../../services/user-management.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  selectedUser: User | null = null;
  editMode = false;
  editForm: Partial<User> = {};
  
  // Enum para el template
  UserRole = UserRole;
  
  private subscription = new Subscription();

  constructor(
    private userService: UserManagementService,
    private logger: LoggerService
  ) {
    this.logger.debug('UserDetailsComponent', 'Constructor ejecutado');
  }

  ngOnInit(): void {
    this.logger.info('UserDetailsComponent', 'Inicializando componente');
    this.subscribeToSelectedUser();
  }

  ngOnDestroy(): void {
    this.logger.info('UserDetailsComponent', 'Destruyendo componente');
    this.subscription.unsubscribe();
  }

  private subscribeToSelectedUser(): void {
    const sub = this.userService.getSelectedUser().subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.editMode = false;
        this.initEditForm();
        this.logger.debug('UserDetailsComponent', 'Usuario seleccionado recibido', user?.name || 'ninguno');
      }
    });
    
    this.subscription.add(sub);
  }

  private initEditForm(): void {
    if (this.selectedUser) {
      this.editForm = {
        name: this.selectedUser.name,
        email: this.selectedUser.email,
        role: this.selectedUser.role
      };
    } else {
      this.editForm = {};
    }
  }

  startEdit(): void {
    this.editMode = true;
    this.initEditForm();
    this.logger.info('UserDetailsComponent', 'Modo edición activado');
  }

  cancelEdit(): void {
    this.editMode = false;
    this.initEditForm();
    this.logger.info('UserDetailsComponent', 'Edición cancelada');
  }

  saveChanges(): void {
    if (this.selectedUser && this.editForm.name && this.editForm.email && this.editForm.role) {
      const updatedUser: User = {
        ...this.selectedUser,
        name: this.editForm.name,
        email: this.editForm.email,
        role: this.editForm.role
      };
      
      this.userService.updateUser(updatedUser);
      this.editMode = false;
      this.logger.info('UserDetailsComponent', 'Usuario actualizado', updatedUser);
    }
  }

  toggleUserStatus(): void {
    if (this.selectedUser) {
      this.userService.toggleUserStatus(this.selectedUser.id);
      this.logger.info('UserDetailsComponent', 'Estado de usuario cambiado');
    }
  }

  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.PROJECT_MANAGER]: 'Jefe de Proyecto',
      [UserRole.ENGINEER]: 'Ingeniero',
      [UserRole.TECHNICIAN]: 'Técnico'
    };
    return roleNames[role];
  }

  getStatusClass(): string {
    return this.selectedUser?.isActive ? 'status-active' : 'status-inactive';
  }

  isFormValid(): boolean {
    return !!(this.editForm.name?.trim() && 
              this.editForm.email?.trim() && 
              this.editForm.role);
  }
}