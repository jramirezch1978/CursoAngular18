# 🔧 LAB 4: PIPES PERSONALIZADOS

**PROVIAS DESCENTRALIZADO - Angular v18**

*Duración: 40 minutos*  
*Objetivo: Crear suite completa de pipes personalizados para casos de uso reales*

---

## 📚 CONCEPTOS TEÓRICOS

### ¿Qué son los Pipes Personalizados?

Los **Pipes Personalizados** son como crear sus propias herramientas especializadas. Si los pipes built-in son las herramientas básicas que vienen con Angular, los pipes personalizados son las herramientas que ustedes diseñan específicamente para resolver problemas únicos de su dominio de negocio.

Es como pasar de usar herramientas prefabricadas a crear las suyas propias para resolver problemas específicos que ninguna herramienta existente resuelve perfectamente.

### 🏗️ **Estructura de un Pipe Personalizado**

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'miPipePersonalizado',
  standalone: true,  // Para Angular 18
  pure: true        // Por defecto
})
export class MiPipePersonalizadoPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    // Lógica de transformación
    return valorTransformado;
  }
}
```

### 🎯 **Componentes Esenciales**

#### 1. **Decorador @Pipe**
- **name**: El nombre que usarán en el template
- **standalone**: true para componentes standalone (Angular 18)
- **pure**: Determina cuándo se re-ejecuta el pipe

#### 2. **Interfaz PipeTransform**
- Garantiza que el pipe tenga el método `transform`
- Es un contrato que define la estructura del pipe

#### 3. **Método transform**
- Recibe el valor a transformar como primer parámetro
- Los parámetros adicionales se pasan como `...args`
- Debe retornar el valor transformado

### 🔄 **Pipes Puros vs Impuros**

#### Pipes Puros (pure: true) ✅
```typescript
@Pipe({ name: 'truncate', pure: true })
```

**Características:**
- Solo se ejecutan cuando cambian los inputs
- Son como funciones matemáticas: misma entrada = misma salida
- Excelente performance
- Ideales para transformaciones determinísticas

**Cuándo usar:**
- Transformaciones de texto
- Formateo de números
- Conversiones de datos estáticos

#### Pipes Impuros (pure: false) ⚠️
```typescript
@Pipe({ name: 'filter', pure: false })
```

**Características:**
- Se ejecutan en cada ciclo de detección de cambios
- Pueden acceder a estado externo
- Impacto en performance si no se optimizan
- Útiles para datos dinámicos

**Cuándo usar:**
- Filtrado de arrays que cambian
- Transformaciones que dependen del tiempo
- Datos que cambian frecuentemente

### 🛠️ **Pipes que Vamos a Crear**

#### 1. **FilterPipe** - Filtrado Inteligente
```typescript
// Uso en template
{{ items | filter:searchTerm:'nombre' }}

// Características
- Búsqueda case-insensitive
- Soporte para propiedades anidadas
- Búsqueda en múltiples campos
```

#### 2. **TruncatePipe** - Truncado Inteligente
```typescript
// Uso en template
{{ texto | truncate:50:'...':true }}

// Características  
- Límite de caracteres configurable
- Trail personalizable
- Respeto por límites de palabra
```

#### 3. **FileSizePipe** - Tamaños de Archivo
```typescript
// Uso en template
{{ bytes | fileSize:2:'binary' }}

// Características
- Unidades binarias (1024) y decimales (1000)
- Precisión configurable
- Unidades correctas (KiB vs KB)
```

#### 4. **TimeAgoPipe** - Tiempo Relativo
```typescript
// Uso en template
{{ fecha | timeAgo }}

// Características
- Formato humanizado en español
- Actualización automática
- Soporte múltiples formatos de entrada
```

#### 5. **SearchHighlightPipe** - Resaltado de Búsqueda
```typescript
// Uso en template
[innerHTML]="texto | searchHighlight:term:'highlight'"

// Características
- HTML seguro con DomSanitizer
- Escape de caracteres especiales
- Clase CSS personalizable
```

#### 6. **SortByPipe** - Ordenamiento Avanzado
```typescript
// Uso en template
{{ array | sortBy:'campo':'desc':'date' }}

// Características
- Múltiples tipos de datos
- Propiedades anidadas
- Direcciones ascendente/descendente
```

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
lab-4-pipes-personalizados/
├── src/
│   ├── app/
│   │   ├── pipes/
│   │   │   ├── filter.pipe.ts
│   │   │   ├── truncate.pipe.ts
│   │   │   ├── file-size.pipe.ts
│   │   │   ├── time-ago.pipe.ts
│   │   │   ├── search-highlight.pipe.ts
│   │   │   └── sort-by.pipe.ts
│   │   ├── components/
│   │   │   └── pipes-demo/
│   │   │       ├── pipes-showcase.component.ts
│   │   │       ├── pipes-showcase.component.html
│   │   │       └── pipes-showcase.component.scss
│   │   ├── models/
│   │   │   └── demo-data.interface.ts
│   │   ├── services/
│   │   │   └── demo-data.service.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── package.json
├── angular.json
└── README.md
```

---

## 🎯 OBJETIVOS ESPECÍFICOS

Al completar este laboratorio, serás capaz de:

1. ✅ **Crear pipes puros** optimizados para performance
2. ✅ **Implementar pipes impuros** para casos específicos
3. ✅ **Manejar parámetros** en pipes personalizados
4. ✅ **Usar DomSanitizer** para HTML seguro
5. ✅ **Optimizar performance** con memoización
6. ✅ **Combinar múltiples pipes** eficientemente

---

## 🚀 FUNCIONALIDADES A IMPLEMENTAR

### Showcase Interactivo de Pipes
- **Demostración en vivo** de cada pipe personalizado
- **Controles interactivos** para probar parámetros
- **Ejemplos de código** para cada pipe
- **Documentación completa** con casos de uso
- **Comparación de performance** entre pipes puros e impuros
- **Tests unitarios** para cada pipe

### Casos de Uso PROVIAS
- **Filtrado de documentos** por múltiples criterios
- **Truncado de descripciones** en listados
- **Formateo de tamaños** de archivos de planos
- **Tiempo relativo** para reportes
- **Resaltado de búsquedas** en documentación
- **Ordenamiento** de proyectos por diferentes campos

---

## 💡 CASOS DE USO EMPRESARIALES

Este laboratorio simula herramientas reales que PROVIAS podría usar:

1. **Sistema Documental**: Filtrado y búsqueda de especificaciones técnicas
2. **Gestión de Archivos**: Manejo de planos CAD y documentos PDF
3. **Reportes Ejecutivos**: Formateo de información para dashboards
4. **Base de Conocimiento**: Búsqueda y resaltado en manuales
5. **Auditorías**: Ordenamiento de hallazgos por criterios múltiples

---

## 🔧 IMPLEMENTACIÓN DETALLADA

### FilterPipe - El Más Complejo

```typescript
@Pipe({
  name: 'filter',
  standalone: true,
  pure: false // ⚠️ Impuro para arrays dinámicos
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, field?: string): any[] {
    if (!items || !searchText) return items;

    const filterValue = searchText.toLowerCase();

    return items.filter(item => {
      if (field) {
        // Buscar en campo específico con soporte para propiedades anidadas
        const fieldValue = this.getNestedProperty(item, field);
        return fieldValue?.toString().toLowerCase().includes(filterValue);
      } else {
        // Buscar en todas las propiedades
        return this.searchInAllProperties(item, filterValue);
      }
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private searchInAllProperties(obj: any, searchValue: string): boolean {
    // Implementación recursiva para buscar en todas las propiedades
  }
}
```

### TruncatePipe - Con Word Boundary

```typescript
@Pipe({
  name: 'truncate',
  standalone: true,
  pure: true // ✅ Puro para mejor performance
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string, 
    limit: number = 25, 
    trail: string = '...', 
    wordBoundary: boolean = false
  ): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (wordBoundary) {
      // Truncar respetando límites de palabra
      const truncated = value.substring(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      
      if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + trail;
      }
    }

    return value.substring(0, limit) + trail;
  }
}
```

### FileSizePipe - Con Unidades Correctas

```typescript
@Pipe({
  name: 'fileSize',
  standalone: true,
  pure: true
})
export class FileSizePipe implements PipeTransform {
  transform(
    bytes: number, 
    decimals: number = 2, 
    units: 'binary' | 'decimal' = 'binary'
  ): string {
    if (bytes === 0) return '0 Bytes';
    if (bytes < 0) return 'Invalid size';

    const k = units === 'binary' ? 1024 : 1000;
    const sizes = units === 'binary' 
      ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
      : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${size} ${sizes[i]}`;
  }
}
```

---

## 🎨 CARACTERÍSTICAS TÉCNICAS

### Optimización de Performance

#### Memoización para Pipes Costosos
```typescript
export class SortByPipe implements PipeTransform {
  private cache = new Map<string, any[]>();

  transform(array: any[], field: string, direction: 'asc' | 'desc' = 'asc'): any[] {
    const cacheKey = `${JSON.stringify(array)}-${field}-${direction}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = this.performSort(array, field, direction);
    this.cache.set(cacheKey, result);
    
    return result;
  }
}
```

#### Pipes Puros para Máximo Rendimiento
```typescript
// ✅ Pipe puro - se ejecuta solo cuando cambian los inputs
@Pipe({ name: 'formatCurrency', pure: true })

// ⚠️ Pipe impuro - se ejecuta en cada ciclo de detección
@Pipe({ name: 'liveFilter', pure: false })
```

### Seguridad con DomSanitizer

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'searchHighlight', standalone: true })
export class SearchHighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string, search: string): SafeHtml {
    if (!text || !search) return text;

    const regex = new RegExp(`(${this.escapeRegex(search)})`, 'gi');
    const highlighted = text.replace(regex, '<mark>$1</mark>');
    
    // ⚠️ IMPORTANTE: Sanitizar HTML para seguridad
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
```

### Testing de Pipes

```typescript
describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should truncate text correctly', () => {
    const result = pipe.transform('Texto muy largo para probar', 10, '...');
    expect(result).toBe('Texto muy ...');
  });

  it('should respect word boundaries', () => {
    const result = pipe.transform('Texto muy largo', 10, '...', true);
    expect(result).toBe('Texto muy...');
  });
});
```

---

## 📊 COMPARACIÓN DE PERFORMANCE

### Pipes Puros vs Impuros

| Aspecto | Pipes Puros | Pipes Impuros |
|---------|-------------|---------------|
| **Ejecución** | Solo cuando cambian inputs | Cada ciclo de detección |
| **Performance** | ⚡ Excelente | ⚠️ Cuidado con la lógica pesada |
| **Uso de memoria** | 💚 Eficiente | 🟡 Puede ser intensivo |
| **Casos de uso** | Transformaciones estáticas | Filtros dinámicos |

### Benchmarks Esperados

- **FilterPipe (impuro)**: ~2ms para 1000 elementos
- **TruncatePipe (puro)**: ~0.1ms por string
- **FileSizePipe (puro)**: ~0.05ms por conversión
- **SortByPipe (con memoización)**: ~1ms para 1000 elementos

---

## 🏆 ENTREGABLES ESPERADOS

1. **6 Pipes Personalizados** completamente funcionales
2. **Showcase Interactivo** con documentación completa
3. **Tests Unitarios** para cada pipe
4. **Ejemplos de Uso** con casos reales de PROVIAS
5. **Documentación Técnica** con mejores prácticas
6. **Comparación de Performance** con métricas reales

---

## 🎯 MEJORES PRÁCTICAS

### Diseño de Pipes
- **Nombres descriptivos** que indiquen claramente su función
- **Parámetros opcionales** con valores por defecto sensatos
- **Manejo de errores** graceful para inputs inválidos
- **Documentación JSDoc** completa

### Performance
- **Usar pipes puros** siempre que sea posible
- **Memoización** para cálculos costosos
- **Evitar lógica compleja** en pipes impuros
- **Profiling** regular con Angular DevTools

### Seguridad
- **DomSanitizer** para contenido HTML
- **Validación de inputs** para prevenir errores
- **Escape de caracteres** especiales en regex
- **Testing de casos edge** exhaustivo

---

## 🔗 INTEGRACIÓN CON OTROS LABS

### Uso con Data Binding (Lab 1)
```html
<!-- Combinando con property binding -->
<img [alt]="description | truncate:50" [src]="imageUrl">
```

### Uso con Eventos (Lab 2)
```html
<!-- Pipes en event handlers -->
<input (keyup)="search(searchTerm | filter:items:'name')">
```

### Uso con Async (Lab 3)
```html
<!-- Combinando con async pipe -->
<div *ngFor="let item of (items$ | async) | filter:searchTerm | sortBy:'date':'desc'">
```

---

*¡Prepárate para crear herramientas de transformación de datos de nivel empresarial! 🚀*

**Estos pipes podrían ser reutilizados en todos los proyectos de PROVIAS** 💼