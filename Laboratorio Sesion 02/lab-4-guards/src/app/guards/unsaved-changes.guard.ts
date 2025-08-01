import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * 💾 Interface para componentes que pueden tener cambios sin guardar
 */
export interface CanComponentDeactivate {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
  hasUnsavedChanges(): boolean;
  getUnsavedChangesMessage?(): string;
}

/**
 * ⚠️ Guard para Cambios Sin Guardar
 * 
 * Previene la navegación accidental cuando hay cambios sin guardar.
 * Muestra confirmación al usuario antes de abandonar la página.
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {

  constructor() {
    console.log('⚠️ [UnsavedChangesGuard] Guard de cambios sin guardar inicializado');
  }

  /**
   * 🔍 Verificar si puede desactivar/salir del componente
   */
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('⚠️ [UnsavedChangesGuard] Verificando cambios sin guardar');

    // Si el componente no implementa la interface, permitir navegación
    if (!component || typeof component.canDeactivate !== 'function') {
      console.log('✅ [UnsavedChangesGuard] Componente no implementa interface, permitiendo navegación');
      return true;
    }

    // Verificar si hay cambios sin guardar
    if (!component.hasUnsavedChanges()) {
      console.log('✅ [UnsavedChangesGuard] No hay cambios sin guardar, permitiendo navegación');
      return true;
    }

    console.log('⚠️ [UnsavedChangesGuard] Detectados cambios sin guardar');

    // Obtener mensaje personalizado o usar uno por defecto
    const message = component.getUnsavedChangesMessage ? 
      component.getUnsavedChangesMessage() : 
      this.getDefaultUnsavedChangesMessage();

    // Mostrar diálogo de confirmación
    return this.showConfirmationDialog(message);
  }

  /**
   * 💬 Mostrar diálogo de confirmación
   */
  private showConfirmationDialog(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      // En una aplicación real, podrías usar un modal personalizado
      // Para este demo, usamos confirm() nativo del navegador
      
      console.log('💬 [UnsavedChangesGuard] Mostrando diálogo de confirmación');
      
      // Simular un pequeño delay para demostrar que es async
      setTimeout(() => {
        const result = confirm(message);
        
        if (result) {
          console.log('✅ [UnsavedChangesGuard] Usuario confirmó salir sin guardar');
        } else {
          console.log('❌ [UnsavedChangesGuard] Usuario canceló la navegación');
        }
        
        resolve(result);
      }, 100);
    });
  }

  /**
   * 📝 Mensaje por defecto para cambios sin guardar
   */
  private getDefaultUnsavedChangesMessage(): string {
    return `⚠️ ATENCIÓN - Cambios Sin Guardar
    
Tienes cambios sin guardar que se perderán si abandonas esta página.

¿Estás seguro de que quieres continuar sin guardar?

• Los cambios realizados se perderán permanentemente
• Esta acción no se puede deshacer

¿Deseas salir sin guardar?`;
  }

  /**
   * 🎨 Crear mensaje personalizado para diferentes tipos de cambios
   */
  static createCustomMessage(entityType: string, changeCount: number): string {
    return `⚠️ CAMBIOS SIN GUARDAR EN ${entityType.toUpperCase()}

Tienes ${changeCount} cambio${changeCount !== 1 ? 's' : ''} sin guardar.

Si abandonas esta página ahora:
• Se perderán todos los cambios realizados
• Tendrás que volver a introducir la información
• Esta acción no se puede deshacer

¿Estás seguro de que quieres continuar sin guardar?`;
  }

  /**
   * 📋 Crear mensaje para formularios específicos
   */
  static createFormMessage(formType: string, hasRequiredFields: boolean = false): string {
    const requiredFieldsWarning = hasRequiredFields ? 
      '\n• Algunos campos obligatorios no están completos' : '';
    
    return `⚠️ FORMULARIO ${formType.toUpperCase()} SIN GUARDAR

El formulario contiene información no guardada.${requiredFieldsWarning}

¿Quieres salir sin guardar los cambios?

Opciones recomendadas:
• Guardar: Haz clic en "Cancelar" y luego en "Guardar"
• Borrador: Algunos formularios permiten guardar como borrador
• Salir: Solo si estás seguro de descartar los cambios

¿Deseas salir sin guardar?`;
  }
}

/**
 * 🔧 Clase base abstracta para componentes con cambios sin guardar
 * 
 * Los componentes pueden extender esta clase para implementar
 * fácilmente la funcionalidad de cambios sin guardar.
 */
export abstract class UnsavedChangesComponent implements CanComponentDeactivate {
  
  protected _hasUnsavedChanges: boolean = false;
  protected _originalData: any = null;
  protected _currentData: any = null;

  /**
   * 🔍 Verificar si puede desactivar el componente
   */
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return !this.hasUnsavedChanges();
  }

  /**
   * 📊 Verificar si hay cambios sin guardar
   */
  hasUnsavedChanges(): boolean {
    return this._hasUnsavedChanges;
  }

  /**
   * 💬 Mensaje personalizado (implementar en componente hijo)
   */
  abstract getUnsavedChangesMessage(): string;

  /**
   * 💾 Marcar como guardado
   */
  protected markAsSaved(): void {
    this._hasUnsavedChanges = false;
    this._originalData = { ...this._currentData };
    console.log('💾 [UnsavedChangesComponent] Cambios marcados como guardados');
  }

  /**
   * ✏️ Marcar como modificado
   */
  protected markAsModified(): void {
    this._hasUnsavedChanges = true;
    console.log('✏️ [UnsavedChangesComponent] Detectados cambios sin guardar');
  }

  /**
   * 🔄 Restaurar datos originales
   */
  protected restoreOriginalData(): void {
    this._currentData = { ...this._originalData };
    this._hasUnsavedChanges = false;
    console.log('🔄 [UnsavedChangesComponent] Datos restaurados al estado original');
  }

  /**
   * 📊 Comparar datos para detectar cambios
   */
  protected detectChanges(newData: any): void {
    const hasChanges = JSON.stringify(this._originalData) !== JSON.stringify(newData);
    
    if (hasChanges !== this._hasUnsavedChanges) {
      this._hasUnsavedChanges = hasChanges;
      this._currentData = { ...newData };
      
      if (hasChanges) {
        console.log('✏️ [UnsavedChangesComponent] Cambios detectados automáticamente');
      } else {
        console.log('💾 [UnsavedChangesComponent] Datos vuelven al estado original');
      }
    }
  }

  /**
   * 🎯 Inicializar datos originales
   */
  protected initializeOriginalData(data: any): void {
    this._originalData = { ...data };
    this._currentData = { ...data };
    this._hasUnsavedChanges = false;
    console.log('🎯 [UnsavedChangesComponent] Datos originales inicializados');
  }
}