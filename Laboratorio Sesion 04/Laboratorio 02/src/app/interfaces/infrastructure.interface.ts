// Interfaces para el sistema de gestión de proyectos PROVIAS

export enum ProjectType {
  REHABILITACION = 'rehabilitacion',
  MEJORAMIENTO = 'mejoramiento',
  CONSTRUCCION = 'construccion',
  MANTENIMIENTO = 'mantenimiento',
  ESTUDIOS = 'estudios'
}

export enum ProjectStatus {
  PLANIFICACION = 'planificacion',
  EN_LICITACION = 'en_licitacion',
  EN_EJECUCION = 'en_ejecucion',
  SUPERVISION = 'supervision',
  FINALIZADO = 'finalizado',
  SUSPENDIDO = 'suspendido',
  CANCELADO = 'cancelado'
}

export enum Priority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
  URGENTE = 'urgente'
}

export enum RiskLevel {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico'
}

export interface Contractor {
  id: string;
  name: string;
  ruc: string;
  email: string;
  phone: string;
  address: string;
  specialties: ProjectType[];
  rating: number; // 1-5 estrellas
  isActive: boolean;
  contractsCompleted: number;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  probability: number; // 0-100%
  impact: number; // 1-5 escala
  mitigation: string;
  responsible: string;
  dueDate: Date;
  status: 'identificado' | 'en_tratamiento' | 'mitigado' | 'materializado';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completionDate?: Date;
  isCompleted: boolean;
  dependencies: string[]; // IDs de otros milestones
  deliverables: string[];
  responsible: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'expediente' | 'contrato' | 'informe' | 'plano' | 'especificacion' | 'otro';
  url: string;
  uploadDate: Date;
  version: string;
  size: number; // en bytes
  uploadedBy: string;
  isPublic: boolean;
}

export interface Budget {
  total: number;
  executed: number;
  committed: number;
  available: number;
  currency: 'PEN' | 'USD';
  lastUpdate: Date;
}

export interface Location {
  department: string;
  province: string;
  district: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  altitude?: number;
  accessType: 'carretera' | 'trocha' | 'camino_herradura' | 'fluvial';
}

export interface Project {
  id: string;
  code: string; // Código SNIP o CUI
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: Priority;
  
  // Fechas importantes
  creationDate: Date;
  startDate?: Date;
  plannedEndDate?: Date;
  actualEndDate?: Date;
  
  // Información financiera
  budget: Budget;
  
  // Ubicación
  location: Location;
  
  // Participantes
  projectManager: string;
  contractor?: Contractor;
  supervisor?: string;
  
  // Seguimiento
  progress: number; // 0-100%
  risks: Risk[];
  milestones: Milestone[];
  documents: Document[];
  
  // Metadatos
  tags: string[];
  isPublic: boolean;
  lastUpdate: Date;
  createdBy: string;
  
  // Campos adicionales para demostración
  region: string;
  beneficiaries: number;
  roadLength?: number; // en km, para proyectos viales
  bridgeCount?: number; // número de puentes
  tunnelCount?: number; // número de túneles
}

// Interfaces para filtros y vistas
export interface ProjectFilter {
  types?: ProjectType[];
  statuses?: ProjectStatus[];
  priorities?: Priority[];
  regions?: string[];
  departments?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  searchText?: string;
}

export interface ProjectSummary {
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByType: Record<ProjectType, number>;
  projectsByPriority: Record<Priority, number>;
  totalBudget: number;
  executedBudget: number;
  averageProgress: number;
  criticalProjects: number;
  delayedProjects: number;
}
