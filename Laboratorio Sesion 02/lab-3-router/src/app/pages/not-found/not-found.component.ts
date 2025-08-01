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
  
  // 🎯 Rutas sugeridas para el usuario
  suggestedRoutes = [
    {
      path: '/dashboard',
      icon: '🏠',
      title: 'Dashboard Principal',
      description: 'Página principal con estadísticas y accesos rápidos'
    },
    {
      path: '/users',
      icon: '👥',
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema PROVIAS'
    },
    {
      path: '/projects',
      icon: '🏗️',
      title: 'Gestión de Proyectos',
      description: 'Supervisa proyectos de infraestructura vial'
    }
  ];

  // 🎲 Mensajes aleatorios de error 404
  errorMessages = [
    '¡Oops! Esta ruta se perdió en el camino como un GPS sin señal 📡',
    '404: Esta página está en construcción... desde 2019 🚧',
    'Esta URL no existe, como las promesas de campaña 🗳️',
    'Página no encontrada. Ni siquiera Google Maps la puede ubicar 🗺️',
    'Error 404: Esta ruta está más perdida que turista en Lima 🚗'
  ];

  currentMessage: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Seleccionar mensaje aleatorio
    this.currentMessage = this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
    
    console.log('🚫 [NotFoundComponent] Página 404 cargada');
    console.log('📍 [NotFoundComponent] URL actual:', window.location.pathname);
  }

  /**
   * 🏠 Navegar al dashboard principal
   */
  goHome(): void {
    console.log('🏠 [NotFoundComponent] Navegando al dashboard');
    this.router.navigate(['/dashboard']);
  }

  /**
   * ⬅️ Volver a la página anterior
   */
  goBack(): void {
    console.log('⬅️ [NotFoundComponent] Volviendo a la página anterior');
    window.history.back();
  }

  /**
   * 🧭 Navegar a una ruta específica
   */
  navigateTo(route: string): void {
    console.log('🧭 [NotFoundComponent] Navegando a:', route);
    this.router.navigate([route]);
  }

  /**
   * 🔄 Recargar la página
   */
  reloadPage(): void {
    console.log('🔄 [NotFoundComponent] Recargando página');
    window.location.reload();
  }

  /**
   * 📊 Obtener URL actual
   */
  getCurrentUrl(): string {
    return window.location.pathname;
  }

  /**
   * 🎲 Generar nuevo mensaje aleatorio
   */
  getRandomMessage(): void {
    const currentIndex = this.errorMessages.indexOf(this.currentMessage);
    let newIndex = currentIndex;
    
    // Asegurar que sea un mensaje diferente
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * this.errorMessages.length);
    }
    
    this.currentMessage = this.errorMessages[newIndex];
  }
}