/**
 * Interfaces para el Demo de Pipes Personalizados
 * Lab 4: Pipes Personalizados
 */

export interface Project {
  id: number;
  name: string;
  description: string;
  manager: string;
  region: string;
  budget: number;
  fileSize: number; // en bytes
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  priority: ProjectPriority;
  tags: string[];
  documents: Document[];
  milestones: Milestone[];
}

export type ProjectStatus = 
  | 'planning'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'cancelled';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  size: number; // en bytes
  uploadedAt: Date;
  uploadedBy: string;
  version: string;
  description: string;
}

export type DocumentType = 
  | 'blueprint'
  | 'specification'
  | 'report'
  | 'contract'
  | 'photo'
  | 'video'
  | 'other';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignee: string;
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  hireDate: Date;
  salary: number;
  skills: string[];
  performance: number; // 0-100
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  manufacturer: string;
  model: string;
  acquisitionDate: Date;
  lastMaintenance: Date;
  nextMaintenance: Date;
  hoursWorked: number;
  currentValue: number;
  location: string;
  operator: string;
  fuelConsumption: number; // litros por hora
  status: EquipmentStatus;
}

export type EquipmentType = 
  | 'excavator'
  | 'bulldozer'
  | 'compactor'
  | 'truck'
  | 'crane'
  | 'mixer'
  | 'generator'
  | 'other';

export type EquipmentStatus = 
  | 'operational'
  | 'maintenance'
  | 'repair'
  | 'idle'
  | 'retired';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  author: string;
  createdAt: Date;
  content: string;
  attachments: string[];
  regions: string[];
  tags: string[];
  views: number;
  priority: 'low' | 'medium' | 'high';
}

export type ReportType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'incident'
  | 'audit'
  | 'technical';

// Configuración para el demo
export interface DemoConfig {
  searchTerm: string;
  selectedField: string;
  truncateLimit: number;
  truncateTrail: string;
  useWordBoundary: boolean;
  fileSizeUnits: 'binary' | 'decimal';
  fileSizeDecimals: number;
  highlightClass: string;
  caseSensitive: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  sortDataType: 'string' | 'number' | 'date';
  showPerformanceMetrics: boolean;
}

// Métricas de performance
export interface PerformanceMetrics {
  pipeName: string;
  executionTime: number;
  memoryUsage: number;
  executionCount: number;
  lastExecution: Date;
  averageTime: number;
}

// Tipos para el showcase
export interface PipeExample {
  id: string;
  name: string;
  description: string;
  syntax: string;
  examples: CodeExample[];
  parameters: PipeParameter[];
  useCases: UseCase[];
  performance: {
    isPure: boolean;
    executionTime: string;
    recommendation: string;
  };
}

export interface CodeExample {
  label: string;
  code: string;
  input: any;
  output: string;
  explanation: string;
}

export interface PipeParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  examples: string[];
}

export interface UseCase {
  title: string;
  description: string;
  scenario: string;
  benefits: string[];
  implementation: string;
}

// Tipos para testing
export interface TestCase {
  description: string;
  input: any;
  parameters?: any[];
  expected: any;
  category: 'basic' | 'edge-case' | 'performance' | 'security';
}

export interface PipeTestSuite {
  pipeName: string;
  testCases: TestCase[];
  performanceTests: PerformanceTest[];
}

export interface PerformanceTest {
  name: string;
  description: string;
  iterations: number;
  inputSize: number;
  expectedTime: number; // en ms
  memoryLimit: number; // en MB
}

// Configuración avanzada
export interface AdvancedConfig {
  enableMemoization: boolean;
  cacheSize: number;
  enableProfiling: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  enableOptimizations: boolean;
  batchSize: number;
}

// Datos de ejemplo para el showcase
export interface SampleData {
  projects: Project[];
  employees: Employee[];
  equipment: Equipment[];
  reports: Report[];
  rawText: string[];
  numbers: number[];
  dates: Date[];
  files: Array<{ name: string; size: number; type: string }>;
}

// Estados de la aplicación demo
export interface DemoState {
  activeTab: DemoTab;
  selectedPipe: string;
  config: DemoConfig;
  sampleData: SampleData;
  results: any;
  isLoading: boolean;
  error: string | null;
  metrics: PerformanceMetrics[];
}

export type DemoTab = 
  | 'overview'
  | 'filter'
  | 'truncate'
  | 'fileSize'
  | 'timeAgo'
  | 'highlight'
  | 'sortBy'
  | 'testing'
  | 'performance';

// Opciones de configuración para cada pipe
export interface FilterOptions {
  searchTerm: string;
  field?: string;
  caseSensitive: boolean;
  exactMatch: boolean;
  searchFields: string[];
}

export interface TruncateOptions {
  limit: number;
  trail: string;
  wordBoundary: boolean;
  preserveHTML: boolean;
}

export interface FileSizeOptions {
  decimals: number;
  units: 'binary' | 'decimal';
  showUnits: boolean;
  locale: string;
}

export interface TimeAgoOptions {
  updateInterval: number;
  showSeconds: boolean;
  longFormat: boolean;
  locale: string;
}

export interface HighlightOptions {
  className: string;
  caseSensitive: boolean;
  wholeWords: boolean;
  maxHighlights: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  dataType: 'string' | 'number' | 'date';
  nullsFirst: boolean;
  localeCompare: boolean;
}