# LAB 1: IMPLEMENTACIÓN DE HTTPCLIENT Y CRUD COMPLETO
**PROVIAS DESCENTRALIZADO - Angular v18 - Sesión 6**  
**Duración:** 45 minutos  
**Objetivo:** Implementar un servicio HTTP completo con todas las operaciones CRUD

## 📋 DESCRIPCIÓN DEL LABORATORIO

Este laboratorio implementa un sistema completo de gestión de productos usando HttpClient de Angular. Aprenderás a crear, leer, actualizar y eliminar datos de una API REST, usando las mejores prácticas de Angular v18 con Signals y programación reactiva.

### ¿Qué construiremos?
- **Sistema CRUD completo**: Create, Read, Update, Delete para productos
- **Servicio con Signals**: Estado reactivo moderno de Angular 16+
- **Filtrado y búsqueda**: En tiempo real con debounce
- **Interfaz completa**: Lista, formularios, y gestión de errores
- **Comparación educativa**: Observables vs Promises

## 🎯 CONCEPTOS EDUCATIVOS CLAVE

### 1. **HttpClient vs fetch()**
```typescript
// ❌ Con fetch() (limitado)
const response = await fetch('/api/products');
const products = await response.json();

// ✅ Con HttpClient (poderoso)
this.http.get<Product[]>('/api/products').pipe(
  retry(3),
  catchError(this.handleError),
  shareReplay(1)
).subscribe(products => {
  // Manejo automático de JSON, tipos, errores, retry
});
```

### 2. **Signals vs Variables Tradicionales**
```typescript
// ❌ Variables tradicionales
products: Product[] = [];
loading = false;

// ✅ Signals (reactivos)
products = signal<Product[]>([]);
loading = signal(false);

// UI se actualiza automáticamente cuando cambian
```

### 3. **Operadores RxJS Educativos**
- **tap()**: Side effects sin modificar el stream (logging)
- **catchError()**: Manejo de errores sin romper el flujo
- **shareReplay()**: Cache de la última emisión
- **finalize()**: Siempre se ejecuta (como finally)

## 🚀 COMANDOS PARA EJECUTAR EL LABORATORIO

### Paso 1: Navegar al proyecto
```bash
cd LAB1-HttpClient-CRUD/provias-httpclient-app
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Instalar JSON Server (si no está instalado)
```bash
npm install -g json-server
```

### Paso 4: Ejecutar la aplicación completa
```bash
# Comando que ejecuta JSON Server y Angular en paralelo
npm run dev
```

**O ejecutar por separado:**

```bash
# Terminal 1: JSON Server
npm run server

# Terminal 2: Angular
ng serve
```

### Paso 5: Verificar funcionamiento
- **Frontend Angular**: http://localhost:4200
- **API JSON Server**: http://localhost:3000/api/products
- **Admin JSON Server**: http://localhost:3000

## 📁 ESTRUCTURA DEL PROYECTO

```
LAB1-HttpClient-CRUD/
├── provias-httpclient-app/
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   └── product.model.ts          # ✅ Interfaces y tipos
│   │   │   └── services/http/
│   │   │       └── product.service.ts        # ✅ Servicio HTTP principal
│   │   ├── features/products/
│   │   │   └── product-list/
│   │   │       ├── product-list.component.ts # ✅ Componente principal
│   │   │       ├── product-list.component.html
│   │   │       └── product-list.component.scss
│   │   ├── environments/
│   │   │   ├── environment.ts                # ✅ Config producción
│   │   │   └── environment.development.ts    # ✅ Config desarrollo
│   │   └── app.config.ts                     # ✅ Configuración HttpClient
│   ├── db.json                               # ✅ Base datos JSON Server
│   ├── json-server.json                      # ✅ Config JSON Server
│   ├── routes.json                           # ✅ Rutas API
│   └── package.json                          # ✅ Scripts npm
└── README.md                                 # 📖 Esta documentación
```

## 🔧 FUNCIONALIDADES IMPLEMENTADAS

### ✅ CRUD Completo
- **CREATE**: Agregar nuevos productos con validación
- **READ**: Listar productos con filtros y búsqueda
- **UPDATE**: Editar productos existentes
- **DELETE**: Eliminar productos con confirmación

### ✅ Características Avanzadas
- **Signals reactivos**: Estado que actualiza UI automáticamente
- **Filtrado en tiempo real**: Por categoría y texto de búsqueda
- **Ordenamiento dinámico**: Por nombre, precio, stock, fecha
- **Estadísticas calculadas**: Total productos, valor inventario, stock bajo
- **Validación de datos**: Frontend y preparado para backend
- **Manejo de errores**: Mensajes amigables al usuario

### ✅ UX/UI Profesional
- **Loading states**: Indicadores de carga durante operaciones
- **Error display**: Mensajes de error claros y accionables
- **Confirmaciones**: Diálogos de confirmación para operaciones críticas
- **Formularios intuitivos**: Crear y editar con el mismo formulario
- **Responsive design**: Funciona en móvil y desktop

## 📊 API REST ENDPOINTS

El JSON Server simula una API REST completa:

### Productos
```bash
GET    /api/products          # Listar todos los productos
GET    /api/products/:id      # Obtener producto específico
POST   /api/products          # Crear nuevo producto
PUT    /api/products/:id      # Actualizar producto completo
PATCH  /api/products/:id      # Actualizar parcialmente
DELETE /api/products/:id      # Eliminar producto
```

### Filtros y Búsqueda
```bash
GET /api/products?category=laptops           # Filtrar por categoría
GET /api/products?name_like=Dell             # Buscar por nombre
GET /api/products?price_gte=100              # Precio mayor o igual
GET /api/products?_sort=price&_order=desc    # Ordenar por precio
```

## 🧪 TESTING DE LA API

### Con curl:
```bash
# Listar productos
curl http://localhost:3000/api/products

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Producto",
    "price": 299.99,
    "description": "Descripción del producto",
    "category": "laptops",
    "stock": 10
  }'

# Actualizar producto
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Producto Actualizado",
    "price": 399.99,
    "description": "Nueva descripción",
    "category": "laptops",
    "stock": 15
  }'

# Eliminar producto
curl -X DELETE http://localhost:3000/api/products/1
```

### Con navegador:
- **Ver todos**: http://localhost:3000/api/products
- **Ver uno**: http://localhost:3000/api/products/1
- **Filtrar**: http://localhost:3000/api/products?category=laptops

## 💡 EJERCICIOS EDUCATIVOS

### Ejercicio 1: Agregar nueva funcionalidad
```typescript
// En product.service.ts, agregar:
getProductsByPriceRange(min: number, max: number): Observable<Product[]> {
  const filters: ProductFilters = { minPrice: min, maxPrice: max };
  return this.getProducts(filters);
}
```

### Ejercicio 2: Implementar paginación
```typescript
// Agregar a ProductFilters:
export interface ProductFilters {
  // ... propiedades existentes
  page?: number;
  limit?: number;
}
```

### Ejercicio 3: Agregar cache local
```typescript
// En el servicio, usar localStorage:
private cacheProducts(products: Product[]): void {
  localStorage.setItem('products_cache', JSON.stringify(products));
}
```

## 🔍 DEBUGGING Y TROUBLESHOOTING

### Problema: Error de CORS
```bash
# Verificar que JSON Server esté ejecutándose en puerto 3000
npm run server

# Verificar en navegador: http://localhost:3000/api/products
```

### Problema: Componente no se actualiza
```typescript
// Verificar que estés usando signals correctamente:
products = this.productService.products; // ✅ Correcto
// NO: this.products = this.productService.products(); // ❌ Incorrecto
```

### Problema: Errores de TypeScript
```bash
# Verificar que todos los imports estén correctos
# Ejecutar ng serve para ver errores en tiempo real
ng serve
```

## 📚 CONCEPTOS AVANZADOS EXPLICADOS

### 1. **¿Por qué Observables en lugar de Promises?**

| Característica | Promises | Observables |
|---------------|----------|-------------|
| Valores múltiples | ❌ Solo uno | ✅ Múltiples |
| Cancelable | ❌ No | ✅ Sí |
| Lazy execution | ❌ Inmediata | ✅ Al suscribirse |
| Operadores | ❌ Solo .then() | ✅ 100+ operadores |
| Retry automático | ❌ Manual | ✅ Built-in |

### 2. **Signals vs BehaviorSubject**

```typescript
// ❌ Forma anterior (más compleja)
private productsSubject = new BehaviorSubject<Product[]>([]);
products$ = this.productsSubject.asObservable();

updateProducts(products: Product[]) {
  this.productsSubject.next(products);
}

// ✅ Forma nueva (más simple)
products = signal<Product[]>([]);

updateProducts(products: Product[]) {
  this.products.set(products);
}
```

### 3. **Type Safety con TypeScript**

```typescript
// ✅ El compilador verifica tipos automáticamente
this.http.get<Product[]>('/api/products') // TypeScript sabe que retorna Product[]
  .subscribe(products => {
    // products tiene tipo Product[], no any
    console.log(products[0].name); // ✅ Autocompletado
    console.log(products[0].invalid); // ❌ Error de compilación
  });
```

## 🎉 RESULTADOS ESPERADOS

Al completar este laboratorio, tendrás:

### ✅ **Conocimiento Técnico**
- Dominio completo de HttpClient
- Implementación de operaciones CRUD
- Uso avanzado de Signals
- Manejo de observables y operadores RxJS
- Validación de datos frontend

### ✅ **Aplicación Funcional**
- Sistema de gestión de productos completo
- Interfaz intuitiva y responsiva
- API REST simulada funcionando
- Filtrado y búsqueda en tiempo real
- Manejo de errores robusto

### ✅ **Mejores Prácticas**
- Separación de responsabilidades (modelos, servicios, componentes)
- Código limpio y documentado
- Tipado fuerte con TypeScript
- Arquitectura escalable
- Testing preparado

## 🚀 ¿QUÉ SIGUE?

**Siguiente laboratorio:** LAB 2 - Manejo Profesional de Errores y Estados de Carga

En el siguiente laboratorio aprenderás:
- Error handling robusto con mensajes amigables
- Loading states avanzados
- Retry strategies con backoff exponencial
- Notificaciones al usuario
- Logging para debugging

## 📞 SOPORTE

Si encuentras problemas:

1. **Verificar requisitos**: Node.js v18+, Angular CLI v18+
2. **Revisar logs**: Consola del navegador y terminal
3. **Comprobar API**: http://localhost:3000/api/products debe responder
4. **Consultar documentación**: README.md de cada carpeta

---

**¡Excelente trabajo implementando HttpClient profesional en Angular v18! 🎉**

*Este laboratorio te da la base sólida para comunicarte con cualquier API REST del mundo real.*
