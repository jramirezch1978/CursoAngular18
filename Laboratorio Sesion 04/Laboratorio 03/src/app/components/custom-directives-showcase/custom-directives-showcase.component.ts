import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importar todas las directivas
import { ValidationFeedbackDirective } from '../../directives/validation-feedback.directive';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-custom-directives-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ValidationFeedbackDirective,
    LazyLoadDirective,
    TooltipDirective,
    HasPermissionDirective
  ],
  templateUrl: './custom-directives-showcase.component.html',
  styleUrl: './custom-directives-showcase.component.scss'
})
export class CustomDirectivesShowcaseComponent {
  // Señales para el estado de validación
  emailValidation = signal<'valid' | 'invalid' | 'pending' | 'neutral'>('neutral');
  passwordValidation = signal<'valid' | 'invalid' | 'pending' | 'neutral'>('neutral');
  
  // Datos del formulario
  email = signal('');
  password = signal('');
  
  // Control de role para demostración de permisos
  currentRole = signal('user');
  
  // URLs de imágenes para lazy loading
  imageUrls = [
    'https://picsum.photos/300/200?random=1',
    'https://picsum.photos/300/200?random=2',
    'https://picsum.photos/300/200?random=3',
    'https://picsum.photos/300/200?random=4',
    'https://picsum.photos/300/200?random=5',
    'https://picsum.photos/300/200?random=6'
  ];

  constructor() {
    // Establecer role inicial desde localStorage
    const savedRole = localStorage.getItem('userRole') || 'user';
    this.currentRole.set(savedRole);
  }

  // Validación de email
  onEmailChange() {
    const emailValue = this.email();
    this.emailValidation.set('pending');
    
    // Simular validación asíncrona
    setTimeout(() => {
      if (!emailValue) {
        this.emailValidation.set('neutral');
      } else if (this.isValidEmail(emailValue)) {
        this.emailValidation.set('valid');
      } else {
        this.emailValidation.set('invalid');
      }
    }, 500);
  }

  // Validación de password
  onPasswordChange() {
    const passwordValue = this.password();
    this.passwordValidation.set('pending');
    
    setTimeout(() => {
      if (!passwordValue) {
        this.passwordValidation.set('neutral');
      } else if (passwordValue.length >= 8) {
        this.passwordValidation.set('valid');
      } else {
        this.passwordValidation.set('invalid');
      }
    }, 300);
  }

  // Cambiar role de usuario
  changeRole(role: 'admin' | 'user' | 'guest') {
    localStorage.setItem('userRole', role);
    this.currentRole.set(role);
    // Recargar para que las directivas de permisos se actualicen
    setTimeout(() => window.location.reload(), 100);
  }

  // Método para simular carga manual de imágenes
  scrollToImages() {
    const element = document.getElementById('lazy-images');
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
