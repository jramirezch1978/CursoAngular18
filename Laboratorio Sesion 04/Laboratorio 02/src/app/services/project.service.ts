import { Injectable, computed, signal } from '@angular/core';
import { 
  Project, 
  ProjectFilter, 
  ProjectSummary, 
  ProjectType, 
  ProjectStatus, 
  Priority, 
  RiskLevel,
  Contractor 
} from '../interfaces/infrastructure.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // Signals privados para el estado interno
  private readonly _projects = signal<Project[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _filter = signal<ProjectFilter>({});

  // Signals públicos de solo lectura
  readonly projects = this._projects.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly filter = this._filter.asReadonly();

  // Computed signals para datos derivados
  readonly filteredProjects = computed(() => {
    const projects = this._projects();
    const filter = this._filter();
    
    if (!filter) return projects;

    return projects.filter(project => {
      // Filtro por tipos
      if (filter.types?.length && !filter.types.includes(project.type)) {
        return false;
      }

      // Filtro por estados
      if (filter.statuses?.length && !filter.statuses.includes(project.status)) {
        return false;
      }

      // Filtro por prioridades
      if (filter.priorities?.length && !filter.priorities.includes(project.priority)) {
        return false;
      }

      // Filtro por regiones
      if (filter.regions?.length && !filter.regions.includes(project.region)) {
        return false;
      }

      // Filtro por departamentos
      if (filter.departments?.length && !filter.departments.includes(project.location.department)) {
        return false;
      }

      // Filtro por texto de búsqueda
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const searchableText = `${project.title} ${project.description} ${project.code}`.toLowerCase();
        if (!searchableText.includes(searchText)) {
          return false;
        }
      }

      // Filtro por rango de fechas
      if (filter.dateRange) {
        const projectDate = project.startDate || project.creationDate;
        if (projectDate < filter.dateRange.start || projectDate > filter.dateRange.end) {
          return false;
        }
      }

      // Filtro por rango de presupuesto
      if (filter.budgetRange) {
        if (project.budget.total < filter.budgetRange.min || 
            project.budget.total > filter.budgetRange.max) {
          return false;
        }
      }

      return true;
    });
  });

  readonly projectSummary = computed((): ProjectSummary => {
    const projects = this.filteredProjects();
    
    const summary: ProjectSummary = {
      totalProjects: projects.length,
      projectsByStatus: {} as Record<ProjectStatus, number>,
      projectsByType: {} as Record<ProjectType, number>,
      projectsByPriority: {} as Record<Priority, number>,
      totalBudget: 0,
      executedBudget: 0,
      averageProgress: 0,
      criticalProjects: 0,
      delayedProjects: 0
    };

    // Inicializar contadores
    Object.values(ProjectStatus).forEach(status => {
      summary.projectsByStatus[status] = 0;
    });
    Object.values(ProjectType).forEach(type => {
      summary.projectsByType[type] = 0;
    });
    Object.values(Priority).forEach(priority => {
      summary.projectsByPriority[priority] = 0;
    });

    // Calcular estadísticas
    let totalProgress = 0;
    const today = new Date();

    projects.forEach(project => {
      // Contadores por categoría
      summary.projectsByStatus[project.status]++;
      summary.projectsByType[project.type]++;
      summary.projectsByPriority[project.priority]++;

      // Presupuestos
      summary.totalBudget += project.budget.total;
      summary.executedBudget += project.budget.executed;

      // Progreso
      totalProgress += project.progress;

      // Proyectos críticos (alta prioridad y bajo progreso)
      if ((project.priority === Priority.ALTA || project.priority === Priority.CRITICA || project.priority === Priority.URGENTE) && 
          project.progress < 50) {
        summary.criticalProjects++;
      }

      // Proyectos retrasados
      if (project.plannedEndDate && 
          project.status !== ProjectStatus.FINALIZADO && 
          today > project.plannedEndDate) {
        summary.delayedProjects++;
      }
    });

    summary.averageProgress = projects.length > 0 ? totalProgress / projects.length : 0;

    return summary;
  });

  readonly criticalProjects = computed(() => {
    return this.filteredProjects().filter(project => 
      (project.priority === Priority.CRITICA || project.priority === Priority.URGENTE) ||
      (project.risks.some(risk => risk.level === RiskLevel.ALTO || risk.level === RiskLevel.CRITICO))
    );
  });

  readonly delayedProjects = computed(() => {
    const today = new Date();
    return this.filteredProjects().filter(project => 
      project.plannedEndDate && 
      project.status !== ProjectStatus.FINALIZADO && 
      today > project.plannedEndDate
    );
  });

  readonly recentProjects = computed(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.filteredProjects()
      .filter(project => project.creationDate >= thirtyDaysAgo)
      .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());
  });

  constructor() {
    this.loadMockData();
  }

  // Métodos para actualizar el estado
  updateFilter(filter: Partial<ProjectFilter>): void {
    this._filter.update(current => ({ ...current, ...filter }));
  }

  clearFilter(): void {
    this._filter.set({});
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  // Método para cargar proyectos (simulado)
  async loadProjects(): Promise<void> {
    try {
      this.setLoading(true);
      this.setError(null);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En un caso real, aquí se haría la llamada al backend
      this.loadMockData();
      
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      this.setLoading(false);
    }
  }

  // Datos de prueba
  private loadMockData(): void {
    const mockContractors: Contractor[] = [
      {
        id: '1',
        name: 'Constructora Andina S.A.C.',
        ruc: '20512345678',
        email: 'contacto@andina.pe',
        phone: '+51-1-2345678',
        address: 'Av. Construcción 123, Lima',
        specialties: [ProjectType.CONSTRUCCION, ProjectType.REHABILITACION],
        rating: 4.5,
        isActive: true,
        contractsCompleted: 25
      },
      {
        id: '2',
        name: 'Ingeniería Vial del Perú S.A.',
        ruc: '20587654321',
        email: 'info@vialper.pe',
        phone: '+51-1-8765432',
        address: 'Jr. Ingenieros 456, Lima',
        specialties: [ProjectType.MEJORAMIENTO, ProjectType.MANTENIMIENTO],
        rating: 4.2,
        isActive: true,
        contractsCompleted: 18
      }
    ];

    const mockProjects: Project[] = [
      {
        id: '1',
        code: 'CUI-2024-001',
        title: 'Mejoramiento de la Carretera Huancayo - Ayacucho',
        description: 'Proyecto de mejoramiento de 180 km de carretera que conecta Huancayo con Ayacucho, incluyendo obras de arte y señalización.',
        type: ProjectType.MEJORAMIENTO,
        status: ProjectStatus.EN_EJECUCION,
        priority: Priority.ALTA,
        creationDate: new Date('2024-01-15'),
        startDate: new Date('2024-03-01'),
        plannedEndDate: new Date('2024-12-31'),
        budget: {
          total: 850000000,
          executed: 425000000,
          committed: 127500000,
          available: 297500000,
          currency: 'PEN',
          lastUpdate: new Date('2024-11-01')
        },
        location: {
          department: 'Huancavelica',
          province: 'Churcampa',
          district: 'Paucarbamba',
          coordinates: { latitude: -12.7854, longitude: -74.8962 },
          altitude: 3200,
          accessType: 'carretera'
        },
        projectManager: 'Ing. Carlos Mendoza',
        contractor: mockContractors[0],
        supervisor: 'Ing. Ana Quispe',
        progress: 50,
        risks: [
          {
            id: 'r1',
            title: 'Condiciones Climáticas Adversas',
            description: 'Lluvias intensas pueden retrasar las obras',
            level: RiskLevel.MEDIO,
            probability: 70,
            impact: 3,
            mitigation: 'Planificación de trabajo considerando temporada seca',
            responsible: 'Ing. Carlos Mendoza',
            dueDate: new Date('2024-12-01'),
            status: 'en_tratamiento'
          }
        ],
        milestones: [
          {
            id: 'm1',
            title: 'Completar Movimiento de Tierras',
            description: 'Finalizar excavación y relleno en toda la vía',
            targetDate: new Date('2024-06-30'),
            completionDate: new Date('2024-07-15'),
            isCompleted: true,
            dependencies: [],
            deliverables: ['Informe de movimiento de tierras', 'Topografía actualizada'],
            responsible: 'Ing. Pedro Ruiz'
          },
          {
            id: 'm2',
            title: 'Pavimentación Asfáltica',
            description: 'Colocación de carpeta asfáltica en caliente',
            targetDate: new Date('2024-10-31'),
            isCompleted: false,
            dependencies: ['m1'],
            deliverables: ['Certificado de calidad del asfalto', 'Pruebas de compactación'],
            responsible: 'Ing. Luis Torres'
          }
        ],
        documents: [
          {
            id: 'd1',
            title: 'Expediente Técnico',
            type: 'expediente',
            url: '/documents/expediente_huancayo_ayacucho.pdf',
            uploadDate: new Date('2024-01-10'),
            version: '1.0',
            size: 15728640,
            uploadedBy: 'Ing. Carlos Mendoza',
            isPublic: false
          }
        ],
        tags: ['vial', 'sierra', 'mejoramiento'],
        isPublic: true,
        lastUpdate: new Date('2024-11-01'),
        createdBy: 'Sistema PROVIAS',
        region: 'Sierra',
        beneficiaries: 85000,
        roadLength: 180,
        bridgeCount: 12,
        tunnelCount: 3
      },
      {
        id: '2',
        code: 'CUI-2024-002',
        title: 'Construcción Puente Río Mantaro',
        description: 'Construcción de puente vehicular sobre el río Mantaro para conectar comunidades rurales.',
        type: ProjectType.CONSTRUCCION,
        status: ProjectStatus.PLANIFICACION,
        priority: Priority.CRITICA,
        creationDate: new Date('2024-02-20'),
        startDate: new Date('2024-06-01'),
        plannedEndDate: new Date('2025-03-31'),
        budget: {
          total: 450000000,
          executed: 0,
          committed: 45000000,
          available: 405000000,
          currency: 'PEN',
          lastUpdate: new Date('2024-11-01')
        },
        location: {
          department: 'Junín',
          province: 'Jauja',
          district: 'Molinos',
          coordinates: { latitude: -11.7756, longitude: -75.4978 },
          altitude: 3350,
          accessType: 'trocha'
        },
        projectManager: 'Ing. María Fernández',
        contractor: mockContractors[1],
        progress: 5,
        risks: [
          {
            id: 'r2',
            title: 'Crecida del Río',
            description: 'Posible incremento del caudal durante temporada de lluvias',
            level: RiskLevel.ALTO,
            probability: 80,
            impact: 4,
            mitigation: 'Monitoreo constante del nivel del río y trabajo en temporada seca',
            responsible: 'Ing. María Fernández',
            dueDate: new Date('2024-11-30'),
            status: 'identificado'
          }
        ],
        milestones: [
          {
            id: 'm3',
            title: 'Estudios Geotécnicos',
            description: 'Completar estudios de suelo y fundaciones',
            targetDate: new Date('2024-05-31'),
            isCompleted: false,
            dependencies: [],
            deliverables: ['Informe geotécnico', 'Recomendaciones de cimentación'],
            responsible: 'Ing. Roberto Silva'
          }
        ],
        documents: [],
        tags: ['puente', 'rural', 'acceso'],
        isPublic: true,
        lastUpdate: new Date('2024-11-01'),
        createdBy: 'Sistema PROVIAS',
        region: 'Sierra',
        beneficiaries: 12000,
        roadLength: 0.5,
        bridgeCount: 1,
        tunnelCount: 0
      },
      {
        id: '3',
        code: 'CUI-2024-003',
        title: 'Rehabilitación Vía Evitamiento Cusco',
        description: 'Rehabilitación integral de 25 km de vía de evitamiento de la ciudad del Cusco.',
        type: ProjectType.REHABILITACION,
        status: ProjectStatus.EN_LICITACION,
        priority: Priority.MEDIA,
        creationDate: new Date('2024-03-10'),
        plannedEndDate: new Date('2025-06-30'),
        budget: {
          total: 320000000,
          executed: 0,
          committed: 0,
          available: 320000000,
          currency: 'PEN',
          lastUpdate: new Date('2024-11-01')
        },
        location: {
          department: 'Cusco',
          province: 'Cusco',
          district: 'Cusco',
          coordinates: { latitude: -13.5319, longitude: -71.9675 },
          altitude: 3399,
          accessType: 'carretera'
        },
        projectManager: 'Ing. José Huamán',
        progress: 0,
        risks: [],
        milestones: [],
        documents: [],
        tags: ['rehabilitación', 'urbano', 'evitamiento'],
        isPublic: true,
        lastUpdate: new Date('2024-11-01'),
        createdBy: 'Sistema PROVIAS',
        region: 'Sierra',
        beneficiaries: 450000,
        roadLength: 25,
        bridgeCount: 2,
        tunnelCount: 0
      },
      {
        id: '4',
        code: 'CUI-2024-004',
        title: 'Mantenimiento Rutinario Carretera Central',
        description: 'Programa de mantenimiento rutinario de 150 km de la Carretera Central.',
        type: ProjectType.MANTENIMIENTO,
        status: ProjectStatus.EN_EJECUCION,
        priority: Priority.BAJA,
        creationDate: new Date('2024-04-05'),
        startDate: new Date('2024-05-01'),
        plannedEndDate: new Date('2024-11-30'),
        budget: {
          total: 75000000,
          executed: 56250000,
          committed: 11250000,
          available: 7500000,
          currency: 'PEN',
          lastUpdate: new Date('2024-11-01')
        },
        location: {
          department: 'Lima',
          province: 'Huarochirí',
          district: 'Matucana',
          coordinates: { latitude: -11.8456, longitude: -76.3967 },
          altitude: 2378,
          accessType: 'carretera'
        },
        projectManager: 'Ing. Patricia Gonzales',
        progress: 75,
        risks: [],
        milestones: [],
        documents: [],
        tags: ['mantenimiento', 'rutinario', 'carretera-central'],
        isPublic: true,
        lastUpdate: new Date('2024-11-01'),
        createdBy: 'Sistema PROVIAS',
        region: 'Costa',
        beneficiaries: 150000,
        roadLength: 150,
        bridgeCount: 0,
        tunnelCount: 5
      },
      {
        id: '5',
        code: 'CUI-2024-005',
        title: 'Estudios de Pre-inversión Longitudinal de la Sierra',
        description: 'Estudios técnicos para la factibilidad de nueva carretera longitudinal en la sierra peruana.',
        type: ProjectType.ESTUDIOS,
        status: ProjectStatus.EN_EJECUCION,
        priority: Priority.URGENTE,
        creationDate: new Date('2024-05-12'),
        startDate: new Date('2024-07-01'),
        plannedEndDate: new Date('2025-01-31'),
        budget: {
          total: 180000000,
          executed: 54000000,
          committed: 36000000,
          available: 90000000,
          currency: 'PEN',
          lastUpdate: new Date('2024-11-01')
        },
        location: {
          department: 'Ayacucho',
          province: 'Huamanga',
          district: 'Ayacucho',
          coordinates: { latitude: -13.1631, longitude: -74.2236 },
          altitude: 2761,
          accessType: 'carretera'
        },
        projectManager: 'Ing. Ricardo Vargas',
        progress: 30,
        risks: [
          {
            id: 'r3',
            title: 'Complejidad Topográfica',
            description: 'Terreno muy accidentado puede incrementar costos',
            level: RiskLevel.MEDIO,
            probability: 60,
            impact: 3,
            mitigation: 'Uso de tecnología avanzada para levantamiento topográfico',
            responsible: 'Ing. Ricardo Vargas',
            dueDate: new Date('2024-12-15'),
            status: 'en_tratamiento'
          }
        ],
        milestones: [],
        documents: [],
        tags: ['estudios', 'pre-inversión', 'longitudinal'],
        isPublic: false,
        lastUpdate: new Date('2024-11-01'),
        createdBy: 'Sistema PROVIAS',
        region: 'Sierra',
        beneficiaries: 750000,
        roadLength: 450,
        bridgeCount: 25,
        tunnelCount: 12
      }
    ];

    this._projects.set(mockProjects);
  }

  // Métodos auxiliares para las vistas
  getProjectsByType(type: ProjectType): Project[] {
    return this.filteredProjects().filter(project => project.type === type);
  }

  getProjectsByStatus(status: ProjectStatus): Project[] {
    return this.filteredProjects().filter(project => project.status === status);
  }

  getProjectsByPriority(priority: Priority): Project[] {
    return this.filteredProjects().filter(project => project.priority === priority);
  }

  searchProjects(searchTerm: string): void {
    this.updateFilter({ searchText: searchTerm });
  }
}
