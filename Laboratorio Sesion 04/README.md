# 🎪 LAB 4: DRAG & DROP KANBAN CON HOSTBINDING Y RENDERER2

## 🎯 Objetivo Principal
Dominar **HostBinding, HostListener y Renderer2** creando un **sistema completo de Drag & Drop** con un tablero Kanban funcional, aplicando técnicas avanzadas de manipulación del DOM y interactividad de directivas personalizadas.

## 🏗️ ¿Qué Construiremos?
Un **KanbanBoardComponent** profesional con funcionalidades avanzadas:
- **🎯 Tablero Kanban** con 3 columnas (Por Hacer, En Progreso, Completado)
- **🖱️ Drag & Drop** fluido entre columnas
- **🎨 Directivas personalizadas** (DraggableDirective, DropZoneDirective)
- **⚡ Animaciones** visuales durante el arrastre
- **💾 Persistencia** de estado en localStorage
- **🎭 Feedback visual** avanzado con Renderer2

## ⏱️ Duración: 25 minutos

## 🚀 Diferencias con Laboratorios Anteriores

| **Lab Anterior** | **LAB 4** |
|------------------|-----------|
| 📋 **LAB 1**: @if, @for, @switch | 🎪 **HostBinding y HostListener** |
| 🎨 **LAB 2**: NgClass, NgStyle, NgModel | 🖱️ **Eventos de mouse avanzados** |
| 🔧 **LAB 3**: Directivas básicas | 🎭 **Renderer2 para DOM manipulation** |
| **Funcionalidad estática** | **Interactividad completa** |

## 🎯 Objetivos de Aprendizaje Específicos

Al completar este laboratorio, dominarás:

- ✅ **HostListener** para capturar eventos de mouse/touch complejos
- ✅ **HostBinding** para modificar propiedades del elemento host dinámicamente  
- ✅ **Renderer2** para manipulación segura y cross-platform del DOM
- ✅ **Drag & Drop API** nativa de HTML5 integrada con Angular
- ✅ **Directivas reutilizables** que encapsulan comportamiento complejo
- ✅ **Gestión de estado** durante operaciones de arrastre
- ✅ **Animaciones CSS** coordinadas con eventos JavaScript

## 📋 Conceptos Clave del LAB 4

### 1. HostListener - Captura de Eventos Avanzada
**HostListener** escucha eventos del elemento host con máximo control:

#### Eventos de Mouse para Drag & Drop
```typescript
@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    // Configurar datos de transferencia
    event.dataTransfer?.setData('text/plain', this.dragData);
    
    // Personalizar imagen de arrastre
    const dragImage = this.createCustomDragImage();
    event.dataTransfer?.setDragImage(dragImage, 10, 10);
    
    this.dragStart.emit(this.dragData);
  }
  
  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent) {
    // Actualizar posición durante el arrastre
    this.updateDragPosition(event.clientX, event.clientY);
  }
  
  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    // Limpiar estado después del drop
    this.resetDragState();
    this.dragEnd.emit();
  }
}
```

#### Mouse Events Especializados
```typescript
// Detección precisa de hover
@HostListener('mouseenter')
@HostListener('mouseleave')
// Control de clicks
@HostListener('click', ['$event'])
@HostListener('contextmenu', ['$event']) // Click derecho
// Eventos táctiles para móviles
@HostListener('touchstart', ['$event'])
@HostListener('touchmove', ['$event'])
@HostListener('touchend', ['$event'])
```

### 2. HostBinding - Control Total del Elemento
**HostBinding** modifica propiedades del host dinámicamente:

#### Binding de Clases Dinámicas
```typescript
export class DraggableDirective {
  @HostBinding('class.is-dragging')
  get isDragging() {
    return this.dragState === 'dragging';
  }
  
  @HostBinding('class.drag-hover')
  get isHovered() {
    return this.isMouseOver;
  }
  
  @HostBinding('class.drag-disabled')
  get isDisabled() {
    return !this.enabled;
  }
}
```

#### Binding de Estilos Avanzados
```typescript
// Opacidad durante arrastre
@HostBinding('style.opacity')
get dragOpacity() {
  return this.isDragging ? '0.5' : '1';
}

// Transformaciones CSS
@HostBinding('style.transform')
get dragTransform() {
  return this.isDragging ? 'scale(1.05) rotate(5deg)' : 'none';
}

// Cursor dinámico
@HostBinding('style.cursor')
get dragCursor() {
  return this.enabled ? 'grab' : 'not-allowed';
}

// Propiedades HTML5 Drag
@HostBinding('draggable')
get draggableAttribute() {
  return this.enabled;
}
```

### 3. Renderer2 - Manipulación Segura del DOM
**Renderer2** permite modificar el DOM de forma segura y cross-platform:

#### Creación de Elementos Dinámicos
```typescript
export class DropZoneDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    
    // Crear indicador visual de drop
    const dropIndicator = this.renderer.createElement('div');
    this.renderer.addClass(dropIndicator, 'drop-indicator');
    this.renderer.setStyle(dropIndicator, 'position', 'absolute');
    this.renderer.setStyle(dropIndicator, 'background', 'rgba(34, 197, 94, 0.2)');
    this.renderer.setStyle(dropIndicator, 'border', '2px dashed #22c55e');
    
    // Agregar al DOM
    this.renderer.appendChild(this.el.nativeElement, dropIndicator);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    
    // Crear efecto visual de drop exitoso
    const successEffect = this.renderer.createElement('div');
    this.renderer.addClass(successEffect, 'drop-success');
    this.renderer.setStyle(successEffect, 'animation', 'dropSuccess 0.6s ease-out');
    
    this.renderer.appendChild(this.el.nativeElement, successEffect);
    
    // Remover efecto después de la animación
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, successEffect);
    }, 600);
  }
}
```

#### Ventajas de Renderer2 vs Manipulación Directa
```typescript
// ❌ INCORRECTO - Manipulación directa (insegura)
this.el.nativeElement.innerHTML = '<div>Contenido</div>';
this.el.nativeElement.style.backgroundColor = 'red';

// ✅ CORRECTO - Con Renderer2 (seguro)
const div = this.renderer.createElement('div');
const text = this.renderer.createText('Contenido');
this.renderer.appendChild(div, text);
this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', 'red');
this.renderer.appendChild(this.el.nativeElement, div);
```

### 4. Arquitectura del Sistema Drag & Drop
El sistema funciona con **dos directivas principales**:

#### DraggableDirective - Elementos Arrastrables
```typescript
@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  @Input() dragData: any; // Datos a transferir
  @Input() dragDisabled: boolean = false;
  
  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<void>();
  
  // Estados visuales con HostBinding
  @HostBinding('class.dragging') isDragging = false;
  @HostBinding('style.opacity') get opacity() {
    return this.isDragging ? '0.6' : '1';
  }
}
```

#### DropZoneDirective - Zonas de Drop
```typescript
@Directive({
  selector: '[appDropZone]'
})
export class DropZoneDirective {
  @Input() dropZoneId: string = '';
  @Input() acceptedTypes: string[] = ['*'];
  
  @Output() itemDropped = new EventEmitter<any>();
  
  // Estados visuales
  @HostBinding('class.drag-over') isDragOver = false;
  @HostBinding('class.drop-valid') isValidDrop = false;
}
```

## 🏗️ Implementación del Kanban Board

### PASO 1: Crear las Directivas Base (8 minutos)
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
