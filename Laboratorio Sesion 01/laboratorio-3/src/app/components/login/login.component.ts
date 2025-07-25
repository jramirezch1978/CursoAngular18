import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interfaces/user.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.credentials)
      .then(response => {
        this.successMessage = `¡Bienvenido ${response.user.name}!`;
        console.log('Login exitoso:', response);
      })
      .catch(error => {
        this.errorMessage = error.message || 'Error en el login';
        console.error('Error en login:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  logout(): void {
    this.authService.logout();
    this.successMessage = 'Sesión cerrada exitosamente';
  }
} 