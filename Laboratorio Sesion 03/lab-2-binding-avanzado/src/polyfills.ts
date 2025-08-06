/**
 * POLYFILLS - Lab 2: Binding Avanzado
 * Angular v18 - PROVIAS DESCENTRALIZADO
 */

/***************************************************************************************************
 * Zone JS es requerido por Angular para la detección de cambios.
 */
import 'zone.js';  // Incluido con Angular CLI.

/***************************************************************************************************
 * APLICACIÓN DE POLYFILLS
 * Los polyfills específicos de la aplicación se agregan aquí.
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE11 requiere todos los siguientes polyfills. **/
// import 'core-js/es/symbol';
// import 'core-js/es/object';
// import 'core-js/es/function';
// import 'core-js/es/parse-int';
// import 'core-js/es/parse-float';
// import 'core-js/es/number/constructor';
// import 'core-js/es/math';
// import 'core-js/es/string';
// import 'core-js/es/date';
// import 'core-js/es/array';
// import 'core-js/es/regexp';
// import 'core-js/es/map';
// import 'core-js/es/weak-map';
// import 'core-js/es/set';

/**
 * Si la aplicación se dirige a entornos que no soportan ES2015,
 * descomenta y usa las siguientes importaciones.
 */
// import 'core-js/es/object/assign';
// import 'core-js/es/promise';
// import 'core-js/es/array';

/** Evergreen browsers require these. **/
// Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.
// import 'core-js/es/reflect';

/**
 * Web Animations `@angular/platform-browser/animations`
 * Sólo requerido si AnimationBuilder es usado dentro de la aplicación y se dirige a IE/Edge o Safari.
 * Versiones estándar de Chrome, Firefox, y Opera soportan todas las características sin polyfills.
 */
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * Por defecto, zone.js parchea todos los posibles macroTask y DomEvents
 * usuario puede deshabilitar partes del parchado de macroTask/DomEvents activando las flags a continuación
 * porque esas flags necesitan ser activadas antes de `zone.js` que es cargado, y webpack
 * cargará import por primera vez, por lo que el usuario necesita crear un archivo separado en esta localización
 * y lo agrega antes de que zone.js en las opciones de polyfills en angular.json
 */

// (window as any).__Zone_disable_requestAnimationFrame = true; // deshabilita el parche requestAnimationFrame
// (window as any).__Zone_disable_on_property = true; // deshabilita el parche onProperty como onclick
// (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // deshabilita el parche de eventos especificados

/**
 * En IE/Edge el desarrollador puede hacer cosas como
 * `Reflect.construct(Date, [1, 2, 3])` que será marcado como error.
 * 
 * import 'core-js/es/reflect';
 */

/**
 * CONFIGURACIÓN ESPECÍFICA PARA PROVIAS
 */

// Configuración regional para España/Perú
// import '@angular/common/locales/es';
// import '@angular/common/locales/es-PE';

/**
 * BOOTSTRAP DE LA APLICACIÓN
 * Este archivo es incluido por angular.json como polyfill
 */
console.log('🚀 Polyfills cargados para Lab 2: Binding Avanzado - PROVIAS');