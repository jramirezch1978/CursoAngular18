/**
 * USER MODEL - LAB 3: HTTP Interceptors
 * 
 * Modelos para manejo de usuarios y autenticación en el sistema PROVIAS.
 * Estos modelos son utilizados por el AuthService y AuthInterceptor.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. SEPARACIÓN DE MODELOS:
 *    - User: Información del usuario autenticado
 *    - LoginRequest/Response: DTOs para autenticación
 *    - RegisterRequest: DTO para registro de usuarios
 * 
 * 2. SEGURIDAD:
 *    - Passwords nunca se almacenan en el modelo User
 *    - Tokens tienen tiempo de expiración
 *    - Roles para control de acceso
 */

/**
 * Interface principal del Usuario
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

/**
 * DTO para solicitud de login
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * DTO para respuesta de login
 */
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number; // Segundos hasta expiración
  tokenType?: string; // Típicamente "Bearer"
}

/**
 * DTO para solicitud de registro
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

/**
 * DTO para respuesta de registro
 */
export interface RegisterResponse {
  user: User;
  message: string;
  requiresVerification?: boolean;
}

/**
 * DTO para refresh token
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * DTO para respuesta de refresh token
 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Interface para información de sesión
 */
export interface SessionInfo {
  user: User;
  token: string;
  expiresAt: Date;
  isExpired: boolean;
  timeUntilExpiry: number; // Milisegundos
}

/**
 * Enum para roles de usuario
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

/**
 * Enum para estados de autenticación
 */
export enum AuthState {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
  ERROR = 'error'
}

/**
 * Type guard para verificar si un objeto es un User válido
 */
export function isUser(obj: any): obj is User {
  return obj && 
         typeof obj === 'object' &&
         typeof obj.id === 'number' &&
         typeof obj.email === 'string' &&
         typeof obj.name === 'string' &&
         ['admin', 'user', 'guest'].includes(obj.role);
}

/**
 * Type guard para verificar si un token es válido
 */
export function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // Verificación básica de formato JWT (3 partes separadas por puntos)
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Función helper para crear un usuario vacío
 */
export function createEmptyUser(): Partial<User> {
  return {
    id: 0,
    email: '',
    name: '',
    role: 'guest',
    isActive: true
  };
}

/**
 * Función helper para verificar permisos
 */
export function hasPermission(user: User, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.GUEST]: 0,
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2
  };
  
  return roleHierarchy[user.role as UserRole] >= roleHierarchy[requiredRole];
}

/**
 * Función helper para formatear nombre de usuario
 */
export function formatUserName(user: User): string {
  if (!user.name) return user.email;
  return user.name;
}

/**
 * Función helper para obtener iniciales del usuario
 */
export function getUserInitials(user: User): string {
  const name = formatUserName(user);
  const parts = name.split(' ');
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

/**
 * Función helper para verificar si el token está próximo a expirar
 */
export function isTokenNearExpiry(expiresAt: Date, thresholdMinutes = 5): boolean {
  const now = new Date();
  const threshold = new Date(now.getTime() + (thresholdMinutes * 60 * 1000));
  return expiresAt <= threshold;
}
