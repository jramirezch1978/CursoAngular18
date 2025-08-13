import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskStateService } from '../../../core/services/task-state.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TaskPriority, CreateTaskDto } from '../../../core/interfaces/task.interface';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  // Demostración de inject() para múltiples servicios
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskStateService);
  private readonly notificationService = inject(NotificationService);

  // Signals para el estado del formulario
  isSubmitting = signal(false);
  showAdvanced = signal(false);

  // Configuración del formulario
  taskForm: FormGroup;
  
  // Opciones para selects
  priorities = Object.values(TaskPriority);
  projects = ['PRY-001', 'PRY-002', 'PRY-003', 'PRY-004'];
  assignees = [
    { id: 'user-1', name: 'Ana García - Frontend Developer' },
    { id: 'user-2', name: 'Carlos López - Backend Developer' },
    { id: 'user-3', name: 'María Rodríguez - Full Stack Developer' },
    { id: 'user-4', name: 'Pedro Martínez - DevOps Engineer' },
    { id: 'user-5', name: 'Sofia Chen - UI/UX Designer' }
  ];

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      priority: [TaskPriority.MEDIUM, [Validators.required]],
      assigneeId: ['', [Validators.required]],
      projectId: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      estimatedHours: [8, [Validators.required, Validators.min(1), Validators.max(200)]],
      tags: ['']
    });

    // Configurar fecha mínima como hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.taskForm.patchValue({
      dueDate: tomorrow.toISOString().split('T')[0]
    });
  }

  ngOnInit() {
    console.log('📝 TaskForm inicializado con inject() y signals');
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isSubmitting.set(true);
      
      const formValue = this.taskForm.value;
      const createTaskDto: CreateTaskDto = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        assigneeId: formValue.assigneeId,
        projectId: formValue.projectId,
        dueDate: new Date(formValue.dueDate),
        estimatedHours: formValue.estimatedHours,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      // Simular envío (en una app real sería una llamada HTTP)
      setTimeout(() => {
        try {
          const newTask = this.taskService.addTask(createTaskDto);
          this.notificationService.success(
            '✅ Tarea creada exitosamente',
            `La tarea "${newTask.title}" fue agregada al sistema`
          );
          
          this.resetForm();
          this.isSubmitting.set(false);
        } catch (error) {
          this.notificationService.error(
            '❌ Error al crear tarea',
            'Hubo un problema al procesar la solicitud'
          );
          this.isSubmitting.set(false);
        }
      }, 1500); // Simular latencia de red

    } else {
      this.markFormGroupTouched();
      this.notificationService.warning(
        '⚠️ Formulario inválido',
        'Por favor corrige los errores antes de continuar'
      );
    }
  }

  resetForm() {
    this.taskForm.reset();
    this.showAdvanced.set(false);
    
    // Reestablecer valores por defecto
    this.taskForm.patchValue({
      priority: TaskPriority.MEDIUM,
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    this.notificationService.info('🔄 Formulario reiniciado', 'Listo para crear una nueva tarea');
  }

  toggleAdvanced() {
    this.showAdvanced.update(value => !value);
  }

  // Métodos de utilidad para validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} debe ser menor a ${field.errors['max'].max}`;
    }
    return '';
  }

  private markFormGroupTouched() {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos para demostración educativa
  logFormValue() {
    console.log('📊 Valor actual del formulario:', this.taskForm.value);
    console.log('📊 Estado de validación:', this.taskForm.valid);
    console.log('📊 Errores de validación:', this.taskForm.errors);
    this.notificationService.info('📊 Datos registrados', 'Revisa la consola para ver los valores del formulario');
  }

  fillSampleData() {
    const sampleData = {
      title: 'Implementar autenticación OAuth 2.0',
      description: 'Desarrollar e integrar sistema de autenticación OAuth 2.0 para mejorar la seguridad del acceso de usuarios',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-2',
      projectId: 'PRY-001',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 16,
      tags: 'backend, seguridad, oauth, autenticación'
    };

    this.taskForm.patchValue(sampleData);
    this.notificationService.info('📝 Datos de ejemplo cargados', 'Formulario rellenado con datos de prueba');
  }

  getPriorityColor(priority: TaskPriority): string {
    const colors = {
      [TaskPriority.LOW]: '#28a745',
      [TaskPriority.MEDIUM]: '#ffc107',
      [TaskPriority.HIGH]: '#fd7e14',
      [TaskPriority.URGENT]: '#dc3545',
      [TaskPriority.CRITICAL]: '#721c24'
    };
    return colors[priority];
  }

  getPriorityIcon(priority: TaskPriority): string {
    const icons = {
      [TaskPriority.LOW]: '🟢',
      [TaskPriority.MEDIUM]: '🟡',
      [TaskPriority.HIGH]: '🟠',
      [TaskPriority.URGENT]: '🔴',
      [TaskPriority.CRITICAL]: '🚨'
    };
    return icons[priority];
  }
}
