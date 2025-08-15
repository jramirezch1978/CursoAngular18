/**
 * PRODUCT SERVICE - LAB 1: HttpClient y CRUD Completo
 * 
 * Este servicio implementa todas las operaciones CRUD (Create, Read, Update, Delete)
 * para la gestión de productos usando HttpClient y programación reactiva con Signals.
 * 
 * CONCEPTOS EDUCATIVOS CLAVE:
 * 
 * 1. INYECCIÓN DE DEPENDENCIAS:
 *    - inject() es la forma moderna de inyectar servicios en Angular 16+
 *    - Más limpio que constructor injection
 *    - Permite inyección condicional y en funciones
 * 
 * 2. SIGNALS (NUEVO EN ANGULAR 16+):
 *    - Estado reactivo que notifica automáticamente cuando cambia
 *    - Más eficiente que RxJS para estado simple
 *    - Computed signals se recalculan automáticamente
 * 
 * 3. OBSERVABLES vs PROMISES:
 *    - Observables son lazy (no se ejecutan hasta suscribirse)
 *    - Permiten cancelación, retry, transformación
 *    - Múltiples valores a lo largo del tiempo
 * 
 * 4. OPERADORES RXJS:
 *    - tap(): side effects sin modificar el stream
 *    - catchError(): manejo de errores sin romper el flujo
 *    - shareReplay(): cache de la última emisión
 *    - map(): transformación de datos
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, retry, delay, shareReplay, finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
  ProductStatistics,
  validateProduct,
  validateCreateProduct,
  validateUpdateProduct
} from '../../models/product.model';

/**
 * SERVICIO DE PRODUCTOS CON GESTIÓN DE ESTADO REACTIVO
 * 
 * ¿Por qué providedIn: 'root'?
 * - Hace el servicio un singleton global
 * - Angular lo inyecta automáticamente donde se necesite
 * - Se crea solo una instancia para toda la aplicación
 * - Evita problemas de estado compartido
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // ========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ========================================
  
  /**
   * HttpClient: Cliente HTTP oficial de Angular
   * ¿Por qué no usar fetch() nativo?
   * - Integración automática con interceptors
   * - Soporte completo para TypeScript
   * - Retorna Observables (más potentes que Promises)
   * - Manejo automático de JSON
   */
  private readonly http = inject(HttpClient);
  
  /**
   * URL base de la API desde variables de entorno
   * ¿Por qué usar environment?
   * - Diferentes URLs para desarrollo/producción
   * - Cambios sin recompilar
   * - Configuración centralizada
   */
  private readonly apiUrl = `${environment.apiUrl}/products`;
  
  // ========================================
  // ESTADO REACTIVO CON SIGNALS
  // ========================================
  
  /**
   * Signals para manejo de estado reactivo
   * ¿Por qué signals en lugar de variables normales?
   * - Notificación automática de cambios
   * - Componentes se actualizan automáticamente
   * - Mejor rendimiento (change detection optimizada)
   * - Menos boilerplate que BehaviorSubject
   */
  
  // Estado de los productos cargados
  private productsSignal = signal<Product[]>([]);
  
  // Estado de loading global
  private loadingSignal = signal<boolean>(false);
  
  // Estado de errores
  private errorSignal = signal<string | null>(null);
  
  // Producto seleccionado actualmente
  private selectedProductSignal = signal<Product | null>(null);
  
  // Filtros aplicados actualmente
  private currentFiltersSignal = signal<ProductFilters>({});
  
  // ========================================
  // COMPUTED SIGNALS (DERIVADOS)
  // ========================================
  
  /**
   * Computed signals: se recalculan automáticamente cuando sus dependencias cambian
   * ¿Por qué usar computed?
   * - Cálculos automáticos sin código manual
   * - Memoización automática (no recalcula si no es necesario)
   * - Declarativo en lugar de imperativo
   */
  
  // Signals públicos para que los componentes los consuman
  products = computed(() => this.productsSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  selectedProduct = computed(() => this.selectedProductSignal());
  currentFilters = computed(() => this.currentFiltersSignal());
  
  // Estadísticas calculadas automáticamente
  statistics = computed((): ProductStatistics => {
    const products = this.productsSignal();
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const uniqueCategories = new Set(products.map(p => p.category)).size;
    
    return {
      total: products.length,
      totalValue: totalValue,
      categories: uniqueCategories,
      outOfStock: products.filter(p => p.stock === 0).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
      averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0
    };
  });
  
  // Productos filtrados (aplicando filtros actuales)
  filteredProducts = computed(() => {
    const products = this.productsSignal();
    const filters = this.currentFiltersSignal();
    
    return this.applyFilters(products, filters);
  });
  
  // ========================================
  // CONFIGURACIÓN HTTP
  // ========================================
  
  /**
   * Headers HTTP estándar para todas las peticiones
   * ¿Por qué centralizar headers?
   * - Consistencia en todas las peticiones
   * - Fácil modificación global
   * - Evita repetir código
   */
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-App-Version': environment.version || '1.0.0'
      })
    };
  }
  
  // ========================================
  // OPERACIONES CRUD - READ (GET)
  // ========================================
  
  /**
   * OBTENER TODOS LOS PRODUCTOS
   * 
   * ¿Por qué retornar Observable en lugar de Promise?
   * - Cancelable: si el usuario navega a otra página
   * - Retry automático: si falla la conexión
   * - Transformaciones: pipe con operadores RxJS
   * - Múltiples suscriptores: shareReplay permite compartir
   */
  getProducts(filters?: ProductFilters): Observable<Product[]> {
    // Activar loading state
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    // Construir parámetros de consulta de forma segura
    let params = new HttpParams();
    
    if (filters) {
      // Guardar filtros actuales
      this.currentFiltersSignal.set(filters);
      
      // Convertir filtros a parámetros HTTP
      params = this.buildHttpParams(filters);
    }
    
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      // Actualizar estado con los productos recibidos
      tap(products => {
        this.productsSignal.set(products);
        console.log(`✅ Cargados ${products.length} productos desde la API`);
      }),
      
      // Manejo de errores sin romper el flujo
      catchError(error => {
        this.handleError('Error al cargar productos', error);
        return throwError(() => error);
      }),
      
      // Siempre ejecutar al final (exitoso o con error)
      finalize(() => {
        this.loadingSignal.set(false);
      }),
      
      // Compartir resultado con múltiples suscriptores
      shareReplay(1)
    );
  }
  
  /**
   * OBTENER UN PRODUCTO POR ID
   * 
   * Template literals (${id}) vs concatenación:
   * - Más legible: `productos/${id}` vs 'productos/' + id
   * - Menos propenso a errores
   * - Mejor performance (optimizado por JS engine)
   */
  getProduct(id: string | number): Observable<Product> {
    this.loadingSignal.set(true);
    
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => {
        this.selectedProductSignal.set(product);
        console.log(`✅ Producto cargado: ${product.name}`);
      }),
      catchError(error => {
        this.handleError(`Error al cargar producto con ID ${id}`, error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
  
  /**
   * BÚSQUEDA DE PRODUCTOS CON DEBOUNCING
   * 
   * ¿Qué es debouncing?
   * - Esperar a que el usuario termine de escribir
   * - Evita hacer una petición por cada letra
   * - Mejor UX y menos carga al servidor
   */
  searchProducts(term: string, filters?: ProductFilters): Observable<Product[]> {
    // No buscar con términos muy cortos
    if (!term || term.length < 2) {
      return of([]);
    }
    
    const searchFilters: ProductFilters = {
      ...filters,
      search: term
    };
    
    return this.getProducts(searchFilters);
  }
  
  // ========================================
  // OPERACIONES CRUD - CREATE (POST)
  // ========================================
  
  /**
   * CREAR NUEVO PRODUCTO
   * 
   * ¿Por qué validar en el frontend?
   * - Feedback inmediato al usuario
   * - Menos peticiones fallidas
   * - Mejor UX que esperar respuesta del servidor
   * Nota: ¡El servidor SIEMPRE debe validar también!
   */
  createProduct(dto: CreateProductDto): Observable<Product> {
    // Validar datos antes de enviar
    const validationErrors = validateProduct(dto);
    if (validationErrors.length > 0) {
      const errorMessage = 'Datos inválidos: ' + validationErrors.join(', ');
      this.errorSignal.set(errorMessage);
      return throwError(() => new Error(errorMessage));
    }
    
    this.loadingSignal.set(true);
    
    // Preparar datos para envío (agregar timestamps)
    const newProduct = {
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return this.http.post<Product>(this.apiUrl, newProduct, this.getHttpOptions()).pipe(
      tap(product => {
        // Actualizar lista local sin hacer nueva petición
        this.productsSignal.update(products => [...products, product]);
        console.log(`✅ Producto creado: ${product.name} (ID: ${product.id})`);
      }),
      catchError(error => {
        this.handleError('Error al crear producto', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
  
  // ========================================
  // OPERACIONES CRUD - UPDATE (PUT/PATCH)
  // ========================================
  
  /**
   * ACTUALIZAR PRODUCTO COMPLETO (PUT)
   * 
   * PUT vs PATCH:
   * - PUT: reemplaza el recurso completo
   * - PATCH: actualiza solo campos específicos
   * - PUT es idempotente (misma operación = mismo resultado)
   */
  updateProduct(id: string | number, dto: UpdateProductDto): Observable<Product> {
    const validationErrors = validateUpdateProduct(dto);
    if (validationErrors.length > 0) {
      const errorMessage = 'Datos inválidos: ' + validationErrors.join(', ');
      this.errorSignal.set(errorMessage);
      return throwError(() => new Error(errorMessage));
    }
    
    this.loadingSignal.set(true);
    
    const updatedProduct = {
      ...dto,
      id,
      updatedAt: new Date().toISOString()
    };
    
    return this.http.put<Product>(`${this.apiUrl}/${id}`, updatedProduct, this.getHttpOptions()).pipe(
      tap(product => {
        // Actualizar en la lista local
        this.productsSignal.update(products => 
          products.map(p => String(p.id) === String(id) ? product : p)
        );
        
        // Si es el producto seleccionado, actualizarlo también
        if (String(this.selectedProductSignal()?.id) === String(id)) {
          this.selectedProductSignal.set(product);
        }
        
        console.log(`✅ Producto actualizado: ${product.name} (ID: ${id})`);
      }),
      catchError(error => {
        this.handleError(`Error al actualizar producto ${id}`, error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
  
  /**
   * ACTUALIZACIÓN PARCIAL (PATCH)
   * 
   * ¿Cuándo usar PATCH?
   * - Solo quieres cambiar precio
   * - Solo quieres actualizar stock
   * - Más eficiente en ancho de banda
   * - Menos riesgo de conflictos concurrentes
   */
  patchProduct(id: string | number, changes: Partial<Product>): Observable<Product> {
    this.loadingSignal.set(true);
    
    const patch = {
      ...changes,
      updatedAt: new Date().toISOString()
    };
    
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, patch, this.getHttpOptions()).pipe(
      tap(product => {
        this.productsSignal.update(products => 
          products.map(p => String(p.id) === String(id) ? product : p)
        );
        
        if (String(this.selectedProductSignal()?.id) === String(id)) {
          this.selectedProductSignal.set(product);
        }
        
        console.log(`✅ Producto parcialmente actualizado: ${product.name} (ID: ${id})`);
      }),
      catchError(error => {
        this.handleError(`Error al actualizar parcialmente producto ${id}`, error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
  
  /**
   * ACTUALIZAR SOLO EL STOCK (caso común)
   * 
   * ¿Por qué un método específico para stock?
   * - Operación muy común en inventarios
   * - API más clara: updateStock(id, 50)
   * - Posibilidad de lógica específica (validaciones, logs)
   */
  updateStock(id: string | number, quantity: number): Observable<Product> {
    if (quantity < 0) {
      const errorMessage = 'El stock no puede ser negativo';
      this.errorSignal.set(errorMessage);
      return throwError(() => new Error(errorMessage));
    }
    
    return this.patchProduct(id, { stock: quantity });
  }
  
  // ========================================
  // OPERACIONES CRUD - DELETE
  // ========================================
  
  /**
   * ELIMINAR PRODUCTO
   * 
   * ¿Por qué void en lugar de Product?
   * - DELETE típicamente no retorna el objeto eliminado
   * - Solo necesitamos confirmación de que se eliminó
   * - Menos ancho de banda
   */
  deleteProduct(id: string | number): Observable<void> {
    this.loadingSignal.set(true);
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remover de la lista local
        this.productsSignal.update(products => 
          products.filter(p => String(p.id) !== String(id))
        );
        
        // Si era el producto seleccionado, limpiar selección
        if (String(this.selectedProductSignal()?.id) === String(id)) {
          this.selectedProductSignal.set(null);
        }
        
        console.log(`✅ Producto eliminado con ID: ${id}`);
      }),
      catchError(error => {
        this.handleError(`Error al eliminar producto ${id}`, error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingSignal.set(false);
      })
    );
  }
  
  // ========================================
  // OPERACIONES DE ESTADO
  // ========================================
  
  /**
   * SELECCIONAR UN PRODUCTO
   * 
   * ¿Por qué un método para esto?
   * - Centraliza la lógica de selección
   * - Permite logging/analytics
   * - Fácil agregar validaciones futuras
   */
  selectProduct(product: Product | null): void {
    this.selectedProductSignal.set(product);
    if (product) {
      console.log(`🎯 Producto seleccionado: ${product.name}`);
    }
  }
  
  /**
   * LIMPIAR SELECCIÓN
   */
  clearSelection(): void {
    this.selectedProductSignal.set(null);
  }
  
  /**
   * LIMPIAR ERROR
   */
  clearError(): void {
    this.errorSignal.set(null);
  }
  
  /**
   * APLICAR FILTROS LOCALMENTE
   * 
   * ¿Por qué filtrar en el frontend?
   * - Respuesta instantánea (UX)
   * - Menos carga al servidor
   * - Permite filtros complejos sin modificar API
   */
  setFilters(filters: ProductFilters): void {
    this.currentFiltersSignal.set(filters);
  }
  
  // ========================================
  // MÉTODOS UTILITARIOS PRIVADOS
  // ========================================
  
  /**
   * CONSTRUIR PARÁMETROS HTTP DESDE FILTROS
   * 
   * ¿Por qué HttpParams en lugar de string?
   * - Encoding automático de caracteres especiales
   * - Type safety
   * - Menos propenso a errores de sintaxis
   */
  private buildHttpParams(filters: ProductFilters): HttpParams {
    let params = new HttpParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Mapear parámetros de Angular a JSON Server
        let paramKey = key;
        
        // JSON Server usa _sort en lugar de sortBy
        if (key === 'sortBy') {
          paramKey = '_sort';
        }
        
        // JSON Server usa _order en lugar de sortOrder
        if (key === 'sortOrder') {
          paramKey = '_order';
        }
        
        // JSON Server usa q en lugar de search
        if (key === 'search') {
          paramKey = 'q';
        }
        
        params = params.set(paramKey, value.toString());
      }
    });
    
    return params;
  }
  
  /**
   * APLICAR FILTROS A UN ARRAY DE PRODUCTOS
   * 
   * Esta función implementa filtrado local para:
   * - Feedback instantáneo mientras se tipea
   * - Reducir carga al servidor
   * - Trabajar offline con datos cacheados
   */
  private applyFilters(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Filtro por categoría
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Filtro por precio mínimo
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      
      // Filtro por precio máximo
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }
      
      // Filtro por productos en stock
      if (filters.inStock && product.stock <= 0) {
        return false;
      }
      
      // Filtro por texto de búsqueda (nombre y descripción)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description.toLowerCase().includes(searchTerm);
        
        if (!nameMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Aplicar ordenamiento si está especificado
      if (!filters.sortBy) return 0;
      
      const direction = filters.sortOrder === 'desc' ? -1 : 1;
      
      switch (filters.sortBy) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'price':
          return direction * (a.price - b.price);
        case 'stock':
          return direction * (a.stock - b.stock);
        case 'createdAt':
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return direction * (dateA - dateB);
        default:
          return 0;
      }
    });
  }
  
  /**
   * MANEJO CENTRALIZADO DE ERRORES
   * 
   * ¿Por qué centralizar el manejo de errores?
   * - Consistencia en mensajes
   * - Logging centralizado
   * - Fácil modificar comportamiento global
   * - Separación de responsabilidades
   */
  private handleError(context: string, error: HttpErrorResponse): void {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    // Verificar si es error del cliente o servidor
    if (error.status === 0 || !error.status) {
      // Error del cliente (red, sin conexión, etc.)
      errorMessage = `Error de conexión: No se pudo conectar con el servidor`;
    } else {
      // Error del servidor
      errorMessage = this.getServerErrorMessage(error.status, error.message);
    }
    
    // Actualizar estado de error
    this.errorSignal.set(errorMessage);
    
    // Log detallado para debugging
    console.error(`🔴 ${context}:`, {
      timestamp: new Date().toISOString(),
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: errorMessage,
      originalError: error
    });
  }
  
  /**
   * CONVERTIR CÓDIGOS HTTP A MENSAJES AMIGABLES
   * 
   * ¿Por qué traducir códigos de error?
   * - Los usuarios no entienden "Error 404"
   * - Mensajes accionables mejoran UX
   * - Consistencia en la comunicación
   */
  private getServerErrorMessage(status: number, defaultMessage: string): string {
    const errorMessages: Record<number, string> = {
      400: 'Los datos enviados no son válidos. Por favor revise el formulario.',
      401: 'No está autorizado. Por favor inicie sesión nuevamente.',
      403: 'No tiene permisos para realizar esta operación.',
      404: 'El producto solicitado no fue encontrado.',
      409: 'El producto ya existe o hay un conflicto con la información.',
      422: 'Los datos no cumplen con los requisitos. Verifique los campos.',
      429: 'Demasiadas solicitudes. Por favor espere un momento e intente de nuevo.',
      500: 'Error interno del servidor. El equipo técnico ha sido notificado.',
      502: 'El servidor no está disponible temporalmente.',
      503: 'El servicio está en mantenimiento. Intente más tarde.',
      504: 'El servidor tardó demasiado en responder. Intente nuevamente.'
    };
    
    return errorMessages[status] || `Error ${status}: ${defaultMessage}`;
  }
}
