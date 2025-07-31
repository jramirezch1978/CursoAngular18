# 🛡️ LAB 4: RUTAS AVANZADAS Y GUARDS
**⏱️ Duración: 30 minutos | 🎯 Nivel: Intermedio-Avanzado**

---

## 📋 DESCRIPCIÓN

Los Route Guards en Angular son como el sistema de seguridad de un edificio corporativo de alta tecnología. Imaginen un edificio donde diferentes pisos requieren diferentes niveles de acceso: el primer piso es público, el décimo piso requiere tarjeta de empleado, y el piso ejecutivo requiere autorización especial.

**Analogía del sistema de seguridad multicapa:**
- **CanActivate:** Como el checkpoint principal en la entrada - verifica credenciales básicas
- **CanDeactivate:** Como el protocolo de salida segura - verifica que no te lleves documentos clasificados
- **Resolve:** Como asistentes que preparan toda la información antes de una reunión importante
- **Lazy Loading:** Como tener un edificio donde solo se encienden las luces cuando alguien las necesita

En este laboratorio implementarás un sistema completo de seguridad y optimización para tu aplicación Angular.

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al completar este laboratorio, serás capaz de:

✅ **Implementar sistema de autenticación completo**
- Crear AuthService con persistencia localStorage
- Manejar estados de autenticación reactivos
- Implementar login/logout con datos mock

✅ **Configurar Guards de seguridad**
- CanActivate para proteger rutas que requieren autenticación
- CanActivate con roles para autorización específica
- CanDeactivate para prevenir pérdida de datos no guardados

✅ **Implementar Lazy Loading**
- Cargar componentes bajo demanda
- Optimizar tiempo de carga inicial
- Code splitting automático

✅ **Crear resolvers de datos**
- Precargar datos antes de mostrar componentes
- Manejar estados de carga elegantemente
- Resolver dependencias de datos

---

## 🧠 CONCEPTOS CLAVE

### 🛡️ ¿Qué son los Route Guards?

**Los Route Guards** son funciones que determinan si una navegación puede proceder o debe ser bloqueada. Son como filtros de seguridad que se ejecutan antes de mostrar un componente.

#### Tipos de Guards:

```typescript
// ✅ CanActivate - ¿Puede acceder a esta ruta?
const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

// 🚪 CanDeactivate - ¿Puede salir de esta ruta?
const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (component) => {
  return !component.hasUnsavedChanges();
};

// 📊 Resolve - Carga datos antes de mostrar el componente
const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  return userService.getUser(route.params['id']);
};
```

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### PASO 1: Crear Authentication Service (8 minutos)

#### 1.1 Generar service de autenticación
```bash
ng generate service services/auth
```

#### 1.2 Implementar auth.service.ts

**Archivo: `src/app/services/auth.service.ts`**
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { LoggerService } from './logger.service';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  permissions: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Usuarios mock para demo
  private mockUsers: AuthUser[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@provias.gob.pe',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 2,
      username: 'user',
      email: 'user@provias.gob.pe',
      role: 'user',
      permissions: ['read', 'write']
    }
  ];

  constructor(private logger: LoggerService) {
    this.checkStoredAuth();
  }

  // Observables públicos
  get currentUser$(): Observable<AuthUser | null> {
    return this.currentUserSubject.asObservable();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Getters síncronos
  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Métodos de autenticación
  login(credentials: LoginCredentials): Observable<{ success: boolean; user?: AuthUser; error?: string }> {
    this.logger.info('AuthService', `Intento de login para: ${credentials.username}`);
    
    return of(null).pipe(
      delay(1000),
      (() => {
        const user = this.mockUsers.find(u => 
          u.username === credentials.username && 
          credentials.password === 'password123'
        );

        if (user) {
          this.setAuthenticatedUser(user);
          return of({ success: true, user });
        } else {
          this.logger.warn('AuthService', 'Credenciales inválidas');
          return of({ success: false, error: 'Credenciales inválidas' });
        }
      })()
    );
  }

  logout(): void {
    this.logger.info('AuthService', 'Usuario deslogueado');
    this.clearAuth();
  }

  // Simular login rápido para demo
  quickLogin(role: 'admin' | 'user' = 'user'): void {
    const user = this.mockUsers.find(u => u.role === role);
    if (user) {
      this.setAuthenticatedUser(user);
      this.logger.info('AuthService', `Quick login como ${role}`);
    }
  }

  // Verificar permisos
  hasPermission(permission: string): boolean {
    const user = this.currentUser;
    return user ? user.permissions.includes(permission) : false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user ? user.role === role : false;
  }

  // Métodos privados
  private setAuthenticatedUser(user: AuthUser): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    
    this.logger.info('AuthService', `Usuario autenticado: ${user.username}`, user);
  }

  private clearAuth(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    localStorage.removeItem('authUser');
    localStorage.removeItem('isAuthenticated');
  }

  private checkStoredAuth(): void {
    const storedUser = localStorage.getItem('authUser');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      try {
        const user: AuthUser = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.logger.info('AuthService', 'Sesión restaurada desde localStorage', user.username);
      } catch (error) {
        this.logger.error('AuthService', 'Error restaurando sesión', error);
        this.clearAuth();
      }
    }
  }
}
```

### PASO 2: Crear Route Guards (10 minutos)

#### 2.1 Generar guards
```bash
ng generate guard guards/auth
ng generate guard guards/admin
ng generate guard guards/unsaved-changes
```

#### 2.2 Implementar auth.guard.ts

**Archivo: `src/app/guards/auth.guard.ts`**
```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  logger.info('AuthGuard', `Verificando acceso a: ${state.url}`);

  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        logger.info('AuthGuard', 'Acceso permitido - Usuario autenticado');
        return true;
      } else {
        logger.warn('AuthGuard', 'Acceso denegado - Usuario no autenticado');
        alert('Debes estar autenticado para acceder a esta página.\\nUsa el botón "Quick Login" en el header.');
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
```

#### 2.3 Implementar admin.guard.ts

**Archivo: `src/app/guards/admin.guard.ts`**
```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  logger.info('AdminGuard', `Verificando permisos de admin para: ${state.url}`);

  return authService.currentUser$.pipe(
    map(user => {
      if (user && user.role === 'admin') {
        logger.info('AdminGuard', 'Acceso permitido - Usuario es administrador');
        return true;
      } else {
        logger.warn('AdminGuard', 'Acceso denegado - Usuario no es administrador');
        alert('Necesitas permisos de administrador para acceder a esta página.');
        router.navigate(['/dashboard']);
        return false;
      }
    })
  );
};
```

#### 2.4 Implementar unsaved-changes.guard.ts

**Archivo: `src/app/guards/unsaved-changes.guard.ts`**
```typescript
import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';

export interface ComponentCanDeactivate {
  canDeactivate(): boolean;
  hasUnsavedChanges?(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = (component, currentRoute, currentState, nextState) => {
  const logger = inject(LoggerService);

  logger.info('UnsavedChangesGuard', `Verificando cambios no guardados al salir de: ${currentState?.url}`);

  if (!component.canDeactivate) {
    return true;
  }

  const canDeactivate = component.canDeactivate();
  
  if (!canDeactivate) {
    logger.warn('UnsavedChangesGuard', 'Usuario intentó salir con cambios no guardados');
    const confirmExit = confirm(
      '¿Estás seguro de que quieres salir?\\nTienes cambios no guardados que se perderán.'
    );
    
    if (confirmExit) {
      logger.info('UnsavedChangesGuard', 'Usuario confirmó salida con pérdida de datos');
    } else {
      logger.info('UnsavedChangesGuard', 'Usuario canceló salida');
    }
    
    return confirmExit;
  }

  return true;
};
```

### PASO 3: Crear Componente Admin con Lazy Loading (7 minutos)

#### 3.1 Generar componente admin
```bash
ng generate component pages/admin --standalone
```

#### 3.2 Implementar admin.component.ts

**Archivo: `src/app/pages/admin/admin.component.ts`**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoggerService } from '../../services/logger.service';
import { ComponentCanDeactivate } from '../../guards/unsaved-changes.guard';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, ComponentCanDeactivate {
  hasUnsavedData = false;
  formData = {
    systemName: 'PROVIAS System',
    version: '1.0.0',
    maintainanceMode: false
  };

  constructor(
    private authService: AuthService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.info('AdminComponent', 'Panel de administración cargado');
  }

  // Implementación del guard
  canDeactivate(): boolean {
    return !this.hasUnsavedData;
  }

  hasUnsavedChanges(): boolean {
    return this.hasUnsavedData;
  }

  onDataChange(): void {
    this.hasUnsavedData = true;
    this.logger.debug('AdminComponent', 'Datos modificados - cambios no guardados');
  }

  saveChanges(): void {
    setTimeout(() => {
      this.hasUnsavedData = false;
      this.logger.info('AdminComponent', 'Cambios guardados exitosamente');
      alert('Configuración guardada exitosamente');
    }, 1000);
  }

  discardChanges(): void {
    this.hasUnsavedData = false;
    this.logger.info('AdminComponent', 'Cambios descartados');
    this.formData = {
      systemName: 'PROVIAS System',
      version: '1.0.0',
      maintainanceMode: false
    };
  }

  get currentUser() {
    return this.authService.currentUser;
  }
}
```

### PASO 4: Actualizar Rutas con Guards (5 minutos)

#### 4.1 Completar app.routes.ts con guards y lazy loading

**Archivo: `src/app/app.routes.ts`**
```typescript
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    title: 'Dashboard - PROVIAS'
  },
  { 
    path: 'users', 
    component: UsersComponent,
    title: 'Gestión de Usuarios - PROVIAS',
    canActivate: [authGuard]
  },
  { 
    path: 'users/:id', 
    component: UsersComponent,
    title: 'Detalle de Usuario - PROVIAS',
    canActivate: [authGuard]
  },
  { 
    path: 'projects', 
    component: ProjectsComponent,
    title: 'Proyectos - PROVIAS',
    canActivate: [authGuard]
  },
  { 
    path: 'projects/:id', 
    component: ProjectsComponent,
    title: 'Detalle de Proyecto - PROVIAS',
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    title: 'Administración - PROVIAS',
    canActivate: [authGuard, adminGuard],
    canDeactivate: [unsavedChangesGuard]
  },
  { 
    path: '404', 
    component: NotFoundComponent,
    title: 'Página no encontrada - PROVIAS'
  },
  { 
    path: '**', 
    redirectTo: '/404' 
  }
];
```

## ✅ RESULTADO ESPERADO LAB 4

- ✅ AuthService implementado con persistencia localStorage
- ✅ Guards de autenticación y autorización funcionando
- ✅ Guard de cambios no guardados implementado
- ✅ Lazy loading en ruta admin
- ✅ Navegación protegida por roles
- ✅ Demo completo de guards en funcionamiento

---

## 🔄 PRÓXIMO PASO

**Continúa con:** [LAB 5: SPA Completa con Navegación](../lab-5-spa-completa/README.md)

En el próximo laboratorio integrarás todos los componentes en una SPA profesional completa.