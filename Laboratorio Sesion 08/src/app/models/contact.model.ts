/**
 * MODELO DE CONTACTO - TEMPLATE-DRIVEN FORMS LAB
 * ==============================================
 * 
 * Este archivo define la estructura de datos que usaremos para
 * capturar información de contacto de los usuarios.
 * 
 * CONCEPTOS CLAVE:
 * - Interface TypeScript para tipado fuerte
 * - Propiedades opcionales con ?
 * - Union types para valores limitados
 * - Documentación JSDoc para cada campo
 * 
 * PROVIAS DESCENTRALIZADO - Angular v18
 * Instructor: Ing. Jhonny Alexander Ramirez Chiroque
 */

/**
 * Interface que define la estructura de un formulario de contacto.
 * 
 * Esta interface asegura que todos los datos de contacto tengan
 * la estructura correcta y los tipos apropiados.
 * 
 * NOTA EDUCATIVA: Las interfaces en TypeScript desaparecen en runtime,
 * pero nos dan seguridad de tipos durante el desarrollo.
 */
export interface Contact {
  /** 
   * Nombre completo del usuario
   * - Requerido: Sí
   * - Validaciones: mínimo 3 caracteres, máximo 50
   * - Ejemplo: "Ana García Rodríguez"
   */
  name: string;

  /** 
   * Email corporativo del usuario
   * - Requerido: Sí
   * - Validaciones: formato email válido, debe ser @provias.gob.pe
   * - Ejemplo: "ana.garcia@provias.gob.pe"
   */
  email: string;

  /** 
   * Teléfono de contacto (OPCIONAL)
   * - Requerido: No (por eso el ?)
   * - Validaciones: formato peruano +51 seguido de 9 dígitos
   * - Ejemplo: "+51987654321"
   */
  phone?: string;

  /** 
   * Departamento al que pertenece el usuario
   * - Requerido: Sí
   * - Valores: se obtienen dinámicamente de la API
   * - Ejemplo: "Ingeniería", "Administración", "Logística"
   */
  department: string;

  /** 
   * Mensaje o consulta del usuario
   * - Requerido: Sí
   * - Validaciones: máximo 500 caracteres
   * - Ejemplo: "Necesito información sobre el proyecto PROV-2025-001"
   */
  message: string;

  /** 
   * Nivel de prioridad del contacto
   * - Requerido: Sí
   * - Tipo: Union Type (solo permite estos 3 valores)
   * - Valores permitidos: 'low' | 'medium' | 'high'
   * 
   * NOTA EDUCATIVA: Los union types restringen los valores posibles,
   * evitando errores como escribir 'alta' en lugar de 'high'
   */
  priority: 'low' | 'medium' | 'high';

  /** 
   * Aceptación de términos y condiciones
   * - Requerido: Sí (debe ser true para enviar)
   * - Tipo: boolean
   * - Validación: debe ser true para que el formulario sea válido
   */
  acceptTerms: boolean;
}

/**
 * EJEMPLOS DE USO:
 * 
 * // ✅ Objeto válido
 * const contactoValido: Contact = {
 *   name: "Carlos López",
 *   email: "carlos.lopez@provias.gob.pe",
 *   phone: "+51987654321",
 *   department: "Ingeniería",
 *   message: "Consulta sobre proyecto vial",
 *   priority: "medium",
 *   acceptTerms: true
 * };
 * 
 * // ❌ Error de TypeScript - falta campo requerido
 * const contactoInvalido: Contact = {
 *   name: "Juan Pérez",
 *   email: "juan@provias.gob.pe"
 *   // Faltan: department, message, priority, acceptTerms
 * };
 * 
 * // ❌ Error de TypeScript - prioridad inválida
 * const prioridadMala: Contact = {
 *   // ... otros campos
 *   priority: "urgente" // ❌ Solo permite 'low' | 'medium' | 'high'
 * };
 */

/**
 * RELACIÓN CON EL FORMULARIO:
 * 
 * En el componente Template-driven, cada propiedad de esta interface
 * se conectará con un campo del formulario usando [(ngModel)]:
 * 
 * <input [(ngModel)]="model.name" name="name" required>
 * <input [(ngModel)]="model.email" name="email" type="email" required>
 * <select [(ngModel)]="model.department" name="department" required>
 * <textarea [(ngModel)]="model.message" name="message" required></textarea>
 * <input [(ngModel)]="model.acceptTerms" name="acceptTerms" type="checkbox" required>
 */
