import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  
  // 🏗️ Datos mock de proyectos
  projects = [
    { 
      id: 1, 
      name: 'Carretera Huancayo-Ayacucho', 
      status: 'in-progress',
      budget: 450000000,
      location: 'Huancavelica'
    },
    { 
      id: 2, 
      name: 'Puente Río Mantaro', 
      status: 'planning',
      budget: 85000000,
      location: 'Junín'
    },
    { 
      id: 3, 
      name: 'Rehabilitación Carretera Central', 
      status: 'completed',
      budget: 120000000,
      location: 'Lima'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🏗️ [ProjectsComponent] Página de proyectos protegida cargada');
  }

  /**
   * 🏠 Volver al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * 🚪 Cerrar sesión
   */
  logout(): void {
    this.authService.logout('user_logout');
    this.router.navigate(['/login']);
  }

  /**
   * ✅ Verificar si tiene permiso
   */
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission as any);
  }

  /**
   * 📊 Obtener cantidad de proyectos por estado
   */
  getProjectCountByStatus(status: string): number {
    return this.projects.filter(p => p.status === status).length;
  }

  /**
   * 💰 Obtener presupuesto total
   */
  getTotalBudget(): number {
    return this.projects.reduce((sum, project) => sum + project.budget, 0);
  }

  /**
   * 💰 Formatear presupuesto
   */
  formatBudget(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * 📊 Obtener texto del estado
   */
  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'planning': 'En Planificación',
      'in-progress': 'En Ejecución',
      'completed': 'Completado',
      'on-hold': 'En Pausa'
    };
    return statusTexts[status] || status;
  }
}