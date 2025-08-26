import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraggableDirective } from '../../directives/draggable.directive';
import { DropZoneDirective } from '../../directives/drop-zone.directive';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface KanbanColumn {
  id: 'todo' | 'progress' | 'done';
  title: string;
  icon: string;
  color: string;
  description: string;
  maxTasks?: number;
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DraggableDirective, DropZoneDirective],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss'
})
export class KanbanBoardComponent implements OnInit {
  // Signals para estado reactivo según especificaciones del documento
  private readonly _tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Carretera Lima-Huancayo',
      description: 'Rehabilitación de 50km de carretera principal',
      status: 'todo',
      priority: 'high',
      assignee: 'Ing. Carlos Mendoza',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15')
    },
    {
      id: '2',
      title: 'Puente Río Mantaro',
      description: 'Construcción de puente vehicular de 120m',
      status: 'todo',
      priority: 'high',
      assignee: 'Ing. María García',
      createdAt: new Date('2025-01-16'),
      updatedAt: new Date('2025-01-16')
    },
    {
      id: '3',
      title: 'Señalización Vial Sectores 1-3',
      description: 'Instalación de señales en tramos críticos',
      status: 'progress',
      priority: 'medium',
      assignee: 'Ing. José Torres',
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-20')
    },
    {
      id: '4',
      title: 'Mantenimiento Preventivo Km 45-65',
      description: 'Bacheo y reparación de fisuras menores',
      status: 'progress',
      priority: 'low',
      assignee: 'Ing. Ana Vilchez',
      createdAt: new Date('2025-01-12'),
      updatedAt: new Date('2025-01-18')
    },
    {
      id: '5',
      title: 'Estudio Geotécnico Sector Norte',
      description: 'Análisis técnico para ampliación futura',
      status: 'done',
      priority: 'medium',
      assignee: 'Ing. Ricardo Paredes',
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-25')
    },
    {
      id: '6',
      title: 'Capacitación Personal Técnico',
      description: 'Entrenamiento en nuevos procedimientos de seguridad',
      status: 'done',
      priority: 'low',
      assignee: 'Coordinadora RRHH',
      createdAt: new Date('2025-01-08'),
      updatedAt: new Date('2025-01-22')
    }
  ]);

  // Configuración de columnas según especificaciones del documento
  readonly columns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'Por Hacer',
      icon: '📋',
      color: '#ef4444',
      description: 'Proyectos planificados y asignados',
      maxTasks: 10
    },
    {
      id: 'progress', 
      title: 'En Progreso',
      icon: '⚡',
      color: '#f59e0b',
      description: 'Proyectos en ejecución activa',
      maxTasks: 5
    },
    {
      id: 'done',
      title: 'Completado',
      icon: '✅',
      color: '#10b981',
      description: 'Proyectos finalizados exitosamente'
    }
  ];

  // Computed signals para filtrar tareas por columna
  readonly todoTasks = computed(() => 
    this._tasks().filter(task => task.status === 'todo')
  );

  readonly progressTasks = computed(() => 
    this._tasks().filter(task => task.status === 'progress')
  );

  readonly doneTasks = computed(() => 
    this._tasks().filter(task => task.status === 'done')
  );

  // Computed signal para estadísticas del dashboard
  readonly stats = computed(() => {
    const tasks = this._tasks();
    const total = tasks.length;
    const todo = this.todoTasks().length;
    const progress = this.progressTasks().length;  
    const done = this.doneTasks().length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    
    return {
      total,
      todo,
      progress,
      done,
      highPriority,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      inProgressRate: total > 0 ? Math.round((progress / total) * 100) : 0
    };
  });

  // Computed signal para verificar límites de columnas
  readonly columnStatus = computed(() => ({
    todo: {
      count: this.todoTasks().length,
      isNearLimit: this.todoTasks().length >= 8,
      isAtLimit: this.todoTasks().length >= 10
    },
    progress: {
      count: this.progressTasks().length,
      isNearLimit: this.progressTasks().length >= 4,
      isAtLimit: this.progressTasks().length >= 5
    },
    done: {
      count: this.doneTasks().length,
      isNearLimit: false,
      isAtLimit: false
    }
  }));

  ngOnInit() {
    this.loadFromLocalStorage();
    console.log('🏗️ Kanban Board inicializado con', this.stats().total, 'proyectos');
  }

  // Método principal para manejar drops entre columnas
  onTaskDropped(event: {item: Task, zone: string}) {
    const { item, zone } = event;
    const newStatus = zone as Task['status'];
    
    if (item.status === newStatus) {
      console.log('⚠️ Tarea ya está en la columna correcta');
      return;
    }

    // Verificar límites de columna
    const targetColumn = this.columns.find(col => col.id === newStatus);
    if (targetColumn?.maxTasks) {
      const currentCount = this.getTasksForColumn(newStatus).length;
      if (currentCount >= targetColumn.maxTasks) {
        console.log('🚫 Columna llena! Máximo:', targetColumn.maxTasks);
        return;
      }
    }
    
    // Actualizar estado de la tarea
    this._tasks.update(tasks => 
      tasks.map(task => 
        task.id === item.id 
          ? { ...task, status: newStatus, updatedAt: new Date() }
          : task
      )
    );

    // Persistir cambios
    this.saveToLocalStorage();
    
    console.log(`✅ Proyecto "${item.title}" movido a "${this.getColumnTitle(newStatus)}"`);
    
    // Log de estadísticas actualizadas
    const newStats = this.stats();
    console.log(`📊 Estadísticas: ${newStats.todo} pendientes, ${newStats.progress} en progreso, ${newStats.done} completados (${newStats.completionRate}%)`);
  }

  // Eventos de arrastre
  onTaskDragStart(task: Task) {
    console.log(`🖱️ Iniciando arrastre: ${task.title} [${task.priority}]`);
  }

  onTaskDragEnd() {
    console.log('🏁 Arrastre finalizado');
  }

  // Métodos auxiliares
  getPriorityClass(priority: Task['priority']): string {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-critical'
    };
    return classes[priority];
  }

  getPriorityIcon(priority: Task['priority']): string {
    const icons = {
      low: '🟢',
      medium: '🟡', 
      high: '🔴'
    };
    return icons[priority];
  }

  getPriorityLabel(priority: Task['priority']): string {
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Crítica'
    };
    return labels[priority];
  }

  getTasksForColumn(columnId: string): Task[] {
    switch (columnId) {
      case 'todo': return this.todoTasks();
      case 'progress': return this.progressTasks();
      case 'done': return this.doneTasks();
      default: return [];
    }
  }

  getColumnTitle(columnId: string): string {
    return this.columns.find(col => col.id === columnId)?.title || columnId;
  }

  getColumnColor(columnId: string): string {
    return this.columns.find(col => col.id === columnId)?.color || '#6b7280';
  }

  // Métodos para gestión de tiempo
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  getDaysAgo(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isTaskRecent(task: Task): boolean {
    return this.getDaysAgo(task.createdAt) <= 3;
  }

  isTaskUpdatedRecently(task: Task): boolean {
    return this.getDaysAgo(task.updatedAt) <= 1;
  }

  // Persistencia en localStorage según especificaciones
  private saveToLocalStorage() {
    try {
      const tasksData = {
        tasks: this._tasks(),
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('kanban-tasks-lab04', JSON.stringify(tasksData));
      console.log('💾 Datos guardados en localStorage');
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('kanban-tasks-lab04');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.tasks && Array.isArray(data.tasks)) {
          // Convertir fechas de string a Date objects
          const tasks = data.tasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt)
          }));
          this._tasks.set(tasks);
          console.log('📂 Datos cargados desde localStorage:', tasks.length, 'proyectos');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando desde localStorage:', error);
    }
  }

  // Método para resetear datos (para testing)
  resetToDefaults() {
    localStorage.removeItem('kanban-tasks-lab04');
    location.reload();
  }
}
