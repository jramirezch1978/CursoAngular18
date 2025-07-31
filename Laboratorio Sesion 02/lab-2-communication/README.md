# 📡 LAB 2: COMUNICACIÓN ENTRE COMPONENTES
**⏱️ Duración: 30 minutos | 🎯 Nivel: Fundamental-Intermedio**

---

## 📋 DESCRIPCIÓN

La comunicación entre componentes en Angular es como la comunicación en una oficina corporativa bien organizada. Diferentes departamentos (componentes) necesitan intercambiar información de manera eficiente para que toda la empresa (aplicación) funcione correctamente.

**Analogía de la oficina corporativa:**
- **@Input:** Como un memo que el jefe envía a sus subordinados con instrucciones
- **@Output:** Como un reporte que el empleado envía de vuelta al jefe cuando termina una tarea
- **Services:** Como el sistema de mensajería interno que conecta diferentes departamentos

En este laboratorio construirás un sistema completo de gestión de usuarios para PROVIAS que demuestra todos los patrones de comunicación entre componentes en un contexto empresarial real.

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al completar este laboratorio, serás capaz de:

✅ **Dominar comunicación Parent → Child via @Input**
- Pasar datos desde componente padre a componentes hijos
- Implementar validación y transformación de datos en el componente hijo
- Manejar cambios dinámicos de propiedades con ngOnChanges

✅ **Implementar comunicación Child → Parent via @Output**
- Emitir eventos personalizados desde componentes hijos
- Manejar eventos en componentes padre con custom payloads
- Implementar patron de delegación de responsabilidades

✅ **Crear comunicación entre siblings via Services**
- Desarrollar services con BehaviorSubject para estado compartido
- Implementar patrón Observer para actualizaciones reactivas
- Manejar estado global de manera predecible

✅ **Construir sistema CRUD completo**
- Operaciones Create, Read, Update, Delete con comunicación reactiva
- Sincronización automática entre múltiples componentes
- Manejo de errores y estados de carga

---

## 🧠 CONCEPTOS CLAVE

### 📡 Patrones de Comunicación Angular

#### 1. Parent → Child (@Input)
```typescript
// 👨‍💼 Componente Padre (Jefe)
export class UserListComponent {
  selectedUser: User = { id: 1, name: 'Ana García' };
}

// 👩‍💻 Componente Hijo (Empleado)
export class UserCardComponent {
  @Input() user!: User;  // Recibe instrucciones del jefe
}
```

#### 2. Child → Parent (@Output)
```typescript
// 👩‍💻 Componente Hijo (Empleado reportando)
export class UserCardComponent {
  @Output() userSelected = new EventEmitter<User>();
  
  onUserClick() {
    this.userSelected.emit(this.user); // Reporta al jefe
  }
}

// 👨‍💼 Componente Padre (Jefe recibiendo reporte)
export class UserListComponent {
  onUserSelected(user: User) {
    console.log('Usuario seleccionado:', user);
  }
}
```

#### 3. Sibling Communication (Services)
```typescript
// 📨 Service (Sistema de mensajería interno)
@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();
  
  selectUser(user: User) {
    this.selectedUserSubject.next(user); // Envía mensaje a toda la oficina
  }
}
```

### 🎯 Cuándo usar cada patrón

| Patrón | Cuándo usar | Ejemplo |
|--------|-------------|---------|
| **@Input** | Relación directa padre-hijo | Lista → Tarjeta de usuario |
| **@Output** | Hijo reporta al padre | Click en botón → Acción en padre |
| **Service** | Componentes no relacionados | Sidebar ↔ Main content |

---

## 📚 FUNDAMENTOS TEÓRICOS

### 🔍 Anatomía de la Comunicación Angular

#### @Input - Flujo de Datos Descendente
```typescript
// 🎯 Declaración en el componente hijo
export class UserCardComponent {
  @Input({ required: true }) user!: User;        // Obligatorio
  @Input() isSelected: boolean = false;          // Opcional con default
  @Input({ alias: 'userData' }) user2?: User;    // Con alias
  
  // 🔄 Reaccionar a cambios
  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      this.processUserData();
    }
  }
}

// 📤 Uso en template del padre
<app-user-card 
  [user]="selectedUser"           // Property binding
  [isSelected]="user.id === currentId"
  [userData]="backupUser">
</app-user-card>
```

#### @Output - Flujo de Eventos Ascendente
```typescript
// 📡 Declaración en el componente hijo
export class UserCardComponent {
  @Output() userSelected = new EventEmitter<User>();
  @Output() userDeleted = new EventEmitter<number>(); // Solo ID
  @Output() statusChanged = new EventEmitter<{id: number, status: boolean}>();
  
  // 🎯 Métodos que emiten eventos
  onCardClick() {
    this.userSelected.emit(this.user);
  }
  
  onDeleteClick() {
    this.userDeleted.emit(this.user.id);
  }
}

// 👂 Escuchar en template del padre
<app-user-card 
  (userSelected)="onUserSelected($event)"
  (userDeleted)="onUserDeleted($event)"
  (statusChanged)="onStatusChanged($event)">
</app-user-card>
```

#### Services - Estado Global Reactivo
```typescript
// 🏪 Service con BehaviorSubject (siempre tiene valor actual)
@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  
  // 📡 Observables públicos (solo lectura)
  users$ = this.usersSubject.asObservable();
  selectedUser$ = this.selectedUserSubject.asObservable();
  
  // 🔄 Métodos para actualizar estado
  updateUsers(users: User[]) {
    this.usersSubject.next(users);
  }
  
  selectUser(user: User) {
    this.selectedUserSubject.next(user);
  }
}
```

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### PASO 1: Crear Modelos de Datos (3 minutos)

#### 1.1 Generar interfaces para el proyecto
```bash
# Crear interfaces en la carpeta models
ng generate interface models/user
ng generate interface models/project
```

#### 1.2 Definir modelo User

**Archivo: `src/app/models/user.ts`**
```typescript
/**
 * 👤 Interface principal para usuarios del sistema PROVIAS
 * Define la estructura completa de un usuario con todas sus propiedades
 */
export interface User {
  id: number;                    // Identificador único
  name: string;                  // Nombre completo
  email: string;                 // Correo electrónico corporativo
  role: UserRole;               // Rol dentro de la organización
  avatar?: string;              // Emoji o URL del avatar (opcional)
  isActive: boolean;            // Estado activo/inactivo
  lastLogin?: Date;             // Último acceso al sistema (opcional)
  projects: number[];           // IDs de proyectos asignados
}

/**
 * 🎭 Enum para definir roles de usuario en PROVIAS
 * Cada rol tiene diferentes permisos y responsabilidades
 */
export enum UserRole {
  ADMIN = 'admin',                    // Administrador del sistema
  PROJECT_MANAGER = 'project_manager', // Jefe de proyecto
  ENGINEER = 'engineer',              // Ingeniero
  TECHNICIAN = 'technician'           // Técnico de campo
}

/**
 * 📝 Interface para crear nuevos usuarios
 * Contiene solo los campos obligatorios para creación
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

/**
 * 📊 Interface para estadísticas de usuarios
 * Información agregada para dashboards y reportes
 */
export interface UserStats {
  totalUsers: number;                              // Total de usuarios
  activeUsers: number;                            // Usuarios activos
  byRole: { [key in UserRole]: number };         // Conteo por rol
}

/**
 * 🔍 Interface para filtros de búsqueda
 * Permite filtrar usuarios por diferentes criterios
 */
export interface UserFilter {
  role?: UserRole;
  isActive?: boolean;
  searchTerm?: string;
  hasProjects?: boolean;
}

/**
 * ✏️ Interface para actualización de usuarios
 * Permite actualizar campos específicos sin requerir todos
 */
export interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  projects?: number[];
}
```

#### 1.3 Definir modelo Project

**Archivo: `src/app/models/project.ts`**
```typescript
/**
 * 🏗️ Interface principal para proyectos de PROVIAS
 * Define la estructura de proyectos de infraestructura
 */
export interface Project {
  id: number;                    // Identificador único
  name: string;                  // Nombre del proyecto
  description: string;           // Descripción detallada
  status: ProjectStatus;         // Estado actual del proyecto
  startDate: Date;              // Fecha de inicio
  endDate?: Date;               // Fecha de finalización (opcional)
  budget: number;               // Presupuesto asignado
  assignedUserIds: number[];    // IDs de usuarios asignados
  location: string;             // Ubicación geográfica
  priority: ProjectPriority;    // Prioridad del proyecto
}

/**
 * 📋 Enum para estados de proyecto
 * Representa el ciclo de vida de un proyecto
 */
export enum ProjectStatus {
  PLANNING = 'planning',           // En planificación
  IN_PROGRESS = 'in_progress',    // En ejecución
  ON_HOLD = 'on_hold',           // En pausa
  COMPLETED = 'completed',        // Completado
  CANCELLED = 'cancelled'         // Cancelado
}

/**
 * 🚨 Enum para prioridades de proyecto
 * Define la urgencia e importancia
 */
export enum ProjectPriority {
  LOW = 'low',                   // Baja prioridad
  MEDIUM = 'medium',             // Prioridad media
  HIGH = 'high',                 // Alta prioridad
  CRITICAL = 'critical'          // Crítico - atención inmediata
}

/**
 * 📊 Interface para estadísticas de proyectos
 */
export interface ProjectStats {
  totalProjects: number;
  byStatus: { [key in ProjectStatus]: number };
  byPriority: { [key in ProjectPriority]: number };
  totalBudget: number;
  averageDuration: number; // En días
}
```

---

### PASO 2: Crear Service de Comunicación (7 minutos)

#### 2.1 Generar service para manejo de estado
```bash
# Crear service en la carpeta services
ng generate service services/user-management
```

#### 2.2 Implementar UserManagementService

**Archivo: `src/app/services/user-management.service.ts`**
```typescript
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
```

---

### PASO 3: Crear Componente Parent (User List) (8 minutos)

#### 3.1 Generar componente padre
```bash
# Crear componente padre en carpeta components
ng generate component components/user-list --standalone
```

#### 3.2 Implementar user-list.component.ts

**Archivo: `src/app/components/user-list/user-list.component.ts`**
```typescript
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
```

Continuaré con el resto del componente UserList y los siguientes componentes en el próximo mensaje...

---

**✅ Checkpoint del Paso 3.2:** Debes tener el componente UserList implementado con toda la lógica de comunicación parent-child y gestión de estado via service.

¿Te gustaría que continúe con el template del UserList y los componentes restantes?