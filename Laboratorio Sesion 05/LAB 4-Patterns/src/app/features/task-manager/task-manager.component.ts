import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStore } from '../../core/store/app.store';
import { UnitOfWork } from '../../core/patterns/unit-of-work.pattern';
import { TaskRepository } from '../../core/repositories/task.repository';
import { Task, TaskStatus, TaskPriority, CreateTaskDto } from '../../core/interfaces/task.interface';
import { LOGGER_TOKEN } from '../../core/tokens/config.tokens';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task-manager-container">
      <!-- Header with User Info -->
      @if (store.user()) {
        <div class="user-info">
          <h3>👤 {{ store.user()?.name }}</h3>
          <p>{{ store.user()?.email }} - {{ store.user()?.role }}</p>
        </div>
      }

      <!-- Statistics Dashboard -->
      <div class="statistics-dashboard">
        <h2>📊 Dashboard de Tareas</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>Total</h4>
            <span class="stat-value">{{ store.statistics().total }}</span>
          </div>
          <div class="stat-card pending">
            <h4>Pendientes</h4>
            <span class="stat-value">{{ store.statistics().pending }}</span>
          </div>
          <div class="stat-card in-progress">
            <h4>En Progreso</h4>
            <span class="stat-value">{{ store.statistics().inProgress }}</span>
          </div>
          <div class="stat-card completed">
            <h4>Completadas</h4>
            <span class="stat-value">{{ store.statistics().completed }}</span>
          </div>
          <div class="stat-card critical">
            <h4>Críticas</h4>
            <span class="stat-value">{{ store.statistics().critical }}</span>
          </div>
          <div class="stat-card urgent">
            <h4>Urgentes</h4>
            <span class="stat-value">{{ store.statistics().urgent }}</span>
          </div>
        </div>
      </div>

      <!-- Unit of Work Status -->
      <div class="uow-status" [class.has-changes]="unitOfWork.hasChanges()">
        <h3>🔄 Unit of Work Status</h3>
        <p>Cambios pendientes: {{ unitOfWork.changesCount() }}</p>
        @if (unitOfWork.hasChanges()) {
          <div class="uow-actions">
            <button (click)="commitChanges()" class="btn btn-success">
              ✅ Commit Changes
            </button>
            <button (click)="rollbackChanges()" class="btn btn-danger">
              ❌ Rollback
            </button>
          </div>
          
          <div class="pending-changes">
            <h4>Cambios Pendientes:</h4>
            <div class="changes-detail">
              @if (pendingChanges().added.length > 0) {
                <div class="change-group">
                  <strong>➕ Nuevas ({{ pendingChanges().added.length }}):</strong>
                  <ul>
                    @for (task of pendingChanges().added; track task.id) {
                      <li>{{ task.title }}</li>
                    }
                  </ul>
                </div>
              }
              @if (pendingChanges().modified.length > 0) {
                <div class="change-group">
                  <strong>✏️ Modificadas ({{ pendingChanges().modified.length }}):</strong>
                  <ul>
                    @for (task of pendingChanges().modified; track task.id) {
                      <li>{{ task.title }}</li>
                    }
                  </ul>
                </div>
              }
              @if (pendingChanges().deleted.length > 0) {
                <div class="change-group">
                  <strong>🗑️ Eliminadas ({{ pendingChanges().deleted.length }}):</strong>
                  <ul>
                    @for (id of pendingChanges().deleted; track id) {
                      <li>ID: {{ id }}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <h3>🔍 Filtros</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Buscar:</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (ngModelChange)="updateFilters()"
              placeholder="Buscar por título o descripción..."
              class="form-control">
          </div>
          
          <div class="filter-group">
            <label>Estado:</label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="updateFilters()" class="form-control">
              <option [ngValue]="null">Todos</option>
              @for (status of taskStatuses; track status) {
                <option [ngValue]="status">{{ getStatusLabel(status) }}</option>
              }
            </select>
          </div>
          
          <div class="filter-group">
            <label>Prioridad:</label>
            <select [(ngModel)]="selectedPriority" (ngModelChange)="updateFilters()" class="form-control">
              <option [ngValue]="null">Todas</option>
              @for (priority of taskPriorities; track priority) {
                <option [ngValue]="priority">{{ getPriorityLabel(priority) }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Task Creation Form -->
      <div class="task-form-section">
        <h3>➕ Crear Nueva Tarea</h3>
        <form (ngSubmit)="createTask()" #taskForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Título:</label>
              <input 
                type="text" 
                [(ngModel)]="newTask.title" 
                name="title"
                required
                class="form-control">
            </div>
            
            <div class="form-group">
              <label>Descripción:</label>
              <textarea 
                [(ngModel)]="newTask.description" 
                name="description"
                required
                rows="3"
                class="form-control"></textarea>
            </div>
            
            <div class="form-group">
              <label>Prioridad:</label>
              <select 
                [(ngModel)]="newTask.priority" 
                name="priority"
                required
                class="form-control">
                @for (priority of taskPriorities; track priority) {
                  <option [ngValue]="priority">{{ getPriorityLabel(priority) }}</option>
                }
              </select>
            </div>
            
            <div class="form-group">
              <label>Proyecto:</label>
              <select 
                [(ngModel)]="newTask.projectId" 
                name="projectId"
                required
                class="form-control">
                <option value="PRY-001">Proyecto Alpha</option>
                <option value="PRY-002">Proyecto Beta</option>
                <option value="PRY-003">Proyecto Gamma</option>
                <option value="PRY-004">Proyecto Delta</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Fecha de Vencimiento:</label>
              <input 
                type="date" 
                [(ngModel)]="newTask.dueDate" 
                name="dueDate"
                [min]="minDate"
                required
                class="form-control">
            </div>
            
            <div class="form-group">
              <label>Horas Estimadas:</label>
              <input 
                type="number" 
                [(ngModel)]="newTask.estimatedHours" 
                name="estimatedHours"
                min="1"
                class="form-control">
            </div>
          </div>
          
          <button type="submit" [disabled]="!taskForm.valid" class="btn btn-primary">
            ➕ Crear Tarea
          </button>
        </form>
      </div>

      <!-- Tasks List -->
      <div class="tasks-section">
        <h3>📋 Lista de Tareas ({{ store.filteredTasks().length }})</h3>
        
        <div class="tasks-grid">
          @for (task of store.filteredTasks(); track task.id) {
            <div class="task-card" 
                 [class.selected]="store.selectedTask()?.id === task.id"
                 [class.pending]="task.status === 'pending'"
                 [class.in-progress]="task.status === 'in_progress'"
                 [class.completed]="task.status === 'completed'"
                 (click)="selectTask(task)">
              
              <div class="task-header">
                <h4>{{ task.title }}</h4>
                <span class="task-priority" [class]="task.priority">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
              
              <p class="task-description">{{ task.description }}</p>
              
              <div class="task-meta">
                <span class="task-status">{{ getStatusLabel(task.status) }}</span>
                <span class="task-project">{{ task.projectId }}</span>
                <span class="task-due">📅 {{ task.dueDate | date:'shortDate' }}</span>
              </div>
              
              <div class="task-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="task.completionPercentage"></div>
                </div>
                <span>{{ task.completionPercentage }}%</span>
              </div>
              
              <div class="task-actions">
                <button (click)="changeTaskStatus(task, $event)" class="btn btn-sm">
                  🔄 Cambiar Estado
                </button>
                <button (click)="updateProgress(task, $event)" class="btn btn-sm">
                  📊 Actualizar %
                </button>
                <button (click)="deleteTaskWithUoW(task.id, $event)" class="btn btn-sm btn-danger">
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          } @empty {
            <div class="no-tasks">
              <p>No se encontraron tareas con los filtros aplicados.</p>
            </div>
          }
        </div>
      </div>

      <!-- Selected Task Detail -->
      @if (store.selectedTask(); as selectedTask) {
        <div class="task-detail">
          <h3>📄 Detalle de Tarea</h3>
          <div class="detail-content">
            <h4>{{ selectedTask.title }}</h4>
            <p><strong>ID:</strong> {{ selectedTask.id }}</p>
            <p><strong>Descripción:</strong> {{ selectedTask.description }}</p>
            <p><strong>Estado:</strong> {{ getStatusLabel(selectedTask.status) }}</p>
            <p><strong>Prioridad:</strong> {{ getPriorityLabel(selectedTask.priority) }}</p>
            <p><strong>Proyecto:</strong> {{ selectedTask.projectId }}</p>
            <p><strong>Asignado a:</strong> {{ selectedTask.assigneeId }}</p>
            <p><strong>Fecha de Vencimiento:</strong> {{ selectedTask.dueDate | date:'fullDate' }}</p>
            <p><strong>Horas Estimadas:</strong> {{ selectedTask.estimatedHours }}h</p>
            <p><strong>Horas Reales:</strong> {{ selectedTask.actualHours }}h</p>
            <p><strong>Progreso:</strong> {{ selectedTask.completionPercentage }}%</p>
            <p><strong>Creada:</strong> {{ selectedTask.createdAt | date:'short' }}</p>
            <p><strong>Actualizada:</strong> {{ selectedTask.updatedAt | date:'short' }}</p>
            
            @if (selectedTask.tags.length > 0) {
              <div class="tags">
                <strong>Tags:</strong>
                @for (tag of selectedTask.tags; track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
            }
            
            @if (selectedTask.comments.length > 0) {
              <div class="comments">
                <strong>Comentarios:</strong>
                @for (comment of selectedTask.comments; track comment.id) {
                  <div class="comment">
                    <p>{{ comment.text }}</p>
                    <small>{{ comment.createdAt | date:'short' }} - {{ comment.authorId }}</small>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .task-manager-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .user-info {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
      }
      
      p {
        margin: 0;
        color: #7f8c8d;
      }
    }

    .statistics-dashboard {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h2 {
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        
        .stat-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          
          h4 {
            margin: 0 0 0.5rem 0;
            color: #495057;
            font-size: 0.9rem;
          }
          
          .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #2c3e50;
          }
          
          &.pending {
            border-color: #ffc107;
            background: #fff3cd;
          }
          
          &.in-progress {
            border-color: #17a2b8;
            background: #d1ecf1;
          }
          
          &.completed {
            border-color: #28a745;
            background: #d4edda;
          }
          
          &.critical {
            border-color: #dc3545;
            background: #f8d7da;
          }
          
          &.urgent {
            border-color: #fd7e14;
            background: #ffe5d0;
          }
        }
      }
    }

    .uow-status {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 2px solid #e9ecef;
      transition: border-color 0.3s ease;
      
      &.has-changes {
        border-color: #ffc107;
        background: #fffbf0;
      }
      
      h3 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
      }
      
      p {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        color: #495057;
      }
      
      .uow-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .pending-changes {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        
        h4 {
          margin: 0 0 0.5rem 0;
          color: #495057;
        }
        
        .changes-detail {
          display: grid;
          gap: 1rem;
          
          .change-group {
            strong {
              display: block;
              margin-bottom: 0.25rem;
              color: #2c3e50;
            }
            
            ul {
              margin: 0;
              padding-left: 1.5rem;
              color: #6c757d;
            }
          }
        }
      }
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
      }
      
      .filters-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        gap: 1rem;
        
        .filter-group {
          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #495057;
            font-weight: 600;
          }
        }
      }
    }

    .task-form-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
      }
      
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
        
        .form-group {
          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #495057;
            font-weight: 600;
          }
        }
      }
    }

    .tasks-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
      }
      
      .tasks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        
        .task-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          &.selected {
            border-color: #667eea;
            background: #f0f0ff;
          }
          
          &.pending {
            border-left: 4px solid #ffc107;
          }
          
          &.in-progress {
            border-left: 4px solid #17a2b8;
          }
          
          &.completed {
            border-left: 4px solid #28a745;
          }
          
          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1rem;
            
            h4 {
              margin: 0;
              color: #2c3e50;
              flex: 1;
            }
            
            .task-priority {
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 600;
              
              &.low {
                background: #d4edda;
                color: #155724;
              }
              
              &.medium {
                background: #fff3cd;
                color: #856404;
              }
              
              &.high {
                background: #ffe5d0;
                color: #d84315;
              }
              
              &.urgent {
                background: #f8d7da;
                color: #721c24;
              }
              
              &.critical {
                background: #721c24;
                color: white;
              }
            }
          }
          
          .task-description {
            color: #6c757d;
            margin: 0 0 1rem 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .task-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            font-size: 0.85rem;
            color: #6c757d;
            
            .task-status {
              font-weight: 600;
            }
          }
          
          .task-progress {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            
            .progress-bar {
              flex: 1;
              height: 8px;
              background: #e9ecef;
              border-radius: 4px;
              overflow: hidden;
              
              .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s ease;
              }
            }
            
            span {
              font-size: 0.85rem;
              font-weight: 600;
              color: #495057;
            }
          }
          
          .task-actions {
            display: flex;
            gap: 0.5rem;
            
            button {
              flex: 1;
              font-size: 0.8rem;
            }
          }
        }
        
        .no-tasks {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }
      }
    }

    .task-detail {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
      }
      
      .detail-content {
        h4 {
          margin: 0 0 1rem 0;
          color: #495057;
        }
        
        p {
          margin: 0 0 0.75rem 0;
          color: #6c757d;
          
          strong {
            color: #495057;
          }
        }
        
        .tags {
          margin: 1rem 0;
          
          .tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #e9ecef;
            border-radius: 20px;
            margin-right: 0.5rem;
            font-size: 0.85rem;
            color: #495057;
          }
        }
        
        .comments {
          margin-top: 1.5rem;
          
          .comment {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 0.5rem;
            
            p {
              margin: 0 0 0.5rem 0;
              color: #2c3e50;
            }
            
            small {
              color: #6c757d;
            }
          }
        }
      }
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
      
      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      }
      
      &.btn-success {
        background: #28a745;
        color: white;
        
        &:hover:not(:disabled) {
          background: #218838;
        }
      }
      
      &.btn-danger {
        background: #dc3545;
        color: white;
        
        &:hover:not(:disabled) {
          background: #c82333;
        }
      }
      
      &.btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr !important;
      }
      
      .tasks-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `]
})
export class TaskManagerComponent implements OnInit {
  readonly store = inject(AppStore);
  readonly unitOfWork = inject(UnitOfWork);
  private readonly taskRepository = inject(TaskRepository);
  private readonly logger = inject(LOGGER_TOKEN);
  
  // Form data
  newTask: CreateTaskDto = {
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    assigneeId: 'user-1',
    projectId: 'PRY-001',
    dueDate: new Date(),
    estimatedHours: 8
  };
  
  // Filters
  searchTerm = '';
  selectedStatus: TaskStatus | null = null;
  selectedPriority: TaskPriority | null = null;
  
  // UI State
  pendingChanges = signal(this.unitOfWork.getPendingChanges());
  
  // Enums for template
  taskStatuses = Object.values(TaskStatus);
  taskPriorities = Object.values(TaskPriority);
  
  minDate = new Date().toISOString().split('T')[0];
  
  ngOnInit(): void {
    this.logger.info('TaskManagerComponent initialized');
    
    // Subscribe to tasks and register them with UoW
    this.store.tasks().forEach(task => {
      this.unitOfWork.registerTask(task);
    });
  }
  
  createTask(): void {
    const newTask: Task = {
      ...this.newTask,
      id: `task-${Date.now()}`,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      actualHours: 0,
      completionPercentage: 0,
      attachments: [],
      comments: [],
      estimatedHours: this.newTask.estimatedHours || 8
    };
    
    // Add to UoW
    const trackedTask = this.unitOfWork.markAsNew(newTask);
    
    // Add to store immediately (optimistic update)
    this.store.addTask(trackedTask);
    
    // Update pending changes
    this.updatePendingChanges();
    
    // Reset form
    this.newTask = {
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 8
    };
    
    this.logger.info('Task created and marked for addition:', trackedTask.id);
  }
  
  selectTask(task: Task): void {
    this.store.selectTask(task.id);
  }
  
  changeTaskStatus(task: Task, event: Event): void {
    event.stopPropagation();
    
    // Cycle through statuses
    const statuses = Object.values(TaskStatus);
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    // Update task
    const updatedTask = { ...task, status: nextStatus, updatedAt: new Date() };
    
    // Mark as modified in UoW
    this.unitOfWork.markAsModified(updatedTask);
    
    // Update store (optimistic)
    this.store.updateTask(task.id, updatedTask);
    
    // Update pending changes
    this.updatePendingChanges();
    
    this.logger.info('Task status changed:', task.id, nextStatus);
  }
  
  updateProgress(task: Task, event: Event): void {
    event.stopPropagation();
    
    const newProgress = Math.min(100, task.completionPercentage + 10);
    const updatedTask = { 
      ...task, 
      completionPercentage: newProgress,
      status: newProgress === 100 ? TaskStatus.COMPLETED : task.status,
      updatedAt: new Date()
    };
    
    // Mark as modified in UoW
    this.unitOfWork.markAsModified(updatedTask);
    
    // Update store (optimistic)
    this.store.updateTask(task.id, updatedTask);
    
    // Update pending changes
    this.updatePendingChanges();
    
    this.logger.info('Task progress updated:', task.id, newProgress);
  }
  
  deleteTaskWithUoW(taskId: string, event: Event): void {
    event.stopPropagation();
    
    if (confirm('¿Está seguro de eliminar esta tarea?')) {
      // Mark as deleted in UoW
      this.unitOfWork.markAsDeleted(taskId);
      
      // Remove from store (optimistic)
      this.store.deleteTask(taskId);
      
      // Update pending changes
      this.updatePendingChanges();
      
      this.logger.info('Task marked for deletion:', taskId);
    }
  }
  
  commitChanges(): void {
    this.logger.info('Committing changes...');
    
    this.unitOfWork.commit().subscribe({
      next: (results) => {
        this.logger.info('Changes committed successfully:', results);
        alert('✅ Todos los cambios se guardaron exitosamente');
        
        // Reload tasks to ensure sync
        this.store.loadTasks();
        
        // Update pending changes
        this.updatePendingChanges();
      },
      error: (error) => {
        this.logger.error('Commit failed:', error);
        alert('❌ Error al guardar los cambios: ' + error.message);
      }
    });
  }
  
  rollbackChanges(): void {
    if (confirm('¿Está seguro de descartar todos los cambios?')) {
      this.unitOfWork.rollback();
      
      // Reload tasks to restore original state
      this.store.loadTasks();
      
      // Update pending changes
      this.updatePendingChanges();
      
      this.logger.info('Changes rolled back');
      alert('↩️ Cambios descartados');
    }
  }
  
  updateFilters(): void {
    this.store.updateFilters({
      status: this.selectedStatus,
      priority: this.selectedPriority,
      searchTerm: this.searchTerm
    });
  }
  
  updatePendingChanges(): void {
    this.pendingChanges.set(this.unitOfWork.getPendingChanges());
  }
  
  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]: '⏳ Pendiente',
      [TaskStatus.IN_PROGRESS]: '🔄 En Progreso',
      [TaskStatus.IN_REVIEW]: '👀 En Revisión',
      [TaskStatus.COMPLETED]: '✅ Completada',
      [TaskStatus.CANCELLED]: '❌ Cancelada'
    };
    return labels[status] || status;
  }
  
  getPriorityLabel(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: '🟢 Baja',
      [TaskPriority.MEDIUM]: '🟡 Media',
      [TaskPriority.HIGH]: '🟠 Alta',
      [TaskPriority.URGENT]: '🔴 Urgente',
      [TaskPriority.CRITICAL]: '🚨 Crítica'
    };
    return labels[priority] || priority;
  }
}
