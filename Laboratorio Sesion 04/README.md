# 🚀 Laboratorio Sesión 04: Directivas Angular v18

## 📋 Información General

**Curso:** Angular v18 - 30 horas académicas  
**Modalidad:** 100% Online Live - Formato Laboratorio Intensivo  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  
**Institución:** PROVIAS DESCENTRALIZADO  
**Sesión:** 4 - Directivas  
**Fecha:** Jueves, 07 de Agosto 2025  
**Duración Total:** 180 minutos (3 horas)  

## 🎯 Objetivos del Laboratorio

Al completar este laboratorio, los participantes serán capaces de:

- ✅ Dominar las **directivas estructurales modernas** (@if, @for, @switch) de Angular v18
- ✅ Implementar **directivas de atributo avanzadas** (NgClass, NgStyle, NgModel)
- ✅ Crear **directivas personalizadas complejas** reutilizables
- ✅ Utilizar **HostListener y HostBinding** para interactividad
- ✅ Aplicar **Renderer2** para manipulación segura del DOM
- ✅ Desarrollar un **sistema completo de Drag & Drop**

## 🛠️ Requisitos Previos

### Software Necesario

| Herramienta | Versión Mínima | Verificación | Instalación |
|-------------|----------------|--------------|-------------|
| Node.js | v18.19.0 | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | v9.0.0 | `npm --version` | Incluido con Node.js |
| Angular CLI | v18.x | `ng version` | `npm install -g @angular/cli@18` |
| VS Code | Última | - | [code.visualstudio.com](https://code.visualstudio.com) |
| Git | v2.x | `git --version` | [git-scm.com](https://git-scm.com) |

### Extensiones de VS Code Recomendadas

1. **Angular Language Service** - IntelliSense avanzado para templates
2. **Angular Snippets** - Snippets para directivas
3. **Prettier - Code formatter** - Formateo automático
4. **Error Lens** - Muestra errores inline
5. **Angular DevTools** - Debugging de directivas
6. **GitLens** - Control de versiones visual

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd laboratorio-sesion04
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar la Aplicación

```bash
ng serve --open
```

La aplicación estará disponible en: `http://localhost:4200`

## 📚 Estructura del Proyecto

```
laboratorio-sesion04/
├── src/
│   ├── app/
│   │   ├── components/           # Componentes auxiliares
│   │   ├── directives/          # Directivas personalizadas
│   │   │   ├── draggable.directive.ts
│   │   │   ├── droppable.directive.ts
│   │   │   ├── highlight.directive.ts
│   │   │   ├── lazy-load.directive.ts
│   │   │   ├── permission.directive.ts
│   │   │   └── tooltip.directive.ts
│   │   ├── interfaces/          # Interfaces TypeScript
│   │   │   └── project.interface.ts
│   │   ├── pages/              # Componentes de página
│   │   │   ├── lab0-intro.component.ts
│   │   │   ├── lab1-structural.component.ts
│   │   │   ├── lab2-attribute.component.ts
│   │   │   ├── lab3-custom.component.ts
│   │   │   └── lab4-advanced.component.ts
│   │   ├── services/           # Servicios Angular
│   │   │   └── project.service.ts
│   │   ├── app.component.ts    # Componente raíz
│   │   └── app.routes.ts       # Configuración de rutas
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json                # Configuración de Angular
├── package.json               # Dependencias npm
├── tsconfig.json             # Configuración TypeScript
└── README.md                 # Este archivo
```

## 📖 Laboratorios Incluidos

### 🏠 LAB 0: Introducción a Angular v18
- **Ruta:** `/` (página principal)
- **Duración:** 15 minutos
- **Contenido:**
  - Introducción completa a Angular
  - Configuración del entorno de desarrollo
  - Comandos esenciales de Angular CLI
  - Novedades de Angular v18
  - Conceptos fundamentales

### 🏗️ LAB 1: Directivas Estructurales Modernas
- **Ruta:** `/lab1`
- **Duración:** 45 minutos
- **Contenido:**
  - Nueva sintaxis @if, @for, @switch
  - Control de flujo moderno
  - Track functions optimizadas
  - Manejo de estados de carga
  - Dashboard interactivo de proyectos

**Características implementadas:**
- ✅ Sistema de filtros avanzado
- ✅ Estadísticas en tiempo real
- ✅ Gestión de estado con signals
- ✅ Interfaz responsiva

### 🎨 LAB 2: Directivas de Atributo Avanzadas
- **Ruta:** `/lab2`
- **Duración:** 45 minutos
- **Contenido:**
  - NgClass con objetos y arrays
  - NgStyle con variables CSS
  - NgModel y two-way binding
  - Sistema de temas dinámico
  - Validaciones en tiempo real

**Características implementadas:**
- ✅ Configurador de temas completo
- ✅ Personalización de colores en tiempo real
- ✅ Formularios con validación avanzada
- ✅ Filtros dinámicos
- ✅ Persistencia de preferencias

### ⚡ LAB 3: Directivas Personalizadas Complejas
- **Ruta:** `/lab3`
- **Duración:** 45 minutos
- **Contenido:**
  - Tooltip Directive con múltiples posiciones
  - Highlight Directive con efectos visuales
  - LazyLoad Directive con IntersectionObserver
  - Permission Directive para control de acceso
  - Combinación de múltiples directivas

**Directivas implementadas:**
- 🎯 **TooltipDirective**: Tooltips personalizables con temas y posiciones
- 🎨 **HighlightDirective**: Resaltado dinámico con intensidades
- 🖼️ **LazyLoadDirective**: Carga perezosa de imágenes optimizada
- 🔐 **PermissionDirective**: Control de acceso basado en roles

### 🔧 LAB 4: Host Binding y Renderer2 Avanzado
- **Ruta:** `/lab4`
- **Duración:** 25 minutos
- **Contenido:**
  - Sistema completo de Drag & Drop
  - Kanban Board interactivo
  - Renderer2 para manipulación segura del DOM
  - Animaciones y efectos visuales
  - Métricas de rendimiento

**Características implementadas:**
- 🎯 **DraggableDirective**: Elementos arrastrables con efectos visuales
- 📦 **DroppableDirective**: Zonas de drop con validación
- 📋 **Kanban Board**: Sistema completo de gestión de tareas
- 📊 **Métricas**: Estadísticas de uso y rendimiento
- 🎨 **Temas**: Múltiples temas visuales

## 🎯 Conceptos Clave Implementados

### 1. Nueva Sintaxis de Control Flow (Angular v18)
```typescript
// @if - Condicionales modernas
@if (usuario) {
  <span>Bienvenido {{ usuario.nombre }}</span>
} @else {
  <span>Inicia sesión</span>
}

// @for - Iteraciones optimizadas
@for (item of lista; track item.id) {
  <div>{{ item.titulo }}</div>
} @empty {
  <div>No hay elementos</div>
}

// @switch - Control de flujo múltiple
@switch (estado) {
  @case ('activo') { <span class="activo">Activo</span> }
  @case ('inactivo') { <span class="inactivo">Inactivo</span> }
  @default { <span>Desconocido</span> }
}
```

### 2. Directivas de Atributo Avanzadas
```typescript
// NgClass con objetos dinámicos
[ngClass]="{
  'tema-oscuro': modoOscuro,
  'compacto': modoCompacto,
  'animado': animacionesHabilitadas
}"

// NgStyle con variables CSS
[ngStyle]="{
  '--color-primario': colorPersonalizado,
  '--tamaño-fuente': tamañoFuente + 'px'
}"

// NgModel con validaciones
<input [(ngModel)]="email" #emailInput="ngModel" 
       email required>
<div *ngIf="emailInput.invalid && emailInput.touched">
  Email inválido
</div>
```

### 3. Directivas Personalizadas
```typescript
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input() appTooltip = '';
  @Input() tooltipPosition: 'top' | 'bottom' = 'top';
  
  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip();
  }
  
  @HostBinding('class.has-tooltip')
  hasTooltip = true;
}
```

### 4. Drag & Drop Avanzado
```typescript
@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @HostBinding('draggable') isDraggable = true;
  
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    // Lógica de arrastre con Renderer2
  }
}
```

## 🧪 Funcionalidades Destacadas

### Sistema de Proyectos PROVIAS
- **Gestión completa de proyectos** de infraestructura vial
- **Filtros avanzados** por estado, tipo, prioridad
- **Estadísticas en tiempo real** con signals
- **Dashboard interactivo** con métricas

### Configurador de Temas
- **5 temas predefinidos** (Default, Oscuro, Naturaleza, Océano, Atardecer)
- **Personalización completa** de colores
- **Ajustes de accesibilidad** (alto contraste, tamaño de fuente)
- **Persistencia de preferencias**

### Sistema de Permisos
- **Control de acceso basado en roles** (Admin, Supervisor, Ingeniero, Invitado)
- **Permisos granulares** por función
- **Contenido dinámico** según permisos
- **Debug de permisos** en tiempo real

### Kanban Board
- **Drag & Drop nativo** HTML5
- **4 columnas configurables** (Por Hacer, En Progreso, Revisión, Completado)
- **Gestión completa de tareas** con prioridades
- **Límites por columna** y validaciones
- **Métricas de productividad**

## 📊 Métricas y Estadísticas

La aplicación incluye un sistema completo de métricas que rastrea:

### Drag & Drop
- Total de movimientos realizados
- Movimientos exitosos vs fallidos
- Tasa de éxito del sistema

### Productividad
- Tareas creadas y completadas
- Tiempo promedio por tarea
- Distribución por prioridades

### Renderer2
- Elementos DOM creados
- Animaciones ejecutadas
- Estilos aplicados dinámicamente

## 🎨 Temas y Personalización

### Temas Disponibles
1. **🌟 Por Defecto**: Colores corporativos de Angular
2. **🌙 Oscuro**: Modo oscuro completo
3. **🌿 Naturaleza**: Tonos verdes y naturales
4. **🌊 Océano**: Azules y tonos marinos
5. **🌅 Atardecer**: Naranjas y amarillos cálidos
6. **💼 Profesional**: Grises corporativos

### Opciones de Personalización
- **Colores primarios y secundarios** personalizables
- **Tamaño de fuente** ajustable (12px - 24px)
- **Modo compacto** para espacios reducidos
- **Alto contraste** para accesibilidad
- **Animaciones** habilitables/deshabilitables

## 🧩 Directivas Personalizadas

### TooltipDirective
```html
<button appTooltip="Información adicional" 
        tooltipPosition="top" 
        tooltipTheme="dark">
  Hover me
</button>
```

### HighlightDirective
```html
<div appHighlight="#ffeb3b" 
     highlightOnHover="true" 
     highlightIntensity="medium">
  Elemento resaltable
</div>
```

### LazyLoadDirective
```html
<img appLazyLoad="https://example.com/image.jpg"
     rootMargin="50px"
     (imageLoaded)="onImageLoaded()">
```

### PermissionDirective
```html
<div *appPermission="'admin'" 
     permissionRole="['supervisor', 'admin']">
  Contenido para administradores
</div>
```

### DraggableDirective
```html
<div appDraggable 
     [appDraggable]="dragData"
     (dragStart)="onDragStart($event)">
  Elemento arrastrable
</div>
```

### DroppableDirective
```html
<div appDroppable="target-zone"
     [acceptedTypes]="['task']"
     (drop)="onDrop($event)">
  Zona de drop
</div>
```

## 🚀 Comandos Útiles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
ng serve

# Iniciar con puerto personalizado
ng serve --port 4300

# Abrir automáticamente en navegador
ng serve --open

# Modo de observación de archivos
ng serve --watch
```

### Construcción
```bash
# Build de desarrollo
ng build

# Build de producción
ng build --prod

# Analizar el bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Testing
```bash
# Ejecutar tests unitarios
ng test

# Ejecutar tests e2e
ng e2e

# Tests con coverage
ng test --code-coverage
```

### Generación de Código
```bash
# Generar componente
ng generate component mi-componente

# Generar directiva
ng generate directive mi-directiva

# Generar servicio
ng generate service mi-servicio

# Generar pipe
ng generate pipe mi-pipe
```

## 📱 Diseño Responsivo

La aplicación está completamente optimizada para:

- **📱 Móviles** (320px - 768px)
- **📟 Tablets** (768px - 1024px)
- **💻 Escritorio** (1024px+)
- **🖥️ Pantallas grandes** (1440px+)

### Breakpoints CSS
```css
/* Móvil */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Escritorio */
@media (min-width: 1025px) { }
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error: "ng is not recognized"
```bash
npm install -g @angular/cli@18
```

#### Error de dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Puerto en uso
```bash
ng serve --port 4300
```

#### Problemas de CORS
```bash
ng serve --proxy-config proxy.conf.json
```

### Logs y Debugging

#### Activar logs detallados
```bash
ng serve --verbose
```

#### Debug en VS Code
Configuración en `.vscode/launch.json`:
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug Angular",
  "url": "http://localhost:4200",
  "webRoot": "${workspaceFolder}"
}
```

## 🌟 Mejores Prácticas Implementadas

### 1. Arquitectura
- ✅ Componentes standalone
- ✅ Lazy loading de rutas
- ✅ Signals para gestión de estado
- ✅ Servicios inyectables
- ✅ Interfaces TypeScript

### 2. Performance
- ✅ OnPush change detection
- ✅ Track functions optimizadas
- ✅ Lazy loading de imágenes
- ✅ Computed values
- ✅ Minimal bundle size

### 3. Accesibilidad
- ✅ ARIA labels
- ✅ Navegación por teclado
- ✅ Alto contraste
- ✅ Tamaños de fuente escalables
- ✅ Semántica HTML correcta

### 4. Testing
- ✅ Unit tests para directivas
- ✅ Component testing
- ✅ Service testing
- ✅ E2E scenarios
- ✅ Coverage reports

## 📈 Roadmap y Futuras Mejoras

### Versión 1.1
- [ ] Integración con APIs REST
- [ ] Autenticación JWT
- [ ] PWA capabilities
- [ ] Offline support
- [ ] Push notifications

### Versión 1.2
- [ ] Internacionalización (i18n)
- [ ] Modo oscuro automático
- [ ] Exportación a PDF
- [ ] Dashboard analytics
- [ ] Real-time collaboration

### Versión 1.3
- [ ] Micro-frontends
- [ ] Server-side rendering
- [ ] Advanced animations
- [ ] AI-powered features
- [ ] Performance monitoring

## 👥 Contribución

### Cómo Contribuir
1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### Estándares de Código
- **ESLint** para linting
- **Prettier** para formateo
- **Conventional Commits** para mensajes
- **Semantic Versioning** para releases

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte y Contacto

### Instructor
**Ing. Jhonny Alexander Ramirez Chiroque**  
📧 Email: [instructor@provias.gob.pe](mailto:instructor@provias.gob.pe)  
🏢 Institución: PROVIAS DESCENTRALIZADO  

### Documentación Adicional
- 📚 [Documentación Oficial de Angular](https://angular.io/docs)
- 🎓 [Angular University](https://angular-university.io/)
- 📺 [Angular DevTools](https://angular.io/guide/devtools)

---

## 🎉 ¡Felicitaciones!

Has completado exitosamente el **Laboratorio de la Sesión 04** sobre **Directivas en Angular v18**. 

### Lo que has logrado:
- ✅ Dominio de las directivas estructurales modernas
- ✅ Implementación de directivas de atributo avanzadas  
- ✅ Creación de directivas personalizadas complejas
- ✅ Sistema completo de Drag & Drop
- ✅ Aplicación funcional y responsiva

### Próximos pasos:
1. **Practicar** con proyectos personales
2. **Explorar** las nuevas características de Angular v18
3. **Implementar** estas técnicas en proyectos reales
4. **Compartir** conocimiento con el equipo

**¡Sigue aprendiendo y construyendo aplicaciones increíbles con Angular! 🚀**

---

*Creado con ❤️ para PROVIAS DESCENTRALIZADO - Agosto 2025*
