import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../services/project.service';
import { Project, ProjectStatus, ProjectType, Priority } from '../../../interfaces/infrastructure.interface';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-dashboard.component.html',
  styleUrl: './project-dashboard.component.scss'
})
export class ProjectDashboardComponent implements OnInit {
  // Signals del servicio
  projects = this.projectService.projects;
  loading = this.projectService.loading;
  error = this.projectService.error;
  filteredProjects = this.projectService.filteredProjects;
  statistics = this.projectService.statistics;
  projectsByStatus = this.projectService.projectsByStatus;
  
  // Signals locales
  viewMode = signal<'grid' | 'list' | 'kanban'>('grid');
  showFilters = signal(true);
  selectedStatus = signal<ProjectStatus | 'all'>('all');
  selectedType = signal<ProjectType | 'all'>('all');
  searchTerm = signal('');
  
  // Computed signals para UI
  hasProjects = computed(() => this.projects().length > 0);
  hasFilteredProjects = computed(() => this.filteredProjects().length > 0);
  isFiltered = computed(() => 
    this.selectedStatus() !== 'all' || 
    this.selectedType() !== 'all' || 
    this.searchTerm() !== ''
  );
  
  // Enums para el template
  ProjectStatus = ProjectStatus;
  ProjectType = ProjectType;
  Priority = Priority;
  
  // Opciones para filtros
  statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...Object.values(ProjectStatus).map(status => ({
      value: status,
      label: this.getStatusLabel(status)
    }))
  ];
  
  typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...Object.values(ProjectType).map(type => ({
      value: type,
      label: this.getTypeLabel(type)
    }))
  ];

  constructor(private projectService: ProjectService) {
    console.log('🎯 LAB 1: ProjectDashboard inicializado');
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  // Métodos de carga y filtrado
  loadProjects(): void {
    this.projectService.loadProjects();
  }

  applyFilters(): void {
    this.projectService.updateFilter({
      status: this.selectedStatus(),
      type: this.selectedType(),
      department: this.searchTerm()
    });
  }

  clearFilters(): void {
    this.selectedStatus.set('all');
    this.selectedType.set('all');
    this.searchTerm.set('');
    this.applyFilters();
  }

  // Métodos de UI
  changeViewMode(mode: 'grid' | 'list' | 'kanban'): void {
    this.viewMode.set(mode);
  }

  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  selectProject(project: Project): void {
    this.projectService.selectProject(project.id);
    console.log('Proyecto seleccionado:', project.name);
  }

  updateProgress(projectId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const progress = parseInt(target.value);
    this.projectService.updateProjectProgress(projectId, progress);
  }

  // Métodos auxiliares para etiquetas
  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANIFICACION]: 'Planificación',
      [ProjectStatus.LICITACION]: 'Licitación',
      [ProjectStatus.EJECUCION]: 'En Ejecución',
      [ProjectStatus.SUPERVISION]: 'Supervisión',
      [ProjectStatus.COMPLETADO]: 'Completado',
      [ProjectStatus.SUSPENDIDO]: 'Suspendido',
      [ProjectStatus.CANCELADO]: 'Cancelado'
    };
    return labels[status];
  }

  getTypeLabel(type: ProjectType): string {
    const labels: Record<ProjectType, string> = {
      [ProjectType.CARRETERA]: 'Carretera',
      [ProjectType.PUENTE]: 'Puente',
      [ProjectType.TUNEL]: 'Túnel',
      [ProjectType.MANTENIMIENTO]: 'Mantenimiento',
      [ProjectType.EMERGENCIA]: 'Emergencia'
    };
    return labels[type];
  }

  getPriorityLabel(priority: Priority): string {
    const labels: Record<Priority, string> = {
      [Priority.BAJA]: 'Baja',
      [Priority.MEDIA]: 'Media',
      [Priority.ALTA]: 'Alta',
      [Priority.CRITICA]: 'Crítica'
    };
    return labels[priority];
  }

  getStatusClass(status: ProjectStatus): string {
    const classes: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANIFICACION]: 'status-planning',
      [ProjectStatus.LICITACION]: 'status-bidding',
      [ProjectStatus.EJECUCION]: 'status-execution',
      [ProjectStatus.SUPERVISION]: 'status-supervision',
      [ProjectStatus.COMPLETADO]: 'status-completed',
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
      [Priority.CRITICA]: 'priority-critical'
    };
    return classes[priority];
  }

  getProgressColor(progress: number): string {
    if (progress < 25) return '#dc3545';
    if (progress < 50) return '#ffc107';
    if (progress < 75) return '#28a745';
    return '#007bff';
  }
}
