# LAB 4: HOST BINDING Y RENDERER2 AVANZADO

## 🎯 Objetivo
Implementar un sistema completo de Drag & Drop usando directivas personalizadas avanzadas con HostBinding y Renderer2 para manipulación profesional del DOM.

## ⏱️ Duración: 25 minutos

## 📋 Conceptos Clave

### 1. HTML5 Drag & Drop API

El HTML5 Drag & Drop API proporciona una forma nativa de implementar funcionalidad de arrastrar y soltar:

#### Eventos Principales
```typescript
// En el elemento arrastrable
@HostListener('dragstart', ['$event'])
onDragStart(event: DragEvent): void {
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData('text/plain', this.dragData);
}

@HostListener('dragend', ['$event'])
onDragEnd(event: DragEvent): void {
  // Limpiar estado de arrastre
}

// En la zona de drop
@HostListener('dragover', ['$event'])
onDragOver(event: DragEvent): void {
  event.preventDefault(); // Permitir drop
  event.dataTransfer!.dropEffect = 'move';
}

@HostListener('drop', ['$event'])
onDrop(event: DragEvent): void {
  event.preventDefault();
  const data = event.dataTransfer!.getData('text/plain');
  // Procesar drop
}
```

#### DataTransfer para Comunicación
```typescript
// Enviar datos
event.dataTransfer!.setData('application/json', JSON.stringify(data));
event.dataTransfer!.setData('text/plain', fallbackData);

// Recibir datos
const jsonData = event.dataTransfer!.getData('application/json');
const data = JSON.parse(jsonData);
```

### 2. HostBinding Dinámico Avanzado

HostBinding permite modificar propiedades del elemento host de forma reactiva:

#### Propiedades CSS Dinámicas
```typescript
@HostBinding('style.opacity')
get opacity(): string {
  return this.isDragging ? '0.5' : '1';
}

@HostBinding('style.transform')
get transform(): string {
  return this.isDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1)';
}

@HostBinding('style.cursor')
get cursor(): string {
  return this.draggable ? 'move' : 'default';
}
```

#### Clases CSS Condicionales
```typescript
@HostBinding('class.dragging') isDragging = false;
@HostBinding('class.drag-over') isDragOver = false;
@HostBinding('class.can-drop') canDrop = false;

@HostBinding('class')
get cssClasses(): string {
  const classes = ['base-class'];
  if (this.isDragging) classes.push('dragging');
  if (this.isDropZone) classes.push('drop-zone');
  return classes.join(' ');
}
```

#### Atributos HTML5
```typescript
@HostBinding('draggable')
get draggable(): boolean {
  return this.enabled && !this.disabled;
}

@HostBinding('attr.aria-grabbed')
get ariaGrabbed(): string | null {
  return this.isDragging ? 'true' : 'false';
}

@HostBinding('attr.data-drag-type')
get dragType(): string {
  return this.type;
}
```

### 3. Renderer2 para Efectos Visuales

Renderer2 permite crear efectos visuales complejos de forma segura:

#### Creación de Elementos de Preview
```typescript
private createDragPreview(event: DragEvent): void {
  // Crear elemento de preview
  const preview = this.renderer.createElement('div');
  this.renderer.addClass(preview, 'drag-preview');
  
  // Clonar contenido del elemento original
  const content = this.el.nativeElement.cloneNode(true);
  this.renderer.appendChild(preview, content);
  
  // Posicionar fuera de vista
  this.renderer.setStyle(preview, 'position', 'absolute');
  this.renderer.setStyle(preview, 'top', '-1000px');
  this.renderer.setStyle(preview, 'left', '-1000px');
  this.renderer.setStyle(preview, 'opacity', '0.8');
  this.renderer.setStyle(preview, 'transform', 'rotate(5deg)');
  
  // Agregar al DOM
  this.renderer.appendChild(document.body, preview);
  
  // Usar como imagen de arrastre
  event.dataTransfer!.setDragImage(preview, 0, 0);
  
  // Limpiar después
  setTimeout(() => {
    this.renderer.removeChild(document.body, preview);
  }, 0);
}
```

#### Efectos de Drop
```typescript
private createDropEffect(event: DragEvent): void {
  const dropEffect = this.renderer.createElement('div');
  this.renderer.addClass(dropEffect, 'drop-effect-ripple');
  
  // Posicionar en el punto de drop
  const rect = this.el.nativeElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  this.renderer.setStyle(dropEffect, 'position', 'absolute');
  this.renderer.setStyle(dropEffect, 'left', `${x}px`);
  this.renderer.setStyle(dropEffect, 'top', `${y}px`);
  this.renderer.setStyle(dropEffect, 'width', '40px');
  this.renderer.setStyle(dropEffect, 'height', '40px');
  this.renderer.setStyle(dropEffect, 'border-radius', '50%');
  this.renderer.setStyle(dropEffect, 'background', 'rgba(102, 126, 234, 0.3)');
  this.renderer.setStyle(dropEffect, 'transform', 'translate(-50%, -50%)');
  this.renderer.setStyle(dropEffect, 'pointer-events', 'none');
  
  this.renderer.appendChild(this.el.nativeElement, dropEffect);
  
  // Animar
  setTimeout(() => {
    this.renderer.setStyle(dropEffect, 'width', '200px');
    this.renderer.setStyle(dropEffect, 'height', '200px');
    this.renderer.setStyle(dropEffect, 'opacity', '0');
    this.renderer.setStyle(dropEffect, 'transition', 'all 0.6s ease-out');
  }, 10);
  
  // Remover
  setTimeout(() => {
    this.renderer.removeChild(this.el.nativeElement, dropEffect);
  }, 600);
}
```

### 4. Patrón de Directivas Colaborativas

Las directivas pueden trabajar juntas para crear sistemas complejos:

#### Directiva Draggable
```typescript
@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() appDraggable = true;
  @Input() dragData: any = null;
  @Output() dragStart = new EventEmitter<DragEvent>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  
  @HostBinding('draggable') get draggable() {
    return this.appDraggable;
  }
  
  @HostBinding('class.dragging') isDragging = false;
  
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    this.isDragging = true;
    this.dragStart.emit(event);
    // Configurar datos de transferencia
    event.dataTransfer!.setData('application/json', JSON.stringify(this.dragData));
  }
}
```

#### Directiva DropZone
```typescript
@Directive({
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Input() appDropZone = true;
  @Input() acceptTypes: string[] = [];
  @Output() itemDropped = new EventEmitter<any>();
  
  @HostBinding('class.drop-zone') isDropZone = true;
  @HostBinding('class.drag-over') isDragOver = false;
  
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (this.canAcceptDrop(event)) {
      event.preventDefault();
      this.isDragOver = true;
    }
  }
  
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const data = JSON.parse(event.dataTransfer!.getData('application/json'));
    this.itemDropped.emit({ data, event });
  }
}
```

## 🛠️ Implementación Paso a Paso

### PASO 1: Crear Directivas de Drag & Drop (10 minutos)

#### 1.1 Directiva Draggable

```bash
ng generate directive directives/custom/draggable --standalone
```

Actualizar `src/app/directives/custom/draggable.directive.ts`:

```typescript
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() appDraggable = true;
  @Input() dragData: any = null;
  @Input() dragHandle = '';
  @Input() dragPreview = true;
  
  @Output() dragStart = new EventEmitter<DragEvent>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() dragMove = new EventEmitter<DragEvent>();
  
  @HostBinding('draggable')
  get draggable(): boolean {
    return this.appDraggable && !this.dragHandle;
  }
  
  @HostBinding('class.dragging')
  isDragging = false;
  
  @HostBinding('style.cursor')
  get cursor(): string {
    return this.appDraggable ? 'move' : 'default';
  }
  
  @HostBinding('style.opacity')
  get opacity(): string {
    return this.isDragging ? '0.5' : '1';
  }
  
  @HostBinding('style.transform')
  get transform(): string {
    return this.isDragging ? 'scale(1.05)' : 'scale(1)';
  }
  
  private dragCounter = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.setupDragHandle();
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!this.appDraggable) {
      event.preventDefault();
      return;
    }

    this.isDragging = true;
    this.dragCounter = 0;

    // Configurar datos de transferencia
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', JSON.stringify(this.dragData || {}));
    event.dataTransfer!.setData('dragElementId', this.el.nativeElement.id || '');

    // Crear preview personalizado si está habilitado
    if (this.dragPreview) {
      this.createDragPreview(event);
    }

    this.dragStart.emit(event);
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    this.isDragging = false;
    this.dragEnd.emit(event);
    this.cleanupDragPreview();
  }

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent): void {
    this.dragCounter++;
    if (this.dragCounter % 5 === 0) { // Emitir cada 5 eventos para optimización
      this.dragMove.emit(event);
    }
  }

  private setupDragHandle(): void {
    if (this.dragHandle) {
      const handle = this.el.nativeElement.querySelector(this.dragHandle);
      if (handle) {
        this.renderer.setAttribute(handle, 'draggable', 'true');
        this.renderer.setStyle(handle, 'cursor', 'move');
      }
    }
  }

  private createDragPreview(event: DragEvent): void {
    const preview = this.renderer.createElement('div');
    this.renderer.addClass(preview, 'drag-preview');
    this.renderer.setStyle(preview, 'position', 'absolute');
    this.renderer.setStyle(preview, 'top', '-1000px');
    this.renderer.setStyle(preview, 'left', '-1000px');
    this.renderer.setStyle(preview, 'opacity', '0.8');
    this.renderer.setStyle(preview, 'transform', 'rotate(2deg) scale(1.05)');
    this.renderer.setStyle(preview, 'box-shadow', '0 10px 30px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(preview, 'border-radius', '8px');
    this.renderer.setStyle(preview, 'background', 'white');
    this.renderer.setStyle(preview, 'padding', '10px');
    
    // Copiar contenido del elemento
    const content = this.el.nativeElement.cloneNode(true);
    this.renderer.appendChild(preview, content);
    this.renderer.appendChild(document.body, preview);
    
    // Establecer como imagen de arrastre
    event.dataTransfer!.setDragImage(preview, 0, 0);
    
    // Limpiar después de un pequeño retraso
    setTimeout(() => {
      this.renderer.removeChild(document.body, preview);
    }, 0);
  }

  private cleanupDragPreview(): void {
    // Limpieza adicional si es necesaria
  }
}
```

#### 1.2 Directiva DropZone

```bash
ng generate directive directives/custom/drop-zone --standalone
```

Actualizar `src/app/directives/custom/drop-zone.directive.ts`:

```typescript
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Input() appDropZone = true;
  @Input() acceptTypes: string[] = [];
  @Input() dropEffect: 'none' | 'copy' | 'link' | 'move' = 'move';
  
  @Output() itemDropped = new EventEmitter<any>();
  @Output() dragEntered = new EventEmitter<DragEvent>();
  @Output() dragLeft = new EventEmitter<DragEvent>();
  @Output() draggedOver = new EventEmitter<DragEvent>();
  
  @HostBinding('class.drop-zone')
  isDropZone = true;
  
  @HostBinding('class.drag-over')
  isDragOver = false;
  
  @HostBinding('class.can-drop')
  canDrop = false;
  
  @HostBinding('style.border')
  get border(): string {
    if (!this.appDropZone) return '2px solid #dee2e6';
    return this.isDragOver 
      ? '2px dashed #667eea' 
      : '2px solid #dee2e6';
  }
  
  @HostBinding('style.background-color')
  get backgroundColor(): string {
    if (!this.appDropZone) return 'transparent';
    return this.isDragOver 
      ? 'rgba(102, 126, 234, 0.1)' 
      : 'transparent';
  }
  
  private dragCounter = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = this.dropEffect;
    
    this.draggedOver.emit(event);
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    event.preventDefault();
    this.dragCounter++;
    
    if (this.dragCounter === 1) {
      this.isDragOver = true;
      this.canDrop = this.checkCanDrop(event);
      this.addHighlight();
      this.dragEntered.emit(event);
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    this.dragCounter--;
    
    if (this.dragCounter === 0) {
      this.isDragOver = false;
      this.canDrop = false;
      this.removeHighlight();
      this.dragLeft.emit(event);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragOver = false;
    this.canDrop = false;
    this.dragCounter = 0;
    
    // Obtener datos transferidos
    const data = this.getTransferData(event);
    
    // Crear efecto visual de drop
    this.createDropEffect(event);
    
    // Emitir evento con datos
    this.itemDropped.emit({
      data: data,
      event: event,
      target: this.el.nativeElement
    });
    
    this.removeHighlight();
  }

  private checkCanDrop(event: DragEvent): boolean {
    if (this.acceptTypes.length === 0) return true;
    
    const types = event.dataTransfer?.types || [];
    return this.acceptTypes.some(type => types.includes(type));
  }

  private getTransferData(event: DragEvent): any {
    const jsonData = event.dataTransfer?.getData('text/plain');
    try {
      return jsonData ? JSON.parse(jsonData) : null;
    } catch {
      return jsonData;
    }
  }

  private addHighlight(): void {
    this.renderer.addClass(this.el.nativeElement, 'drop-zone-highlight');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.02)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 8px 25px rgba(102, 126, 234, 0.2)');
  }

  private removeHighlight(): void {
    this.renderer.removeClass(this.el.nativeElement, 'drop-zone-highlight');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
  }

  private createDropEffect(event: DragEvent): void {
    const dropEffect = this.renderer.createElement('div');
    this.renderer.addClass(dropEffect, 'drop-effect-ripple');
    
    // Posicionar en el punto de drop
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.renderer.setStyle(dropEffect, 'position', 'absolute');
    this.renderer.setStyle(dropEffect, 'left', `${x}px`);
    this.renderer.setStyle(dropEffect, 'top', `${y}px`);
    this.renderer.setStyle(dropEffect, 'width', '40px');
    this.renderer.setStyle(dropEffect, 'height', '40px');
    this.renderer.setStyle(dropEffect, 'border-radius', '50%');
    this.renderer.setStyle(dropEffect, 'background', 'rgba(102, 126, 234, 0.3)');
    this.renderer.setStyle(dropEffect, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(dropEffect, 'pointer-events', 'none');
    this.renderer.setStyle(dropEffect, 'z-index', '1000');
    
    this.renderer.appendChild(this.el.nativeElement, dropEffect);
    
    // Animar y remover
    setTimeout(() => {
      this.renderer.setStyle(dropEffect, 'width', '200px');
      this.renderer.setStyle(dropEffect, 'height', '200px');
      this.renderer.setStyle(dropEffect, 'opacity', '0');
      this.renderer.setStyle(dropEffect, 'transition', 'all 0.6s ease-out');
    }, 10);
    
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, dropEffect);
    }, 600);
  }
}
```

### PASO 2: Crear Sistema Kanban con Drag & Drop (15 minutos)

```bash
ng generate component components/directivas-demo/kanban-board --standalone --skip-tests
```

Actualizar `src/app/components/directivas-demo/kanban-board/kanban-board.component.ts`:

```typescript
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DraggableDirective } from '../../../directives/custom/draggable.directive';
import { DropZoneDirective } from '../../../directives/custom/drop-zone.directive';
import { TooltipDirective } from '../../../directives/custom/tooltip.directive';
import { LazyLoadDirective } from '../../../directives/custom/lazy-load.directive';
import { ValidationFeedbackDirective } from '../../../directives/custom/validation-feedback.directive';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  dueDate: Date;
  attachments: number;
  comments: number;
  avatar?: string;
  column: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  limit?: number;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DraggableDirective,
    DropZoneDirective,
    TooltipDirective,
    LazyLoadDirective,
    ValidationFeedbackDirective
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss'
})
export class KanbanBoardComponent implements OnInit {
  // Estado del tablero
  columns = signal<Column[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      color: '#6c757d',
      tasks: []
    },
    {
      id: 'todo',
      title: 'Por Hacer',
      color: '#007bff',
      limit: 5,
      tasks: []
    },
    {
      id: 'progress',
      title: 'En Progreso',
      color: '#ffc107',
      limit: 3,
      tasks: []
    },
    {
      id: 'review',
      title: 'En Revisión',
      color: '#17a2b8',
      limit: 2,
      tasks: []
    },
    {
      id: 'done',
      title: 'Completado',
      color: '#28a745',
      tasks: []
    }
  ]);

  // Estado de la UI
  draggedTask = signal<Task | null>(null);
  draggedFromColumn = signal<string | null>(null);
  showAddTaskModal = signal(false);
  editingTask = signal<Task | null>(null);
  searchTerm = signal('');
  filterPriority = signal<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  
  // Formulario de nueva tarea
  newTask = signal<Partial<Task>>({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    tags: [],
    dueDate: new Date(),
    column: 'backlog'
  });

  // Validación
  taskValidation = computed(() => {
    const task = this.newTask();
    if (!task.title || task.title.length < 3) return 'invalid';
    if (!task.assignee) return 'invalid';
    return 'valid';
  });

  // Estadísticas
  statistics = computed(() => {
    const cols = this.columns();
    const allTasks = cols.flatMap(c => c.tasks);
    
    return {
      total: allTasks.length,
      backlog: cols.find(c => c.id === 'backlog')?.tasks.length || 0,
      inProgress: cols.find(c => c.id === 'progress')?.tasks.length || 0,
      completed: cols.find(c => c.id === 'done')?.tasks.length || 0,
      critical: allTasks.filter(t => t.priority === 'critical').length,
      overdue: allTasks.filter(t => new Date(t.dueDate) < new Date()).length
    };
  });

  // Usuarios disponibles
  users = [
    { id: 'user1', name: 'Carlos López', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'user2', name: 'Ana García', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 'user3', name: 'María Rodriguez', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 'user4', name: 'Jorge Mendoza', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 'user5', name: 'Luis Fernández', avatar: 'https://i.pravatar.cc/150?img=5' }
  ];

  // Tags disponibles
  availableTags = [
    'Frontend', 'Backend', 'Database', 'API', 'Testing', 
    'Bug', 'Feature', 'Enhancement', 'Documentation', 'Security'
  ];

  ngOnInit(): void {
    console.log('🎯 LAB 4: Kanban Board con Drag & Drop inicializado');
    this.loadInitialTasks();
  }

  // Cargar tareas iniciales
  private loadInitialTasks(): void {
    const initialTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Implementar autenticación OAuth',
        description: 'Agregar login con Google y Facebook usando OAuth 2.0',
        assignee: 'Carlos López',
        priority: 'high',
        tags: ['Backend', 'Security', 'API'],
        dueDate: new Date('2025-08-15'),
        attachments: 2,
        comments: 5,
        avatar: 'https://i.pravatar.cc/150?img=1',
        column: 'progress'
      },
      {
        id: 'task-2',
        title: 'Diseñar dashboard de métricas',
        description: 'Crear mockups y diseño del nuevo dashboard con gráficos interactivos',
        assignee: 'Ana García',
        priority: 'medium',
        tags: ['Frontend', 'Feature'],
        dueDate: new Date('2025-08-10'),
        attachments: 3,
        comments: 2,
        avatar: 'https://i.pravatar.cc/150?img=2',
        column: 'todo'
      },
      {
        id: 'task-3',
        title: 'Optimizar consultas de base de datos',
        description: 'Mejorar performance de queries lentas identificadas en producción',
        assignee: 'María Rodriguez',
        priority: 'critical',
        tags: ['Database', 'Backend'],
        dueDate: new Date('2025-08-08'),
        attachments: 1,
        comments: 8,
        avatar: 'https://i.pravatar.cc/150?img=3',
        column: 'review'
      },
      {
        id: 'task-4',
        title: 'Escribir documentación API v2',
        description: 'Documentar todos los endpoints de la nueva versión de la API',
        assignee: 'Jorge Mendoza',
        priority: 'low',
        tags: ['Documentation', 'API'],
        dueDate: new Date('2025-08-20'),
        attachments: 0,
        comments: 1,
        avatar: 'https://i.pravatar.cc/150?img=4',
        column: 'backlog'
      },
      {
        id: 'task-5',
        title: 'Corregir bug en formulario de registro',
        description: 'El formulario no valida correctamente el campo de email',
        assignee: 'Luis Fernández',
        priority: 'high',
        tags: ['Bug', 'Frontend'],
        dueDate: new Date('2025-08-07'),
        attachments: 0,
        comments: 3,
        avatar: 'https://i.pravatar.cc/150?img=5',
        column: 'done'
      }
    ];

    // Distribuir tareas en columnas
    this.columns.update(cols => {
      return cols.map(col => ({
        ...col,
        tasks: initialTasks.filter(task => task.column === col.id)
      }));
    });
  }

  // Drag & Drop handlers
  onDragStart(task: Task, columnId: string): void {
    this.draggedTask.set(task);
    this.draggedFromColumn.set(columnId);
    console.log('🎯 Arrastrando tarea:', task.title, 'desde columna:', columnId);
  }

  onDragEnd(): void {
    this.draggedTask.set(null);
    this.draggedFromColumn.set(null);
  }

  onDrop(event: any, targetColumnId: string): void {
    const task = this.draggedTask();
    const fromColumnId = this.draggedFromColumn();
    
    if (!task || !fromColumnId) return;
    
    // Verificar límite de columna
    const targetColumn = this.columns().find(c => c.id === targetColumnId);
    if (targetColumn?.limit && targetColumn.tasks.length >= targetColumn.limit) {
      alert(`La columna "${targetColumn.title}" ha alcanzado su límite de ${targetColumn.limit} tareas`);
      return;
    }
    
    // Mover tarea
    this.moveTask(task, fromColumnId, targetColumnId);
    
    // Log de actividad
    console.log(`✅ Tarea "${task.title}" movida de "${fromColumnId}" a "${targetColumnId}"`);
  }

  private moveTask(task: Task, fromColumnId: string, toColumnId: string): void {
    this.columns.update(cols => {
      return cols.map(col => {
        if (col.id === fromColumnId) {
          // Remover de columna origen
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== task.id)
          };
        } else if (col.id === toColumnId) {
          // Agregar a columna destino
          const updatedTask = { ...task, column: toColumnId };
          return {
            ...col,
            tasks: [...col.tasks, updatedTask]
          };
        }
        return col;
      });
    });
  }

  // CRUD de tareas
  addTask(): void {
    if (this.taskValidation() !== 'valid') return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: this.newTask().title!,
      description: this.newTask().description || '',
      assignee: this.newTask().assignee!,
      priority: this.newTask().priority as any,
      tags: this.newTask().tags || [],
      dueDate: this.newTask().dueDate!,
      attachments: 0,
      comments: 0,
      avatar: this.users.find(u => u.name === this.newTask().assignee)?.avatar,
      column: this.newTask().column!
    };
    
    this.columns.update(cols => {
      return cols.map(col => {
        if (col.id === task.column) {
          return {
            ...col,
            tasks: [...col.tasks, task]
          };
        }
        return col;
      });
    });
    
    this.resetNewTask();
    this.showAddTaskModal.set(false);
  }

  editTask(task: Task): void {
    this.editingTask.set(task);
    this.newTask.set({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      tags: [...task.tags],
      dueDate: task.dueDate,
      column: task.column
    });
    this.showAddTaskModal.set(true);
  }

  deleteTask(taskId: string, columnId: string): void {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) return;
    
    this.columns.update(cols => {
      return cols.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: col.tasks.filter(t => t.id !== taskId)
          };
        }
        return col;
      });
    });
  }

  // Helpers
  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };
    return icons[priority] || '⚪';
  }

  getDaysUntilDue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  resetNewTask(): void {
    this.newTask.set({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      tags: [],
      dueDate: new Date(),
      column: 'backlog'
    });
    this.editingTask.set(null);
  }

  toggleTag(tag: string): void {
    this.newTask.update(task => {
      const tags = task.tags || [];
      const index = tags.indexOf(tag);
      if (index > -1) {
        tags.splice(index, 1);
      } else {
        tags.push(tag);
      }
      return { ...task, tags };
    });
  }
}
```

Crear template abreviado `src/app/components/directivas-demo/kanban-board/kanban-board.component.html`:

```html
<div class="kanban-board">
  <!-- Header -->
  <header class="kanban-header">
    <h1>📋 Tablero Kanban - Drag & Drop Avanzado</h1>
    <p class="subtitle">Sistema completo con HostBinding y Renderer2</p>
    
    <!-- Estadísticas rápidas -->
    <div class="quick-stats">
      <span class="stat" 
            appTooltip="Total de tareas en el sistema"
            tooltipPosition="bottom">
        📊 {{ statistics().total }}
      </span>
      <span class="stat critical" 
            appTooltip="Tareas con prioridad crítica"
            tooltipPosition="bottom">
        🔴 {{ statistics().critical }}
      </span>
      <span class="stat overdue"
            appTooltip="Tareas vencidas"
            tooltipPosition="bottom">
        ⚠️ {{ statistics().overdue }}
      </span>
    </div>
  </header>

  <!-- Controles -->
  <div class="controls">
    <button 
      class="btn btn-primary"
      (click)="showAddTaskModal.set(true)"
      appTooltip="Crear nueva tarea"
      tooltipPosition="bottom">
      ➕ Nueva Tarea
    </button>
  </div>

  <!-- Tablero Kanban -->
  <div class="kanban-columns">
    @for (column of columns(); track column.id) {
      <div 
        class="kanban-column"
        appDropZone
        [appDropZone]="true"
        (itemDropped)="onDrop($event, column.id)"
        [style.border-top]="'4px solid ' + column.color">
        
        <!-- Header de Columna -->
        <div class="column-header" [style.background-color]="column.color">
          <h3>{{ column.title }}</h3>
          <div class="column-meta">
            <span class="task-count">{{ column.tasks.length }}</span>
            @if (column.limit) {
              <span 
                class="task-limit"
                [class.limit-reached]="column.tasks.length >= column.limit"
                appTooltip="Límite de tareas: {{ column.tasks.length }}/{{ column.limit }}"
                tooltipPosition="top">
                / {{ column.limit }}
              </span>
            }
          </div>
        </div>

        <!-- Tareas -->
        <div class="column-tasks">
          @for (task of column.tasks; track task.id) {
            <div 
              class="task-card"
              [class]="getPriorityClass(task.priority)"
              [class.overdue]="isOverdue(task.dueDate)"
              appDraggable
              [appDraggable]="true"
              [dragData]="task"
              (dragStart)="onDragStart(task, column.id)"
              (dragEnd)="onDragEnd()">
              
              <!-- Task Header -->
              <div class="task-header">
                <div class="task-priority"
                     [appTooltip]="'Prioridad: ' + task.priority"
                     tooltipPosition="right">
                  {{ getPriorityIcon(task.priority) }}
                </div>
                <h4>{{ task.title }}</h4>
                <div class="task-actions">
                  <button 
                    class="btn-icon"
                    (click)="editTask(task)"
                    appTooltip="Editar tarea"
                    tooltipPosition="left">
                    ✏️
                  </button>
                  <button 
                    class="btn-icon"
                    (click)="deleteTask(task.id, column.id)"
                    appTooltip="Eliminar tarea"
                    tooltipPosition="left">
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Task Content -->
              @if (task.description) {
                <p class="task-description">{{ task.description }}</p>
              }

              <!-- Task Tags -->
              @if (task.tags.length > 0) {
                <div class="task-tags">
                  @for (tag of task.tags; track tag) {
                    <span class="tag"
                          [appTooltip]="'Etiqueta: ' + tag"
                          tooltipPosition="top">
                      {{ tag }}
                    </span>
                  }
                </div>
              }

              <!-- Task Footer -->
              <div class="task-footer">
                <div class="task-assignee">
                  @if (task.avatar) {
                    <img 
                      [appLazyLoad]="task.avatar"
                      lazyLoadPlaceholder="https://via.placeholder.com/32x32?text=?"
                      alt="{{ task.assignee }}"
                      class="assignee-avatar"
                      [appTooltip]="'Asignado a: ' + task.assignee"
                      tooltipPosition="top">
                  } @else {
                    <div class="assignee-initials"
                         [appTooltip]="'Asignado a: ' + task.assignee"
                         tooltipPosition="top">
                      {{ task.assignee.split(' ').map(n => n[0]).join('') }}
                    </div>
                  }
                </div>

                <div class="task-meta">
                  @if (task.attachments > 0) {
                    <span 
                      class="meta-item"
                      [appTooltip]="task.attachments + ' archivos adjuntos'"
                      tooltipPosition="top">
                      📎 {{ task.attachments }}
                    </span>
                  }
                  @if (task.comments > 0) {
                    <span 
                      class="meta-item"
                      [appTooltip]="task.comments + ' comentarios'"
                      tooltipPosition="top">
                      💬 {{ task.comments }}
                    </span>
                  }
                </div>

                <div class="task-due-date" [class.overdue]="isOverdue(task.dueDate)">
                  @if (isOverdue(task.dueDate)) {
                    <span appTooltip="¡Tarea vencida!" 
                          tooltipPosition="top"
                          tooltipClass="tooltip-error">
                      ⚠️ Vencida
                    </span>
                  } @else {
                    <span [appTooltip]="'Vence en ' + getDaysUntilDue(task.dueDate) + ' días'"
                          tooltipPosition="top">
                      📅 {{ getDaysUntilDue(task.dueDate) }}d
                    </span>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Empty State -->
          @if (column.tasks.length === 0) {
            <div class="empty-column">
              <p>Sin tareas</p>
              <small>Arrastra tareas aquí</small>
            </div>
          }
        </div>
      </div>
    }
  </div>

  <!-- Resumen de Implementación -->
  <section class="implementation-summary">
    <h2>🎯 Técnicas Avanzadas Implementadas</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>DraggableDirective</h3>
        <ul>
          <li><code>@HostBinding</code> para opacity, transform, cursor</li>
          <li><code>@HostListener</code> para dragstart, dragend, drag</li>
          <li><code>DataTransfer</code> para comunicación de datos</li>
          <li><code>Renderer2</code> para preview personalizado</li>
        </ul>
      </div>
      
      <div class="summary-card">
        <h3>DropZoneDirective</h3>
        <ul>
          <li><code>@HostBinding</code> para bordes y background dinámicos</li>
          <li>Detección de drag over con contador</li>
          <li>Efectos de drop con animación ripple</li>
          <li>Validación de tipos aceptados</li>
        </ul>
      </div>
      
      <div class="summary-card">
        <h3>Efectos Visuales</h3>
        <ul>
          <li>Preview de drag personalizado</li>
          <li>Animaciones de hover y drop</li>
          <li>Feedback visual inmediato</li>
          <li>Estados CSS dinámicos</li>
        </ul>
      </div>
      
      <div class="summary-card">
        <h3>Performance</h3>
        <ul>
          <li>Event throttling en drag move</li>
          <li>Cleanup automático de elementos</li>
          <li>Lazy loading de avatares</li>
          <li>Signals para reactividad optimizada</li>
        </ul>
      </div>
    </div>
  </section>
</div>
```

Agregar rutas y verificar funcionamiento:

```typescript
// En app.routes.ts
{ path: 'kanban-board', component: KanbanBoardComponent }
```

## ✅ CHECKLIST DE VERIFICACIÓN LAB 4

### Drag & Drop Funcionando
- [ ] DraggableDirective arrastra elementos correctamente
- [ ] DropZoneDirective acepta drops en zonas válidas
- [ ] DataTransfer comunica datos entre elementos
- [ ] Efectos visuales durante drag (opacity, transform)

### HostBinding Avanzado
- [ ] Estilos dinámicos (opacity, transform, cursor)
- [ ] Clases CSS condicionales (dragging, drag-over)
- [ ] Bordes y backgrounds reactivos
- [ ] Atributos HTML5 (draggable, aria-*)

### Renderer2 Profesional
- [ ] Creación de elementos de preview
- [ ] Efectos de drop con animación
- [ ] Manipulación segura del DOM
- [ ] Cleanup automático de elementos

### Sistema Kanban Completo
- [ ] Tareas se mueven entre columnas
- [ ] Límites de columnas respetados
- [ ] Estados visuales claros
- [ ] CRUD de tareas funcional

### Testing Manual
```bash
# Ejecutar la aplicación
ng serve --open

# Navegar a http://localhost:4200/kanban-board
# Verificar:
# 1. Tareas se pueden arrastrar suavemente
# 2. Columnas iluminan al recibir drag over
# 3. Efectos de drop aparecen al soltar
# 4. Límites de columnas se respetan
# 5. Tooltips muestran información adicional
# 6. Lazy loading de avatares funciona
```

## 🎓 Conocimientos Adquiridos

Al completar este laboratorio habrás dominado:

### 1. HTML5 Drag & Drop
- ✅ **API nativa**: dragstart, dragover, drop events
- ✅ **DataTransfer**: Comunicación de datos entre elementos
- ✅ **effectAllowed/dropEffect**: Control de tipos de operación
- ✅ **setDragImage**: Preview personalizado de arrastre

### 2. HostBinding Avanzado
- ✅ **Propiedades dinámicas**: Estilos y clases reactivas
- ✅ **Getters computados**: Lógica compleja en bindings
- ✅ **Múltiples bindings**: Combinación de estilos y clases
- ✅ **Performance**: Optimización con computed signals

### 3. Renderer2 Profesional
- ✅ **Manipulación segura**: Creación y modificación de elementos
- ✅ **Efectos visuales**: Animaciones y transiciones
- ✅ **Event handling**: Listeners con cleanup automático
- ✅ **Memory management**: Prevención de memory leaks

### 4. Arquitectura de Directivas
- ✅ **Directivas colaborativas**: Draggable + DropZone
- ✅ **EventEmitters**: Comunicación con componentes padre
- ✅ **Input/Output**: Configuración y eventos personalizados
- ✅ **Lifecycle hooks**: Gestión de recursos

### 5. Patrones Avanzados
- ✅ **State management**: Signals para estado del drag
- ✅ **Visual feedback**: Estados claros para el usuario
- ✅ **Error handling**: Validación y límites
- ✅ **Accessibility**: ARIA attributes para screen readers

## 💡 Casos de Uso Reales

Esta implementación es aplicable a:

- **📋 Gestión de Proyectos**: Tableros Kanban como Trello, Jira
- **📊 Dashboards**: Widgets reorganizables por el usuario
- **📁 Gestores de Archivos**: Drag & drop de archivos y carpetas
- **🎮 Interfaces de Juego**: Inventarios, construcción de bases
- **📝 Editores**: Ordenamiento de elementos, jerarquías

## 🚀 Conclusión del Laboratorio

Has completado exitosamente el **LAB 4: Host Binding y Renderer2 Avanzado**. Este laboratorio representa la culminación de técnicas avanzadas de directivas en Angular 18:

- **Drag & Drop nativo**: Implementación completa con HTML5 API
- **HostBinding dinámico**: Estilos y clases reactivas profesionales  
- **Renderer2 seguro**: Manipulación del DOM sin riesgos de seguridad
- **Efectos visuales**: Animaciones y feedback para mejor UX

El sistema Kanban que has construido demuestra cómo las directivas personalizadas pueden crear experiencias de usuario sofisticadas y profesionales.

---

*Este laboratorio cierra la sesión de directivas con el ejemplo más avanzado. Has progresado desde directivas básicas hasta un sistema completo de interfaz interactiva que rivaliza con aplicaciones comerciales modernas.*
