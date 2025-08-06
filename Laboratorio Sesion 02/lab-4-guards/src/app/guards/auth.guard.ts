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

/**
 * 🛡️ Guard de Autenticación
 * 
 * Protege rutas que requieren que el usuario esté autenticado.
 * Implementa múltiples interfaces para máxima flexibilidad:
 * - CanActivate: Protege rutas específicas
 * - CanActivateChild: Protege rutas hijas
 * - CanLoad: Protege lazy loading modules
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    console.log('🛡️ [AuthGuard] Guard de autenticación inicializado');
  }

  /**
   * 🔐 Verificar si puede activar una ruta
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('🔐 [AuthGuard] Verificando acceso a ruta:', state.url);
    
    return this.checkAuthentication(state.url);
  }

  /**
   * 👶 Verificar si puede activar rutas hijas
   */
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('👶 [AuthGuard] Verificando acceso a ruta hija:', state.url);
    
    return this.checkAuthentication(state.url);
  }

  /**
   * 📦 Verificar si puede cargar un módulo lazy
   */
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> {
    const url = `/${segments.map(s => s.path).join('/')}`;
    console.log('📦 [AuthGuard] Verificando carga de módulo lazy:', url);
    
    return this.checkAuthentication(url);
  }

  /**
   * 🔍 Verificación central de autenticación
   */
  private checkAuthentication(attemptedUrl: string): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      tap(isAuthenticated => {
        if (isAuthenticated) {
          console.log('✅ [AuthGuard] Usuario autenticado, acceso permitido');
        } else {
          console.log('❌ [AuthGuard] Usuario no autenticado, redirigiendo a login');
          this.handleUnauthenticated(attemptedUrl);
        }
      }),
      catchError(error => {
        console.error('🚨 [AuthGuard] Error verificando autenticación:', error);
        this.handleUnauthenticated(attemptedUrl);
        return of(false);
      })
    );
  }

  /**
   * 🚫 Manejar usuario no autenticado
   */
  private handleUnauthenticated(attemptedUrl: string): void {
    // Guardar URL intentada para redirección después del login
    sessionStorage.setItem('provias_redirect_url', attemptedUrl);
    
    // Redirigir a página de login
    this.router.navigate(['/login'], {
      queryParams: { 
        returnUrl: attemptedUrl,
        reason: 'authentication_required'
      }
    });
  }
}