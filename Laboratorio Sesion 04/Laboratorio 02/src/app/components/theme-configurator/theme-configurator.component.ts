import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ThemeType, 
  LayoutType, 
  FontFamily, 
  ColorScheme, 
  WidgetConfig,
  ThemeColors 
} from '../../interfaces/theme.interface';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-configurator.component.html',
  styleUrls: ['./theme-configurator.component.scss']
})
export class ThemeConfiguratorComponent {
  // Enums para el template
  readonly ThemeType = ThemeType;
  readonly LayoutType = LayoutType;
  readonly FontFamily = FontFamily;
  readonly ColorScheme = ColorScheme;

  // Signals para el estado local del componente
  readonly activeTab = signal<'presets' | 'colors' | 'typography' | 'spacing' | 'widgets' | 'advanced'>('presets');
  readonly selectedPresetId = signal<string>('');
  readonly showColorPicker = signal<string | null>(null);
  readonly selectedWidget = signal<string | null>(null);
  readonly showWidgetEditor = signal<boolean>(false);

  // Formularios locales con signals
  readonly colorFormData = signal<Partial<ThemeColors>>({});
  readonly typographyFormData = signal({
    fontFamily: FontFamily.INTER,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0
  });
  readonly spacingFormData = signal({
    scale: 1,
    borderRadius: 8,
    containerMaxWidth: 1200,
    gridGap: 24
  });

  constructor(private themeService: ThemeService) {
    // Inicializar formularios con valores actuales
    this.initializeForms();
  }

  // Computed signals para acceder a los datos del servicio
  readonly configuration = this.themeService.configuration;
  readonly currentPreset = this.themeService.currentPreset;
  readonly currentTheme = this.themeService.currentTheme;
  readonly currentLayout = this.themeService.currentLayout;
  readonly computedColors = this.themeService.computedColors;
  readonly computedTypography = this.themeService.computedTypography;
  readonly computedSpacing = this.themeService.computedSpacing;
  readonly activeWidgets = this.themeService.activeWidgets;
  readonly isDirty = this.themeService.isDirty;

  // Computed signals para clases CSS dinámicas usando NgClass
  readonly containerClasses = computed(() => {
    const baseClasses = this.themeService.containerClasses();
    const activeTab = this.activeTab();
    const isDirty = this.isDirty();
    
    return {
      ...baseClasses,
      'configurator-container': true,
      [`tab-${activeTab}`]: true,
      'has-changes': isDirty,
      'show-grid': activeTab === 'widgets'
    };
  });

  // Computed signals para estilos CSS dinámicos usando NgStyle
  readonly containerStyles = computed(() => {
    const baseStyles = this.themeService.containerStyles();
    const layout = this.currentLayout();
    
    // Estilos adicionales basados en el layout
    const layoutStyles: Record<string, any> = {};
    
    switch (layout) {
      case LayoutType.COMPACT:
        layoutStyles['--layout-padding'] = '0.5rem';
        layoutStyles['--layout-gap'] = '0.75rem';
        break;
      case LayoutType.COMFORTABLE:
        layoutStyles['--layout-padding'] = '1rem';
        layoutStyles['--layout-gap'] = '1.5rem';
        break;
      case LayoutType.SPACIOUS:
        layoutStyles['--layout-padding'] = '2rem';
        layoutStyles['--layout-gap'] = '3rem';
        break;
    }

    return {
      ...baseStyles,
      ...layoutStyles
    };
  });

  readonly tabIndicatorStyles = computed(() => {
    const activeTab = this.activeTab();
    const tabs = ['presets', 'colors', 'typography', 'spacing', 'widgets', 'advanced'];
    const index = tabs.indexOf(activeTab);
    
    return {
      transform: `translateX(${index * 100}%)`,
      width: `${100 / tabs.length}%`
    };
  });

  readonly previewWidgetStyles = computed(() => {
    const selectedId = this.selectedWidget();
    if (!selectedId) return {};

    const widget = this.activeWidgets().find(w => w.id === selectedId);
    if (!widget) return {};

    return {
      position: 'absolute',
      left: `${widget.position.x}px`,
      top: `${widget.position.y}px`,
      width: `${widget.position.width}px`,
      height: `${widget.position.height}px`,
      backgroundColor: widget.style.backgroundColor || 'var(--theme-surface)',
      color: widget.style.textColor || 'var(--theme-text)',
      borderRadius: `${widget.style.borderRadius || 8}px`,
      padding: `${widget.style.padding || 16}px`,
      boxShadow: widget.style.boxShadow ? 'var(--theme-shadow)' : 'none',
      border: widget.style.borderWidth ? `${widget.style.borderWidth}px solid ${widget.style.borderColor || 'var(--theme-border)'}` : 'none',
      fontSize: widget.style.fontSize ? `${widget.style.fontSize}px` : 'inherit',
      fontWeight: widget.style.fontWeight || 'inherit',
      textAlign: widget.style.textAlign || 'left',
      cursor: widget.interactions.click ? 'pointer' : 'default',
      opacity: widget.interactions.disabled ? 0.5 : 1,
      transition: 'all 0.2s ease'
    };
  });

  // Métodos para gestión de tabs
  setActiveTab(tab: 'presets' | 'colors' | 'typography' | 'spacing' | 'widgets' | 'advanced'): void {
    this.activeTab.set(tab);
  }

  // Métodos para gestión de presets
  onPresetChange(presetId: string): void {
    this.selectedPresetId.set(presetId);
    this.themeService.applyPreset(presetId);
    this.initializeForms();
  }

  onThemeTypeChange(themeType: ThemeType): void {
    this.themeService.switchTheme(themeType);
  }

  onColorSchemeChange(colorScheme: ColorScheme): void {
    this.themeService.switchColorScheme(colorScheme);
    this.initializeForms();
  }

  onLayoutChange(layout: LayoutType): void {
    this.themeService.setLayout(layout);
  }

  // Métodos para gestión de colores
  onColorChange(colorKey: keyof ThemeColors, value: string): void {
    this.colorFormData.update(current => ({
      ...current,
      [colorKey]: value
    }));
    this.themeService.updateColor(colorKey, value);
  }

  toggleColorPicker(colorKey: string | null): void {
    this.showColorPicker.set(colorKey);
  }

  resetColors(): void {
    this.themeService.resetColors();
    this.initializeColorForm();
  }

  // Métodos para gestión de tipografía
  onFontFamilyChange(fontFamily: FontFamily): void {
    this.typographyFormData.update(current => ({
      ...current,
      fontFamily
    }));
    this.themeService.updateFontFamily(fontFamily);
  }

  onFontSizeChange(fontSize: number): void {
    this.typographyFormData.update(current => ({
      ...current,
      fontSize
    }));
    this.themeService.updateFontSize(fontSize);
  }

  onFontWeightChange(fontWeight: number): void {
    this.typographyFormData.update(current => ({
      ...current,
      fontWeight
    }));
    this.themeService.updateFontWeight(fontWeight);
  }

  onLineHeightChange(lineHeight: number): void {
    this.typographyFormData.update(current => ({
      ...current,
      lineHeight
    }));
    this.themeService.updateTypography({ lineHeight });
  }

  onLetterSpacingChange(letterSpacing: number): void {
    this.typographyFormData.update(current => ({
      ...current,
      letterSpacing
    }));
    this.themeService.updateTypography({ letterSpacing });
  }

  resetTypography(): void {
    this.themeService.resetTypography();
    this.initializeTypographyForm();
  }

  // Métodos para gestión de espaciado
  onSpacingScaleChange(scale: number): void {
    this.spacingFormData.update(current => ({
      ...current,
      scale
    }));
    this.themeService.updateSpacingScale(scale);
  }

  onBorderRadiusChange(borderRadius: number): void {
    this.spacingFormData.update(current => ({
      ...current,
      borderRadius
    }));
    this.themeService.updateBorderRadius(borderRadius);
  }

  onContainerMaxWidthChange(containerMaxWidth: number): void {
    this.spacingFormData.update(current => ({
      ...current,
      containerMaxWidth
    }));
    this.themeService.updateSpacing({ containerMaxWidth });
  }

  onGridGapChange(gridGap: number): void {
    this.spacingFormData.update(current => ({
      ...current,
      gridGap
    }));
    this.themeService.updateSpacing({ gridGap });
  }

  resetSpacing(): void {
    this.themeService.resetSpacing();
    this.initializeSpacingForm();
  }

  // Métodos para gestión de widgets
  selectWidget(widgetId: string): void {
    this.selectedWidget.set(widgetId);
    this.showWidgetEditor.set(true);
  }

  toggleWidget(widgetId: string): void {
    this.themeService.toggleWidget(widgetId);
  }

  deleteWidget(widgetId: string): void {
    this.themeService.removeWidget(widgetId);
    if (this.selectedWidget() === widgetId) {
      this.selectedWidget.set(null);
      this.showWidgetEditor.set(false);
    }
  }

  addNewWidget(): void {
    const newWidget: Omit<WidgetConfig, 'id'> = {
      type: 'card',
      label: 'Nuevo Widget',
      enabled: true,
      size: 'md',
      variant: 'primary',
      position: { x: 50, y: 50, width: 200, height: 100 },
      style: {
        backgroundColor: 'var(--theme-surface)',
        textColor: 'var(--theme-text)',
        borderRadius: 8,
        padding: 16
      },
      content: {
        title: 'Nuevo Widget',
        description: 'Descripción del widget'
      },
      interactions: {
        hover: true,
        click: false,
        focus: false,
        disabled: false
      }
    };

    this.themeService.addWidget(newWidget);
  }

  updateWidgetPosition(widgetId: string, x: number, y: number): void {
    this.themeService.updateWidget(widgetId, {
      position: { ...this.getWidget(widgetId)?.position!, x, y }
    });
  }

  updateWidgetSize(widgetId: string, width: number, height: number): void {
    this.themeService.updateWidget(widgetId, {
      position: { ...this.getWidget(widgetId)?.position!, width, height }
    });
  }

  updateWidgetStyle(widgetId: string, styleUpdates: Partial<WidgetConfig['style']>): void {
    const widget = this.getWidget(widgetId);
    if (widget) {
      this.themeService.updateWidget(widgetId, {
        style: { ...widget.style, ...styleUpdates }
      });
    }
  }

  closeWidgetEditor(): void {
    this.showWidgetEditor.set(false);
    this.selectedWidget.set(null);
  }

  // Métodos para opciones avanzadas
  toggleRTL(): void {
    this.themeService.toggleRTL();
  }

  toggleHighContrast(): void {
    this.themeService.toggleHighContrast();
  }

  toggleAutoSave(): void {
    this.themeService.toggleAutoSave();
  }

  // Métodos para persistencia
  saveConfiguration(): void {
    this.themeService.saveConfiguration();
  }

  resetConfiguration(): void {
    this.themeService.resetConfiguration();
    this.initializeForms();
  }

  exportConfiguration(): void {
    const config = this.themeService.exportConfiguration();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-configuration.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importConfiguration(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (this.themeService.importConfiguration(content)) {
          this.initializeForms();
        } else {
          alert('Error al importar la configuración');
        }
      };
      reader.readAsText(file);
    }
  }

  // Métodos auxiliares
  private initializeForms(): void {
    this.initializeColorForm();
    this.initializeTypographyForm();
    this.initializeSpacingForm();
  }

  private initializeColorForm(): void {
    const colors = this.computedColors();
    this.colorFormData.set({
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      surface: colors.surface,
      text: colors.text,
      textSecondary: colors.textSecondary,
      border: colors.border,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
      info: colors.info
    });
  }

  private initializeTypographyForm(): void {
    const typography = this.computedTypography();
    this.typographyFormData.set({
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing
    });
  }

  private initializeSpacingForm(): void {
    const spacing = this.computedSpacing();
    this.spacingFormData.set({
      scale: spacing.scale,
      borderRadius: spacing.borderRadius,
      containerMaxWidth: spacing.containerMaxWidth,
      gridGap: spacing.gridGap
    });
  }

  private getWidget(widgetId: string): WidgetConfig | undefined {
    return this.activeWidgets().find(w => w.id === widgetId);
  }

  // Métodos para obtener opciones
  getPresetOptions(): Array<{value: string, label: string}> {
    return this.themeService.presets().map(preset => ({
      value: preset.id,
      label: preset.name
    }));
  }

  getThemeOptions(): Array<{value: ThemeType, label: string}> {
    return [
      { value: ThemeType.LIGHT, label: 'Claro' },
      { value: ThemeType.DARK, label: 'Oscuro' },
      { value: ThemeType.CORPORATE, label: 'Corporativo' },
      { value: ThemeType.CREATIVE, label: 'Creativo' },
      { value: ThemeType.MINIMAL, label: 'Minimalista' }
    ];
  }

  getLayoutOptions(): Array<{value: LayoutType, label: string}> {
    return this.themeService.getLayoutOptions();
  }

  getColorSchemeOptions(): Array<{value: ColorScheme, label: string}> {
    return this.themeService.getColorSchemeOptions();
  }

  getFontFamilyOptions(): Array<{value: FontFamily, label: string}> {
    return this.themeService.getFontFamilyOptions();
  }

  // Métodos para validación
  isValidColor(color: string): boolean {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color);
  }

  isValidRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // Métodos para animaciones y efectos visuales
  getTabClasses(tab: string): Record<string, boolean> {
    return {
      'tab-button': true,
      'active': this.activeTab() === tab,
      'has-changes': this.isDirty() && this.activeTab() === tab
    };
  }

  getWidgetClasses(widget: WidgetConfig): Record<string, boolean> {
    return {
      'widget-preview': true,
      [`widget-${widget.type}`]: true,
      [`widget-${widget.size}`]: true,
      [`widget-${widget.variant}`]: true,
      'widget-selected': this.selectedWidget() === widget.id,
      'widget-disabled': widget.interactions.disabled,
      'widget-interactive': widget.interactions.hover || widget.interactions.click
    };
  }
}
