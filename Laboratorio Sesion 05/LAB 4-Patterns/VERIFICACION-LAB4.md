# VERIFICACIÓN LAB 4 - Arquitectura de Servicios Empresariales

## 🚀 Cómo ejecutar el laboratorio

```bash
cd "LAB 4-Patterns"
npm install
ng serve
```

Abrir en el navegador: http://localhost:4200

## ✅ Qué verás

### 1. Dashboard de Tareas
- Estadísticas en tiempo real (Total, Pendientes, En Progreso, Completadas, Críticas, Urgentes)
- Sistema completo de gestión de tareas con Repository Pattern

### 2. Unit of Work Pattern
- Panel que muestra cambios pendientes
- Botones para Commit y Rollback
- Visualización de tareas añadidas, modificadas y eliminadas
- Transacciones atómicas

### 3. Global Store con Signals
- Estado global de la aplicación
- Filtros reactivos
- Estadísticas computadas automáticamente
- Persistencia en localStorage

### 4. Repository Pattern
- CRUD completo de tareas
- Abstracción de acceso a datos
- Mock data para desarrollo
- Preparado para API real

## 🔧 Características implementadas

### Repository Pattern
- `Repository<T>`: Clase base abstracta
- `TaskRepository`: Implementación concreta
- Métodos: getAll, getById, create, update, delete, exists, count, query

### Unit of Work
- Tracking de cambios
- Estados: unchanged, added, modified, deleted
- Commit/Rollback transaccional
- Visualización de cambios pendientes

### Global Store
- Estado centralizado con Signals
- Computed signals para datos derivados
- Effects para side effects
- Persistencia automática

### Funcionalidades de la UI
- ➕ Crear tareas nuevas
- 🔄 Cambiar estado de tareas
- 📊 Actualizar progreso
- 🗑️ Eliminar tareas
- 🔍 Filtrar por estado, prioridad y búsqueda
- 📄 Ver detalle de tarea seleccionada

## 📋 Flujo de trabajo

1. **Crear una tarea**: Se añade al Unit of Work como "added"
2. **Modificar una tarea**: Se marca como "modified"
3. **Eliminar una tarea**: Se marca como "deleted"
4. **Ver cambios pendientes**: El panel UoW muestra todos los cambios
5. **Commit**: Aplica todos los cambios al repositorio
6. **Rollback**: Descarta todos los cambios

## 🎯 Puntos clave del laboratorio

1. **Separación de responsabilidades**:
   - Repository: Acceso a datos
   - Unit of Work: Gestión de transacciones
   - Store: Estado de la aplicación

2. **Patrones empresariales**:
   - Repository Pattern para abstracción de datos
   - Unit of Work para transacciones
   - Store Pattern para estado global

3. **Arquitectura escalable**:
   - Fácil cambio de fuente de datos
   - Estado predecible con Signals
   - Transacciones atómicas

## 🧪 Pruebas para realizar

1. **Crear varias tareas** y ver cómo se actualizan las estadísticas
2. **Modificar tareas** (cambiar estado, actualizar progreso)
3. **Observar el panel de Unit of Work** con los cambios pendientes
4. **Hacer Commit** para guardar todos los cambios
5. **Hacer Rollback** para descartar cambios
6. **Filtrar tareas** por estado y prioridad
7. **Buscar tareas** por título o descripción
8. **Seleccionar una tarea** para ver su detalle completo

## 🐛 Troubleshooting

Si algo no funciona:
1. Verifica que el proyecto compile sin errores: `ng build`
2. Revisa la consola del navegador para logs
3. Los datos son mock, se reinician al recargar (excepto UI state)
4. El estado de UI se guarda en localStorage con clave `app_state_lab4`
