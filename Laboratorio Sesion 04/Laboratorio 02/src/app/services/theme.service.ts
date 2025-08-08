import { Injectable, computed, signal, effect } from '@angular/core';
import { 
  ThemeConfiguration, 
  ThemePreset, 
  ThemeType, 
  LayoutType, 
  FontFamily, 
  ColorScheme,
  WidgetConfig,
  DEFAULT_THEMES,
  COLOR_SCHEMES,
  ThemeColors,
  TypographyConfig,
  SpacingConfig
} from '../interfaces/theme.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signals privados para el estado interno
  private readonly _currentConfiguration = signal<ThemeConfiguration>(this.createDefaultConfiguration());
  private readonly _presets = signal<ThemePreset[]>(Object.values(DEFAULT_THEMES));
  private readonly _isLoading = signal<boolean>(false);
  private readonly _isDirty = signal<boolean>(false);

  // Signals públicos de solo lectura
  readonly configuration = this._currentConfiguration.asReadonly();
  readonly presets = this._presets.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isDirty = this._isDirty.asReadonly();

  // Computed signals para propiedades específicas
  readonly currentPreset = computed(() => this._currentConfiguration().currentPreset);
  readonly currentTheme = computed(() => this._currentConfiguration().currentPreset.type);
  readonly currentColorScheme = computed(() => this._currentConfiguration().currentPreset.colorScheme);
  readonly currentLayout = computed(() => this._currentConfiguration().layout);

  // Computed signals para estilos derivados
  readonly computedColors = computed(() => {
    const config = this._currentConfiguration();
    const baseColors = config.currentPreset.colors;
    const customColors = config.customColors;
    
    return { ...baseColors, ...customColors };
  });

  readonly computedTypography = computed(() => {
    const config = this._currentConfiguration();
    const baseTypography = config.currentPreset.typography;
    const customTypography = config.customTypography;
    
    return { ...baseTypography, ...customTypography };
  });

  readonly computedSpacing = computed(() => {
    const config = this._currentConfiguration();
    const baseSpacing = config.currentPreset.spacing;
    const customSpacing = config.customSpacing;
    
    return { ...baseSpacing, ...customSpacing };
  });

  readonly computedAnimation = computed(() => {
    const config = this._currentConfiguration();
    const baseAnimation = config.currentPreset.animation;
    const customAnimation = config.customAnimation;
    
    return { ...baseAnimation, ...customAnimation };
  });

  readonly computedComponents = computed(() => {
    const config = this._currentConfiguration();
    const baseComponents = config.currentPreset.components;
    const customComponents = config.customComponents;
    
    return { ...baseComponents, ...customComponents };
  });

  // Computed signals para clases CSS dinámicas
  readonly containerClasses = computed(() => {
    const config = this._currentConfiguration();
    const layout = config.layout;
    const theme = config.currentPreset.type;
    const colorScheme = config.currentPreset.colorScheme;
    
    return {
      'theme-configurator': true,
      [`theme-${theme}`]: true,
      [`layout-${layout}`]: true,
      [`color-scheme-${colorScheme}`]: true,
      'rtl': config.rtlEnabled,
      'high-contrast': config.highContrast,
      'reduced-motion': this.computedAnimation().reducedMotion
    };
  });

  readonly containerStyles = computed(() => {
    const colors = this.computedColors();
    const typography = this.computedTypography();
    const spacing = this.computedSpacing();
    const animation = this.computedAnimation();
    const config = this._currentConfiguration();
    
    const styles: Record<string, any> = {
      // Variables CSS para colores
      '--theme-primary': colors.primary,
      '--theme-secondary': colors.secondary,
      '--theme-accent': colors.accent,
      '--theme-background': colors.background,
      '--theme-surface': colors.surface,
      '--theme-text': colors.text,
      '--theme-text-secondary': colors.textSecondary,
      '--theme-border': colors.border,
      '--theme-success': colors.success,
      '--theme-warning': colors.warning,
      '--theme-error': colors.error,
      '--theme-info': colors.info,
      
      // Variables CSS para tipografía
      '--theme-font-family': `'${typography.fontFamily}', sans-serif`,
      '--theme-font-size': `${typography.fontSize}px`,
      '--theme-font-weight': typography.fontWeight,
      '--theme-line-height': typography.lineHeight,
      '--theme-letter-spacing': `${typography.letterSpacing}px`,
      '--theme-heading-font-family': `'${typography.headingFontFamily || typography.fontFamily}', sans-serif`,
      '--theme-heading-font-weight': typography.headingFontWeight || typography.fontWeight,
      
      // Variables CSS para espaciado
      '--theme-spacing-scale': spacing.scale,
      '--theme-container-max-width': `${spacing.containerMaxWidth}px`,
      '--theme-border-radius': `${spacing.borderRadius}px`,
      '--theme-grid-gap': `${spacing.gridGap}px`,
      
      // Variables CSS para animaciones
      '--theme-animation-duration': `${animation.duration}ms`,
      '--theme-animation-easing': animation.easing,
      
      // Variables adicionales del usuario
      ...config.cssVariables
    };

    return styles;
  });

  // Computed signal para widgets activos
  readonly activeWidgets = computed(() => {
    return this._currentConfiguration().widgets.filter(widget => widget.enabled);
  });

  constructor() {
    // Effect para auto-guardar cuando hay cambios
    effect(() => {
      const config = this._currentConfiguration();
      if (config.autoSave && this._isDirty()) {
        this.saveToLocalStorage();
        this._isDirty.set(false);
      }
    });

    // Cargar configuración desde localStorage al inicializar
    this.loadFromLocalStorage();
  }

  // Métodos para gestión de presets
  applyPreset(presetId: string): void {
    const preset = this._presets().find(p => p.id === presetId);
    if (!preset) return;

    this._currentConfiguration.update(config => ({
      ...config,
      currentPreset: preset,
      // Limpiar personalizaciones al aplicar preset
      customColors: {},
      customTypography: {},
      customSpacing: {},
      customAnimation: {},
      customComponents: {},
      lastSaved: new Date()
    }));

    this._isDirty.set(true);
  }

  switchTheme(themeType: ThemeType): void {
    const preset = DEFAULT_THEMES[themeType];
    this.applyPreset(preset.id);
  }

  switchColorScheme(colorScheme: ColorScheme): void {
    const newColors = COLOR_SCHEMES[colorScheme];
    this.updateColors(newColors);
  }

  setLayout(layout: LayoutType): void {
    this._currentConfiguration.update(config => ({
      ...config,
      layout,
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  // Métodos para personalización de colores
  updateColors(colors: Partial<ThemeColors>): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customColors: { ...config.customColors, ...colors },
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  updateColor(colorKey: keyof ThemeColors, value: string): void {
    this.updateColors({ [colorKey]: value });
  }

  resetColors(): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customColors: {},
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  // Métodos para personalización de tipografía
  updateTypography(typography: Partial<TypographyConfig>): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customTypography: { ...config.customTypography, ...typography },
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  updateFontFamily(fontFamily: FontFamily): void {
    this.updateTypography({ fontFamily });
  }

  updateFontSize(fontSize: number): void {
    this.updateTypography({ fontSize });
  }

  updateFontWeight(fontWeight: number): void {
    this.updateTypography({ fontWeight });
  }

  resetTypography(): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customTypography: {},
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  // Métodos para personalización de espaciado
  updateSpacing(spacing: Partial<SpacingConfig>): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customSpacing: { ...config.customSpacing, ...spacing },
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  updateSpacingScale(scale: number): void {
    this.updateSpacing({ scale });
  }

  updateBorderRadius(borderRadius: number): void {
    this.updateSpacing({ borderRadius });
  }

  resetSpacing(): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customSpacing: {},
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  // Métodos para gestión de widgets
  addWidget(widget: Omit<WidgetConfig, 'id'>): void {
    const newWidget: WidgetConfig = {
      ...widget,
      id: this.generateWidgetId()
    };

    this._currentConfiguration.update(config => ({
      ...config,
      widgets: [...config.widgets, newWidget],
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  updateWidget(widgetId: string, updates: Partial<WidgetConfig>): void {
    this._currentConfiguration.update(config => ({
      ...config,
      widgets: config.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  removeWidget(widgetId: string): void {
    this._currentConfiguration.update(config => ({
      ...config,
      widgets: config.widgets.filter(widget => widget.id !== widgetId),
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  toggleWidget(widgetId: string): void {
    this._currentConfiguration.update(config => ({
      ...config,
      widgets: config.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, enabled: !widget.enabled } : widget
      ),
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  // Métodos para opciones avanzadas
  toggleRTL(): void {
    this._currentConfiguration.update(config => ({
      ...config,
      rtlEnabled: !config.rtlEnabled,
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  toggleHighContrast(): void {
    this._currentConfiguration.update(config => ({
      ...config,
      highContrast: !config.highContrast,
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  toggleAutoSave(): void {
    this._currentConfiguration.update(config => ({
      ...config,
      autoSave: !config.autoSave,
      lastSaved: new Date()
    }));
  }

  updateCSSVariables(variables: Record<string, string>): void {
    this._currentConfiguration.update(config => ({
      ...config,
      cssVariables: { ...config.cssVariables, ...variables },
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  updateCustomCSS(css: string): void {
    this._currentConfiguration.update(config => ({
      ...config,
      customCSS: css,
      lastSaved: new Date()
    }));
    this._isDirty.set(true);
  }

  // Métodos para persistencia
  saveConfiguration(): void {
    this.saveToLocalStorage();
    this._isDirty.set(false);
  }

  loadConfiguration(): void {
    this.loadFromLocalStorage();
  }

  resetConfiguration(): void {
    this._currentConfiguration.set(this.createDefaultConfiguration());
    this._isDirty.set(true);
  }

  exportConfiguration(): string {
    return JSON.stringify(this._currentConfiguration(), null, 2);
  }

  importConfiguration(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as ThemeConfiguration;
      this._currentConfiguration.set(config);
      this._isDirty.set(true);
      return true;
    } catch {
      return false;
    }
  }

  // Métodos privados
  private createDefaultConfiguration(): ThemeConfiguration {
    return {
      name: 'Configuración por Defecto',
      description: 'Tema configurado para PROVIAS Nacional',
      version: '1.0.0',
      currentPreset: DEFAULT_THEMES[ThemeType.LIGHT],
      customColors: {},
      customTypography: {},
      customSpacing: {},
      customAnimation: {},
      customComponents: {},
      layout: LayoutType.COMFORTABLE,
      rtlEnabled: false,
      highContrast: false,
      widgets: this.createDefaultWidgets(),
      cssVariables: {},
      customCSS: '',
      isDirty: false,
      autoSave: true,
      lastSaved: new Date()
    };
  }

  private createDefaultWidgets(): WidgetConfig[] {
    return [
      {
        id: 'widget-1',
        type: 'card',
        label: 'Tarjeta de Información',
        enabled: true,
        size: 'md',
        variant: 'primary',
        position: { x: 10, y: 10, width: 300, height: 200 },
        style: {
          backgroundColor: 'var(--theme-surface)',
          textColor: 'var(--theme-text)',
          borderRadius: 8,
          padding: 16
        },
        content: {
          title: 'Proyecto Vial',
          description: 'Mejoramiento de carretera principal',
          icon: 'account_balance'
        },
        interactions: {
          hover: true,
          click: true,
          focus: false,
          disabled: false
        }
      },
      {
        id: 'widget-2',
        type: 'button',
        label: 'Botón Principal',
        enabled: true,
        size: 'lg',
        variant: 'primary',
        position: { x: 330, y: 10, width: 150, height: 40 },
        style: {
          backgroundColor: 'var(--theme-primary)',
          textColor: 'white',
          borderRadius: 8,
          padding: 12
        },
        content: {
          title: 'Ver Proyecto'
        },
        interactions: {
          hover: true,
          click: true,
          focus: true,
          disabled: false
        }
      },
      {
        id: 'widget-3',
        type: 'badge',
        label: 'Estado del Proyecto',
        enabled: true,
        size: 'sm',
        variant: 'secondary',
        position: { x: 500, y: 10, width: 100, height: 24 },
        style: {
          backgroundColor: 'var(--theme-success)',
          textColor: 'white',
          borderRadius: 12,
          padding: 4
        },
        content: {
          value: 'En Progreso'
        },
        interactions: {
          hover: false,
          click: false,
          focus: false,
          disabled: false
        }
      }
    ];
  }

  private generateWidgetId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToLocalStorage(): void {
    try {
      const config = this._currentConfiguration();
      localStorage.setItem('provias-theme-config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving theme configuration:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('provias-theme-config');
      if (saved) {
        const config = JSON.parse(saved) as ThemeConfiguration;
        this._currentConfiguration.set(config);
      }
    } catch (error) {
      console.error('Error loading theme configuration:', error);
    }
  }

  // Métodos auxiliares para el template
  getPresetsByType(themeType: ThemeType): ThemePreset[] {
    return this._presets().filter(preset => preset.type === themeType);
  }

  getColorSchemeOptions(): { value: ColorScheme; label: string }[] {
    return Object.values(ColorScheme).map(scheme => ({
      value: scheme,
      label: this.getColorSchemeLabel(scheme)
    }));
  }

  getFontFamilyOptions(): { value: FontFamily; label: string }[] {
    return Object.values(FontFamily).map(font => ({
      value: font,
      label: font
    }));
  }

  getLayoutOptions(): { value: LayoutType; label: string }[] {
    return [
      { value: LayoutType.COMPACT, label: 'Compacto' },
      { value: LayoutType.COMFORTABLE, label: 'Cómodo' },
      { value: LayoutType.SPACIOUS, label: 'Espacioso' }
    ];
  }

  private getColorSchemeLabel(scheme: ColorScheme): string {
    const labels: Record<ColorScheme, string> = {
      [ColorScheme.BLUE]: 'Azul',
      [ColorScheme.GREEN]: 'Verde',
      [ColorScheme.PURPLE]: 'Púrpura',
      [ColorScheme.ORANGE]: 'Naranja',
      [ColorScheme.RED]: 'Rojo',
      [ColorScheme.TEAL]: 'Verde Azulado',
      [ColorScheme.INDIGO]: 'Índigo',
      [ColorScheme.PINK]: 'Rosa'
    };
    return labels[scheme];
  }
}
