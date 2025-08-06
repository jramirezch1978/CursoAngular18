/**
 * Interfaces para el Dashboard Avanzado de PROVIAS
 * Lab 2: Binding Avanzado y Manejo de Eventos
 */

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  data: any;
  config: WidgetConfig;
  status: WidgetStatus;
  lastUpdate: Date;
  isVisible: boolean;
  permissions: string[];
}

export type WidgetType = 
  | 'chart' 
  | 'metric' 
  | 'table' 
  | 'map' 
  | 'status' 
  | 'alert' 
  | 'progress'
  | 'calendar';

export interface WidgetSize {
  width: number;  // Grid columns (1-12)
  height: number; // Grid rows (1-6)
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  zIndex?: number;
}

export interface WidgetConfig {
  theme: WidgetTheme;
  refreshInterval: number; // milliseconds
  autoRefresh: boolean;
  showHeader: boolean;
  showFooter: boolean;
  allowResize: boolean;
  allowMove: boolean;
  customStyles?: { [key: string]: string };
}

export type WidgetTheme = 'light' | 'dark' | 'auto' | 'high-contrast';

export type WidgetStatus = 'loading' | 'ready' | 'error' | 'offline' | 'updating';

// Datos específicos para widgets de PROVIAS
export interface ProjectMetrics {
  id: string;
  name: string;
  progress: number;
  budget: number;
  budgetUsed: number;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  priority: ProjectPriority;
  manager: string;
  location: ProjectLocation;
  risks: RiskLevel;
}

export type ProjectStatus = 
  | 'planning' 
  | 'in-progress' 
  | 'on-hold' 
  | 'completed' 
  | 'cancelled' 
  | 'delayed';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical';

export interface ProjectLocation {
  region: string;
  province: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface EquipmentStatus {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'idle' | 'critical';
  location: string;
  operator: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  hoursWorked: number;
  efficiency: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

export type AlertType = 
  | 'maintenance' 
  | 'safety' 
  | 'budget' 
  | 'schedule' 
  | 'quality' 
  | 'environment';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

// Configuración del Dashboard
export interface DashboardConfig {
  layout: DashboardLayout;
  theme: DashboardTheme;
  autoSave: boolean;
  refreshInterval: number;
  userId: string;
  permissions: string[];
  customization: DashboardCustomization;
}

export type DashboardLayout = 'grid' | 'flex' | 'masonry';

export interface DashboardTheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  isDark: boolean;
}

export interface DashboardCustomization {
  allowWidgetResize: boolean;
  allowWidgetMove: boolean;
  allowWidgetAdd: boolean;
  allowWidgetRemove: boolean;
  allowThemeChange: boolean;
  maxWidgets: number;
}

// Estados de la aplicación
export interface DashboardState {
  isLoading: boolean;
  isFullscreen: boolean;
  isMobile: boolean;
  isOffline: boolean;
  selectedWidgets: string[];
  activeWidget?: string;
  searchTerm: string;
  filters: DashboardFilters;
}

export interface DashboardFilters {
  widgetType?: WidgetType;
  status?: WidgetStatus;
  region?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Eventos del Dashboard
export interface WidgetEvent {
  type: WidgetEventType;
  widgetId: string;
  payload?: any;
  timestamp: Date;
}

export type WidgetEventType = 
  | 'resize' 
  | 'move' 
  | 'click' 
  | 'hover' 
  | 'refresh' 
  | 'configure' 
  | 'remove';

// User Preferences
export interface UserPreferences {
  userId: string;
  dashboardLayout: DashboardWidget[];
  theme: DashboardTheme;
  language: string;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  types: AlertType[];
  frequency: 'realtime' | 'hourly' | 'daily';
  sound: boolean;
  email: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}