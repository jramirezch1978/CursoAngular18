import { Injectable } from '@angular/core';
import { User, LoginRequest, LoginResponse } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Verificar si hay un usuario en localStorage al inicializar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(credentials: LoginRequest): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      // Simulación de login
      if (credentials.email === 'admin@provias.gob.pe' && credentials.password === 'admin123') {
        const user: User = {
          id: 1,
          name: 'Administrador PROVIAS',
          email: credentials.email,
          role: 'admin',
          isActive: true,
          createdAt: new Date()
        };

        const response: LoginResponse = {
          user,
          token: 'fake-jwt-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        };

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authToken', response.token);

        resolve(response);
      } else {
        reject(new Error('Credenciales inválidas'));
      }
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && localStorage.getItem('isAuthenticated') === 'true';
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
} 