import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRole, CreateUserRequest, UserStats, UserFilter } from '../models/user';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  
  // 📊 Datos mock para demostración (simula base de datos)
  private initialUsers: User[] = [
    {
      id: 1,
      name: 'Ana García López',
      email: 'ana.garcia@provias.gob.pe',
      role: UserRole.PROJECT_MANAGER,
      avatar: '👩‍💼',
      isActive: true,
      lastLogin: new Date('2025-07-30T14:30:00'),
      projects: [1, 3]
    },
    {
      id: 2,
      name: 'Carlos Mendoza Silva',
      email: 'carlos.mendoza@provias.gob.pe',
      role: UserRole.ENGINEER,
      avatar: '👨‍🔧',
      isActive: true,
      lastLogin: new Date('2025-07-31T09:15:00'),
      projects: [1, 2]
    },
    {
      id: 3,
      name: 'María Rodriguez Vargas',
      email: 'maria.rodriguez@provias.gob.pe',
      role: UserRole.ADMIN,
      avatar: '👩‍💻',
      isActive: true,
      lastLogin: new Date('2025-07-31T16:45:00'),
      projects: []
    },
    {
      id: 4,
      name: 'José Pérez Huamán',
      email: 'jose.perez@provias.gob.pe',
      role: UserRole.TECHNICIAN,
      avatar: '👨‍🔧',
      isActive: false,
      lastLogin: new Date('2025-07-25T11:20:00'),
      projects: [2]
    },
    {
      id: 5,
      name: 'Laura Quispe Mamani',
      email: 'laura.quispe@provias.gob.pe',
      role: UserRole.ENGINEER,
      avatar: '👩‍🔬',
      isActive: true,
      lastLogin: new Date('2025-07-31T12:00:00'),
      projects: [3]
    }
  ];

  // 🏪 Estado reactivo con BehaviorSubject
  private usersSubject = new BehaviorSubject<User[]>(this.initialUsers);
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private filterSubject = new BehaviorSubject<UserFilter>({});

  constructor(private logger: LoggerService) {
    this.logger.info('UserManagementService', 'Servicio inicializado', {
      usersCount: this.initialUsers.length,
      version: '1.0.0'
    });
  }

  // 📡 Observables públicos (solo lectura para componentes)
  
  /**
   * 📋 Observable de la lista de usuarios
   * Se actualiza automáticamente cuando cambia el estado
   */
  getUsers(): Observable<User[]> {
    return combineLatest([
      this.usersSubject.asObservable(),
      this.filterSubject.asObservable()
    ]).pipe(
      map(([users, filter]) => this.applyFilter(users, filter))
    );
  }

  /**
   * 👤 Observable del usuario seleccionado
   * Permite a múltiples componentes reaccionar a la selección
   */
  getSelectedUser(): Observable<User | null> {
    return this.selectedUserSubject.asObservable();
  }

  /**
   * ⏳ Observable del estado de carga
   * Para mostrar spinners e indicadores de carga
   */
  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * 🔍 Observable del filtro actual
   * Permite a componentes saber qué filtros están aplicados
   */
  getCurrentFilter(): Observable<UserFilter> {
    return this.filterSubject.asObservable();
  }

  // 🔧 Métodos de gestión de usuarios

  /**
   * 🎯 Seleccionar un usuario específico
   * Notifica a todos los componentes suscritos
   */
  selectUser(user: User): void {
    this.selectedUserSubject.next(user);
    this.logger.info('UserManagementService', `Usuario seleccionado: ${user.name}`, {
      userId: user.id,
      userRole: user.role
    });
  }

  /**
   * 🚫 Limpiar selección de usuario
   */
  clearSelection(): void {
    this.selectedUserSubject.next(null);
    this.logger.debug('UserManagementService', 'Selección de usuario limpiada');
  }

  /**
   * ➕ Agregar nuevo usuario al sistema
   * Simula creación en base de datos
   */
  addUser(userRequest: CreateUserRequest): User {
    this.setLoading(true);
    
    // Simular demora de API
    setTimeout(() => {
      const currentUsers = this.usersSubject.value;
      const newUser: User = {
        id: Math.max(...currentUsers.map(u => u.id)) + 1,
        ...userRequest,
        avatar: this.getRandomAvatar(),
        isActive: true,
        lastLogin: new Date(),
        projects: []
      };

      const updatedUsers = [...currentUsers, newUser];
      this.usersSubject.next(updatedUsers);
      
      this.logger.info('UserManagementService', `Usuario creado: ${newUser.name}`, newUser);
      this.setLoading(false);
    }, 1000);

    // Retorna usuario temporal para UI inmediata
    const tempUser: User = {
      id: Date.now(), // ID temporal
      ...userRequest,
      avatar: this.getRandomAvatar(),
      isActive: true,
      lastLogin: new Date(),
      projects: []
    };

    return tempUser;
  }

  /**
   * ✏️ Actualizar usuario existente
   * Actualiza el usuario y notifica a todos los observadores
   */
  updateUser(updatedUser: User): void {
    const currentUsers = this.usersSubject.value;
    const userIndex = currentUsers.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      const updatedUsers = [...currentUsers];
      updatedUsers[userIndex] = { ...updatedUser };
      this.usersSubject.next(updatedUsers);
      
      // Actualizar usuario seleccionado si es el mismo
      if (this.selectedUserSubject.value?.id === updatedUser.id) {
        this.selectedUserSubject.next(updatedUser);
      }
      
      this.logger.info('UserManagementService', `Usuario actualizado: ${updatedUser.name}`, {
        userId: updatedUser.id,
        changes: Object.keys(updatedUser)
      });
    } else {
      this.logger.warn('UserManagementService', `Usuario no encontrado para actualizar: ID ${updatedUser.id}`);
    }
  }

  /**
   * 🗑️ Eliminar usuario del sistema
   * Remueve el usuario y limpia selección si es necesario
   */
  deleteUser(userId: number): void {
    const currentUsers = this.usersSubject.value;
    const userToDelete = currentUsers.find(u => u.id === userId);
    
    if (userToDelete) {
      const updatedUsers = currentUsers.filter(u => u.id !== userId);
      this.usersSubject.next(updatedUsers);
      
      // Limpiar selección si se eliminó el usuario seleccionado
      if (this.selectedUserSubject.value?.id === userId) {
        this.selectedUserSubject.next(null);
      }
      
      this.logger.warn('UserManagementService', `Usuario eliminado: ${userToDelete.name}`, {
        userId,
        remainingUsers: updatedUsers.length
      });
    } else {
      this.logger.error('UserManagementService', `Usuario no encontrado para eliminar: ID ${userId}`);
    }
  }

  /**
   * 🔄 Toggle del estado activo de un usuario
   */
  toggleUserStatus(userId: number): void {
    const currentUsers = this.usersSubject.value;
    const userIndex = currentUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      const updatedUsers = [...currentUsers];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        isActive: !updatedUsers[userIndex].isActive
      };
      
      this.usersSubject.next(updatedUsers);
      
      // Actualizar usuario seleccionado si es el mismo
      if (this.selectedUserSubject.value?.id === userId) {
        this.selectedUserSubject.next(updatedUsers[userIndex]);
      }
      
      this.logger.info('UserManagementService', 
        `Estado de usuario cambiado: ${updatedUsers[userIndex].name}`, {
          userId,
          newStatus: updatedUsers[userIndex].isActive ? 'activo' : 'inactivo'
        });
    }
  }

  // 🔍 Métodos de búsqueda y filtrado

  /**
   * 🔍 Aplicar filtro a la lista de usuarios
   */
  setFilter(filter: UserFilter): void {
    this.filterSubject.next(filter);
    this.logger.debug('UserManagementService', 'Filtro aplicado', filter);
  }

  /**
   * 🧹 Limpiar todos los filtros
   */
  clearFilter(): void {
    this.filterSubject.next({});
    this.logger.debug('UserManagementService', 'Filtros limpiados');
  }

  /**
   * 🔍 Buscar usuario por ID
   */
  getUserById(id: number): Observable<User | undefined> {
    return this.getUsers().pipe(
      map(users => users.find(user => user.id === id))
    );
  }

  /**
   * 📊 Obtener estadísticas de usuarios
   */
  getUserStats(): UserStats {
    const users = this.usersSubject.value;
    const stats: UserStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      byRole: {
        [UserRole.ADMIN]: users.filter(u => u.role === UserRole.ADMIN).length,
        [UserRole.PROJECT_MANAGER]: users.filter(u => u.role === UserRole.PROJECT_MANAGER).length,
        [UserRole.ENGINEER]: users.filter(u => u.role === UserRole.ENGINEER).length,
        [UserRole.TECHNICIAN]: users.filter(u => u.role === UserRole.TECHNICIAN).length
      }
    };
    
    this.logger.debug('UserManagementService', 'Estadísticas calculadas', stats);
    return stats;
  }

  // 🔧 Métodos privados de utilidad

  /**
   * 🎭 Generar avatar aleatorio
   */
  private getRandomAvatar(): string {
    const avatars = ['👤', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '👨‍💻', '👩‍💻', '🧑‍⚕️', '👩‍🔬', '👨‍🔬'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  /**
   * 🔍 Aplicar filtros a la lista de usuarios
   */
  private applyFilter(users: User[], filter: UserFilter): User[] {
    return users.filter(user => {
      // Filtro por rol
      if (filter.role && user.role !== filter.role) {
        return false;
      }
      
      // Filtro por estado activo
      if (filter.isActive !== undefined && user.isActive !== filter.isActive) {
        return false;
      }
      
      // Filtro por término de búsqueda
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const nameMatch = user.name.toLowerCase().includes(searchLower);
        const emailMatch = user.email.toLowerCase().includes(searchLower);
        if (!nameMatch && !emailMatch) {
          return false;
        }
      }
      
      // Filtro por asignación de proyectos
      if (filter.hasProjects !== undefined) {
        const hasProjects = user.projects.length > 0;
        if (hasProjects !== filter.hasProjects) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * ⏳ Controlar estado de carga
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // 🧪 Métodos para testing y desarrollo

  /**
   * 🎲 Generar usuarios de prueba
   */
  generateTestUsers(count: number = 3): void {
    const roles = Object.values(UserRole);
    const names = [
      'Roberto Silva', 'Carmen Flores', 'Diego Vargas', 'Elena Torres',
      'Fernando Castro', 'Isabel Morales', 'Gabriel Ramos', 'Patricia Vega'
    ];

    for (let i = 0; i < count; i++) {
      const user: CreateUserRequest = {
        name: names[Math.floor(Math.random() * names.length)],
        email: `test${Date.now()}_${i}@provias.gob.pe`,
        role: roles[Math.floor(Math.random() * roles.length)]
      };
      
      this.addUser(user);
    }
    
    this.logger.info('UserManagementService', `${count} usuarios de prueba generados`);
  }

  /**
   * 🧹 Resetear datos a estado inicial
   */
  resetToInitialData(): void {
    this.usersSubject.next([...this.initialUsers]);
    this.selectedUserSubject.next(null);
    this.filterSubject.next({});
    this.logger.info('UserManagementService', 'Datos reseteados a estado inicial');
  }
}