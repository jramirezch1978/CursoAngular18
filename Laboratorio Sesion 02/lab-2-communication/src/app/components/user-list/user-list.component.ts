import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User, UserRole, CreateUserRequest, UserFilter } from '../../models/user';
import { UserManagementService } from '../../services/user-management.service';
import { LoggerService } from '../../services/logger.service';
import { UserCardComponent } from '../user-card/user-card.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCardComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  
  // 📊 Estado del componente
  users: User[] = [];
  selectedUser: User | null = null;
  isLoading = false;
  currentFilter: UserFilter = {};
  
  // 📝 Formulario para nuevo usuario
  showAddForm = false;
  newUserForm: CreateUserRequest = {
    name: '',
    email: '',
    role: UserRole.TECHNICIAN
  };
  
  // 🔍 Control de búsqueda
  searchTerm = '';
  
  // 🎭 Enums para el template
  UserRole = UserRole;
  
  // 🔄 Gestión de subscripciones
  private subscriptions = new Subscription();

  constructor(
    private userService: UserManagementService,
    private logger: LoggerService
  ) {
    this.logger.debug('UserListComponent', 'Constructor ejecutado');
  }

  ngOnInit(): void {
    this.logger.info('UserListComponent', 'Inicializando componente lista de usuarios');
    this.setupSubscriptions();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.logger.info('UserListComponent', 'Destruyendo componente y limpiando subscripciones');
    this.subscriptions.unsubscribe();
  }

  // 🔄 Configuración de subscripciones reactivas

  /**
   * 📡 Configurar todas las subscripciones del componente
   * Patrón: Una subscription madre que maneja todas las demás
   */
  private setupSubscriptions(): void {
    // Subscription para lista de usuarios
    const usersSubscription = this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.logger.debug('UserListComponent', `Lista actualizada: ${users.length} usuarios`);
      },
      error: (error) => {
        this.logger.error('UserListComponent', 'Error cargando usuarios', error);
      }
    });

    // Subscription para usuario seleccionado
    const selectedUserSubscription = this.userService.getSelectedUser().subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.logger.debug('UserListComponent', 'Usuario seleccionado actualizado', 
          user ? user.name : 'ninguno');
      }
    });

    // Subscription para estado de carga
    const loadingSubscription = this.userService.getLoadingState().subscribe({
      next: (loading) => {
        this.isLoading = loading;
      }
    });

    // Subscription para filtros
    const filterSubscription = this.userService.getCurrentFilter().subscribe({
      next: (filter) => {
        this.currentFilter = filter;
        this.searchTerm = filter.searchTerm || '';
      }
    });

    // Agregar todas las subscriptions a la subscription madre
    this.subscriptions.add(usersSubscription);
    this.subscriptions.add(selectedUserSubscription);
    this.subscriptions.add(loadingSubscription);
    this.subscriptions.add(filterSubscription);
  }

  /**
   * 📋 Cargar usuarios iniciales
   */
  private loadUsers(): void {
    this.logger.info('UserListComponent', 'Cargando lista inicial de usuarios');
    // Los usuarios se cargan automáticamente via subscription
    // Este método puede extenderse para reload manual si es necesario
  }

  // 🎮 Event handlers para comunicación con child components

  /**
   * 👤 Handler: Usuario seleccionado desde child component
   * 📡 Patrón: Child → Parent communication via @Output
   */
  onUserSelected(user: User): void {
    this.logger.info('UserListComponent', 'Evento recibido: usuario seleccionado desde card', {
      userId: user.id,
      userName: user.name
    });
    
    // Delegar al service para notificar a otros componentes
    this.userService.selectUser(user);
  }

  /**
   * 🔄 Handler: Toggle de estado de usuario desde child
   * 📡 Patrón: Child reporta acción, Parent coordina con service
   */
  onUserToggleStatus(user: User): void {
    this.logger.info('UserListComponent', 'Evento recibido: toggle status desde card', {
      userId: user.id,
      currentStatus: user.isActive
    });
    
    this.userService.toggleUserStatus(user.id);
  }

  /**
   * 🗑️ Handler: Eliminar usuario desde child
   * 📡 Incluye confirmación de seguridad
   */
  onUserDelete(user: User): void {
    const confirmMessage = `¿Está seguro de eliminar a ${user.name}?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      this.logger.warn('UserListComponent', 'Evento recibido: eliminar usuario confirmado', {
        userId: user.id,
        userName: user.name
      });
      
      this.userService.deleteUser(user.id);
    } else {
      this.logger.info('UserListComponent', 'Eliminación de usuario cancelada por el usuario');
    }
  }

  /**
   * ✏️ Handler: Editar usuario desde child
   */
  onUserEdit(user: User): void {
    this.logger.info('UserListComponent', 'Evento recibido: editar usuario', user.name);
    // Seleccionar usuario para edición
    this.userService.selectUser(user);
    // Aquí se podría abrir un modal de edición
  }

  // 🔍 Métodos de búsqueda y filtrado

  /**
   * 🔍 Aplicar búsqueda por término
   */
  onSearchChange(): void {
    const filter: UserFilter = {
      ...this.currentFilter,
      searchTerm: this.searchTerm.trim() || undefined
    };
    
    this.userService.setFilter(filter);
    this.logger.debug('UserListComponent', 'Búsqueda aplicada', { searchTerm: this.searchTerm });
  }

  /**
   * 🎭 Filtrar por rol específico
   */
  filterByRole(role: UserRole | null): void {
    const filter: UserFilter = {
      ...this.currentFilter,
      role: role || undefined
    };
    
    this.userService.setFilter(filter);
    this.logger.debug('UserListComponent', 'Filtro por rol aplicado', { role });
  }

  /**
   * ✅ Filtrar por estado activo
   */
  filterByStatus(isActive: boolean | null): void {
    const filter: UserFilter = {
      ...this.currentFilter,
      isActive: isActive !== null ? isActive : undefined
    };
    
    this.userService.setFilter(filter);
    this.logger.debug('UserListComponent', 'Filtro por estado aplicado', { isActive });
  }

  /**
   * 🧹 Limpiar todos los filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.userService.clearFilter();
    this.logger.info('UserListComponent', 'Todos los filtros limpiados');
  }

  // ➕ Métodos para agregar nuevos usuarios

  /**
   * 📝 Mostrar/ocultar formulario de nuevo usuario
   */
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    
    if (this.showAddForm) {
      // Resetear formulario al abrir
      this.resetNewUserForm();
      this.logger.debug('UserListComponent', 'Formulario de agregar usuario abierto');
    } else {
      this.logger.debug('UserListComponent', 'Formulario de agregar usuario cerrado');
    }
  }

  /**
   * ➕ Agregar nuevo usuario
   */
  addNewUser(): void {
    // Validación básica
    if (!this.isNewUserFormValid()) {
      this.logger.warn('UserListComponent', 'Intento de crear usuario con datos inválidos', this.newUserForm);
      return;
    }

    this.logger.info('UserListComponent', 'Creando nuevo usuario', this.newUserForm);
    
    const newUser = this.userService.addUser({ ...this.newUserForm });
    
    // Cerrar formulario y resetear
    this.showAddForm = false;
    this.resetNewUserForm();
    
    // Seleccionar el nuevo usuario
    this.userService.selectUser(newUser);
  }

  /**
   * 🔄 Resetear formulario de nuevo usuario
   */
  private resetNewUserForm(): void {
    this.newUserForm = {
      name: '',
      email: '',
      role: UserRole.TECHNICIAN
    };
  }

  /**
   * ✅ Validar formulario de nuevo usuario
   */
  private isNewUserFormValid(): boolean {
    return !!(
      this.newUserForm.name.trim() &&
      this.newUserForm.email.trim() &&
      this.newUserForm.role
    );
  }

  /**
   * 🎲 Generar usuarios de prueba
   */
  generateTestUsers(): void {
    this.userService.generateTestUsers(3);
    this.logger.info('UserListComponent', 'Usuarios de prueba generados');
  }

  // 📊 Métodos de utilidad para el template

  /**
   * 📊 Obtener conteo de usuarios activos
   */
  getActiveUsersCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  /**
   * 🎭 Obtener nombre legible del rol
   */
  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.PROJECT_MANAGER]: 'Jefe de Proyecto',
      [UserRole.ENGINEER]: 'Ingeniero',
      [UserRole.TECHNICIAN]: 'Técnico'
    };
    return roleNames[role];
  }

  /**
   * 🎯 Verificar si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(
      this.currentFilter.role ||
      this.currentFilter.isActive !== undefined ||
      this.currentFilter.searchTerm ||
      this.currentFilter.hasProjects !== undefined
    );
  }

  /**
   * 📋 Limpiar selección de usuario
   */
  clearSelection(): void {
    this.userService.clearSelection();
  }

  /**
   * 🔄 Resetear datos a estado inicial
   */
  resetData(): void {
    if (confirm('¿Está seguro de resetear todos los datos? Se perderán los cambios realizados.')) {
      this.userService.resetToInitialData();
      this.logger.info('UserListComponent', 'Datos reseteados por solicitud del usuario');
    }
  }
}