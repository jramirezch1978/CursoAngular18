import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskApiService } from './task-api.service';
import { TaskPriority, TaskStatus, CreateTaskDto } from '../interfaces/task.interface';
import { AppConfig } from '../config/app.config';

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpMock: HttpTestingController;
  const apiUrl = `${AppConfig.api.baseUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskApiService]
    });
    service = TestBed.inject(TaskApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all tasks in development mode', (done) => {
    // En modo desarrollo, debe retornar mock data
    service.getTasks().subscribe(tasks => {
      expect(tasks).toBeTruthy();
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0]).toHaveProperty('id');
      expect(tasks[0]).toHaveProperty('title');
      expect(tasks[0]).toHaveProperty('status');
      done();
    });
  });

  it('should get a specific task by id in development mode', (done) => {
    const testId = 'api-task-1';
    
    service.getTask(testId).subscribe(task => {
      expect(task).toBeTruthy();
      expect(task.id).toBe(testId);
      expect(task.title).toBeTruthy();
      done();
    });
  });

  it('should create a new task in development mode', (done) => {
    const createDto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      priority: TaskPriority.HIGH,
      assigneeId: 'test-user',
      projectId: 'test-project',
      dueDate: new Date(),
      estimatedHours: 8
    };

    service.createTask(createDto).subscribe(task => {
      expect(task).toBeTruthy();
      expect(task.title).toBe(createDto.title);
      expect(task.description).toBe(createDto.description);
      expect(task.priority).toBe(createDto.priority);
      expect(task.id).toBeTruthy();
      done();
    });
  });

  it('should update a task in development mode', (done) => {
    const taskId = 'test-task-1';
    const updateDto = {
      title: 'Updated Task Title',
      status: TaskStatus.IN_PROGRESS
    };

    service.updateTask(taskId, updateDto).subscribe(task => {
      expect(task).toBeTruthy();
      expect(task.id).toBe(taskId);
      expect(task.title).toBe(updateDto.title);
      expect(task.status).toBe(updateDto.status);
      done();
    });
  });

  it('should delete a task in development mode', (done) => {
    const taskId = 'test-task-1';

    service.deleteTask(taskId).subscribe(result => {
      expect(result).toBeUndefined(); // void return
      done();
    });
  });

  it('should search tasks in development mode', (done) => {
    const query = 'test';

    service.searchTasks(query).subscribe(tasks => {
      expect(tasks).toBeTruthy();
      expect(Array.isArray(tasks)).toBe(true);
      // En modo desarrollo, debe filtrar las tareas mock
      done();
    });
  });

  it('should get task statistics in development mode', (done) => {
    service.getTaskStatistics().subscribe(stats => {
      expect(stats).toBeTruthy();
      expect(stats.total).toBeDefined();
      expect(stats.completed).toBeDefined();
      expect(stats.inProgress).toBeDefined();
      expect(stats.pending).toBeDefined();
      done();
    });
  });

  it('should upload attachment in development mode', (done) => {
    const taskId = 'test-task-1';
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    service.uploadAttachment(taskId, file).subscribe(attachment => {
      expect(attachment).toBeTruthy();
      expect(attachment.filename).toBe(file.name);
      expect(attachment.size).toBe(file.size);
      expect(attachment.id).toBeTruthy();
      done();
    });
  });

  it('should handle errors properly', (done) => {
    // Simular error cambiando temporalmente el entorno
    const originalEnv = AppConfig.app.environment;
    (AppConfig.app as any).environment = 'production';

    service.getTasks().subscribe({
      next: () => {
        // No debería llegar aquí en este test
      },
      error: (error) => {
        expect(error).toBeTruthy();
        // Restaurar entorno original
        (AppConfig.app as any).environment = originalEnv;
        done();
      }
    });

    // Simular respuesta de error del servidor
    const req = httpMock.expectOne(apiUrl);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should retry requests on failure when in production mode', () => {
    const originalEnv = AppConfig.app.environment;
    (AppConfig.app as any).environment = 'production';

    service.getTasks().subscribe({
      next: () => {},
      error: () => {}
    });

    // Verificar que se hicieron los reintentos
    const requests = httpMock.match(apiUrl);
    expect(requests.length).toBeGreaterThan(1);

    // Limpiar requests pendientes
    requests.forEach(req => req.flush('Error', { status: 500, statusText: 'Error' }));

    // Restaurar entorno
    (AppConfig.app as any).environment = originalEnv;
  });

  it('should set proper headers for requests', () => {
    const originalEnv = AppConfig.app.environment;
    (AppConfig.app as any).environment = 'production';

    service.getTasks().subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush([]);
    (AppConfig.app as any).environment = originalEnv;
  });
});
