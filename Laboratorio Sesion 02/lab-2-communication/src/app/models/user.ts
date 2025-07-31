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