import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {
  
  // 🎲 Mensajes aleatorios de error 404
  errorMessages = [
    '¡Esta página se perdió como turista en Lima! 🗺️',
    'Error 404: Página en construcción desde 2019 🚧',
    'Esta URL no existe, ni Google Maps la encuentra 📍',
    'Página perdida en el sistema vial peruano 🛣️',
    '404: Esta ruta necesita mantenimiento urgente ⚠️'
  ];

  currentMessage: string = '';
  currentUrl: string = '';

  // 🎯 Rutas sugeridas
  suggestedRoutes = [
    {
      path: '/login',
      icon: '🔑',
      title: 'Iniciar Sesión',
      description: 'Accede al sistema PROVIAS'
    },
    {
      path: '/dashboard',
      icon: '🏠',
      title: 'Dashboard',
      description: 'Página principal (requiere login)'
    },
    {
      path: '/users',
      icon: '👥',
      title: 'Usuarios',
      description: 'Gestión de usuarios (requiere login)'
    },
    {
      path: '/projects',
      icon: '🏗️',
      title: 'Proyectos',
      description: 'Gestión de proyectos (requiere login)'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentMessage = this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
    this.currentUrl = window.location.pathname;
    
    console.log('🚫 [NotFoundComponent] Página 404 cargada');
    console.log('📍 [NotFoundComponent] URL no encontrada:', this.currentUrl);
  }

  /**
   * 🧭 Navegar a ruta
   */
  navigateTo(route: string): void {
    console.log('🧭 [NotFoundComponent] Navegando a:', route);
    this.router.navigate([route]);
  }

  /**
   * ⬅️ Volver atrás
   */
  goBack(): void {
    console.log('⬅️ [NotFoundComponent] Volviendo atrás');
    window.history.back();
  }

  /**
   * 🔄 Recargar página
   */
  reloadPage(): void {
    console.log('🔄 [NotFoundComponent] Recargando página');
    window.location.reload();
  }

  /**
   * 🎲 Generar nuevo mensaje
   */
  getNewMessage(): void {
    const currentIndex = this.errorMessages.indexOf(this.currentMessage);
    let newIndex = currentIndex;
    
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * this.errorMessages.length);
    }
    
    this.currentMessage = this.errorMessages[newIndex];
  }
}