import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { ThemePreset, LayoutConfig } from '../../../interfaces/theme.interface';

interface WidgetConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  order: number;
  content: string;
  customStyles: { [key: string]: string };
}

@Component({
  selector: 'app-theme-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-configurator.component.html',
  styleUrl: './theme-configurator.component.scss'
})
export class ThemeConfiguratorComponent implements OnInit {
  // Signals para configuración reactiva
  selectedTheme!: any;
  layoutConfig!: any;
  customColors!: any;
  
  typographyConfig = signal({
    fontSize: 16,
    fontFamily: 'Inter',
    lineHeight: 1.6,
    letterSpacing: 0,
    textTransform: 'none' as 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  });
  
  spacingConfig = signal({
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 16
  });
  
  widgets = signal<WidgetConfig[]>([
    {
      id: 'widget-1',
      title: 'Estadísticas',
      icon: '📊',
      color: '#667eea',
      size: 'medium',
      visible: true,
      order: 1,
      content: 'Datos en tiempo real del sistema',
      customStyles: {}
    },
    {
      id: 'widget-2',
      title: 'Notificaciones',
      icon: '🔔',
      color: '#f093fb',
      size: 'small',
      visible: true,
      order: 2,
      content: '5 nuevas notificaciones',
      customStyles: {}
    },
    {
      id: 'widget-3',
      title: 'Calendario',
      icon: '📅',
      color: '#43e97b',
      size: 'large',
      visible: true,
      order: 3,
      content: 'Próximos eventos y fechas importantes',
      customStyles: {}
    }
  ]);
  
  // Computed signals para clases y estilos dinámicos
  containerClasses = computed(() => {
    const layout = this.layoutConfig();
    return {
      'dark-theme': layout.darkMode,
      'light-theme': !layout.darkMode,
      'compact-mode': layout.compactMode,
      'animations-enabled': layout.animationsEnabled,
      'sidebar-collapsed': layout.sidebarCollapsed,
      'show-grid': layout.showGrid
    };
  });
  
  containerStyles = computed(() => {
    const theme = this.selectedTheme();
    const spacing = this.spacingConfig();
    const typography = this.typographyConfig();
    const colors = this.customColors();
    
    return {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
      '--border-radius': `${theme.borderRadius}px`,
      '--font-size': `${typography.fontSize}px`,
      '--spacing': `${spacing.padding}px`,
      '--gap': `${spacing.gap}px`,
      '--custom-primary': colors.primary,
      '--custom-secondary': colors.secondary,
      '--custom-accent': colors.accent,
      'font-family': typography.fontFamily,
      'line-height': typography.lineHeight.toString(),
      'letter-spacing': `${typography.letterSpacing}px`
    };
  });
  
  // Presets de temas disponibles
  themePresets: ThemePreset[] = [];
  
  // Fuentes disponibles
  availableFonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Playfair Display'
  ];
  
  // Estado de vista previa
  previewMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  showGrid = signal(false);
  showCode = signal(false);
  activePanel = signal<'themes' | 'colors' | 'layout' | 'typography' | 'widgets'>('themes');
  
  // Propiedades para el template
  Object = Object;

  constructor(private themeService: ThemeService) {
    // Inicializar signals del servicio
    this.selectedTheme = this.themeService.currentTheme;
    this.layoutConfig = this.themeService.layoutConfig;
    this.customColors = this.themeService.customColors;
    this.themePresets = this.themeService.getAvailableThemes();
  }

  ngOnInit(): void {
    console.log('🎨 LAB 2: Theme Configurator inicializado');
  }
  
  // Métodos para manejo de temas
  selectPreset(preset: ThemePreset): void {
    this.themeService.setTheme(preset);
  }
  
  updateCustomColor(colorKey: string, value: string): void {
    this.themeService.updateCustomColors({
      [colorKey]: value
    });
  }
  
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
  
  toggleCompactMode(): void {
    const current = this.layoutConfig();
    this.themeService.updateLayoutConfig({
      compactMode: !current.compactMode
    });
  }
  
  toggleAnimations(): void {
    const current = this.layoutConfig();
    this.themeService.updateLayoutConfig({
      animationsEnabled: !current.animationsEnabled
    });
  }

  toggleSidebar(): void {
    const current = this.layoutConfig();
    this.themeService.updateLayoutConfig({
      sidebarCollapsed: !current.sidebarCollapsed
    });
  }

  toggleGrid(): void {
    const current = this.layoutConfig();
    this.themeService.updateLayoutConfig({
      showGrid: !current.showGrid
    });
    this.showGrid.set(!current.showGrid);
  }
  
  // Métodos para widgets
  addWidget(): void {
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      title: 'Nuevo Widget',
      icon: '📦',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      size: 'medium',
      visible: true,
      order: this.widgets().length + 1,
      content: 'Contenido del widget',
      customStyles: {}
    };
    this.widgets.update(widgets => [...widgets, newWidget]);
  }
  
  removeWidget(widgetId: string): void {
    this.widgets.update(widgets => 
      widgets.filter(w => w.id !== widgetId)
    );
  }
  
  updateWidget(widgetId: string, updates: Partial<WidgetConfig>): void {
    this.widgets.update(widgets =>
      widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w)
    );
  }
  
  getWidgetClasses(widget: WidgetConfig): { [key: string]: boolean } {
    return {
      'widget': true,
      'widget-small': widget.size === 'small',
      'widget-medium': widget.size === 'medium',
      'widget-large': widget.size === 'large',
      'widget-visible': widget.visible,
      'widget-hidden': !widget.visible,
      'widget-animated': this.layoutConfig().animationsEnabled
    };
  }

  getWidgetStyles(widget: WidgetConfig): { [key: string]: string } {
    return {
      '--widget-color': widget.color,
      'order': widget.order.toString(),
      ...widget.customStyles
    };
  }

  // Métodos de tipografía
  updateTypography(property: string, value: any): void {
    this.typographyConfig.update(config => ({
      ...config,
      [property]: value
    }));
  }

  // Métodos de espaciado
  updateSpacing(property: string, value: number): void {
    this.spacingConfig.update(config => ({
      ...config,
      [property]: value
    }));
  }

  // Métodos de vista previa
  setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile'): void {
    this.previewMode.set(mode);
  }

  setActivePanel(panel: 'themes' | 'colors' | 'layout' | 'typography' | 'widgets'): void {
    this.activePanel.set(panel);
  }

  // Métodos utilitarios
  exportConfiguration(): void {
    const config = {
      theme: this.selectedTheme(),
      layout: this.layoutConfig(),
      colors: this.customColors(),
      typography: this.typographyConfig(),
      spacing: this.spacingConfig(),
      widgets: this.widgets()
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'theme-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  resetToDefault(): void {
    this.themeService.resetToDefault();
    this.typographyConfig.set({
      fontSize: 16,
      fontFamily: 'Inter',
      lineHeight: 1.6,
      letterSpacing: 0,
      textTransform: 'none'
    });
    this.spacingConfig.set({
      padding: 16,
      margin: 16,
      borderRadius: 8,
      gap: 16
    });
  }

  // Event handlers para inputs
  onColorChange(colorKey: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateCustomColor(colorKey, target.value);
  }

  onFontSizeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateTypography('fontSize', parseInt(target.value));
  }

  onFontFamilyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateTypography('fontFamily', target.value);
  }

  onSpacingChange(property: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSpacing(property, parseInt(target.value));
  }

  onWidgetTitleChange(widgetId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateWidget(widgetId, { title: target.value });
  }

  onWidgetSizeChange(widgetId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateWidget(widgetId, { size: target.value as 'small' | 'medium' | 'large' });
  }

  onWidgetColorChange(widgetId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateWidget(widgetId, { color: target.value });
  }

  onWidgetVisibilityChange(widgetId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateWidget(widgetId, { visible: target.checked });
  }
}