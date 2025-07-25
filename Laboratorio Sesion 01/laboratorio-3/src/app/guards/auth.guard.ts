import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Simulación de verificación de autenticación
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    console.log('Acceso denegado: Usuario no autenticado');
    return false;
  }
  
  return true;
}; 