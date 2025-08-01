import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // 📊 Estadísticas del dashboard
  stats = {
    totalProjects: 15,
    activeUsers: 8,
    completedTasks: 142,
    pendingReviews: 7
  };

  // 📰 Noticias recientes
  recentNews = [
    {
      id: 1,
      title: 'Nueva carretera Huancayo-Ayacucho en construcción',
      date: new Date('2025-07-29'),
      priority: 'high'
    },
    {
      id: 2,
      title: 'Mantenimiento de puentes programado para agosto',
      date: new Date('2025-07-28'),
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Actualización del sistema de monitoreo',
      date: new Date('2025-07-27'),
      priority: 'low'
    }
  ];

  // 🚀 Accesos rápidos
  quickActions = [
    { 
      title: 'Gestión de Usuarios', 
      route: '/users', 
      icon: '👥',
      description: 'Administrar usuarios del sistema'
    },
    { 
      title: 'Ver Proyectos', 
      route: '/projects', 
      icon: '🏗️',
      description: 'Consultar estado de proyectos'
    },
    { 
      title: 'Configuración', 
      route: '/admin', 
      icon: '⚙️',
      description: 'Configuración del sistema'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('🏠 [DashboardComponent] Cargando dashboard principal');
  }

  /**
   * 🎯 Navegar a una ruta específica
   */
  navigateTo(route: string): void {
    console.log('🧭 [DashboardComponent] Navegando a:', route);
    this.router.navigate([route]);
  }

  /**
   * 📊 Obtener clase CSS según prioridad
   */
  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  /**
   * 📅 Formatear fecha para mostrar
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}