// Interfaces para el configurador de temas

export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  CORPORATE = 'corporate',
  CREATIVE = 'creative',
  MINIMAL = 'minimal'
}

export enum LayoutType {
  COMPACT = 'compact',
  COMFORTABLE = 'comfortable',
  SPACIOUS = 'spacious'
}

export enum FontFamily {
  INTER = 'Inter',
  ROBOTO = 'Roboto',
  OPEN_SANS = 'Open Sans',
  LATO = 'Lato',
  POPPINS = 'Poppins'
}

export enum ColorScheme {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  ORANGE = 'orange',
  RED = 'red',
  TEAL = 'teal',
  INDIGO = 'indigo',
  PINK = 'pink'
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TypographyConfig {
  fontFamily: FontFamily;
  fontSize: number; // Base font size in px
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  headingFontFamily?: FontFamily;
  headingFontWeight?: number;
}

export interface SpacingConfig {
  scale: number; // Multiplier for spacing scale (0.5 - 2.0)
  containerMaxWidth: number; // in px
  borderRadius: number; // Base border radius in px
  gridGap: number; // Grid gap in px
}

export interface AnimationConfig {
  duration: number; // in ms
  easing: string;
  enableTransitions: boolean;
  enableAnimations: boolean;
  reducedMotion: boolean;
}

export interface ComponentStyles {
  shadows: boolean;
  roundedCorners: boolean;
  borders: boolean;
  gradients: boolean;
  glassEffect: boolean;
}

export interface WidgetConfig {
  id: string;
  type: 'card' | 'button' | 'input' | 'badge' | 'alert' | 'table';
  label: string;
  enabled: boolean;
  size: 'sm' | 'md' | 'lg';
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    fontSize?: number;
    fontWeight?: number;
    textAlign?: 'left' | 'center' | 'right';
    boxShadow?: boolean;
  };
  content?: {
    title?: string;
    description?: string;
    icon?: string;
    image?: string;
    value?: string | number;
    placeholder?: string;
  };
  interactions: {
    hover: boolean;
    click: boolean;
    focus: boolean;
    disabled: boolean;
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  type: ThemeType;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  animation: AnimationConfig;
  components: ComponentStyles;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeConfiguration {
  // Configuración general
  name: string;
  description: string;
  version: string;
  
  // Preset actual
  currentPreset: ThemePreset;
  
  // Configuraciones personalizadas
  customColors: Partial<ThemeColors>;
  customTypography: Partial<TypographyConfig>;
  customSpacing: Partial<SpacingConfig>;
  customAnimation: Partial<AnimationConfig>;
  customComponents: Partial<ComponentStyles>;
  
  // Layout y comportamiento
  layout: LayoutType;
  rtlEnabled: boolean;
  highContrast: boolean;
  
  // Widgets para demostración
  widgets: WidgetConfig[];
  
  // Configuración avanzada
  cssVariables: Record<string, string>;
  customCSS: string;
  
  // Metadatos
  isDirty: boolean;
  autoSave: boolean;
  lastSaved: Date;
}

// Presets predefinidos
export const DEFAULT_THEMES: Record<ThemeType, ThemePreset> = {
  [ThemeType.LIGHT]: {
    id: 'light-default',
    name: 'Tema Claro',
    description: 'Tema claro estándar con colores suaves',
    type: ThemeType.LIGHT,
    colorScheme: ColorScheme.BLUE,
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7'
    },
    typography: {
      fontFamily: FontFamily.INTER,
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      headingFontFamily: FontFamily.INTER,
      headingFontWeight: 600
    },
    spacing: {
      scale: 1,
      containerMaxWidth: 1200,
      borderRadius: 8,
      gridGap: 24
    },
    animation: {
      duration: 200,
      easing: 'ease-in-out',
      enableTransitions: true,
      enableAnimations: true,
      reducedMotion: false
    },
    components: {
      shadows: true,
      roundedCorners: true,
      borders: true,
      gradients: false,
      glassEffect: false
    },
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  [ThemeType.DARK]: {
    id: 'dark-default',
    name: 'Tema Oscuro',
    description: 'Tema oscuro moderno con acentos brillantes',
    type: ThemeType.DARK,
    colorScheme: ColorScheme.BLUE,
    colors: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    },
    typography: {
      fontFamily: FontFamily.INTER,
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      headingFontFamily: FontFamily.INTER,
      headingFontWeight: 600
    },
    spacing: {
      scale: 1,
      containerMaxWidth: 1200,
      borderRadius: 8,
      gridGap: 24
    },
    animation: {
      duration: 200,
      easing: 'ease-in-out',
      enableTransitions: true,
      enableAnimations: true,
      reducedMotion: false
    },
    components: {
      shadows: true,
      roundedCorners: true,
      borders: true,
      gradients: false,
      glassEffect: false
    },
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  [ThemeType.CORPORATE]: {
    id: 'corporate-default',
    name: 'Tema Corporativo',
    description: 'Tema profesional para aplicaciones empresariales',
    type: ThemeType.CORPORATE,
    colorScheme: ColorScheme.INDIGO,
    colors: {
      primary: '#4f46e5',
      secondary: '#6b7280',
      accent: '#059669',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1d5db',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7'
    },
    typography: {
      fontFamily: FontFamily.ROBOTO,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      headingFontFamily: FontFamily.ROBOTO,
      headingFontWeight: 500
    },
    spacing: {
      scale: 0.875,
      containerMaxWidth: 1400,
      borderRadius: 4,
      gridGap: 16
    },
    animation: {
      duration: 150,
      easing: 'ease-out',
      enableTransitions: true,
      enableAnimations: false,
      reducedMotion: true
    },
    components: {
      shadows: false,
      roundedCorners: false,
      borders: true,
      gradients: false,
      glassEffect: false
    },
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  [ThemeType.CREATIVE]: {
    id: 'creative-default',
    name: 'Tema Creativo',
    description: 'Tema vibrante con gradientes y efectos visuales',
    type: ThemeType.CREATIVE,
    colorScheme: ColorScheme.PURPLE,
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#f59e0b',
      background: '#fefefe',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    },
    typography: {
      fontFamily: FontFamily.POPPINS,
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: 0.025,
      headingFontFamily: FontFamily.POPPINS,
      headingFontWeight: 700
    },
    spacing: {
      scale: 1.25,
      containerMaxWidth: 1200,
      borderRadius: 16,
      gridGap: 32
    },
    animation: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enableTransitions: true,
      enableAnimations: true,
      reducedMotion: false
    },
    components: {
      shadows: true,
      roundedCorners: true,
      borders: false,
      gradients: true,
      glassEffect: true
    },
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  [ThemeType.MINIMAL]: {
    id: 'minimal-default',
    name: 'Tema Minimalista',
    description: 'Diseño limpio y minimalista con espacios amplios',
    type: ThemeType.MINIMAL,
    colorScheme: ColorScheme.TEAL,
    colors: {
      primary: '#14b8a6',
      secondary: '#94a3b8',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#fefefe',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#f1f5f9',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7'
    },
    typography: {
      fontFamily: FontFamily.LATO,
      fontSize: 16,
      fontWeight: 300,
      lineHeight: 1.7,
      letterSpacing: 0,
      headingFontFamily: FontFamily.LATO,
      headingFontWeight: 400
    },
    spacing: {
      scale: 1.5,
      containerMaxWidth: 1000,
      borderRadius: 2,
      gridGap: 48
    },
    animation: {
      duration: 250,
      easing: 'ease-out',
      enableTransitions: true,
      enableAnimations: false,
      reducedMotion: true
    },
    components: {
      shadows: false,
      roundedCorners: false,
      borders: false,
      gradients: false,
      glassEffect: false
    },
    isCustom: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Configuración de colores por esquema
export const COLOR_SCHEMES: Record<ColorScheme, Partial<ThemeColors>> = {
  [ColorScheme.BLUE]: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#06b6d4'
  },
  [ColorScheme.GREEN]: {
    primary: '#059669',
    secondary: '#64748b',
    accent: '#10b981'
  },
  [ColorScheme.PURPLE]: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#c084fc'
  },
  [ColorScheme.ORANGE]: {
    primary: '#ea580c',
    secondary: '#fb923c',
    accent: '#f59e0b'
  },
  [ColorScheme.RED]: {
    primary: '#dc2626',
    secondary: '#ef4444',
    accent: '#f87171'
  },
  [ColorScheme.TEAL]: {
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#2dd4bf'
  },
  [ColorScheme.INDIGO]: {
    primary: '#4f46e5',
    secondary: '#6366f1',
    accent: '#818cf8'
  },
  [ColorScheme.PINK]: {
    primary: '#ec4899',
    secondary: '#f472b6',
    accent: '#f9a8d4'
  }
};
