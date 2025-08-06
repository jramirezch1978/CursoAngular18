import { Component, OnInit, OnDestroy, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  DashboardWidget, 
  DashboardState, 
  WidgetEvent,
  Alert,
  ProjectMetrics,
  EquipmentStatus,
  DashboardTheme
} from '../../models/dashboard.interface';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // 🎯 HOST BINDINGS - Demostración avanzada de binding
  @HostBinding('class.fullscreen') get isFullscreenClass() {
    return this.state?.isFullscreen || false;
  }
  
  @HostBinding('class.mobile') get isMobileClass() {
    return this.state?.isMobile || false;
  }
  
  @HostBinding('class.dark-theme') get isDarkThemeClass() {
    return this.currentTheme === 'dark';
  }
  
  @HostBinding('style.--primary-color') get primaryColorStyle() {
    return this.themeColors.primary;
  }
  
  @HostBinding('style.--secondary-color') get secondaryColorStyle() {
    return this.themeColors.secondary;
  }

  // 📊 Observables
  widgets$: Observable<DashboardWidget[]>;
  state$: Observable<DashboardState>;
  events$: Observable<WidgetEvent[]>;
  alerts$: Observable<Alert[]>;

  // 🎮 Estado local del componente
  state: DashboardState | null = null;
  searchTerm = '';
  selectedWidgetId = '';
  isConfigPanelOpen = false;
  currentTheme: 'light' | 'dark' | 'high-contrast' = 'light';
  
  // 🎨 Configuración de vista
  gridSize = 12;
  rowHeight = 100;
  widgetSpacing = 16;
  
  // 🎭 Configuración de temas
  themeColors = {
    primary: '#1e3a8a',
    secondary: '#fbbf24',
    accent: '#10b981',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#374151'
  };

  // 🔧 Configuración de widgets
  availableWidgetTypes = [
    { type: 'metric', label: 'Métrica', icon: '📊' },
    { type: 'chart', label: 'Gráfico', icon: '📈' },
    { type: 'progress', label: 'Progreso', icon: '⏳' },
    { type: 'status', label: 'Estado', icon: '🟢' },
    { type: 'alert', label: 'Alertas', icon: '🚨' },
    { type: 'map', label: 'Mapa', icon: '🗺️' },
    { type: 'table', label: 'Tabla', icon: '📋' }
  ];

  // 🎪 Gestión de eventos
  private destroy$ = new Subject<void>();
  
  // 🎛️ Control de drag & drop
  isDragging = false;
  draggedWidget: DashboardWidget | null = null;
  dropZoneActive = false;

  constructor(private dashboardService: DashboardService) {
    // Inicializar observables
    this.widgets$ = this.dashboardService.widgets$;
    this.state$ = this.dashboardService.state$;
    this.events$ = this.dashboardService.events$;
    this.alerts$ = this.dashboardService.alerts$;
  }

  ngOnInit(): void {
    console.log('📊 Dashboard Component inicializado');
    
    // Suscribirse al estado
    this.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.state = state;
      this.searchTerm = state.searchTerm;
    });

    // Detectar tamaño de pantalla inicial
    this.checkScreenSize();
    
    // Simular carga inicial
    this.dashboardService.setLoading(true);
    setTimeout(() => {
      this.dashboardService.setLoading(false);
    }, 1500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🎧 HOST LISTENERS - Eventos globales
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    console.log('🖥️ Ventana redimensionada');
    this.checkScreenSize();
    this.adjustWidgetSizes();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Atajos de teclado
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
        case 'r':
          event.preventDefault();
          this.refreshAllWidgets();
          break;
      }
    }

    // Navegación con teclado
    switch (event.key) {
      case 'Escape':
        this.exitFullscreen();
        this.closeConfigPanel();
        break;
      case 'Tab':
        this.handleTabNavigation(event);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Cerrar paneles al hacer click fuera
    const target = event.target as HTMLElement;
    if (!target.closest('.config-panel') && !target.closest('.config-trigger')) {
      this.closeConfigPanel();
    }
  }

  // 🔍 Métodos de búsqueda y filtrado
  onSearchChange(): void {
    console.log(`🔍 Búsqueda actualizada: "${this.searchTerm}"`);
    this.dashboardService.setSearchTerm(this.searchTerm);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      console.log('🔍 Búsqueda ejecutada con Enter');
      this.focusFirstWidget();
    }
    
    if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
    console.log('🧹 Búsqueda limpiada');
  }

  // 🎛️ Métodos de widget
  onWidgetClick(widget: DashboardWidget, event: MouseEvent): void {
    console.log(`🖱️ Widget clickeado: ${widget.title}`);
    
    // Prevenir propagación si es necesario
    if (event.ctrlKey) {
      event.stopPropagation();
      this.selectWidget(widget.id);
    } else {
      this.focusWidget(widget.id);
    }

    // Emitir evento
    this.dashboardService.emitWidgetEvent({
      type: 'click',
      widgetId: widget.id,
      payload: { x: event.clientX, y: event.clientY }
    });
  }

  onWidgetDoubleClick(widget: DashboardWidget): void {
    console.log(`⚡ Widget doble-click: ${widget.title}`);
    this.openWidgetConfig(widget.id);
  }

  onWidgetMouseEnter(widget: DashboardWidget): void {
    console.log(`🖱️ Mouse enter: ${widget.title}`);
    this.dashboardService.emitWidgetEvent({
      type: 'hover',
      widgetId: widget.id,
      payload: { action: 'enter' }
    });
  }

  onWidgetMouseLeave(widget: DashboardWidget): void {
    console.log(`🖱️ Mouse leave: ${widget.title}`);
    this.dashboardService.emitWidgetEvent({
      type: 'hover',
      widgetId: widget.id,
      payload: { action: 'leave' }
    });
  }

  onWidgetFocus(widget: DashboardWidget): void {
    console.log(`🎯 Widget enfocado: ${widget.title}`);
    this.selectedWidgetId = widget.id;
  }

  onWidgetKeydown(widget: DashboardWidget, event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.openWidgetConfig(widget.id);
        break;
      case 'Delete':
        event.preventDefault();
        this.removeWidget(widget.id);
        break;
    }
  }

  // 🎨 Métodos de estilo dinámico
  getWidgetClasses(widget: DashboardWidget): { [key: string]: boolean } {
    return {
      'widget': true,
      'widget-selected': this.selectedWidgetId === widget.id,
      'widget-loading': widget.status === 'loading',
      'widget-error': widget.status === 'error',
      'widget-offline': widget.status === 'offline',
      'widget-updating': widget.status === 'updating',
      [`widget-${widget.type}`]: true,
      [`widget-${widget.config.theme}`]: true,
      'widget-dragging': this.isDragging && this.draggedWidget?.id === widget.id,
      'widget-compact': widget.size.width <= 3,
      'widget-large': widget.size.width >= 8,
      'widget-featured': widget.id === 'widget-1', // Widget destacado
      'widget-resizable': widget.config.allowResize,
      'widget-movable': widget.config.allowMove
    };
  }

  getWidgetStyles(widget: DashboardWidget): { [key: string]: string } {
    const baseStyles = {
      'grid-column': `span ${widget.size.width}`,
      'grid-row': `span ${widget.size.height}`,
      'min-height': `${widget.size.height * this.rowHeight}px`,
      'order': widget.position.zIndex?.toString() || '0'
    };

    // Estilos adicionales basados en configuración
    const configStyles: { [key: string]: string } = {};
    
    if (widget.config.customStyles) {
      Object.assign(configStyles, widget.config.customStyles);
    }

    // Estilos dinámicos basados en datos
    const dataStyles: { [key: string]: string } = {};
    
    if (widget.type === 'progress' && widget.data.percentage) {
      const percentage = widget.data.percentage;
      if (percentage >= 90) {
        dataStyles['border-left'] = '4px solid var(--color-success)';
      } else if (percentage >= 70) {
        dataStyles['border-left'] = '4px solid var(--color-warning)';
      } else {
        dataStyles['border-left'] = '4px solid var(--color-info)';
      }
    }

    if (widget.type === 'alert' && widget.data.critical > 0) {
      dataStyles['animation'] = 'pulse-alert 2s infinite';
    }

    return { ...baseStyles, ...configStyles, ...dataStyles };
  }

  getGridClasses(): { [key: string]: boolean } {
    return {
      'dashboard-grid': true,
      'grid-compact': this.state?.isMobile || false,
      'grid-fullscreen': this.state?.isFullscreen || false,
      'grid-dragging': this.isDragging,
      [`theme-${this.currentTheme}`]: true
    };
  }

  getGridStyles(): { [key: string]: string } {
    const cols = this.state?.isMobile ? 2 : this.gridSize;
    
    return {
      'grid-template-columns': `repeat(${cols}, 1fr)`,
      'gap': `${this.widgetSpacing}px`,
      'padding': this.state?.isFullscreen ? '0' : '2rem'
    };
  }

  // 🎮 Métodos de control
  toggleFullscreen(): void {
    const newState = !this.state?.isFullscreen;
    this.dashboardService.setFullscreen(newState);
    console.log(`🖥️ Fullscreen: ${newState ? 'activado' : 'desactivado'}`);
  }

  exitFullscreen(): void {
    if (this.state?.isFullscreen) {
      this.dashboardService.setFullscreen(false);
    }
  }

  toggleTheme(): void {
    const themes: typeof this.currentTheme[] = ['light', 'dark', 'high-contrast'];
    const currentIndex = themes.indexOf(this.currentTheme);
    this.currentTheme = themes[(currentIndex + 1) % themes.length];
    
    this.updateThemeColors();
    console.log(`🎨 Tema cambiado a: ${this.currentTheme}`);
  }

  // 🔧 Métodos de configuración
  openConfigPanel(): void {
    this.isConfigPanelOpen = true;
    console.log('⚙️ Panel de configuración abierto');
  }

  closeConfigPanel(): void {
    this.isConfigPanelOpen = false;
    console.log('⚙️ Panel de configuración cerrado');
  }

  openWidgetConfig(widgetId: string): void {
    console.log(`🔧 Configuración de widget: ${widgetId}`);
    this.selectedWidgetId = widgetId;
    this.openConfigPanel();
  }

  // ➕ Métodos de gestión de widgets
  addWidget(type: DashboardWidget['type']): void {
    const newWidget = {
      title: `Nuevo ${this.getWidgetTypeLabel(type)}`,
      type,
      size: { width: 4, height: 2 },
      position: { x: 0, y: 0 },
      data: this.getDefaultWidgetData(type)
    };

    this.dashboardService.addWidget(newWidget);
    console.log(`➕ Widget agregado: ${type}`);
  }

  removeWidget(widgetId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este widget?')) {
      this.dashboardService.removeWidget(widgetId);
      console.log(`🗑️ Widget eliminado: ${widgetId}`);
    }
  }

  refreshWidget(widgetId: string): void {
    this.dashboardService.updateWidgetStatus(widgetId, 'updating');
    
    setTimeout(() => {
      this.dashboardService.updateWidgetStatus(widgetId, 'ready');
      console.log(`🔄 Widget actualizado: ${widgetId}`);
    }, 1000);
  }

  refreshAllWidgets(): void {
    console.log('🔄 Actualizando todos los widgets...');
    this.dashboardService.setLoading(true);
    
    setTimeout(() => {
      this.dashboardService.setLoading(false);
      console.log('✅ Todos los widgets actualizados');
    }, 2000);
  }

  // 🎯 Métodos auxiliares
  private checkScreenSize(): void {
    const isMobile = window.innerWidth < 768;
    this.dashboardService.setMobileMode(isMobile);
  }

  private adjustWidgetSizes(): void {
    if (this.state?.isMobile) {
      // Ajustar widgets para móvil
      console.log('📱 Ajustando widgets para móvil');
    }
  }

  private focusWidget(widgetId: string): void {
    const element = document.querySelector(`[data-widget-id="${widgetId}"]`) as HTMLElement;
    element?.focus();
  }

  private focusFirstWidget(): void {
    const firstWidget = document.querySelector('.widget') as HTMLElement;
    firstWidget?.focus();
  }

  private selectWidget(widgetId: string): void {
    this.selectedWidgetId = this.selectedWidgetId === widgetId ? '' : widgetId;
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    // Implementar navegación personalizada con Tab
    console.log('⌨️ Navegación con Tab');
  }

  private updateThemeColors(): void {
    switch (this.currentTheme) {
      case 'dark':
        this.themeColors = {
          primary: '#3b82f6',
          secondary: '#fbbf24',
          accent: '#10b981',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb'
        };
        break;
      case 'high-contrast':
        this.themeColors = {
          primary: '#000000',
          secondary: '#ffff00',
          accent: '#00ff00',
          background: '#ffffff',
          surface: '#f0f0f0',
          text: '#000000'
        };
        break;
      default: // light
        this.themeColors = {
          primary: '#1e3a8a',
          secondary: '#fbbf24',
          accent: '#10b981',
          background: '#f9fafb',
          surface: '#ffffff',
          text: '#374151'
        };
    }
  }

  private getWidgetTypeLabel(type: DashboardWidget['type']): string {
    const typeMap = {
      'metric': 'Métrica',
      'chart': 'Gráfico',
      'progress': 'Progreso',
      'status': 'Estado',
      'alert': 'Alerta',
      'map': 'Mapa',
      'table': 'Tabla',
      'calendar': 'Calendario'
    };
    return typeMap[type] || 'Widget';
  }

  private getDefaultWidgetData(type: DashboardWidget['type']): any {
    switch (type) {
      case 'metric':
        return { value: 0, trend: 'stable', change: '0%' };
      case 'progress':
        return { percentage: 0, total: 100, current: 0 };
      case 'status':
        return { status: 'normal', count: 0 };
      case 'alert':
        return { critical: 0, warning: 0, info: 0 };
      default:
        return {};
    }
  }

  // 📊 Métodos para datos específicos de PROVIAS
  getProjectStatusColor(status: string): string {
    const colors = {
      'planning': '#6b7280',
      'in-progress': '#3b82f6',
      'on-hold': '#f59e0b',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'delayed': '#f97316'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  getEquipmentStatusIcon(status: string): string {
    const icons = {
      'operational': '🟢',
      'maintenance': '🟡',
      'repair': '🔴',
      'idle': '⚪',
      'critical': '🚨'
    };
    return icons[status as keyof typeof icons] || '❓';
  }

  getAlertSeverityClass(severity: string): string {
    return `alert-${severity}`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }
}