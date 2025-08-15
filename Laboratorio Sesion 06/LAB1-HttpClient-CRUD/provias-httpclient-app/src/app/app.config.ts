/**
 * CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN - LAB 1
 * 
 * Este archivo configura todos los providers y servicios que la aplicación necesita.
 * Es el punto de entrada para la configuración de Angular.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. PROVIDERS:
 *    - Dicen a Angular cómo crear e inyectar servicios
 *    - Configuran el sistema de inyección de dependencias
 *    - Se ejecutan al inicio de la aplicación
 * 
 * 2. HTTPCLIENT CONFIGURATION:
 *    - provideHttpClient(): habilita el cliente HTTP
 *    - withInterceptors(): permite middleware HTTP
 *    - Reemplaza el HttpClientModule en Angular 15+
 * 
 * 3. FUNCTIONAL PROVIDERS:
 *    - Más modernos que los módulos
 *    - Tree-shaking automático (código no usado se elimina)
 *    - Configuración más explícita y flexible
 */

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

// Importar rutas de la aplicación
import { routes } from './app.routes';

/**
 * CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN
 * 
 * ApplicationConfig es la nueva forma de configurar aplicaciones Angular.
 * Reemplaza el app.module.ts tradicional con un enfoque más funcional.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    
    // ========================================
    // CONFIGURACIÓN DE ENRUTAMIENTO
    // ========================================
    
    /**
     * provideRouter(): Configura el sistema de rutas
     * - Habilita navegación entre páginas/vistas
     * - Lazy loading automático de módulos
     * - Guards para proteger rutas
     */
    provideRouter(routes),
    
    // ========================================
    // CONFIGURACIÓN DE HTTP CLIENT
    // ========================================
    
    /**
     * provideHttpClient(): Habilita comunicación HTTP
     * 
     * ¿Por qué necesitamos esto?
     * - Angular no incluye HttpClient por defecto
     * - Necesario para comunicarse con APIs REST
     * - Provee inyección de dependencias para HttpClient
     * 
     * Opciones configuradas:
     * - withInterceptors([]): Array de interceptors (vacío por ahora)
     * - withFetch(): Usa Fetch API en lugar de XMLHttpRequest (más moderno)
     */
    provideHttpClient(
      // Lista de interceptors (se agregarán en LAB 3)
      withInterceptors([
        // authInterceptor,      // Agregado en LAB 3
        // loggingInterceptor,   // Agregado en LAB 3
        // errorInterceptor,     // Agregado en LAB 2
        // cacheInterceptor,     // Agregado en LAB 4
      ]),
      
      // Usar Fetch API moderno en lugar de XMLHttpRequest
      withFetch()
    ),
    
    // ========================================
    // CONFIGURACIÓN DE ANIMACIONES
    // ========================================
    
    /**
     * provideAnimations(): Habilita animaciones de Angular
     * 
     * ¿Por qué necesitamos esto?
     * - Material Design y otras librerías las requieren
     * - Mejora la UX con transiciones suaves
     * - Loading states más pulidos
     * 
     * Alternativa: provideNoopAnimations() para deshabilitar
     */
    provideAnimations(),
    
    // ========================================
    // CONFIGURACIÓN DE HIDRATACIÓN (SSR)
    // ========================================
    
    /**
     * provideClientHydration(): Para Server-Side Rendering
     * 
     * ¿Qué es hidratación?
     * - Conecta el HTML renderizado en servidor con Angular client
     * - Mejora SEO y tiempo de primera carga
     * - Preserva estado entre servidor y cliente
     */
    provideClientHydration(),
    
    // ========================================
    // SERVICIOS PERSONALIZADOS
    // ========================================
    
    /**
     * Aquí se pueden agregar servicios personalizados globales:
     * 
     * Ejemplo:
     * - NotificationService
     * - LoggingService
     * - CacheService
     * - AuthService
     * 
     * Nota: Los servicios con @Injectable({ providedIn: 'root' })
     * no necesitan ser listados aquí, se registran automáticamente.
     */
    
    // Configuraciones adicionales pueden ir aquí según las necesidades:
    
    // Para internacionalización (i18n):
    // importProvidersFrom(HttpClientModule),
    
    // Para formularios reactivos (si se necesitan globalmente):
    // importProvidersFrom(ReactiveFormsModule),
    
    // Para servicios de terceros:
    // { provide: THIRD_PARTY_CONFIG, useValue: config }
  ]
};

/**
 * NOTAS EDUCATIVAS IMPORTANTES:
 * 
 * 1. ORDEN DE PROVIDERS:
 *    - El orden puede importar en algunos casos
 *    - Interceptors se ejecutan en el orden listado
 *    - Algunos providers dependen de otros
 * 
 * 2. TREE-SHAKING:
 *    - Solo se incluye código que realmente se usa
 *    - Providers funcionales facilitan esto
 *    - Aplicaciones más pequeñas en producción
 * 
 * 3. TESTING:
 *    - Cada provider puede mockearse individualmente
 *    - Configuración más flexible para tests
 *    - No hay módulos grandes que importar
 * 
 * 4. MIGRACIÓN DESDE MÓDULOS:
 *    - app.module.ts → app.config.ts
 *    - @NgModule → ApplicationConfig
 *    - imports → providers con importProvidersFrom()
 * 
 * 5. DEBUGGING:
 *    - Angular DevTools muestran todos los providers
 *    - Fácil verificar qué servicios están disponibles
 *    - Error messages más claros sobre dependencias faltantes
 */