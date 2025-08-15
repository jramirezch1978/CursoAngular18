# LAB 2: MANEJO PROFESIONAL DE ERRORES Y ESTADOS
**PROVIAS DESCENTRALIZADO - Angular v18 - Sesión 6**  
**Duración:** 45 minutos  
**Objetivo:** Implementar manejo robusto de errores, loading states y retry strategies

## 📋 DESCRIPCIÓN DEL LABORATORIO

Este laboratorio te convierte en un experto en manejo de crisis de aplicaciones. Aprenderás a crear sistemas robustos que no solo funcionan cuando todo va bien, sino que brillan cuando las cosas salen mal.

### ¿Qué construiremos?
- **Error Handler Service**: Servicio centralizado para manejo de errores
- **Loading Service**: Gestión inteligente de estados de carga
- **Retry Strategies**: Reintentos automáticos con backoff exponencial
- **Notification Service**: Notificaciones amigables al usuario
- **Global Loading Component**: Indicadores de carga profesionales

## 🎯 CONCEPTOS EDUCATIVOS CLAVE

### 1. **Manejo de Errores HTTP**
```typescript
// ❌ Manejo básico
this.http.get('/api/products').subscribe({
  error: (err) => console.error(err) // Muy básico
});

// ✅ Manejo profesional
this.http.get('/api/products').pipe(
  retry(3),                    // Reintentar 3 veces
  catchError(this.handleError), // Manejo centralizado
  finalize(() => this.setLoading(false)) // Siempre ejecutar
);
```

### 2. **Loading States Múltiples**
```typescript
// ❌ Loading global simple
isLoading = true;

// ✅ Loading granular
loadingStates = {
  products: false,
  users: false,
  orders: true  // Solo orders está cargando
};
```

### 3. **Retry con Backoff Exponencial**
```typescript
// Intento 1: inmediato
// Intento 2: esperar 1 segundo
// Intento 3: esperar 2 segundos
// Intento 4: esperar 4 segundos
// Intento 5: esperar 8 segundos (máximo)
```

## 🚀 COMANDOS PARA EJECUTAR EL LABORATORIO

### Paso 1: Navegar al proyecto
```bash
cd LAB2-Manejo-Errores/provias-error-handling-app
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Ejecutar la aplicación
```bash
# Comando completo (JSON Server + Angular)
npm run dev

# O por separado:
# Terminal 1: npm run server
# Terminal 2: ng serve
```

### Paso 4: Probar escenarios de error
```bash
# Simular error 500
curl -X POST http://localhost:3000/api/products/simulate-error

# Simular timeout
curl http://localhost:3000/api/products?delay=10000

# Simular error de red (detener JSON Server)
```

## 📁 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Error Handler Service
- Traducción de códigos HTTP a mensajes amigables
- Categorización de errores (cliente vs servidor)
- Logging detallado para debugging
- Notificaciones automáticas al usuario

### ✅ Loading Service
- Estados de carga múltiples y granulares
- Tracking por URL específica
- Contadores de operaciones pendientes
- Integración con interceptors

### ✅ Retry Strategies
- Backoff exponencial configurable
- Exclusión de códigos de error específicos
- Jitter para evitar thundering herd
- Retry inteligente basado en tipo de error

### ✅ Notification Service
- Tipos: success, info, warning, error
- Auto-dismiss configurable
- Queue de notificaciones
- Posicionamiento y estilos personalizables

### ✅ Global Loading Component
- Overlay modal para operaciones críticas
- Barras de progreso para uploads
- Spinners contextuales
- Mensajes descriptivos de la operación

## 🔧 SERVICIOS IMPLEMENTADOS

### ErrorHandlerService
```typescript
// Uso en componentes
this.errorHandler.handleError(error);

// Extracción de errores de validación
const validationErrors = this.errorHandler.extractValidationErrors(error);

// Retry con backoff
return source.pipe(
  this.errorHandler.retryWithBackoff({ maxAttempts: 5 })
);
```

### LoadingService
```typescript
// Control granular
this.loadingService.setLoading('/api/products', true, 'Cargando productos...');

// Verificar estado
if (this.loadingService.isLoading()) {
  // Mostrar spinner global
}

// Progreso de upload
this.loadingService.updateProgress('/api/upload', 45, 'Subiendo archivo...');
```

### NotificationService
```typescript
// Notificaciones tipadas
this.notification.success('Producto creado exitosamente');
this.notification.error('Error al guardar datos');
this.notification.warning('Stock bajo detectado');
this.notification.info('Nueva versión disponible');
```

## 🧪 TESTING DE ESCENARIOS DE ERROR

### Errores HTTP Comunes
```bash
# Error 400 - Bad Request
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Error 404 - Not Found
curl http://localhost:3000/api/products/999999

# Error 409 - Conflict
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "name": "Duplicate"}'
```

### Simulación de Errores de Red
```typescript
// En environment.development.ts
export const environment = {
  // ...
  simulation: {
    networkDelay: 2000,     // 2 segundos de delay
    errorRate: 0.1,         // 10% de requests fallan
    timeoutRate: 0.05       // 5% de requests hacen timeout
  }
};
```

## 💡 PATRONES DE MANEJO DE ERRORES

### 1. **Circuit Breaker Pattern**
```typescript
// Después de N errores consecutivos, evitar más requests
if (this.consecutiveErrors > 5) {
  return throwError(() => new Error('Circuit breaker activated'));
}
```

### 2. **Graceful Degradation**
```typescript
// Si falla la API principal, usar datos en cache
return this.primaryApi().pipe(
  catchError(() => this.getCachedData()),
  catchError(() => this.getDefaultData())
);
```

### 3. **Error Boundaries**
```typescript
// Aislar errores para que no afecten toda la aplicación
@Component({
  template: `
    @if (hasError) {
      <app-error-fallback [error]="error" />
    } @else {
      <ng-content />
    }
  `
})
export class ErrorBoundaryComponent { }
```

## 📊 MÉTRICAS Y MONITORING

### Error Tracking
- Tasa de errores por endpoint
- Códigos de error más frecuentes
- Tiempo promedio de recovery
- Patrones de errores por usuario

### Performance Monitoring
- Tiempo de respuesta por operación
- Efectividad del retry
- Utilización del cache
- User experience metrics

## 🔍 DEBUGGING Y TROUBLESHOOTING

### Console Logging Estructurado
```typescript
// Logs categorizados
console.group('🔴 HTTP Error');
console.error('URL:', request.url);
console.error('Status:', error.status);
console.error('Message:', error.message);
console.error('Timestamp:', new Date().toISOString());
console.groupEnd();
```

### Error Context
```typescript
interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  userAgent: string;
  url: string;
}
```

## 🎉 RESULTADOS ESPERADOS

Al completar este laboratorio tendrás:

### ✅ **Sistema Robusto**
- Aplicación que maneja errores gracefully
- Recovery automático de fallos temporales
- UX que mantiene al usuario informado
- Logging para debugging eficiente

### ✅ **Mejores Prácticas**
- Separación de concerns (cada servicio su responsabilidad)
- Error handling centralizado y consistente
- States management para loading/error/success
- Retry strategies inteligentes

### ✅ **Experiencia de Usuario Superior**
- Mensajes de error comprensibles
- Loading states informativos
- Recovery sin pérdida de datos
- Feedback visual apropiado

## 🚀 ¿QUÉ SIGUE?

**Siguiente laboratorio:** LAB 3 - HTTP Interceptors

En el siguiente laboratorio aprenderás:
- Interceptors para autenticación automática
- Logging transparente de todas las requests
- Transformación de datos automática
- Headers y middleware personalizados

---

**¡Excelente trabajo creando aplicaciones resilientes y profesionales! 🛡️**

*Este laboratorio te da las herramientas para crear aplicaciones que nunca frustran al usuario, sin importar qué problemas surjan.*
