// Interfaces para el sistema de configuración de temas - LAB 2
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  animations: boolean;
  borderRadius: number;
}

export interface LayoutConfig {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  showGrid: boolean;
  autoSave: boolean;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  position: WidgetPosition;
  size: WidgetSize;
  config: any;
}

export enum WidgetType {
  CHART = 'chart',
  TABLE = 'table',
  CARD = 'card',
  LIST = 'list',
  CALENDAR = 'calendar',
  MAP = 'map'
}

export interface WidgetPosition {
  x: number;
  y: number;
  order: number;
}

export enum WidgetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large'
}

export interface ComponentVisibility {
  header: boolean;
  sidebar: boolean;
  footer: boolean;
  breadcrumbs: boolean;
  notifications: boolean;
}
