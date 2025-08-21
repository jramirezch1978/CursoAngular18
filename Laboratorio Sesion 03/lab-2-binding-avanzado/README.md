# 📊 LAB 2: BINDING AVANZADO Y MANEJO DE EVENTOS

**PROVIAS DESCENTRALIZADO - Angular v18**  
**Curso: Desarrollo de Aplicaciones Web con Angular**  
**Instructor: Ing. Jhonny Alexander Ramirez Chiroque**  

---

## 🎯 **¿QUÉ VAS A APRENDER EN ESTE LAB?**

En este laboratorio vas a crear un **Dashboard Ejecutivo** para PROVIAS que responde inteligentemente a las acciones del usuario. Aprenderás técnicas avanzadas de binding que van más allá de lo básico y te convertirán en un desarrollador Angular de nivel intermedio.

**Al final de este lab podrás:**
- ✅ Aplicar **múltiples clases CSS dinámicamente** con NgClass
- ✅ Calcular **estilos en tiempo real** con NgStyle  
- ✅ Capturar **eventos globales** con HostListener
- ✅ Controlar **propiedades del componente** con HostBinding
- ✅ Manejar **eventos avanzados** con modificadores
- ✅ Crear **interfaces empresariales** profesionales

---

## 🏗️ **¿QUÉ VAS A CONSTRUIR?**

### **Dashboard Ejecutivo de PROVIAS**
Imagina el panel de control que usaría el Director de PROVIAS para monitorear todos los proyectos viales del país en tiempo real:

📊 **Widgets Inteligentes**
- Métricas de proyectos activos que cambian de color según el progreso
- Gráficos de presupuesto con barras animadas
- Alertas críticas que pulsan cuando requieren atención
- Estados de equipos con iconos dinámicos

🎨 **Sistema de Temas Dinámico**
- Modo claro para uso diurno
- Modo oscuro para trabajo nocturno  
- Alto contraste para accesibilidad
- Cambio instantáneo con atajos de teclado

🎧 **Interactividad Avanzada**
- Atajos de teclado profesionales (Ctrl+F, Ctrl+D, Escape)
- Eventos de mouse para hover effects
- Redimensionamiento de ventana adaptativo
- Navegación por teclado completa

---

## 🎨 **TÉCNICAS AVANZADAS EXPLICADAS**

### **1. NgClass - "Vestuario Inteligente para Elementos"**

**¿Qué hace?** Aplica múltiples clases CSS basadas en condiciones complejas.

```html
<!-- Ejemplo básico -->
<div [ngClass]="getWidgetClasses(widget)">Widget</div>

<!-- En el componente -->
getWidgetClasses(widget: Widget) {
  return {
    'widget': true,                    // Siempre aplicada
    'widget-loading': this.isLoading,  // Solo si está cargando
    'widget-error': widget.hasError,   // Solo si hay error
    'widget-large': widget.size > 6    // Solo si es grande
  };
}
```

**Resultado:** El elemento tendrá diferentes clases según las condiciones:
- `class="widget widget-loading"` (si está cargando)
- `class="widget widget-large"` (si es grande)
- `class="widget widget-error widget-large"` (si hay error Y es grande)

**💡 Piénsalo como:** Un vestuario inteligente que elige automáticamente la ropa apropiada según la ocasión.

### **2. NgStyle - "Estilista Personal para Elementos"**

**¿Qué hace?** Calcula y aplica estilos CSS dinámicamente basados en datos.

```html
<!-- Ejemplo básico -->
<div [ngStyle]="getProgressStyles(widget)">Barra de progreso</div>

<!-- En el componente -->
getProgressStyles(widget: Widget) {
  const percentage = widget.data.percentage;
  return {
    'width': percentage + '%',
    'background-color': percentage >= 90 ? '#10b981' : 
                       percentage >= 70 ? '#f59e0b' : '#ef4444',
    'transition': 'all 0.5s ease'
  };
}
```

**Resultado:** Una barra de progreso que:
- Se hace más ancha según el porcentaje
- Cambia de color (verde si >90%, amarillo si >70%, rojo si <70%)
- Tiene animaciones suaves

**💡 Piénsalo como:** Un estilista personal que cambia la apariencia según las circunstancias.

### **3. HostListener - "Oídos Globales del Componente"**

**¿Qué hace?** Escucha eventos que ocurren en toda la página, no solo en el componente.

```typescript
@Component({...})
export class DashboardComponent {
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      switch (event.key) {
        case 'f':
          event.preventDefault();
          this.toggleFullscreen();  // Ctrl+F = Pantalla completa
          break;
        case 'd':
          event.preventDefault();
          this.toggleTheme();       // Ctrl+D = Cambiar tema
          break;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    console.log('Ventana redimensionada:', window.innerWidth);
    this.adjustLayout();
  }
}
```

**Resultado:** Tu componente responde a:
- Combinaciones de teclas en toda la página
- Redimensionamiento de ventana
- Eventos del documento completo

**💡 Piénsalo como:** Tener oídos súper sensibles que escuchan todo lo que pasa en la página.

### **4. HostBinding - "Control Remoto del Elemento Host"**

**¿Qué hace?** Controla propiedades y clases del elemento que contiene tu componente.

```typescript
@Component({
  selector: 'app-dashboard',
  template: '...'
})
export class DashboardComponent {
  
  @HostBinding('class.fullscreen') 
  isFullscreen = false;
  
  @HostBinding('class.dark-theme') 
  isDarkTheme = false;
  
  @HostBinding('style.--primary-color') 
  primaryColor = '#1e3a8a';
  
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    // Automáticamente agrega/quita la clase 'fullscreen'
  }
}
```

**Resultado:** El elemento `<app-dashboard>` automáticamente:
- Agrega `class="fullscreen"` cuando `isFullscreen = true`
- Agrega `class="dark-theme"` cuando `isDarkTheme = true`
- Cambia `style="--primary-color: #1e3a8a"`

**💡 Piénsalo como:** Un control remoto que maneja las propiedades del elemento desde adentro.

---

## 🚀 **CÓMO EJECUTAR EL LABORATORIO**

### **Paso 1: Preparar el Entorno**
```bash
# Navegar al directorio del lab
cd lab-2-binding-avanzado

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
ng serve --port 4201
```

### **Paso 2: Abrir en el Navegador**
- Abre tu navegador en: http://localhost:4201
- Verás la página de inicio con explicaciones del lab
- Haz click en "📊 Dashboard" para acceder al panel ejecutivo

### **Paso 3: Probar las Funcionalidades Avanzadas**
1. **⌨️ Atajos de teclado:** Presiona Ctrl+F para pantalla completa
2. **🎨 Cambiar tema:** Presiona Ctrl+D o usa el selector
3. **🔍 Búsqueda:** Escribe en el campo y ve el filtrado en tiempo real
4. **🖱️ Hover effects:** Pasa el mouse sobre widgets y observa los efectos
5. **📱 Responsive:** Cambia el tamaño de la ventana y ve cómo se adapta

---

## 📚 **CONCEPTOS EN ACCIÓN - EJEMPLOS REALES**

### **NgClass Dinámico**
```html
<!-- Widget que cambia de apariencia según su estado -->
<div [ngClass]="{
  'widget': true,
  'widget-loading': isLoading,
  'widget-critical': widget.data.critical > 0,
  'widget-large': widget.size.width >= 6
}">
```
**Ve cómo:** Un widget de alertas se pone rojo y pulsa cuando hay alertas críticas.

### **NgStyle Calculado**
```html
<!-- Barra de progreso que cambia color según el porcentaje -->
<div [ngStyle]="{
  'width': widget.data.percentage + '%',
  'background-color': widget.data.percentage >= 90 ? '#10b981' : '#f59e0b',
  'transition': 'all 0.5s ease'
}">
```
**Ve cómo:** La barra de presupuesto se vuelve verde cuando está cerca del 100%.

### **HostListener Global**
```typescript
@HostListener('window:keydown', ['$event'])
onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    this.exitFullscreen();  // Escape sale de pantalla completa
  }
}
```
**Ve cómo:** Presionar Escape en cualquier parte de la página sale del modo fullscreen.

### **HostBinding Automático**
```typescript
@HostBinding('class.dark-theme') 
get isDarkThemeClass() {
  return this.selectedTheme === 'dark';
}
```
**Ve cómo:** Cambiar el tema automáticamente agrega la clase `dark-theme` al componente.

---

## 🎛️ **FUNCIONALIDADES IMPLEMENTADAS**

### **🔍 Búsqueda Inteligente**
- **Filtrado en tiempo real** mientras escribes
- **Atajos de teclado** (Enter, Escape)
- **Estados visuales** del campo de búsqueda
- **Debounce automático** para mejor performance

### **🎨 Sistema de Temas**
- **3 temas disponibles:** Claro, Oscuro, Alto Contraste
- **Cambio instantáneo** con selector o teclado
- **Variables CSS dinámicas** que se actualizan automáticamente
- **Persistencia visual** inmediata

### **📊 Widgets Interactivos**
- **4 tipos de widgets:** Métricas, Gráficos, Alertas, Estados
- **Hover effects** con transformaciones suaves
- **Click handlers** con feedback visual
- **Estados de carga** y actualización

### **⌨️ Navegación por Teclado**
- **Ctrl+F:** Alternar pantalla completa
- **Ctrl+D:** Cambiar tema
- **Escape:** Salir de pantalla completa
- **Tab:** Navegación entre elementos

---

## 💼 **¿POR QUÉ ES IMPORTANTE PARA PROVIAS?**

### **📈 Dashboards Ejecutivos**
Los directivos de PROVIAS necesitan ver el estado de todos los proyectos de un vistazo:
- Proyectos en verde si van bien, rojos si hay problemas
- Presupuestos que cambian de color según el uso
- Alertas que llaman la atención cuando es crítico

### **🎯 Interfaces Adaptativas**
Los usuarios de PROVIAS trabajan en diferentes condiciones:
- Oficinas con pantallas grandes (modo claro)
- Trabajo nocturno (modo oscuro)
- Usuarios con problemas visuales (alto contraste)
- Dispositivos móviles en campo (responsive)

### **⚡ Productividad**
Los ingenieros de PROVIAS necesitan trabajar rápido:
- Atajos de teclado para acciones frecuentes
- Interfaces que responden instantáneamente
- Estados visuales que comunican información rápidamente

---

## 🔧 **ESTRUCTURA TÉCNICA AVANZADA**

```
lab-2-binding-avanzado/
├── 📁 src/app/
│   ├── 📁 components/
│   │   ├── 📁 header/              ← Navegación con RouterLink
│   │   └── 📁 dashboard/           ← Dashboard con binding avanzado
│   ├── 📁 pages/
│   │   └── 📁 home/                ← Página educativa
│   ├── 📁 models/
│   │   └── 📄 dashboard.interface.ts ← Tipos complejos
│   ├── 📁 services/
│   │   └── 📄 dashboard.service.ts ← Estado y datos
│   ├── 📄 app.component.ts         ← App con routing
│   └── 📄 app.routes.ts            ← Configuración de rutas
├── 📄 angular.json                 ← Configuración del workspace
└── 📄 README.md                    ← Esta guía completa
```

---

## 🎓 **EJERCICIOS PASO A PASO**

### **Ejercicio 1: Experimentar con NgClass**
1. Ve al dashboard (http://localhost:4201/dashboard)
2. Abre DevTools (F12) y ve el elemento con clase "widget"
3. Cambia el tema y observa cómo cambian las clases automáticamente
4. **Pregúntate:** ¿Cómo sabe Angular qué clases aplicar?

### **Ejercicio 2: Modificar NgStyle**
1. En `dashboard.component.ts`, encuentra `getWidgetStyles()`
2. Agrega una nueva propiedad: `'border': '2px solid red'`
3. Observa cómo todos los widgets ahora tienen borde rojo
4. **Pregúntate:** ¿Por qué no necesitas tocar el CSS?

### **Ejercicio 3: Crear tu Propio HostListener**
1. En `dashboard.component.ts`, agrega:
```typescript
@HostListener('window:scroll', ['$event'])
onWindowScroll(event: Event) {
  console.log('¡Página scrolleada!', window.scrollY);
}
```
2. Haz scroll en la página y ve los logs en consola
3. **Pregúntate:** ¿Cómo puede el componente escuchar eventos de toda la ventana?

### **Ejercicio 4: Experimentar con HostBinding**
1. Agrega una nueva propiedad:
```typescript
@HostBinding('style.border-top') 
get topBorder() {
  return this.isFullscreen ? '5px solid gold' : 'none';
}
```
2. Activa pantalla completa (Ctrl+F) y ve el borde dorado
3. **Pregúntate:** ¿Cómo controla el componente sus propias propiedades?

---

## 🎛️ **FUNCIONALIDADES AVANZADAS**

### **🔍 Búsqueda con Estados Visuales**
```html
<input 
  [(ngModel)]="searchTerm"
  [class.has-value]="searchTerm.length > 0"
  (keydown)="onSearchKeydown($event)">
```
- El campo cambia de color cuando tiene texto
- Responde a Enter y Escape
- Muestra hints visuales al usuario

### **🎨 Temas con Variables CSS**
```typescript
@HostBinding('style.--primary-color') 
get primaryColorStyle() {
  return this.themeColors.primary;
}
```
- Cambia variables CSS desde TypeScript
- Actualización automática de toda la interfaz
- Temas consistentes en toda la aplicación

### **📊 Widgets con Estados Dinámicos**
```html
<div [ngClass]="getWidgetClasses(widget)" 
     [ngStyle]="getWidgetStyles(widget)"
     (click)="onWidgetClick(widget, $event)"
     (mouseenter)="onWidgetHover(widget, true)">
```
- Clases que cambian según el estado del widget
- Estilos calculados basados en datos
- Eventos que responden a interacciones

---

## 🚀 **CÓMO NAVEGAR EL LABORATORIO**

### **🏠 Página de Inicio (http://localhost:4201/home)**
**¿Qué verás?**
- Explicación detallada de cada técnica
- Cards interactivas con ejemplos
- Demostración en vivo de binding avanzado
- Enlaces al dashboard principal

**¿Qué puedes hacer?**
- Leer conceptos teóricos
- Ver ejemplos de código
- Hacer click en las cards para ver alerts explicativos
- Navegar al dashboard

### **📊 Dashboard Principal (http://localhost:4201/dashboard)**
**¿Qué verás?**
- 4 widgets con datos simulados de PROVIAS
- Barra de herramientas con búsqueda y controles
- Panel lateral con documentación en vivo
- Indicadores de estado en tiempo real

**¿Qué puedes hacer?**
- Buscar widgets por nombre
- Cambiar temas con el selector o Ctrl+D
- Activar pantalla completa con Ctrl+F
- Hacer hover sobre widgets para ver efectos
- Actualizar widgets individualmente

---

## 💡 **CASOS DE USO REALES EN PROVIAS**

### **📊 Centro de Control de Proyectos**
```typescript
// Ejemplo real: Widget de estado de proyectos
projectWidget = {
  title: 'Carretera Norte',
  status: 'en-progreso',
  progress: 68.5,
  budget: 125000000,
  alerts: 2
};

// NgClass dinámico basado en estado real
getProjectClasses(project) {
  return {
    'project-card': true,
    'status-on-track': project.progress >= project.expected,
    'status-delayed': project.progress < project.expected,
    'budget-warning': project.budgetUsed > project.budget * 0.8,
    'has-alerts': project.alerts > 0
  };
}
```

### **🚨 Sistema de Alertas Inteligente**
```typescript
// Ejemplo real: Alertas que cambian de apariencia
alertWidget = {
  critical: 2,    // Alertas críticas
  warning: 8,     // Advertencias
  info: 15        // Información
};

// NgStyle que pulsa cuando hay alertas críticas
getAlertStyles(alerts) {
  return {
    'background-color': alerts.critical > 0 ? '#fee2e2' : '#f3f4f6',
    'animation': alerts.critical > 0 ? 'pulse-alert 2s infinite' : 'none',
    'border-left': `4px solid ${alerts.critical > 0 ? '#ef4444' : '#6b7280'}`
  };
}
```

### **🎛️ Panel de Control Adaptativo**
```typescript
// Ejemplo real: Interface que se adapta al dispositivo
@HostListener('window:resize', ['$event'])
onWindowResize(event: Event) {
  const width = window.innerWidth;
  
  if (width < 768) {
    this.layoutMode = 'mobile';
    this.widgetsPerRow = 1;
  } else if (width < 1200) {
    this.layoutMode = 'tablet';
    this.widgetsPerRow = 2;
  } else {
    this.layoutMode = 'desktop';
    this.widgetsPerRow = 4;
  }
}
```

---

## 🎯 **DEBUGGING Y TROUBLESHOOTING**

### **🔍 Cómo Debuggear NgClass**
1. Abre Angular DevTools
2. Selecciona un elemento con NgClass
3. Ve la sección "Properties" para ver qué clases están activas
4. Modifica las condiciones en el componente y observa los cambios

### **🎨 Cómo Debuggear NgStyle**
1. Inspecciona el elemento en DevTools
2. Ve la sección "Styles" para ver los estilos aplicados
3. Busca los estilos que empiecen con `--` (variables CSS)
4. Modifica los valores en el componente y ve los cambios instantáneos

### **🎧 Cómo Debuggear HostListener**
1. Agrega `console.log()` en tus métodos HostListener
2. Ejecuta las acciones (teclas, resize, etc.)
3. Ve los logs en la consola para confirmar que se ejecutan
4. Usa breakpoints en DevTools para debugging detallado

---

## ⚡ **OPTIMIZACIÓN Y PERFORMANCE**

### **🎯 Mejores Prácticas**
```typescript
// ✅ BUENO: Método que retorna objeto
getWidgetClasses(widget: Widget) {
  return {
    'widget-active': widget.isActive,
    'widget-loading': this.isLoading
  };
}

// ❌ MALO: Crear objeto en template
[ngClass]="{'widget-active': widget.isActive, 'widget-loading': isLoading}"
```

### **📊 Performance Tips**
- **Usa métodos puros** para NgClass/NgStyle cuando sea posible
- **Evita cálculos complejos** en getters que se usan en templates
- **Implementa OnPush** change detection para componentes pesados
- **Usa trackBy** en ngFor para listas grandes

---

## 🏆 **CRITERIOS DE EVALUACIÓN**

### **Funcionalidad Avanzada (50%)**
- ✅ NgClass aplica clases correctamente según condiciones
- ✅ NgStyle calcula estilos dinámicamente
- ✅ HostListener responde a eventos globales
- ✅ HostBinding controla propiedades del host
- ✅ Temas cambian toda la interfaz correctamente

### **Interactividad (30%)**
- ✅ Atajos de teclado funcionan (Ctrl+F, Ctrl+D, Escape)
- ✅ Hover effects son suaves y responsivos
- ✅ Búsqueda filtra en tiempo real
- ✅ Widgets responden a clicks y eventos

### **Código y Arquitectura (20%)**
- ✅ Métodos están bien organizados y son reutilizables
- ✅ TypeScript está correctamente tipado
- ✅ No hay errores en consola
- ✅ Código sigue las mejores prácticas de Angular

---

## 🌟 **CONCEPTOS CLAVE PARA RECORDAR**

### **🎨 NgClass vs Class Binding**
- **[class.active]="isActive"** → Para una sola clase
- **[ngClass]="getClasses()"** → Para múltiples clases dinámicas

### **🎭 NgStyle vs Style Binding**
- **[style.color]="textColor"** → Para un solo estilo
- **[ngStyle]="getStyles()"** → Para múltiples estilos calculados

### **🎧 HostListener vs Event Binding**
- **(click)="method()"** → Eventos del elemento específico
- **@HostListener('window:keydown')** → Eventos globales

### **🎯 HostBinding vs Property Binding**
- **[class.active]="isActive"** → Binding desde template
- **@HostBinding('class.active')** → Binding desde componente

---

## 🚀 **PRÓXIMOS PASOS**

Después de dominar este lab, estarás listo para:

- **Lab 3:** Pipes Built-in y Async (Transformación de datos y programación reactiva)
- **Lab 4:** Pipes Personalizados (Crear tus propias herramientas de transformación)

**¡Cada lab te acerca más a ser un desarrollador Angular senior! 🎓**

---

**¡Prepárate para crear interfaces de nivel empresarial que impresionarán a cualquier CTO! 🚀**

*El dashboard que construyas hoy podría implementarse mañana mismo en las oficinas de PROVIAS*