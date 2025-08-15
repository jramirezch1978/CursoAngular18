/**
 * MODELO DE PRODUCTO - LAB 1: HttpClient y CRUD
 * 
 * Este archivo define las interfaces y tipos para el manejo de productos
 * en la aplicación PROVIAS. Cada interface tiene un propósito específico
 * en el flujo de datos HTTP.
 * 
 * CONCEPTOS EDUCATIVOS:
 * - Interfaces: Contratos que definen la estructura de los datos
 * - DTOs (Data Transfer Objects): Objetos optimizados para transferencia
 * - Partial<T>: Tipo que hace todas las propiedades opcionales
 * - Union Types: Tipos que pueden ser uno de varios valores
 */

/**
 * Interface principal del Producto
 * 
 * ¿Por qué id es opcional?
 * - Al crear un producto nuevo, aún no tiene ID (lo asigna el servidor)
 * - Al editar un producto existente, sí debe tener ID
 * - Esta flexibilidad permite usar la misma interface para ambos casos
 */
export interface Product {
  id?: string | number;           // ID único del producto (string para JSON Server, number para APIs reales)
  name: string;                   // Nombre del producto (requerido)
  price: number;                  // Precio en formato decimal (requerido)
  description: string;            // Descripción detallada (requerida)
  category: string;               // Categoría del producto (requerida)
  stock: number;                  // Cantidad en inventario (requerida)
  imageUrl?: string;              // URL de la imagen (opcional)
  createdAt?: string;             // Fecha de creación (la asigna el servidor)
  updatedAt?: string;             // Fecha de última actualización (la asigna el servidor)
}

/**
 * DTO para crear un nuevo producto
 * 
 * ¿Por qué un DTO separado?
 * - Solo incluye campos que el cliente puede/debe enviar
 * - Excluye id, createdAt, updatedAt (los maneja el servidor)
 * - Hace el código más claro sobre qué datos son necesarios
 */
export interface CreateProductDto {
  name: string;                   // Nombre del producto a crear
  price: number;                  // Precio del producto
  description: string;            // Descripción del producto
  category: string;               // Categoría a la que pertenece
  stock: number;                  // Cantidad inicial en stock
  imageUrl?: string;              // URL de imagen (opcional)
}

/**
 * DTO para actualizar un producto existente
 * 
 * ¿Por qué extends Partial<CreateProductDto>?
 * - Partial hace que todas las propiedades sean opcionales
 * - Permite actualizaciones parciales (solo cambiar precio, por ejemplo)
 * - Más eficiente en ancho de banda (no envías datos innecesarios)
 */
export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string | number;            // ID es requerido para saber qué actualizar (string o number para compatibilidad)
}

/**
 * Interface para respuestas paginadas
 * 
 * ¿Por qué usar genéricos (<T>)?
 * - La misma estructura sirve para productos, usuarios, órdenes, etc.
 * - Type safety: TypeScript sabe que data es un array de T
 * - Reutilización: Una interface para múltiples tipos de datos
 */
export interface PaginatedResponse<T> {
  data: T[];                      // Array de elementos del tipo especificado
  total: number;                  // Total de elementos en la base de datos
  page: number;                   // Página actual (empezando en 1)
  limit: number;                  // Elementos por página
  totalPages: number;             // Total de páginas disponibles
}

/**
 * Interface para filtros de búsqueda
 * 
 * ¿Por qué todas las propiedades son opcionales?
 * - Un filtro vacío significa "mostrar todos"
 * - Cada filtro se aplica solo si tiene valor
 * - Flexibilidad máxima para el usuario final
 */
export interface ProductFilters {
  category?: string;              // Filtrar por categoría específica
  minPrice?: number;              // Precio mínimo (inclusive)
  maxPrice?: number;              // Precio máximo (inclusive)
  search?: string;                // Búsqueda de texto en nombre/descripción
  inStock?: boolean;              // Solo productos con stock > 0
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt';  // Campo para ordenamiento
  sortOrder?: 'asc' | 'desc';     // Dirección del ordenamiento
}

/**
 * Interface para respuesta estándar de la API
 * 
 * ¿Por qué estandarizar las respuestas?
 * - Consistencia: todas las APIs responden igual
 * - Manejo de errores: success indica si fue exitosa
 * - Metadata: timestamp para auditoria
 * - Debugging: message para información adicional
 */
export interface ApiResponse<T> {
  success: boolean;               // Indica si la operación fue exitosa
  data?: T;                       // Datos de respuesta (opcional si hubo error)
  message?: string;               // Mensaje descriptivo o de error
  error?: string;                 // Detalles del error (si lo hay)
  timestamp: string;              // Momento de la respuesta (para logs)
}

/**
 * Interface para estadísticas de productos
 * 
 * ¿Por qué calcular estadísticas en el frontend?
 * - Mejor UX: cálculos instantáneos
 * - Menos carga al servidor: se calcula con datos ya descargados
 * - Interactividad: estadísticas actualizadas al filtrar
 */
export interface ProductStatistics {
  total: number;                  // Total de productos
  totalValue: number;             // Valor total del inventario (precio * stock)
  categories: number;             // Número de categorías diferentes
  outOfStock: number;             // Productos sin stock
  lowStock: number;               // Productos con stock bajo (< 10)
  averagePrice: number;           // Precio promedio de productos
}

/**
 * Enum para categorías de productos
 * 
 * ¿Por qué usar un enum?
 * - Evita errores de tipeo en las categorías
 * - IntelliSense: autocompletado automático
 * - Refactoring: cambiar una categoría actualiza todo el código
 * - Validación: TypeScript verifica que uses valores válidos
 */
export enum ProductCategory {
  LAPTOPS = 'laptops',
  MONITORS = 'monitors',
  ACCESSORIES = 'accessories',
  TABLETS = 'tablets',
  COMPONENTS = 'components',
  SOFTWARE = 'software'
}

/**
 * Type guard para verificar si un objeto es un Product válido
 * 
 * ¿Qué es un type guard?
 * - Función que verifica tipos en runtime
 * - Útil cuando recibes datos externos (APIs, localStorage)
 * - TypeScript entiende el tipo después de la verificación
 * - Previene errores por datos mal formados
 */
export function isProduct(obj: any): obj is Product {
  return obj && 
         typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         typeof obj.price === 'number' &&
         typeof obj.description === 'string' &&
         typeof obj.category === 'string' &&
         typeof obj.stock === 'number';
}

/**
 * Función helper para crear un producto vacío
 * 
 * ¿Por qué una función factory?
 * - Valores por defecto consistentes
 * - Evita repetir la misma estructura
 * - Fácil de modificar si cambian los defaults
 * - Menos propenso a errores de tipeo
 */
export function createEmptyProduct(): CreateProductDto {
  return {
    name: '',
    price: 0,
    description: '',
    category: ProductCategory.LAPTOPS,
    stock: 0,
    imageUrl: ''
  };
}

/**
 * Función helper para validar un producto antes de enviarlo
 * 
 * ¿Por qué validar en el frontend?
 * - Feedback inmediato al usuario
 * - Menos peticiones fallidas al servidor
 * - Mejor UX que esperar respuesta del servidor
 * - El servidor aún debe validar (nunca confiar solo en frontend)
 */
// ========================================
// FUNCIONES DE VALIDACIÓN
// ========================================

/**
 * Validar datos para crear producto
 */
export function validateCreateProduct(product: CreateProductDto): string[] {
  const errors: string[] = [];
  
  if (!product.name?.trim()) {
    errors.push('El nombre del producto es requerido');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }
  
  if (!product.description?.trim()) {
    errors.push('La descripción del producto es requerida');
  }
  
  if (!product.category?.trim()) {
    errors.push('La categoría del producto es requerida');
  }
  
  if (product.stock !== undefined && product.stock < 0) {
    errors.push('El stock no puede ser negativo');
  }
  
  return errors;
}

/**
 * Validar datos para actualizar producto
 */
export function validateUpdateProduct(product: UpdateProductDto): string[] {
  const errors: string[] = [];
  
  if (product.name !== undefined && !product.name.trim()) {
    errors.push('El nombre del producto no puede estar vacío');
  }
  
  if (product.price !== undefined && product.price <= 0) {
    errors.push('El precio debe ser mayor a 0');
  }
  
  if (product.description !== undefined && !product.description.trim()) {
    errors.push('La descripción no puede estar vacía');
  }
  
  if (product.category !== undefined && !product.category.trim()) {
    errors.push('La categoría no puede estar vacía');
  }
  
  if (product.stock !== undefined && product.stock < 0) {
    errors.push('El stock no puede ser negativo');
  }
  
  return errors;
}

/**
 * Validar datos genéricos de producto (compatibilidad)
 */
export function validateProduct(product: CreateProductDto): string[] {
  return validateCreateProduct(product);
}
