# 🛣️ LAB 3: ANGULAR ROUTER - CONFIGURACIÓN BÁSICA
**⏱️ Duración: 30 minutos | 🎯 Nivel: Intermedio**

---

## 📋 DESCRIPCIÓN

Angular Router es como el sistema de navegación GPS de una ciudad moderna. Así como un GPS conoce todas las calles y puede llevarte de cualquier punto A a cualquier punto B de manera eficiente, Angular Router conoce todos los componentes de tu aplicación y puede mostrar el correcto según la URL que el usuario visite.

**Analogía del sistema de transporte urbano:**
- **Rutas básicas:** Como las líneas principales del metro - conectan destinos importantes
- **Rutas parametrizadas:** Como buses con rutas flexibles que pueden parar en diferentes ubicaciones
- **Navigation component:** Como las señalizaciones que te indican dónde estás y hacia dónde puedes ir
- **404 handling:** Como tener mapas actualizados que te redirigen cuando una calle no existe

En este laboratorio transformarás tu aplicación de componentes individuales en una verdadera Single Page Application con navegación fluida y profesional.

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al completar este laboratorio, serás capaz de:

✅ **Configurar rutas básicas de Angular Router**
- Definir rutas principales para diferentes secciones
- Implementar redirecciones automáticas y rutas por defecto
- Configurar títulos dinámicos de página

✅ **Implementar rutas parametrizadas dinámicas**
- Crear rutas que aceptan parámetros (ej: /users/:id)
- Acceder y utilizar parámetros de ruta en componentes
- Manejar parámetros opcionales y query parameters

✅ **Crear sistema de navegación profesional**
- Desarrollar navigation component con RouterLink
- Implementar RouterLinkActive para estados visuales
- Crear breadcrumb navigation dinámico

✅ **Manejar rutas no encontradas (404)**
- Configurar wildcard routes para casos no contemplados
- Crear página 404 user-friendly con opciones de navegación
- Implementar redirecciones inteligentes

---

## 🧠 CONCEPTOS CLAVE

### 🛣️ ¿Qué es Angular Router?

**Angular Router** es el sistema de navegación oficial de Angular que permite crear Single Page Applications (SPAs) con múltiples vistas. En lugar de recargar páginas completas como las aplicaciones web tradicionales, Angular Router actualiza dinámicamente el contenido de la página.

#### Ventajas de SPA con Angular Router:
```typescript
// ✅ Navegación instantánea
// Sin recarga de página → Experiencia fluida como app móvil

// ✅ Estado preservado
// Variables, forms, scroll position se mantienen

// ✅ Mejor UX
// Transiciones suaves, menos tiempo de carga

// ✅ SEO y bookmarking
// URLs específicas para cada vista
```

### 🗺️ Estructura de Rutas Angular

#### Configuración básica de rutas:
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];
```

#### Tipos de rutas:

| Tipo | Ejemplo | Descripción |
|------|---------|-------------|
| **Básica** | `/dashboard` | Ruta fija hacia un componente |
| **Parametrizada** | `/users/:id` | Ruta con parámetros dinámicos |
| **Redirect** | `{ path: '', redirectTo: '/home' }` | Redirección automática |
| **Wildcard** | `{ path: '**', component: NotFound }` | Captura todas las rutas no definidas |

---

## 📚 FUNDAMENTOS TEÓRICOS

### 🔍 Anatomía del Angular Router

#### 1. Route Configuration
```typescript
interface Route {
  path?: string;              // URL pattern
  component?: Type<any>;      // Componente a mostrar
  redirectTo?: string;        // Redirección
  pathMatch?: string;         // Estrategia de matching
  title?: string;            // Título de la página
  data?: any;                // Datos estáticos
  resolve?: any;             // Data resolvers
  canActivate?: any[];       // Guards de activación
}
```

#### 2. RouterOutlet
```html
<!-- router-outlet es donde se renderizan los componentes -->
<div class="app-layout">
  <header>Navigation</header>
  <main>
    <router-outlet></router-outlet> <!-- Aquí aparecen los componentes -->
  </main>
  <footer>Footer</footer>
</div>
```

#### 3. Navigation Directives
```html
<!-- RouterLink: navegación declarativa -->
<a routerLink="/users">Usuarios</a>
<a [routerLink]="['/users', userId]">Usuario específico</a>

<!-- RouterLinkActive: estado visual activo -->
<a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
```

#### 4. Programmatic Navigation
```typescript
// Router service: navegación programática
constructor(private router: Router) {}

navigateToUser(id: number) {
  this.router.navigate(['/users', id]);
}

// Con query parameters y fragments
this.router.navigate(['/users'], { 
  queryParams: { page: 2, sort: 'name' },
  fragment: 'top'
});
```

### 🎯 Parámetros de Ruta

#### Acceder a parámetros:
```typescript
// ActivatedRoute: información de la ruta actual
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  // Parámetros de ruta (/users/:id)
  const id = this.route.snapshot.params['id'];
  
  // Observable para cambios dinámicos
  this.route.params.subscribe(params => {
    const id = params['id'];
    this.loadUser(id);
  });
  
  // Query parameters (?page=2&sort=name)
  this.route.queryParams.subscribe(queryParams => {
    const page = queryParams['page'];
    const sort = queryParams['sort'];
  });
}
```

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### PASO 1: Configurar Rutas Principales (8 minutos)

#### 1.1 Crear componentes de páginas
```bash
# Crear páginas principales en carpeta pages
ng generate component pages/dashboard --standalone
ng generate component pages/users --standalone  
ng generate component pages/projects --standalone
ng generate component pages/not-found --standalone
```

#### 1.2 Configurar app.routes.ts

**Archivo: `src/app/app.routes.ts`**
```typescript
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

/**
 * 🛣️ Configuración de rutas principales de la aplicación
 * Define cómo Angular Router mapea URLs a componentes
 */
export const routes: Routes = [
  // 🏠 Ruta raíz - redirige al dashboard
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  
  // 📊 Dashboard principal
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    title: 'Dashboard - PROVIAS',
    data: { 
      breadcrumb: 'Dashboard',
      description: 'Panel principal con estadísticas y accesos rápidos'
    }
  },
  
  // 👥 Gestión de usuarios
  { 
    path: 'users', 
    component: UsersComponent,
    title: 'Gestión de Usuarios - PROVIAS',
    data: { 
      breadcrumb: 'Usuarios',
      description: 'Administración completa de usuarios del sistema'
    }
  },
  
  // 👤 Detalle específico de usuario (ruta parametrizada)
  { 
    path: 'users/:id', 
    component: UsersComponent,
    title: 'Detalle de Usuario - PROVIAS',
    data: { 
      breadcrumb: 'Detalle Usuario',
      description: 'Información detallada de un usuario específico'
    }
  },
  
  // 🏗️ Gestión de proyectos
  { 
    path: 'projects', 
    component: ProjectsComponent,
    title: 'Proyectos - PROVIAS',
    data: { 
      breadcrumb: 'Proyectos',
      description: 'Administración de proyectos de infraestructura'
    }
  },
  
  // 📋 Detalle específico de proyecto (ruta parametrizada)
  { 
    path: 'projects/:id', 
    component: ProjectsComponent,
    title: 'Detalle de Proyecto - PROVIAS',
    data: { 
      breadcrumb: 'Detalle Proyecto',
      description: 'Información detallada de un proyecto específico'
    }
  },
  
  // 🚧 Página 404 personalizada
  { 
    path: '404', 
    component: NotFoundComponent,
    title: 'Página no encontrada - PROVIAS',
    data: { 
      breadcrumb: '404',
      description: 'La página solicitada no existe'
    }
  },
  
  // ⭐ Wildcard route - debe ser la última
  // Captura todas las rutas no definidas y redirige a 404
  { 
    path: '**', 
    redirectTo: '/404' 
  }
];
```

---

### PASO 2: Crear Navigation Component (10 minutos)

#### 2.1 Generar componente de navegación
```bash
# Crear componente de navegación en shared
ng generate component shared/navigation --standalone
```

#### 2.2 Implementar navigation.component.ts

**Archivo: `src/app/shared/navigation/navigation.component.ts`**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../services/logger.service';

/**
 * 🧭 Interface para definir elementos de navegación
 */
interface NavItem {
  path: string;           // Ruta de destino
  label: string;          // Texto a mostrar
  icon: string;          // Emoji o icono
  exactMatch?: boolean;   // Matching exacto para RouterLinkActive
  description?: string;   // Descripción tooltip
  badge?: string;        // Badge opcional (ej: "Nuevo")
}

/**
 * 📍 Interface para breadcrumb items
 */
interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, OnDestroy {
  
  // 🧭 Elementos de navegación principal
  navItems: NavItem[] = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: '📊', 
      exactMatch: true,
      description: 'Panel principal con estadísticas'
    },
    { 
      path: '/users', 
      label: 'Usuarios', 
      icon: '👥',
      description: 'Gestión de usuarios del sistema'
    },
    { 
      path: '/projects', 
      label: 'Proyectos', 
      icon: '🏗️',
      description: 'Administración de proyectos'
    }
  ];

  // 📍 Estado de navegación
  currentRoute = '';
  breadcrumbs: BreadcrumbItem[] = [];
  
  // 🔄 Gestión de subscripciones
  private routerSubscription = new Subscription();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.info('NavigationComponent', 'Componente de navegación inicializado');
    this.subscribeToRouterEvents();
    this.updateCurrentRoute(this.router.url);
  }

  ngOnDestroy(): void {
    this.logger.info('NavigationComponent', 'Destruyendo componente de navegación');
    this.routerSubscription.unsubscribe();
  }

  // 🔄 Suscripción a eventos del router

  /**
   * 📡 Suscribirse a cambios de ruta para actualizar estado
   */
  private subscribeToRouterEvents(): void {
    const navigationSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentRoute(event.urlAfterRedirects);
        this.updateBreadcrumbs();
        
        this.logger.info('NavigationComponent', `Navegación completada: ${event.urlAfterRedirects}`, {
          url: event.urlAfterRedirects,
          previousUrl: event.url
        });
      });
    
    this.routerSubscription.add(navigationSubscription);
  }

  /**
   * 🎯 Actualizar ruta actual
   */
  private updateCurrentRoute(url: string): void {
    this.currentRoute = url;
    this.logger.debug('NavigationComponent', `Ruta actualizada: ${url}`);
  }

  /**
   * 📍 Generar breadcrumbs dinámicos
   */
  private updateBreadcrumbs(): void {
    this.breadcrumbs = [];
    
    // Siempre incluir Dashboard como base
    this.breadcrumbs.push({
      label: 'Dashboard',
      url: '/dashboard',
      isActive: this.currentRoute === '/dashboard' || this.currentRoute === '/'
    });
    
    // Analizar ruta actual para construir breadcrumbs
    const urlSegments = this.currentRoute.split('/').filter(segment => segment);
    
    if (urlSegments.length > 1) {
      const mainSection = urlSegments[1];
      
      // Agregar sección principal
      switch (mainSection) {
        case 'users':
          this.breadcrumbs.push({
            label: 'Usuarios',
            url: '/users',
            isActive: urlSegments.length === 2
          });
          
          // Si hay ID específico
          if (urlSegments.length === 3) {
            this.breadcrumbs.push({
              label: `Usuario #${urlSegments[2]}`,
              url: this.currentRoute,
              isActive: true
            });
          }
          break;
          
        case 'projects':
          this.breadcrumbs.push({
            label: 'Proyectos',
            url: '/projects',
            isActive: urlSegments.length === 2
          });
          
          // Si hay ID específico
          if (urlSegments.length === 3) {
            this.breadcrumbs.push({
              label: `Proyecto #${urlSegments[2]}`,
              url: this.currentRoute,
              isActive: true
            });
          }
          break;
          
        case '404':
          this.breadcrumbs.push({
            label: 'Página no encontrada',
            url: '/404',
            isActive: true
          });
          break;
      }
    }
    
    this.logger.debug('NavigationComponent', 'Breadcrumbs actualizados', this.breadcrumbs);
  }

  // 🎮 Métodos de navegación

  /**
   * 🧭 Navegación programática
   */
  navigateTo(path: string): void {
    this.logger.info('NavigationComponent', `Navegando programáticamente a: ${path}`);
    this.router.navigate([path]);
  }

  /**
   * ✅ Verificar si una ruta está activa
   */
  isActive(path: string): boolean {
    if (path === '/dashboard') {
      // Dashboard es activo solo si estamos exactamente en / o /dashboard
      return this.currentRoute === '/' || this.currentRoute === '/dashboard';
    }
    // Para otras rutas, verificar si la ruta actual comienza con el path
    return this.currentRoute.startsWith(path);
  }

  /**
   * 🎯 Obtener clase CSS para elemento de navegación activo
   */
  getNavItemClass(item: NavItem): string {
    const baseClasses = ['nav-link'];
    
    if (this.isActive(item.path)) {
      baseClasses.push('active');
    }
    
    return baseClasses.join(' ');
  }

  /**
   * 📍 Navegación via breadcrumb
   */
  navigateToBreadcrumb(breadcrumb: BreadcrumbItem): void {
    if (!breadcrumb.isActive) {
      this.logger.info('NavigationComponent', `Navegando via breadcrumb: ${breadcrumb.url}`);
      this.router.navigate([breadcrumb.url]);
    }
  }

  /**
   * 🏠 Ir al inicio (Dashboard)
   */
  goHome(): void {
    this.navigateTo('/dashboard');
  }

  /**
   * ← Ir atrás en el historial
   */
  goBack(): void {
    window.history.back();
    this.logger.info('NavigationComponent', 'Navegación hacia atrás usando history.back()');
  }

  /**
   * 🔍 Buscar y navegar (funcionalidad futura)
   */
  searchAndNavigate(query: string): void {
    // Funcionalidad de búsqueda que se puede implementar más adelante
    this.logger.info('NavigationComponent', `Búsqueda solicitada: ${query}`);
    
    // Ejemplo de lógica de búsqueda inteligente
    if (query.toLowerCase().includes('usuario')) {
      this.navigateTo('/users');
    } else if (query.toLowerCase().includes('proyecto')) {
      this.navigateTo('/projects');
    } else {
      // Buscar por ID numérico
      const id = parseInt(query);
      if (!isNaN(id)) {
        // Asumir que es un ID de usuario si es menor a 1000
        if (id < 1000) {
          this.navigateTo(`/users/${id}`);
        } else {
          this.navigateTo(`/projects/${id}`);
        }
      }
    }
  }

  // 🎨 Métodos de utilidad para el template

  /**
   * 📊 Obtener información de la ruta actual
   */
  getCurrentRouteInfo(): any {
    return {
      url: this.currentRoute,
      segments: this.currentRoute.split('/').filter(s => s),
      breadcrumbsCount: this.breadcrumbs.length,
      isHomePage: this.currentRoute === '/' || this.currentRoute === '/dashboard'
    };
  }

  /**
   * 🎯 Verificar si hay navegación disponible hacia atrás
   */
  canGoBack(): boolean {
    return window.history.length > 1;
  }
}
```

#### 2.3 Crear template navigation.component.html

**Archivo: `src/app/shared/navigation/navigation.component.html`**
```html
<nav class="main-navigation">
  <!-- 🏢 Brand/Logo section -->
  <div class="nav-brand">
    <button class="brand-link" (click)="goHome()">
      <h2>🏗️ PROVIAS</h2>
      <span class="nav-subtitle">Sistema de Gestión v18</span>
    </button>
  </div>

  <!-- 📍 Breadcrumb navigation -->
  <div class="breadcrumb-section">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (breadcrumb of breadcrumbs; track breadcrumb.url; let isLast = $last) {
        <span class="breadcrumb-item" [class.active]="breadcrumb.isActive">
          @if (!breadcrumb.isActive) {
            <button 
              class="breadcrumb-link"
              (click)="navigateToBreadcrumb(breadcrumb)"
              [title]="'Ir a ' + breadcrumb.label">
              {{ breadcrumb.label }}
            </button>
          } @else {
            <span class="breadcrumb-current">{{ breadcrumb.label }}</span>
          }
          
          @if (!isLast) {
            <span class="breadcrumb-separator">›</span>
          }
        </span>
      }
    </nav>
  </div>

  <!-- 🧭 Main navigation menu -->
  <ul class="nav-menu">
    @for (item of navItems; track item.path) {
      <li class="nav-item">
        <a 
          [routerLink]="item.path"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.exactMatch || false }"
          class="nav-link"
          [title]="item.description"
          [attr.aria-label]="item.label">
          
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
          
          @if (item.badge) {
            <span class="nav-badge">{{ item.badge }}</span>
          }
        </a>
      </li>
    }
  </ul>

  <!-- 🔧 Navigation utilities -->
  <div class="nav-utilities">
    <!-- Back button -->
    @if (canGoBack() && currentRoute !== '/' && currentRoute !== '/dashboard') {
      <button 
        class="utility-btn back-btn"
        (click)="goBack()"
        title="Ir atrás">
        ← Atrás
      </button>
    }
    
    <!-- Quick search (funcionalidad futura) -->
    <div class="quick-search">
      <input 
        type="text" 
        class="search-input"
        placeholder="Buscar (ej: usuario 123)"
        #searchInput
        (keyup.enter)="searchAndNavigate(searchInput.value)">
      <button 
        class="search-btn"
        (click)="searchAndNavigate(searchInput.value)"
        title="Buscar">
        🔍
      </button>
    </div>
  </div>

  <!-- 📊 Route information panel (para desarrollo/debug) -->
  <div class="route-info-panel">
    <h4>📍 Información de Ruta</h4>
    <div class="route-details">
      <div class="route-detail">
        <span class="detail-label">URL actual:</span>
        <code class="detail-value">{{ currentRoute || '/' }}</code>
      </div>
      
      <div class="route-detail">
        <span class="detail-label">Segmentos:</span>
        <span class="detail-value">{{ getCurrentRouteInfo().segments.length }}</span>
      </div>
      
      <div class="route-detail">
        <span class="detail-label">Breadcrumbs:</span>
        <span class="detail-value">{{ breadcrumbs.length }}</span>
      </div>
    </div>
    
    <!-- Demo de navegación programática -->
    <div class="navigation-demo">
      <h5>🎮 Demo de Navegación</h5>
      <div class="demo-buttons">
        <button class="demo-btn" (click)="navigateTo('/dashboard')">
          📊 Dashboard
        </button>
        <button class="demo-btn" (click)="navigateTo('/users')">
          👥 Usuarios
        </button>
        <button class="demo-btn" (click)="navigateTo('/users/123')">
          👤 Usuario #123
        </button>
        <button class="demo-btn" (click)="navigateTo('/projects')">
          🏗️ Proyectos
        </button>
        <button class="demo-btn" (click)="navigateTo('/invalid-route')">
          🚧 Ruta inválida (404)
        </button>
      </div>
    </div>
  </div>

  <!-- 💡 Información educativa sobre routing -->
  <div class="routing-concepts">
    <h4>💡 Conceptos de Angular Router</h4>
    <div class="concepts-list">
      <div class="concept-item">
        <span class="concept-icon">🛣️</span>
        <div class="concept-content">
          <strong>RouterLink:</strong>
          <p>Navegación declarativa en templates</p>
        </div>
      </div>
      
      <div class="concept-item">
        <span class="concept-icon">🎯</span>
        <div class="concept-content">
          <strong>RouterLinkActive:</strong>
          <p>Estado visual para enlaces activos</p>
        </div>
      </div>
      
      <div class="concept-item">
        <span class="concept-icon">🔧</span>
        <div class="concept-content">
          <strong>Router.navigate():</strong>
          <p>Navegación programática desde código</p>
        </div>
      </div>
      
      <div class="concept-item">
        <span class="concept-icon">📍</span>
        <div class="concept-content">
          <strong>ActivatedRoute:</strong>
          <p>Información de la ruta actual y parámetros</p>
        </div>
      </div>
    </div>
  </div>
</nav>
```

¿Te gustaría que continúe con los estilos del Navigation component y los componentes de páginas restantes del LAB 3?