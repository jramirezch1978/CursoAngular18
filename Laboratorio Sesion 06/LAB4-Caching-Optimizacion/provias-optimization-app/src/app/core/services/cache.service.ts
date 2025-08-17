/**
 * CACHE SERVICE - LAB 4: Caching y Optimización
 * 
 * Servicio avanzado de caching con múltiples estrategias y gestión inteligente de memoria.
 * Implementa cache HTTP, cache de aplicación y optimizaciones de rendimiento.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. ESTRATEGIAS DE CACHE:
 *    - Cache-First: Servir desde cache, fallback a red
 *    - Network-First: Intentar red primero, fallback a cache
 *    - Stale-While-Revalidate: Servir cache y actualizar en background
 * 
 * 2. GESTIÓN DE MEMORIA:
 *    - LRU (Least Recently Used) eviction
 *    - TTL (Time To Live) automático
 *    - Límites de tamaño configurables
 * 
 * 3. OPTIMIZACIÓN DE RENDIMIENTO:
 *    - Prefetching inteligente
 *    - Compresión de datos
 *    - Invalidación selectiva
 */

import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject, timer } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';

/**
 * Interface para entrada de cache
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
  accessCount: number;
  lastAccessed: number;
  size: number; // Tamaño estimado en bytes
  tags: string[]; // Tags para invalidación selectiva
  compressed?: boolean;
}

/**
 * Estrategias de cache disponibles
 */
export enum CacheStrategy {
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  NETWORK_ONLY = 'network-only',
  CACHE_ONLY = 'cache-only'
}

/**
 * Configuración de cache
 */
export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number; // TTL en milisegundos
  maxSize: number; // Tamaño máximo del cache en bytes
  maxEntries: number; // Número máximo de entradas
  tags?: string[]; // Tags para agrupación
  compress?: boolean; // Comprimir datos
  prefetch?: boolean; // Prefetch automático
}

/**
 * Estadísticas de cache
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  oldestEntry: number;
  newestEntry: number;
  averageAccessCount: number;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: CacheConfig = {
  strategy: CacheStrategy.CACHE_FIRST,
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 1000,
  compress: false,
  prefetch: false
};

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  
  // ========================================
  // ESTADO INTERNO
  // ========================================
  
  private cache = new Map<string, CacheEntry<any>>();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  
  /**
   * Signals para estado reactivo
   */
  private cacheStatsSignal = signal<CacheStats>(this.calculateStats());
  
  /**
   * Subject para notificaciones de cache
   */
  private cacheEvents$ = new BehaviorSubject<{
    type: 'hit' | 'miss' | 'set' | 'evict' | 'clear';
    key?: string;
    size?: number;
  }>({ type: 'clear' });
  
  // ========================================
  // COMPUTED SIGNALS PÚBLICOS
  // ========================================
  
  stats = computed(() => this.cacheStatsSignal());
  totalEntries = computed(() => this.cache.size);
  totalSize = computed(() => this.calculateTotalSize());
  hitRate = computed(() => {
    const total = this.hitCount + this.missCount;
    return total > 0 ? (this.hitCount / total) * 100 : 0;
  });
  
  // ========================================
  // CONSTRUCTOR
  // ========================================
  
  constructor() {
    // Configurar limpieza automática cada 5 minutos
    timer(0, 5 * 60 * 1000).subscribe(() => {
      this.cleanupExpiredEntries();
    });
    
    // Configurar limpieza de memoria cada 10 minutos
    timer(0, 10 * 60 * 1000).subscribe(() => {
      this.enforceMemoryLimits();
    });
    
    console.log('🗄️ [CacheService] Initialized with cleanup timers');
  }
  
  // ========================================
  // MÉTODOS PRINCIPALES DE CACHE
  // ========================================
  
  /**
   * Obtener datos del cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      this.cacheEvents$.next({ type: 'miss', key });
      this.updateStats();
      return null;
    }
    
    // Verificar si ha expirado
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.missCount++;
      this.cacheEvents$.next({ type: 'miss', key });
      this.updateStats();
      return null;
    }
    
    // Actualizar estadísticas de acceso
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    this.hitCount++;
    this.cacheEvents$.next({ type: 'hit', key });
    this.updateStats();
    
    console.log(`✅ [CacheService] Cache hit for key: ${key}`);
    return entry.data;
  }
  
  /**
   * Guardar datos en cache
   */
  set<T>(key: string, data: T, config: Partial<CacheConfig> = {}): void {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const now = Date.now();
    
    // Comprimir datos si está habilitado
    let processedData = data;
    let compressed = false;
    
    if (finalConfig.compress && this.shouldCompress(data)) {
      processedData = this.compressData(data);
      compressed = true;
    }
    
    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: now,
      ttl: finalConfig.ttl,
      accessCount: 0,
      lastAccessed: now,
      size: this.calculateDataSize(processedData),
      tags: finalConfig.tags || [],
      compressed
    };
    
    // Verificar límites antes de agregar
    this.enforceMemoryLimits();
    
    this.cache.set(key, entry);
    this.cacheEvents$.next({ type: 'set', key, size: entry.size });
    this.updateStats();
    
    console.log(`💾 [CacheService] Cached data for key: ${key} (${this.formatBytes(entry.size)})`);
  }
  
  /**
   * Eliminar entrada específica
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.cacheEvents$.next({ type: 'evict', key });
      this.updateStats();
      console.log(`🗑️ [CacheService] Deleted cache entry: ${key}`);
    }
    return deleted;
  }
  
  /**
   * Verificar si existe una clave
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }
  
  /**
   * Limpiar todo el cache
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;
    
    this.cacheEvents$.next({ type: 'clear' });
    this.updateStats();
    
    console.log(`🧹 [CacheService] Cleared ${count} cache entries`);
  }
  
  // ========================================
  // MÉTODOS DE ESTRATEGIA DE CACHE
  // ========================================
  
  /**
   * Obtener datos con estrategia de cache
   */
  getWithStrategy<T>(
    key: string,
    networkFn: () => Observable<T>,
    config: Partial<CacheConfig> = {}
  ): Observable<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    switch (finalConfig.strategy) {
      case CacheStrategy.CACHE_FIRST:
        return this.cacheFirst(key, networkFn, finalConfig);
      
      case CacheStrategy.NETWORK_FIRST:
        return this.networkFirst(key, networkFn, finalConfig);
      
      case CacheStrategy.STALE_WHILE_REVALIDATE:
        return this.staleWhileRevalidate(key, networkFn, finalConfig);
      
      case CacheStrategy.NETWORK_ONLY:
        return networkFn();
      
      case CacheStrategy.CACHE_ONLY:
        return this.cacheOnly(key);
      
      default:
        return this.cacheFirst(key, networkFn, finalConfig);
    }
  }
  
  /**
   * Estrategia Cache-First
   */
  private cacheFirst<T>(
    key: string,
    networkFn: () => Observable<T>,
    config: CacheConfig
  ): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      console.log(`📋 [CacheService] Cache-First: Serving from cache for ${key}`);
      return of(cached);
    }
    
    console.log(`🌐 [CacheService] Cache-First: Fetching from network for ${key}`);
    return networkFn().pipe(
      tap(data => this.set(key, data, config)),
      shareReplay(1)
    );
  }
  
  /**
   * Estrategia Network-First
   */
  private networkFirst<T>(
    key: string,
    networkFn: () => Observable<T>,
    config: CacheConfig
  ): Observable<T> {
    console.log(`🌐 [CacheService] Network-First: Trying network first for ${key}`);
    
    return networkFn().pipe(
      tap(data => this.set(key, data, config)),
      catchError(error => {
        console.warn(`⚠️ [CacheService] Network failed, trying cache for ${key}`);
        const cached = this.get<T>(key);
        
        if (cached !== null) {
          console.log(`📋 [CacheService] Network-First: Serving stale cache for ${key}`);
          return of(cached);
        }
        
        return throwError(() => error);
      }),
      shareReplay(1)
    );
  }
  
  /**
   * Estrategia Stale-While-Revalidate
   */
  private staleWhileRevalidate<T>(
    key: string,
    networkFn: () => Observable<T>,
    config: CacheConfig
  ): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      console.log(`📋 [CacheService] SWR: Serving stale cache for ${key}, revalidating in background`);
      
      // Revalidar en background
      networkFn().pipe(
        tap(data => {
          this.set(key, data, config);
          console.log(`🔄 [CacheService] SWR: Background revalidation completed for ${key}`);
        }),
        catchError(error => {
          console.warn(`⚠️ [CacheService] SWR: Background revalidation failed for ${key}`, error);
          return of(null);
        })
      ).subscribe();
      
      return of(cached);
    }
    
    // No hay cache, hacer request normal
    console.log(`🌐 [CacheService] SWR: No cache, fetching from network for ${key}`);
    return networkFn().pipe(
      tap(data => this.set(key, data, config)),
      shareReplay(1)
    );
  }
  
  /**
   * Estrategia Cache-Only
   */
  private cacheOnly<T>(key: string): Observable<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      console.log(`📋 [CacheService] Cache-Only: Serving from cache for ${key}`);
      return of(cached);
    }
    
    console.warn(`❌ [CacheService] Cache-Only: No cache available for ${key}`);
    return throwError(() => new Error(`No cache available for key: ${key}`));
  }
  
  // ========================================
  // MÉTODOS DE INVALIDACIÓN
  // ========================================
  
  /**
   * Invalidar por tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      this.updateStats();
      console.log(`🗑️ [CacheService] Invalidated ${invalidated} entries by tags:`, tags);
    }
    
    return invalidated;
  }
  
  /**
   * Invalidar por patrón de clave
   */
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      this.updateStats();
      console.log(`🗑️ [CacheService] Invalidated ${invalidated} entries by pattern:`, pattern);
    }
    
    return invalidated;
  }
  
  // ========================================
  // MÉTODOS DE GESTIÓN DE MEMORIA
  // ========================================
  
  /**
   * Limpiar entradas expiradas
   */
  private cleanupExpiredEntries(): void {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.updateStats();
      console.log(`🧹 [CacheService] Cleaned ${cleaned} expired entries`);
    }
  }
  
  /**
   * Aplicar límites de memoria
   */
  private enforceMemoryLimits(): void {
    const totalSize = this.calculateTotalSize();
    const maxSize = DEFAULT_CONFIG.maxSize;
    const maxEntries = DEFAULT_CONFIG.maxEntries;
    
    // Verificar límite de tamaño
    if (totalSize > maxSize) {
      this.evictBySize(maxSize * 0.8); // Reducir al 80% del límite
    }
    
    // Verificar límite de entradas
    if (this.cache.size > maxEntries) {
      this.evictByCount(Math.floor(maxEntries * 0.8)); // Reducir al 80% del límite
    }
  }
  
  /**
   * Evicción por tamaño usando LRU
   */
  private evictBySize(targetSize: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    let currentSize = this.calculateTotalSize();
    let evicted = 0;
    
    for (const [key] of entries) {
      if (currentSize <= targetSize) break;
      
      const entry = this.cache.get(key);
      if (entry) {
        currentSize -= entry.size;
        this.cache.delete(key);
        evicted++;
        this.evictionCount++;
      }
    }
    
    if (evicted > 0) {
      this.updateStats();
      console.log(`🗑️ [CacheService] Evicted ${evicted} entries by size (LRU)`);
    }
  }
  
  /**
   * Evicción por cantidad usando LRU
   */
  private evictByCount(targetCount: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    const toEvict = this.cache.size - targetCount;
    let evicted = 0;
    
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
      evicted++;
      this.evictionCount++;
    }
    
    if (evicted > 0) {
      this.updateStats();
      console.log(`🗑️ [CacheService] Evicted ${evicted} entries by count (LRU)`);
    }
  }
  
  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================
  
  /**
   * Verificar si una entrada ha expirado
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  /**
   * Calcular tamaño de datos
   */
  private calculateDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // Estimación por defecto
    }
  }
  
  /**
   * Calcular tamaño total del cache
   */
  private calculateTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }
  
  /**
   * Calcular estadísticas
   */
  private calculateStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const total = this.hitCount + this.missCount;
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.calculateTotalSize(),
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
      missRate: total > 0 ? (this.missCount / total) * 100 : 0,
      evictionCount: this.evictionCount,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0,
      averageAccessCount: entries.length > 0 ? 
        entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length : 0
    };
  }
  
  /**
   * Actualizar estadísticas
   */
  private updateStats(): void {
    this.cacheStatsSignal.set(this.calculateStats());
  }
  
  /**
   * Verificar si se debe comprimir
   */
  private shouldCompress(data: any): boolean {
    const size = this.calculateDataSize(data);
    return size > 1024; // Comprimir si es mayor a 1KB
  }
  
  /**
   * Comprimir datos (simulado)
   */
  private compressData(data: any): any {
    // En una implementación real, usarías una librería de compresión
    console.log('🗜️ [CacheService] Compressing data (simulated)');
    return data;
  }
  
  /**
   * Formatear bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Obtener observable de eventos de cache
   */
  getCacheEvents(): Observable<any> {
    return this.cacheEvents$.asObservable();
  }
  
  /**
   * Prefetch de datos
   */
  prefetch<T>(key: string, networkFn: () => Observable<T>, config: Partial<CacheConfig> = {}): void {
    if (!this.has(key)) {
      console.log(`🔮 [CacheService] Prefetching data for key: ${key}`);
      networkFn().pipe(
        tap(data => this.set(key, data, config)),
        catchError(error => {
          console.warn(`⚠️ [CacheService] Prefetch failed for ${key}:`, error);
          return of(null);
        })
      ).subscribe();
    }
  }
  
  /**
   * Debug: Imprimir estado del cache
   */
  debugCache(): void {
    console.group('🔍 Cache Debug Information');
    console.log('Total entries:', this.cache.size);
    console.log('Total size:', this.formatBytes(this.calculateTotalSize()));
    console.log('Hit rate:', this.hitRate().toFixed(2) + '%');
    console.log('Stats:', this.stats());
    
    console.log('Entries:');
    for (const [key, entry] of this.cache.entries()) {
      console.log(`  ${key}:`, {
        size: this.formatBytes(entry.size),
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount,
        tags: entry.tags,
        expired: this.isExpired(entry)
      });
    }
    console.groupEnd();
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats(): {
    size: number;
    hitRate: number;
    hits: number;
    misses: number;
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      hitRate: this.hitRate(),
      hits: this.hitCount,
      misses: this.missCount,
      memoryUsage: this.calculateTotalSize()
    };
  }
}
