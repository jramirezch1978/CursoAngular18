# LAB4: Caching & Optimización - PROVIAS Descentralizado

## 📋 Descripción
Este laboratorio implementa un sistema avanzado de **caching HTTP** y **optimización de búsquedas** para mejorar el rendimiento de aplicaciones Angular.

## 🎯 Objetivos del Laboratorio
- Implementar un servicio de cache inteligente con múltiples estrategias
- Crear un interceptor HTTP para cache automático
- Optimizar búsquedas con debouncing y cancelación de requests
- Monitorear métricas de rendimiento en tiempo real

## 🚀 Cómo Ejecutar

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Ejecutar el servidor JSON y la aplicación
npm run dev
```

La aplicación se abrirá en `http://localhost:4200`

## 📘 Guía de Uso del Dashboard

### 1. **Sección Cache Management Demo**

#### Botones de Control:
- **🎯 Test Cache Hit**: 
  - Cada click crea una nueva URL (page=1, page=2, etc.)
  - Llena progresivamente el cache con productos
  - Primera petición de cada página: ~500ms (desde red)
  - Peticiones repetidas: <50ms (desde cache)
  - Cada producto se cachea individualmente para llenar más memoria

- **❌ Test Cache Miss**: 
  - Siempre hace una petición nueva (añade parámetro random)
  - No usa cache, útil para comparar tiempos
  - Siempre tarda ~500ms (con delay del servidor)

- **🧹 Clear Cache**: 
  - Limpia toda la memoria cache
  - Muestra cuántas entradas y KB se liberaron
  - Las métricas se resetean a 0
  - El contador de páginas se reinicia

- **📊 View Stats**: 
  - Muestra estadísticas detalladas en la consola visual
  - Total de hits, misses, tamaño de memoria
  - Porcentaje de uso de memoria

### 2. **Sección Optimized Search**

- **Búsqueda con Debouncing**:
  - Escribe en el campo de búsqueda
  - La petición se hace 300ms después de dejar de escribir
  - Cancela peticiones anteriores automáticamente
  - Los resultados se cachean para búsquedas repetidas

### 3. **Métricas en Tiempo Real**

Las métricas en la parte superior se actualizan automáticamente:
- **Cache Hit Rate**: Porcentaje de peticiones servidas desde cache
- **Avg Response Time**: Tiempo promedio de respuesta
- **Cached Items**: Número de elementos en cache
- **Saved Requests**: Peticiones HTTP ahorradas gracias al cache

## 🔧 Arquitectura Técnica

### Componentes Principales:

1. **CacheService** (`/core/services/cache.service.ts`)
   - Gestión de memoria con LRU (Least Recently Used)
   - TTL (Time To Live) configurable
   - Múltiples estrategias de cache
   - Limpieza automática de entradas expiradas

2. **CacheInterceptor** (`/core/interceptors/cache.interceptor.ts`)
   - Intercepta automáticamente peticiones GET
   - Cachea respuestas exitosas
   - Evita peticiones duplicadas simultáneas

3. **OptimizedSearchComponent** (`/shared/components/optimized-search/`)
   - Implementa debouncing con RxJS
   - Cancela peticiones obsoletas
   - Cachea resultados de búsqueda

## 📊 Cómo Verificar que Funciona

### Ahora con Consola Visual en Pantalla:

1. **Observa la sección "Live Console Output"** en el dashboard
2. **Haz click en "Test Cache Hit" varias veces**
   - Verás los mensajes aparecer en tiempo real
   - Códigos de colores: verde (éxito), azul (info), naranja (warning), rojo (error)
3. **Observa el Memory Usage %** aumentar:
   - Cada click añade más productos al cache
   - El porcentaje sube progresivamente
   - Cuando llegue a ~100%, el cache empezará a eliminar entradas antiguas (LRU)
4. **Ejemplo de output visual**:
   ```
   [10:45:23] 🎯 Testing cache hit...
   [10:45:23] 📍 URL: http://localhost:3000/products?page=1
   [10:45:24] 🌐 Response from NETWORK in 523.45ms
   [10:45:24] 📦 Received 12 products
   [10:45:24] 💾 Cached 12 individual products
   
   [10:45:26] 🎯 Testing cache hit...
   [10:45:26] 📍 URL: http://localhost:3000/products?page=1
   [10:45:26] ✅ Response from CACHE in 12.34ms
   [10:45:26] 📦 Received 12 products
   ```

## 🛠️ Características Implementadas

### Cache Inteligente:
- ✅ Cache automático de peticiones GET
- ✅ TTL configurable por petición
- ✅ Evicción LRU cuando se llena la memoria
- ✅ Invalidación selectiva por tags
- ✅ Compresión simulada para datos grandes

### Optimización de Búsquedas:
- ✅ Debouncing de 300ms
- ✅ Cancelación de peticiones previas
- ✅ Cache de resultados de búsqueda
- ✅ Prevención de búsquedas duplicadas

### Métricas y Monitoreo:
- ✅ Hit rate en tiempo real
- ✅ Estadísticas de uso de memoria
- ✅ Contadores de peticiones ahorradas
- ✅ Logs detallados para debugging

## 🎮 Ejercicios Prácticos

1. **Prueba el Cache**:
   - Click en "Test Cache Hit" 5 veces
   - Observa cómo el "Cache Hit Rate" aumenta
   - Verifica en consola la diferencia de tiempos

2. **Búsqueda Optimizada**:
   - Escribe "Laptop" en el buscador
   - Borra y vuelve a escribir "Laptop"
   - La segunda vez será instantáneo (desde cache)

3. **Limpieza de Cache**:
   - Click en "Clear Cache"
   - Observa cómo las métricas se resetean
   - El próximo "Test Cache Hit" será lento nuevamente

## 📈 Beneficios de Implementación

- **Reducción de latencia**: Hasta 10x más rápido con cache
- **Ahorro de ancho de banda**: Menos peticiones al servidor
- **Mejor UX**: Respuestas instantáneas para datos frecuentes
- **Optimización de servidor**: Menos carga en el backend

## 🐛 Troubleshooting

Si los botones no funcionan:
1. Verifica que el JSON Server esté corriendo (puerto 3000)
2. Revisa la consola del navegador por errores
3. Asegúrate de que `npm run dev` esté ejecutándose

## 📚 Conceptos Aprendidos

- HTTP Interceptors en Angular
- Gestión de estado con Signals
- Estrategias de caching (Cache-First, Network-First, etc.)
- Optimización con RxJS (debounceTime, distinctUntilChanged, switchMap)
- Métricas de rendimiento en aplicaciones web

---

**Autor**: PROVIAS Descentralizado  
**Framework**: Angular v18  
**Laboratorio**: Sesión 6 - Comunicación HTTP