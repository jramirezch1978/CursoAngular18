/**
 * 🏗️ Interface principal para proyectos de PROVIAS
 * Define la estructura de proyectos de infraestructura
 */
export interface Project {
  id: number;                    // Identificador único
  name: string;                  // Nombre del proyecto
  description: string;           // Descripción detallada
  status: ProjectStatus;         // Estado actual del proyecto
  startDate: Date;              // Fecha de inicio
  endDate?: Date;               // Fecha de finalización (opcional)
  budget: number;               // Presupuesto asignado
  assignedUserIds: number[];    // IDs de usuarios asignados
  location: string;             // Ubicación geográfica
  priority: ProjectPriority;    // Prioridad del proyecto
}

/**
 * 📋 Enum para estados de proyecto
 * Representa el ciclo de vida de un proyecto
 */
export enum ProjectStatus {
  PLANNING = 'planning',           // En planificación
  IN_PROGRESS = 'in_progress',    // En ejecución
  ON_HOLD = 'on_hold',           // En pausa
  COMPLETED = 'completed',        // Completado
  CANCELLED = 'cancelled'         // Cancelado
}

/**
 * 🚨 Enum para prioridades de proyecto
 * Define la urgencia e importancia
 */
export enum ProjectPriority {
  LOW = 'low',                   // Baja prioridad
  MEDIUM = 'medium',             // Prioridad media
  HIGH = 'high',                 // Alta prioridad
  CRITICAL = 'critical'          // Crítico - atención inmediata
}

/**
 * 📊 Interface para estadísticas de proyectos
 */
export interface ProjectStats {
  totalProjects: number;
  byStatus: { [key in ProjectStatus]: number };
  byPriority: { [key in ProjectPriority]: number };
  totalBudget: number;
  averageDuration: number; // En días
}