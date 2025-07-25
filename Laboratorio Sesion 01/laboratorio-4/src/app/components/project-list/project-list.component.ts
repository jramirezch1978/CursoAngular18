import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Project } from '../../services/api.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss'
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  error = '';
  selectedProject: Project | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getProjects().subscribe({
      next: (response) => {
        if (response.success) {
          this.projects = response.data;
        } else {
          this.error = response.message;
        }
      },
      error: (error) => {
        this.error = 'Error al cargar proyectos';
        console.error('Error:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return '🚧';
      case 'completed': return '✅';
      case 'pending': return '⏳';
      default: return '❓';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }
} 