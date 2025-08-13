import { Injectable, signal, computed } from '@angular/core';
import { ThemePreset, LayoutConfig, Widget, ComponentVisibility } from '../interfaces/theme.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signals para manejo reactivo de tema
  private currentThemeSignal = signal<ThemePreset>(this.getDefaultTheme());
  private layoutConfigSignal = signal<LayoutConfig>({
    darkMode: false,
    sidebarCollapsed: false,
    animationsEnabled: true,
    compactMode: false,
    showGrid: false,
    autoSave: true
  });

  private customColorsSignal = signal({
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    warning: '#feca57',
    danger: '#ff6b6b',
    success: '#43e97b'
  });

  private visibilitySignal = signal<ComponentVisibility>({
    header: true,
    sidebar: true,
    footer: true,
    breadcrumbs: true,
    notifications: true
  });

  // Computed signals públicos
  currentTheme = computed(() => this.currentThemeSignal());
  layoutConfig = computed(() => this.layoutConfigSignal());
  customColors = computed(() => this.customColorsSignal());
  componentVisibility = computed(() => this.visibilitySignal());

  // CSS Custom Properties computadas
  cssVariables = computed(() => {
    const theme = this.currentThemeSignal();
    const colors = this.customColorsSignal();
    
    return {
      '--theme-primary': theme.primaryColor,
      '--theme-secondary': theme.secondaryColor,
      '--theme-background': theme.backgroundColor,
      '--theme-text': theme.textColor,
      '--theme-border-radius': `${theme.borderRadius}px`,
      '--custom-primary': colors.primary,
      '--custom-secondary': colors.secondary,
      '--custom-accent': colors.accent,
      '--custom-warning': colors.warning,
      '--custom-danger': colors.danger,
      '--custom-success': colors.success
    };
  });

  // Presets de temas disponibles
  private themePresets: ThemePreset[] = [
    {
      id: 'default',
      name: 'Por Defecto',
      description: 'Tema claro y profesional',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      backgroundColor: '#ffffff',
      textColor: '#2c3e50',
      animations: true,
      borderRadius: 8
    },
    {
      id: 'dark',
      name: 'Modo Oscuro',
      description: 'Tema oscuro para reducir fatiga visual',
      primaryColor: '#818cf8',
      secondaryColor: '#c084fc',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      animations: true,
      borderRadius: 12
    },
    {
      id: 'high-contrast',
      name: 'Alto Contraste',
      description: 'Tema de alta accesibilidad',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      animations: false,
      borderRadius: 0
    },
    {
      id: 'colorful',
      name: 'Vibrante',
      description: 'Tema colorido y moderno',
      primaryColor: '#ff6b6b',
      secondaryColor: '#4ecdc4',
      backgroundColor: '#f7f7f7',
      textColor: '#2d3436',
      animations: true,
      borderRadius: 16
    }
  ];

  constructor() {
    console.log('🎨 ThemeService inicializado');
    this.loadThemeFromStorage();
  }

  // Métodos públicos
  getAvailableThemes(): ThemePreset[] {
    return [...this.themePresets];
  }

  setTheme(theme: ThemePreset): void {
    this.currentThemeSignal.set(theme);
    this.updateLayoutForTheme(theme);
    this.saveThemeToStorage();
    this.applyThemeToDocument();
  }

  updateLayoutConfig(config: Partial<LayoutConfig>): void {
    this.layoutConfigSignal.update(current => ({ ...current, ...config }));
    this.saveThemeToStorage();
  }

  updateCustomColors(colors: Partial<typeof this.customColorsSignal>): void {
    this.customColorsSignal.update(current => ({ ...current, ...colors }));
    this.applyThemeToDocument();
  }

  updateComponentVisibility(visibility: Partial<ComponentVisibility>): void {
    this.visibilitySignal.update(current => ({ ...current, ...visibility }));
  }

  toggleDarkMode(): void {
    const currentLayout = this.layoutConfigSignal();
    this.updateLayoutConfig({ darkMode: !currentLayout.darkMode });
    
    // Cambiar automáticamente al tema oscuro o claro
    const targetTheme = !currentLayout.darkMode ? 
      this.themePresets.find(t => t.id === 'dark') :
      this.themePresets.find(t => t.id === 'default');
    
    if (targetTheme) {
      this.setTheme(targetTheme);
    }
  }

  resetToDefault(): void {
    const defaultTheme = this.getDefaultTheme();
    this.setTheme(defaultTheme);
    this.layoutConfigSignal.set({
      darkMode: false,
      sidebarCollapsed: false,
      animationsEnabled: true,
      compactMode: false,
      showGrid: false,
      autoSave: true
    });
  }

  // Métodos privados
  private getDefaultTheme(): ThemePreset {
    return this.themePresets[0];
  }

  private updateLayoutForTheme(theme: ThemePreset): void {
    this.layoutConfigSignal.update(config => ({
      ...config,
      darkMode: theme.id === 'dark',
      animationsEnabled: theme.animations
    }));
  }

  private applyThemeToDocument(): void {
    const variables = this.cssVariables();
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Aplicar clase de tema al body
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${this.currentThemeSignal().id}`);
    
    // Aplicar modo oscuro/claro
    if (this.layoutConfigSignal().darkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  private saveThemeToStorage(): void {
    if (this.layoutConfigSignal().autoSave) {
      try {
        const themeData = {
          theme: this.currentThemeSignal(),
          layout: this.layoutConfigSignal(),
          colors: this.customColorsSignal(),
          visibility: this.visibilitySignal()
        };
        localStorage.setItem('theme-config', JSON.stringify(themeData));
      } catch (error) {
        console.warn('No se pudo guardar la configuración del tema:', error);
      }
    }
  }

  private loadThemeFromStorage(): void {
    try {
      const savedData = localStorage.getItem('theme-config');
      if (savedData) {
        const themeData = JSON.parse(savedData);
        
        if (themeData.theme) {
          this.currentThemeSignal.set(themeData.theme);
        }
        if (themeData.layout) {
          this.layoutConfigSignal.set(themeData.layout);
        }
        if (themeData.colors) {
          this.customColorsSignal.set(themeData.colors);
        }
        if (themeData.visibility) {
          this.visibilitySignal.set(themeData.visibility);
        }
        
        this.applyThemeToDocument();
      }
    } catch (error) {
      console.warn('No se pudo cargar la configuración del tema:', error);
    }
  }
}