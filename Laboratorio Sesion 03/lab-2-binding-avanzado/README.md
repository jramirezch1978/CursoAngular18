# 📊 LAB 2: BINDING AVANZADO Y MANEJO DE EVENTOS

**PROVIAS DESCENTRALIZADO - Angular v18**

*Duración: 40 minutos*  
*Objetivo: Dominar binding avanzado, NgClass, NgStyle y manejo de eventos complejos*

---

## 📚 CONCEPTOS TEÓRICOS

### Binding Avanzado en Angular

El **Binding Avanzado** va más allá de los conceptos básicos y nos permite crear interfaces verdaderamente dinámicas y profesionales. Es como pasar de usar herramientas básicas a convertirse en un artesano experto.

### 🎨 **Class Binding Avanzado**

#### 1. **Clase Única Condicional**
```html
<div [class.active]="isActive">Estado</div>
```
Es como un **interruptor de luz**: enciende o apaga una clase específica basada en una condición.

#### 2. **Múltiples Clases Dinámicas**
```html
<div [ngClass]="getThemeClasses()">Contenido</div>
```
```typescript
getThemeClasses() {
  return {
    'dark-theme': this.isDarkMode,
    'compact': this.isCompact,
    'premium': this.isPremiumUser
  };
}
```

Es como tener un **vestuario inteligente** que selecciona la ropa apropiada según la ocasión.

#### 3. **Clases con Expresiones Complejas**
```html
<div [ngClass]="{
  'high-priority': task.priority > 8,
  'overdue': isOverdue(task.dueDate),
  'assigned': task.assignee && task.assignee.length > 0
}">
```

### 🎭 **Style Binding Dinámico**

#### 1. **Estilo Único**
```html
<div [style.width.px]="progressWidth">Barra de progreso</div>
<div [style.color]="getStatusColor()">Estado</div>
```

#### 2. **Múltiples Estilos con NgStyle**
```html
<div [ngStyle]="getCardStyles()">Tarjeta dinámica</div>
```
```typescript
getCardStyles() {
  return {
    'background-color': this.getBackgroundColor(),
    'border-width.px': this.borderWidth,
    'transform': `scale(${this.zoomLevel})`,
    'box-shadow': this.isElevated ? '0 10px 25px rgba(0,0,0,0.2)' : 'none'
  };
}
```

### 🎯 **Attribute Binding Especializado**

```html
<!-- Para atributos HTML específicos -->
<td [attr.colspan]="columnSpan">Celda</td>
<input [attr.aria-label]="getAriaLabel()">

<!-- Para datos personalizados -->
<div [attr.data-testid]="elementId" [attr.data-priority]="priority">
```

### 🎪 **Event Binding Avanzado**

#### 1. **Eventos del Mouse**
```html
<div 
  (mouseenter)="onHover(true)"
  (mouseleave)="onHover(false)"
  (mousemove)="onMouseMove($event)">
```

#### 2. **Eventos del Teclado**
```html
<input 
  (keyup.enter)="search()"
  (keyup.escape)="clearSearch()"
  (keydown.shift.f)="openAdvancedSearch($event)">
```

#### 3. **Eventos Personalizados**
```html
<app-widget 
  (statusChange)="onWidgetStatusChange($event)"
  (resize)="onWidgetResize($event)">
```

#### 4. **Modificadores de Eventos**
```html
<!-- Prevenir propagación -->
<button (click.stop)="handleClick()">No propagar</button>

<!-- Prevenir comportamiento por defecto -->
<form (submit.prevent)="onSubmit()">Formulario</form>
```

### 🎛️ **HostListener y HostBinding**

```typescript
@Component({...})
export class DashboardComponent {
  @HostBinding('class.fullscreen') isFullscreen = false;
  @HostBinding('style.background-color') backgroundColor = '#ffffff';
  
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.adjustLayout();
  }
  
  @HostListener('document:keydown.escape')
  onEscapePressed() {
    this.exitFullscreen();
  }
}
```

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
lab-2-binding-avanzado/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.scss
│   │   │   ├── widget/
│   │   │   │   ├── widget.component.ts
│   │   │   │   ├── widget.component.html
│   │   │   │   └── widget.component.scss
│   │   │   └── status-indicator/
│   │   │       ├── status-indicator.component.ts
│   │   │       ├── status-indicator.component.html
│   │   │       └── status-indicator.component.scss
│   │   ├── models/
│   │   │   ├── widget.interface.ts
│   │   │   └── dashboard.interface.ts
│   │   ├── services/
│   │   │   ├── dashboard.service.ts
│   │   │   └── theme.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── package.json
├── angular.json
└── README.md
```

---

## 🎯 OBJETIVOS ESPECÍFICOS

Al completar este laboratorio, serás capaz de:

1. ✅ **Implementar NgClass** con múltiples condiciones dinámicas
2. ✅ **Aplicar NgStyle** para estilos calculados en tiempo real
3. ✅ **Usar Attribute Binding** para metadatos y accesibilidad
4. ✅ **Manejar eventos avanzados** con modificadores y propagación
5. ✅ **Implementar HostListener** para eventos globales
6. ✅ **Crear un dashboard interactivo** completamente funcional

---

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### Dashboard Ejecutivo de PROVIAS
- **Panel de control interactivo** con widgets redimensionables
- **Sistema de temas** (claro, oscuro, alto contraste)
- **Filtros avanzados** con búsqueda en tiempo real
- **Estados visuales dinámicos** basados en datos
- **Navegación por teclado** completa
- **Responsive design** adaptativo

### Widgets Inteligentes
- **Indicadores de estado** con colores dinámicos
- **Gráficos responsivos** que se adaptan al contenedor
- **Controles interactivos** con feedback visual
- **Animaciones suaves** basadas en estados
- **Tooltips dinámicos** con información contextual

---

## 💡 CASOS DE USO EMPRESARIALES

Este laboratorio simula el **Panel de Control Ejecutivo** de PROVIAS:

1. **Dashboard de Proyectos**: Monitoreo en tiempo real de obras
2. **Centro de Control**: Supervisión de equipos y materiales  
3. **Panel Financiero**: Seguimiento de presupuestos y gastos
4. **Monitor de Calidad**: Indicadores de cumplimiento
5. **Alertas Operativas**: Sistema de notificaciones inteligentes

---

## 🎨 CARACTERÍSTICAS AVANZADAS

### Temas Dinámicos
- **Modo Claro/Oscuro**: Cambio instantáneo de tema
- **Alto Contraste**: Para accesibilidad mejorada
- **Temas Personalizados**: Colores corporativos específicos
- **Persistencia**: Recordar preferencias del usuario

### Interactividad Avanzada
- **Drag & Drop**: Reorganizar widgets
- **Redimensionamiento**: Ajustar tamaño de componentes
- **Atajos de Teclado**: Navegación eficiente
- **Gestos Touch**: Soporte para dispositivos móviles

### Estados Visuales
- **Loading States**: Indicadores de carga elegantes
- **Error States**: Manejo visual de errores
- **Empty States**: Pantallas vacías informativas
- **Success States**: Confirmaciones visuales

---

## 🔧 TÉCNICAS AVANZADAS

### Performance Optimization
```typescript
// ChangeDetectionStrategy para optimización
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// TrackBy functions para ngFor eficiente
trackWidget(index: number, widget: Widget): number {
  return widget.id;
}
```

### Accesibilidad (A11y)
```html
<!-- ARIA attributes dinámicos -->
<div 
  [attr.aria-expanded]="isExpanded"
  [attr.aria-label]="getAccessibleLabel()"
  [attr.role]="getWidgetRole()">
```

### Responsive Binding
```typescript
// Binding basado en breakpoints
get responsiveClasses() {
  return {
    'mobile-layout': this.isMobile,
    'tablet-layout': this.isTablet,
    'desktop-layout': this.isDesktop
  };
}
```

---

## 📊 MÉTRICAS Y ANALYTICS

### Key Performance Indicators (KPIs)
- **Tiempo de Interacción**: Medición de respuesta de la UI
- **Uso de Widgets**: Analytics de componentes más utilizados
- **Errores de UI**: Tracking de problemas de interfaz
- **Satisfacción**: Feedback visual de usabilidad

### Monitoring en Tiempo Real
- **Estado de Conexión**: Indicador de conectividad
- **Performance**: Métricas de rendimiento de la app
- **Memoria**: Uso de recursos del navegador
- **Errores**: Logs de errores en tiempo real

---

## 🏆 ENTREGABLES ESPERADOS

1. **Dashboard Completo** con mínimo 6 widgets funcionales
2. **Sistema de Temas** con 3 variantes (claro, oscuro, alto contraste)
3. **Navegación por Teclado** completamente implementada
4. **Estados Visuales** para todas las interacciones
5. **Responsive Design** optimizado para móvil, tablet y desktop
6. **Documentación** de componentes y patrones utilizados

---

## 🎯 CONCEPTOS CLAVE A DOMINAR

### Binding Patterns
- **Conditional Classes**: Clases basadas en lógica de negocio
- **Computed Styles**: Estilos calculados dinámicamente
- **Event Propagation**: Control de bubbling y capturing
- **Custom Events**: Emisión de eventos personalizados

### Advanced Patterns
- **Container/Presentational**: Separación de lógica y presentación
- **State Management**: Manejo de estado local complejo
- **Event Bus**: Comunicación entre componentes
- **Lifecycle Hooks**: Optimización del ciclo de vida

---

*¡Prepárate para crear interfaces de nivel empresarial! 🚀*

**El dashboard que construyas podría implementarse mañana mismo en PROVIAS** 💼