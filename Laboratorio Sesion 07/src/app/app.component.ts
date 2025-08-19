import { Component, signal, computed, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  location: string;
  budget: number;
  deadline: Date;
  progress: number;
  engineers: string[];
}

// 🏚️ OLD WAY - RxJS Service (para comparación)
class OldCartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  
  public totalItems$ = this.cartItems$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );
  
  public totalPrice$ = this.cartItems$.pipe(
    map(items => items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
  );
  
  public isEmpty$ = this.cartItems$.pipe(
    map(items => items.length === 0)
  );
  
  addItem(item: CartItem): void {
    const current = this.cartItemsSubject.value;
    this.cartItemsSubject.next([...current, item]);
  }
  
  removeItem(id: number): void {
    const current = this.cartItemsSubject.value;
    this.cartItemsSubject.next(current.filter(item => item.id !== id));
  }
  
  clear(): void {
    this.cartItemsSubject.next([]);
  }
}

// ✨ NEW WAY - Signals Service
class NewCartService {
  private cartItemsSignal = signal<CartItem[]>([]);
  
  public cartItems = this.cartItemsSignal.asReadonly();
  
  public totalItems = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  public totalPrice = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );
  
  public isEmpty = computed(() => 
    this.cartItemsSignal().length === 0
  );
  
  addItem(item: CartItem): void {
    this.cartItemsSignal.update(items => [...items, item]);
  }
  
  removeItem(id: number): void {
    this.cartItemsSignal.update(items => items.filter(item => item.id !== id));
  }
  
  clear(): void {
    this.cartItemsSignal.set([]);
  }
}

// 🌍 GLOBAL STATE SERVICE
class GlobalStateService {
  private http = inject(HttpClient);
  
  // 🔐 Authentication
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal(false);
  
  currentUser = this._currentUser.asReadonly();
  isLoading = this._isLoading.asReadonly();
  isAuthenticated = computed(() => this._currentUser() !== null);
  userRole = computed(() => this._currentUser()?.role ?? 'guest');
  canAccessAdmin = computed(() => ['admin', 'manager'].includes(this.userRole()));
  
  // 🎨 UI State
  private _theme = signal<'light' | 'dark'>('light');
  private _language = signal<'es' | 'en'>('es');
  private _sidebarOpen = signal(false);
  
  theme = this._theme.asReadonly();
  language = this._language.asReadonly();
  sidebarOpen = this._sidebarOpen.asReadonly();
  isDarkMode = computed(() => this._theme() === 'dark');
  
  // 🔔 Notifications
  private _notifications = signal<AppNotification[]>([]);
  
  notifications = this._notifications.asReadonly();
  unreadNotifications = computed(() => 
    this._notifications().filter(n => !n.read)
  );
  unreadCount = computed(() => this.unreadNotifications().length);
  
  // 🏗️ Projects
  private _projects = signal<Project[]>([]);
  private _activeProject = signal<Project | null>(null);
  
  projects = this._projects.asReadonly();
  activeProject = this._activeProject.asReadonly();
  activeProjects = computed(() => this._projects().filter(p => p.status === 'active'));
  activeProjectsCount = computed(() => this.activeProjects().length);
  activeProjectEngineers = computed(() => this._activeProject()?.engineers ?? []);
  
  projectsStats = computed(() => {
    const projects = this._projects();
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      paused: projects.filter(p => p.status === 'paused').length
    };
  });
  
  // 💾 Persistence
  private _isSaving = signal(false);
  private _lastSaveTime = signal<Date | null>(null);
  
  isSaving = this._isSaving.asReadonly();
  lastSaveTime = this._lastSaveTime.asReadonly();
  onlineUsers = signal(3); // Mock data
  
  constructor() {
    // 💾 Auto-save effect
    effect(() => {
      const state = {
        theme: this._theme(),
        language: this._language(),
        user: this._currentUser(),
        sidebarOpen: this._sidebarOpen()
      };
      
      this._isSaving.set(true);
      setTimeout(() => {
        localStorage.setItem('provias-app-state', JSON.stringify(state));
        this._lastSaveTime.set(new Date());
        this._isSaving.set(false);
      }, 500);
    });
    
    this.loadFromStorage();
    this.loadMockProjects();
  }
  
  // Actions
  login(username: string, password: string): void {
    this._isLoading.set(true);
    
    setTimeout(() => {
      const user: User = {
        id: 1,
        name: username || 'Ana García',
        email: 'ana@provias.gob.pe',
        role: 'admin',
        isActive: true
      };
      
      this._currentUser.set(user);
      this._isLoading.set(false);
      
      this.addNotification({
        title: 'Bienvenido',
        message: `Sesión iniciada como ${user.name}`,
        type: 'success'
      });
    }, 1000);
  }
  
  logout(): void {
    this._currentUser.set(null);
    this._activeProject.set(null);
    this.addNotification({
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente',
      type: 'info'
    });
  }
  
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(newTheme);
  }
  
  setLanguage(language: 'es' | 'en'): void {
    this._language.set(language);
  }
  
  toggleSidebar(): void {
    this._sidebarOpen.update(open => !open);
  }
  
  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    this._notifications.update(notifications => 
      [newNotification, ...notifications].slice(0, 20)
    );
  }
  
  markNotificationAsRead(id: string): void {
    this._notifications.update(notifications =>
      notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  }
  
  clearAllNotifications(): void {
    this._notifications.set([]);
  }
  
  loadProjects(): void {
    this.loadMockProjects();
    this.addNotification({
      title: 'Proyectos cargados',
      message: `${this._projects().length} proyectos cargados exitosamente`,
      type: 'success'
    });
  }
  
  setActiveProject(project: Project): void {
    this._activeProject.set(project);
    this.addNotification({
      title: 'Proyecto seleccionado',
      message: `Proyecto ${project.name} ahora está activo`,
      type: 'info'
    });
  }
  
  private loadMockProjects(): void {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Carretera Panamericana Norte',
        status: 'active',
        location: 'Lima - Trujillo',
        budget: 15000000,
        deadline: new Date('2025-12-31'),
        progress: 65,
        engineers: ['Ana García', 'Carlos López']
      },
      {
        id: '2', 
        name: 'Puente Río Amazonas',
        status: 'active',
        location: 'Iquitos',
        budget: 8500000,
        deadline: new Date('2025-10-15'),
        progress: 45,
        engineers: ['María Rodriguez', 'Juan Pérez']
      },
      {
        id: '3',
        name: 'Túnel Abancay',
        status: 'paused',
        location: 'Abancay - Cusco',
        budget: 12000000,
        deadline: new Date('2026-03-20'),
        progress: 25,
        engineers: ['Lucia Fernandez']
      }
    ];
    
    this._projects.set(mockProjects);
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('provias-app-state');
      if (stored) {
        const state = JSON.parse(stored);
        if (state.theme) this._theme.set(state.theme);
        if (state.language) this._language.set(state.language);
        if (state.user) this._currentUser.set(state.user);
        if (state.sidebarOpen !== undefined) this._sidebarOpen.set(state.sidebarOpen);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PROVIAS LAB 4 - Migración y Estado Global';
  
  // Estado global
  globalState = new GlobalStateService();
  
  // Old vs New Cart services para comparación
  private oldCartService = new OldCartService();
  private newCartService = new NewCartService();
  
  // Navegación
  activeTab = signal<string>('intro');
  
  // Login form
  loginForm = {
    username: '',
    password: ''
  };
  
  // Realtime demo
  isConnected = signal(false);
  realtimeData = signal<Array<{id: number, message: string, timestamp: Date}>>([]);
  
  // Cleanup
  private destroy$ = new Subject<void>();
  
  // Observables para comparación (OLD WAY)
  oldCartItems$ = this.oldCartService.cartItems$;
  oldTotalItems$ = this.oldCartService.totalItems$;
  oldTotalPrice$ = this.oldCartService.totalPrice$;
  oldIsEmpty$ = this.oldCartService.isEmpty$;
  
  // Signals para comparación (NEW WAY)
  newCartItems = this.newCartService.cartItems;
  newTotalItems = this.newCartService.totalItems;
  newTotalPrice = this.newCartService.totalPrice;
  newIsEmpty = this.newCartService.isEmpty;

  ngOnInit() {
    console.log('🔄 LAB 4: Migración y Estado Global - Iniciado');
    console.log('👨‍🏫 Instructor: Ing. Jhonny Alexander Ramirez Chiroque');
    console.log('🎯 Tema: Integración pura - RxJS + Signals trabajando juntos');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====================================
  // NAVEGACIÓN
  // ====================================
  
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    console.log(`📑 Cambiando a pestaña: ${tab}`);
  }

  // ====================================
  // AUTHENTICATION
  // ====================================
  
  login(): void {
    console.log('🔑 Iniciando login...');
    this.globalState.login(this.loginForm.username, this.loginForm.password);
    this.loginForm = { username: '', password: '' };
  }
  
  logout(): void {
    console.log('🚪 Cerrando sesión...');
    this.globalState.logout();
  }

  // ====================================
  // UI CONTROLS
  // ====================================
  
  changeLanguage(event: Event): void {
    const language = (event.target as HTMLSelectElement).value as 'es' | 'en';
    this.globalState.setLanguage(language);
    console.log(`🌐 Idioma cambiado a: ${language}`);
  }

  // ====================================
  // NOTIFICATIONS
  // ====================================
  
  addInfoNotification(): void {
    this.globalState.addNotification({
      title: 'Información',
      message: 'Esta es una notificación informativa de prueba',
      type: 'info'
    });
  }
  
  addSuccessNotification(): void {
    this.globalState.addNotification({
      title: 'Éxito',
      message: 'Operación completada exitosamente',
      type: 'success'
    });
  }
  
  addWarningNotification(): void {
    this.globalState.addNotification({
      title: 'Advertencia',
      message: 'Revisa la configuración del proyecto',
      type: 'warning'
    });
  }
  
  addErrorNotification(): void {
    this.globalState.addNotification({
      title: 'Error',
      message: 'Error de conexión con el servidor',
      type: 'error'
    });
  }

  // ====================================
  // CART COMPARISON - OLD vs NEW
  // ====================================
  
  addToOldCart(): void {
    const mockItem: CartItem = {
      id: Date.now(),
      name: `Producto RxJS ${Math.floor(Math.random() * 100)}`,
      price: Math.floor(Math.random() * 500) + 50,
      quantity: 1
    };
    
    this.oldCartService.addItem(mockItem);
    console.log('🏚️ Item agregado al cart RxJS:', mockItem.name);
  }
  
  removeFromOldCart(): void {
    // Remove first item
    this.oldCartService.cartItems$.pipe(
      takeUntil(this.destroy$),
      map(items => items[0]?.id)
    ).subscribe(firstId => {
      if (firstId) {
        this.oldCartService.removeItem(firstId);
        console.log('🏚️ Item removido del cart RxJS');
      }
    });
  }
  
  clearOldCart(): void {
    this.oldCartService.clear();
    console.log('🏚️ Cart RxJS limpiado');
  }
  
  addToNewCart(): void {
    const mockItem: CartItem = {
      id: Date.now(),
      name: `Producto Signals ${Math.floor(Math.random() * 100)}`,
      price: Math.floor(Math.random() * 500) + 50,
      quantity: 1
    };
    
    this.newCartService.addItem(mockItem);
    console.log('✨ Item agregado al cart Signals:', mockItem.name);
  }
  
  removeFromNewCart(): void {
    const items = this.newCartService.cartItems();
    if (items.length > 0) {
      this.newCartService.removeItem(items[0].id);
      console.log('✨ Item removido del cart Signals');
    }
  }
  
  clearNewCart(): void {
    this.newCartService.clear();
    console.log('✨ Cart Signals limpiado');
  }

  // ====================================
  // INTEROPERABILITY BRIDGES
  // ====================================
  
  testSignalToObservable(): void {
    console.log('🌉 Probando Signal → Observable');
    // Simular conversión
    const userSignal = this.globalState.currentUser;
    console.log('📡 Signal convertido a Observable para integrar con RxJS');
    
    this.globalState.addNotification({
      title: 'Interoperabilidad',
      message: 'Signal convertido a Observable exitosamente',
      type: 'success'
    });
  }
  
  testObservableToSignal(): void {
    console.log('🌉 Probando Observable → Signal');
    // Simular conversión
    console.log('📡 Observable convertido a Signal para UI reactiva');
    
    this.globalState.addNotification({
      title: 'Interoperabilidad',
      message: 'Observable convertido a Signal exitosamente',
      type: 'success'
    });
  }

  // ====================================
  // REALTIME DEMO
  // ====================================
  
  toggleConnection(): void {
    const newStatus = !this.isConnected();
    this.isConnected.set(newStatus);
    
    if (newStatus) {
      console.log('🔌 Conectando en tiempo real...');
      this.startRealtimeData();
    } else {
      console.log('🔌 Desconectando...');
      this.realtimeData.set([]);
    }
  }
  
  private startRealtimeData(): void {
    const messages = [
      'Nuevo proyecto creado',
      'Usuario Ana García conectado',
      'Reporte de progreso actualizado',
      'Presupuesto Q4 aprobado',
      'Ingeniero asignado a proyecto',
      'Milestone completado'
    ];
    
    let messageIndex = 0;
    
    const interval = setInterval(() => {
      if (!this.isConnected()) {
        clearInterval(interval);
        return;
      }
      
      const newData = {
        id: Date.now(),
        message: messages[messageIndex % messages.length],
        timestamp: new Date()
      };
      
      this.realtimeData.update(data => [newData, ...data.slice(0, 9)]);
      messageIndex++;
    }, 2000);
  }

  // ====================================
  // PROVIAS PROJECT ACTIONS
  // ====================================
  
  updateProjectStatus(): void {
    const activeProject = this.globalState.activeProject();
    if (activeProject) {
      const newStatus = activeProject.status === 'active' ? 'paused' : 'active';
      
      // Actualizar proyecto
      this.globalState._projects.update(projects =>
        projects.map(p =>
          p.id === activeProject.id 
            ? { ...p, status: newStatus as 'active' | 'completed' | 'paused' }
            : p
        )
      );
      
      // Actualizar proyecto activo
      this.globalState.setActiveProject({ ...activeProject, status: newStatus as any });
      
      this.globalState.addNotification({
        title: 'Proyecto actualizado',
        message: `Estado cambiado a: ${newStatus}`,
        type: 'success'
      });
    }
  }
  
  assignEngineer(): void {
    const engineers = ['Pedro Martínez', 'Sofía Castillo', 'Diego Herrera'];
    const randomEngineer = engineers[Math.floor(Math.random() * engineers.length)];
    
    this.globalState.addNotification({
      title: 'Ingeniero asignado',
      message: `${randomEngineer} ha sido asignado al proyecto`,
      type: 'success'
    });
    
    console.log(`👨‍💻 Ingeniero asignado: ${randomEngineer}`);
  }
  
  generateReport(): void {
    this.globalState.addNotification({
      title: 'Reporte generado',
      message: 'Reporte de progreso del proyecto generado',
      type: 'info'
    });
    
    console.log('📊 Reporte generado');
  }

  // ====================================
  // PERSISTENCE
  // ====================================
  
  exportState(): void {
    const state = {
      user: this.globalState.currentUser(),
      theme: this.globalState.theme(),
      language: this.globalState.language(),
      projects: this.globalState.projects(),
      notifications: this.globalState.notifications()
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provias-state-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📤 Estado exportado');
  }
  
  importState(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const state = JSON.parse(e.target?.result as string);
            console.log('📥 Estado importado:', state);
            
            this.globalState.addNotification({
              title: 'Estado importado',
              message: 'Configuración cargada exitosamente',
              type: 'success'
            });
          } catch (error) {
            console.error('Error importing state:', error);
            
            this.globalState.addNotification({
              title: 'Error de importación',
              message: 'No se pudo cargar el archivo de configuración',
              type: 'error'
            });
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }
}