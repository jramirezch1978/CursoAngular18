import { TestBed } from '@angular/core/testing';
import { TaskStateService } from './task-state.service';
import { TaskStatus, TaskPriority, CreateTaskDto } from '../interfaces/task.interface';

describe('TaskStateService', () => {
  let service: TaskStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskStateService);
    
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial empty state', () => {
    expect(service.tasks().length).toBe(0);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should add a new task', () => {
    const taskDto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 8
    };

    const task = service.addTask(taskDto);

    expect(task).toBeTruthy();
    expect(task.title).toBe(taskDto.title);
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(service.tasks().length).toBe(1);
  });

  it('should update task status', () => {
    const taskDto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 4
    };

    const task = service.addTask(taskDto);
    service.changeTaskStatus(task.id, TaskStatus.IN_PROGRESS);

    const updatedTask = service.tasks().find(t => t.id === task.id);
    expect(updatedTask?.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should filter tasks by status', () => {
    // Agregar tareas con diferentes estados
    const task1 = service.addTask({
      title: 'Task 1',
      description: 'Description 1',
      priority: TaskPriority.LOW,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 2
    });

    const task2 = service.addTask({
      title: 'Task 2',
      description: 'Description 2',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-2',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 6
    });

    service.changeTaskStatus(task2.id, TaskStatus.COMPLETED);

    // Aplicar filtro por estado
    service.updateFilter({ status: [TaskStatus.PENDING] });

    const filteredTasks = service.filteredTasks();
    expect(filteredTasks.length).toBe(1);
    expect(filteredTasks[0].id).toBe(task1.id);
  });

  it('should calculate statistics correctly', () => {
    // Agregar varias tareas
    service.addTask({
      title: 'Task 1',
      description: 'Description 1',
      priority: TaskPriority.LOW,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 4
    });

    const task2 = service.addTask({
      title: 'Task 2',
      description: 'Description 2',
      priority: TaskPriority.URGENT,
      assigneeId: 'user-2',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 8
    });

    service.changeTaskStatus(task2.id, TaskStatus.COMPLETED);

    const stats = service.statistics();
    
    expect(stats.total).toBe(2);
    expect(stats.byStatus[TaskStatus.PENDING]).toBe(1);
    expect(stats.byStatus[TaskStatus.COMPLETED]).toBe(1);
    expect(stats.byPriority[TaskPriority.LOW]).toBe(1);
    expect(stats.byPriority[TaskPriority.URGENT]).toBe(1);
    expect(stats.totalEstimatedHours).toBe(12);
  });

  it('should identify urgent tasks', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Tarea urgente por prioridad
    service.addTask({
      title: 'Urgent Task',
      description: 'Urgent Description',
      priority: TaskPriority.URGENT,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: nextWeek,
      estimatedHours: 4
    });

    // Tarea urgente por fecha
    service.addTask({
      title: 'Due Tomorrow',
      description: 'Due soon',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-2',
      projectId: 'project-1',
      dueDate: tomorrow,
      estimatedHours: 2
    });

    // Tarea normal
    service.addTask({
      title: 'Normal Task',
      description: 'Normal Description',
      priority: TaskPriority.LOW,
      assigneeId: 'user-3',
      projectId: 'project-1',
      dueDate: nextWeek,
      estimatedHours: 6
    });

    const urgentTasks = service.urgentTasks();
    expect(urgentTasks.length).toBe(2);
  });

  it('should update task progress', () => {
    const task = service.addTask({
      title: 'Progress Task',
      description: 'Progress Description',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 10
    });

    service.updateProgress(task.id, 75);

    const updatedTask = service.tasks().find(t => t.id === task.id);
    expect(updatedTask?.completionPercentage).toBe(75);
  });

  it('should auto-complete task at 100% progress', () => {
    const task = service.addTask({
      title: 'Complete Task',
      description: 'Complete Description',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 5
    });

    service.updateProgress(task.id, 100);

    const updatedTask = service.tasks().find(t => t.id === task.id);
    expect(updatedTask?.completionPercentage).toBe(100);
    expect(updatedTask?.status).toBe(TaskStatus.COMPLETED);
  });

  it('should delete tasks correctly', () => {
    const task1 = service.addTask({
      title: 'Task to Keep',
      description: 'Keep this one',
      priority: TaskPriority.LOW,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 3
    });

    const task2 = service.addTask({
      title: 'Task to Delete',
      description: 'Delete this one',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-2',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 7
    });

    expect(service.tasks().length).toBe(2);

    service.deleteTask(task2.id);

    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].id).toBe(task1.id);
  });

  it('should filter tasks by search term', () => {
    service.addTask({
      title: 'Angular Development',
      description: 'Working with Angular components',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-1',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 8
    });

    service.addTask({
      title: 'React Migration',
      description: 'Moving from React to Angular',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-2',
      projectId: 'project-1',
      dueDate: new Date(),
      estimatedHours: 12
    });

    service.updateFilter({ searchTerm: 'Angular' });

    const filteredTasks = service.filteredTasks();
    expect(filteredTasks.length).toBe(2); // Ambas tareas contienen "Angular"
  });
});
