import { Component, OnInit, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Widget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'status' | 'alert';
  data: any;
  size: { width: number; height: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
  // 🎯 HOST BINDINGS - Demostración avanzada de binding
  @HostBinding('class.fullscreen') isFullscreen = false;
  @HostBinding('class.dark-theme') isDarkTheme = false;
  @HostBinding('style.--primary-color') primaryColor = '#1e3a8a';

  // 📊 Datos del dashboard
  searchTerm = '';
  selectedTheme = 'light';
  isLoading = false;
  currentTime = new Date();

  // 🎨 Configuración de temas
  themes = [
    { value: 'light', label: '☀️ Claro', colors: { primary: '#1e3a8a', bg: '#ffffff' } },
    { value: 'dark', label: '🌙 Oscuro', colors: { primary: '#3b82f6', bg: '#1f2937' } },
    { value: 'contrast', label: '🔆 Alto Contraste', colors: { primary: '#000000', bg: '#ffffff' } }
  ];

  // 📊 Widgets de ejemplo
  widgets: Widget[] = [
    {
      id: 'widget-1',
      title: 'Proyectos Activos',
      type: 'metric',
      data: { value: 42, trend: 'up', change: '+5%' },
      size: { width: 3, height: 2 }
    },
    {
      id: 'widget-2',
      title: 'Presupuesto Ejecutado',
      type: 'chart',
      data: { percentage: 68.5, total: 150000000, used: 89500000 },
      size: { width: 6, height: 3 }
    },
    {
      id: 'widget-3',
      title: 'Alertas del Sistema',
      type: 'alert',
      data: { critical: 2, warning: 8, info: 15 },
      size: { width: 3, height: 2 }
    },
    {
      id: 'widget-4',
      title: 'Estado de Equipos',
      type: 'status',
      data: { operational: 156, maintenance: 23, repair: 8 },
      size: { width: 4, height: 3 }
    }
  ];

  constructor() {
    console.log('📊 Lab 2 - DashboardComponent inicializado');
  }

  ngOnInit(): void {
    console.log('🎯 Dashboard cargado con', this.widgets.length, 'widgets');
    
    // Actualizar tiempo cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  // 🎧 HOST LISTENERS - Eventos globales
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'f':
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case 'd':
          event.preventDefault();
          this.toggleTheme();
          break;
      }
    }

    if (event.key === 'Escape') {
      this.exitFullscreen();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    console.log('🖥️ Ventana redimensionada:', window.innerWidth + 'x' + window.innerHeight);
  }

  // 🔍 Métodos de búsqueda
  onSearchChange(): void {
    console.log(`🔍 Búsqueda: "${this.searchTerm}"`);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('🔍 Búsqueda ejecutada con Enter');
    }
    
    if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    console.log('🧹 Búsqueda limpiada');
  }

  // 🎛️ Métodos de control
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    console.log(`🖥️ Fullscreen: ${this.isFullscreen ? 'activado' : 'desactivado'}`);
  }

  exitFullscreen(): void {
    if (this.isFullscreen) {
      this.isFullscreen = false;
    }
  }

  toggleTheme(): void {
    const currentIndex = this.themes.findIndex(t => t.value === this.selectedTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.changeTheme(this.themes[nextIndex].value);
  }

  changeTheme(theme: string): void {
    this.selectedTheme = theme;
    const themeConfig = this.themes.find(t => t.value === theme);
    
    if (themeConfig) {
      this.isDarkTheme = theme === 'dark';
      this.primaryColor = themeConfig.colors.primary;
      console.log(`🎨 Tema cambiado a: ${theme}`);
    }
  }

  // 🛒 Métodos de widgets
  onWidgetClick(widget: Widget, event: MouseEvent): void {
    console.log(`🖱️ Widget clickeado: ${widget.title}`);
    event.stopPropagation();
  }

  onWidgetHover(widget: Widget, isEntering: boolean): void {
    console.log(`🖱️ ${isEntering ? 'Mouse enter' : 'Mouse leave'}: ${widget.title}`);
  }

  refreshWidget(widget: Widget): void {
    console.log(`🔄 Refrescando widget: ${widget.title}`);
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      console.log(`✅ Widget ${widget.title} actualizado`);
    }, 1000);
  }

  // 🎨 Métodos de estilo dinámico
  getWidgetClasses(widget: Widget): { [key: string]: boolean } {
    return {
      'widget': true,
      'widget-loading': this.isLoading,
      [`widget-${widget.type}`]: true,
      'widget-compact': widget.size.width <= 3,
      'widget-large': widget.size.width >= 6
    };
  }

  getWidgetStyles(widget: Widget): { [key: string]: string } {
    return {
      'grid-column': `span ${widget.size.width}`,
      'grid-row': `span ${widget.size.height}`,
      'min-height': `${widget.size.height * 100}px`
    };
  }

  getThemeClasses(): { [key: string]: boolean } {
    return {
      'dashboard-container': true,
      'theme-light': this.selectedTheme === 'light',
      'theme-dark': this.selectedTheme === 'dark',
      'theme-contrast': this.selectedTheme === 'contrast',
      'fullscreen-mode': this.isFullscreen
    };
  }

  // 🎯 Métodos de presentación
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  getStatusIcon(status: string): string {
    const icons = {
      'operational': '🟢',
      'maintenance': '🟡',
      'repair': '🔴',
      'critical': '🚨'
    };
    return icons[status as keyof typeof icons] || '❓';
  }

  // 📊 Getters para datos calculados
  get totalProjects(): number {
    return this.widgets.find(w => w.id === 'widget-1')?.data?.value || 0;
  }

  get budgetData(): any {
    return this.widgets.find(w => w.id === 'widget-2')?.data || {};
  }

  get alertsData(): any {
    return this.widgets.find(w => w.id === 'widget-3')?.data || {};
  }

  get equipmentData(): any {
    return this.widgets.find(w => w.id === 'widget-4')?.data || {};
  }
}