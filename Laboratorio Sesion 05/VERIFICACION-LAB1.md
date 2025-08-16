# VERIFICACIÓN LAB 1 - Servicios y Signals

## Para ejecutar este laboratorio:

```bash
# 1. Navegar al directorio
cd "LAB 1-Servicios-Signals"

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
ng serve

# 4. Abrir en navegador
# http://localhost:4200
```

## Qué verás:

1. **Sistema de Gestión de Tareas PROVIAS**
   - Lista de tareas con estadísticas automáticas
   - Filtros por estado y prioridad
   - Búsqueda en tiempo real
   - Vista Grid/Lista/Kanban

2. **Características implementadas**:
   - ✅ Servicios con Signals
   - ✅ inject() en lugar de constructor
   - ✅ Computed signals para estadísticas
   - ✅ Effects para persistencia
   - ✅ Filtrado reactivo

3. **Funcionalidades**:
   - Cargar tareas mock
   - Filtrar por estado/prioridad
   - Buscar por texto
   - Cambiar estado de tareas
   - Actualizar progreso
   - Eliminar tareas
   - Ver tareas urgentes

## Verificación de compilación:

```bash
ng build
```

El proyecto debe compilar sin errores.