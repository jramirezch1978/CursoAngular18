import { Injectable, signal, computed } from '@angular/core';
import { Project, ProjectStatus, ProjectType, Priority, Contractor, Risk, Milestone } from '../interfaces/infrastructure.interface';

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

  // Generar datos mock
  private generateMockProjects(): Project[] {
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
          },
          {
            id: 'RSK-002',
            type: 'tecnico',
            description: 'Suelo con baja capacidad portante en km 23-25',
            probability: 'alta',
            impact: 'medio',
            mitigation: 'Reforzamiento con geotextiles y material seleccionado'
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
          },
          {
            id: 'ML-002',
            name: 'Pavimentación primer tramo',
            description: 'Pavimentar km 0-15',
            dueDate: new Date('2025-06-30'),
            completed: true,
            completedDate: new Date('2025-06-25')
          },
          {
            id: 'ML-003',
            name: 'Señalización horizontal',
            description: 'Completar señalización horizontal en todo el tramo',
            dueDate: new Date('2025-09-30'),
            completed: false
          }
        ],
        documents: [
          {
            id: 'DOC-001',
            name: 'Expediente Técnico v2.pdf',
            type: 'pdf',
            url: '/documents/exp-tecnico-v2.pdf',
            uploadedAt: new Date('2025-01-10'),
            uploadedBy: 'Admin'
          }
        ]
      },
      {
        id: 'PRY-002',
        code: 'PTE-2025-002',
        name: 'Construcción Puente Vehicular Río Chira',
        type: ProjectType.PUENTE,
        status: ProjectStatus.LICITACION,
        budget: 8500000,
        progress: 0,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        department: 'Piura',
        province: 'Sullana',
        district: 'Marcavelica',
        contractor: {
          id: 'CTR-002',
          ruc: '20987654321',
          name: 'Ingeniería de Puentes SAC',
          email: 'info@puentes.pe',
          phone: '01-555-1234',
          representative: 'Ing. Luis Torres',
          rating: 4.8
        },
        supervisor: 'Ing. Roberto Silva',
        priority: Priority.CRITICA,
        risks: [
          {
            id: 'RSK-003',
            type: 'financiero',
            description: 'Fluctuación del tipo de cambio para materiales importados',
            probability: 'alta',
            impact: 'medio',
            mitigation: 'Contratos con cobertura cambiaria'
          }
        ],
        milestones: [
          {
            id: 'ML-004',
            name: 'Estudios definitivos',
            description: 'Completar estudios de suelo y diseño final',
            dueDate: new Date('2025-10-31'),
            completed: false
          }
        ],
        documents: []
      },
      {
        id: 'PRY-003',
        code: 'MNT-2025-003',
        name: 'Mantenimiento Periódico Red Vial Departamental',
        type: ProjectType.MANTENIMIENTO,
        status: ProjectStatus.COMPLETADO,
        budget: 3200000,
        progress: 100,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        department: 'Piura',
        province: 'Morropón',
        district: 'Chulucanas',
        contractor: {
          id: 'CTR-003',
          ruc: '20456789123',
          name: 'Mantenimiento Vial Piura EIRL',
          email: 'mantenimiento@vialpiura.pe',
          phone: '073-987654',
          representative: 'Ing. María Flores',
          rating: 4.2
        },
        supervisor: 'Ing. Pedro Ramírez',
        priority: Priority.MEDIA,
        risks: [],
        milestones: [
          {
            id: 'ML-005',
            name: 'Bacheo y sellado de fisuras',
            description: 'Reparación de superficie de rodadura',
            dueDate: new Date('2025-04-30'),
            completed: true,
            completedDate: new Date('2025-04-25')
          }
        ],
        documents: [
          {
            id: 'DOC-002',
            name: 'Informe Final de Obra.pdf',
            type: 'pdf',
            url: '/documents/informe-final.pdf',
            uploadedAt: new Date('2025-07-01'),
            uploadedBy: 'Supervisor'
          }
        ]
      },
      {
        id: 'PRY-004',
        code: 'EMG-2025-004',
        name: 'Atención Emergencia Vial - Huaicos km 45',
        type: ProjectType.EMERGENCIA,
        status: ProjectStatus.SUPERVISION,
        budget: 1500000,
        progress: 85,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-08-15'),
        department: 'Piura',
        province: 'Huancabamba',
        district: 'Canchaque',
        contractor: {
          id: 'CTR-004',
          ruc: '20789456123',
          name: 'Emergencias Viales SAC',
          email: 'emergencias@vialsac.pe',
          phone: '073-456789',
          representative: 'Ing. Jorge Díaz',
          rating: 4.0
        },
        supervisor: 'Ing. Carmen López',
        priority: Priority.CRITICA,
        risks: [
          {
            id: 'RSK-004',
            type: 'ambiental',
            description: 'Posibles nuevos deslizamientos por lluvias',
            probability: 'media',
            impact: 'alto',
            mitigation: 'Monitoreo meteorológico constante y plan de contingencia'
          }
        ],
        milestones: [
          {
            id: 'ML-006',
            name: 'Limpieza de vía',
            description: 'Retiro de material de derrumbe',
            dueDate: new Date('2025-07-10'),
            completed: true,
            completedDate: new Date('2025-07-09')
          },
          {
            id: 'ML-007',
            name: 'Estabilización de taludes',
            description: 'Obras de contención y estabilización',
            dueDate: new Date('2025-08-10'),
            completed: false
          }
        ],
        documents: []
      },
      {
        id: 'PRY-005',
        code: 'PE-1N-2025-005',
        name: 'Ampliación Carretera PE-1N Sector Urbano',
        type: ProjectType.CARRETERA,
        status: ProjectStatus.PLANIFICACION,
        budget: 18000000,
        progress: 10,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-12-31'),
        department: 'Piura',
        province: 'Paita',
        district: 'Paita',
        contractor: {
          id: 'CTR-005',
          ruc: '20147852369',
          name: 'Consorcio Vial Costa Norte',
          email: 'info@costanorte.pe',
          phone: '073-741852',
          representative: 'Ing. Fernando Vargas',
          rating: 4.6
        },
        supervisor: 'Por asignar',
        priority: Priority.ALTA,
        risks: [
          {
            id: 'RSK-005',
            type: 'social',
            description: 'Resistencia de población por expropiaciones',
            probability: 'alta',
            impact: 'alto',
            mitigation: 'Plan de comunicación y compensación justa'
          }
        ],
        milestones: [
          {
            id: 'ML-008',
            name: 'Liberación de áreas',
            description: 'Completar proceso de expropiación',
            dueDate: new Date('2025-10-31'),
            completed: false
          }
        ],
        documents: []
      }
    ];
  }
}
