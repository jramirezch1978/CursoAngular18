/**
 * Interfaces para el Sistema de Gestión de Tareas de PROVIAS
 * Lab 3: Pipes Built-in y Async
 */

export interface Task {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-100
  budget: number;
  budgetUsed: number;
  createdAt: Date;
  dueDate: Date;
  completedAt?: Date;
  assignee: TaskAssignee;
  location: TaskLocation;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

export type TaskType = 
  | 'construccion'
  | 'mantenimiento' 
  | 'supervision'
  | 'presupuesto'
  | 'equipos'
  | 'seguridad'
  | 'documentacion'
  | 'inspeccion';

export type TaskPriority = 'baja' | 'media' | 'alta' | 'critica' | 'urgente';

export type TaskStatus = 
  | 'pendiente'
  | 'en-progreso'
  | 'en-revision'
  | 'pausada'
  | 'completada'
  | 'cancelada'
  | 'vencida';

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar?: string;
}

export interface TaskLocation {
  region: string;
  province: string;
  district: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  km?: number; // Kilómetro de carretera
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  author: TaskAssignee;
  content: string;
  createdAt: Date;
  isInternal: boolean;
}

// Filtros y búsqueda
export interface TaskFilters {
  search: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee?: string;
  region?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

// Estadísticas
export interface TaskStatistics {
  total: number;
  byStatus: { [key in TaskStatus]: number };
  byPriority: { [key in TaskPriority]: number };
  byType: { [key in TaskType]: number };
  byRegion: { [region: string]: number };
  completed: number;
  overdue: number;
  budgetTotal: number;
  budgetUsed: number;
  budgetRemaining: number;
  averageProgress: number;
  completionRate: number;
  onTimeRate: number;
}

// Configuración de vista
export interface TaskViewConfig {
  itemsPerPage: number;
  sortBy: keyof Task;
  sortDirection: 'asc' | 'desc';
  groupBy?: keyof Task;
  viewMode: 'list' | 'grid' | 'kanban';
  showCompletedTasks: boolean;
  compactMode: boolean;
}

// Estados de la aplicación
export interface TaskManagerState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  selectedTasks: number[];
  activeFilters: TaskFilters;
  viewConfig: TaskViewConfig;
}

// Datos para gráficos y reportes
export interface TaskChart {
  labels: string[];
  data: number[];
  colors: string[];
  type: 'pie' | 'bar' | 'line' | 'doughnut';
}

export interface TaskReport {
  id: string;
  title: string;
  description: string;
  period: {
    start: Date;
    end: Date;
  };
  data: {
    summary: TaskStatistics;
    charts: TaskChart[];
    topTasks: Task[];
    alerts: ReportAlert[];
  };
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportAlert {
  type: 'budget' | 'deadline' | 'quality' | 'resource';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  taskId?: number;
  recommendation?: string;
}

// Timeline y actividad
export interface TaskActivity {
  id: string;
  taskId: number;
  type: ActivityType;
  description: string;
  performedBy: TaskAssignee;
  performedAt: Date;
  oldValue?: any;
  newValue?: any;
  metadata?: { [key: string]: any };
}

export type ActivityType = 
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'progress_updated'
  | 'assigned'
  | 'comment_added'
  | 'attachment_added'
  | 'budget_modified'
  | 'deadline_extended'
  | 'completed';

// Notificaciones
export interface TaskNotification {
  id: string;
  taskId: number;
  type: NotificationType;
  title: string;
  message: string;
  recipients: string[];
  createdAt: Date;
  readBy: string[];
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export type NotificationType = 
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'task_completed'
  | 'budget_exceeded'
  | 'comment_added'
  | 'status_changed';

// Configuración del sistema
export interface SystemConfig {
  defaultPriority: TaskPriority;
  defaultDueDate: number; // días desde creación
  budgetAlertThreshold: number; // porcentaje
  overdueGracePeriod: number; // días
  autoArchiveCompleted: boolean;
  autoArchiveDays: number;
  notificationSettings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
    workingDays: number[]; // 0-6, domingo = 0
  };
}