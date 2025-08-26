# LAB 2: DIRECTIVAS DE ATRIBUTO AVANZADAS

## 🎯 Objetivo Principal
Dominar las **directivas de atributo** de Angular 18 (NgClass, NgStyle, NgModel) creando un **sistema completo de personalización de temas** que permite a los usuarios configurar la apariencia de la aplicación en tiempo real.

## 🎨 ¿Qué Construiremos?
Un **ThemeConfiguratorComponent** profesional que funciona como el panel de personalización de aplicaciones modernas, donde los usuarios pueden:
- Cambiar temas completos (claro, oscuro, corporativo, creativo)
- Personalizar colores individuales con selectores de color
- Ajustar tipografía (fuente, tamaño, peso, espaciado)
- Configurar espaciado y layout dinámicamente
- Gestionar widgets personalizables
- Ver cambios en **tiempo real** mientras editan

## ⏱️ Duración: 45 minutos

## 🚀 Diferencias Clave vs Laboratorio 01

| **Laboratorio 01** | **Laboratorio 02** |
|-------------------|-------------------|
| 📋 **Directivas Estructurales** | 🎨 **Directivas de Atributo** |
| @if, @for, @switch | NgClass, NgStyle, NgModel |
| Controla **qué** se muestra | Controla **cómo** se ve |
| Dashboard de proyectos | Configurador de temas |
| Lógica de presentación | Personalización visual |

## 📋 Conceptos Clave del LAB 2

### 1. NgClass - Clases CSS Dinámicas
**NgClass** permite aplicar clases CSS dinámicamente basándose en condiciones:

#### Sintaxis con Objetos (Más Usado)
```typescript
// En el template
<div [ngClass]="{
  'theme-dark': isDarkMode(),
  'theme-compact': isCompactLayout(),
  'theme-animated': hasAnimations(),
  'theme-rtl': isRTL()
}">
  Contenido con clases dinámicas
</div>

// En el componente
readonly themeClasses = computed(() => ({
  'theme-dark': this.isDarkMode(),
  'theme-compact': this.currentLayout() === 'compact',
  'has-sidebar': this.showSidebar(),
  'high-contrast': this.highContrastMode()
}));
```

**Casos de uso reales:**
- ✅ Temas dinámicos (claro/oscuro/corporativo)
- ✅ Estados de componentes (active, disabled, loading)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Preferencias del usuario (compact, spacious)

#### Sintaxis con Arrays y Strings
```typescript
// Array de clases
<div [ngClass]="['base-theme', currentTheme(), layoutClass()]">
  Clases base + dinámicas
</div>

// String condicional
<div [ngClass]="isActive() ? 'active highlighted' : 'inactive'">
  Clases condicionales simples
</div>
```

### 2. NgStyle - Estilos CSS Dinámicos
**NgStyle** permite aplicar estilos inline dinámicamente:

```typescript
// Estilos con objeto (MÁS USADO)
<div [ngStyle]="{
  'background-color': primaryColor(),
  'color': textColor(),
  'font-size.px': fontSize(),
  'padding.rem': spacing() * 1.5,
  'border-radius.px': borderRadius(),
  '--primary-color': primaryColor() // CSS Variables!
}">
  Elemento con estilos dinámicos
</div>

// Computed styles
readonly containerStyles = computed(() => ({
  'background': this.computedColors().surface,
  'color': this.computedColors().text,
  'font-family': this.typography().fontFamily,
  '--theme-primary': this.colors().primary,
  '--theme-secondary': this.colors().secondary
}));
```

**🔥 Ventaja de CSS Variables:**
- Cambian todos los elementos que usen esa variable
- Mejor performance que cambiar estilos individuales
- Más mantenible y escalable

### 3. NgModel - Two-Way Data Binding
**NgModel** crea binding bidireccional entre el template y el componente:

```typescript
// En el template
<input 
  type="color" 
  [(ngModel)]="primaryColor"
  (ngModelChange)="onColorChange($event)">

<input 
  type="range" 
  min="12" 
  max="24" 
  [(ngModel)]="fontSize">

<select [(ngModel)]="selectedTheme">
  @for (theme of availableThemes(); track theme.id) {
    <option [value]="theme.id">{{ theme.name }}</option>
  }
</select>

// En el componente
readonly primaryColor = signal('#667eea');
readonly fontSize = signal(16);
readonly selectedTheme = signal('light');

onColorChange(color: string) {
  this.primaryColor.set(color);
  this.updateTheme(); // Actualiza tema en tiempo real
}
```

**💡 Poder del Two-Way Binding:**
- Cambios instantáneos en la UI
- Sincronización automática
- Feedback inmediato al usuario

### 4. Patrón de Configurador de Temas
El **ThemeConfiguratorComponent** es el corazón de este laboratorio:

```typescript
@Component({
  selector: 'app-theme-configurator',
  template: `
    <!-- Tabs dinámicos con NgClass -->
    <nav class="tabs">
      @for (tab of tabs; track tab.id) {
        <button 
          [ngClass]="{
            'tab-active': activeTab() === tab.id,
            'tab-has-changes': hasChanges(tab.id)
          }"
          (click)="setActiveTab(tab.id)">
          {{ tab.label }}
        </button>
      }
    </nav>

    <!-- Preview en tiempo real con NgStyle -->
    <div 
      class="live-preview"
      [ngStyle]="{
        'background': computedColors().background,
        'color': computedColors().text,
        'font-family': typography().fontFamily,
        '--primary': colors().primary,
        '--secondary': colors().secondary
      }">
      Vista previa en vivo
    </div>
  `
})
```

## 🏗️ Arquitectura del Sistema de Temas

### 🎨 Características Implementadas

#### 📂 6 Categorías de Personalización:
1. **Presets** - Temas predefinidos (corporativo, creativo, minimalista)
2. **Colores** - Paleta completa personalizable (12+ colores)
3. **Tipografía** - Fuentes, tamaños, pesos, espaciado
4. **Espaciado** - Escalas, border-radius, contenedores
5. **Widgets** - Componentes arrastrables personalizables
6. **Avanzado** - RTL, alto contraste, import/export

#### 🔄 Flujo de Personalización:
1. **Usuario cambia setting** (color picker, slider, select)
2. **NgModel actualiza signal** automáticamente
3. **Computed signal recalcula** estilos/clases
4. **NgClass/NgStyle aplican** cambios al DOM
5. **Vista previa se actualiza** instantáneamente

## 🛠️ Implementación Paso a Paso

### PASO 1: Sistema de Interfaces (5 minutos)

Crear archivo `src/app/interfaces/theme.interface.ts`:

```typescript
// Interfaces para el sistema de gestión de infraestructura de PROVIAS
export interface Project {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  budget: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  department: string;
  province: string;
  district: string;
  contractor: Contractor;
  supervisor: string;
  priority: Priority;
  risks: Risk[];
  milestones: Milestone[];
  documents: Document[];
}

export enum ProjectType {
  CARRETERA = 'carretera',
  PUENTE = 'puente',
  TUNEL = 'tunel',
  MANTENIMIENTO = 'mantenimiento',
  EMERGENCIA = 'emergencia'
}

export enum ProjectStatus {
  PLANIFICACION = 'planificacion',
  LICITACION = 'licitacion',
  EJECUCION = 'ejecucion',
  SUPERVISION = 'supervision',
  COMPLETADO = 'completado',
  SUSPENDIDO = 'suspendido',
  CANCELADO = 'cancelado'
}

export enum Priority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export interface Contractor {
  id: string;
  ruc: string;
  name: string;
  email: string;
  phone: string;
  representative: string;
  rating: number;
}

export interface Risk {
  id: string;
  type: 'tecnico' | 'financiero' | 'ambiental' | 'social';
  description: string;
  probability: 'baja' | 'media' | 'alta';
  impact: 'bajo' | 'medio' | 'alto';
  mitigation: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}
```

### PASO 2: Crear Servicio de Proyectos (10 minutos)

```bash
ng generate service services/project --skip-tests
```

Actualizar `src/app/services/project.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Project, ProjectStatus, ProjectType, Priority } from '../interfaces/infrastructure.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Signals para manejo reactivo de estado
  private projectsSignal = signal<Project[]>(this.generateMockProjects());
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedProjectSignal = signal<Project | null>(null);
  private filterSignal = signal<{
    status: ProjectStatus | 'all';
    type: ProjectType | 'all';
    department: string;
  }>({
    status: 'all',
    type: 'all',
    department: ''
  });

  // Computed signals
  projects = computed(() => this.projectsSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  selectedProject = computed(() => this.selectedProjectSignal());
  
  filteredProjects = computed(() => {
    const projects = this.projectsSignal();
    const filter = this.filterSignal();
    
    return projects.filter(project => {
      const statusMatch = filter.status === 'all' || project.status === filter.status;
      const typeMatch = filter.type === 'all' || project.type === filter.type;
      const deptMatch = !filter.department || 
        project.department.toLowerCase().includes(filter.department.toLowerCase());
      
      return statusMatch && typeMatch && deptMatch;
    });
  });

  projectsByStatus = computed(() => {
    const projects = this.projectsSignal();
    const grouped = new Map<ProjectStatus, Project[]>();
    
    Object.values(ProjectStatus).forEach(status => {
      grouped.set(status, projects.filter(p => p.status === status));
    });
    
    return grouped;
  });

  statistics = computed(() => {
    const projects = this.projectsSignal();
    return {
      total: projects.length,
      enEjecucion: projects.filter(p => p.status === ProjectStatus.EJECUCION).length,
      completados: projects.filter(p => p.status === ProjectStatus.COMPLETADO).length,
      presupuestoTotal: projects.reduce((sum, p) => sum + p.budget, 0),
      progresoPromedio: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0,
      proyectosCriticos: projects.filter(p => p.priority === Priority.CRITICA).length,
      riesgosAltos: projects.reduce((sum, p) => 
        sum + p.risks.filter(r => r.impact === 'alto').length, 0)
    };
  });

  constructor() {
    console.log('🏗️ ProjectService inicializado con', this.projects().length, 'proyectos');
  }

  // Métodos públicos
  loadProjects(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    // Simular carga asíncrona
    setTimeout(() => {
      this.projectsSignal.set(this.generateMockProjects());
      this.loadingSignal.set(false);
    }, 1000);
  }

  selectProject(projectId: string): void {
    const project = this.projectsSignal().find(p => p.id === projectId);
    this.selectedProjectSignal.set(project || null);
  }

  updateFilter(filter: Partial<typeof this.filterSignal>): void {
    this.filterSignal.update(current => ({ ...current, ...filter }));
  }

  updateProjectProgress(projectId: string, progress: number): void {
    this.projectsSignal.update(projects => 
      projects.map(p => 
        p.id === projectId 
          ? { ...p, progress: Math.min(100, Math.max(0, progress)) }
          : p
      )
    );
  }

  // Generar datos mock completos...
  private generateMockProjects(): Project[] {
    // Implementación completa de datos de ejemplo
    return [
      {
        id: 'PRY-001',
        code: 'PE-3N-2025-001',
        name: 'Mejoramiento Carretera PE-3N Tramo Piura-Sullana',
        type: ProjectType.CARRETERA,
        status: ProjectStatus.EJECUCION,
        budget: 12500000,
        progress: 65,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-12-31'),
        department: 'Piura',
        province: 'Piura',
        district: 'Piura',
        contractor: {
          id: 'CTR-001',
          ruc: '20123456789',
          name: 'Constructora Vial Norte S.A.C.',
          email: 'contacto@vialnorte.pe',
          phone: '073-123456',
          representative: 'Ing. Carlos Mendoza',
          rating: 4.5
        },
        supervisor: 'Ing. Ana García',
        priority: Priority.ALTA,
        risks: [
          {
            id: 'RSK-001',
            type: 'ambiental',
            description: 'Posible impacto en zona de humedales',
            probability: 'media',
            impact: 'alto',
            mitigation: 'Implementar plan de manejo ambiental específico'
          }
        ],
        milestones: [
          {
            id: 'ML-001',
            name: 'Movimiento de tierras',
            description: 'Completar trabajos de explanación',
            dueDate: new Date('2025-03-31'),
            completed: true,
            completedDate: new Date('2025-03-28')
          }
        ],
        documents: []
      }
      // ... más proyectos de ejemplo
    ];
  }
}
```

### PASO 3: Crear Componente Principal (15 minutos)

```bash
ng generate component components/directivas-demo/project-dashboard --standalone --skip-tests
```

Actualizar `src/app/components/directivas-demo/project-dashboard/project-dashboard.component.ts`:

```typescript
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
```

### PASO 4: Template con Nueva Sintaxis (10 minutos)

Crear `src/app/components/directivas-demo/project-dashboard/project-dashboard.component.html`:

```html
<div class="project-dashboard">
  <!-- Header del Dashboard -->
  <header class="dashboard-header">
    <h1>🏗️ Sistema de Gestión de Proyectos - PROVIAS</h1>
    <p class="subtitle">Demostración de Directivas Estructurales Modernas (@if, @for, @switch)</p>
  </header>

  <!-- Estados de Carga y Error con @if -->
  @if (loading()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando proyectos de infraestructura...</p>
    </div>
  } @else if (error(); as errorMessage) {
    <div class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ errorMessage }}</p>
      <button (click)="loadProjects()" class="btn btn-primary">
        🔄 Reintentar
      </button>
    </div>
  } @else {
    <!-- Estadísticas con @if anidados -->
    @if (hasProjects()) {
      <section class="statistics-section">
        <h2>📊 Estadísticas Generales</h2>
        <div class="stats-grid">
          @if (statistics(); as stats) {
            <div class="stat-card">
              <h3>{{ stats.total }}</h3>
              <p>Total Proyectos</p>
            </div>
            <div class="stat-card execution">
              <h3>{{ stats.enEjecucion }}</h3>
              <p>En Ejecución</p>
            </div>
            <div class="stat-card completed">
              <h3>{{ stats.completados }}</h3>
              <p>Completados</p>
            </div>
            <div class="stat-card budget">
              <h3>S/ {{ (stats.presupuestoTotal / 1000000).toFixed(1) }}M</h3>
              <p>Presupuesto Total</p>
            </div>
            <div class="stat-card progress">
              <h3>{{ stats.progresoPromedio.toFixed(1) }}%</h3>
              <p>Progreso Promedio</p>
            </div>
            @if (stats.proyectosCriticos > 0) {
              <div class="stat-card critical">
                <h3>{{ stats.proyectosCriticos }}</h3>
                <p>Proyectos Críticos</p>
              </div>
            }
            @if (stats.riesgosAltos > 0) {
              <div class="stat-card risks">
                <h3>{{ stats.riesgosAltos }}</h3>
                <p>Riesgos Altos</p>
              </div>
            }
          }
        </div>
      </section>
    }

    <!-- Controles y Filtros -->
    <section class="controls-section">
      <div class="view-controls">
        <button 
          (click)="toggleFilters()" 
          class="btn btn-secondary"
          [class.active]="showFilters()">
          🔍 {{ showFilters() ? 'Ocultar' : 'Mostrar' }} Filtros
        </button>
        <div class="view-mode-buttons">
          <button 
            (click)="changeViewMode('grid')"
            [class.active]="viewMode() === 'grid'"
            class="btn btn-icon">
            ⚏ Grid
          </button>
          <button 
            (click)="changeViewMode('list')"
            [class.active]="viewMode() === 'list'"
            class="btn btn-icon">
            ☰ Lista
          </button>
          <button 
            (click)="changeViewMode('kanban')"
            [class.active]="viewMode() === 'kanban'"
            class="btn btn-icon">
            ⫿ Kanban
          </button>
        </div>
      </div>

      <!-- Panel de Filtros con @if -->
      @if (showFilters()) {
        <div class="filters-panel">
          <div class="filter-group">
            <label>Estado del Proyecto:</label>
            <select 
              [(ngModel)]="selectedStatus"
              (change)="applyFilters()"
              class="form-control">
              @for (option of statusOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Tipo de Proyecto:</label>
            <select 
              [(ngModel)]="selectedType"
              (change)="applyFilters()"
              class="form-control">
              @for (option of typeOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>
          <div class="filter-group">
            <label>Buscar por Departamento:</label>
            <input 
              type="text"
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
              placeholder="Ej: Piura, Sullana..."
              class="form-control">
          </div>
          @if (isFiltered()) {
            <button (click)="clearFilters()" class="btn btn-warning">
              🧹 Limpiar Filtros
            </button>
          }
        </div>
      }
    </section>

    <!-- Vista Grid con @for y @switch -->
    @if (viewMode() === 'grid') {
      <section class="projects-grid">
        @for (project of filteredProjects(); track project.id) {
          <div 
            class="project-card"
            [class]="getPriorityClass(project.priority)"
            (click)="selectProject(project)">
            
            <!-- Header del Proyecto -->
            <div class="project-header">
              <span class="project-code">{{ project.code }}</span>
              @switch (project.priority) {
                @case (Priority.CRITICA) {
                  <span class="priority-badge critical">🔴 CRÍTICA</span>
                }
                @case (Priority.ALTA) {
                  <span class="priority-badge high">🟠 ALTA</span>
                }
                @case (Priority.MEDIA) {
                  <span class="priority-badge medium">🟡 MEDIA</span>
                }
                @default {
                  <span class="priority-badge low">🟢 BAJA</span>
                }
              }
            </div>

            <h3>{{ project.name }}</h3>
            
            <!-- Información del Proyecto -->
            <div class="project-info">
              <p><strong>Tipo:</strong> {{ getTypeLabel(project.type) }}</p>
              <p><strong>Ubicación:</strong> {{ project.department }} - {{ project.province }}</p>
              <p><strong>Contratista:</strong> {{ project.contractor.name }}</p>
              <p><strong>Supervisor:</strong> {{ project.supervisor }}</p>
            </div>

            <!-- Estado con @switch -->
            <div class="project-status">
              @switch (project.status) {
                @case (ProjectStatus.PLANIFICACION) {
                  <span class="status-badge planning">📋 Planificación</span>
                }
                @case (ProjectStatus.LICITACION) {
                  <span class="status-badge bidding">📢 Licitación</span>
                }
                @case (ProjectStatus.EJECUCION) {
                  <span class="status-badge execution">🚧 En Ejecución</span>
                }
                @case (ProjectStatus.SUPERVISION) {
                  <span class="status-badge supervision">👁️ Supervisión</span>
                }
                @case (ProjectStatus.COMPLETADO) {
                  <span class="status-badge completed">✅ Completado</span>
                }
                @case (ProjectStatus.SUSPENDIDO) {
                  <span class="status-badge suspended">⏸️ Suspendido</span>
                }
                @default {
                  <span class="status-badge cancelled">❌ Cancelado</span>
                }
              }
            </div>

            <!-- Progreso -->
            <div class="project-progress">
              <div class="progress-header">
                <span>Progreso</span>
                <span>{{ project.progress }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [style.width.%]="project.progress"
                  [style.background-color]="getProgressColor(project.progress)">
                </div>
              </div>
              @if (project.status === ProjectStatus.EJECUCION) {
                <input 
                  type="range"
                  [value]="project.progress"
                  (change)="updateProgress(project.id, $event)"
                  min="0"
                  max="100"
                  class="progress-slider">
              }
            </div>

            <!-- Presupuesto -->
            <div class="project-budget">
              <strong>Presupuesto:</strong> S/ {{ (project.budget / 1000000).toFixed(2) }}M
            </div>

            <!-- Riesgos con @for y @if -->
            @if (project.risks.length > 0) {
              <div class="project-risks">
                <h4>⚠️ Riesgos ({{ project.risks.length }})</h4>
                @for (risk of project.risks; track risk.id; let i = $index) {
                  @if (risk.impact === 'alto') {
                    <div class="risk-item high">
                      {{ i + 1 }}. {{ risk.description }}
                    </div>
                  }
                }
              </div>
            }

            <!-- Hitos con @for -->
            @if (project.milestones.length > 0) {
              <div class="project-milestones">
                <h4>🎯 Hitos</h4>
                @for (milestone of project.milestones; track milestone.id) {
                  <div class="milestone-item" [class.completed]="milestone.completed">
                    @if (milestone.completed) {
                      ✅
                    } @else {
                      ⏳
                    }
                    {{ milestone.name }}
                  </div>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="no-projects">
            <h3>📭 No se encontraron proyectos</h3>
            @if (isFiltered()) {
              <p>No hay proyectos que coincidan con los filtros seleccionados</p>
              <button (click)="clearFilters()" class="btn btn-primary">
                Limpiar Filtros
              </button>
            } @else {
              <p>No hay proyectos registrados en el sistema</p>
              <button (click)="loadProjects()" class="btn btn-primary">
                Cargar Proyectos
              </button>
            }
          </div>
        }
      </section>
    }

    <!-- Vista Lista con @for -->
    @if (viewMode() === 'list') {
      <section class="projects-list">
        <table class="projects-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Progreso</th>
              <th>Presupuesto</th>
              <th>Prioridad</th>
              <th>Ubicación</th>
            </tr>
          </thead>
          <tbody>
            @for (project of filteredProjects(); track project.id; let even = $even; let odd = $odd) {
              <tr 
                [class.even-row]="even"
                [class.odd-row]="odd"
                (click)="selectProject(project)">
                <td>{{ project.code }}</td>
                <td>{{ project.name }}</td>
                <td>{{ getTypeLabel(project.type) }}</td>
                <td>
                  <span [class]="getStatusClass(project.status)">
                    {{ getStatusLabel(project.status) }}
                  </span>
                </td>
                <td>
                  <div class="progress-cell">
                    <div class="mini-progress">
                      <div 
                        class="mini-progress-fill"
                        [style.width.%]="project.progress">
                      </div>
                    </div>
                    {{ project.progress }}%
                  </div>
                </td>
                <td>S/ {{ (project.budget / 1000000).toFixed(2) }}M</td>
                <td>
                  <span [class]="getPriorityClass(project.priority)">
                    {{ getPriorityLabel(project.priority) }}
                  </span>
                </td>
                <td>{{ project.department }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="no-data">
                  No hay proyectos para mostrar
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }

    <!-- Vista Kanban con @for sobre Map -->
    @if (viewMode() === 'kanban') {
      <section class="projects-kanban">
        <div class="kanban-board">
          @for (status of Object.values(ProjectStatus); track status) {
            <div class="kanban-column">
              <div class="column-header" [class]="getStatusClass(status)">
                <h3>{{ getStatusLabel(status) }}</h3>
                @if (projectsByStatus().get(status); as projects) {
                  <span class="count">{{ projects.length }}</span>
                }
              </div>
              <div class="column-content">
                @if (projectsByStatus().get(status); as projects) {
                  @for (project of projects; track project.id) {
                    @if (!searchTerm() || project.department.toLowerCase().includes(searchTerm().toLowerCase())) {
                      <div class="kanban-card" (click)="selectProject(project)">
                        <h4>{{ project.name }}</h4>
                        <p class="code">{{ project.code }}</p>
                        <div class="kanban-meta">
                          <span>{{ getTypeLabel(project.type) }}</span>
                          <span>{{ project.progress }}%</span>
                        </div>
                        @switch (project.priority) {
                          @case (Priority.CRITICA) {
                            <span class="priority-indicator critical">●</span>
                          }
                          @case (Priority.ALTA) {
                            <span class="priority-indicator high">●</span>
                          }
                        }
                      </div>
                    }
                  } @empty {
                    <div class="empty-column">
                      Sin proyectos
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      </section>
    }
  }

  <!-- Resumen de Directivas Implementadas -->
  <section class="directives-summary">
    <h2>📚 Directivas Estructurales Implementadas</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>@if / @else if / @else</h3>
        <p>Control de estados de carga, error y datos vacíos</p>
        <code>@if (condition) { } @else if (other) { } @else { }</code>
      </div>
      <div class="summary-card">
        <h3>@for / @empty</h3>
        <p>Iteración sobre proyectos con manejo de lista vacía</p>
        <code>@for (item of items; track item.id) { } @empty { }</code>
      </div>
      <div class="summary-card">
        <h3>@switch / @case / @default</h3>
        <p>Renderizado condicional según estado y prioridad</p>
        <code>@switch (value) { @case (x) { } @default { } }</code>
      </div>
      <div class="summary-card">
        <h3>Variables Locales</h3>
        <p>Uso de $index, $even, $odd en bucles</p>
        <code>let i = $index; let even = $even</code>
      </div>
    </div>
  </section>
</div>
```

### PASO 5: Agregar Rutas y Verificar (5 minutos)

Actualizar `src/app/app.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { ProjectDashboardComponent } from './components/directivas-demo/project-dashboard/project-dashboard.component';
// ... otras importaciones

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // ... rutas anteriores
  { path: 'project-dashboard', component: ProjectDashboardComponent },
  { path: '**', redirectTo: '/home' }
];
```

## ✅ CHECKLIST DE VERIFICACIÓN LAB 1

### Funcionalidades Implementadas
- [ ] @if funciona para estados de carga
- [ ] @for itera correctamente sobre proyectos
- [ ] @switch muestra estados correctos
- [ ] @empty muestra mensaje cuando no hay datos
- [ ] Variables locales ($index, $even, $odd) funcionan
- [ ] Track functions optimizan el renderizado

### Vistas Implementadas
- [ ] Vista Grid con tarjetas de proyectos
- [ ] Vista Lista con tabla responsive
- [ ] Vista Kanban agrupada por estado
- [ ] Filtros dinámicos funcionando
- [ ] Estadísticas reactivas

### Testing Manual
```bash
# Ejecutar la aplicación
ng serve --open

# Navegar a http://localhost:4200/project-dashboard
# Verificar:
# 1. Estados de carga se muestran correctamente
# 2. Lista de proyectos se renderiza
# 3. Filtros funcionan en tiempo real
# 4. Cambio de vistas es fluido
# 5. No hay errores en consola
```

## 🎓 Conocimientos Adquiridos

Al completar este laboratorio habrás dominado:

### 1. Nueva Sintaxis de Control Flow
- ✅ **@if/@else if/@else**: Renderizado condicional moderno
- ✅ **@for/@empty**: Iteración optimizada con track functions
- ✅ **@switch/@case/@default**: Selección múltiple eficiente
- ✅ **Variables locales**: $index, $even, $odd, $first, $last

### 2. Signals y Reactividad
- ✅ **Signals básicos**: Estado reactivo simple
- ✅ **Computed signals**: Estado derivado automático
- ✅ **Signal updates**: Modificación de estado inmutable

### 3. Optimización de Performance
- ✅ **Track functions**: Identificación única de elementos
- ✅ **Lazy updates**: Solo re-renderiza lo que cambió
- ✅ **Tree-shaking**: Eliminación de código no usado

### 4. Patrones de Arquitectura
- ✅ **Servicios con signals**: Estado centralizado reactivo
- ✅ **Computed para filtros**: Filtrado automático eficiente
- ✅ **Separation of concerns**: Lógica vs presentación

## 🚀 Siguiente Paso

Una vez dominadas las directivas estructurales modernas, estarás listo para el **LAB 2: Directivas de Atributo Avanzadas** donde implementarás un configurador de temas dinámico usando NgClass, NgStyle y NgModel.

---

*Este laboratorio demuestra el poder del nuevo control flow de Angular 18. Has construido un sistema complejo de gestión de proyectos que maneja estados, filtros y múltiples vistas de forma optimizada y legible.*
