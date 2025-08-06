import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { map, delay, switchMap } from 'rxjs/operators';

import { 
  DashboardWidget, 
  ProjectMetrics, 
  EquipmentStatus, 
  Alert, 
  DashboardConfig,
  DashboardState,
  WidgetEvent,
  UserPreferences
} from '../models/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // State Management
  private dashboardState = new BehaviorSubject<DashboardState>({
    isLoading: false,
    isFullscreen: false,
    isMobile: false,
    isOffline: false,
    selectedWidgets: [],
    searchTerm: '',
    filters: {}
  });

  private widgets = new BehaviorSubject<DashboardWidget[]>([]);
  private events = new BehaviorSubject<WidgetEvent[]>([]);
  private alerts = new BehaviorSubject<Alert[]>([]);

  constructor() {
    console.log('📊 DashboardService inicializado');
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  // Observables públicos
  get state$(): Observable<DashboardState> {
    return this.dashboardState.asObservable();
  }

  get widgets$(): Observable<DashboardWidget[]> {
    return this.widgets.asObservable();
  }

  get events$(): Observable<WidgetEvent[]> {
    return this.events.asObservable();
  }

  get alerts$(): Observable<Alert[]> {
    return this.alerts.asObservable();
  }

  // Gestión de Widgets
  addWidget(widget: Partial<DashboardWidget>): void {
    const newWidget: DashboardWidget = {
      id: this.generateId(),
      title: widget.title || 'Nuevo Widget',
      type: widget.type || 'metric',
      size: widget.size || { width: 4, height: 2 },
      position: widget.position || { x: 0, y: 0 },
      data: widget.data || {},
      config: {
        theme: 'light',
        refreshInterval: 30000,
        autoRefresh: true,
        showHeader: true,
        showFooter: true,
        allowResize: true,
        allowMove: true,
        ...widget.config
      },
      status: 'loading',
      lastUpdate: new Date(),
      isVisible: true,
      permissions: ['read', 'update']
    };

    const currentWidgets = this.widgets.value;
    this.widgets.next([...currentWidgets, newWidget]);
    
    // Simular carga de datos
    setTimeout(() => {
      this.updateWidgetStatus(newWidget.id, 'ready');
    }, 1000);

    console.log(`➕ Widget agregado: ${newWidget.title}`);
  }

  updateWidget(widgetId: string, updates: Partial<DashboardWidget>): void {
    const currentWidgets = this.widgets.value;
    const updatedWidgets = currentWidgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, ...updates, lastUpdate: new Date() }
        : widget
    );
    
    this.widgets.next(updatedWidgets);
    console.log(`🔄 Widget actualizado: ${widgetId}`);
  }

  removeWidget(widgetId: string): void {
    const currentWidgets = this.widgets.value;
    const filteredWidgets = currentWidgets.filter(w => w.id !== widgetId);
    this.widgets.next(filteredWidgets);
    console.log(`🗑️ Widget removido: ${widgetId}`);
  }

  updateWidgetStatus(widgetId: string, status: DashboardWidget['status']): void {
    this.updateWidget(widgetId, { status });
  }

  // Gestión de eventos
  emitWidgetEvent(event: Omit<WidgetEvent, 'timestamp'>): void {
    const newEvent: WidgetEvent = {
      ...event,
      timestamp: new Date()
    };

    const currentEvents = this.events.value;
    this.events.next([newEvent, ...currentEvents.slice(0, 99)]); // Mantener últimos 100 eventos
    
    console.log(`📡 Evento emitido: ${event.type} en ${event.widgetId}`);
  }

  // Gestión de estado
  updateState(updates: Partial<DashboardState>): void {
    const currentState = this.dashboardState.value;
    this.dashboardState.next({ ...currentState, ...updates });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setFullscreen(isFullscreen: boolean): void {
    this.updateState({ isFullscreen });
  }

  setMobileMode(isMobile: boolean): void {
    this.updateState({ isMobile });
  }

  setSearchTerm(searchTerm: string): void {
    this.updateState({ searchTerm });
  }

  // Datos de PROVIAS
  getProjectMetrics(): Observable<ProjectMetrics[]> {
    return of(this.mockProjectMetrics).pipe(delay(500));
  }

  getEquipmentStatus(): Observable<EquipmentStatus[]> {
    return of(this.mockEquipmentStatus).pipe(delay(300));
  }

  getActiveAlerts(): Observable<Alert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => !alert.acknowledged))
    );
  }

  acknowledgeAlert(alertId: string): void {
    const currentAlerts = this.alerts.value;
    const updatedAlerts = currentAlerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    this.alerts.next(updatedAlerts);
    console.log(`✅ Alerta reconocida: ${alertId}`);
  }

  // Configuración
  saveConfiguration(config: DashboardConfig): Observable<boolean> {
    return of(true).pipe(
      delay(1000),
      map(() => {
        console.log('💾 Configuración guardada');
        return true;
      })
    );
  }

  loadUserPreferences(userId: string): Observable<UserPreferences> {
    return of(this.mockUserPreferences).pipe(delay(300));
  }

  // Inicialización de datos mock
  private initializeMockData(): void {
    const mockWidgets: DashboardWidget[] = [
      {
        id: 'widget-1',
        title: 'Proyectos Activos',
        type: 'metric',
        size: { width: 3, height: 2 },
        position: { x: 0, y: 0 },
        data: { value: 42, trend: 'up', change: '+5%' },
        config: {
          theme: 'light',
          refreshInterval: 30000,
          autoRefresh: true,
          showHeader: true,
          showFooter: true,
          allowResize: true,
          allowMove: true
        },
        status: 'ready',
        lastUpdate: new Date(),
        isVisible: true,
        permissions: ['read', 'update']
      },
      {
        id: 'widget-2',
        title: 'Presupuesto Ejecutado',
        type: 'progress',
        size: { width: 6, height: 3 },
        position: { x: 3, y: 0 },
        data: { 
          total: 150000000, 
          used: 89500000, 
          percentage: 59.7,
          status: 'on-track'
        },
        config: {
          theme: 'light',
          refreshInterval: 60000,
          autoRefresh: true,
          showHeader: true,
          showFooter: true,
          allowResize: true,
          allowMove: true
        },
        status: 'ready',
        lastUpdate: new Date(),
        isVisible: true,
        permissions: ['read']
      },
      {
        id: 'widget-3',
        title: 'Alertas Críticas',
        type: 'alert',
        size: { width: 3, height: 2 },
        position: { x: 9, y: 0 },
        data: { 
          critical: 2, 
          warning: 8, 
          info: 15,
          trend: 'stable'
        },
        config: {
          theme: 'light',
          refreshInterval: 10000,
          autoRefresh: true,
          showHeader: true,
          showFooter: true,
          allowResize: true,
          allowMove: true
        },
        status: 'ready',
        lastUpdate: new Date(),
        isVisible: true,
        permissions: ['read', 'update']
      },
      {
        id: 'widget-4',
        title: 'Equipos en Operación',
        type: 'status',
        size: { width: 4, height: 3 },
        position: { x: 0, y: 2 },
        data: {
          operational: 156,
          maintenance: 23,
          repair: 8,
          idle: 12,
          total: 199
        },
        config: {
          theme: 'light',
          refreshInterval: 45000,
          autoRefresh: true,
          showHeader: true,
          showFooter: true,
          allowResize: true,
          allowMove: true
        },
        status: 'ready',
        lastUpdate: new Date(),
        isVisible: true,
        permissions: ['read', 'update']
      },
      {
        id: 'widget-5',
        title: 'Avance de Obras por Región',
        type: 'chart',
        size: { width: 8, height: 4 },
        position: { x: 4, y: 3 },
        data: {
          regions: ['Lima', 'Arequipa', 'Cusco', 'Piura', 'Trujillo'],
          progress: [85, 72, 68, 91, 79],
          budget: [45000000, 28000000, 35000000, 22000000, 31000000]
        },
        config: {
          theme: 'light',
          refreshInterval: 120000,
          autoRefresh: true,
          showHeader: true,
          showFooter: true,
          allowResize: true,
          allowMove: true
        },
        status: 'ready',
        lastUpdate: new Date(),
        isVisible: true,
        permissions: ['read']
      }
    ];

    this.widgets.next(mockWidgets);
    this.alerts.next(this.mockAlerts);
  }

  private startRealTimeUpdates(): void {
    // Simular actualizaciones en tiempo real cada 30 segundos
    interval(30000).subscribe(() => {
      this.updateRandomMetrics();
      this.generateRandomAlert();
    });
  }

  private updateRandomMetrics(): void {
    const currentWidgets = this.widgets.value;
    const metricWidgets = currentWidgets.filter(w => w.type === 'metric');
    
    if (metricWidgets.length > 0) {
      const randomWidget = metricWidgets[Math.floor(Math.random() * metricWidgets.length)];
      const currentValue = randomWidget.data.value || 0;
      const change = Math.floor(Math.random() * 10) - 5; // -5 a +5
      const newValue = Math.max(0, currentValue + change);
      
      this.updateWidget(randomWidget.id, {
        data: {
          ...randomWidget.data,
          value: newValue,
          change: change > 0 ? `+${change}` : `${change}`
        }
      });
    }
  }

  private generateRandomAlert(): void {
    if (Math.random() < 0.3) { // 30% probabilidad
      const alertTypes = ['maintenance', 'safety', 'budget', 'schedule'];
      const severities = ['warning', 'error'];
      
      const newAlert: Alert = {
        id: this.generateId(),
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        message: this.generateRandomAlertMessage(),
        timestamp: new Date(),
        acknowledged: false,
        source: 'Sistema Automático'
      };

      const currentAlerts = this.alerts.value;
      this.alerts.next([newAlert, ...currentAlerts]);
    }
  }

  private generateRandomAlertMessage(): string {
    const messages = [
      'Mantenimiento preventivo requerido en excavadora CAT-001',
      'Retraso en entrega de materiales para Proyecto Norte',
      'Presupuesto excedido en 15% para obra Trujillo-Chiclayo',
      'Condiciones climáticas adversas en zona de trabajo',
      'Equipo de seguridad requiere calibración urgente'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Datos mock
  private mockProjectMetrics: ProjectMetrics[] = [
    {
      id: 'proj-001',
      name: 'Carretera Longitudinal Sierra Norte',
      progress: 68.5,
      budget: 85000000,
      budgetUsed: 52000000,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2025-11-30'),
      status: 'in-progress',
      priority: 'high',
      manager: 'Ing. Carlos Mendoza',
      location: {
        region: 'La Libertad',
        province: 'Trujillo',
        district: 'Víctor Larco',
        coordinates: { lat: -8.1116, lng: -79.0287 }
      },
      risks: 'medium'
    },
    {
      id: 'proj-002',
      name: 'Puente Intercontinental Amazonas',
      progress: 92.3,
      budget: 120000000,
      budgetUsed: 115000000,
      startDate: new Date('2023-01-10'),
      endDate: new Date('2025-06-15'),
      status: 'in-progress',
      priority: 'critical',
      manager: 'Ing. María Torres',
      location: {
        region: 'Loreto',
        province: 'Maynas',
        district: 'Iquitos',
        coordinates: { lat: -3.7437, lng: -73.2516 }
      },
      risks: 'high'
    }
  ];

  private mockEquipmentStatus: EquipmentStatus[] = [
    {
      id: 'eq-001',
      name: 'Excavadora Caterpillar 320D',
      type: 'Excavadora',
      status: 'operational',
      location: 'Proyecto Norte - KM 45',
      operator: 'Juan Pérez',
      lastMaintenance: new Date('2025-07-15'),
      nextMaintenance: new Date('2025-09-15'),
      hoursWorked: 1250,
      efficiency: 94.5,
      alerts: []
    },
    {
      id: 'eq-002',
      name: 'Compactadora Vibrátoria CP533E',
      type: 'Compactadora',
      status: 'maintenance',
      location: 'Taller Central',
      operator: 'Carlos López',
      lastMaintenance: new Date('2025-08-01'),
      nextMaintenance: new Date('2025-10-01'),
      hoursWorked: 890,
      efficiency: 87.2,
      alerts: [
        {
          id: 'alert-eq-002-01',
          type: 'maintenance',
          severity: 'warning',
          message: 'Mantenimiento programado en progreso',
          timestamp: new Date(),
          acknowledged: false,
          source: 'Sistema de Mantenimiento'
        }
      ]
    }
  ];

  private mockAlerts: Alert[] = [
    {
      id: 'alert-001',
      type: 'budget',
      severity: 'warning',
      message: 'Presupuesto del Proyecto Norte alcanzó el 80% de ejecución',
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      acknowledged: false,
      source: 'Sistema Financiero'
    },
    {
      id: 'alert-002',
      type: 'safety',
      severity: 'error',
      message: 'Incidente menor reportado en KM 67 - Carretera Sur',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      acknowledged: false,
      source: 'Supervisor de Seguridad'
    }
  ];

  private mockUserPreferences: UserPreferences = {
    userId: 'user-001',
    dashboardLayout: [],
    theme: {
      name: 'PROVIAS Corporate',
      primaryColor: '#1e3a8a',
      secondaryColor: '#fbbf24',
      backgroundColor: '#f9fafb',
      textColor: '#374151',
      borderColor: '#e5e7eb',
      isDark: false
    },
    language: 'es',
    notifications: {
      enabled: true,
      types: ['safety', 'budget', 'schedule'],
      frequency: 'realtime',
      sound: true,
      email: false
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      screenReader: false,
      keyboardNavigation: true
    }
  };
}