import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  laboratories = [
    {
      id: 1,
      title: 'LAB 1: Directivas Estructurales',
      description: 'Dominar @if, @for, @switch con casos reales',
      route: '/project-dashboard',
      icon: '🏗️',
      status: 'completed'
    },
    {
      id: 2,
      title: 'LAB 2: Directivas de Atributo',
      description: 'NgClass, NgStyle y NgModel avanzados',
      route: '/theme-configurator',
      icon: '🎨',
      status: 'completed'
    },
    {
      id: 3,
      title: 'LAB 3: Directivas Personalizadas',
      description: 'Tooltip, LazyLoad y ValidationFeedback',
      route: '/custom-directives',
      icon: '⚡',
      status: 'completed'
    },
    {
      id: 4,
      title: 'LAB 4: Drag & Drop Completo',
      description: 'Sistema Kanban con directivas avanzadas',
      route: '/kanban-board',
      icon: '🎯',
      status: 'pending'
    }
  ];

  constructor() {
    console.log('🧭 Navigation Component inicializado');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}