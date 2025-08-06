import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  CanLoad, 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  Route,
  UrlSegment 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserRole, Permission } from '../models/auth';

/**
 * 👑 Guard de Administrador
 * 
 * Protege rutas que requieren permisos de administrador.
 * Verifica tanto autenticación como autorización.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('👑 [AdminGuard] Guard de administrador inicializado');
  }

  /**
   * 🔐 Verificar si puede activar una ruta
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('👑 [AdminGuard] Verificando acceso admin a ruta:', state.url);
    
    return this.checkAdminAccess(route, state.url);
  }

  /**
   * 👶 Verificar si puede activar rutas hijas
   */
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('👑 [AdminGuard] Verificando acceso admin a ruta hija:', state.url);
    
    return this.checkAdminAccess(route, state.url);
  }

  /**
   * 📦 Verificar si puede cargar un módulo lazy
   */
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> {
    const url = `/${segments.map(s => s.path).join('/')}`;
    console.log('📦 [AdminGuard] Verificando carga admin de módulo lazy:', url);
    
    return this.checkAdminAccess(null, url, route);
  }

  /**
   * 🔍 Verificación central de acceso de administrador
   */
  private checkAdminAccess(
    route: ActivatedRouteSnapshot | null, 
    url: string, 
    lazyRoute?: Route
  ): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('❌ [AdminGuard] Usuario no autenticado');
          this.handleUnauthenticated(url);
          return false;
        }

        const user = this.authService.getCurrentUserSync();
        
        if (!user) {
          console.log('❌ [AdminGuard] No se pudo obtener información del usuario');
          this.handleUnauthenticated(url);
          return false;
        }

        // Verificar permisos específicos de la ruta
        const requiredPermissions = this.getRequiredPermissions(route, lazyRoute);
        
        if (requiredPermissions.length > 0) {
          const hasPermissions = this.authService.hasAllPermissions(requiredPermissions);
          
          if (!hasPermissions) {
            console.log('❌ [AdminGuard] Usuario sin permisos suficientes:', requiredPermissions);
            this.handleUnauthorized(url, requiredPermissions);
            return false;
          }
        }

        // Verificar si es admin o tiene permisos de admin panel
        const hasAdminAccess = this.authService.isAdmin() || 
                              this.authService.hasPermission(Permission.ADMIN_PANEL);

        if (!hasAdminAccess) {
          console.log('❌ [AdminGuard] Usuario sin acceso de administrador');
          console.log('👤 [AdminGuard] Rol actual:', user.role);
          console.log('🔑 [AdminGuard] Permisos:', user.permissions);
          
          this.handleUnauthorized(url, [Permission.ADMIN_PANEL]);
          return false;
        }

        console.log('✅ [AdminGuard] Acceso de administrador concedido');
        console.log('👤 [AdminGuard] Usuario:', user.fullName, '- Rol:', user.role);
        
        return true;
      }),
      catchError(error => {
        console.error('🚨 [AdminGuard] Error verificando acceso admin:', error);
        this.handleError(url);
        return of(false);
      })
    );
  }

  /**
   * 🔑 Obtener permisos requeridos desde los datos de la ruta
   */
  private getRequiredPermissions(
    route: ActivatedRouteSnapshot | null, 
    lazyRoute?: Route
  ): Permission[] {
    // Buscar permisos requeridos en los datos de la ruta
    const routeData = route?.data || lazyRoute?.data || {};
    
    if (routeData['requiredPermissions']) {
      return Array.isArray(routeData['requiredPermissions']) 
        ? routeData['requiredPermissions'] 
        : [routeData['requiredPermissions']];
    }

    // Mapeo por defecto basado en la ruta
    const url = route?.routeConfig?.path || lazyRoute?.path || '';
    
    if (url.includes('admin')) {
      return [Permission.ADMIN_PANEL];
    }
    
    if (url.includes('users')) {
      return [Permission.ADMIN_USERS];
    }
    
    if (url.includes('settings')) {
      return [Permission.ADMIN_SETTINGS];
    }
    
    if (url.includes('logs')) {
      return [Permission.ADMIN_LOGS];
    }

    return [];
  }

  /**
   * 🚫 Manejar usuario no autenticado
   */
  private handleUnauthenticated(attemptedUrl: string): void {
    sessionStorage.setItem('provias_redirect_url', attemptedUrl);
    
    this.router.navigate(['/login'], {
      queryParams: { 
        returnUrl: attemptedUrl,
        reason: 'authentication_required'
      }
    });
  }

  /**
   * 🔒 Manejar usuario sin autorización
   */
  private handleUnauthorized(attemptedUrl: string, requiredPermissions: Permission[]): void {
    console.log('🔒 [AdminGuard] Acceso denegado - Permisos insuficientes');
    
    // Registrar intento de acceso no autorizado
    const user = this.authService.getCurrentUserSync();
    
    if (user) {
      console.log(`🚨 [AdminGuard] Usuario ${user.username} intentó acceder a ${attemptedUrl} sin permisos`);
    }

    // Redirigir a página de acceso denegado
    this.router.navigate(['/access-denied'], {
      queryParams: {
        reason: 'insufficient_permissions',
        requiredPermissions: requiredPermissions.join(','),
        attemptedUrl: attemptedUrl
      }
    });
  }

  /**
   * ❌ Manejar errores
   */
  private handleError(attemptedUrl: string): void {
    console.error('❌ [AdminGuard] Error interno, redirigiendo a página de error');
    
    this.router.navigate(['/error'], {
      queryParams: {
        reason: 'guard_error',
        attemptedUrl: attemptedUrl
      }
    });
  }
}