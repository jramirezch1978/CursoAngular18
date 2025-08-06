import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, interval, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, startWith, catchError, shareReplay, switchMap } from 'rxjs/operators';

import { 
  Task, 
  TaskFilters, 
  TaskStatistics, 
  TaskManagerState,
  TaskActivity,
  TaskNotification,
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskViewConfig
} from '../models/task.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  
  // 🎯 Estado central de la aplicación
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private filtersSubject = new BehaviorSubject<TaskFilters>({
    search: '',
    type: undefined,
    priority: undefined,
    status: undefined,
    assignee: undefined,
    region: undefined
  });
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private viewConfigSubject = new BehaviorSubject<TaskViewConfig>({
    itemsPerPage: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    viewMode: 'list',
    showCompletedTasks: true,
    compactMode: false
  });

  // 📊 Observables públicos
  public tasks$ = this.tasksSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public viewConfig$ = this.viewConfigSubject.asObservable();

  // 🔍 Tareas filtradas (programación reactiva)
  public filteredTasks$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.filters$,
    this.viewConfig$
  ]).pipe(
    map(([tasks, filters, config]) => this.applyFiltersAndSort(tasks, filters, config)),
    shareReplay(1)
  );

  // 📊 Estadísticas calculadas reactivamente
  public statistics$: Observable<TaskStatistics> = this.filteredTasks$.pipe(
    map(tasks => this.calculateStatistics(tasks)),
    shareReplay(1)
  );

  // 🎯 Estado del manager
  public state$: Observable<TaskManagerState> = combineLatest([
    this.loading$,
    this.error$,
    this.filters$,
    this.viewConfig$
  ]).pipe(
    map(([isLoading, error, activeFilters, viewConfig]) => ({
      isLoading,
      error,
      lastUpdated: new Date(),
      selectedTasks: [],
      activeFilters,
      viewConfig
    }))
  );

  constructor() {
    console.log('📋 TaskService inicializado');
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  // 🔍 Métodos de filtrado
  updateSearch(searchTerm: string): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, search: searchTerm });
    console.log(`🔍 Búsqueda actualizada: "${searchTerm}"`);
  }

  updateFilters(filters: Partial<TaskFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
    console.log('🎛️ Filtros actualizados:', filters);
  }

  clearFilters(): void {
    this.filtersSubject.next({
      search: '',
      type: undefined,
      priority: undefined,
      status: undefined,
      assignee: undefined,
      region: undefined
    });
    console.log('🧹 Filtros limpiados');
  }

  // 📊 Métodos de vista
  updateViewConfig(config: Partial<TaskViewConfig>): void {
    const currentConfig = this.viewConfigSubject.value;
    this.viewConfigSubject.next({ ...currentConfig, ...config });
    console.log('👁️ Configuración de vista actualizada:', config);
  }

  // 📝 CRUD Operations
  addTask(taskData: Partial<Task>): Observable<Task> {
    this.setLoading(true);
    
    const newTask: Task = {
      id: Date.now(),
      title: taskData.title || 'Nueva Tarea',
      description: taskData.description || '',
      type: taskData.type || 'construccion',
      priority: taskData.priority || 'media',
      status: 'pendiente',
      progress: 0,
      budget: taskData.budget || 0,
      budgetUsed: 0,
      createdAt: new Date(),
      dueDate: taskData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      assignee: taskData.assignee || this.getDefaultAssignee(),
      location: taskData.location || this.getDefaultLocation(),
      tags: taskData.tags || [],
      attachments: [],
      comments: []
    };

    return of(newTask).pipe(
      debounceTime(1000), // Simular latencia de red
      map(task => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([task, ...currentTasks]);
        this.setLoading(false);
        console.log(`✅ Tarea creada: ${task.title}`);
        return task;
      }),
      catchError(error => {
        this.handleError('Error al crear tarea', error);
        return of(newTask);
      })
    );
  }

  updateTask(taskId: number, updates: Partial<Task>): Observable<Task | null> {
    this.setLoading(true);
    
    return of(updates).pipe(
      debounceTime(500),
      map(updates => {
        const currentTasks = this.tasksSubject.value;
        const taskIndex = currentTasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
          const updatedTask = { ...currentTasks[taskIndex], ...updates };
          const updatedTasks = [...currentTasks];
          updatedTasks[taskIndex] = updatedTask;
          
          this.tasksSubject.next(updatedTasks);
          this.setLoading(false);
          console.log(`🔄 Tarea actualizada: ${updatedTask.title}`);
          return updatedTask;
        }
        
        this.setLoading(false);
        return null;
      }),
      catchError(error => {
        this.handleError('Error al actualizar tarea', error);
        return of(null);
      })
    );
  }

  deleteTask(taskId: number): Observable<boolean> {
    this.setLoading(true);
    
    return of(taskId).pipe(
      debounceTime(500),
      map(id => {
        const currentTasks = this.tasksSubject.value;
        const filteredTasks = currentTasks.filter(t => t.id !== id);
        
        this.tasksSubject.next(filteredTasks);
        this.setLoading(false);
        console.log(`🗑️ Tarea eliminada: ID ${id}`);
        return true;
      }),
      catchError(error => {
        this.handleError('Error al eliminar tarea', error);
        return of(false);
      })
    );
  }

  // 📊 Métodos de estadísticas
  getTasksByStatus(): Observable<{ [key in TaskStatus]: Task[] }> {
    return this.filteredTasks$.pipe(
      map(tasks => {
        const result = {} as { [key in TaskStatus]: Task[] };
        const statuses: TaskStatus[] = ['pendiente', 'en-progreso', 'en-revision', 'pausada', 'completada', 'cancelada', 'vencida'];
        
        statuses.forEach(status => {
          result[status] = tasks.filter(task => task.status === status);
        });
        
        return result;
      })
    );
  }

  getTasksByPriority(): Observable<{ [key in TaskPriority]: Task[] }> {
    return this.filteredTasks$.pipe(
      map(tasks => {
        const result = {} as { [key in TaskPriority]: Task[] };
        const priorities: TaskPriority[] = ['baja', 'media', 'alta', 'critica', 'urgente'];
        
        priorities.forEach(priority => {
          result[priority] = tasks.filter(task => task.priority === priority);
        });
        
        return result;
      })
    );
  }

  getOverdueTasks(): Observable<Task[]> {
    return this.filteredTasks$.pipe(
      map(tasks => {
        const now = new Date();
        return tasks.filter(task => 
          task.status !== 'completada' && 
          task.status !== 'cancelada' && 
          new Date(task.dueDate) < now
        );
      })
    );
  }

  // 🎯 Métodos auxiliares privados
  private applyFiltersAndSort(tasks: Task[], filters: TaskFilters, config: TaskViewConfig): Task[] {
    let filtered = [...tasks];

    // Aplicar filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.assignee.name.toLowerCase().includes(searchLower) ||
        task.location.region.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar filtros específicos
    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.assignee) {
      filtered = filtered.filter(task => task.assignee.name.includes(filters.assignee!));
    }

    if (filters.region) {
      filtered = filtered.filter(task => task.location.region === filters.region);
    }

    // Aplicar filtro de tareas completadas
    if (!config.showCompletedTasks) {
      filtered = filtered.filter(task => task.status !== 'completada');
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      const aValue = a[config.sortBy] as any;
      const bValue = b[config.sortBy] as any;
      
      let comparison = 0;
      
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return config.sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }

  private calculateStatistics(tasks: Task[]): TaskStatistics {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completada').length;
    const overdue = tasks.filter(t => {
      const now = new Date();
      return t.status !== 'completada' && 
             t.status !== 'cancelada' && 
             new Date(t.dueDate) < now;
    }).length;

    const budgetTotal = tasks.reduce((sum, task) => sum + task.budget, 0);
    const budgetUsed = tasks.reduce((sum, task) => sum + task.budgetUsed, 0);
    const averageProgress = total > 0 ? tasks.reduce((sum, task) => sum + task.progress, 0) / total : 0;

    // Calcular distribuciones
    const byStatus = {} as { [key in TaskStatus]: number };
    const byPriority = {} as { [key in TaskPriority]: number };
    const byType = {} as { [key in TaskType]: number };
    const byRegion: { [region: string]: number } = {};

    // Inicializar contadores
    (['pendiente', 'en-progreso', 'en-revision', 'pausada', 'completada', 'cancelada', 'vencida'] as TaskStatus[])
      .forEach(status => byStatus[status] = 0);
    
    (['baja', 'media', 'alta', 'critica', 'urgente'] as TaskPriority[])
      .forEach(priority => byPriority[priority] = 0);
    
    (['construccion', 'mantenimiento', 'supervision', 'presupuesto', 'equipos', 'seguridad', 'documentacion', 'inspeccion'] as TaskType[])
      .forEach(type => byType[type] = 0);

    // Contar distribuciones
    tasks.forEach(task => {
      byStatus[task.status]++;
      byPriority[task.priority]++;
      byType[task.type]++;
      byRegion[task.location.region] = (byRegion[task.location.region] || 0) + 1;
    });

    return {
      total,
      byStatus,
      byPriority,
      byType,
      byRegion,
      completed,
      overdue,
      budgetTotal,
      budgetUsed,
      budgetRemaining: budgetTotal - budgetUsed,
      averageProgress,
      completionRate: total > 0 ? completed / total : 0,
      onTimeRate: total > 0 ? (completed - overdue) / total : 0
    };
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorSubject.next(message);
    this.setLoading(false);
  }

  private getDefaultAssignee() {
    return {
      id: 'user-001',
      name: 'Ing. Carlos Mendoza',
      email: 'c.mendoza@provias.gob.pe',
      department: 'Construcción',
      role: 'Jefe de Proyecto'
    };
  }

  private getDefaultLocation() {
    return {
      region: 'Lima',
      province: 'Lima',
      district: 'Miraflores',
      address: 'Av. Paseo de la República 3361',
      km: 0
    };
  }

  // 🎯 Inicialización de datos mock
  private initializeMockData(): void {
    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Construcción Carretera Longitudinal Norte',
        description: 'Construcción de 85 km de carretera asfaltada en la región La Libertad, conectando los distritos de Trujillo y Chepen. Incluye obras de arte como puentes, alcantarillas y señalización vial.',
        type: 'construccion',
        priority: 'critica',
        status: 'en-progreso',
        progress: 68.5,
        budget: 125000000,
        budgetUsed: 89500000,
        createdAt: new Date('2024-03-15'),
        dueDate: new Date('2025-11-30'),
        assignee: {
          id: 'eng-001',
          name: 'Ing. María Torres Valdez',
          email: 'm.torres@provias.gob.pe',
          department: 'Construcción Vial',
          role: 'Jefe de Proyecto Senior'
        },
        location: {
          region: 'La Libertad',
          province: 'Trujillo',
          district: 'Trujillo',
          address: 'Carretera PE-1N, Km 25-110',
          coordinates: { lat: -8.1116, lng: -79.0287 },
          km: 25
        },
        tags: ['carretera', 'asfaltado', 'puentes', 'señalizacion'],
        attachments: [],
        comments: []
      },
      {
        id: 2,
        title: 'Mantenimiento Puente Intercontinental',
        description: 'Mantenimiento preventivo y correctivo del puente que conecta las regiones de Loreto y Ucayali sobre el río Amazonas. Incluye revisión estructural, pintura anticorrosiva y reparación de juntas de dilatación.',
        type: 'mantenimiento',
        priority: 'alta',
        status: 'pendiente',
        progress: 0,
        budget: 8500000,
        budgetUsed: 0,
        createdAt: new Date('2025-07-20'),
        dueDate: new Date('2025-09-15'),
        assignee: {
          id: 'eng-002',
          name: 'Ing. Roberto Díaz Campos',
          email: 'r.diaz@provias.gob.pe',
          department: 'Mantenimiento',
          role: 'Especialista en Puentes'
        },
        location: {
          region: 'Loreto',
          province: 'Maynas',
          district: 'Iquitos',
          address: 'Puente Intercontinental sobre Río Amazonas',
          coordinates: { lat: -3.7437, lng: -73.2516 },
          km: 156
        },
        tags: ['puente', 'mantenimiento', 'estructural', 'rio'],
        attachments: [],
        comments: []
      },
      {
        id: 3,
        title: 'Supervisión Obra Túnel Abiseo',
        description: 'Supervisión técnica de la construcción del túnel vehicular Abiseo en la región San Martín. Monitoreo de avance de excavación, instalación de sistemas de ventilación y seguridad.',
        type: 'supervision',
        priority: 'alta',
        status: 'en-progreso',
        progress: 45.2,
        budget: 2800000,
        budgetUsed: 1260000,
        createdAt: new Date('2025-06-10'),
        dueDate: new Date('2025-12-20'),
        assignee: {
          id: 'eng-003',
          name: 'Ing. Ana Patricia Vega',
          email: 'a.vega@provias.gob.pe',
          department: 'Supervisión',
          role: 'Supervisora de Túneles'
        },
        location: {
          region: 'San Martín',
          province: 'Mariscal Cáceres',
          district: 'Tocache',
          address: 'Túnel Abiseo, Carretera Fernando Belaúnde Terry',
          coordinates: { lat: -8.1878, lng: -76.5158 },
          km: 45
        },
        tags: ['tunel', 'supervision', 'excavacion', 'seguridad'],
        attachments: [],
        comments: []
      },
      {
        id: 4,
        title: 'Auditoria Presupuesto Regional Centro',
        description: 'Auditoria integral del presupuesto asignado para proyectos viales en las regiones de Junín, Huancavelica y Ayacucho. Verificación de gastos, rendición de cuentas y optimización de recursos.',
        type: 'presupuesto',
        priority: 'media',
        status: 'en-revision',
        progress: 82.0,
        budget: 450000,
        budgetUsed: 380000,
        createdAt: new Date('2025-05-01'),
        dueDate: new Date('2025-08-31'),
        assignee: {
          id: 'aud-001',
          name: 'CPC. Luis Fernando Quispe',
          email: 'l.quispe@provias.gob.pe',
          department: 'Auditoría',
          role: 'Auditor Senior'
        },
        location: {
          region: 'Junín',
          province: 'Huancayo',
          district: 'Huancayo',
          address: 'Oficina Regional Centro - Jr. Real 345',
          km: 0
        },
        tags: ['auditoria', 'presupuesto', 'verificacion', 'optimizacion'],
        attachments: [],
        comments: []
      },
      {
        id: 5,
        title: 'Inspección Equipos Región Sur',
        description: 'Inspección técnica y calibración de maquinaria pesada distribuida en las regiones de Arequipa, Cusco y Puno. Verificación de estado operativo, mantenimiento preventivo y certificación.',
        type: 'equipos',
        priority: 'media',
        status: 'completada',
        progress: 100,
        budget: 1200000,
        budgetUsed: 1150000,
        createdAt: new Date('2025-04-15'),
        dueDate: new Date('2025-07-15'),
        completedAt: new Date('2025-07-10'),
        assignee: {
          id: 'tec-001',
          name: 'Téc. Miguel Ángel Rodríguez',
          email: 'm.rodriguez@provias.gob.pe',
          department: 'Equipos y Maquinaria',
          role: 'Técnico Especialista'
        },
        location: {
          region: 'Arequipa',
          province: 'Arequipa',
          district: 'Cerro Colorado',
          address: 'Parque de Maquinarias Sur - Km 8 Carretera Arequipa-Puno',
          km: 8
        },
        tags: ['equipos', 'inspeccion', 'calibracion', 'certificacion'],
        attachments: [],
        comments: []
      },
      {
        id: 6,
        title: 'Capacitación Seguridad Vial Norte',
        description: 'Programa de capacitación en seguridad vial para personal técnico y operativo de las regiones de Piura, Lambayeque y Cajamarca. Incluye protocolos de emergencia y uso de EPP.',
        type: 'seguridad',
        priority: 'alta',
        status: 'en-progreso',
        progress: 25.8,
        budget: 850000,
        budgetUsed: 220000,
        createdAt: new Date('2025-07-01'),
        dueDate: new Date('2025-10-30'),
        assignee: {
          id: 'seg-001',
          name: 'Ing. Carmen Rosa Huamán',
          email: 'c.huaman@provias.gob.pe',
          department: 'Seguridad y Salud',
          role: 'Especialista en SST'
        },
        location: {
          region: 'Piura',
          province: 'Piura',
          district: 'Piura',
          address: 'Centro de Capacitación Norte - Av. Sánchez Cerro 1250',
          km: 0
        },
        tags: ['capacitacion', 'seguridad', 'protocolos', 'emergencia'],
        attachments: [],
        comments: []
      },
      {
        id: 7,
        title: 'Pavimentación Acceso Aeropuerto Cusco',
        description: 'Pavimentación y mejoramiento de la vía de acceso al Aeropuerto Internacional Alejandro Velasco Astete. Incluye señalización horizontal, vertical y sistema de drenaje.',
        type: 'construccion',
        priority: 'urgente',
        status: 'pausada',
        progress: 15.0,
        budget: 45000000,
        budgetUsed: 6750000,
        createdAt: new Date('2025-06-20'),
        dueDate: new Date('2025-12-15'),
        assignee: {
          id: 'eng-004',
          name: 'Ing. José Carlos Mendoza',
          email: 'j.mendoza@provias.gob.pe',
          department: 'Construcción Vial',
          role: 'Jefe de Proyecto'
        },
        location: {
          region: 'Cusco',
          province: 'Cusco',
          district: 'San Sebastián',
          address: 'Vía de Acceso Aeropuerto Velasco Astete',
          coordinates: { lat: -13.5319, lng: -71.9387 },
          km: 12
        },
        tags: ['pavimentacion', 'aeropuerto', 'señalizacion', 'drenaje'],
        attachments: [],
        comments: []
      },
      {
        id: 8,
        title: 'Documentación Proyecto Costa Verde',
        description: 'Elaboración y actualización de documentación técnica del proyecto Costa Verde en Lima. Incluye planos as-built, especificaciones técnicas y manual de operación.',
        type: 'documentacion',
        priority: 'baja',
        status: 'vencida',
        progress: 60.0,
        budget: 320000,
        budgetUsed: 195000,
        createdAt: new Date('2025-03-10'),
        dueDate: new Date('2025-07-31'),
        assignee: {
          id: 'doc-001',
          name: 'Arq. Patricia Luz Morales',
          email: 'p.morales@provias.gob.pe',
          department: 'Documentación Técnica',
          role: 'Arquitecta Documentalista'
        },
        location: {
          region: 'Lima',
          province: 'Lima',
          district: 'Miraflores',
          address: 'Circuito de Playas Costa Verde',
          km: 15
        },
        tags: ['documentacion', 'planos', 'especificaciones', 'manual'],
        attachments: [],
        comments: []
      }
    ];

    this.tasksSubject.next(mockTasks);
    console.log(`📊 ${mockTasks.length} tareas de ejemplo cargadas`);
  }

  private startRealTimeUpdates(): void {
    // Simular actualizaciones en tiempo real cada 10 segundos
    interval(10000).subscribe(() => {
      this.updateRandomProgress();
    });
  }

  private updateRandomProgress(): void {
    const currentTasks = this.tasksSubject.value;
    const inProgressTasks = currentTasks.filter(t => t.status === 'en-progreso');
    
    if (inProgressTasks.length > 0) {
      const randomTask = inProgressTasks[Math.floor(Math.random() * inProgressTasks.length)];
      const progressIncrease = Math.random() * 2; // 0-2% de progreso
      const newProgress = Math.min(100, randomTask.progress + progressIncrease);
      
      this.updateTask(randomTask.id, { progress: newProgress }).subscribe();
    }
  }
}