import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

// Importar componentes principales
import { LoginComponent } from './components/login/login.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';

/**
 * 🛡️ Configuración de rutas para LAB 4 - Guards y Autenticación
 * 
 * Este archivo demuestra:
 * ✅ Guards de autenticación (AuthGuard)
 * ✅ Guards de autorización (AdminGuard)
 * ✅ Lazy loading de módulos
 * ✅ Protección de rutas sensibles
 * ✅ Manejo de errores de acceso
 * ✅ Rutas públicas y privadas
 */
export const routes: Routes = [
  // 🏠 Ruta raíz - Redirección inteligente
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // 🔑 Login - Ruta pública
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - PROVIAS'
  },
  
  // 🔒 Acceso denegado - Ruta pública (para mostrar errores)
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
    title: 'Acceso Denegado - PROVIAS'
  },
  
  // 🏠 Dashboard - Protegido con AuthGuard
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    title: 'Dashboard - PROVIAS'
  },
  
  // 👥 Usuarios - Protegido con AuthGuard
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard],
    title: 'Usuarios - PROVIAS'
  },
  
  // 👤 Detalles de usuario - Protegido con AuthGuard
  {
    path: 'users/:id',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard],
    title: 'Detalle Usuario - PROVIAS'
  },
  
  // ✏️ Editar usuario - Protegido con AuthGuard
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard],
    title: 'Editar Usuario - PROVIAS'
  },
  
  // ➕ Nuevo usuario - Protegido con AuthGuard
  {
    path: 'users/new',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [AuthGuard],
    title: 'Nuevo Usuario - PROVIAS'
  },
  
  // 🏗️ Proyectos - Protegido con AuthGuard
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard],
    title: 'Proyectos - PROVIAS'
  },
  
  // 🏗️ Detalles de proyecto - Protegido con AuthGuard
  {
    path: 'projects/:id',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard],
    title: 'Detalle Proyecto - PROVIAS'
  },
  
  // ✏️ Editar proyecto - Protegido con AuthGuard
  {
    path: 'projects/:id/edit',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard],
    title: 'Editar Proyecto - PROVIAS'
  },
  
  // ➕ Nuevo proyecto - Protegido con AuthGuard
  {
    path: 'projects/new',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard],
    title: 'Nuevo Proyecto - PROVIAS'
  },
  
  // 👑 Panel de Administración - Lazy Loading + AdminGuard
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard],
    title: 'Panel de Administración - PROVIAS',
    data: {
      requiredPermissions: ['admin:panel']
    }
  },
  
  // 👥 Gestión de usuarios del admin - Lazy Loading + AdminGuard
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard],
    title: 'Gestión de Usuarios - Admin PROVIAS',
    data: {
      requiredPermissions: ['admin:users']
    }
  },
  
  // ⚙️ Configuración del sistema - Lazy Loading + AdminGuard
  {
    path: 'admin/settings',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard],
    title: 'Configuración del Sistema - Admin PROVIAS',
    data: {
      requiredPermissions: ['admin:settings']
    }
  },
  
  // 📋 Logs del sistema - Lazy Loading + AdminGuard
  {
    path: 'admin/logs',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard],
    title: 'Logs del Sistema - Admin PROVIAS',
    data: {
      requiredPermissions: ['admin:logs']
    }
  },
  
  // 🔄 Alias y redirecciones útiles
  {
    path: 'home',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  {
    path: 'signin',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  {
    path: 'forbidden',
    redirectTo: '/access-denied',
    pathMatch: 'full'
  },
  
  // 🚫 Wildcard route - DEBE estar al final
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página No Encontrada - PROVIAS'
  }
];

/**
 * 📝 Documentación de Guards implementados:
 * 
 * 🛡️ AuthGuard:
 * - Protege rutas que requieren autenticación
 * - Redirige a /login si no está autenticado
 * - Implementa CanActivate, CanActivateChild, CanLoad
 * - Mantiene URL de retorno para después del login
 * 
 * 👑 AdminGuard:
 * - Protege rutas que requieren permisos de administrador
 * - Verifica tanto autenticación como autorización
 * - Redirige a /access-denied si no tiene permisos
 * - Soporta permisos granulares vía route.data
 * 
 * ⚠️ UnsavedChangesGuard:
 * - Previene navegación con cambios sin guardar
 * - Implementa CanDeactivate
 * - Muestra confirmación personalizada
 * - Se puede aplicar a componentes específicos
 * 
 * 📦 Lazy Loading:
 * - Componentes se cargan bajo demanda
 * - Mejora rendimiento inicial
 * - Guards se aplican antes de cargar módulos
 * - Bundle splitting automático
 * 
 * 🔐 Flujo de Seguridad:
 * 1. Usuario intenta acceder a ruta protegida
 * 2. AuthGuard verifica autenticación
 * 3. AdminGuard verifica permisos (si aplica)
 * 4. Si falla algún guard → redirección apropiada
 * 5. Si todo OK → carga componente
 * 
 * 🎯 Casos de Uso Demostrados:
 * - Rutas públicas (login, access-denied)
 * - Rutas protegidas (dashboard, users, projects)
 * - Rutas de admin (admin/*)
 * - Lazy loading con guards
 * - Manejo de errores de autorización
 * - Redirecciones inteligentes
 */