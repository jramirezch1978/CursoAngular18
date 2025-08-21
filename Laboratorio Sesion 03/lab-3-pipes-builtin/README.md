# 📋 LAB 3: PIPES BUILT-IN Y ASYNC

**PROVIAS DESCENTRALIZADO - Angular v18**  
**Curso: Desarrollo de Aplicaciones Web con Angular**  
**Instructor: Ing. Jhonny Alexander Ramirez Chiroque**  

---

## 🎯 **¿QUÉ VAS A APRENDER EN ESTE LAB?**

En este laboratorio vas a construir un **Sistema de Gestión de Tareas** para PROVIAS que maneja información en tiempo real. Dominarás los **pipes built-in de Angular** y aprenderás **programación reactiva** con RxJS y el poderoso **async pipe**.

**Al final de este lab podrás:**
- ✅ Transformar textos con **pipes de texto** (uppercase, titlecase, slice)
- ✅ Formatear números y monedas con **pipes numéricos** (number, percent, currency)
- ✅ Mostrar fechas profesionalmente con **pipes de fecha** (date con localización)
- ✅ Manejar datos asíncronos con **async pipe** (sin memory leaks)
- ✅ Crear **filtrado reactivo** con BehaviorSubject y Observables
- ✅ Implementar **búsqueda en tiempo real** con debounce

---

## 🏗️ **¿QUÉ VAS A CONSTRUIR?**

### **Sistema de Gestión de Tareas PROVIAS**
Imagina que PROVIAS necesita coordinar cientos de tareas simultáneas: construcción de carreteras, mantenimiento de puentes, supervisión de obras, auditorías de presupuesto. Vas a crear:

📋 **Gestor de Tareas Completo**
- 8 tareas reales de PROVIAS con información detallada
- Estados: pendiente, en progreso, completada, vencida
- Prioridades: baja, media, alta, crítica, urgente
- Tipos: construcción, mantenimiento, supervisión, presupuesto

🔍 **Filtrado Reactivo Avanzado**
- Búsqueda que filtra mientras escribes (sin lag)
- Filtros por tipo, prioridad, estado y región
- Ordenamiento por múltiples campos
- Vistas: lista, grid y kanban

📊 **Estadísticas en Tiempo Real**
- Contadores que se actualizan automáticamente
- Distribución por estado, prioridad y región
- Cálculos de presupuesto y utilización
- Todo usando async pipe (sin memory leaks)

---

## 🔧 **PIPES BUILT-IN EXPLICADOS CON EJEMPLOS**

### **🔤 PIPES DE TEXTO - "Transformadores de Palabras"**

#### **UpperCase Pipe**
```html
<!-- En el template -->
{{ 'gestión de tareas provias' | uppercase }}

<!-- Resultado -->
GESTIÓN DE TAREAS PROVIAS
```
**Uso en PROVIAS:** Títulos importantes, códigos de proyecto, alertas críticas.

#### **TitleCase Pipe**
```html
<!-- En el template -->
{{ 'construcción carretera longitudinal norte' | titlecase }}

<!-- Resultado -->
Construcción Carretera Longitudinal Norte
```
**Uso en PROVIAS:** Nombres de proyectos, títulos de reportes, nombres de responsables.

#### **Slice Pipe**
```html
<!-- En el template -->
{{ 'Descripción muy larga del proyecto que necesita ser truncada...' | slice:0:50 }}

<!-- Resultado -->
Descripción muy larga del proyecto que necesita ser
```
**Uso en PROVIAS:** Resúmenes en tarjetas, previews de documentos, listados compactos.

### **🔢 PIPES NUMÉRICOS - "Formateadores de Números"**

#### **Number Pipe**
```html
<!-- En el template -->
{{ 1234567.89 | number:'1.0-0' }}

<!-- Resultado -->
1,234,568
```
**Uso en PROVIAS:** Presupuestos, cantidades de materiales, códigos numéricos.

#### **Percent Pipe**
```html
<!-- En el template -->
{{ 0.685 | percent:'1.1-1' }}

<!-- Resultado -->
68.5%
```
**Uso en PROVIAS:** Avance de obras, utilización de presupuesto, eficiencia de equipos.

#### **Currency Pipe**
```html
<!-- En el template -->
{{ 125000000 | currency:'PEN':'symbol':'1.0-0' }}

<!-- Resultado -->
S/ 125,000,000
```
**Uso en PROVIAS:** Presupuestos, costos, valorizaciones, pagos a contratistas.

### **📅 PIPES DE FECHA - "Humanizadores de Tiempo"**

#### **Date Pipe Básico**
```html
<!-- En el template -->
{{ task.dueDate | date:'dd/MM/yyyy' }}

<!-- Resultado -->
15/12/2025
```

#### **Date Pipe Completo en Español**
```html
<!-- En el template -->
{{ task.createdAt | date:'fullDate':'':'es' }}

<!-- Resultado -->
martes, 21 de agosto de 2025
```

#### **Date Pipe para Hora**
```html
<!-- En el template -->
{{ task.lastUpdate | date:'HH:mm:ss' }}

<!-- Resultado -->
14:35:22
```
**Uso en PROVIAS:** Fechas de inicio/fin de proyectos, reportes, cronogramas, bitácoras.

### **🚀 ASYNC PIPE - "El Pipe Mágico"**

**¿Por qué es mágico?** Porque maneja automáticamente las suscripciones y evita memory leaks.

#### **Sin Async Pipe (❌ Problemático)**
```typescript
// En el componente - MALO
export class TaskComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  private subscription: Subscription;

  ngOnInit() {
    this.subscription = this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;  // Asignación manual
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();  // ¡Fácil de olvidar!
  }
}
```

#### **Con Async Pipe (✅ Perfecto)**
```typescript
// En el componente - BUENO
export class TaskComponent {
  tasks$ = this.taskService.getTasks();  // Observable directo
  // ¡No necesitas ngOnDestroy!
}
```

```html
<!-- En el template -->
@if (tasks$ | async; as tasks) {
  <div class="tasks-list">
    @for (task of tasks; track task.id) {
      <div class="task-item">{{ task.title }}</div>
    }
  </div>
}
```

**Resultado:** Angular automáticamente:
1. Se suscribe al Observable cuando se crea el componente
2. Actualiza la vista cuando llegan nuevos datos
3. Se desuscribe cuando se destruye el componente
4. ¡Cero memory leaks!

---

## 🚀 **CÓMO EJECUTAR EL LABORATORIO**

### **Paso 1: Preparar el Entorno**
```bash
# Navegar al directorio del lab
cd lab-3-pipes-builtin

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
ng serve --port 4202
```

### **Paso 2: Abrir en el Navegador**
- Abre tu navegador en: http://localhost:4202
- Verás la página de inicio con demos de pipes en vivo
- Haz click en "📋 Tareas" para acceder al gestor completo

### **Paso 3: Explorar las Funcionalidades**
1. **🔍 Búsqueda reactiva:** Escribe "carretera" y ve el filtrado instantáneo
2. **🎛️ Filtros avanzados:** Cambia tipo, prioridad, estado y región
3. **📊 Estadísticas:** Observa cómo se actualizan automáticamente
4. **👁️ Vistas múltiples:** Alterna entre lista, grid y kanban
5. **📈 Progreso:** Usa los sliders para cambiar el progreso de tareas

---

## 📚 **CONCEPTOS EN ACCIÓN - EJEMPLOS REALES**

### **Pipes de Texto Transformando Datos**
```html
<!-- Título dinámico -->
<h1>{{ 'gestión de tareas provias' | titlecase }}</h1>
<!-- Resultado: "Gestión De Tareas Provias" -->

<!-- Descripción truncada -->
<p>{{ task.description | slice:0:100 }}...</p>
<!-- Resultado: Solo los primeros 100 caracteres -->
```

### **Pipes Numéricos en Presupuestos**
```html
<!-- Presupuesto en soles peruanos -->
<span>{{ task.budget | currency:'PEN':'symbol':'1.0-0' }}</span>
<!-- Resultado: "S/ 125,000,000" -->

<!-- Progreso como porcentaje -->
<span>{{ task.progress | percent:'1.1-1' }}</span>
<!-- Resultado: "68.5%" -->
```

### **Pipes de Fecha en Cronogramas**
```html
<!-- Fecha de creación en español -->
<span>{{ task.createdAt | date:'fullDate':'':'es' }}</span>
<!-- Resultado: "martes, 15 de marzo de 2024" -->

<!-- Fecha de vencimiento -->
<span>{{ task.dueDate | date:'dd/MM/yyyy HH:mm' }}</span>
<!-- Resultado: "30/11/2025 18:00" -->
```

### **Async Pipe Manejando Estados**
```html
<!-- Lista reactiva con estados de carga -->
@if (loading$ | async) {
  <div class="loading">Cargando tareas...</div>
}

@if (filteredTasks$ | async; as tasks) {
  <div class="tasks-count">{{ tasks.length }} tareas encontradas</div>
  @for (task of tasks; track task.id) {
    <div class="task-item">{{ task.title }}</div>
  }
} @empty {
  <div class="empty-state">No hay tareas disponibles</div>
}
```

---

## 🔄 **PROGRAMACIÓN REACTIVA EXPLICADA**

### **¿Qué es un Observable?**
Un Observable es como una **manguera de datos** que puede enviar información en cualquier momento:

```typescript
// Crear un Observable de tareas
private tasksSubject = new BehaviorSubject<Task[]>([]);
public tasks$ = this.tasksSubject.asObservable();

// Enviar nuevos datos
this.tasksSubject.next(newTasks);  // ¡Todos los suscriptores se actualizan!
```

### **¿Qué es BehaviorSubject?**
Es como un Observable que **recuerda el último valor**:

```typescript
// BehaviorSubject siempre tiene un valor inicial
private searchSubject = new BehaviorSubject<string>('');

// Cualquier nuevo suscriptor recibe inmediatamente el último valor
this.searchSubject.subscribe(term => {
  console.log('Término actual:', term);  // Recibe '' inmediatamente
});
```

### **Filtrado Reactivo en Acción**
```typescript
// Combinar búsqueda + lista de tareas
public filteredTasks$ = combineLatest([
  this.tasks$,        // Lista de tareas
  this.searchTerm$    // Término de búsqueda
]).pipe(
  map(([tasks, searchTerm]) => 
    tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
);
```

**Resultado:** Cada vez que cambias el término de búsqueda O se agregan nuevas tareas, la lista filtrada se actualiza automáticamente.

---

## 🎛️ **FUNCIONALIDADES IMPLEMENTADAS**

### **🔍 Búsqueda Inteligente con Debounce**
```typescript
// Búsqueda que espera 300ms antes de filtrar
this.searchTerm$.pipe(
  debounceTime(300),           // Espera 300ms
  distinctUntilChanged(),      // Solo si cambió el valor
  takeUntil(this.destroy$)     // Se limpia automáticamente
).subscribe(searchTerm => {
  this.taskService.updateSearch(searchTerm);
});
```
**Beneficio:** No hace búsqueda en cada tecla, solo cuando paras de escribir.

### **📊 Estadísticas Automáticas**
```typescript
// Estadísticas que se calculan automáticamente
public statistics$: Observable<TaskStatistics> = this.filteredTasks$.pipe(
  map(tasks => this.calculateStatistics(tasks)),
  shareReplay(1)  // Cache el último cálculo
);
```
**Beneficio:** Cada vez que cambian las tareas, las estadísticas se recalculan automáticamente.

### **🎯 Estados de Carga Profesionales**
```html
<!-- Manejo elegante de estados asincrónicos -->
@if (loading$ | async) {
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <span>Cargando tareas...</span>
  </div>
}

@if (error$ | async; as error) {
  <div class="error-container">
    <h3>Error al cargar tareas</h3>
    <p>{{ error }}</p>
    <button (click)="refreshTasks()">🔄 Reintentar</button>
  </div>
}
```

---

## 🚀 **CÓMO EJECUTAR EL LABORATORIO**

### **Paso 1: Preparar el Entorno**
```bash
# Navegar al directorio del lab
cd lab-3-pipes-builtin

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
ng serve --port 4202
```

### **Paso 2: Abrir en el Navegador**
- Abre tu navegador en: http://localhost:4202
- Verás demos en vivo de todos los pipes
- Haz click en "📋 Tareas" para el gestor completo

### **Paso 3: Experimentar con Pipes y Reactividad**
1. **🔤 Pipes de texto:** Ve cómo se transforman títulos y descripciones
2. **💰 Pipes de moneda:** Observa presupuestos en soles peruanos
3. **📅 Pipes de fecha:** Fechas en español con diferentes formatos
4. **🔍 Búsqueda reactiva:** Escribe y ve filtrado instantáneo
5. **📊 Estadísticas:** Cambia filtros y ve estadísticas actualizándose

---

## 📚 **PIPES EN ACCIÓN - CASOS REALES DE PROVIAS**

### **🏗️ Gestión de Proyectos**
```html
<!-- Título del proyecto formateado -->
<h2>{{ 'carretera longitudinal norte' | titlecase }}</h2>
<!-- Resultado: "Carretera Longitudinal Norte" -->

<!-- Presupuesto en soles -->
<span>{{ 125000000 | currency:'PEN':'symbol':'1.0-0' }}</span>
<!-- Resultado: "S/ 125,000,000" -->

<!-- Progreso del proyecto -->
<span>{{ 0.685 | percent:'1.1-1' }}</span>
<!-- Resultado: "68.5%" -->
```

### **⏰ Cronogramas y Fechas**
```html
<!-- Fecha de inicio en formato peruano -->
<span>{{ project.startDate | date:'dd/MM/yyyy' }}</span>
<!-- Resultado: "15/03/2024" -->

<!-- Fecha completa en español -->
<span>{{ project.startDate | date:'fullDate':'':'es' }}</span>
<!-- Resultado: "viernes, 15 de marzo de 2024" -->

<!-- Última actualización con hora -->
<span>{{ project.lastUpdate | date:'dd/MM/yy HH:mm' }}</span>
<!-- Resultado: "21/08/25 14:35" -->
```

### **📊 Reportes y Estadísticas**
```html
<!-- Cantidad de tareas -->
<span>{{ totalTasks | number:'1.0-0' }} tareas activas</span>
<!-- Resultado: "42 tareas activas" -->

<!-- Eficiencia del equipo -->
<span>Eficiencia: {{ efficiency | percent:'1.2-2' }}</span>
<!-- Resultado: "Eficiencia: 94.25%" -->

<!-- Presupuesto utilizado -->
<span>{{ budgetUsed | currency:'PEN':'symbol':'1.2-2' }}</span>
<!-- Resultado: "S/ 89,500,000.00" -->
```

---

## 🔄 **PROGRAMACIÓN REACTIVA EN ACCIÓN**

### **📡 Flujo de Datos Reactivo**

```typescript
// 1. Usuario escribe en búsqueda
searchTerm$ = new BehaviorSubject<string>('');

// 2. Se combina con lista de tareas
filteredTasks$ = combineLatest([
  this.tasks$,      // Lista de tareas (puede cambiar)
  this.searchTerm$  // Término de búsqueda (puede cambiar)
]).pipe(
  // 3. Se filtran automáticamente
  map(([tasks, searchTerm]) => 
    tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
);

// 4. Estadísticas se calculan automáticamente
statistics$ = this.filteredTasks$.pipe(
  map(tasks => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completada').length,
    overdue: tasks.filter(t => this.isOverdue(t)).length
  }))
);
```

**En el template:**
```html
<!-- Todo se actualiza automáticamente -->
@if (statistics$ | async; as stats) {
  <div class="stats">
    <span>{{ stats.total }} tareas</span>
    <span>{{ stats.completed }} completadas</span>
    <span>{{ stats.overdue }} vencidas</span>
  </div>
}

@if (filteredTasks$ | async; as tasks) {
  @for (task of tasks; track task.id) {
    <div class="task">{{ task.title | titlecase }}</div>
  }
}
```

**💡 La Magia:** Cambias el término de búsqueda → Se filtran las tareas → Se recalculan las estadísticas → Se actualiza la vista. ¡Todo automático!

---

## 🎯 **EJERCICIOS PASO A PASO**

### **Ejercicio 1: Experimentar con Pipes de Texto**
1. Ve a la página de inicio (http://localhost:4202/home)
2. Observa cómo el texto "gestión de infraestructura vial" se transforma
3. En DevTools, cambia temporalmente el texto y ve los pipes en acción

### **Ejercicio 2: Modificar Pipes de Fecha**
1. Ve al gestor de tareas (http://localhost:4202/tasks)
2. En `task-manager.component.html`, encuentra: `{{ task.dueDate | date:'dd/MM/yy HH:mm' }}`
3. Cámbialo a: `{{ task.dueDate | date:'fullDate':'':'es' }}`
4. Ve cómo cambia el formato de todas las fechas

### **Ejercicio 3: Agregar tu Propio Pipe**
1. En el template, encuentra un precio
2. Agrega el pipe slice: `{{ task.budget | currency:'PEN' | slice:0:-3 }}`
3. Ve cómo se cortan los últimos 3 caracteres del precio

### **Ejercicio 4: Entender el Async Pipe**
1. En DevTools, ve la pestaña Network
2. Busca algo en el gestor de tareas
3. Observa que NO se hacen requests HTTP (porque son datos mock)
4. Ve cómo el async pipe actualiza la vista automáticamente

---

## 💼 **¿POR QUÉ ES IMPORTANTE PARA PROVIAS?**

### **📊 Reportes Ejecutivos**
Los directivos necesitan información clara y actualizada:
```html
<!-- Reporte automático -->
<div class="executive-summary">
  <h2>Reporte Ejecutivo - {{ currentDate | date:'MMMM yyyy':'':'es' }}</h2>
  <p>Proyectos activos: {{ activeProjects | number }}</p>
  <p>Presupuesto ejecutado: {{ budgetUsed | currency:'PEN':'symbol':'1.0-0' }}</p>
  <p>Eficiencia promedio: {{ efficiency | percent:'1.1-1' }}</p>
</div>
```

### **📱 Apps Móviles para Campo**
Los supervisores en obra necesitan información rápida:
```html
<!-- Dashboard móvil -->
<div class="mobile-dashboard">
  <h3>{{ projectName | titlecase }}</h3>
  <p>Avance: {{ progress | percent:'1.0-0' }}</p>
  <p>Vence: {{ dueDate | date:'dd/MM' }}</p>
  <p>Presupuesto: {{ budget | currency:'PEN':'symbol':'1.0-0' }}</p>
</div>
```

### **🔍 Sistemas de Búsqueda**
Los ingenieros necesitan encontrar información rápidamente:
```typescript
// Búsqueda reactiva en especificaciones técnicas
searchResults$ = this.searchTerm$.pipe(
  debounceTime(300),
  switchMap(term => 
    this.documentService.searchSpecs(term)
  )
);
```

---

## 🎛️ **FUNCIONALIDADES AVANZADAS**

### **🔍 Búsqueda Multi-campo**
```typescript
// Busca en título, descripción, responsable y región
filterTasks(tasks: Task[], searchTerm: string) {
  const search = searchTerm.toLowerCase();
  return tasks.filter(task =>
    task.title.toLowerCase().includes(search) ||
    task.description.toLowerCase().includes(search) ||
    task.assignee.name.toLowerCase().includes(search) ||
    task.location.region.toLowerCase().includes(search)
  );
}
```

### **📊 Estadísticas Reactivas**
```typescript
// Estadísticas que se actualizan automáticamente
statistics$ = this.filteredTasks$.pipe(
  map(tasks => ({
    total: tasks.length,
    byStatus: this.groupByStatus(tasks),
    byPriority: this.groupByPriority(tasks),
    budgetTotal: tasks.reduce((sum, t) => sum + t.budget, 0),
    averageProgress: tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
  }))
);
```

### **🎯 Vista Kanban Dinámica**
```html
<!-- Columnas que se generan automáticamente -->
@for (status of taskStatuses; track status.value) {
  <div class="kanban-column">
    <h3>{{ status.label }}</h3>
    <span class="task-count">
      {{ getTasksByStatus(tasks, status.value).length }}
    </span>
    
    @for (task of getTasksByStatus(tasks, status.value); track task.id) {
      <div class="kanban-card">
        <h4>{{ task.title | slice:0:30 }}</h4>
        <p>{{ task.progress | percent:'1.0-0' }}</p>
      </div>
    }
  </div>
}
```

---

## ⚡ **OPTIMIZACIÓN Y PERFORMANCE**

### **🎯 Async Pipe vs Suscripción Manual**

| Aspecto | Async Pipe | Suscripción Manual |
|---------|------------|-------------------|
| **Memory Leaks** | ✅ Imposibles | ❌ Fáciles de crear |
| **Código** | ✅ Menos líneas | ❌ Más boilerplate |
| **Mantenimiento** | ✅ Automático | ❌ Manual |
| **Performance** | ✅ Optimizado | ⚠️ Depende de ti |

### **🔄 Debounce para Búsquedas**
```typescript
// Sin debounce: 100 búsquedas por segundo ❌
// Con debounce: 1 búsqueda cada 300ms ✅

this.searchControl.valueChanges.pipe(
  debounceTime(300),           // Espera 300ms
  distinctUntilChanged(),      // Solo si cambió
  switchMap(term => this.search(term))  // Cancela búsquedas anteriores
);
```

---

## 🏆 **CRITERIOS DE EVALUACIÓN**

### **Pipes y Transformación (40%)**
- ✅ Todos los pipes built-in funcionan correctamente
- ✅ Fechas se muestran en español sin errores
- ✅ Monedas usan formato peruano (PEN)
- ✅ Textos están bien formateados
- ✅ Números tienen separadores de miles

### **Programación Reactiva (40%)**
- ✅ Async pipe maneja Observables sin errores
- ✅ Búsqueda filtra en tiempo real
- ✅ Estadísticas se actualizan automáticamente
- ✅ No hay memory leaks (sin suscripciones manuales)
- ✅ Estados de carga y error están implementados

### **UX y Funcionalidad (20%)**
- ✅ Filtros responden inmediatamente
- ✅ Vistas múltiples (lista, grid, kanban) funcionan
- ✅ Interfaz es intuitiva y responsive
- ✅ No hay errores en consola del navegador

---

## ❓ **PREGUNTAS FRECUENTES**

### **P: ¿Por qué usar async pipe en lugar de suscripciones?**
**R:** Async pipe previene memory leaks automáticamente. Con suscripciones manuales, si olvidas hacer `unsubscribe()`, tu app consume memoria infinitamente.

### **P: ¿Cuándo usar debounceTime?**
**R:** Siempre que el usuario pueda escribir rápido: búsquedas, filtros, validaciones. Sin debounce, harías cientos de operaciones por segundo.

### **P: ¿Qué es shareReplay(1)?**
**R:** Hace que múltiples suscriptores compartan el mismo resultado. Sin él, cada async pipe haría su propia request/cálculo.

### **P: ¿Por qué las fechas dan error en español?**
**R:** Angular necesita que registres el locale español. Ya está configurado en `main.ts` con `registerLocaleData(localeEs)`.

---

## 🌟 **CASOS DE USO REALES EN PROVIAS**

### **📋 Sistema de Seguimiento de Obras**
```typescript
// Dashboard de obras en tiempo real
obras$ = this.obraService.getObrasActivas().pipe(
  map(obras => obras.map(obra => ({
    ...obra,
    // Pipes aplicados en el servicio para consistencia
    nombreFormateado: obra.nombre.toUpperCase(),
    presupuestoFormateado: this.currencyPipe.transform(obra.presupuesto, 'PEN'),
    avanceFormateado: this.percentPipe.transform(obra.avance / 100)
  })))
);
```

### **📊 Reportes Automáticos**
```typescript
// Reporte que se genera automáticamente
reporteEjecutivo$ = combineLatest([
  this.proyectos$,
  this.presupuestos$,
  this.cronogramas$
]).pipe(
  map(([proyectos, presupuestos, cronogramas]) => ({
    fechaReporte: new Date(),
    totalProyectos: proyectos.length,
    presupuestoTotal: presupuestos.reduce((sum, p) => sum + p.monto, 0),
    proyectosEnRiesgo: proyectos.filter(p => p.riesgo === 'alto').length
  }))
);
```

### **🚨 Sistema de Alertas**
```typescript
// Alertas que se actualizan en tiempo real
alertasCriticas$ = this.equipos$.pipe(
  map(equipos => equipos.filter(equipo => 
    equipo.horasMantenimiento > equipo.limiteHoras
  )),
  map(equiposEnRiesgo => equiposEnRiesgo.map(equipo => ({
    mensaje: `${equipo.nombre} requiere mantenimiento urgente`,
    tiempo: equipo.proximoMantenimiento,
    prioridad: 'critica'
  })))
);
```

---

## 🎓 **CONCEPTOS CLAVE PARA RECORDAR**

### **🔧 Pipes Built-in Esenciales**
- **uppercase/lowercase/titlecase:** Para formateo de texto
- **number:** Para números con separadores de miles  
- **percent:** Para porcentajes con decimales configurables
- **currency:** Para monedas con símbolo y precisión
- **date:** Para fechas con formato y localización
- **slice:** Para truncar texto o arrays

### **🚀 Async Pipe Benefits**
- **Automático:** Suscripción y desuscripción automática
- **Seguro:** Previene memory leaks garantizadamente
- **Limpio:** Menos código boilerplate
- **Reactivo:** Actualización automática de la vista

### **🔄 Programación Reactiva**
- **Observable:** Stream de datos que puede emitir valores
- **BehaviorSubject:** Observable que recuerda el último valor
- **combineLatest:** Combina múltiples Observables
- **debounceTime:** Evita ejecuciones excesivas
- **switchMap:** Cancela operaciones anteriores

---

## 🚀 **PRÓXIMOS PASOS**

Después de dominar pipes y programación reactiva, estarás listo para:

- **Lab 4:** Pipes Personalizados (Crear tus propias herramientas de transformación)
- **Sesión 4:** Directivas (Manipular el DOM directamente)
- **Proyectos Reales:** Aplicar estos conceptos en sistemas de PROVIAS

**¡Este lab es crucial para entender Angular moderno! 🎓**

---

**¡Prepárate para dominar la transformación de datos y la programación reactiva! 🚀**

*El sistema de tareas que construyas podría gestionar los proyectos reales de PROVIAS*