/**
 * MODELO DE PRODUCTO - LAB 2: Manejo de Errores
 * 
 * Este archivo define las interfaces y tipos para el manejo de productos
 * en la aplicación PROVIAS con enfoque en manejo robusto de errores.
 * 
 * CONCEPTOS EDUCATIVOS:
 * - Interfaces: Contratos que definen la estructura de los datos
 * - DTOs (Data Transfer Objects): Objetos optimizados para transferencia
 * - Error Handling: Validaciones y manejo de errores profesional
 * - Type Safety: Tipado estricto para prevenir errores en runtime
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
 * Filtros de búsqueda para productos
 * 
 * ¿Por qué todas las propiedades opcionales?
 * - Permite búsquedas flexibles (por categoría, por precio, etc.)
 * - Se pueden combinar múltiples filtros
 * - Facilita la implementación de formularios de filtro
 */
export interface ProductFilters {
  category?: string;              // Filtrar por categoría específica
  minPrice?: number;              // Precio mínimo
  maxPrice?: number;              // Precio máximo
  search?: string;                // Texto de búsqueda (nombre/descripción)
  inStock?: boolean;              // Solo productos en stock
  sortBy?: 'name' | 'price' | 'stock' | 'createdAt'; // Campo por el cual ordenar
  sortOrder?: 'asc' | 'desc';     // Orden ascendente o descendente
}

/**
 * Respuesta estándar de la API
 * 
 * ¿Por qué estandarizar las respuestas?
 * - Consistencia en toda la aplicación
 * - Manejo de errores uniforme
 * - Metadatos útiles para debugging
 */
export interface ApiResponse<T> {
  success: boolean;               // Indica si la operación fue exitosa
  data?: T;                       // Datos de respuesta (opcional si hay error)
  message?: string;               // Mensaje descriptivo
  error?: string;                 // Mensaje de error (si aplica)
  timestamp: string;              // Momento de la respuesta
}

/**
 * Categorías de productos disponibles
 * 
 * ¿Por qué usar un tipo union?
 * - Type safety: Solo valores permitidos
 * - Autocompletado en el IDE
 * - Fácil mantenimiento (agregar/quitar categorías)
 */
export type ProductCategory = 
  | 'laptops' 
  | 'monitors' 
  | 'accessories' 
  | 'components' 
  | 'software'
  | 'networking'
  | 'storage';

/**
 * Estadísticas de productos
 * 
 * ¿Para qué sirven las estadísticas?
 * - Dashboard analytics
 * - Reportes de inventario
 * - Alertas de stock
 */
export interface ProductStatistics {
  total: number;                  // Total de productos
  totalValue: number;             // Valor total del inventario
  categories: number;             // Número de categorías diferentes
  outOfStock: number;             // Productos sin stock
  lowStock: number;               // Productos con stock bajo (<10)
  averagePrice: number;           // Precio promedio
  mostExpensive: Product | null;  // Producto más caro
  cheapest: Product | null;       // Producto más barato
}

/**
 * Función para crear un producto vacío
 * 
 * ¿Por qué una función factory?
 * - Valores por defecto consistentes
 * - Fácil crear nuevos productos en formularios
 * - Evita repetir código
 */
export function createEmptyProduct(): CreateProductDto {
  return {
    name: '',
    price: 0,
    description: '',
    category: 'accessories',       // Categoría por defecto
    stock: 0,
    imageUrl: ''
  };
}

/**
 * Validaciones para productos - LAB 2: MANEJO DE ERRORES
 * 
 * Estas funciones implementan validaciones robustas con manejo de errores
 */

/**
 * Validar datos para crear producto
 */
export function validateCreateProduct(product: CreateProductDto): string[] {
  const errors: string[] = [];
  
  // Validar nombre
  if (!product.name || !product.name.trim()) {
    errors.push('El nombre del producto es requerido');
  } else if (product.name.trim().length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres');
  } else if (product.name.trim().length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }
  
  // Validar precio
  if (product.price === undefined || product.price === null) {
    errors.push('El precio es requerido');
  } else if (product.price <= 0) {
    errors.push('El precio debe ser mayor a 0');
  } else if (product.price > 999999) {
    errors.push('El precio no puede exceder $999,999');
  }
  
  // Validar descripción
  if (!product.description || !product.description.trim()) {
    errors.push('La descripción es requerida');
  } else if (product.description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  } else if (product.description.trim().length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }
  
  // Validar categoría
  const validCategories: ProductCategory[] = ['laptops', 'monitors', 'accessories', 'components', 'software', 'networking', 'storage'];
  if (!product.category || !validCategories.includes(product.category as ProductCategory)) {
    errors.push('Debe seleccionar una categoría válida');
  }
  
  // Validar stock
  if (product.stock === undefined || product.stock === null) {
    errors.push('El stock es requerido');
  } else if (product.stock < 0) {
    errors.push('El stock no puede ser negativo');
  } else if (product.stock > 9999) {
    errors.push('El stock no puede exceder 9,999 unidades');
  }
  
  // Validar URL de imagen (opcional)
  if (product.imageUrl && product.imageUrl.trim()) {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(product.imageUrl.trim())) {
      errors.push('La URL de imagen debe ser válida y terminar en .jpg, .jpeg, .png, .gif o .webp');
    }
  }
  
  return errors;
}

/**
 * Validar datos para actualizar producto
 */
export function validateUpdateProduct(product: UpdateProductDto): string[] {
  const errors: string[] = [];
  
  // El ID es requerido para actualización
  if (!product.id) {
    errors.push('El ID del producto es requerido para actualización');
  }
  
  // Validar solo los campos que están presentes (partial update)
  if (product.name !== undefined) {
    if (!product.name.trim()) {
      errors.push('El nombre no puede estar vacío');
    } else if (product.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    } else if (product.name.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }
  }
  
  if (product.price !== undefined) {
    if (product.price <= 0) {
      errors.push('El precio debe ser mayor a 0');
    } else if (product.price > 999999) {
      errors.push('El precio no puede exceder $999,999');
    }
  }
  
  if (product.description !== undefined) {
    if (!product.description.trim()) {
      errors.push('La descripción no puede estar vacía');
    } else if (product.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    } else if (product.description.trim().length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }
  }
  
  if (product.category !== undefined) {
    const validCategories: ProductCategory[] = ['laptops', 'monitors', 'accessories', 'components', 'software', 'networking', 'storage'];
    if (!validCategories.includes(product.category as ProductCategory)) {
      errors.push('Debe seleccionar una categoría válida');
    }
  }
  
  if (product.stock !== undefined) {
    if (product.stock < 0) {
      errors.push('El stock no puede ser negativo');
    } else if (product.stock > 9999) {
      errors.push('El stock no puede exceder 9,999 unidades');
    }
  }
  
  if (product.imageUrl !== undefined && product.imageUrl.trim()) {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(product.imageUrl.trim())) {
      errors.push('La URL de imagen debe ser válida y terminar en .jpg, .jpeg, .png, .gif o .webp');
    }
  }
  
  return errors;
}

/**
 * Función legacy - mantener compatibilidad
 */
export function validateProduct(product: CreateProductDto): string[] {
  return validateCreateProduct(product);
}
