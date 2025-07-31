# 🔄 LAB 1: CICLO DE VIDA DE COMPONENTES
**⏱️ Duración: 30 minutos | 🎯 Nivel: Fundamental**

---

## 📋 DESCRIPCIÓN

El ciclo de vida de componentes Angular es como el ciclo de vida de un empleado en una empresa. Desde el momento de la contratación hasta el día de jubilación, hay procesos específicos que ocurren en momentos determinados.

**Analogía del empleado:**
- **Constructor:** Proceso de contratación - solo se asignan recursos básicos
- **ngOnInit:** Primer día de trabajo - comienza la productividad real
- **ngOnChanges:** Cambios en responsabilidades - reacción a nuevas asignaciones
- **ngAfterViewInit:** Instalación completa en la oficina - todo está listo para funcionar
- **ngOnDestroy:** Último día - entrega de herramientas y limpieza

En este laboratorio crearás un componente que demuestra todos estos hooks con un sistema de logging profesional que te permitirá ver exactamente cuándo y cómo se ejecuta cada fase del ciclo de vida.

---

## 🎯 OBJETIVOS DE APRENDIZAJE

Al completar este laboratorio, serás capaz de:

✅ **Dominar todos los Lifecycle Hooks**
- Implementar constructor, ngOnInit, ngOnChanges, ngAfterViewInit, ngOnDestroy
- Entender cuándo usar cada hook para diferentes propósitos
- Aplicar mejores prácticas para optimización de rendimiento

✅ **Implementar gestión de recursos profesional**
- Crear y limpiar timers correctamente
- Manejar subscripciones sin memory leaks
- Implementar patrón de destrucción limpia

✅ **Crear sistema de logging avanzado**
- Desarrollar Logger Service con diferentes niveles (DEBUG, INFO, WARN, ERROR)
- Implementar monitoreo en tiempo real de eventos
- Manejar logs con persistencia y limpieza automática

✅ **Demostrar comunicación entre componentes**
- Integrar componente en aplicación principal
- Implementar controles de creación/destrucción dinámica
- Observar comportamiento en tiempo real

---

## 🧠 CONCEPTOS CLAVE

### 🔄 ¿Qué son los Lifecycle Hooks?

**Los Lifecycle Hooks son métodos especiales que Angular ejecuta en momentos específicos del ciclo de vida de un componente.** Son como eventos programados que ocurren automáticamente:

```typescript
// Orden de ejecución de Lifecycle Hooks:
// 1. constructor()      - Creación e inyección de dependencias
// 2. ngOnChanges()      - Cambios en @Input properties (si existen)
// 3. ngOnInit()         - Inicialización del componente
// 4. ngAfterContentInit() - Contenido proyectado inicializado
// 5. ngAfterViewInit()  - Vista completamente inicializada
// 6. ngOnDestroy()      - Antes de destruir el componente
```

### 🎯 Casos de Uso Prácticos

#### Constructor vs ngOnInit
```typescript
constructor() {
  // ✅ HACER: Solo inyección de dependencias
  this.logger = inject(LoggerService);
  
  // ❌ NO HACER: Llamadas HTTP, lógica pesada
  // this.loadUserData(); // ¡INCORRECTO!
}

ngOnInit() {
  // ✅ HACER: Inicialización, HTTP calls, subscripciones
  this.loadUserData();
  this.setupSubscriptions();
}
```

#### ngOnDestroy - Crucial para Memory Leaks
```typescript
ngOnDestroy() {
  // ✅ ESENCIAL: Limpiar recursos
  this.subscriptions.unsubscribe();
  clearInterval(this.timerId);
  this.websocketConnection.close();
  
  // Sin esto → Memory Leaks → Aplicación lenta
}
```

---

## 📚 FUNDAMENTOS TEÓRICOS

### 🔍 Anatomía de cada Lifecycle Hook

#### 1. Constructor
```typescript
constructor(private service: MyService) {
  // PROPÓSITO: Solo inyección de dependencias
  // TIMING: Antes de cualquier inicialización
  // USE CASE: Asignar servicios, inicializar variables básicas
}
```

#### 2. ngOnChanges
```typescript
ngOnChanges(changes: SimpleChanges): void {
  // PROPÓSITO: Reaccionar a cambios en @Input properties
  // TIMING: Antes de ngOnInit y cada vez que cambian inputs
  // USE CASE: Validar datos, transformar inputs, recargar info
  
  if (changes['userId'] && !changes['userId'].firstChange) {
    this.loadUserDetails(changes['userId'].currentValue);
  }
}
```

#### 3. ngOnInit
```typescript
ngOnInit(): void {
  // PROPÓSITO: Inicialización principal del componente
  // TIMING: Una vez, después de la primera ngOnChanges
  // USE CASE: HTTP calls, subscripciones, setup inicial
  
  this.userService.getUsers().subscribe(users => {
    this.users = users;
  });
}
```

#### 4. ngAfterViewInit
```typescript
ngAfterViewInit(): void {
  // PROPÓSITO: Acceso seguro a elementos del DOM
  // TIMING: Después de que la vista esté completamente renderizada
  // USE CASE: Manipular DOM, inicializar librerías externas
  
  // Ahora es seguro acceder a @ViewChild elements
  this.focusFirstInput();
}
```

#### 5. ngOnDestroy
```typescript
ngOnDestroy(): void {
  // PROPÓSITO: Limpieza de recursos
  // TIMING: Justo antes de que Angular destruya el componente
  // USE CASE: Unsubscribe, clearInterval, cleanup
  
  this.subscription.unsubscribe();
  clearInterval(this.timerId);
}
```

### 🚨 Errores Comunes y Cómo Evitarlos

#### ❌ Error #1: HTTP Calls en Constructor
```typescript
// INCORRECTO
constructor(private http: HttpClient) {
  this.http.get('/api/users').subscribe(); // ¡MAL!
}

// CORRECTO  
ngOnInit() {
  this.http.get('/api/users').subscribe();
}
```

#### ❌ Error #2: No limpiar subscripciones
```typescript
// INCORRECTO - Memory Leak
ngOnInit() {
  this.service.getData().subscribe(); // Se quedará ejecutándose
}

// CORRECTO - Con limpieza
private subscription = new Subscription();

ngOnInit() {
  const sub = this.service.getData().subscribe();
  this.subscription.add(sub);
}

ngOnDestroy() {
  this.subscription.unsubscribe();
}
```

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### PASO 1: Crear Componente con Lifecycle Hooks (12 minutos)

#### 1.1 Generar componente de demostración
```bash
# Crear componente standalone en carpeta components
ng generate component components/lifecycle-demo --standalone

# Verificar archivos creados:
# CREATE src/app/components/lifecycle-demo/lifecycle-demo.component.html
# CREATE src/app/components/lifecycle-demo/lifecycle-demo.component.spec.ts  
# CREATE src/app/components/lifecycle-demo/lifecycle-demo.component.ts
# CREATE src/app/components/lifecycle-demo/lifecycle-demo.component.scss
```

#### 1.2 Implementar lifecycle-demo.component.ts

**Archivo: `src/app/components/lifecycle-demo/lifecycle-demo.component.ts`**
```typescript
import { Component, OnInit, OnDestroy, OnChanges, AfterViewInit, 
         AfterContentInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-lifecycle-demo',
  standalone: true,
  imports: [],
  templateUrl: './lifecycle-demo.component.html',
  styleUrl: './lifecycle-demo.component.scss'
})
export class LifecycleDemoComponent implements OnInit, OnDestroy, 
  OnChanges, AfterViewInit, AfterContentInit {
  
  // 🎯 Input property para demostrar ngOnChanges
  @Input() inputData: string = '';
  
  // 📊 Variables para tracking del estado del componente
  private intervalId?: number;
  private startTime: number;
  
  constructor() {
    // 🔧 SOLO inyección de dependencias - nada más
    this.startTime = Date.now();
    this.logLifecycle('Constructor llamado - Solo inyección de dependencias');
  }
  
  // 🔄 Se ejecuta cuando cambian las propiedades @Input
  ngOnChanges(changes: SimpleChanges): void {
    this.logLifecycle('ngOnChanges - Input properties cambiaron', changes);
    
    // 🎯 Ejemplo práctico: reaccionar a cambios
    if (changes['inputData']) {
      const change = changes['inputData'];
      this.logLifecycle(`Input cambió de "${change.previousValue}" a "${change.currentValue}"`);
    }
  }
  
  // 🚀 Inicialización principal - aquí va la lógica de setup
  ngOnInit(): void {
    this.logLifecycle('ngOnInit - Componente inicializado, perfecto para HTTP calls');
    this.startTimer();
  }
  
  // 📝 Contenido proyectado inicializado (ng-content)
  ngAfterContentInit(): void {
    this.logLifecycle('ngAfterContentInit - Contenido proyectado inicializado');
  }
  
  // 👁️ Vista completamente inicializada - DOM accesible
  ngAfterViewInit(): void {
    this.logLifecycle('ngAfterViewInit - Vista completamente inicializada');
    // Aquí es seguro acceder a @ViewChild elements
  }
  
  // 🧹 CRUCIAL: Limpieza antes de destruir el componente
  ngOnDestroy(): void {
    this.logLifecycle('ngOnDestroy - Limpiando recursos antes de destruir');
    this.clearTimer();
    // Aquí iría: unsubscribe, clearInterval, cleanup general
  }
  
  // 🔄 Métodos privados para funcionalidad del demo
  
  /**
   * Inicia un timer para demostrar actividad del componente
   * 🎯 Simula un proceso que necesita limpieza en ngOnDestroy
   */
  private startTimer(): void {
    this.intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      console.log(`⏱️ Componente activo por ${elapsed} segundos`);
    }, 2000);
    
    this.logLifecycle('✅ Timer iniciado - se ejecuta cada 2 segundos');
  }
  
  /**
   * Limpia el timer para evitar memory leaks
   * 🚨 Sin esto, el timer seguiría ejecutándose después de destruir el componente
   */
  private clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logLifecycle('✅ Timer limpiado correctamente - No memory leaks');
    }
  }
  
  /**
   * Sistema de logging para visualizar lifecycle hooks
   * 📝 Ayuda a entender cuándo se ejecuta cada hook
   */
  private logLifecycle(message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `🔄 [${timestamp}] [LifecycleDemo] ${message}`;
    
    console.log(logMessage, data || '');
    
    // 🎨 Styling especial para diferentes tipos de logs
    if (message.includes('Constructor')) {
      console.log('%c🔧 Constructor', 'color: blue; font-weight: bold');
    } else if (message.includes('ngOnInit')) {
      console.log('%c🚀 Init', 'color: green; font-weight: bold');
    } else if (message.includes('ngOnDestroy')) {
      console.log('%c🧹 Destroy', 'color: red; font-weight: bold');
    }
  }
  
  // 🎮 Métodos públicos para interacción con el template
  
  /**
   * Simula cambio de input para demostrar ngOnChanges
   * 🔄 Permite al usuario ver ngOnChanges en acción
   */
  simulateInputChange(): void {
    this.inputData = `Datos actualizados: ${new Date().toLocaleTimeString()}`;
    this.logLifecycle('🎯 Input simulado manualmente desde template');
  }
  
  /**
   * Obtiene información del estado actual del componente
   * 📊 Útil para mostrar en el template
   */
  getComponentAge(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  /**
   * Verifica si el timer está activo
   * ✅ Permite mostrar estado en la UI
   */
  isTimerActive(): boolean {
    return this.intervalId !== undefined;
  }
}
```

#### 1.3 Crear template interactivo

**Archivo: `src/app/components/lifecycle-demo/lifecycle-demo.component.html`**
```html
<div class="lifecycle-container">
  <!-- 🎯 Header principal con información del demo -->
  <header class="demo-header">
    <h2>🔄 Demostración Lifecycle Hooks</h2>
    <p class="demo-description">
      Este componente demuestra todos los lifecycle hooks de Angular en acción.
      Abre las DevTools (F12) y ve a la pestaña Console para ver los logs en tiempo real.
    </p>
  </header>

  <!-- 📊 Panel de información del estado actual -->
  <section class="info-panel">
    <h3>📊 Estado del Componente</h3>
    
    <div class="info-grid">
      <div class="info-item">
        <label>📥 Input Data:</label>
        <span class="info-value">{{ inputData || 'Sin datos' }}</span>
      </div>
      
      <div class="info-item">
        <label>⏱️ Tiempo activo:</label>
        <span class="info-value">{{ getComponentAge() }} segundos</span>
      </div>
      
      <div class="info-item">
        <label>🔄 Timer estado:</label>
        <span class="info-value" [class.active]="isTimerActive()">
          {{ isTimerActive() ? '✅ Activo' : '❌ Inactivo' }}
        </span>
      </div>
      
      <div class="info-item">
        <label>📍 Última actualización:</label>
        <span class="info-value">{{ new Date().toLocaleTimeString() }}</span>
      </div>
    </div>
  </section>

  <!-- 🎮 Controles para interactuar con el componente -->
  <section class="controls-section">
    <h3>🎮 Controles de Demo</h3>
    
    <div class="controls">
      <button 
        (click)="simulateInputChange()" 
        class="btn btn-primary"
        title="Cambia el inputData para disparar ngOnChanges">
        🔄 Simular Cambio de Input
      </button>
      
      <button 
        onclick="window.location.reload()" 
        class="btn btn-secondary"
        title="Recarga la página para ver el ciclo completo desde constructor">
        🔄 Recargar Página
      </button>
    </div>
    
    <div class="control-hint">
      💡 <strong>Tip:</strong> Haz click en "Simular Cambio" para ver ngOnChanges en acción
    </div>
  </section>

  <!-- 📋 Instrucciones paso a paso -->
  <section class="instructions">
    <h3>📋 Instrucciones de Uso</h3>
    <ol class="instruction-list">
      <li>
        <strong>Abre DevTools:</strong> Presiona F12 o Ctrl+Shift+I
      </li>
      <li>
        <strong>Ve a Console:</strong> Click en la pestaña "Console"
      </li>
      <li>
        <strong>Observa logs iniciales:</strong> Verás constructor, ngOnInit, etc.
      </li>
      <li>
        <strong>Interactúa:</strong> Click en "Simular Cambio de Input"
      </li>
      <li>
        <strong>Observa ngOnChanges:</strong> Verás logs del cambio de input
      </li>
      <li>
        <strong>Navega:</strong> Ve a otra página para ver ngOnDestroy
      </li>
    </ol>
  </section>

  <!-- 🎯 Información educativa sobre cada hook -->
  <section class="lifecycle-info">
    <h3>🎯 Lifecycle Hooks Implementados</h3>
    
    <div class="hooks-grid">
      <div class="hook-card constructor">
        <div class="hook-icon">🔧</div>
        <h4>constructor()</h4>
        <p><strong>Propósito:</strong> Inyección de dependencias únicamente</p>
        <p><strong>Timing:</strong> Antes de cualquier inicialización</p>
        <p><strong>Uso:</strong> Asignar servicios, variables básicas</p>
      </div>
      
      <div class="hook-card on-changes">
        <div class="hook-icon">🔄</div>
        <h4>ngOnChanges()</h4>
        <p><strong>Propósito:</strong> Reaccionar a cambios en @Input</p>
        <p><strong>Timing:</strong> Cada vez que cambian las propiedades input</p>
        <p><strong>Uso:</strong> Validar datos, transformar inputs</p>
      </div>
      
      <div class="hook-card on-init">
        <div class="hook-icon">🚀</div>
        <h4>ngOnInit()</h4>
        <p><strong>Propósito:</strong> Inicialización principal</p>
        <p><strong>Timing:</strong> Una vez después de primer ngOnChanges</p>
        <p><strong>Uso:</strong> HTTP calls, subscripciones, setup</p>
      </div>
      
      <div class="hook-card after-content">
        <div class="hook-icon">📝</div>
        <h4>ngAfterContentInit()</h4>
        <p><strong>Propósito:</strong> Contenido proyectado listo</p>
        <p><strong>Timing:</strong> Después de proyectar contenido</p>
        <p><strong>Uso:</strong> Interactuar con ng-content</p>
      </div>
      
      <div class="hook-card after-view">
        <div class="hook-icon">👁️</div>
        <h4>ngAfterViewInit()</h4>
        <p><strong>Propósito:</strong> Vista completamente inicializada</p>
        <p><strong>Timing:</strong> Después de renderizar vista</p>
        <p><strong>Uso:</strong> Manipular DOM, @ViewChild</p>
      </div>
      
      <div class="hook-card on-destroy">
        <div class="hook-icon">🧹</div>
        <h4>ngOnDestroy()</h4>
        <p><strong>Propósito:</strong> Limpieza de recursos</p>
        <p><strong>Timing:</strong> Antes de destruir componente</p>
        <p><strong>Uso:</strong> Unsubscribe, clearInterval</p>
      </div>
    </div>
  </section>

  <!-- ⚠️ Sección de mejores prácticas -->
  <section class="best-practices">
    <h3>⚠️ Mejores Prácticas y Errores Comunes</h3>
    
    <div class="practices-grid">
      <div class="practice-card do">
        <h4>✅ SÍ HACER</h4>
        <ul>
          <li>Usar constructor solo para inyección de dependencias</li>
          <li>Hacer HTTP calls en ngOnInit</li>
          <li>Limpiar subscripciones en ngOnDestroy</li>
          <li>Usar ngOnChanges para validar @Input</li>
        </ul>
      </div>
      
      <div class="practice-card dont">
        <h4>❌ NO HACER</h4>
        <ul>
          <li>HTTP calls en constructor</li>
          <li>Olvidar implementar ngOnDestroy</li>
          <li>Manipular DOM antes de ngAfterViewInit</li>
          <li>Subscripciones sin unsubscribe</li>
        </ul>
      </div>
    </div>
  </section>
</div>
```

#### 1.4 Agregar estilos profesionales

**Archivo: `src/app/components/lifecycle-demo/lifecycle-demo.component.scss`**
```scss
.lifecycle-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  
  // 🎨 Header principal
  .demo-header {
    text-align: center;
    margin-bottom: 3rem;
    
    h2 {
      color: #2c3e50;
      font-size: 2.2rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .demo-description {
      color: #6c757d;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }
  }
  
  // 📊 Panel de información del estado
  .info-panel {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    
    h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.4rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        backdrop-filter: blur(10px);
        
        label {
          font-weight: 600;
        }
        
        .info-value {
          font-family: 'Monaco', 'Consolas', monospace;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          
          &.active {
            background: rgba(40, 167, 69, 0.8);
            animation: pulse 2s infinite;
          }
        }
      }
    }
  }
  
  // 🎮 Sección de controles
  .controls-section {
    margin-bottom: 2rem;
    
    h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .controls {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    .control-hint {
      color: #6c757d;
      font-style: italic;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #17a2b8;
    }
  }
  
  // 📋 Instrucciones
  .instructions {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 12px;
    border-left: 4px solid #17a2b8;
    margin-bottom: 2rem;
    
    h3 {
      color: #17a2b8;
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
    
    .instruction-list {
      margin: 0;
      padding-left: 2rem;
      
      li {
        margin: 1rem 0;
        line-height: 1.6;
        
        strong {
          color: #2c3e50;
        }
      }
    }
  }
  
  // 🎯 Información de hooks
  .lifecycle-info {
    margin-bottom: 2rem;
    
    h3 {
      color: #2c3e50;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .hooks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      
      .hook-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-left: 4px solid;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .hook-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        h4 {
          margin: 0.5rem 0;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 1.1rem;
        }
        
        p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          
          strong {
            color: #2c3e50;
          }
        }
        
        // Colores específicos por hook
        &.constructor { border-left-color: #007bff; }
        &.on-changes { border-left-color: #ffc107; }
        &.on-init { border-left-color: #28a745; }
        &.after-content { border-left-color: #17a2b8; }
        &.after-view { border-left-color: #6f42c1; }
        &.on-destroy { border-left-color: #dc3545; }
      }
    }
  }
  
  // ⚠️ Mejores prácticas
  .best-practices {
    h3 {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .practices-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      
      .practice-card {
        padding: 1.5rem;
        border-radius: 12px;
        
        &.do {
          background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%);
          border: 2px solid #28a745;
        }
        
        &.dont {
          background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
          border: 2px solid #dc3545;
        }
        
        h4 {
          margin-top: 0;
          margin-bottom: 1rem;
          
          .do & { color: #28a745; }
          .dont & { color: #dc3545; }
        }
        
        ul {
          margin: 0;
          padding-left: 1.5rem;
          
          li {
            margin: 0.5rem 0;
            line-height: 1.4;
          }
        }
      }
    }
  }
}

// 🎨 Animaciones
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

// 🔘 Estilos globales para botones
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }
  }
  
  &.btn-secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
}

// 📱 Responsive design
@media (max-width: 768px) {
  .lifecycle-container {
    margin: 1rem;
    padding: 1rem;
    
    .demo-header h2 {
      font-size: 1.8rem;
    }
    
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .hooks-grid {
      grid-template-columns: 1fr;
    }
    
    .practices-grid {
      grid-template-columns: 1fr;
    }
    
    .controls {
      flex-direction: column;
    }
  }
}
```

**✅ Checkpoint 1:** Debes tener un componente que demuestra todos los lifecycle hooks con una interfaz atractiva y funcional.

---

### PASO 2: Crear Logger Service (8 minutos)

#### 2.1 Generar service para logging
```bash
# Crear Logger Service en la carpeta services
ng generate service services/logger

# Verificar archivos creados:
# CREATE src/app/services/logger.service.spec.ts
# CREATE src/app/services/logger.service.ts
```

#### 2.2 Implementar logger service avanzado

**Archivo: `src/app/services/logger.service.ts`**
```typescript
import { Injectable } from '@angular/core';

/**
 * 📊 Niveles de logging según severidad
 * DEBUG < INFO < WARN < ERROR
 */
export enum LogLevel {
  DEBUG = 0,  // Información detallada para desarrollo
  INFO = 1,   // Información general del flujo
  WARN = 2,   // Advertencias que no rompen funcionalidad
  ERROR = 3   // Errores que requieren atención inmediata
}

/**
 * 📝 Estructura de una entrada de log
 * Contiene toda la información necesaria para debugging
 */
export interface LogEntry {
  timestamp: Date;      // Cuándo ocurrió
  level: LogLevel;      // Qué tan importante es
  component: string;    // Dónde ocurrió
  message: string;      // Qué pasó
  data?: any;          // Información adicional opcional
}

/**
 * 🔧 Configuración del Logger Service
 */
export interface LoggerConfig {
  minLevel: LogLevel;           // Nivel mínimo a mostrar
  maxEntries: number;          // Máximo de logs a mantener
  persistToStorage: boolean;   // Guardar en localStorage
  enableConsoleOutput: boolean; // Mostrar en console del browser
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  // 📚 Array para almacenar todos los logs
  private logs: LogEntry[] = [];
  
  // ⚙️ Configuración por defecto
  private config: LoggerConfig = {
    minLevel: LogLevel.DEBUG,
    maxEntries: 100,
    persistToStorage: false,
    enableConsoleOutput: true
  };
  
  constructor() {
    this.info('LoggerService', 'Logger service inicializado correctamente');
    this.loadStoredLogs();
  }
  
  // 🎯 Métodos públicos para cada nivel de log
  
  /**
   * 🐛 Log nivel DEBUG - Para información muy detallada
   * Uso: Debugging, variables internas, flujo detallado
   */
  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }
  
  /**
   * ℹ️ Log nivel INFO - Para información general
   * Uso: Inicialización, operaciones normales, confirmaciones
   */
  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }
  
  /**
   * ⚠️ Log nivel WARN - Para advertencias
   * Uso: Situaciones inusuales pero no críticas, deprecations
   */
  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }
  
  /**
   * ❌ Log nivel ERROR - Para errores críticos
   * Uso: Exceptions, fallos de API, errores de validación
   */
  error(component: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data);
  }
  
  // 🔧 Métodos de configuración y gestión
  
  /**
   * 📝 Método principal de logging
   * Centraliza toda la lógica de logging
   */
  private log(level: LogLevel, component: string, message: string, data?: any): void {
    // 🚫 Filtrar por nivel mínimo configurado
    if (level < this.config.minLevel) {
      return;
    }
    
    // 📦 Crear entrada de log
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      data
    };
    
    // 💾 Agregar al array de logs
    this.logs.push(logEntry);
    
    // 🧹 Mantener solo los últimos N logs para evitar memory leaks
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }
    
    // 🖥️ Mostrar en console si está habilitado
    if (this.config.enableConsoleOutput) {
      this.consoleLog(logEntry);
    }
    
    // 💾 Persistir si está configurado
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }
  
  /**
   * 🖥️ Mostrar log en console con formato y colores
   * Cada nivel tiene su propio estilo visual
   */
  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const levelEmoji = this.getLevelEmoji(entry.level);
    const message = `${levelEmoji} [${timestamp}] [${entry.component}] ${entry.message}`;
    
    // 🎨 Estilos específicos por nivel
    const styles = this.getLevelStyles(entry.level);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${message}`, styles, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`%c${message}`, styles, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`%c${message}`, styles, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`%c${message}`, styles, entry.data || '');
        break;
    }
  }
  
  /**
   * 🎨 Obtener emoji representativo para cada nivel
   */
  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.DEBUG]: '🐛',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌'
    };
    return emojis[level] || '📝';
  }
  
  /**
   * 🎨 Obtener estilos CSS para console.log con colores
   */
  private getLevelStyles(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: #6c757d; font-weight: normal;',
      [LogLevel.INFO]: 'color: #007bff; font-weight: bold;',
      [LogLevel.WARN]: 'color: #ffc107; font-weight: bold; background: #fff3cd;',
      [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold; background: #f8d7da;'
    };
    return styles[level] || 'color: #333;';
  }
  
  // 🔍 Métodos de consulta y gestión
  
  /**
   * 📋 Obtener todos los logs (copia para evitar mutación)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * 🔍 Obtener logs filtrados por nivel
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
  
  /**
   * 🔍 Obtener logs de un componente específico
   */
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter(log => log.component === component);
  }
  
  /**
   * 🧹 Limpiar todos los logs
   */
  clearLogs(): void {
    this.logs = [];
    if (this.config.persistToStorage) {
      localStorage.removeItem('angular-logs');
    }
    this.info('LoggerService', 'Todos los logs han sido limpiados');
  }
  
  /**
   * ⚙️ Cambiar nivel mínimo de logging
   */
  setLogLevel(level: LogLevel): void {
    this.config.minLevel = level;
    this.info('LoggerService', `Nivel de logging cambiado a ${LogLevel[level]}`);
  }
  
  /**
   * ⚙️ Actualizar configuración del logger
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.info('LoggerService', 'Configuración del logger actualizada', newConfig);
  }
  
  // 💾 Métodos de persistencia
  
  /**
   * 💾 Guardar logs en localStorage
   */
  private saveToStorage(): void {
    try {
      const logsToSave = this.logs.slice(-50); // Solo los últimos 50
      localStorage.setItem('angular-logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Error guardando logs en localStorage:', error);
    }
  }
  
  /**
   * 📥 Cargar logs desde localStorage
   */
  private loadStoredLogs(): void {
    if (!this.config.persistToStorage) return;
    
    try {
      const storedLogs = localStorage.getItem('angular-logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        this.info('LoggerService', `${this.logs.length} logs cargados desde localStorage`);
      }
    } catch (error) {
      this.error('LoggerService', 'Error cargando logs desde localStorage', error);
    }
  }
  
  // 📊 Métodos de estadísticas
  
  /**
   * 📊 Obtener estadísticas de logs
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      debug: this.getLogsByLevel(LogLevel.DEBUG).length,
      info: this.getLogsByLevel(LogLevel.INFO).length,
      warn: this.getLogsByLevel(LogLevel.WARN).length,
      error: this.getLogsByLevel(LogLevel.ERROR).length,
      components: [...new Set(this.logs.map(log => log.component))].length
    };
    
    this.debug('LoggerService', 'Estadísticas de logs calculadas', stats);
    return stats;
  }
  
  /**
   * 📤 Exportar logs en formato texto
   */
  exportLogs(): string {
    return this.logs.map(log => {
      const timestamp = log.timestamp.toISOString();
      const level = LogLevel[log.level];
      const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `[${timestamp}] [${level}] [${log.component}] ${log.message}${data}`;
    }).join('\n');
  }
}
```

**✅ Checkpoint 2:** Debes tener un Logger Service completo que maneja diferentes niveles de logging con persistencia y estadísticas.

---

### PASO 3: Integrar Logger en Componente (5 minutos)

#### 3.1 Actualizar lifecycle component para usar logger

**Actualizar archivo: `src/app/components/lifecycle-demo/lifecycle-demo.component.ts`**

Reemplazar las importaciones y el método logLifecycle:

```typescript
// 📦 Importaciones actualizadas
import { Component, OnInit, OnDestroy, OnChanges, AfterViewInit, 
         AfterContentInit, Input, SimpleChanges } from '@angular/core';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-lifecycle-demo',
  standalone: true,
  imports: [],
  templateUrl: './lifecycle-demo.component.html',
  styleUrl: './lifecycle-demo.component.scss'
})
export class LifecycleDemoComponent implements OnInit, OnDestroy, 
  OnChanges, AfterViewInit, AfterContentInit {
  
  @Input() inputData: string = '';
  
  private intervalId?: number;
  private startTime: number;
  
  // 🔧 Inyectar Logger Service
  constructor(private logger: LoggerService) {
    this.startTime = Date.now();
    this.logger.debug('LifecycleDemoComponent', 'Constructor - Componente creado e inyección completada');
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.logger.info('LifecycleDemoComponent', 'ngOnChanges ejecutado', {
      changes: Object.keys(changes),
      inputData: changes['inputData']
    });
    
    // 🎯 Log específico para cambios de input
    if (changes['inputData']) {
      const change = changes['inputData'];
      this.logger.debug('LifecycleDemoComponent', 
        `Input Data cambió: "${change.previousValue}" → "${change.currentValue}"`);
    }
  }
  
  ngOnInit(): void {
    this.logger.info('LifecycleDemoComponent', 'ngOnInit - Inicializando componente, momento ideal para HTTP calls');
    this.startTimer();
  }
  
  ngAfterContentInit(): void {
    this.logger.debug('LifecycleDemoComponent', 'ngAfterContentInit - Contenido proyectado inicializado');
  }
  
  ngAfterViewInit(): void {
    this.logger.debug('LifecycleDemoComponent', 'ngAfterViewInit - Vista completamente renderizada, DOM accesible');
  }
  
  ngOnDestroy(): void {
    this.logger.warn('LifecycleDemoComponent', 'ngOnDestroy - Iniciando limpieza de recursos antes de destruir');
    this.clearTimer();
    this.logger.info('LifecycleDemoComponent', 'ngOnDestroy completado - Componente listo para destrucción');
  }
  
  // 🔄 Métodos actualizados con logging detallado
  
  private startTimer(): void {
    this.intervalId = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.logger.debug('LifecycleDemoComponent', `Timer tick: componente activo por ${elapsed} segundos`);
    }, 3000); // Cada 3 segundos para reducir spam en logs
    
    this.logger.info('LifecycleDemoComponent', 'Timer iniciado exitosamente', {
      interval: '3 segundos',
      timerId: this.intervalId
    });
  }
  
  private clearTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.info('LifecycleDemoComponent', 'Timer limpiado correctamente - Sin memory leaks', {
        timerId: this.intervalId
      });
      this.intervalId = undefined;
    } else {
      this.logger.warn('LifecycleDemoComponent', 'Intento de limpiar timer que no existía');
    }
  }
  
  // 🎮 Métodos públicos actualizados
  
  simulateInputChange(): void {
    const oldValue = this.inputData;
    const newValue = `Actualizado: ${new Date().toLocaleTimeString()}`;
    this.inputData = newValue;
    
    this.logger.info('LifecycleDemoComponent', 'Input simulado manualmente desde template', {
      previousValue: oldValue,
      newValue: newValue,
      timestamp: new Date().toISOString()
    });
  }
  
  getComponentAge(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  isTimerActive(): boolean {
    return this.intervalId !== undefined;
  }
  
  // 🔧 Nuevos métodos para interactuar con el logger
  
  /**
   * 🧹 Limpiar todos los logs desde el componente
   */
  clearLogs(): void {
    this.logger.clearLogs();
  }
  
  /**
   * 📊 Obtener estadísticas de logs
   */
  getLogStats() {
    return this.logger.getStats();
  }
  
  /**
   * 🎯 Demostrar diferentes niveles de log
   */
  demonstrateLogLevels(): void {
    this.logger.debug('LifecycleDemoComponent', 'Ejemplo de log DEBUG', { tipo: 'demo' });
    this.logger.info('LifecycleDemoComponent', 'Ejemplo de log INFO', { tipo: 'demo' });
    this.logger.warn('LifecycleDemoComponent', 'Ejemplo de log WARNING', { tipo: 'demo' });
    this.logger.error('LifecycleDemoComponent', 'Ejemplo de log ERROR', { tipo: 'demo' });
  }
}
```

#### 3.2 Actualizar template con nuevas funcionalidades

**Agregar al final de `lifecycle-demo.component.html`, antes del cierre del div principal:**

```html
  <!-- 🔧 Sección del Logger Service Demo -->
  <section class="logger-demo">
    <h3>📝 Logger Service en Acción</h3>
    
    <div class="logger-controls">
      <button 
        (click)="demonstrateLogLevels()" 
        class="btn btn-primary"
        title="Genera logs de todos los niveles para demo">
        🎯 Demostrar Niveles de Log
      </button>
      
      <button 
        (click)="clearLogs()" 
        class="btn btn-secondary"
        title="Limpia todos los logs del Logger Service">
        🧹 Limpiar Logs
      </button>
    </div>
    
    <div class="log-stats">
      <h4>📊 Estadísticas de Logging</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Total de logs:</span>
          <span class="stat-value">{{ getLogStats().total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Componentes loggeando:</span>
          <span class="stat-value">{{ getLogStats().components }}</span>
        </div>
        <div class="stat-item debug">
          <span class="stat-label">🐛 DEBUG:</span>
          <span class="stat-value">{{ getLogStats().debug }}</span>
        </div>
        <div class="stat-item info">
          <span class="stat-label">ℹ️ INFO:</span>
          <span class="stat-value">{{ getLogStats().info }}</span>
        </div>
        <div class="stat-item warn">
          <span class="stat-label">⚠️ WARN:</span>
          <span class="stat-value">{{ getLogStats().warn }}</span>
        </div>
        <div class="stat-item error">
          <span class="stat-label">❌ ERROR:</span>
          <span class="stat-value">{{ getLogStats().error }}</span>
        </div>
      </div>
    </div>
    
    <div class="logger-info">
      <h4>🎯 Características del Logger Service</h4>
      <ul>
        <li>✅ <strong>Niveles jerárquicos:</strong> DEBUG → INFO → WARN → ERROR</li>
        <li>✅ <strong>Filtrado automático:</strong> Solo muestra logs del nivel configurado hacia arriba</li>
        <li>✅ <strong>Formato consistente:</strong> Timestamp, componente, mensaje y datos</li>
        <li>✅ <strong>Colores en console:</strong> Cada nivel tiene su propio estilo visual</li>
        <li>✅ <strong>Gestión de memoria:</strong> Limita automáticamente el número de logs</li>
        <li>✅ <strong>Estadísticas:</strong> Información agregada sobre el logging</li>
      </ul>
    </div>
  </section>
```

#### 3.3 Agregar estilos para la nueva sección

**Agregar al final de `lifecycle-demo.component.scss`:**

```scss
// 📝 Estilos para la sección del Logger Service
.logger-demo {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid #dee2e6;
  
  h3 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .logger-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }
  
  .log-stats {
    margin-bottom: 1.5rem;
    
    h4 {
      color: #495057;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background: white;
        border-radius: 6px;
        border-left: 3px solid #6c757d;
        
        .stat-label {
          font-weight: 500;
        }
        
        .stat-value {
          font-weight: bold;
          font-family: 'Monaco', 'Consolas', monospace;
          color: #2c3e50;
        }
        
        // Colores específicos por nivel
        &.debug { border-left-color: #6c757d; }
        &.info { border-left-color: #007bff; }
        &.warn { border-left-color: #ffc107; }
        &.error { border-left-color: #dc3545; }
      }
    }
  }
  
  .logger-info {
    h4 {
      color: #495057;
      margin-bottom: 1rem;
    }
    
    ul {
      margin: 0;
      padding-left: 1.5rem;
      
      li {
        margin: 0.5rem 0;
        line-height: 1.5;
        
        strong {
          color: #2c3e50;
        }
      }
    }
  }
}
```

**✅ Checkpoint 3:** El componente ahora está integrado con el Logger Service y muestra estadísticas de logging en tiempo real.

---

### PASO 4: Integrar en Aplicación Principal (5 minutos)

#### 4.1 Agregar componente a app.component.ts

**Actualizar archivo: `src/app/app.component.ts`**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LifecycleDemoComponent } from './components/lifecycle-demo/lifecycle-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LifecycleDemoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Sesión 2 - LAB 1: Ciclo de Vida de Componentes';
  showLifecycleDemo = true;
  inputDataForChild = 'Datos iniciales desde componente padre';
  
  /**
   * 🔄 Toggle para mostrar/ocultar componente y demostrar ngOnDestroy
   */
  toggleLifecycleDemo(): void {
    this.showLifecycleDemo = !this.showLifecycleDemo;
    console.log(`%c🎮 [AppComponent] Demo ${this.showLifecycleDemo ? 'CREADO' : 'DESTRUIDO'}`, 
      'color: purple; font-weight: bold; font-size: 14px;');
  }
  
  /**
   * 🎯 Cambiar datos del input para demostrar ngOnChanges
   */
  updateInputData(): void {
    this.inputDataForChild = `Actualizado desde padre: ${new Date().toLocaleTimeString()}`;
    console.log(`%c📤 [AppComponent] Input data actualizado`, 
      'color: green; font-weight: bold;');
  }
}
```

#### 4.2 Actualizar app.component.html

**Reemplazar contenido de `src/app/app.component.html`:**
```html
<div class="app-layout">
  <!-- 🎯 Header de la aplicación -->
  <header class="app-header">
    <div class="header-content">
      <h1>{{ title }}</h1>
      <p class="subtitle">🏗️ PROVIAS DESCENTRALIZADO - Angular v18</p>
    </div>
  </header>

  <!-- 📱 Contenido principal -->
  <main class="main-content">
    <div class="container">
      <!-- 🎮 Panel de control principal -->
      <section class="control-panel">
        <h2>🎮 Panel de Control del Laboratorio</h2>
        
        <div class="controls-grid">
          <div class="control-group">
            <h3>🔄 Gestión del Componente</h3>
            <div class="button-group">
              <button 
                (click)="toggleLifecycleDemo()" 
                class="btn"
                [class.btn-danger]="showLifecycleDemo"
                [class.btn-success]="!showLifecycleDemo">
                {{ showLifecycleDemo ? '🗑️ Destruir Componente' : '🔄 Crear Componente' }}
              </button>
              
              <span class="status-indicator" [class.active]="showLifecycleDemo">
                Estado: {{ showLifecycleDemo ? '✅ Activo' : '❌ Destruido' }}
              </span>
            </div>
          </div>
          
          <div class="control-group">
            <h3>📤 Comunicación Parent → Child</h3>
            <div class="button-group">
              <button 
                (click)="updateInputData()" 
                class="btn btn-primary"
                [disabled]="!showLifecycleDemo">
                🎯 Actualizar @Input Data
              </button>
              
              <div class="input-preview">
                <strong>Valor actual:</strong>
                <code>{{ inputDataForChild }}</code>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 📋 Instrucciones de uso -->
        <div class="instructions-mini">
          <h4>📋 Instrucciones Rápidas:</h4>
          <ol>
            <li><strong>Abre DevTools (F12)</strong> y ve a Console</li>
            <li><strong>Observa logs</strong> de constructor, ngOnInit, etc.</li>
            <li><strong>Click "Actualizar @Input"</strong> para ver ngOnChanges</li>
            <li><strong>Click "Destruir Componente"</strong> para ver ngOnDestroy</li>
            <li><strong>Click "Crear Componente"</strong> para ver el ciclo completo otra vez</li>
          </ol>
        </div>
      </section>

      <!-- 🧪 Área del componente demo -->
      <section class="demo-area">
        @if (showLifecycleDemo) {
          <div class="component-container">
            <div class="component-header">
              <h3>🔄 Componente Lifecycle Demo Activo</h3>
              <p>El componente está vivo y ejecutando sus lifecycle hooks</p>
            </div>
            
            <!-- 🎯 Aquí se renderiza nuestro componente con @Input -->
            <app-lifecycle-demo [inputData]="inputDataForChild">
            </app-lifecycle-demo>
          </div>
        } @else {
          <div class="component-destroyed">
            <div class="destroyed-state">
              <h3>💀 Componente Destruido</h3>
              <p>El componente ha sido destruido y ngOnDestroy se ejecutó.</p>
              <p>🔍 <strong>Revisa la console</strong> para ver el log de limpieza de recursos.</p>
              
              <div class="destruction-info">
                <h4>🧹 Qué sucedió en ngOnDestroy:</h4>
                <ul>
                  <li>✅ Timer fue limpiado (clearInterval)</li>
                  <li>✅ Logs de destrucción fueron generados</li>
                  <li>✅ Recursos fueron liberados correctamente</li>
                  <li>✅ No hay memory leaks</li>
                </ul>
              </div>
              
              <button 
                (click)="toggleLifecycleDemo()" 
                class="btn btn-success btn-lg">
                🔄 Crear Componente Nuevamente
              </button>
            </div>
          </div>
        }
      </section>
    </div>
  </main>

  <!-- 🦶 Footer con información técnica -->
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; 2025 PROVIAS - LAB 1: Lifecycle Hooks completado</p>
      <small>Ing. Jhonny Alexander Ramirez Chiroque - Angular v18 Course</small>
    </div>
  </footer>
</div>
```

#### 4.3 Agregar estilos para app.component.scss

**Reemplazar contenido de `src/app/app.component.scss`:**
```scss
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

// 🎯 Header de la aplicación
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    
    h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .subtitle {
      margin: 0.5rem 0 0 0;
      font-size: 1.2rem;
      opacity: 0.9;
    }
  }
}

// 📱 Contenido principal
.main-content {
  flex: 1;
  padding: 2rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
}

// 🎮 Panel de control
.control-panel {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  
  h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 1.8rem;
  }
  
  .controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .control-group {
    h3 {
      color: #495057;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      .status-indicator {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        text-align: center;
        background: #dc3545;
        color: white;
        
        &.active {
          background: #28a745;
        }
      }
    }
    
    .input-preview {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #007bff;
      
      strong {
        color: #2c3e50;
      }
      
      code {
        display: block;
        background: #e9ecef;
        padding: 0.5rem;
        border-radius: 4px;
        margin-top: 0.5rem;
        font-family: 'Monaco', 'Consolas', monospace;
        color: #d63384;
        word-break: break-word;
      }
    }
  }
  
  .instructions-mini {
    background: #e7f3ff;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #007bff;
    
    h4 {
      color: #007bff;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    
    ol {
      margin: 0;
      padding-left: 1.5rem;
      
      li {
        margin: 0.5rem 0;
        line-height: 1.5;
        
        strong {
          color: #2c3e50;
        }
      }
    }
  }
}

// 🧪 Área del demo
.demo-area {
  .component-container {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    
    .component-header {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 1.5rem;
      text-align: center;
      
      h3 {
        margin: 0;
        font-size: 1.4rem;
      }
      
      p {
        margin: 0.5rem 0 0 0;
        opacity: 0.9;
      }
    }
  }
  
  .component-destroyed {
    background: white;
    border-radius: 15px;
    padding: 3rem;
    text-align: center;
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.1);
    border: 2px solid #dc3545;
    
    .destroyed-state {
      h3 {
        color: #dc3545;
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      
      > p {
        color: #6c757d;
        font-size: 1.1rem;
        margin: 0.5rem 0;
      }
      
      .destruction-info {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin: 2rem 0;
        text-align: left;
        
        h4 {
          color: #dc3545;
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        ul {
          margin: 0;
          padding-left: 1.5rem;
          
          li {
            margin: 0.5rem 0;
            color: #495057;
          }
        }
      }
    }
  }
}

// 🦶 Footer
.app-footer {
  background: #2c3e50;
  color: white;
  padding: 1.5rem 0;
  text-align: center;
  margin-top: auto;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    
    p {
      margin: 0;
      font-size: 1rem;
    }
    
    small {
      opacity: 0.8;
      font-size: 0.9rem;
    }
  }
}

// 🔘 Estilos globales para botones
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 200px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
  }
  
  &.btn-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
  }
  
  &.btn-danger {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
  }
  
  &.btn-lg {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    min-width: 250px;
  }
}

// 📱 Responsive design
@media (max-width: 768px) {
  .app-header {
    padding: 1.5rem 0;
    
    .header-content h1 {
      font-size: 2rem;
    }
    
    .subtitle {
      font-size: 1rem;
    }
  }
  
  .control-panel {
    padding: 1.5rem;
    
    .controls-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  
  .component-destroyed {
    padding: 2rem 1rem;
  }
  
  .btn {
    min-width: 100%;
    padding: 1rem;
  }
}
```

**✅ Checkpoint 4:** La aplicación principal ahora tiene controles para crear/destruir el componente y actualizar sus inputs, demostrando todo el ciclo de vida.

---

## ✅ RESULTADO ESPERADO DEL LAB 1

Al completar este laboratorio debes tener:

### 🎯 Funcional
- [ ] ✅ **Componente con todos los lifecycle hooks implementados**
  - Constructor, ngOnInit, ngOnChanges, ngAfterViewInit, ngOnDestroy
  - Cada hook con logging detallado y propósito claro
  - Ejemplos prácticos de cuándo usar cada uno

- [ ] ✅ **Logger Service funcionando y registrando eventos**
  - Diferentes niveles: DEBUG, INFO, WARN, ERROR
  - Formato consistente con timestamp y componente
  - Estadísticas en tiempo real
  - Gestión de memoria automática

- [ ] ✅ **Capacidad de crear/destruir componente dinámicamente**
  - Botón para toggle del componente
  - Observación de ngOnDestroy en acción
  - Verificación de limpieza de recursos

- [ ] ✅ **Console mostrando secuencia completa de lifecycle hooks**
  - Logs con colores y formato profesional
  - Secuencia correcta de ejecución
  - Información detallada de cada evento

- [ ] ✅ **Timer implementado y limpiado correctamente**
  - setInterval funcionando en ngOnInit
  - clearInterval en ngOnDestroy
  - Sin memory leaks al destruir componente

- [ ] ✅ **Comprensión práctica de cuándo usar cada hook**
  - Constructor: Solo inyección de dependencias
  - ngOnInit: HTTP calls, inicialización
  - ngOnDestroy: Limpieza obligatoria

### 🔧 Técnico
- [ ] **Código bien documentado** con comentarios explicativos
- [ ] **Arquitectura escalable** con services separados
- [ ] **Logging profesional** con múltiples niveles
- [ ] **Gestión de memoria** sin leaks
- [ ] **UI responsiva** y profesional

---

## 🚨 TROUBLESHOOTING

### Problema: Los logs no aparecen en console
```bash
# Verificar que el Logger Service esté inyectado correctamente
# Verificar que console de DevTools esté en la pestaña correcta
# Verificar filtros de console (botón de filtros en DevTools)
```

### Problema: ngOnDestroy no se ejecuta
```bash
# Verificar que el componente se esté destruyendo realmente
# Usar *ngIf en lugar de [hidden] para destrucción real
# Verificar en network tab que no hay errores de navegación
```

### Problema: Timer sigue ejecutándose después de destruir
```bash
# Verificar que clearInterval esté en ngOnDestroy
# Verificar que this.intervalId no sea undefined
# Usar window.clearInterval() en lugar de clearInterval()
```

---

## 🧪 VERIFICACIÓN FINAL

Para verificar que todo funciona correctamente:

1. **Abre DevTools (F12) → Console**
2. **Recarga la página** y observa logs de constructor, ngOnInit, etc.
3. **Click "Actualizar @Input Data"** → debe mostrar ngOnChanges
4. **Click "Destruir Componente"** → debe mostrar ngOnDestroy
5. **Verifica que timer se detiene** → no más logs cada 3 segundos
6. **Click "Crear Componente"** → ciclo completo nuevamente

**🎊 ¡Perfecto!** Si todo funciona, has dominado los lifecycle hooks de Angular.

---

## 🔄 PRÓXIMO PASO

**Continúa con:** [LAB 2: Comunicación entre Componentes](../lab-2-communication/README.md)

En el próximo laboratorio implementarás comunicación @Input/@Output y services para crear un sistema de gestión de usuarios completo.

---

## 💡 CONCEPTOS CLAVE APRENDIDOS

> **🔧 Constructor vs ngOnInit:** Constructor solo para inyección, ngOnInit para inicialización real.

> **🧹 ngOnDestroy es obligatorio:** Sin limpieza adecuada = memory leaks = aplicación lenta.

> **📝 Logger Service:** Sistema centralizado de logging mejora debugging y monitoreo.

> **🔄 Lifecycle hooks son predecibles:** Siguen un orden específico que puedes aprovechar.

---

**¡Has dominado el ciclo de vida de componentes Angular! 🎉 Ahora sabes exactamente cuándo y cómo usar cada hook para crear aplicaciones optimizadas y sin memory leaks.**