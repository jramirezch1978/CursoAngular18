import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DraggableDirective } from '../../directives/draggable.directive';
import { DropZoneDirective } from '../../directives/drop-zone.directive';

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
    DropZoneDirective
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
