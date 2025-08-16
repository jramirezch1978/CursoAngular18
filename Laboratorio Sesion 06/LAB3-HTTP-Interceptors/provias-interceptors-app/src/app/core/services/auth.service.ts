/**
 * AUTH SERVICE - LAB 3: HTTP Interceptors
 * 
 * Servicio de autenticación que maneja login, logout, refresh tokens y estado de sesión.
 * Integrado con interceptors para automatización de tareas de autenticación.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. GESTIÓN DE ESTADO DE AUTENTICACIÓN:
 *    - Signals reactivos para estado del usuario
 *    - Persistencia en localStorage
 *    - Verificación automática de tokens
 * 
 * 2. SEGURIDAD:
 *    - Tokens JWT con expiración
 *    - Refresh tokens para renovación automática
 *    - URLs públicas que no requieren autenticación
 * 
 * 3. INTEGRACIÓN CON INTERCEPTORS:
 *    - Métodos para verificar si URLs son públicas
 *    - Refresh automático de tokens expirados
 *    - Logout automático en caso de errores de auth
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, delay, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SessionInfo,
  AuthState,
  isUser,
  isValidToken,
  isTokenNearExpiry
} from '../models/user.model';

/**
 * Configuración del servicio de autenticación
 */
interface AuthConfig {
  apiUrl: string;
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  expiryKey: string;
  autoRefreshThreshold: number; // Minutos antes de expiración para auto-refresh
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  // ========================================
  // CONFIGURACIÓN
  // ========================================
  
  private readonly config: AuthConfig = {
    apiUrl: 'http://localhost:3000/api/auth',
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'auth_user',
    expiryKey: 'token_expires',
    autoRefreshThreshold: 5 // 5 minutos
  };
  
  /**
   * URLs públicas que no requieren autenticación
   */
  public readonly publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/public',
    '/api/public'
  ];
  
  // ========================================
  // ESTADO REACTIVO
  // ========================================
  
  /**
   * Signals para estado de autenticación
   */
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<User | null>(this.getStoredUser());
  private authStateSignal = signal<AuthState>(AuthState.LOADING);
  private refreshTokenSignal = signal<string | null>(this.getStoredRefreshToken());
  
  /**
   * Computed signals públicos
   */
  token = computed(() => this.tokenSignal());
  user = computed(() => this.userSignal());
  authState = computed(() => this.authStateSignal());
  refreshToken = computed(() => this.refreshTokenSignal());
  
  isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    const user = this.userSignal();
    return !!(token && user && this.authStateSignal() === AuthState.AUTHENTICATED);
  });
  
  isLoading = computed(() => this.authStateSignal() === AuthState.LOADING);
  hasError = computed(() => this.authStateSignal() === AuthState.ERROR);
  
  /**
   * Información de sesión computada
   */
  sessionInfo = computed((): SessionInfo | null => {
    const user = this.userSignal();
    const token = this.tokenSignal();
    
    if (!user || !token) return null;
    
    const expiresAt = this.getTokenExpiryDate();
    if (!expiresAt) return null;
    
    const now = new Date();
    const isExpired = expiresAt <= now;
    const timeUntilExpiry = Math.max(0, expiresAt.getTime() - now.getTime());
    
    return {
      user,
      token,
      expiresAt,
      isExpired,
      timeUntilExpiry
    };
  });
  
  /**
   * Subject para notificar cambios de autenticación
   */
  private authChange$ = new BehaviorSubject<boolean>(this.isAuthenticated());
  
  // ========================================
  // CONSTRUCTOR E INICIALIZACIÓN
  // ========================================
  
  constructor() {
    this.initializeAuth();
    
    // Observar cambios en isAuthenticated y emitir en el subject
    this.isAuthenticated.subscribe(isAuth => {
      this.authChange$.next(isAuth);
    });
    
    // Configurar auto-refresh de tokens
    this.setupAutoRefresh();
  }
  
  /**
   * Inicializar estado de autenticación
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user && this.isTokenValid(token)) {
      this.authStateSignal.set(AuthState.AUTHENTICATED);
      console.log('🔐 Auth initialized - User authenticated:', user.email);
    } else {
      this.clearAuthData();
      this.authStateSignal.set(AuthState.UNAUTHENTICATED);
      console.log('🔐 Auth initialized - No valid session found');
    }
  }
  
  // ========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ========================================
  
  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.authStateSignal.set(AuthState.LOADING);
    
    // En desarrollo, usar mock login
    if (this.isDevelopmentMode()) {
      return this.mockLogin(credentials);
    }
    
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response);
        this.authStateSignal.set(AuthState.AUTHENTICATED);
        console.log('🔐 Login successful:', response.user.email);
      }),
      catchError(error => {
        this.authStateSignal.set(AuthState.ERROR);
        console.error('🔐 Login failed:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Logout de usuario
   */
  logout(): Observable<void> {
    const token = this.tokenSignal();
    
    // Limpiar datos locales inmediatamente
    this.clearAuthData();
    this.authStateSignal.set(AuthState.UNAUTHENTICATED);
    
    // Notificar al servidor (opcional)
    if (token) {
      return this.http.post<void>(`${this.config.apiUrl}/logout`, { token }).pipe(
        tap(() => console.log('🔐 Logout successful')),
        catchError(error => {
          console.warn('🔐 Logout server notification failed:', error);
          return of(void 0); // No fallar el logout por errores del servidor
        })
      );
    }
    
    console.log('🔐 Logout completed (local only)');
    return of(void 0);
  }
  
  /**
   * Registro de nuevo usuario
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    this.authStateSignal.set(AuthState.LOADING);
    
    return this.http.post<RegisterResponse>(`${this.config.apiUrl}/register`, userData).pipe(
      tap(response => {
        console.log('🔐 Registration successful:', response.user.email);
        // No autenticar automáticamente después del registro
        this.authStateSignal.set(AuthState.UNAUTHENTICATED);
      }),
      catchError(error => {
        this.authStateSignal.set(AuthState.ERROR);
        console.error('🔐 Registration failed:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Refrescar token de autenticación
   */
  refreshAuthToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.refreshTokenSignal();
    
    if (!refreshToken) {
      console.warn('🔐 No refresh token available');
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
    
    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<RefreshTokenResponse>(`${this.config.apiUrl}/refresh`, request).pipe(
      tap(response => {
        // Actualizar solo el token, mantener usuario actual
        this.tokenSignal.set(response.token);
        if (response.refreshToken) {
          this.refreshTokenSignal.set(response.refreshToken);
        }
        
        // Actualizar fecha de expiración
        const expiresAt = new Date(Date.now() + (response.expiresIn * 1000));
        localStorage.setItem(this.config.expiryKey, expiresAt.toISOString());
        
        console.log('🔐 Token refreshed successfully');
      }),
      catchError(error => {
        console.error('🔐 Token refresh failed:', error);
        this.logout(); // Logout si no se puede refrescar
        return throwError(() => error);
      })
    );
  }
  
  // ========================================
  // MÉTODOS DE UTILIDAD PARA INTERCEPTORS
  // ========================================
  
  /**
   * Verificar si una URL requiere autenticación
   */
  isPublicUrl(url: string): boolean {
    return this.publicUrls.some(publicUrl => url.includes(publicUrl));
  }
  
  /**
   * Verificar si el token está próximo a expirar
   */
  isTokenNearExpiry(): boolean {
    const expiryDate = this.getTokenExpiryDate();
    if (!expiryDate) return true;
    
    return isTokenNearExpiry(expiryDate, this.config.autoRefreshThreshold);
  }
  
  /**
   * Obtener headers de autenticación
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.tokenSignal();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'X-Auth-Token': token
    };
  }
  
  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================
  
  /**
   * Guardar datos de autenticación
   */
  private setAuthData(response: LoginResponse): void {
    this.tokenSignal.set(response.token);
    this.userSignal.set(response.user);
    
    if (response.refreshToken) {
      this.refreshTokenSignal.set(response.refreshToken);
    }
    
    // Persistir en localStorage
    localStorage.setItem(this.config.tokenKey, response.token);
    localStorage.setItem(this.config.userKey, JSON.stringify(response.user));
    
    if (response.refreshToken) {
      localStorage.setItem(this.config.refreshTokenKey, response.refreshToken);
    }
    
    // Calcular y guardar fecha de expiración
    const expiresAt = new Date(Date.now() + (response.expiresIn * 1000));
    localStorage.setItem(this.config.expiryKey, expiresAt.toISOString());
  }
  
  /**
   * Limpiar datos de autenticación
   */
  private clearAuthData(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.refreshTokenSignal.set(null);
    
    localStorage.removeItem(this.config.tokenKey);
    localStorage.removeItem(this.config.userKey);
    localStorage.removeItem(this.config.refreshTokenKey);
    localStorage.removeItem(this.config.expiryKey);
  }
  
  /**
   * Obtener token almacenado
   */
  private getStoredToken(): string | null {
    const token = localStorage.getItem(this.config.tokenKey);
    if (!token) return null;
    
    // Verificar si el token no ha expirado
    const expiryDate = this.getTokenExpiryDate();
    if (expiryDate && expiryDate <= new Date()) {
      console.log('🔐 Stored token has expired');
      return null;
    }
    
    return isValidToken(token) ? token : null;
  }
  
  /**
   * Obtener usuario almacenado
   */
  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.config.userKey);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return isUser(user) ? user : null;
    } catch {
      console.warn('🔐 Invalid user data in localStorage');
      return null;
    }
  }
  
  /**
   * Obtener refresh token almacenado
   */
  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.config.refreshTokenKey);
  }
  
  /**
   * Obtener fecha de expiración del token
   */
  private getTokenExpiryDate(): Date | null {
    const expiryStr = localStorage.getItem(this.config.expiryKey);
    if (!expiryStr) return null;
    
    const expiryDate = new Date(expiryStr);
    return isNaN(expiryDate.getTime()) ? null : expiryDate;
  }
  
  /**
   * Verificar si un token es válido
   */
  private isTokenValid(token: string): boolean {
    if (!isValidToken(token)) return false;
    
    const expiryDate = this.getTokenExpiryDate();
    return expiryDate ? expiryDate > new Date() : false;
  }
  
  /**
   * Verificar si está en modo desarrollo
   */
  private isDevelopmentMode(): boolean {
    return !environment.production;
  }
  
  /**
   * Mock login para desarrollo
   */
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 Using mock login for development');
    
    // Simular delay de red
    return of({
      user: {
        id: 1,
        email: credentials.email,
        name: credentials.email.includes('admin') ? 'Administrador PROVIAS' : 'Usuario PROVIAS',
        role: credentials.email.includes('admin') ? 'admin' as const : 'user' as const,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.email)}&background=667eea&color=fff`,
        lastLogin: new Date().toISOString(),
        isActive: true
      },
      token: this.generateMockToken(),
      refreshToken: this.generateMockRefreshToken(),
      expiresIn: 3600, // 1 hora
      tokenType: 'Bearer'
    }).pipe(
      delay(1000), // Simular delay de red
      tap(response => {
        console.log('🔐 Mock login successful:', response.user.email);
      })
    );
  }
  
  /**
   * Generar token mock para desarrollo
   */
  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: '1', 
      email: 'user@provias.gob.pe',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = btoa('mock-signature-' + Date.now());
    
    return `${header}.${payload}.${signature}`;
  }
  
  /**
   * Generar refresh token mock para desarrollo
   */
  private generateMockRefreshToken(): string {
    return btoa('mock-refresh-token-' + Date.now() + '-' + Math.random());
  }
  
  /**
   * Configurar auto-refresh de tokens
   */
  private setupAutoRefresh(): void {
    // Verificar cada minuto si el token necesita renovarse
    setInterval(() => {
      if (this.isAuthenticated() && this.isTokenNearExpiry()) {
        console.log('🔐 Token near expiry, attempting auto-refresh');
        this.refreshAuthToken().subscribe({
          next: () => console.log('🔐 Auto-refresh successful'),
          error: (error) => console.error('🔐 Auto-refresh failed:', error)
        });
      }
    }, 60000); // Cada minuto
  }
  
  /**
   * Observable para cambios de autenticación
   */
  getAuthChange$(): Observable<boolean> {
    return this.authChange$.asObservable();
  }
}

// Importar environment (esto debería estar al inicio del archivo)
declare const environment: any;
