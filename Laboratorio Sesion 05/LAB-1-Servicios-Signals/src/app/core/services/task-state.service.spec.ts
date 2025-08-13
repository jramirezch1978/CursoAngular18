import { TestBed } from '@angular/core/testing';
import { TaskStateService } from './task-state.service';
import { TaskStatus, TaskPriority } from '../interfaces/task.interface';

describe('TaskStateService', () => {
  let service: TaskStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskStateService);
    
    // Clear localStorage before each test
    localStorage.removeItem('provias_tasks');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new task', () => {
    const initialCount = service.tasks().length;
    
    const newTask = service.addTask({
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 8
    });

    expect(newTask).toBeDefined();
    expect(newTask.id).toBeTruthy();
    expect(newTask.title).toBe('Test Task');
    expect(newTask.status).toBe(TaskStatus.PENDING);
    expect(service.tasks().length).toBe(initialCount + 1);
  });

  it('should update task status', () => {
    const task = service.addTask({
      title: 'Test Task',
      description: 'Test',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 8
    });

    service.changeTaskStatus(task.id, TaskStatus.IN_PROGRESS);
    
    const updatedTask = service.tasks().find(t => t.id === task.id);
    expect(updatedTask?.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should filter tasks by status', () => {
    // Add tasks with different statuses
    const pendingTask = service.addTask({
      title: 'Pending Task',
      description: 'Test',
      priority: TaskPriority.LOW,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 8
    });

    const inProgressTask = service.addTask({
      title: 'In Progress Task',
      description: 'Test',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-2',
      projectId: 'PRY-002',
      dueDate: new Date(),
      estimatedHours: 16
    });

    service.changeTaskStatus(inProgressTask.id, TaskStatus.IN_PROGRESS);

    // Apply filter
    service.updateFilter({ status: [TaskStatus.IN_PROGRESS] });

    const filtered = service.filteredTasks();
    expect(filtered.length).toBe(1);
    expect(filtered[0].status).toBe(TaskStatus.IN_PROGRESS);
    expect(filtered[0].id).toBe(inProgressTask.id);
  });

  it('should calculate statistics correctly', () => {
    // Add specific tasks
    const task1 = service.addTask({
      title: 'Task 1',
      description: 'Test',
      priority: TaskPriority.CRITICAL,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 10
    });

    const task2 = service.addTask({
      title: 'Task 2',
      description: 'Test',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-2',
      projectId: 'PRY-002',
      dueDate: new Date(),
      estimatedHours: 20
    });

    service.changeTaskStatus(task2.id, TaskStatus.COMPLETED);

    const stats = service.statistics();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.byStatus[TaskStatus.PENDING]).toBeGreaterThanOrEqual(1);
    expect(stats.byStatus[TaskStatus.COMPLETED]).toBeGreaterThanOrEqual(1);
    expect(stats.byPriority[TaskPriority.CRITICAL]).toBeGreaterThanOrEqual(1);
    expect(stats.totalEstimatedHours).toBeGreaterThanOrEqual(30);
  });

  it('should identify urgent tasks', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const urgentTask = service.addTask({
      title: 'Urgent Task',
      description: 'Due tomorrow',
      priority: TaskPriority.URGENT,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: tomorrow,
      estimatedHours: 4
    });

    const normalTask = service.addTask({
      title: 'Normal Task',
      description: 'Normal priority',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-2',
      projectId: 'PRY-002',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      estimatedHours: 8
    });

    const urgent = service.urgentTasks();
    expect(urgent.length).toBeGreaterThanOrEqual(1);
    expect(urgent.some(t => t.id === urgentTask.id)).toBeTruthy();
  });

  it('should delete a task', () => {
    const task = service.addTask({
      title: 'Task to Delete',
      description: 'Test',
      priority: TaskPriority.LOW,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 8
    });

    const countBefore = service.tasks().length;
    service.deleteTask(task.id);
    const countAfter = service.tasks().length;

    expect(countAfter).toBe(countBefore - 1);
    expect(service.tasks().find(t => t.id === task.id)).toBeUndefined();
  });

  it('should update task progress', () => {
    const task = service.addTask({
      title: 'Progress Task',
      description: 'Test progress',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 10
    });

    service.updateProgress(task.id, 75);

    const updatedTask = service.tasks().find(t => t.id === task.id);
    expect(updatedTask?.completionPercentage).toBe(75);

    // Test automatic completion
    service.updateProgress(task.id, 100);
    const completedTask = service.tasks().find(t => t.id === task.id);
    expect(completedTask?.completionPercentage).toBe(100);
    expect(completedTask?.status).toBe(TaskStatus.COMPLETED);
  });

  it('should filter tasks by search term', () => {
    service.addTask({
      title: 'Angular Implementation',
      description: 'Implement Angular features',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 16
    });

    service.addTask({
      title: 'Database Setup',
      description: 'Setup MySQL database',
      priority: TaskPriority.MEDIUM,
      assigneeId: 'user-2',
      projectId: 'PRY-002',
      dueDate: new Date(),
      estimatedHours: 8
    });

    service.updateFilter({ searchTerm: 'angular' });

    const filtered = service.filteredTasks();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title.toLowerCase()).toContain('angular');
  });

  it('should select a task', () => {
    const task = service.addTask({
      title: 'Selectable Task',
      description: 'Test selection',
      priority: TaskPriority.LOW,
      assigneeId: 'user-1',
      projectId: 'PRY-001',
      dueDate: new Date(),
      estimatedHours: 4
    });

    service.selectTask(task.id);
    expect(service.selectedTask()?.id).toBe(task.id);

    service.selectTask('non-existent');
    expect(service.selectedTask()).toBeNull();
  });
});
