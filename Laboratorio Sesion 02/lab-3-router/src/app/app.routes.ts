import { Routes } from '@angular/router';

// 📄 Importar todos los componentes de páginas
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

/**
 * 🧭 Configuración de rutas para LAB 3 - Angular Router
 * 
 * Este archivo demuestra:
 * ✅ Rutas básicas estáticas
 * ✅ Rutas con parámetros (:id)
 * ✅ Rutas anidadas para acciones específicas
 * ✅ Redirecciones automáticas
 * ✅ Wildcard route para 404
 * ✅ Query parameters (manejados en componentes)
 */
export const routes: Routes = [
  // 🏠 Ruta raíz - Redirección al dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // 🏠 Dashboard principal
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard - PROVIAS'
  },
  
  // 👥 Gestión de usuarios
  {
    path: 'users',
    component: UsersComponent,
    title: 'Usuarios - PROVIAS'
  },
  
  // 👤 Detalles de usuario específico (ruta parametrizada)
  {
    path: 'users/:id',
    component: UsersComponent, // Reutilizamos el componente, diferenciamos por parámetro
    title: 'Detalle Usuario - PROVIAS'
  },
  
  // ✏️ Editar usuario específico (ruta anidada)
  {
    path: 'users/:id/edit',
    component: UsersComponent, // El componente maneja el modo de edición
    title: 'Editar Usuario - PROVIAS'
  },
  
  // ➕ Crear nuevo usuario
  {
    path: 'users/new',
    component: UsersComponent, // El componente detecta modo "new"
    title: 'Nuevo Usuario - PROVIAS'
  },
  
  // 🏗️ Gestión de proyectos
  {
    path: 'projects',
    component: ProjectsComponent,
    title: 'Proyectos - PROVIAS'
  },
  
  // 🏗️ Detalles de proyecto específico
  {
    path: 'projects/:id',
    component: ProjectsComponent, // Reutilizamos el componente
    title: 'Detalle Proyecto - PROVIAS'
  },
  
  // ✏️ Editar proyecto específico
  {
    path: 'projects/:id/edit',
    component: ProjectsComponent,
    title: 'Editar Proyecto - PROVIAS'
  },
  
  // ➕ Crear nuevo proyecto
  {
    path: 'projects/new',
    component: ProjectsComponent,
    title: 'Nuevo Proyecto - PROVIAS'
  },
  
  // 🏠 Alias para home (redirección)
  {
    path: 'home',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // 📊 Alias para estadísticas (redirección)
  {
    path: 'stats',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // 🚫 Wildcard route - DEBE estar al final
  // Captura todas las rutas no encontradas y muestra página 404
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página No Encontrada - PROVIAS'
  }
];

/**
 * 📝 Notas sobre la configuración de rutas:
 * 
 * 1. 🔄 ORDEN IMPORTANTE: Las rutas se evalúan en orden de aparición
 *    - Rutas más específicas primero: 'users/new' antes que 'users/:id'
 *    - Wildcard '**' siempre al final
 * 
 * 2. 🎯 PARÁMETROS DE RUTA:
 *    - :id se puede leer en componentes con ActivatedRoute
 *    - Ejemplo: /users/123 → { id: '123' }
 * 
 * 3. 🔗 QUERY PARAMETERS:
 *    - Se manejan en los componentes, no en la configuración
 *    - Ejemplo: /users?filter=active&page=2
 * 
 * 4. 📍 PATH MATCHING:
 *    - 'full': coincidencia exacta completa
 *    - 'prefix': coincidencia de prefijo (por defecto)
 * 
 * 5. 📖 TÍTULOS:
 *    - Se muestran en la pestaña del navegador
 *    - Mejoran SEO y UX
 * 
 * 6. 🔄 REDIRECCIONES:
 *    - Útiles para mantener compatibilidad con URLs antiguas
 *    - Pueden ser temporales (302) o permanentes (301)
 */