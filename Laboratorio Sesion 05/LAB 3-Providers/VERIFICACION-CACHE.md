# VERIFICACIÓN DEL SISTEMA DE CACHE - LAB 3

## 🚀 Cómo ejecutar el laboratorio

```bash
cd "LAB 3-Providers"
npm install
ng serve
```

Abrir en el navegador: http://localhost:4200

## ✅ Qué se ha corregido

### Problema encontrado:
1. El método `onFormChange()` existía pero **nunca se llamaba** cuando cambiaban los valores del formulario.
2. No se visualizaban los datos guardados en cache.

### Solución aplicada:
1. Se agregó `(ngModelChange)="onFormChange()"` a todos los campos del formulario:
   - Título
   - Descripción  
   - Asignado a
   - Fecha de vencimiento
   - Prioridad
   - Justificación (cuando es crítica)

2. **NUEVO**: Se agregó una sección visual que muestra en tiempo real:
   - Los datos guardados en cache (en formato JSON)
   - La última hora de actualización
   - Botones para actualizar la vista y limpiar el cache

Ahora cada vez que escribes en cualquier campo, automáticamente se guarda un borrador en caché Y LO PUEDES VER en la sección "💾 Datos en Cache".

## 🧪 Cómo verificar que funciona

### 1. En el Formulario de Tareas:
1. Escribir datos en los campos del formulario
2. Abrir la consola del navegador (F12)
3. Deberías ver mensajes como: `Draft saved to cache`
4. Recargar la página (F5)
5. Los datos del formulario deberían recuperarse automáticamente

### 2. En la Demo de Cache:
1. Click en el tab "🗄️ Demo de Cache" (si no hay tabs, está en la misma página)
2. En "Guardar en Cache":
   - Clave: `test-data`
   - Valor: `{"mensaje": "Hola PROVIAS"}`
   - TTL: `60` (segundos)
   - Click en "💾 Guardar"
3. En "Buscar en Cache":
   - Clave: `test-data`
   - Click en "🔍 Buscar"
   - Deberías ver el valor guardado

### 3. Verificar LocalStorage:
Si el `APP_CONFIG` tiene `cache.strategy: 'localStorage'`:
1. Abrir DevTools (F12)
2. Ir a la pestaña "Application" o "Almacenamiento"
3. Expandir "Local Storage"
4. Buscar claves que empiecen con `provias_cache_`
5. Deberías ver:
   - `provias_cache_draft-task` (del formulario)
   - `provias_cache_test-data` (de la demo)

### 4. Verificar Memory Cache:
Si el `APP_CONFIG` tiene `cache.strategy: 'memory'`:
1. Los datos se guardan en memoria
2. Se pierden al recargar la página
3. Puedes ver los logs en la consola

## 📋 Características del Sistema de Cache

1. **Dos estrategias disponibles:**
   - `MemoryCacheStrategy`: Guarda en memoria (se pierde al recargar)
   - `LocalStorageCacheStrategy`: Guarda en localStorage (persiste)

2. **TTL (Time To Live):**
   - Cada item tiene un tiempo de vida
   - Después del TTL, el item expira y se elimina automáticamente

3. **Operaciones soportadas:**
   - `set(key, value, ttl)`: Guardar con tiempo de vida
   - `get(key)`: Obtener valor (null si expiró)
   - `remove(key)`: Eliminar específico
   - `clear()`: Limpiar todo el cache

4. **Integración con formularios:**
   - Auto-guardado de borradores
   - Recuperación automática al cargar la página

## 🎯 Puntos clave del laboratorio

1. **InjectionTokens**: `CACHE_STRATEGY` permite inyectar diferentes implementaciones
2. **Factory Providers**: La estrategia se decide según la configuración
3. **Providers a nivel componente**: Cada componente puede tener su propia instancia
4. **Multi-providers**: Los validadores se registran múltiples veces

## 🐛 Troubleshooting

Si no ves los datos guardándose:
1. Verifica que estés escribiendo en los campos (no solo haciendo click)
2. Revisa la consola para ver los logs
3. Asegúrate de que el TTL sea suficiente (por defecto 5-10 minutos)
4. En localStorage, busca claves con prefijo `provias_cache_`
