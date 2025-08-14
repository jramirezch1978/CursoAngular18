import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Project, 
  ProjectType, 
  ProjectStatus, 
  Priority, 
  ProjectFilter 
} from '../../interfaces/infrastructure.interface';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent {
  // Enums para el template
  readonly ProjectType = ProjectType;
  readonly ProjectStatus = ProjectStatus;
  readonly Priority = Priority;
  readonly Object = Object; // Para usar Object.entries en el template

  // Signals para el estado local del componente
  readonly viewMode = signal<'grid' | 'list' | 'kanban'>('grid');
  readonly searchTerm = signal<string>('');
  readonly selectedTypes = signal<ProjectType[]>([]);
  readonly selectedStatuses = signal<ProjectStatus[]>([]);
  readonly selectedPriorities = signal<Priority[]>([]);
  readonly showFilters = signal<boolean>(false);

  // Inyección del servicio
  constructor(private projectService: ProjectService) {}

  // Computed signals para acceder a los datos del servicio
  readonly projects = this.projectService.filteredProjects;
  readonly loading = this.projectService.loading;
  readonly error = this.projectService.error;
  readonly summary = this.projectService.projectSummary;
  readonly criticalProjects = this.projectService.criticalProjects;
  readonly recentProjects = this.projectService.recentProjects;

  // Computed signals para utilidades de la vista
  readonly hasActiveFilters = computed(() => {
    const filter = this.projectService.filter();
    return !!(
      filter.searchText ||
      filter.types?.length ||
      filter.statuses?.length ||
      filter.priorities?.length
    );
  });

  readonly filteredProjectsCount = computed(() => this.projects().length);

  readonly projectsForCurrentView = computed(() => {
    const projects = this.projects();
    const mode = this.viewMode();
    
    if (mode === 'kanban') {
      // Para vista kanban, organizamos por estado
      const kanbanData: Record<ProjectStatus, Project[]> = {} as Record<ProjectStatus, Project[]>;
      
      Object.values(ProjectStatus).forEach(status => {
        kanbanData[status] = projects.filter(p => p.status === status);
      });
      
      return kanbanData;
    }
    
    return projects;
  });

  // Métodos para gestión de filtros
  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.projectService.updateFilter({ searchText: searchTerm || undefined });
  }

  onTypeFilterChange(type: ProjectType, checked: boolean): void {
    const current = this.selectedTypes();
    let updated: ProjectType[];
    
    if (checked) {
      updated = [...current, type];
    } else {
      updated = current.filter(t => t !== type);
    }
    
    this.selectedTypes.set(updated);
    this.projectService.updateFilter({ 
      types: updated.length > 0 ? updated : undefined 
    });
  }

  onStatusFilterChange(status: ProjectStatus, checked: boolean): void {
    const current = this.selectedStatuses();
    let updated: ProjectStatus[];
    
    if (checked) {
      updated = [...current, status];
    } else {
      updated = current.filter(s => s !== status);
    }
    
    this.selectedStatuses.set(updated);
    this.projectService.updateFilter({ 
      statuses: updated.length > 0 ? updated : undefined 
    });
  }

  onPriorityFilterChange(priority: Priority, checked: boolean): void {
    const current = this.selectedPriorities();
    let updated: Priority[];
    
    if (checked) {
      updated = [...current, priority];
    } else {
      updated = current.filter(p => p !== priority);
    }
    
    this.selectedPriorities.set(updated);
    this.projectService.updateFilter({ 
      priorities: updated.length > 0 ? updated : undefined 
    });
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedTypes.set([]);
    this.selectedStatuses.set([]);
    this.selectedPriorities.set([]);
    this.projectService.clearFilter();
  }

  toggleFilters(): void {
    this.showFilters.update(current => !current);
  }

  // Métodos para cambio de vista
  setViewMode(mode: 'grid' | 'list' | 'kanban'): void {
    this.viewMode.set(mode);
  }

  // Métodos auxiliares para el template
  getTypeLabel(type: ProjectType): string {
    const labels: Record<ProjectType, string> = {
      [ProjectType.REHABILITACION]: 'Rehabilitación',
      [ProjectType.MEJORAMIENTO]: 'Mejoramiento',
      [ProjectType.CONSTRUCCION]: 'Construcción',
      [ProjectType.MANTENIMIENTO]: 'Mantenimiento',
      [ProjectType.ESTUDIOS]: 'Estudios'
    };
    return labels[type];
  }

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANIFICACION]: 'Planificación',
      [ProjectStatus.EN_LICITACION]: 'En Licitación',
      [ProjectStatus.EN_EJECUCION]: 'En Ejecución',
      [ProjectStatus.SUPERVISION]: 'Supervisión',
      [ProjectStatus.FINALIZADO]: 'Finalizado',
      [ProjectStatus.SUSPENDIDO]: 'Suspendido',
      [ProjectStatus.CANCELADO]: 'Cancelado'
    };
    return labels[status];
  }

  getPriorityLabel(priority: Priority): string {
    const labels: Record<Priority, string> = {
      [Priority.BAJA]: 'Baja',
      [Priority.MEDIA]: 'Media',
      [Priority.ALTA]: 'Alta',
      [Priority.CRITICA]: 'Crítica',
      [Priority.URGENTE]: 'Urgente'
    };
    return labels[priority];
  }

  getStatusClass(status: ProjectStatus): string {
    const classes: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANIFICACION]: 'status-planning',
      [ProjectStatus.EN_LICITACION]: 'status-bidding',
      [ProjectStatus.EN_EJECUCION]: 'status-execution',
      [ProjectStatus.SUPERVISION]: 'status-supervision',
      [ProjectStatus.FINALIZADO]: 'status-finished',
      [ProjectStatus.SUSPENDIDO]: 'status-suspended',
      [ProjectStatus.CANCELADO]: 'status-cancelled'
    };
    return classes[status];
  }

  getPriorityClass(priority: Priority): string {
    const classes: Record<Priority, string> = {
      [Priority.BAJA]: 'priority-low',
      [Priority.MEDIA]: 'priority-medium',
      [Priority.ALTA]: 'priority-high',
      [Priority.CRITICA]: 'priority-critical',
      [Priority.URGENTE]: 'priority-urgent'
    };
    return classes[priority];
  }

  getProgressClass(progress: number): string {
    if (progress < 25) return 'progress-low';
    if (progress < 50) return 'progress-medium-low';
    if (progress < 75) return 'progress-medium';
    if (progress < 90) return 'progress-high';
    return 'progress-complete';
  }

  formatBudget(amount: number): string {
    if (amount >= 1000000) {
      return `S/ ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `S/ ${(amount / 1000).toFixed(0)}K`;
    }
    return `S/ ${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Métodos para acciones de proyecto
  refreshProjects(): void {
    this.projectService.loadProjects();
  }

  viewProjectDetails(project: Project): void {
    console.log('Ver detalles del proyecto:', project);
    // Aquí iría la navegación a los detalles del proyecto
  }

  editProject(project: Project): void {
    console.log('Editar proyecto:', project);
    // Aquí iría la navegación al formulario de edición
  }

  // Métodos para gestión de tipos de filtro
  isTypeSelected(type: ProjectType): boolean {
    return this.selectedTypes().includes(type);
  }

  isStatusSelected(status: ProjectStatus): boolean {
    return this.selectedStatuses().includes(status);
  }

  isPrioritySelected(priority: Priority): boolean {
    return this.selectedPriorities().includes(priority);
  }
}
