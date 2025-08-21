/**
 * SERVICIO DE CONTACTO - TEMPLATE-DRIVEN FORMS LAB
 * ==============================================
 * 
 * Este servicio maneja toda la lógica relacionada con formularios de contacto:
 * - Envío de formularios al backend
 * - Obtención de datos para poblar selects (departamentos)
 * - Manejo de peticiones HTTP
 * 
 * CONCEPTOS CLAVE DEMOSTRADOS:
 * - Injectable service con providedIn: 'root'
 * - Inyección moderna con inject() función
 * - HttpClient para peticiones HTTP
 * - Tipado fuerte con TypeScript
 * - Observables para manejo asíncrono
 * - Manejo de rutas de API
 * 
 * PROVIAS DESCENTRALIZADO - Angular v18
 * Instructor: Ing. Jhonny Alexander Ramirez Chiroque
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.model';

/**
 * Servicio para manejar operaciones relacionadas con formularios de contacto.
 * 
 * PATRÓN DE INYECCIÓN MODERNA:
 * En Angular 18, usamos inject() en lugar del constructor tradicional
 * para una sintaxis más limpia y mejor tree-shaking.
 * 
 * @Injectable({ providedIn: 'root' }):
 * - Hace que el servicio sea un singleton
 * - Se registra automáticamente en el root injector
 * - No necesita ser declarado en providers[]
 */
@Injectable({
  providedIn: 'root' // ✅ Servicio singleton disponible en toda la aplicación
})
export class ContactService {

  /**
   * INYECCIÓN MODERNA DE DEPENDENCIAS
   * ================================
   * 
   * Patrón ANTERIOR (Angular < 14):
   * constructor(private http: HttpClient) {}
   * 
   * Patrón MODERNO (Angular 14+):
   * private http = inject(HttpClient);
   * 
   * VENTAJAS del nuevo patrón:
   * - Más legible y conciso
   * - Mejor tree-shaking
   * - Funciona bien con composables
   * - Menos boilerplate
   */
  private http = inject(HttpClient);

  /**
   * URL base para las peticiones API.
   * 
   * NOTA: Usamos '/api' que será proxificado por Angular CLI
   * hacia http://localhost:3000 usando proxy.conf.json
   * 
   * En producción, esto sería algo como:
   * private apiUrl = 'https://api.provias.gob.pe/v1';
   */
  private apiUrl = '/api';

  /**
   * Envía un formulario de contacto al backend.
   * 
   * PARÁMETROS:
   * @param contact - Objeto que implementa la interface Contact
   * 
   * RETORNA:
   * @returns Observable<any> - Observable que emite la respuesta del servidor
   * 
   * EJEMPLO DE USO:
   * this.contactService.sendContact(this.model)
   *   .subscribe({
   *     next: (response) => console.log('Enviado!', response),
   *     error: (error) => console.error('Error:', error)
   *   });
   * 
   * FLUJO DE DATOS:
   * 1. Componente llama sendContact(contactData)
   * 2. HttpClient hace POST a /api/contacts
   * 3. Proxy redirige a http://localhost:3000/contacts
   * 4. JSON Server recibe y guarda los datos
   * 5. Respuesta regresa como Observable al componente
   */
  sendContact(contact: Contact): Observable<any> {
    // Log para debugging - EN PRODUCCIÓN REMOVER
    console.log('📤 Enviando contacto:', contact);
    
    /**
     * POST HTTP REQUEST
     * ================
     * 
     * HttpClient.post(url, body, options?)
     * - url: endpoint donde enviar los datos
     * - body: objeto Contact que se serializa automáticamente a JSON
     * - options: headers, params, etc. (opcional)
     * 
     * HEADERS AUTOMÁTICOS:
     * Angular automáticamente agrega:
     * - Content-Type: application/json
     * - Accept: application/json
     */
    return this.http.post(`${this.apiUrl}/contacts`, contact);
  }

  /**
   * Obtiene la lista de departamentos para poblar un select.
   * 
   * RETORNA:
   * @returns Observable<any[]> - Array de departamentos desde la API
   * 
   * EJEMPLO DE USO EN COMPONENTE:
   * this.contactService.getDepartments()
   *   .subscribe(departments => {
   *     this.departments = departments;
   *   });
   * 
   * RESPUESTA ESPERADA DE LA API:
   * [
   *   { "id": 1, "name": "Ingeniería", "code": "ING" },
   *   { "id": 2, "name": "Administración", "code": "ADM" },
   *   { "id": 3, "name": "Logística", "code": "LOG" }
   * ]
   */
  getDepartments(): Observable<any[]> {
    /**
     * GET HTTP REQUEST
     * ===============
     * 
     * HttpClient.get<T>(url, options?)
     * - T: tipo esperado de respuesta (any[] en este caso)
     * - url: endpoint para obtener datos
     * - options: parámetros, headers, etc.
     * 
     * TIPADO FUERTE:
     * <any[]> le dice a TypeScript que esperamos un array
     * En una implementación más robusta, deberíamos crear
     * una interface Department en lugar de usar 'any'
     */
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  // ========================================================================
  // MÉTODOS ADICIONALES QUE PODRÍAN AGREGARSE EN UNA IMPLEMENTACIÓN COMPLETA
  // ========================================================================

  /**
   * EJEMPLO: Verificar disponibilidad de email (para validación asíncrona)
   * 
   * checkEmailAvailable(email: string): Observable<boolean> {
   *   return this.http.get<{available: boolean}>(`${this.apiUrl}/check-email/${email}`)
   *     .pipe(
   *       map(response => response.available)
   *     );
   * }
   */

  /**
   * EJEMPLO: Obtener historial de contactos de un usuario
   * 
   * getContactHistory(userEmail: string): Observable<Contact[]> {
   *   return this.http.get<Contact[]>(`${this.apiUrl}/contacts?email=${userEmail}`);
   * }
   */

  /**
   * EJEMPLO: Eliminar un contacto
   * 
   * deleteContact(contactId: number): Observable<void> {
   *   return this.http.delete<void>(`${this.apiUrl}/contacts/${contactId}`);
   * }
   */
}

/**
 * MANEJO DE ERRORES AVANZADO
 * =========================
 * 
 * En una implementación de producción, agregaríamos manejo de errores:
 * 
 * import { catchError } from 'rxjs/operators';
 * import { throwError } from 'rxjs';
 * 
 * sendContact(contact: Contact): Observable<any> {
 *   return this.http.post(`${this.apiUrl}/contacts`, contact)
 *     .pipe(
 *       catchError(error => {
 *         console.error('Error enviando contacto:', error);
 *         return throwError(() => new Error('Error al enviar el formulario'));
 *       })
 *     );
 * }
 */

/**
 * INTERCEPTORS Y AUTENTICACIÓN
 * ===========================
 * 
 * En un sistema real, probablemente necesitaríamos:
 * 
 * 1. HTTP Interceptor para agregar tokens de autenticación
 * 2. Error Interceptor para manejo centralizado de errores
 * 3. Loading Interceptor para mostrar spinners automáticamente
 * 
 * Estos se configuran en app.config.ts:
 * provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
 */
