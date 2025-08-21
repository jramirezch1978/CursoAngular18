/**
 * COMPONENTE FORMULARIO DE CONTACTO - TEMPLATE-DRIVEN FORMS LAB
 * =============================================================
 * 
 * Este componente demuestra todos los conceptos clave de Template-driven Forms:
 * - Binding bidireccional con [(ngModel)]
 * - Validaciones HTML5 y Angular
 * - Manejo de estados de formulario
 * - Integración con servicios
 * - UX inteligente basada en estados
 * 
 * CONCEPTOS EDUCATIVOS DEMOSTRADOS:
 * - Componente standalone (Angular 14+)
 * - Inyección moderna con inject()
 * - Manejo de observables con async/await
 * - Estados de formulario y validación
 * - Manejo de errores HTTP
 * - Loading states para mejor UX
 * 
 * PROVIAS DESCENTRALIZADO - Angular v18
 * Instructor: Ing. Jhonny Alexander Ramirez Chiroque
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ CRÍTICO: Requerido para Template-driven forms
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../models/contact.model';

/**
 * COMPONENTE STANDALONE
 * ====================
 * 
 * En Angular 14+, los componentes pueden ser standalone:
 * - No necesitan NgModule
 * - Importan directamente sus dependencias
 * - Más flexibles y fáciles de reutilizar
 * - Mejor tree-shaking
 * 
 * imports: [] - Array de módulos/componentes que necesita este componente
 */
@Component({
  selector: 'app-template-contact',
  standalone: true, // ✅ Componente standalone
  imports: [
    CommonModule,  // ✅ Requerido para *ngIf, *ngFor, pipes, etc.
    FormsModule    // ✅ CRÍTICO: Requerido para [(ngModel)], #form="ngForm"
  ],
  templateUrl: './template-contact.component.html',
  styleUrls: ['./template-contact.component.scss']
})
export class TemplateContactComponent implements OnInit {

  /**
   * INYECCIÓN MODERNA DE DEPENDENCIAS
   * =================================
   * 
   * Patrón moderno Angular 14+:
   * private service = inject(ServiceClass);
   * 
   * Patrón anterior:
   * constructor(private service: ServiceClass) {}
   * 
   * VENTAJAS del inject():
   * - Más conciso y legible
   * - Funciona con functional composition
   * - Mejor tree-shaking
   */
  private contactService = inject(ContactService);

  /**
   * MODELO DE DATOS DEL FORMULARIO
   * =============================
   * 
   * En Template-driven Forms, el modelo es un objeto JavaScript simple.
   * Cada propiedad se conecta con un campo del formulario usando [(ngModel)].
   * 
   * IMPORTANTE: Inicializar con valores por defecto para evitar errores.
   */
  model: Contact = {
    name: '',                    // ✅ String vacío, no undefined/null
    email: '',                   // ✅ Se validará formato email
    phone: '',                   // ✅ Opcional pero inicializado
    department: '',              // ✅ Se poblará desde API
    message: '',                 // ✅ Textarea para mensaje largo
    priority: 'medium',          // ✅ Valor por defecto del union type
    acceptTerms: false           // ✅ Checkbox debe empezar en false
  };

  /**
   * ESTADO DE LA APLICACIÓN
   * ======================
   * 
   * Variables para manejar el estado de la UI:
   * - Loading states para mejor UX
   * - Listas de datos desde APIs
   * - Flags de control
   */
  
  /** Array de departamentos para poblar el select */
  departments: any[] = [];
  
  /** Flag para mostrar spinner durante envío */
  loading = false;
  
  /** Flag para mostrar información de debug (desarrollo) */
  showDebug = true; // ❗ En producción debe ser false

  /** Mensaje de éxito o error para mostrar al usuario */
  statusMessage = '';

  /**
   * CICLO DE VIDA DEL COMPONENTE - ngOnInit
   * ======================================
   * 
   * Se ejecuta después de que Angular inicializa el componente.
   * Perfecto para:
   * - Cargar datos iniciales
   * - Suscribirse a observables
   * - Configurar formulario
   */
  ngOnInit(): void {
    console.log('🚀 Inicializando Template Contact Component');
    this.loadDepartments();
  }

  /**
   * CARGA DE DATOS INICIALES
   * ========================
   * 
   * Método para cargar los departamentos desde la API.
   * Demuestra el patrón común de cargar datos para selects.
   * 
   * PATRÓN OBSERVABLE:
   * 1. Llamar al servicio
   * 2. Suscribirse al Observable
   * 3. Manejar éxito y error
   * 4. Actualizar estado de la UI
   */
  private loadDepartments(): void {
    console.log('📊 Cargando departamentos desde API...');
    
    this.contactService.getDepartments().subscribe({
      /**
       * NEXT: Se ejecuta cuando llegan datos exitosamente
       * @param departments - Array de departamentos desde la API
       */
      next: (departments) => {
        this.departments = departments;
        console.log('✅ Departamentos cargados:', departments);
        
        // Si no hay departamento seleccionado, seleccionar el primero
        if (!this.model.department && departments.length > 0) {
          this.model.department = departments[0].name;
        }
      },
      
      /**
       * ERROR: Se ejecuta si hay un error en la petición HTTP
       * @param error - Información del error
       */
      error: (error) => {
        console.error('❌ Error cargando departamentos:', error);
        this.statusMessage = 'Error cargando departamentos. Intente recargar la página.';
        
        // Fallback: usar departamentos hardcodeados
        this.departments = [
          { id: 1, name: 'Ingeniería', code: 'ING' },
          { id: 2, name: 'Administración', code: 'ADM' },
          { id: 3, name: 'Logística', code: 'LOG' }
        ];
      }
    });
  }

  /**
   * ENVÍO DEL FORMULARIO
   * ===================
   * 
   * Método que se ejecuta cuando el usuario hace submit del formulario.
   * 
   * FLUJO DE ENVÍO:
   * 1. Validar que el formulario sea válido (Angular lo hace automáticamente)
   * 2. Mostrar loading state
   * 3. Enviar datos al backend vía servicio
   * 4. Manejar respuesta (éxito/error)
   * 5. Actualizar UI según resultado
   * 
   * NOTA: Este método solo se ejecuta si el formulario es válido,
   * gracias al botón [disabled]="!contactForm.valid" en el template.
   */
  onSubmit(): void {
    console.log('📤 Enviando formulario de contacto...');
    console.log('📋 Datos a enviar:', this.model);

    // ✅ Activar loading state
    this.loading = true;
    this.statusMessage = '';

    /**
     * ENVÍO ASÍNCRONO CON OBSERVABLES
     * ==============================
     * 
     * El servicio retorna un Observable que debemos suscribir.
     * Usamos el patrón next/error/complete para manejar todos los casos.
     */
    this.contactService.sendContact(this.model).subscribe({
      /**
       * ÉXITO: Formulario enviado correctamente
       * @param response - Respuesta del servidor
       */
      next: (response) => {
        console.log('✅ Formulario enviado exitosamente:', response);
        
        this.loading = false;
        this.statusMessage = '✅ ¡Formulario enviado exitosamente! Nos pondremos en contacto pronto.';
        
        // ✅ Limpiar formulario después del éxito
        this.resetFormData();
      },

      /**
       * ERROR: Hubo un problema enviando el formulario
       * @param error - Información del error HTTP
       */
      error: (error) => {
        console.error('❌ Error enviando formulario:', error);
        
        this.loading = false;
        this.statusMessage = '❌ Error enviando el formulario. Por favor, intente nuevamente.';
        
        // En producción, podríamos enviar el error a un servicio de logging
        // this.loggingService.logError('Contact form error', error);
      }
    });
  }

  /**
   * RESET DEL FORMULARIO
   * ===================
   * 
   * Método para limpiar el formulario y volverlo al estado inicial.
   * 
   * @param form - Referencia opcional al formulario NgForm
   *               Si se pasa, también resetea los estados de validación
   * 
   * ESTADOS QUE SE RESETEAN:
   * - Datos del modelo
   * - Estados de validación (si se pasa el form)
   * - Mensajes de status
   */
  resetForm(form?: any): void {
    console.log('🔄 Reseteando formulario...');

    // ✅ Resetear modelo a valores iniciales
    this.model = {
      name: '',
      email: '',
      phone: '',
      department: this.departments.length > 0 ? this.departments[0].name : '',
      message: '',
      priority: 'medium',
      acceptTerms: false
    };

    // ✅ Resetear estados de validación si se pasa el formulario
    if (form) {
      form.resetForm(this.model); // Resetea touched, dirty, etc.
    }

    // ✅ Limpiar mensajes
    this.statusMessage = '';

    console.log('✅ Formulario reseteado');
  }

  /**
   * LIMPIEZA PRIVADA DE DATOS
   * ========================
   * 
   * Método interno para limpiar solo los datos después de envío exitoso.
   * Mantiene los departamentos cargados y otros datos de estado.
   */
  private resetFormData(): void {
    this.model = {
      name: '',
      email: '',
      phone: '',
      department: this.departments.length > 0 ? this.departments[0].name : '',
      message: '',
      priority: 'medium',
      acceptTerms: false
    };
  }

  /**
   * UTILIDADES PARA EL TEMPLATE
   * ==========================
   * 
   * Métodos helper que se pueden usar en el template para lógica
   * de presentación o debugging.
   */

  /**
   * Obtiene el número de caracteres restantes para el mensaje
   * @returns número de caracteres disponibles (máximo 500)
   */
  getRemainingChars(): number {
    const maxLength = 500;
    return Math.max(0, maxLength - this.model.message.length);
  }

  /**
   * Verifica si el formulario tiene cambios sin guardar
   * @param form - Referencia al formulario NgForm
   * @returns true si hay cambios, false si está pristine
   */
  hasUnsavedChanges(form: any): boolean {
    return form && form.dirty && !form.submitted;
  }

  /**
   * Toggle para mostrar/ocultar información de debug
   * ❗ Solo para desarrollo - remover en producción
   */
  toggleDebug(): void {
    this.showDebug = !this.showDebug;
    console.log('🐛 Debug mode:', this.showDebug ? 'ON' : 'OFF');
  }
}

/**
 * SIGUIENTES PASOS EDUCATIVOS
 * ===========================
 * 
 * Una vez que los estudiantes dominen este componente, pueden:
 * 
 * 1. Agregar más validaciones personalizadas
 * 2. Implementar validación asíncrona (email único)
 * 3. Mejorar la UX con animaciones
 * 4. Agregar upload de archivos
 * 5. Implementar autoguardado
 * 6. Migrar a Reactive Forms para mayor control
 * 
 * RECURSOS PARA PROFUNDIZAR:
 * - Angular Forms Guide: https://angular.io/guide/forms
 * - FormControl API: https://angular.io/api/forms/FormControl
 * - Validation: https://angular.io/guide/form-validation
 */
