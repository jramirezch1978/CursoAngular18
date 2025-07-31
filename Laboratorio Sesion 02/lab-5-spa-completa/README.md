# 🏗️ LAB 5: SPA COMPLETA CON NAVEGACIÓN
**⏱️ Duración: 35 minutos | 🎯 Nivel: Avanzado**

---

## 📋 DESCRIPCIÓN

Este laboratorio final es donde todo se une para crear algo verdaderamente impresionante. Es como ser el arquitecto que, después de diseñar los cimientos, las columnas, y los sistemas internos, finalmente ve el edificio completo funcionando como una unidad cohesiva.

**Analogía de la ciudad moderna:**
- **Layout responsivo:** Como una ciudad que se adapta automáticamente al número de habitantes
- **Header dinámico:** Como un centro de información que cambia según el contexto
- **State management:** Como el sistema nervioso central que conecta todos los servicios urbanos
- **Navegación fluida:** Como un sistema de transporte que lleva a las personas exactamente donde necesitan ir

En este laboratorio construirás una Single Page Application que rivalizará con cualquier aplicación empresarial moderna.

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al completar este laboratorio, serás capaz de:

✅ **Crear layout profesional responsivo**
- Header dinámico con autenticación
- Sidebar navigation adaptable
- Footer informativo con estadísticas
- Responsive design para todos los dispositivos

✅ **Integrar autenticación completa**
- Login/logout con feedback visual
- Menús dinámicos según roles
- Protección de rutas sensibles
- Persistencia de sesión

✅ **Implementar estado global avanzado**
- Comunicación entre todos los componentes
- Notificaciones en tiempo real
- Loading states coordinados
- Error handling centralizado

✅ **Optimizar UX/UI profesional**
- Animaciones y transiciones suaves
- Feedback visual inmediato
- Estados de carga elegantes
- Navegación intuitiva

---

## 🧠 CONCEPTOS CLAVE

### 🏗️ Arquitectura SPA Moderna

Una SPA bien arquitecturada sigue principios de diseño escalables:

```
├── Core Services (Singleton)
│   ├── AuthService - Gestión de autenticación
│   ├── LoggerService - Logging centralizado
│   └── NotificationService - Mensajes al usuario
│
├── Feature Modules
│   ├── User Management - CRUD de usuarios
│   ├── Project Management - Gestión de proyectos
│   └── Admin Panel - Configuración avanzada
│
├── Shared Components
│   ├── Header - Navegación principal
│   ├── Sidebar - Navegación lateral
│   ├── Footer - Información del sistema
│   └── Modals - Diálogos reutilizables
│
└── Layout System
    ├── Responsive Grid
    ├── Theme Management
    └── Animation System
```

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### PASO 1: Actualizar Header con Autenticación (8 minutos)

#### 1.1 Actualizar header.component.ts

**Archivo: `src/app/components/header/header.component.ts`**
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  isAuthenticated = false;
  showUserMenu = false;
  
  private authSubscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.subscribeToAuth();
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  private subscribeToAuth(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.logger.debug('HeaderComponent', 'Usuario actualizado en header', user?.username);
    });

    const authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.logger.debug('HeaderComponent', `Estado auth: ${isAuth}`);
    });

    this.authSubscription.add(userSub);
    this.authSubscription.add(authSub);
  }

  quickLoginAsUser(): void {
    this.authService.quickLogin('user');
    this.showUserMenu = false;
  }

  quickLoginAsAdmin(): void {
    this.authService.quickLogin('admin');
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/dashboard']);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
    this.showUserMenu = false;
  }

  canAccessAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getUserDisplayName(): string {
    return this.currentUser?.username || 'Usuario';
  }

  getUserRole(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role === 'admin' ? 'Administrador' : 'Usuario';
  }
}
```

#### 1.2 Actualizar header.component.html

**Archivo: `src/app/components/header/header.component.html`**
```html
<header class="app-header">
  <div class="header-container">
    <div class="header-left">
      <div class="logo-section">
        <h1 routerLink="/dashboard" class="logo-link">🏗️ PROVIAS</h1>
        <span class="subtitle">Sistema de Gestión v18</span>
      </div>
    </div>

    <nav class="header-nav">
      <a routerLink="/dashboard" 
         routerLinkActive="active" 
         [routerLinkActiveOptions]="{exact: true}"
         class="nav-link">
        📊 Dashboard
      </a>
      
      <a routerLink="/users" 
         routerLinkActive="active"
         class="nav-link">
        👥 Usuarios
      </a>
      
      <a routerLink="/projects" 
         routerLinkActive="active"
         class="nav-link">
        🏗️ Proyectos
      </a>

      @if (canAccessAdmin()) {
        <a routerLink="/admin" 
           routerLinkActive="active"
           class="nav-link admin-link">
          ⚙️ Admin
        </a>
      }
    </nav>

    <div class="header-right">
      @if (!isAuthenticated) {
        <div class="auth-buttons">
          <button class="btn btn-sm btn-primary" (click)="quickLoginAsUser()">
            👤 Login Usuario
          </button>
          <button class="btn btn-sm btn-success" (click)="quickLoginAsAdmin()">
            👑 Login Admin
          </button>
        </div>
      } @else {
        <div class="user-menu" [class.open]="showUserMenu">
          <button class="user-button" (click)="toggleUserMenu()">
            <div class="user-avatar">{{ currentUser?.username?.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <span class="user-name">{{ getUserDisplayName() }}</span>
              <small class="user-role">{{ getUserRole() }}</small>
            </div>
            <span class="dropdown-arrow">{{ showUserMenu ? '↑' : '↓' }}</span>
          </button>

          @if (showUserMenu) {
            <div class="user-dropdown">
              <div class="dropdown-header">
                <strong>{{ currentUser?.email }}</strong>
              </div>
              
              <div class="dropdown-items">
                @if (canAccessAdmin()) {
                  <button class="dropdown-item" (click)="navigateToAdmin()">
                    ⚙️ Panel Admin
                  </button>
                }
                
                <button class="dropdown-item" (click)="logout()">
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  </div>

  <!-- Auth Status Indicator -->
  <div class="auth-status" [class]="isAuthenticated ? 'authenticated' : 'unauthenticated'">
    @if (isAuthenticated) {
      <span class="status-indicator">🟢 Autenticado como {{ getUserRole() }}</span>
    } @else {
      <span class="status-indicator">🔴 No autenticado - Usa Quick Login para probar guards</span>
    }
  </div>
</header>
```

### PASO 2: Crear Layout Principal Integrado (10 minutos)

#### 2.1 Actualizar app.component.ts

**Archivo: `src/app/app.component.ts`**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { LoggerService } from './services/logger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent, 
    NavigationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'PROVIAS - Sistema de Gestión Angular v18';
  currentRoute = '';
  isLoading = false;

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.info('AppComponent', 'Aplicación SPA inicializada completamente');
    this.setupRouterLogging();
  }

  private setupRouterLogging(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.logger.info('AppComponent', `Navegación SPA completada: ${this.currentRoute}`);
        
        // Scroll to top en navegación
        window.scrollTo(0, 0);
      });
  }
}
```

#### 2.2 Actualizar app.component.html

**Archivo: `src/app/app.component.html`**
```html
<div class="app-layout">
  <app-header></app-header>
  
  <div class="app-body">
    <aside class="app-sidebar">
      <app-navigation></app-navigation>
    </aside>
    
    <main class="app-main">
      <div class="route-animation-container">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>
  
  <app-footer></app-footer>
</div>
```

#### 2.3 Actualizar app.component.scss

**Archivo: `src/app/app.component.scss`**
```scss
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.app-sidebar {
  width: 280px;
  background: #2c3e50;
  color: white;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.app-main {
  flex: 1;
  background: #ffffff;
  overflow-y: auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

// Animación de entrada para rutas
.route-animation-container {
  animation: slideInFromRight 0.3s ease-out;
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### PASO 3: Crear Footer con Estado Global (7 minutos)

#### 3.1 Generar componente de estado global
```bash
ng generate component shared/app-status --standalone
```

#### 3.2 Implementar footer.component.html actualizado

**Archivo: `src/app/components/footer/footer.component.html`**
```html
<footer class="app-footer">
  <div class="footer-container">
    <div class="footer-content">
      <div class="company-info">
        <h3>PROVIAS DESCENTRALIZADO</h3>
        <p>Sistema de Gestión con Angular 18</p>
        <small>Laboratorio Sesión 2 - Componentes y Enrutamiento</small>
      </div>
      
      <div class="tech-stack">
        <h4>Stack Tecnológico</h4>
        <ul>
          <li>✅ Angular 18.x</li>
          <li>✅ TypeScript 5.x</li>
          <li>✅ RxJS 7.x</li>
          <li>✅ Angular Router</li>
          <li>✅ Standalone Components</li>
        </ul>
      </div>
      
      <div class="features-demo">
        <h4>Features Implementadas</h4>
        <ul>
          <li>🔄 Lifecycle Hooks</li>
          <li>📡 Component Communication</li>
          <li>🛣️ Angular Router</li>
          <li>🛡️ Route Guards</li>
          <li>🏗️ SPA Completa</li>
        </ul>
      </div>
      
      <div class="app-status">
        <h4>Estado de la App</h4>
        <app-status></app-status>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 PROVIAS - Curso Angular v18 - Sesión 2 Completada ✅</p>
      <small>Instructor: Ing. Jhonny Alexander Ramirez Chiroque</small>
    </div>
  </div>
</footer>
```

### PASO 4: Integración Final y Optimizaciones (10 minutos)

#### 4.1 Crear estilos globales profesionales

**Archivo: `src/styles.scss`**
```scss
/* Reset y base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

/* Layout principal */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .main-content {
    flex: 1;
    background-color: #ffffff;
  }
}

/* Botones globales */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: #007bff;
    color: white;
    &:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-1px);
    }
  }

  &.btn-success {
    background: #28a745;
    color: white;
    &:hover:not(:disabled) {
      background: #1e7e34;
      transform: translateY(-1px);
    }
  }

  &.btn-warning {
    background: #ffc107;
    color: #212529;
    &:hover:not(:disabled) {
      background: #e0a800;
      transform: translateY(-1px);
    }
  }

  &.btn-danger {
    background: #dc3545;
    color: white;
    &:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
    }
  }

  &.btn-secondary {
    background: #6c757d;
    color: white;
    &:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-1px);
    }
  }

  &.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}

/* Formularios globales */
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #495057;
  }
}

/* Cards globales */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

/* Utilidades */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-center { text-align: center; }
.mt-1 { margin-top: 1rem; }
.mt-2 { margin-top: 2rem; }
.mb-1 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 2rem; }
.p-1 { padding: 1rem; }
.p-2 { padding: 2rem; }

/* Loading spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animaciones para rutas */
.route-animation-container {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## ✅ RESULTADO FINAL LAB 5

- ✅ SPA completamente funcional con todas las características
- ✅ Header con autenticación y menús dinámicos
- ✅ Sidebar navigation responsiva
- ✅ Layout profesional con animaciones
- ✅ Estado global monitoreado en tiempo real
- ✅ Todas las comunicaciones funcionando perfectamente
- ✅ Guards de seguridad implementados y probados
- ✅ Rutas parametrizadas con manejo de errores
- ✅ Estilos profesionales y responsive design

---

## 🎊 FELICITACIONES - SESIÓN 2 COMPLETADA

**¡Has construido una aplicación Angular profesional completa!**

### 🏆 Lo que has logrado:
- **5 laboratorios** completados con éxito
- **Arquitectura empresarial** implementada
- **Comunicación reactiva** dominada
- **Navegación SPA** profesional
- **Sistema de seguridad** robusto
- **UI/UX** de nivel comercial

### 🚀 Próximos pasos recomendados:
1. **Experimenta** con la aplicación creada
2. **Personaliza** estilos y funcionalidades
3. **Agrega** nuevas características
4. **Prepárate** para la Sesión 3: Data Binding y Pipes

**¡Excelente trabajo dominando Angular v18! 🎉**