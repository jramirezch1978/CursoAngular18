# 🧭 LAB 3 - Angular Router: Navegación SPA Avanzada

## 🎯 Descripción del Laboratorio

Bienvenidos al **Laboratorio 3** de Angular v18 para **PROVIAS DESCENTRALIZADO**. En este laboratorio construiremos el sistema nervioso de nuestra aplicación: **Angular Router**.

Así como el sistema nervioso coordina todos los órganos del cuerpo humano, Angular Router coordina la navegación entre todos los componentes de nuestra aplicación, creando una experiencia de usuario fluida y profesional.

---

## 📖 Conceptos Teóricos Implementados

### 🛣️ ¿Qué es Angular Router?

Angular Router es como el **sistema de navegación GPS** de tu aplicación web. Permite que los usuarios naveguen entre diferentes vistas sin recargar la página completa, creando una experiencia similar a las aplicaciones móviles nativas.

**Analogía del Edificio Corporativo:**
- Cada ruta es como un **piso diferente** del edificio
- El router es el **ascensor** que te lleva al piso correcto
- Los parámetros de ruta son como el **número de oficina específica**
- El wildcard route es el **recepcionista** que te ayuda cuando te pierdes

### 🎯 Tipos de Rutas Implementadas

#### 1. **Rutas Básicas (Estáticas)**
```typescript
{ path: 'dashboard', component: DashboardComponent }
```
- **Propósito**: Navegación directa a páginas específicas
- **Analogía**: Como tener la llave directa a una oficina específica

#### 2. **Rutas Parametrizadas (Dinámicas)**
```typescript
{ path: 'users/:id', component: UsersComponent }
```
- **Propósito**: Mostrar contenido específico basado en un identificador
- **Analogía**: Como usar una llave maestra que abre diferentes oficinas según el número

#### 3. **Rutas Anidadas**
```typescript
{ path: 'users/:id/edit', component: UsersComponent }
```
- **Propósito**: Acciones específicas dentro de un contexto
- **Analogía**: Como tener una sala de reuniones dentro de una oficina

#### 4. **Redirecciones**
```typescript
{ path: '', redirectTo: '/dashboard', pathMatch: 'full' }
```
- **Propósito**: Dirigir automáticamente a los usuarios a la página correcta
- **Analogía**: Como un asistente que te lleva automáticamente al lugar correcto

#### 5. **Wildcard Route (404)**
```typescript
{ path: '**', component: NotFoundComponent }
```
- **Propósito**: Manejar URLs que no existen
- **Analogía**: Como el personal de seguridad que te ayuda cuando no encuentras lo que buscas

---

## 🏗️ Arquitectura del Proyecto

```
src/app/
├── components/           # Componentes reutilizables
│   └── navigation/      # Sistema de navegación principal
├── pages/               # Componentes de página completa
│   ├── dashboard/       # Panel principal del sistema
│   ├── users/          # Gestión de usuarios (con parámetros)
│   ├── projects/       # Gestión de proyectos (con parámetros)
│   └── not-found/      # Página 404 personalizada
├── app.routes.ts       # Configuración central de rutas
└── app.component.html  # Layout principal con <router-outlet>
```

---

## 🔍 Análisis Detallado del Código

### 📄 1. Configuración de Rutas (`app.routes.ts`)

```typescript
export const routes: Routes = [
  // 🏠 Ruta raíz con redirección automática
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // 📊 Dashboard principal
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - PROVIAS' },
  
  // 👥 Rutas de usuarios con diferentes contextos
  { path: 'users', component: UsersComponent },
  { path: 'users/:id', component: UsersComponent },
  { path: 'users/:id/edit', component: UsersComponent },
  { path: 'users/new', component: UsersComponent },
  
  // 🏗️ Rutas de proyectos similares
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectsComponent },
  
  // 🚫 Manejo de rutas no encontradas
  { path: '**', component: NotFoundComponent }
];
```

**🎓 Puntos Clave de Aprendizaje:**

1. **Orden Importante**: Las rutas se evalúan en orden de aparición
   - `users/new` debe ir ANTES que `users/:id`
   - `**` siempre va al final

2. **pathMatch: 'full'**: Asegura coincidencia exacta para redirecciones

3. **Títulos Dinámicos**: Mejoran SEO y UX del navegador

### 🧭 2. Componente de Navegación

```typescript
@Component({
  selector: 'app-navigation',
  template: `
    <nav>
      <a routerLink="/dashboard" 
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact: true}">
        📊 Dashboard
      </a>
      <!-- Más enlaces... -->
    </nav>
  `
})
export class NavigationComponent {
  constructor(private router: Router) {}
  
  // Navegación programática
  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
```

**🎓 Puntos Clave:**

- **routerLink**: Navegación declarativa (preferida)
- **routerLinkActive**: Resalta el enlace activo automáticamente
- **router.navigate()**: Navegación programática para lógica compleja

### 📊 3. Componentes con Parámetros de Ruta

```typescript
export class UsersComponent implements OnInit {
  userId: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Leer parámetros de la ruta actual
    this.route.params.subscribe(params => {
      this.userId = params['id'] || null;
      
      if (this.userId) {
        this.loadUserDetails(this.userId);
      } else {
        this.loadUsersList();
      }
    });
    
    // Leer query parameters (opcional)
    this.route.queryParams.subscribe(queryParams => {
      const filter = queryParams['filter'];
      // Aplicar filtros...
    });
  }
  
  // Navegación programática con parámetros
  editUser(id: string) {
    this.router.navigate(['/users', id, 'edit']);
  }
  
  // Navegación con query parameters
  filterUsers(filter: string) {
    this.router.navigate(['/users'], { 
      queryParams: { filter: filter } 
    });
  }
}
```

---

## 🎮 Funcionalidades Implementadas

### ✅ 1. Navegación Básica
- Dashboard principal con estadísticas
- Enlaces de navegación con resaltado automático
- Breadcrumbs dinámicos según la ruta actual

### ✅ 2. Rutas Parametrizadas
- `/users/:id` - Ver detalles de usuario específico
- `/projects/:id` - Ver detalles de proyecto específico
- `/users/:id/edit` - Editar usuario específico

### ✅ 3. Query Parameters
- Filtros de búsqueda: `/users?filter=active&role=admin`
- Paginación: `/users?page=2&limit=10`
- Ordenamiento: `/users?sortBy=name&order=asc`

### ✅ 4. Experiencia de Usuario Avanzada
- Página 404 con sugerencias inteligentes
- Mensajes de error creativos y context-aware
- Información de debugging para desarrollo

---

## 🚀 Instrucciones para Ejecutar

### 1. **Instalación**
```bash
cd lab-3-router
npm install
```

### 2. **Desarrollo**
```bash
ng serve --port 4203
```
Abre tu navegador en: `http://localhost:4203`

### 3. **Build de Producción**
```bash
ng build
```

---

## 🔬 Ejercicios Prácticos para Estudiantes

### 🎯 **Ejercicio 1: Exploración Básica**
1. Navega por todas las rutas disponibles
2. Observa cómo cambia la URL en la barra del navegador
3. Usa los breadcrumbs para navegar hacia atrás
4. Intenta acceder a una URL que no existe

### 🎯 **Ejercicio 2: Rutas Parametrizadas**
1. Ve a `/users/1`, `/users/2`, `/users/3`
2. Observa cómo el componente muestra información diferente
3. Prueba `/users/999` (usuario inexistente)
4. Experimenta con `/projects/1/edit`

### 🎯 **Ejercicio 3: Query Parameters**
1. Ve a `/users?filter=active`
2. Prueba `/users?role=admin&status=active`
3. Observa cómo la aplicación procesa estos parámetros

### 🎯 **Ejercicio 4: Página 404**
1. Visita `/esta-pagina-no-existe`
2. Prueba diferentes URLs inventadas
3. Usa los botones de la página 404 para navegar
4. Observa los mensajes aleatorios (actualiza varias veces)

---

## 🎓 Mensaje del Instructor

> "Angular Router es como aprender a conducir en una ciudad moderna. Al principio puede parecer complejo con tantas calles y direcciones, pero una vez que dominas el sistema, puedes ir a cualquier lugar de forma eficiente y segura. Este laboratorio te da las herramientas fundamentales para construir aplicaciones web que se sientan tan fluidas como las mejores aplicaciones móviles del mercado."
> 
> **— Ing. Jhonny Alexander Ramirez Chiroque**

---

## 🏗️ Proyecto PROVIAS - Contexto Real

Este laboratorio simula el sistema de gestión real de **PROVIAS DESCENTRALIZADO**, donde:

- **Dashboard**: Panel de control para supervisar proyectos de infraestructura vial
- **Usuarios**: Gestión de personal (ingenieros, técnicos, administradores)
- **Proyectos**: Seguimiento de obras de carreteras y puentes
- **Navegación**: Sistema intuitivo para acceso rápido a información crítica

### 🌟 **Impacto Real**
Sistemas como este permiten que PROVIAS gestione eficientemente:
- 25,000+ km de carreteras departamentales
- Cientos de proyectos simultáneos
- Personal distribuido en 25 regiones del Perú
- Presupuestos millonarios de infraestructura

---

**© 2025 PROVIAS DESCENTRALIZADO - Laboratorio Angular v18**