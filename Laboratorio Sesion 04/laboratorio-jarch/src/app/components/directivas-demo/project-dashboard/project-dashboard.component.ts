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
  // Signals del servicio - Inicializados en el constructor
  projects!: any;
  loading!: any;
  error!: any;
  filteredProjects!: any;
  statistics!: any;
  projectsByStatus!: any;
  
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
  
  // Variables para el template
  Object = Object;
  condition = signal(true);
  other = signal(false);
  items = signal([{id: 'demo', name: 'Demo Item'}]);
  value = signal('test');
  x = signal('x');
  
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
    // Inicializar signals del servicio
    this.projects = this.projectService.projects;
    this.loading = this.projectService.loading;
    this.error = this.projectService.error;
    this.filteredProjects = this.projectService.filteredProjects;
    this.statistics = this.projectService.statistics;
    this.projectsByStatus = this.projectService.projectsByStatus;
    
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

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as ProjectStatus | 'all');
    this.applyFilters();
  }

  onTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedType.set(target.value as ProjectType | 'all');
    this.applyFilters();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.applyFilters();
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
