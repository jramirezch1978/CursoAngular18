/**
 * OPTIMIZED SEARCH COMPONENT - LAB 4: Caching y Optimización
 * 
 * Componente de búsqueda optimizado con debouncing, caching y sugerencias inteligentes.
 * Demuestra técnicas avanzadas de optimización de UX y rendimiento.
 * 
 * CONCEPTOS EDUCATIVOS:
 * 
 * 1. OPTIMIZACIÓN DE BÚSQUEDA:
 *    - Debouncing para reducir requests
 *    - Caching de resultados de búsqueda
 *    - Sugerencias automáticas
 * 
 * 2. UX AVANZADA:
 *    - Loading states granulares
 *    - Highlighting de términos de búsqueda
 *    - Navegación por teclado
 * 
 * 3. PERFORMANCE:
 *    - Virtual scrolling para listas grandes
 *    - Lazy loading de resultados
 *    - Prefetching inteligente
 */

import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap, startWith } from 'rxjs/operators';
import { CacheService, CacheStrategy } from '../../../core/services/cache.service';
import { environment } from '../../../../environments/environment';

/**
 * Interface para resultado de búsqueda
 */
export interface SearchResult {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  score?: number;
  thumbnail?: string;
  url?: string;
}

/**
 * Interface para configuración de búsqueda
 */
export interface SearchConfig {
  placeholder: string;
  minLength: number;
  debounceTime: number;
  maxResults: number;
  showCategories: boolean;
  showThumbnails: boolean;
  enableHighlighting: boolean;
  enableKeyboardNavigation: boolean;
  cacheResults: boolean;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: SearchConfig = {
  placeholder: 'Buscar...',
  minLength: 2,
  debounceTime: 300,
  maxResults: 10,
  showCategories: true,
  showThumbnails: false,
  enableHighlighting: true,
  enableKeyboardNavigation: true,
  cacheResults: true
};

@Component({
  selector: 'app-optimized-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="optimized-search" [class.has-results]="hasResults()">
      
      <!-- Input de búsqueda -->
      <div class="search-input-container">
        <input
          #searchInput
          type="text"
          class="search-input"
          [placeholder]="config.placeholder"
          [(ngModel)]="searchTerm"
          (input)="onSearchInput($event)"
          (keydown)="onKeyDown($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          autocomplete="off"
          spellcheck="false">
        
        <!-- Indicadores de estado -->
        <div class="search-indicators">
          @if (isLoading()) {
            <div class="loading-indicator" title="Buscando...">
              <div class="spinner"></div>
            </div>
          }
          
          @if (searchTerm && !isLoading()) {
            <button 
              type="button" 
              class="clear-button"
              (click)="clearSearch()"
              title="Limpiar búsqueda">
              ✕
            </button>
          }
        </div>
      </div>
      
      <!-- Resultados de búsqueda -->
      @if (showResults() && hasResults()) {
        <div class="search-results" role="listbox">
          
          <!-- Información de resultados -->
          <div class="results-info">
            <span class="results-count">
              {{ filteredResults().length }} resultado{{ filteredResults().length !== 1 ? 's' : '' }}
            </span>
            
            @if (searchStats().fromCache) {
              <span class="cache-indicator" title="Resultados desde cache">
                📋 Cache
              </span>
            }
            
            @if (searchStats().duration > 0) {
              <span class="duration-indicator">
                {{ searchStats().duration }}ms
              </span>
            }
          </div>
          
          <!-- Lista de resultados -->
          <div class="results-list">
            @for (result of filteredResults(); track result.id; let i = $index) {
              <div 
                class="result-item"
                [class.selected]="selectedIndex() === i"
                [class.has-thumbnail]="config.showThumbnails && result.thumbnail"
                (click)="selectResult(result, i)"
                (mouseenter)="setSelectedIndex(i)"
                role="option"
                [attr.aria-selected]="selectedIndex() === i">
                
                <!-- Thumbnail -->
                @if (config.showThumbnails && result.thumbnail) {
                  <div class="result-thumbnail">
                    <img [src]="result.thumbnail" [alt]="result.title" loading="lazy">
                  </div>
                }
                
                <!-- Contenido -->
                <div class="result-content">
                  <div class="result-title" [innerHTML]="highlightTerm(result.title)"></div>
                  
                  @if (result.subtitle) {
                    <div class="result-subtitle" [innerHTML]="highlightTerm(result.subtitle)"></div>
                  }
                  
                  @if (result.description) {
                    <div class="result-description" [innerHTML]="highlightTerm(result.description)"></div>
                  }
                  
                  @if (config.showCategories && result.category) {
                    <div class="result-category">
                      <span class="category-tag">{{ result.category }}</span>
                    </div>
                  }
                </div>
                
                <!-- Score (para debugging) -->
                @if (result.score && !environment.production) {
                  <div class="result-score">
                    {{ result.score.toFixed(2) }}
                  </div>
                }
              </div>
            }
          </div>
          
          <!-- No hay resultados -->
          @if (filteredResults().length === 0 && searchTerm && !isLoading()) {
            <div class="no-results">
              <div class="no-results-icon">🔍</div>
              <div class="no-results-message">
                No se encontraron resultados para "<strong>{{ searchTerm }}</strong>"
              </div>
              <div class="no-results-suggestions">
                <p>Sugerencias:</p>
                <ul>
                  <li>Verifica la ortografía</li>
                  <li>Usa términos más generales</li>
                  <li>Prueba con sinónimos</li>
                </ul>
              </div>
            </div>
          }
        </div>
      }
      
      <!-- Sugerencias de búsqueda -->
      @if (showSuggestions() && searchSuggestions().length > 0) {
        <div class="search-suggestions">
          <div class="suggestions-header">Sugerencias:</div>
          <div class="suggestions-list">
            @for (suggestion of searchSuggestions(); track suggestion) {
              <button 
                type="button"
                class="suggestion-item"
                (click)="applySuggestion(suggestion)">
                {{ suggestion }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .optimized-search {
      position: relative;
      width: 100%;
      max-width: 600px;
    }
    
    .search-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .search-input {
      width: 100%;
      padding: 12px 16px;
      padding-right: 50px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 16px;
      outline: none;
      transition: all 0.3s ease;
      background: white;
    }
    
    .search-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .search-indicators {
      position: absolute;
      right: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .loading-indicator {
      display: flex;
      align-items: center;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .clear-button {
      background: none;
      border: none;
      font-size: 16px;
      color: #999;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }
    
    .clear-button:hover {
      background: #f0f0f0;
      color: #666;
    }
    
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-height: 400px;
      overflow: hidden;
      margin-top: 8px;
    }
    
    .results-info {
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #666;
    }
    
    .cache-indicator {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .duration-indicator {
      color: #999;
      font-size: 12px;
    }
    
    .results-list {
      max-height: 320px;
      overflow-y: auto;
    }
    
    .result-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s ease;
    }
    
    .result-item:hover,
    .result-item.selected {
      background: #f8f9fa;
    }
    
    .result-item.selected {
      background: #e3f2fd;
    }
    
    .result-thumbnail {
      width: 40px;
      height: 40px;
      margin-right: 12px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }
    
    .result-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .result-content {
      flex: 1;
      min-width: 0;
    }
    
    .result-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .result-subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .result-description {
      font-size: 13px;
      color: #888;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .result-category {
      margin-top: 4px;
    }
    
    .category-tag {
      background: #e8f5e8;
      color: #2e7d32;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .result-score {
      font-size: 12px;
      color: #999;
      margin-left: 8px;
    }
    
    .no-results {
      padding: 32px 16px;
      text-align: center;
      color: #666;
    }
    
    .no-results-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .no-results-message {
      font-size: 16px;
      margin-bottom: 16px;
    }
    
    .no-results-suggestions {
      text-align: left;
      max-width: 300px;
      margin: 0 auto;
    }
    
    .no-results-suggestions p {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .no-results-suggestions ul {
      list-style: none;
      padding: 0;
    }
    
    .no-results-suggestions li {
      padding: 4px 0;
      font-size: 14px;
    }
    
    .no-results-suggestions li:before {
      content: "• ";
      color: #999;
    }
    
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      z-index: 999;
      margin-top: 8px;
      padding: 12px;
    }
    
    .suggestions-header {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      margin-bottom: 8px;
    }
    
    .suggestions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .suggestion-item {
      background: #f0f0f0;
      border: none;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .suggestion-item:hover {
      background: #e0e0e0;
    }
    
    /* Highlighting de términos de búsqueda */
    .highlight {
      background: #fff3cd;
      font-weight: 600;
      padding: 1px 2px;
      border-radius: 2px;
    }
    
    /* Animaciones */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      .search-input {
        font-size: 16px; /* Prevenir zoom en iOS */
      }
      
      .search-results {
        max-height: 300px;
      }
      
      .result-item {
        padding: 10px 12px;
      }
    }
  `]
})
export class OptimizedSearchComponent implements OnInit, OnDestroy {
  private cacheService = inject(CacheService);
  
  // ========================================
  // INPUTS Y OUTPUTS
  // ========================================
  
  @Input() config: Partial<SearchConfig> = {};
  @Input() searchFunction!: (term: string) => Observable<SearchResult[]>;
  @Input() suggestions: string[] = [];
  
  @Output() resultSelected = new EventEmitter<SearchResult>();
  @Output() searchTermChanged = new EventEmitter<string>();
  
  // ========================================
  // ESTADO INTERNO
  // ========================================
  
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private finalConfig: SearchConfig = DEFAULT_CONFIG;
  
  // Signals para estado reactivo
  private resultsSignal = signal<SearchResult[]>([]);
  private isLoadingSignal = signal(false);
  private selectedIndexSignal = signal(-1);
  private showResultsSignal = signal(false);
  private searchStatsSignal = signal({ fromCache: false, duration: 0 });
  
  // Computed signals
  results = computed(() => this.resultsSignal());
  isLoading = computed(() => this.isLoadingSignal());
  selectedIndex = computed(() => this.selectedIndexSignal());
  showResults = computed(() => this.showResultsSignal());
  hasResults = computed(() => this.resultsSignal().length > 0);
  searchStats = computed(() => this.searchStatsSignal());
  
  filteredResults = computed(() => {
    const results = this.resultsSignal();
    return results.slice(0, this.finalConfig.maxResults);
  });
  
  searchSuggestions = computed(() => {
    if (!this.searchTerm || this.searchTerm.length < 2) return [];
    
    return this.suggestions
      .filter(s => s.toLowerCase().includes(this.searchTerm.toLowerCase()))
      .slice(0, 5);
  });
  
  showSuggestions = computed(() => {
    return this.searchTerm.length > 0 && 
           this.searchTerm.length < this.finalConfig.minLength &&
           this.searchSuggestions().length > 0;
  });
  
  // ========================================
  // LIFECYCLE HOOKS
  // ========================================
  
  ngOnInit(): void {
    this.finalConfig = { ...DEFAULT_CONFIG, ...this.config };
    this.setupSearchStream();
  }
  
  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
  
  // ========================================
  // CONFIGURACIÓN DE BÚSQUEDA
  // ========================================
  
  private setupSearchStream(): void {
    this.searchSubject.pipe(
      debounceTime(this.finalConfig.debounceTime),
      distinctUntilChanged(),
      switchMap(term => this.performSearch(term))
    ).subscribe();
  }
  
  private performSearch(term: string): Observable<SearchResult[]> {
    if (!term || term.length < this.finalConfig.minLength) {
      this.resultsSignal.set([]);
      this.showResultsSignal.set(false);
      this.isLoadingSignal.set(false);
      return of([]);
    }
    
    this.isLoadingSignal.set(true);
    this.selectedIndexSignal.set(-1);
    
    const startTime = performance.now();
    const cacheKey = `search:${term}`;
    
    // Intentar obtener desde cache si está habilitado
    if (this.finalConfig.cacheResults) {
      const cached = this.cacheService.get<SearchResult[]>(cacheKey);
      if (cached) {
        const duration = performance.now() - startTime;
        this.resultsSignal.set(cached);
        this.showResultsSignal.set(true);
        this.isLoadingSignal.set(false);
        this.searchStatsSignal.set({ fromCache: true, duration });
        
        console.log(`📋 [OptimizedSearch] Serving cached results for: ${term}`);
        return of(cached);
      }
    }
    
    // Hacer búsqueda en red
    return this.searchFunction(term).pipe(
      tap(results => {
        const duration = performance.now() - startTime;
        
        // Guardar en cache si está habilitado
        if (this.finalConfig.cacheResults) {
          this.cacheService.set(cacheKey, results, {
            strategy: CacheStrategy.CACHE_FIRST,
            ttl: 5 * 60 * 1000, // 5 minutos
            tags: ['search']
          });
        }
        
        this.resultsSignal.set(results);
        this.showResultsSignal.set(true);
        this.isLoadingSignal.set(false);
        this.searchStatsSignal.set({ fromCache: false, duration });
        
        console.log(`🔍 [OptimizedSearch] Search completed for: ${term} (${results.length} results, ${duration.toFixed(2)}ms)`);
      }),
      catchError(error => {
        console.error('Search error:', error);
        this.resultsSignal.set([]);
        this.showResultsSignal.set(false);
        this.isLoadingSignal.set(false);
        return of([]);
      })
    );
  }
  
  // ========================================
  // EVENT HANDLERS
  // ========================================
  
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchTermChanged.emit(this.searchTerm);
    this.searchSubject.next(this.searchTerm);
  }
  
  onKeyDown(event: KeyboardEvent): void {
    if (!this.finalConfig.enableKeyboardNavigation) return;
    
    const results = this.filteredResults();
    const currentIndex = this.selectedIndex();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
        this.setSelectedIndex(nextIndex);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
        this.setSelectedIndex(prevIndex);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && results[currentIndex]) {
          this.selectResult(results[currentIndex], currentIndex);
        }
        break;
        
      case 'Escape':
        this.clearSearch();
        break;
    }
  }
  
  onFocus(): void {
    if (this.hasResults()) {
      this.showResultsSignal.set(true);
    }
  }
  
  onBlur(): void {
    // Delay para permitir clicks en resultados
    setTimeout(() => {
      this.showResultsSignal.set(false);
    }, 200);
  }
  
  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================
  
  selectResult(result: SearchResult, index: number): void {
    this.setSelectedIndex(index);
    this.resultSelected.emit(result);
    this.showResultsSignal.set(false);
    
    console.log(`✅ [OptimizedSearch] Result selected:`, result);
  }
  
  setSelectedIndex(index: number): void {
    this.selectedIndexSignal.set(index);
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.resultsSignal.set([]);
    this.showResultsSignal.set(false);
    this.selectedIndexSignal.set(-1);
    this.searchTermChanged.emit('');
  }
  
  applySuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.searchTermChanged.emit(suggestion);
    this.searchSubject.next(suggestion);
  }
  
  highlightTerm(text: string): string {
    if (!this.finalConfig.enableHighlighting || !this.searchTerm) {
      return text;
    }
    
    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
  
  // ========================================
  // MÉTODOS PRIVADOS
  // ========================================
  
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}


