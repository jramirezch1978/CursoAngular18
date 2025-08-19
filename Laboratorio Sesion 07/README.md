# 🔄 LAB 4: MIGRACIÓN Y ESTADO GLOBAL

**PROVIAS DESCENTRALIZADO - ANGULAR v18**  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  
**Duración:** 25 minutos  
**Modalidad:** Integración y Migración Profesional

## 🎯 OBJETIVOS DEL LABORATORIO

> *"El laboratorio final de 25 minutos es integración pura. Migraremos código real de RxJS a Signals, crearemos estado global, y verán cómo ambos paradigmas pueden coexistir armoniosamente."* - Ing. Jhonny Ramirez

### Lo que dominarás:

1. **Migración RxJS → Signals** - Estrategias y patrones de migración profesional
2. **Estado Global Avanzado** - Arquitectura escalable sin librerías pesadas
3. **Coexistencia de Paradigmas** - RxJS y Signals trabajando juntos
4. **Interoperabilidad** - toSignal() y toObservable() para casos híbridos
5. **Arquitectura de Producción** - Patrones para aplicaciones reales

## 🌟 FUNDAMENTOS DE MIGRACIÓN

### ¿Migrar o No Migrar?

> *"La migración no es solo un ejercicio académico. Muchas aplicaciones Angular existentes están haciendo esta transición. Serán los expertos que sus empresas necesitan para modernizar código legacy."* - Ing. Jhonny Ramirez

### Reglas de Oro para Migración

#### ✅ MIGRAR a Signals cuando:
- Estado local de componente
- Datos síncronos simples
- Derivaciones automáticas necesarias
- Quieres simplicidad y mejor performance

#### ❌ NO MIGRAR (mantener RxJS) cuando:
- HTTP requests complejos
- Operaciones asíncronas con operadores
- Streams de eventos temporales
- Ya funciona bien y es complejo

> *"No migren todo ciegamente. Evalúen cada caso. Si usan operadores RxJS complejos, manténganlo en RxJS. Si es simple estado con derivaciones, Signals es probablemente mejor."* - Ing. Jhonny Ramirez

## 🔄 PARTE 1: MIGRACIÓN PRÁCTICA - CART SERVICE

### 1.1 ANTES: Cart Service con RxJS

```typescript
// 🏚️ OLD WAY - RxJS BehaviorSubject Pattern
@Injectable({ providedIn: 'root' })
export class OldCartService {
  // 📊 Estado con BehaviorSubject
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  
  // 🧮 Derivaciones con operadores RxJS
  public totalItems$ = this.cartItems$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );
  
  public totalPrice$ = this.cartItems$.pipe(
    map(items => items.reduce((sum, item) => sum + (item.price * item.quantity), 0))
  );
  
  public isEmpty$ = this.cartItems$.pipe(
    map(items => items.length === 0)
  );
  
  // ➕ Agregar item
  addItem(product: Product): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Actualizar cantidad
      const updatedItems = currentItems.map(item =>
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      this.cartItemsSubject.next(updatedItems);
    } else {
      // Agregar nuevo item
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      };
      this.cartItemsSubject.next([...currentItems, newItem]);
    }
  }
  
  // ❌ Remover item  
  removeItem(productId: number): void {
    const currentItems = this.cartItemsSubject.value;
    const filteredItems = currentItems.filter(item => item.productId !== productId);
    this.cartItemsSubject.next(filteredItems);
  }
  
  // 🧹 Limpiar carrito
  clearCart(): void {
    this.cartItemsSubject.next([]);
  }
}
```

> *"El OldCartService con BehaviorSubject es el patrón clásico de RxJS para estado. Funciona, pero requiere ceremonias. BehaviorSubject para mantener estado, pipe para derivar valores, suscripciones en componentes."* - Ing. Jhonny Ramirez

### 1.2 DESPUÉS: Cart Service con Signals

```typescript
// ✨ NEW WAY - Angular Signals Pattern
@Injectable({ providedIn: 'root' })
export class NewCartService {
  // 📊 Estado con Signal
  private cartItemsSignal = signal<CartItem[]>([]);
  
  // 📖 Exposición readonly
  public cartItems = this.cartItemsSignal.asReadonly();
  
  // 🧮 Derivaciones con computed - ¡Automáticas!
  public totalItems = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  public totalPrice = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );
  
  public isEmpty = computed(() => 
    this.cartItemsSignal().length === 0
  );
  
  // 📈 Estadísticas adicionales (fáciles con computed)
  public itemCount = computed(() => this.cartItemsSignal().length);
  public averagePrice = computed(() => {
    const items = this.cartItemsSignal();
    if (items.length === 0) return 0;
    return this.totalPrice() / this.totalItems();
  });
  
  // ➕ Agregar item - Lógica más clara
  addItem(product: Product): void {
    this.cartItemsSignal.update(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === product.id
      );
      
      if (existingItemIndex !== -1) {
        // Actualizar cantidad existente
        return currentItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        };
        return [...currentItems, newItem];
      }
    });
  }
  
  // 🔢 Actualizar cantidad específica
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    
    this.cartItemsSignal.update(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  }
  
  // ❌ Remover item
  removeItem(productId: number): void {
    this.cartItemsSignal.update(items =>
      items.filter(item => item.productId !== productId)
    );
  }
  
  // 🧹 Limpiar carrito
  clearCart(): void {
    this.cartItemsSignal.set([]);
  }
  
  // 💾 Persistencia automática con effect
  constructor() {
    effect(() => {
      const items = this.cartItemsSignal();
      localStorage.setItem('cart', JSON.stringify(items));
      console.log(`💾 Carrito guardado: ${items.length} items`);
    });
  }
  
  // 🔄 Cargar desde storage
  loadFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        this.cartItemsSignal.set(items);
        console.log(`🔄 Carrito cargado: ${items.length} items`);
      } catch (error) {
        console.error('Error cargando carrito:', error);
      }
    }
  }
}
```

> *"El NewCartService con Signals es refrescantemente simple. El mismo funcionalidad, la mitad del código, más fácil de entender. No hay pipe, no hay operadores, solo computed values que se actualizan automáticamente."* - Ing. Jhonny Ramirez

### 1.3 Comparación Directa

| Aspecto | RxJS BehaviorSubject | Signals |
|---------|---------------------|---------|
| **Código** | ~80 líneas | ~60 líneas |
| **Suscripciones** | Manual con async pipe | Automáticas |
| **Derivaciones** | pipe + map | computed |
| **Updates** | .next() | .set() / .update() |
| **Memory Leaks** | Posibles si no cleanup | Imposibles |
| **Performance** | Bueno | Mejor |
| **Legibilidad** | Ceremonioso | Directo |

## 🌍 PARTE 2: ESTADO GLOBAL AVANZADO

### 2.1 Sistema Completo de Estado Global

> *"El estado global con Signals resolverá uno de los problemas más complejos en aplicaciones modernas: compartir estado entre componentes de manera eficiente y predecible. Es como tener un sistema nervioso central para su aplicación."* - Ing. Jhonny Ramirez

```typescript
// 🌟 ESTADO GLOBAL PROFESIONAL CON SIGNALS
@Injectable({ providedIn: 'root' })
export class AppStateService {
  
  // ====================================
  // 🔐 AUTHENTICATION STATE
  // ====================================
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal(false);
  private _authError = signal<string | null>(null);
  
  // 📖 Public readonly access
  currentUser = this._currentUser.asReadonly();
  isLoading = this._isLoading.asReadonly();
  authError = this._authError.asReadonly();
  
  // 🧮 Computed authentication state
  isAuthenticated = computed(() => this._currentUser() !== null);
  userRole = computed(() => this._currentUser()?.role ?? 'guest');
  canAccessAdmin = computed(() => ['admin', 'manager'].includes(this.userRole()));
  
  // ====================================
  // 🎨 UI STATE  
  // ====================================
  private _theme = signal<'light' | 'dark'>('light');
  private _language = signal<'es' | 'en'>('es');
  private _sidebarOpen = signal(false);
  
  theme = this._theme.asReadonly();
  language = this._language.asReadonly();
  sidebarOpen = this._sidebarOpen.asReadonly();
  
  isDarkMode = computed(() => this._theme() === 'dark');
  
  // ====================================
  // 🔔 NOTIFICATIONS STATE
  // ====================================
  private _notifications = signal<AppNotification[]>([]);
  
  notifications = this._notifications.asReadonly();
  unreadNotifications = computed(() => 
    this._notifications().filter(n => !n.read)
  );
  unreadCount = computed(() => this.unreadNotifications().length);
  
  // ====================================
  // 🏗️ BUSINESS DATA STATE (PROVIAS)
  // ====================================
  private _projects = signal<Project[]>([]);
  private _activeProject = signal<Project | null>(null);
  
  projects = this._projects.asReadonly();
  activeProject = this._activeProject.asReadonly();
  
  activeProjectEngineers = computed(() => {
    const project = this._activeProject();
    return project ? project.engineers : [];
  });
  
  projectsStats = computed(() => {
    const projects = this._projects();
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      delayed: projects.filter(p => p.isDelayed).length
    };
  });
  
  // ====================================
  // 🔐 AUTHENTICATION ACTIONS
  // ====================================
  
  async login(credentials: LoginCredentials): Promise<void> {
    this._isLoading.set(true);
    this._authError.set(null);
    
    try {
      // 🌐 HTTP call - Observable to Signal integration
      const user = await firstValueFrom(
        this.http.post<User>('/api/auth/login', credentials)
      );
      
      this._currentUser.set(user);
      await this.loadUserData(user.id);
      
      // 📊 Load user preferences
      this.loadUserPreferences();
      
      console.log(`✅ Login exitoso: ${user.name}`);
    } catch (error: any) {
      this._authError.set(error.message || 'Error de autenticación');
      console.error('❌ Error de login:', error);
    } finally {
      this._isLoading.set(false);
    }
  }
  
  logout(): void {
    this._currentUser.set(null);
    this._activeProject.set(null);
    this._notifications.set([]);
    this.clearStorage();
    console.log('🚪 Sesión cerrada');
  }
  
  // ====================================
  // 🎨 UI ACTIONS
  // ====================================
  
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(newTheme);
    this.saveToStorage();
    console.log(`🎨 Tema cambiado a: ${newTheme}`);
  }
  
  setLanguage(language: 'es' | 'en'): void {
    this._language.set(language);
    this.saveToStorage();
  }
  
  toggleSidebar(): void {
    this._sidebarOpen.update(open => !open);
  }
  
  // ====================================
  // 🔔 NOTIFICATIONS ACTIONS
  // ====================================
  
  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    
    this._notifications.update(notifications => 
      [newNotification, ...notifications].slice(0, 50) // Límite de 50
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
  
  // ====================================
  // 🏗️ PROJECTS ACTIONS (PROVIAS)
  // ====================================
  
  async loadProjects(): Promise<void> {
    try {
      const projects = await firstValueFrom(
        this.http.get<Project[]>('/api/projects')
      );
      this._projects.set(projects);
      console.log(`📋 ${projects.length} proyectos cargados`);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      this.addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los proyectos'
      });
    }
  }
  
  setActiveProject(project: Project | null): void {
    this._activeProject.set(project);
    if (project) {
      console.log(`🎯 Proyecto activo: ${project.name}`);
    }
  }
  
  updateProjectStatus(projectId: string, status: ProjectStatus): void {
    this._projects.update(projects =>
      projects.map(p =>
        p.id === projectId ? { ...p, status } : p
      )
    );
    
    // Update active project if it's the one being updated
    const activeProject = this._activeProject();
    if (activeProject?.id === projectId) {
      this._activeProject.update(project =>
        project ? { ...project, status } : null
      );
    }
  }
  
  // ====================================
  // 💾 PERSISTENCE
  // ====================================
  
  constructor(private http: HttpClient) {
    // 🔄 Auto-save effects
    effect(() => {
      const state = {
        theme: this._theme(),
        language: this._language(),
        user: this._currentUser()
      };
      this.saveToStorage(state);
    });
    
    // 📊 Stats logging effect
    effect(() => {
      const stats = this.projectsStats();
      console.log('📊 Projects Stats:', stats);
    });
    
    // 🔔 Notification counter effect
    effect(() => {
      const count = this.unreadCount();
      if (count > 0) {
        document.title = `(${count}) PROVIAS Dashboard`;
      } else {
        document.title = 'PROVIAS Dashboard';
      }
    });
    
    // 🎨 Theme effect - apply to DOM
    effect(() => {
      const theme = this._theme();
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${theme}-theme`);
    });
    
    // Load initial state
    this.loadFromStorage();
  }
  
  private saveToStorage(state?: any): void {
    const stateToSave = state || {
      theme: this._theme(),
      language: this._language(),
      user: this._currentUser()
    };
    
    localStorage.setItem('app-state', JSON.stringify(stateToSave));
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('app-state');
      if (stored) {
        const state = JSON.parse(stored);
        if (state.theme) this._theme.set(state.theme);
        if (state.language) this._language.set(state.language);
        if (state.user) this._currentUser.set(state.user);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
  
  private clearStorage(): void {
    localStorage.removeItem('app-state');
    localStorage.removeItem('user-preferences');
  }
  
  // ====================================
  // 🔗 RXJS INTEGRATION - Best of Both Worlds  
  // ====================================
  
  // Convert signals to observables when needed
  currentUser$ = toObservable(this._currentUser);
  notifications$ = toObservable(this._notifications);
  
  // Real-time updates from WebSocket (Observable) to Signal
  connectToNotifications(): void {
    // Example: WebSocket stream to Signal
    const notificationStream$ = this.websocketService.notifications$;
    
    notificationStream$.subscribe(notification => {
      this.addNotification(notification);
    });
  }
  
  // HTTP + Signal pattern
  async refreshUserData(): Promise<void> {
    const user = this._currentUser();
    if (user) {
      this._isLoading.set(true);
      try {
        const updatedUser = await firstValueFrom(
          this.http.get<User>(`/api/users/${user.id}`)
        );
        this._currentUser.set(updatedUser);
      } catch (error) {
        console.error('Error refreshing user:', error);
      } finally {
        this._isLoading.set(false);
      }
    }
  }
}
```

## 🔗 PARTE 3: INTEROPERABILIDAD HÍBRIDA

### 3.1 RxJS ↔ Signals - Lo Mejor de Ambos Mundos

```typescript
@Component({
  selector: 'app-hybrid-demo',
  template: `
    <div class="hybrid-demo">
      <h2>🔄 Demo de Interoperabilidad</h2>
      
      <!-- Signal-based data -->
      <div class="signal-section">
        <h3>📊 Data from Signals</h3>
        <p>User: {{ appState.currentUser()?.name || 'No user' }}</p>
        <p>Theme: {{ appState.theme() }}</p>
        <p>Unread: {{ appState.unreadCount() }}</p>
      </div>
      
      <!-- Observable-based real-time data -->  
      <div class="observable-section">
        <h3>🌊 Real-time from Observables</h3>
        <p>Time: {{ currentTime$ | async | date:'medium' }}</p>
        <p>Server Status: {{ serverStatus$ | async }}</p>
      </div>
      
      <!-- Hybrid search -->
      <div class="search-section">
        <h3>🔍 Hybrid Search</h3>
        <input 
          [(ngModel)]="searchTerm"
          placeholder="Search users...">
        
        @if (searchResults(); as results) {
          <div class="results">
            @for (user of results; track user.id) {
              <div>{{ user.name }}</div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class HybridDemoComponent {
  
  // 🔮 Signals for local state
  searchTerm = signal('');
  searchResults = signal<User[]>([]);
  
  // 🌊 Observables for streams
  currentTime$ = interval(1000).pipe(
    map(() => new Date())
  );
  
  serverStatus$ = interval(5000).pipe(
    switchMap(() => this.http.get<{status: string}>('/api/health')),
    map(response => response.status),
    startWith('checking...'),
    catchError(() => of('offline'))
  );
  
  // 🔗 Signal to Observable conversion
  searchTerm$ = toObservable(this.searchTerm);
  
  constructor(
    public appState: AppStateService,
    private http: HttpClient
  ) {
    // 🎯 Observable pattern for complex search
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => 
        term.length > 2 
          ? this.http.get<User[]>(`/api/users/search?q=${term}`)
          : of([])
      ),
      takeUntilDestroyed() // Auto cleanup
    ).subscribe(results => {
      // 🎯 Update Signal from Observable result
      this.searchResults.set(results);
    });
  }
}
```

## 🏗️ PARTE 4: ARQUITECTURA DE PRODUCCIÓN

### 4.1 Feature-Based State Management

```typescript
// 🏢 Arquitectura escalable por features
@Injectable({ providedIn: 'root' })
export class ProjectsStateService {
  // Feature-specific state
  private _projects = signal<Project[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _filters = signal<ProjectFilters>({
    status: 'all',
    priority: 'all',
    assignee: null
  });
  
  // Public API
  projects = this._projects.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  filters = this._filters.asReadonly();
  
  // Complex computed values
  filteredProjects = computed(() => {
    const projects = this._projects();
    const filters = this._filters();
    
    return projects.filter(project => {
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && project.priority !== filters.priority) {
        return false;
      }
      if (filters.assignee && project.leadEngineerId !== filters.assignee) {
        return false;
      }
      return true;
    });
  });
  
  projectsByStatus = computed(() => {
    const projects = this._projects();
    return projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  });
}

// 👤 User-specific state service  
@Injectable({ providedIn: 'root' })
export class UserStateService {
  // User-related state only
}

// 🎨 UI-specific state service
@Injectable({ providedIn: 'root' })
export class UIStateService {
  // UI state only
}
```

## 📊 GUÍA DE MIGRACIÓN PASO A PASO

### Paso 1: Identificar Candidatos
```typescript
// ✅ Buenos candidatos para migración
- BehaviorSubject para estado simple
- Computed values con pipe + map
- Estado local de componentes
- Contadores, flags, objetos simples

// ❌ NO migrar (mantener RxJS)
- HTTP requests con retry/timeout
- Búsquedas con debounce complejas
- Streams de eventos con múltiples operadores
- WebSocket connections
```

### Paso 2: Migración Gradual
```typescript
// 🔄 Mantener ambos durante transición
@Injectable({ providedIn: 'root' })
export class TransitionService {
  // RxJS legacy
  private dataSubject = new BehaviorSubject([]);
  data$ = this.dataSubject.asObservable();
  
  // New Signals
  private dataSignal = signal([]);
  data = this.dataSignal.asReadonly();
  
  // Bridge during transition
  constructor() {
    this.data$.subscribe(data => this.dataSignal.set(data));
  }
}
```

### Paso 3: Testing y Validación
```typescript
// 🧪 Comparar comportamiento
it('should have same behavior in both implementations', () => {
  // Test old RxJS way
  const oldService = new OldCartService();
  
  // Test new Signals way  
  const newService = new NewCartService();
  
  // Compare results
  expect(newService.totalItems()).toBe(oldService.totalItems$.value);
});
```

## 🚨 ERRORES COMUNES EN MIGRACIÓN

### ❌ Error 1: Migrar todo de una vez
```typescript
// MAL - Big bang migration
// Migrar toda la app en una sesión

// BIEN - Migración incremental
// Migrar feature por feature, service por service
```

### ❌ Error 2: No considerar interoperabilidad  
```typescript
// MAL - Asumir que no puede coexistir
// BIEN - Usar toSignal() y toObservable() bridges
```

### ❌ Error 3: Migrar casos complejos innecesariamente
```typescript
// MAL - Forzar Signals donde RxJS es mejor
searchWithComplexLogic$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(), 
  switchMap(term => this.complexSearch(term)),
  retry(3),
  catchError(this.handleError),
  shareReplay(1)
);

// Esto NO debe migrarse - RxJS es perfecto aquí
```

## 🏁 EVALUACIÓN FINAL

Al completar todos los laboratorios deberías poder:

1. ✅ **LAB 0:** Configurar entorno profesional de desarrollo
2. ✅ **LAB 1:** Dominar asincronía: callbacks, promises, async/await
3. ✅ **LAB 2:** Implementar programación reactiva con RxJS
4. ✅ **LAB 3:** Crear aplicaciones con Angular Signals
5. ✅ **LAB 4:** Migrar código legacy y arquitectura híbrida

### 🎯 Competencias Profesionales Desarrolladas

- **Programación Asíncrona Experta:** Manejar operaciones concurrentes eficientemente
- **Arquitectura Reactiva:** Diseñar aplicaciones que reaccionan inteligentemente
- **Migración de Código:** Modernizar aplicaciones legacy sin romper funcionalidad
- **Estado Global:** Crear arquitecturas escalables sin over-engineering
- **Best Practices:** Aplicar patrones profesionales en proyectos reales

---

> *"Han completado un viaje intenso por el corazón de la programación reactiva moderna. Hoy no solo aprendieron sintaxis; absorbieron paradigmas. La asincronía ya no es un misterio sino una herramienta. Son la nueva generación de desarrolladores Angular."* - Ing. Jhonny Ramirez

**¡Felicitaciones! Has dominado la programación reactiva moderna y estás listo para construir el futuro de las aplicaciones web! 🚀✨**