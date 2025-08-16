import { Injectable } from '@angular/core';
import { TaskValidator } from '../../tokens/config.tokens';

@Injectable()
export class RequiredFieldsValidator implements TaskValidator {
  name = 'RequiredFieldsValidator';
  
  validate(task: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    if (!task.title || task.title.trim().length === 0) {
      errors.push('El título es requerido');
    }
    
    if (!task.description || task.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }
    
    if (!task.assigneeId) {
      errors.push('Debe asignar la tarea a un usuario');
    }
    
    if (!task.dueDate) {
      errors.push('La fecha de vencimiento es requerida');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

@Injectable()
export class DateRangeValidator implements TaskValidator {
  name = 'DateRangeValidator';
  
  validate(task: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    if (!task.dueDate) {
      return { valid: true }; // Si no hay fecha, no validamos rango
    }
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (dueDate < now) {
      errors.push('La fecha de vencimiento no puede ser en el pasado');
    }
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    
    if (dueDate > maxDate) {
      errors.push('La fecha de vencimiento no puede ser mayor a 2 años');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}

@Injectable()
export class PriorityValidator implements TaskValidator {
  name = 'PriorityValidator';
  
  validate(task: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];
    const validPriorities = ['low', 'medium', 'high', 'urgent', 'critical'];
    
    if (!task.priority) {
      errors.push('La prioridad es requerida');
    } else if (!validPriorities.includes(task.priority)) {
      errors.push(`La prioridad debe ser una de: ${validPriorities.join(', ')}`);
    }
    
    // Validación de lógica de negocio
    if (task.priority === 'critical' && !task.justification) {
      errors.push('Las tareas críticas requieren justificación');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}
