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
