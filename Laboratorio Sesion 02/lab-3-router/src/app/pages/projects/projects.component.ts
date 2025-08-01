import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: Date;
  endDate?: Date;
  budget: number;
  location: string;
  priority: 'low' | 'medium' | 'high';
  assignedUsers: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  
  // 🏗️ Lista de proyectos mock
  projects: Project[] = [
    {
      id: 1,
      name: 'Carretera Huancayo - Ayacucho',
      description: 'Construcción y mejoramiento de 185 km de carretera asfaltada',
      status: 'in-progress',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2026-12-30'),
      budget: 450000000,
      location: 'Huancavelica - Ayacucho',
      priority: 'high',
      assignedUsers: 12
    },
    {
      id: 2,
      name: 'Puente Río Mantaro',
      description: 'Construcción de puente colgante de 280m de longitud',
      status: 'planning',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2027-08-15'),
      budget: 85000000,
      location: 'Junín',
      priority: 'medium',
      assignedUsers: 8
    },
    {
      id: 3,
      name: 'Rehabilitación Carretera Central',
      description: 'Mantenimiento y rehabilitación de 95 km de la Carretera Central',
      status: 'completed',
      startDate: new Date('2023-09-10'),
      endDate: new Date('2024-11-20'),
      budget: 120000000,
      location: 'Lima - Junín',
      priority: 'high',
      assignedUsers: 6
    },
    {
      id: 4,
      name: 'Túnel San Mateo',
      description: 'Construcción de túnel vehicular de 1.2 km',
      status: 'on-hold',
      startDate: new Date('2024-08-01'),
      budget: 220000000,
      location: 'Lima',
      priority: 'low',
      assignedUsers: 4
    }
  ];

  // 🔍 Filtros activos
  currentStatusFilter: string = 'all';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🏗️ [ProjectsComponent] Cargando página de proyectos');
    
    // 📖 Leer query parameters para filtros
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.currentStatusFilter = params['status'];
        console.log('🔍 [ProjectsComponent] Filtro aplicado:', this.currentStatusFilter);
      }
    });
  }

  /**
   * 🏗️ Ver detalles de un proyecto específico
   */
  viewProject(projectId: number): void {
    console.log('🔍 [ProjectsComponent] Navegando a detalles del proyecto:', projectId);
    this.router.navigate(['/projects', projectId]);
  }

  /**
   * ✏️ Editar proyecto
   */
  editProject(projectId: number): void {
    console.log('✏️ [ProjectsComponent] Navegando a edición del proyecto:', projectId);
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  /**
   * 📊 Filtrar proyectos por estado
   */
  filterByStatus(status: string): void {
    this.currentStatusFilter = status;
    const queryParams = status !== 'all' ? { status } : {};
    this.router.navigate(['/projects'], { queryParams });
  }

  /**
   * 🏠 Volver al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * ➕ Crear nuevo proyecto
   */
  createProject(): void {
    this.router.navigate(['/projects', 'new']);
  }

  /**
   * 📊 Obtener proyectos filtrados
   */
  getFilteredProjects(): Project[] {
    if (this.currentStatusFilter === 'all') {
      return this.projects;
    }
    return this.projects.filter(project => project.status === this.currentStatusFilter);
  }

  /**
   * 📈 Obtener estadísticas por estado
   */
  getProjectsByStatus(status: string): Project[] {
    return this.projects.filter(project => project.status === status);
  }

  /**
   * 💰 Formatear presupuesto
   */
  formatBudget(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * 📅 Formatear fecha
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * 🎨 Obtener clase CSS según estado
   */
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  /**
   * 🎨 Obtener clase CSS según prioridad
   */
  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  /**
   * 📊 Obtener texto del estado
   */
  getStatusText(status: string): string {
    const statusTexts = {
      'planning': 'En Planificación',
      'in-progress': 'En Ejecución',
      'completed': 'Completado',
      'on-hold': 'En Pausa'
    };
    return statusTexts[status] || status;
  }

  /**
   * 🎯 Obtener texto de prioridad
   */
  getPriorityText(priority: string): string {
    const priorityTexts = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return priorityTexts[priority] || priority;
  }

  /**
   * ⏱️ Calcular duración del proyecto
   */
  getProjectDuration(project: Project): string {
    const endDate = project.endDate || new Date();
    const diffInDays = Math.ceil((endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffInDays / 30);
    return `${months} meses`;
  }
}