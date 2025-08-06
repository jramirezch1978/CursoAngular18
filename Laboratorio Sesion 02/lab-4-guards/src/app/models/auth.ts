/**
 * 👤 Interface para información del usuario autenticado
 */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  lastLogin: Date;
  permissions: string[];
}

/**
 * 🎭 Enum para roles de usuario en el sistema PROVIAS
 */
export enum UserRole {
  ADMIN = 'admin',                    // Administrador del sistema
  PROJECT_MANAGER = 'project_manager', // Jefe de proyecto
  ENGINEER = 'engineer',              // Ingeniero
  TECHNICIAN = 'technician',          // Técnico
  GUEST = 'guest'                     // Invitado (solo lectura)
}

/**
 * 🔐 Interface para credenciales de login
 */
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 📝 Interface para respuesta de autenticación
 */
export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
  expiresAt?: Date;
}

/**
 * 🎫 Interface para token de sesión
 */
export interface AuthToken {
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

/**
 * ⚙️ Interface para configuración de autenticación
 */
export interface AuthConfig {
  sessionTimeout: number;      // Minutos
  enableAutoRefresh: boolean;  // Auto-refresh de token
  maxLoginAttempts: number;    // Intentos máximos de login
  lockoutDuration: number;     // Duración de bloqueo en minutos
}

/**
 * 📊 Interface para estado de autenticación
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: AuthToken | null;
  isLoading: boolean;
  lastActivity: Date | null;
  loginAttempts: number;
  isLocked: boolean;
}

/**
 * 🚨 Interface para eventos de seguridad
 */
export interface SecurityEvent {
  type: 'login' | 'logout' | 'failed_attempt' | 'token_expired' | 'unauthorized_access';
  timestamp: Date;
  userId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 🛡️ Enum para permisos del sistema
 */
export enum Permission {
  // Usuarios
  USERS_VIEW = 'users:view',
  USERS_CREATE = 'users:create',
  USERS_EDIT = 'users:edit',
  USERS_DELETE = 'users:delete',
  
  // Proyectos
  PROJECTS_VIEW = 'projects:view',
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_EDIT = 'projects:edit',
  PROJECTS_DELETE = 'projects:delete',
  
  // Administración
  ADMIN_PANEL = 'admin:panel',
  ADMIN_USERS = 'admin:users',
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_LOGS = 'admin:logs',
  
  // Sistema
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_RESTORE = 'system:restore',
  SYSTEM_MONITOR = 'system:monitor'
}

/**
 * 📋 Mapeo de roles a permisos
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin tiene todos los permisos
    Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT, Permission.USERS_DELETE,
    Permission.PROJECTS_VIEW, Permission.PROJECTS_CREATE, Permission.PROJECTS_EDIT, Permission.PROJECTS_DELETE,
    Permission.ADMIN_PANEL, Permission.ADMIN_USERS, Permission.ADMIN_SETTINGS, Permission.ADMIN_LOGS,
    Permission.SYSTEM_BACKUP, Permission.SYSTEM_RESTORE, Permission.SYSTEM_MONITOR
  ],
  
  [UserRole.PROJECT_MANAGER]: [
    // Project Manager maneja usuarios y proyectos
    Permission.USERS_VIEW, Permission.USERS_CREATE, Permission.USERS_EDIT,
    Permission.PROJECTS_VIEW, Permission.PROJECTS_CREATE, Permission.PROJECTS_EDIT, Permission.PROJECTS_DELETE
  ],
  
  [UserRole.ENGINEER]: [
    // Engineer ve y edita proyectos, ve usuarios
    Permission.USERS_VIEW,
    Permission.PROJECTS_VIEW, Permission.PROJECTS_EDIT
  ],
  
  [UserRole.TECHNICIAN]: [
    // Technician solo ve proyectos y usuarios
    Permission.USERS_VIEW,
    Permission.PROJECTS_VIEW
  ],
  
  [UserRole.GUEST]: [
    // Guest solo lectura básica
    Permission.PROJECTS_VIEW
  ]
};

/**
 * 👥 Usuarios mock para demostración
 */
export const MOCK_USERS: AuthUser[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@provias.gob.pe',
    fullName: 'Administrador del Sistema',
    role: UserRole.ADMIN,
    avatar: '👨‍💼',
    lastLogin: new Date(),
    permissions: ROLE_PERMISSIONS[UserRole.ADMIN]
  },
  {
    id: 2,
    username: 'jperez',
    email: 'juan.perez@provias.gob.pe',
    fullName: 'Juan Pérez García',
    role: UserRole.PROJECT_MANAGER,
    avatar: '👨‍🏗️',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    permissions: ROLE_PERMISSIONS[UserRole.PROJECT_MANAGER]
  },
  {
    id: 3,
    username: 'mrodriguez',
    email: 'maria.rodriguez@provias.gob.pe',
    fullName: 'María Rodríguez Silva',
    role: UserRole.ENGINEER,
    avatar: '👩‍🔧',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    permissions: ROLE_PERMISSIONS[UserRole.ENGINEER]
  },
  {
    id: 4,
    username: 'cgarcia',
    email: 'carlos.garcia@provias.gob.pe',
    fullName: 'Carlos García López',
    role: UserRole.TECHNICIAN,
    avatar: '👨‍💻',
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    permissions: ROLE_PERMISSIONS[UserRole.TECHNICIAN]
  },
  {
    id: 5,
    username: 'invitado',
    email: 'invitado@provias.gob.pe',
    fullName: 'Usuario Invitado',
    role: UserRole.GUEST,
    avatar: '👤',
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    permissions: ROLE_PERMISSIONS[UserRole.GUEST]
  }
];

/**
 * 🔑 Credenciales mock para testing (NO usar en producción)
 */
export const MOCK_CREDENTIALS: Record<string, string> = {
  'admin': 'admin123',
  'jperez': 'proyecto2024',
  'mrodriguez': 'ingenieria123',
  'cgarcia': 'tecnico456',
  'invitado': 'invitado'
};