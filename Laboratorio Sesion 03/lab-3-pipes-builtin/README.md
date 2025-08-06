# 📋 LAB 3: PIPES BUILT-IN Y ASYNC

**PROVIAS DESCENTRALIZADO - Angular v18**

*Duración: 40 minutos*  
*Objetivo: Dominar pipes nativos de Angular y programación reactiva con async pipe*

---

## 📚 CONCEPTOS TEÓRICOS

### ¿Qué son los Pipes?

Los **Pipes** son como los filtros de Instagram pero para datos. Toman información cruda y la convierten en algo hermoso y comprensible. Son **transformadores de datos** que hacen que la información sea más presentable y útil para los usuarios.

La sintaxis es elegante: simplemente agregan una barra vertical `|` y el nombre del pipe después de cualquier expresión.

### 🔤 **Pipes de Texto**

#### UpperCasePipe y LowerCasePipe
```html
<!-- Convertir a mayúsculas -->
{{ 'proyecto carretera norte' | uppercase }}
<!-- Resultado: PROYECTO CARRETERA NORTE -->

<!-- Convertir a minúsculas -->
{{ 'PRESUPUESTO ANUAL' | lowercase }}
<!-- Resultado: presupuesto anual -->
```

#### TitleCasePipe
```html
<!-- Capitalizar cada palabra -->
{{ 'gestión de infraestructura vial' | titlecase }}
<!-- Resultado: Gestión De Infraestructura Vial -->
```

#### SlicePipe
```html
<!-- Tomar substring o subarray -->
{{ 'Descripción muy larga del proyecto...' | slice:0:50 }}
{{ tareas | slice:0:10 }}  <!-- Primeras 10 tareas -->
```

### 🔢 **Pipes Numéricos**

#### DecimalPipe (number)
```html
<!-- Formatear números con precisión -->
{{ 3.14159 | number:'1.2-2' }}
<!-- Resultado: 3.14 -->

<!-- 1.2-2 significa: mínimo 1 entero, mínimo 2 decimales, máximo 2 decimales -->
{{ presupuesto | number:'1.0-0' }}
<!-- Sin decimales para presupuestos -->
```

#### PercentPipe
```html
<!-- Convertir decimales a porcentajes -->
{{ 0.259 | percent }}
<!-- Resultado: 26% -->

{{ progreso | percent:'2.2-2' }}
<!-- Resultado: 25.90% (con precisión) -->
```

#### CurrencyPipe
```html
<!-- Formatear moneda -->
{{ 1234.5 | currency }}
<!-- Resultado: $1,234.50 (USD por defecto) -->

{{ presupuesto | currency:'PEN':'symbol':'1.0-0' }}
<!-- Resultado: S/ 1,235 (Soles peruanos sin decimales) -->

{{ costo | currency:'PEN':'symbol-narrow':'1.2-2' }}
<!-- Resultado: S/ 1,234.50 -->
```

### 📅 **Pipes de Fecha**

```html
<!-- Formato básico -->
{{ fechaCreacion | date }}
<!-- Resultado: Mar 5, 2025 -->

<!-- Formato personalizado -->
{{ fechaVencimiento | date:'dd/MM/yyyy' }}
<!-- Resultado: 05/08/2025 -->

<!-- Formato completo -->
{{ fechaReunion | date:'fullDate' }}
<!-- Resultado: martes, 5 de agosto de 2025 -->

<!-- Fecha y hora -->
{{ timestamp | date:'dd/MM/yy HH:mm:ss' }}
<!-- Resultado: 05/08/25 19:30:00 -->

<!-- Con localización -->
{{ fecha | date:'full':'':'es' }}
<!-- En español -->
```

### 🔧 **Pipes Útiles**

#### JsonPipe
```html
<!-- Para debugging - mostrar objetos -->
<pre>{{ objetoComplejo | json }}</pre>
```

#### KeyValuePipe
```html
<!-- Para iterar sobre objetos -->
<div *ngFor="let item of objeto | keyvalue">
  {{ item.key }}: {{ item.value }}
</div>
```

### 🚀 **Async Pipe - La Joya de la Corona**

El **async pipe** es probablemente el pipe más poderoso de Angular. Maneja automáticamente la suscripción y desuscripción de Observables y Promises.

#### ¿Por qué es tan importante?

**Sin async pipe** (❌ Malo):
```typescript
// Componente
ngOnInit() {
  this.dataService.getTasks().subscribe(tasks => {
    this.tasks = tasks;
  });
}

ngOnDestroy() {
  // Olvidamos desuscribirnos = Memory Leak!
}
```

**Con async pipe** (✅ Bueno):
```html
<!-- Template -->
<div *ngFor="let task of tasks$ | async">
  {{ task.title }}
</div>
```

#### Características del Async Pipe:

1. **Suscripción automática**: Se suscribe al Observable cuando se inicializa
2. **Desuscripción automática**: Se desuscribe cuando el componente se destruye
3. **Detección de cambios**: Marca el componente para verificación cuando llegan nuevos datos
4. **Manejo de estados**: Muestra datos cuando están disponibles

#### Patrones Avanzados con Async Pipe:

##### 1. **Patrón "as"**
```html
<div *ngIf="user$ | async as user">
  <h2>{{ user.name }}</h2>
  <p>{{ user.email }}</p>
  <!-- user está disponible en todo el bloque -->
</div>
```

##### 2. **Con Loading States**
```html
<div *ngIf="loading$ | async">Cargando...</div>
<div *ngIf="tasks$ | async as tasks">
  <div *ngFor="let task of tasks">...</div>
</div>
<div *ngIf="error$ | async">Error al cargar</div>
```

##### 3. **Combinando múltiples Observables**
```html
<div *ngIf="{ 
  tasks: tasks$ | async, 
  stats: stats$ | async 
} as data">
  <p>{{ data.stats.total }} tareas</p>
  <div *ngFor="let task of data.tasks">...</div>
</div>
```

### 🔄 **Programación Reactiva con RxJS**

#### BehaviorSubject para Estado
```typescript
private tasksSubject = new BehaviorSubject<Task[]>([]);
public tasks$ = this.tasksSubject.asObservable();

// Filtrado reactivo
public filteredTasks$ = combineLatest([
  this.tasks$,
  this.searchTerm$
]).pipe(
  map(([tasks, searchTerm]) => 
    tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
);
```

#### Operadores Útiles
```typescript
// debounceTime - esperar antes de procesar
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.searchTasks(term))
)

// startWith - valor inicial
this.filteredTasks$ = this.searchTerm$.pipe(
  startWith(''),
  switchMap(term => this.filterTasks(term))
)

// catchError - manejo de errores
this.tasks$ = this.dataService.getTasks().pipe(
  catchError(error => {
    console.error('Error:', error);
    return of([]); // Valor por defecto
  })
)
```

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
lab-3-pipes-builtin/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── task-manager/
│   │   │       ├── task-manager.component.ts
│   │   │       ├── task-manager.component.html
│   │   │       └── task-manager.component.scss
│   │   ├── models/
│   │   │   └── task.interface.ts
│   │   ├── services/
│   │   │   ├── task.service.ts
│   │   │   └── statistics.service.ts
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

1. ✅ **Aplicar pipes de texto** (uppercase, titlecase, slice)
2. ✅ **Usar pipes numéricos** (number, percent, currency)
3. ✅ **Formatear fechas** con parámetros personalizados
4. ✅ **Implementar async pipe** para manejo automático de Observables
5. ✅ **Crear filtrado reactivo** con BehaviorSubject
6. ✅ **Manejar estados de carga** con programación reactiva

---

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### Sistema de Gestión de Tareas PROVIAS
- **Lista de tareas** con información completa de proyectos
- **Filtrado en tiempo real** por título, estado, prioridad
- **Estadísticas automáticas** calculadas reactivamente
- **Formateo profesional** de fechas, monedas y porcentajes
- **Estados de carga** y manejo de errores
- **Búsqueda debounced** para mejor performance

### Tipos de Tareas PROVIAS
- **Construcción de carreteras**: Proyectos de pavimentación
- **Mantenimiento vial**: Reparación y mejoras
- **Supervisión**: Inspecciones y auditorías
- **Presupuesto**: Gestión financiera
- **Equipos**: Mantenimiento de maquinaria
- **Seguridad**: Protocolos y capacitación

---

## 💡 CASOS DE USO EMPRESARIALES

Este laboratorio simula el **Sistema de Gestión de Tareas** de PROVIAS:

1. **Panel de Proyectos**: Seguimiento de obras en ejecución
2. **Centro de Tareas**: Asignación y monitoreo de actividades
3. **Dashboard Financiero**: Control de presupuestos y gastos
4. **Gestión de Plazos**: Seguimiento de cronogramas
5. **Reportes Ejecutivos**: Estadísticas y métricas clave

---

## 🎨 CARACTERÍSTICAS TÉCNICAS

### Programación Reactiva
- **Observables** para datos en tiempo real
- **BehaviorSubject** para estado compartido
- **combineLatest** para múltiples fuentes de datos
- **debounceTime** para optimizar búsquedas
- **switchMap** para cancelar requests anteriores

### Performance Optimization
- **OnPush Change Detection** para mejor rendimiento
- **trackBy functions** para listas grandes
- **Lazy loading** de componentes pesados
- **Memoización** de cálculos costosos

### Manejo de Estados
- **Loading states**: Indicadores de carga
- **Error states**: Manejo elegante de errores
- **Empty states**: Pantallas vacías informativas
- **Success states**: Confirmaciones visuales

---

## 📊 PIPES EN ACCIÓN

### Ejemplos Prácticos del Lab

```html
<!-- Títulos formateados -->
<h2>{{ 'gestión de tareas provias' | titlecase }}</h2>

<!-- Fechas en español -->
<span>{{ task.dueDate | date:'fullDate':'':'es' }}</span>

<!-- Presupuestos en soles -->
<span>{{ task.budget | currency:'PEN':'symbol':'1.0-0' }}</span>

<!-- Progreso como porcentaje -->
<span>{{ task.progress | percent:'1.1-1' }}</span>

<!-- Descripción truncada -->
<p>{{ task.description | slice:0:100 }}...</p>

<!-- Lista filtrada reactivamente -->
<div *ngFor="let task of filteredTasks$ | async">
  <!-- Contenido de la tarea -->
</div>

<!-- Estadísticas en tiempo real -->
<div *ngIf="stats$ | async as stats">
  <span>{{ stats.total | number }} tareas</span>
  <span>{{ stats.completed | percent:'1.0-0' }}</span>
</div>
```

---

## 🏆 ENTREGABLES ESPERADOS

1. **Gestor de Tareas** completamente funcional
2. **Filtrado reactivo** con búsqueda en tiempo real
3. **Estadísticas automáticas** calculadas con RxJS
4. **Formateo profesional** usando todos los pipes built-in
5. **Manejo de async data** con loading y error states
6. **Performance optimizada** con OnPush y trackBy

---

## 🎯 CONCEPTOS AVANZADOS

### Pipe Chaining
```html
<!-- Combinar múltiples pipes -->
{{ task.title | slice:0:30 | titlecase }}
{{ task.budget | currency:'PEN' | slice:0:-3 }}
```

### Async Pipe con Error Handling
```typescript
// Service
getTasks(): Observable<Task[]> {
  return this.http.get<Task[]>('/api/tasks').pipe(
    retry(3),
    catchError(this.handleError),
    shareReplay(1)
  );
}
```

### Reactive Forms + Pipes
```html
<input [formControl]="searchControl" 
       placeholder="Buscar tareas...">

<div *ngFor="let task of tasks$ | async | slice:0:pageSize">
  <!-- Tasks filtradas y paginadas -->
</div>
```

---

*¡Prepárate para dominar la transformación de datos y la programación reactiva! 🚀*

**Este sistema podría gestionar las tareas reales de PROVIAS** 💼