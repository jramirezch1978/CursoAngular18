/**
 * PRODUCT SERVICE - LAB 2: Manejo Profesional de Errores
 * 
 * Este servicio implementa todas las operaciones CRUD con enfoque especial
 * en manejo robusto de errores, estados de carga y estrategias de retry.
 * 
 * CONCEPTOS EDUCATIVOS - LAB 2:
 * 
 * 1. MANEJO DE ERRORES ROBUSTO:
 *    - ErrorHandling centralizado y consistente
 *    - Retry strategies con backoff exponencial
 *    - Recovery automático de fallos temporales
 *    - User feedback apropiado para cada tipo de error
 * 
 * 2. LOADING STATES GRANULARES:
 *    - Loading por operación (create, read, update, delete)
 *    - Estados globales y específicos
 *    - Progress tracking para operaciones largas
 * 
 * 3. RETRY STRATEGIES:
 *    - Exponential backoff
 *    - Intelligent retry (basado en tipo de error)
 *    - Max attempts configurables
 *    - Jitter para evitar thundering herd
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject, timer } from 'rxjs';
import { 
  catchError, 
  map, 
  tap, 
  retry, 
  retryWhen, 
  delay, 
  shareReplay, 
  finalize,
  take,
  concatMap,
  delayWhen
} from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
  ProductStatistics,
  validateCreateProduct,
  validateUpdateProduct
} from '../../models/product.model';

/**
 * Configuración para retry strategies
 */
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  excludedStatusCodes: number[];
}

/**
 * Estados de loading por operación
 */
interface LoadingStates {
  list: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  individual: boolean;
}

/**
 * Contexto de error para debugging
 */
interface ErrorContext {
  operation: string;
  url: string;
  timestamp: string;
  retryCount?: number;
  userAgent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // ========================================
  // INYECCIÓN DE DEPENDENCIAS
  // ========================================
  
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;
  
  // ========================================
  // CONFIGURACIÓN DE RETRY
  // ========================================
  
  private readonly retryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    excludedStatusCodes: [400, 401, 403, 404, 422] // No reintentar errores del cliente
  };
  
  // ========================================
  // ESTADO REACTIVO CON SIGNALS
  // ========================================
  
  // Estado de productos
  private productsSignal = signal<Product[]>([]);
  private selectedProductSignal = signal<Product | null>(null);
  
  // Estados de loading granulares
  private loadingStatesSignal = signal<LoadingStates>({
    list: false,
    create: false,
    update: false,
    delete: false,
    individual: false
  });
  
  // Estados de error
  private errorSignal = signal<string | null>(null);
  private lastErrorContextSignal = signal<ErrorContext | null>(null);
  
  // Filtros actuales
  private currentFiltersSignal = signal<ProductFilters>({});
  
  // ========================================
  // COMPUTED SIGNALS PÚBLICOS
  // ========================================
  
  products = computed(() => this.productsSignal());
  selectedProduct = computed(() => this.selectedProductSignal());
  loading = computed(() => this.loadingStatesSignal());
  error = computed(() => this.errorSignal());
  lastErrorContext = computed(() => this.lastErrorContextSignal());
  currentFilters = computed(() => this.currentFiltersSignal());
  
  // Loading states específicos
  isLoadingList = computed(() => this.loadingStatesSignal().list);
  isCreating = computed(() => this.loadingStatesSignal().create);
  isUpdating = computed(() => this.loadingStatesSignal().update);
  isDeleting = computed(() => this.loadingStatesSignal().delete);
  isLoadingIndividual = computed(() => this.loadingStatesSignal().individual);
  
  // Loading global
  isLoading = computed(() => {
    const states = this.loadingStatesSignal();
    return states.list || states.create || states.update || states.delete || states.individual;
  });
  
  // Estadísticas computadas
  statistics = computed(() => {
    const products = this.productsSignal();
    return {
      total: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      categories: [...new Set(products.map(p => p.category))].length,
      outOfStock: products.filter(p => p.stock === 0).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
      averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
      mostExpensive: products.reduce((max, p) => !max || p.price > max.price ? p : max, null as Product | null),
      cheapest: products.reduce((min, p) => !min || p.price < min.price ? p : min, null as Product | null)
    };
  });
  
  // ========================================
  // HEADERS Y CONFIGURACIÓN HTTP
  // ========================================
  
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-App-Version': environment.version || '1.0.0',
        'X-Lab': 'LAB2-Error-Handling'
      })
    };
  }
  
  // ========================================
  // OPERACIONES CRUD CON MANEJO DE ERRORES
  // ========================================
  
  /**
   * OBTENER TODOS LOS PRODUCTOS con manejo robusto de errores
   */
  getProducts(filters?: ProductFilters): Observable<Product[]> {
    this.setLoadingState('list', true);
    this.clearError();
    
    let params = new HttpParams();
    
    if (filters) {
      this.currentFiltersSignal.set(filters);
      params = this.buildHttpParams(filters);
    }
    
    const context: ErrorContext = {
      operation: 'getProducts',
      url: this.apiUrl,
      timestamp: new Date().toISOString()
    };
    
    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      // Retry con backoff exponencial
      this.createRetryStrategy(context),
      
      tap(products => {
        this.productsSignal.set(products);
        console.log(`✅ [LAB2] Cargados ${products.length} productos con manejo de errores`);
      }),
      
      catchError(error => this.handleError(context, error)),
      
      finalize(() => this.setLoadingState('list', false)),
      
      shareReplay(1)
    );
  }
  
  /**
   * OBTENER UN PRODUCTO POR ID
   */
  getProduct(id: string | number): Observable<Product> {
    this.setLoadingState('individual', true);
    
    const context: ErrorContext = {
      operation: 'getProduct',
      url: `${this.apiUrl}/${id}`,
      timestamp: new Date().toISOString()
    };
    
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      this.createRetryStrategy(context),
      
      tap(product => {
        this.selectedProductSignal.set(product);
        console.log(`✅ [LAB2] Producto cargado: ${product.name}`);
      }),
      
      catchError(error => this.handleError(context, error)),
      
      finalize(() => this.setLoadingState('individual', false))
    );
  }
  
  /**
   * CREAR NUEVO PRODUCTO con validación y manejo de errores
   */
  createProduct(dto: CreateProductDto): Observable<Product> {
    // Validación previa
    const validationErrors = validateCreateProduct(dto);
    if (validationErrors.length > 0) {
      const errorMessage = 'Datos inválidos: ' + validationErrors.join(', ');
      this.setError(errorMessage);
      return throwError(() => new Error(errorMessage));
    }
    
    this.setLoadingState('create', true);
    
    const newProduct = {
      ...dto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const context: ErrorContext = {
      operation: 'createProduct',
      url: this.apiUrl,
      timestamp: new Date().toISOString()
    };
    
    return this.http.post<Product>(this.apiUrl, newProduct, this.getHttpOptions()).pipe(
      // Para creación, retry menos agresivo
      retry({
        count: 2,
        delay: 1000
      }),
      
      tap(product => {
        this.productsSignal.update(products => [...products, product]);
        console.log(`✅ [LAB2] Producto creado con manejo de errores: ${product.name}`);
      }),
      
      catchError(error => this.handleError(context, error)),
      
      finalize(() => this.setLoadingState('create', false))
    );
  }
  
  /**
   * ACTUALIZAR PRODUCTO
   */
  updateProduct(id: string | number, dto: UpdateProductDto): Observable<Product> {
    const validationErrors = validateUpdateProduct(dto);
    if (validationErrors.length > 0) {
      const errorMessage = 'Datos inválidos: ' + validationErrors.join(', ');
      this.setError(errorMessage);
      return throwError(() => new Error(errorMessage));
    }
    
    this.setLoadingState('update', true);
    
    const updatedProduct = {
      ...dto,
      updatedAt: new Date().toISOString()
    };
    
    const context: ErrorContext = {
      operation: 'updateProduct',
      url: `${this.apiUrl}/${id}`,
      timestamp: new Date().toISOString()
    };
    
    return this.http.put<Product>(`${this.apiUrl}/${id}`, updatedProduct, this.getHttpOptions()).pipe(
      this.createRetryStrategy(context),
      
      tap(product => {
        this.productsSignal.update(products => 
          products.map(p => String(p.id) === String(id) ? product : p)
        );
        
        if (String(this.selectedProductSignal()?.id) === String(id)) {
          this.selectedProductSignal.set(product);
        }
        
        console.log(`✅ [LAB2] Producto actualizado: ${product.name}`);
      }),
      
      catchError(error => this.handleError(context, error)),
      
      finalize(() => this.setLoadingState('update', false))
    );
  }
  
  /**
   * ELIMINAR PRODUCTO
   */
  deleteProduct(id: string | number): Observable<void> {
    this.setLoadingState('delete', true);
    
    const context: ErrorContext = {
      operation: 'deleteProduct',
      url: `${this.apiUrl}/${id}`,
      timestamp: new Date().toISOString()
    };
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(2), // Retry simple para delete
      
      tap(() => {
        this.productsSignal.update(products => 
          products.filter(p => String(p.id) !== String(id))
        );
        
        if (String(this.selectedProductSignal()?.id) === String(id)) {
          this.selectedProductSignal.set(null);
        }
        
        console.log(`✅ [LAB2] Producto eliminado con ID: ${id}`);
      }),
      
      catchError(error => this.handleError(context, error)),
      
      finalize(() => this.setLoadingState('delete', false))
    );
  }
  
  // ========================================
  // MANEJO DE ERRORES PROFESIONAL
  // ========================================
  
  /**
   * Manejo centralizado de errores con contexto detallado
   */
  private handleError(context: ErrorContext, error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    // Verificar si es error del cliente o servidor
    if (error.status === 0 || !error.status) {
      errorMessage = `Error de conexión: No se pudo conectar con el servidor`;
    } else {
      errorMessage = this.getServerErrorMessage(error.status, error.message);
    }
    
    // Actualizar estado de error
    this.setError(errorMessage);
    this.lastErrorContextSignal.set({
      ...context,
      retryCount: context.retryCount || 0
    });
    
    // Log detallado para debugging
    console.group(`🔴 [LAB2] Error en ${context.operation}`);
    console.error('Context:', context);
    console.error('HTTP Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Message:', errorMessage);
    console.error('Original Error:', error);
    console.groupEnd();
    
    return throwError(() => error);
  }
  
  /**
   * Convertir códigos HTTP a mensajes amigables
   */
  private getServerErrorMessage(status: number, originalMessage: string): string {
    const errorMessages: Record<number, string> = {
      400: 'Solicitud incorrecta. Verifique los datos enviados.',
      401: 'No autorizado. Por favor inicie sesión nuevamente.',
      403: 'Acceso denegado. No tiene permisos para esta operación.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Conflicto. El recurso ya existe o hay un conflicto con el estado actual.',
      422: 'Los datos enviados no son válidos.',
      429: 'Demasiadas solicitudes. Por favor espere un momento.',
      500: 'Error interno del servidor. El equipo técnico ha sido notificado.',
      502: 'Error de puerta de enlace. El servidor no está disponible.',
      503: 'Servicio no disponible. Por favor intente más tarde.',
      504: 'Tiempo de espera agotado. El servidor tardó demasiado en responder.'
    };
    
    return errorMessages[status] || `Error ${status}: ${originalMessage}`;
  }
  
  /**
   * Crear estrategia de retry con backoff exponencial
   */
  private createRetryStrategy(context: ErrorContext) {
    return retryWhen((errors: Observable<HttpErrorResponse>) =>
      errors.pipe(
        concatMap((error, index) => {
          const retryAttempt = index + 1;
          
          // Verificar si debemos reintentar
          if (retryAttempt >= this.retryConfig.maxAttempts) {
            console.warn(`🚫 [LAB2] Max retries (${this.retryConfig.maxAttempts}) reached for ${context.operation}`);
            return throwError(() => error);
          }
          
          // No reintentar errores del cliente
          if (this.retryConfig.excludedStatusCodes.includes(error.status)) {
            console.warn(`🚫 [LAB2] Status ${error.status} excluded from retry for ${context.operation}`);
            return throwError(() => error);
          }
          
          // Calcular delay con backoff exponencial + jitter
          const exponentialDelay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffFactor, index);
          const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
          const finalDelay = Math.min(exponentialDelay + jitter, this.retryConfig.maxDelay);
          
          console.log(`🔄 [LAB2] Retry ${retryAttempt}/${this.retryConfig.maxAttempts} for ${context.operation} after ${finalDelay}ms`);
          
          // Actualizar contexto con retry count
          context.retryCount = retryAttempt;
          
          return timer(finalDelay);
        })
      )
    );
  }
  
  // ========================================
  // UTILIDADES Y HELPERS
  // ========================================
  
  /**
   * Construir parámetros HTTP compatibles con JSON Server
   */
  private buildHttpParams(filters: ProductFilters): HttpParams {
    let params = new HttpParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        let paramKey = key;
        
        // Mapear parámetros a JSON Server
        if (key === 'sortBy') paramKey = '_sort';
        if (key === 'sortOrder') paramKey = '_order';
        if (key === 'search') paramKey = 'q';
        
        params = params.set(paramKey, value.toString());
      }
    });
    
    return params;
  }
  
  /**
   * Establecer estado de loading específico
   */
  private setLoadingState(operation: keyof LoadingStates, loading: boolean): void {
    this.loadingStatesSignal.update(states => ({
      ...states,
      [operation]: loading
    }));
  }
  
  /**
   * Establecer mensaje de error
   */
  private setError(message: string | null): void {
    this.errorSignal.set(message);
  }
  
  /**
   * Limpiar error
   */
  clearError(): void {
    this.errorSignal.set(null);
    this.lastErrorContextSignal.set(null);
  }
  
  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this.selectedProductSignal.set(null);
  }
  
  /**
   * Forzar recarga de datos
   */
  refreshProducts(): Observable<Product[]> {
    console.log('🔄 [LAB2] Forzando recarga de productos...');
    return this.getProducts(this.currentFiltersSignal());
  }
  
  /**
   * Obtener estadísticas de errores (para monitoring)
   */
  getErrorStatistics(): {
    lastError: string | null;
    lastErrorContext: ErrorContext | null;
    hasErrors: boolean;
  } {
    return {
      lastError: this.errorSignal(),
      lastErrorContext: this.lastErrorContextSignal(),
      hasErrors: !!this.errorSignal()
    };
  }
}
