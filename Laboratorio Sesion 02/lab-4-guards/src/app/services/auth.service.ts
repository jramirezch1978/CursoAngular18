import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  AuthUser, 
  LoginCredentials, 
  AuthResponse, 
  AuthState, 
  AuthToken, 
  SecurityEvent, 
  UserRole, 
  Permission,
  MOCK_USERS,
  MOCK_CREDENTIALS,
  ROLE_PERMISSIONS
} from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // 🔐 Configuración del servicio
  private readonly CONFIG = {
    SESSION_TIMEOUT: 30, // minutos
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_DURATION: 15, // minutos
    AUTO_REFRESH_BUFFER: 5, // minutos antes de expirar
    STORAGE_KEY: 'provias_auth',
    SECURITY_LOG_KEY: 'provias_security_log'
  };

  // 📊 Estado de autenticación reactivo
  private authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
    lastActivity: null,
    loginAttempts: 0,
    isLocked: false
  });

  // 🚨 Log de eventos de seguridad
  private securityEvents$ = new BehaviorSubject<SecurityEvent[]>([]);

  // ⏰ Timer para sesión
  private sessionTimer?: any;
  
  // 🔄 Timer para auto-refresh
  private refreshTimer?: any;

  constructor() {
    console.log('🔐 [AuthService] Inicializando servicio de autenticación');
    this.initializeFromStorage();
    this.setupSessionMonitoring();
  }

  // 📊 Observables públicos
  
  /**
   * 👀 Observable del estado de autenticación
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * ✅ Observable de estado de autenticación (simplificado)
   */
  isAuthenticated(): Observable<boolean> {
    return this.authState$.pipe(map(state => state.isAuthenticated));
  }

  /**
   * 👤 Observable del usuario actual
   */
  getCurrentUser(): Observable<AuthUser | null> {
    return this.authState$.pipe(map(state => state.user));
  }

  /**
   * 🎭 Observable del rol actual
   */
  getCurrentRole(): Observable<UserRole | null> {
    return this.authState$.pipe(map(state => state.user?.role || null));
  }

  /**
   * 🚨 Observable de eventos de seguridad
   */
  getSecurityEvents(): Observable<SecurityEvent[]> {
    return this.securityEvents$.asObservable();
  }

  // 🔐 Métodos de autenticación

  /**
   * 🔑 Iniciar sesión
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    console.log('🔑 [AuthService] Intento de login:', credentials.username);
    
    this.updateState({ isLoading: true });
    
    // Simular delay de red
    return timer(1000).pipe(
      map(() => this.validateCredentials(credentials)),
      tap(response => this.handleLoginResponse(response, credentials)),
      catchError(error => this.handleLoginError(error))
    );
  }

  /**
   * 🚪 Cerrar sesión
   */
  logout(reason: string = 'user_initiated'): void {
    console.log('🚪 [AuthService] Cerrando sesión:', reason);
    
    const currentUser = this.authState$.value.user;
    
    // Registrar evento de seguridad
    this.logSecurityEvent({
      type: 'logout',
      timestamp: new Date(),
      userId: currentUser?.id,
      details: { reason }
    });
    
    // Limpiar estado
    this.clearAuthState();
    this.clearStorage();
    this.clearTimers();
    
    console.log('✅ [AuthService] Sesión cerrada exitosamente');
  }

  /**
   * 🔄 Refrescar token
   */
  refreshToken(): Observable<boolean> {
    console.log('🔄 [AuthService] Refrescando token');
    
    const currentState = this.authState$.value;
    
    if (!currentState.token || !currentState.user) {
      return of(false);
    }
    
    // Simular refresh (en producción sería llamada al backend)
    const newToken: AuthToken = {
      token: this.generateMockToken(),
      expiresAt: new Date(Date.now() + this.CONFIG.SESSION_TIMEOUT * 60 * 1000)
    };
    
    this.updateState({ 
      token: newToken,
      lastActivity: new Date()
    });
    
    this.persistToStorage();
    this.setupSessionTimer();
    
    return of(true);
  }

  /**
   * 🔓 Verificar si está autenticado (sincronous)
   */
  isAuthenticatedSync(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  /**
   * 👤 Obtener usuario actual (synchronous)
   */
  getCurrentUserSync(): AuthUser | null {
    return this.authState$.value.user;
  }

  // 🛡️ Métodos de autorización

  /**
   * 🎭 Verificar si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const currentUser = this.getCurrentUserSync();
    return currentUser?.role === role;
  }

  /**
   * 🔑 Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: Permission): boolean {
    const currentUser = this.getCurrentUserSync();
    return currentUser?.permissions.includes(permission) || false;
  }

  /**
   * 🛡️ Verificar múltiples permisos (AND)
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * 🔓 Verificar algún permiso (OR)
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * 👑 Verificar si es admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * 🏗️ Verificar si es project manager o superior
   */
  canManageProjects(): boolean {
    return this.hasAnyPermission([Permission.PROJECTS_CREATE, Permission.PROJECTS_EDIT, Permission.PROJECTS_DELETE]);
  }

  /**
   * 👥 Verificar si puede gestionar usuarios
   */
  canManageUsers(): boolean {
    return this.hasAnyPermission([Permission.USERS_CREATE, Permission.USERS_EDIT, Permission.USERS_DELETE]);
  }

  // 🔧 Métodos privados

  /**
   * 🔍 Validar credenciales (mock)
   */
  private validateCredentials(credentials: LoginCredentials): AuthResponse {
    const { username, password } = credentials;
    
    // Verificar si está bloqueado
    if (this.isAccountLocked()) {
      return {
        success: false,
        message: `Cuenta bloqueada. Intente nuevamente en ${this.getRemainingLockoutTime()} minutos.`
      };
    }
    
    // Buscar usuario
    const user = MOCK_USERS.find(u => u.username === username);
    
    if (!user) {
      this.handleFailedAttempt();
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }
    
    // Verificar contraseña
    const validPassword = MOCK_CREDENTIALS[username] === password;
    
    if (!validPassword) {
      this.handleFailedAttempt();
      return {
        success: false,
        message: 'Contraseña incorrecta'
      };
    }
    
    // Login exitoso
    const token = this.generateMockToken();
    const expiresAt = new Date(Date.now() + this.CONFIG.SESSION_TIMEOUT * 60 * 1000);
    
    return {
      success: true,
      user: { ...user, lastLogin: new Date() },
      token,
      expiresAt,
      message: 'Login exitoso'
    };
  }

  /**
   * ✅ Manejar respuesta de login exitoso
   */
  private handleLoginResponse(response: AuthResponse, credentials: LoginCredentials): void {
    if (response.success && response.user && response.token) {
      const authToken: AuthToken = {
        token: response.token,
        expiresAt: response.expiresAt!
      };
      
      this.updateState({
        isAuthenticated: true,
        user: response.user,
        token: authToken,
        isLoading: false,
        lastActivity: new Date(),
        loginAttempts: 0,
        isLocked: false
      });
      
      this.persistToStorage();
      this.setupSessionTimer();
      
      // Log successful login
      this.logSecurityEvent({
        type: 'login',
        timestamp: new Date(),
        userId: response.user.id,
        details: { username: credentials.username }
      });
      
      console.log('✅ [AuthService] Login exitoso:', response.user.username);
    } else {
      this.updateState({ isLoading: false });
      console.log('❌ [AuthService] Login fallido:', response.message);
    }
  }

  /**
   * ❌ Manejar error de login
   */
  private handleLoginError(error: any): Observable<AuthResponse> {
    console.error('🚨 [AuthService] Error en login:', error);
    
    this.updateState({ isLoading: false });
    
    return of({
      success: false,
      message: 'Error interno del sistema'
    });
  }

  /**
   * 🚫 Manejar intento fallido
   */
  private handleFailedAttempt(): void {
    const currentAttempts = this.authState$.value.loginAttempts + 1;
    
    this.updateState({ 
      loginAttempts: currentAttempts,
      isLocked: currentAttempts >= this.CONFIG.MAX_LOGIN_ATTEMPTS
    });
    
    if (currentAttempts >= this.CONFIG.MAX_LOGIN_ATTEMPTS) {
      this.lockAccount();
    }
    
    this.logSecurityEvent({
      type: 'failed_attempt',
      timestamp: new Date(),
      details: { attempt: currentAttempts }
    });
  }

  /**
   * 🔒 Bloquear cuenta
   */
  private lockAccount(): void {
    console.log('🔒 [AuthService] Cuenta bloqueada por múltiples intentos fallidos');
    
    const lockoutEnd = new Date(Date.now() + this.CONFIG.LOCKOUT_DURATION * 60 * 1000);
    localStorage.setItem('provias_lockout', lockoutEnd.toISOString());
    
    this.updateState({ isLocked: true });
  }

  /**
   * 🔍 Verificar si la cuenta está bloqueada
   */
  private isAccountLocked(): boolean {
    const lockoutEnd = localStorage.getItem('provias_lockout');
    
    if (!lockoutEnd) return false;
    
    const lockoutTime = new Date(lockoutEnd);
    const now = new Date();
    
    if (now < lockoutTime) {
      return true;
    } else {
      // Lockout expirado, limpiar
      localStorage.removeItem('provias_lockout');
      return false;
    }
  }

  /**
   * ⏰ Obtener tiempo restante de bloqueo
   */
  private getRemainingLockoutTime(): number {
    const lockoutEnd = localStorage.getItem('provias_lockout');
    
    if (!lockoutEnd) return 0;
    
    const lockoutTime = new Date(lockoutEnd);
    const now = new Date();
    
    const diffMs = lockoutTime.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60)); // minutos
  }

  /**
   * 🔧 Actualizar estado
   */
  private updateState(partialState: Partial<AuthState>): void {
    const currentState = this.authState$.value;
    const newState = { ...currentState, ...partialState };
    this.authState$.next(newState);
  }

  /**
   * 🧹 Limpiar estado de autenticación
   */
  private clearAuthState(): void {
    this.updateState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      lastActivity: null,
      loginAttempts: 0,
      isLocked: false
    });
  }

  /**
   * 💾 Persistir estado en localStorage
   */
  private persistToStorage(): void {
    const state = this.authState$.value;
    
    if (state.isAuthenticated && state.user && state.token) {
      const persistData = {
        user: state.user,
        token: state.token,
        lastActivity: state.lastActivity
      };
      
      localStorage.setItem(this.CONFIG.STORAGE_KEY, JSON.stringify(persistData));
    }
  }

  /**
   * 🧹 Limpiar localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem(this.CONFIG.STORAGE_KEY);
    localStorage.removeItem('provias_lockout');
  }

  /**
   * 🔄 Inicializar desde localStorage
   */
  private initializeFromStorage(): void {
    const stored = localStorage.getItem(this.CONFIG.STORAGE_KEY);
    
    if (!stored) return;
    
    try {
      const data = JSON.parse(stored);
      
      // Verificar si el token no ha expirado
      if (data.token && new Date(data.token.expiresAt) > new Date()) {
        this.updateState({
          isAuthenticated: true,
          user: data.user,
          token: data.token,
          lastActivity: new Date(data.lastActivity)
        });
        
        this.setupSessionTimer();
        console.log('🔄 [AuthService] Sesión restaurada desde localStorage');
      } else {
        console.log('⏰ [AuthService] Token expirado, limpiando storage');
        this.clearStorage();
      }
    } catch (error) {
      console.error('❌ [AuthService] Error al restaurar sesión:', error);
      this.clearStorage();
    }
  }

  /**
   * ⏰ Configurar timer de sesión
   */
  private setupSessionTimer(): void {
    this.clearTimers();
    
    const token = this.authState$.value.token;
    if (!token) return;
    
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    if (timeUntilExpiry > 0) {
      this.sessionTimer = setTimeout(() => {
        console.log('⏰ [AuthService] Sesión expirada');
        this.logout('session_expired');
      }, timeUntilExpiry);
      
      console.log(`⏰ [AuthService] Timer de sesión configurado: ${Math.round(timeUntilExpiry / 1000 / 60)} minutos`);
    }
  }

  /**
   * 📊 Configurar monitoreo de sesión
   */
  private setupSessionMonitoring(): void {
    // Monitorear actividad del usuario para actualizar lastActivity
    ['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        if (this.isAuthenticatedSync()) {
          this.updateState({ lastActivity: new Date() });
        }
      }, { passive: true });
    });
  }

  /**
   * 🧹 Limpiar timers
   */
  private clearTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * 🎫 Generar token mock
   */
  private generateMockToken(): string {
    return 'mock_token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  /**
   * 🚨 Registrar evento de seguridad
   */
  private logSecurityEvent(event: SecurityEvent): void {
    const events = this.securityEvents$.value;
    const updatedEvents = [event, ...events].slice(0, 100); // Mantener solo los últimos 100
    
    this.securityEvents$.next(updatedEvents);
    
    // Persistir en localStorage para auditoría
    localStorage.setItem(this.CONFIG.SECURITY_LOG_KEY, JSON.stringify(updatedEvents));
    
    console.log('🚨 [AuthService] Evento de seguridad registrado:', event.type);
  }

  /**
   * 🔍 Obtener eventos de seguridad desde storage
   */
  getSecurityEventsFromStorage(): SecurityEvent[] {
    const stored = localStorage.getItem(this.CONFIG.SECURITY_LOG_KEY);
    
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * 🧹 Limpiar eventos de seguridad
   */
  clearSecurityEvents(): void {
    this.securityEvents$.next([]);
    localStorage.removeItem(this.CONFIG.SECURITY_LOG_KEY);
  }
}