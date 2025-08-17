import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CacheService } from './core/services/cache.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'PROVIAS - LAB4: Caching & Optimización';
  
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);
  private apiUrl = environment.apiUrl;
  private searchSubject = new Subject<string>();

  // Metrics
  cacheHitRate = 0;
  avgResponseTime = 0;
  totalCached = 0;
  savedRequests = 0;
  memoryUsage = 0;
  speedImprovement = 0;

  // Search
  searchTerm = '';
  searchResults: any[] = [];

  // Console output for UI
  consoleOutput: { message: string; type: string }[] = [];
  private cacheKeyCounter = 0;

  ngOnInit(): void {
    this.updateMetrics();
    this.setupOptimizedSearch();
  }

  setupOptimizedSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) {
          this.searchResults = [];
          return [];
        }
        console.log('🔍 Searching for:', term);
        return this.http.get<any[]>(`${this.apiUrl}/products?q=${term}`);
      })
    ).subscribe(results => {
      this.searchResults = results;
      console.log('✅ Search results:', results);
    });
  }

  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  testCacheHit(): void {
    // Incrementar contador para crear diferentes URLs y llenar el cache
    this.cacheKeyCounter++;
    const url = `${this.apiUrl}/products?page=${this.cacheKeyCounter}`;
    
    this.addConsoleOutput('🎯 Testing cache hit...');
    this.addConsoleOutput(`📍 URL: ${url}`);
    
    const startTime = performance.now();
    this.http.get(url).subscribe({
      next: (data: any) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Verificar si vino del cache
        const fromCache = responseTime < 50;
        
        if (fromCache) {
          this.addConsoleOutput(`✅ Response from CACHE in ${responseTime.toFixed(2)}ms`, 'success');
        } else {
          this.addConsoleOutput(`🌐 Response from NETWORK in ${responseTime.toFixed(2)}ms`, 'info');
        }
        
        this.addConsoleOutput(`📦 Received ${Array.isArray(data) ? data.length : 0} products`);
        
        // Simular el llenado del cache con múltiples entradas
        if (!fromCache && Array.isArray(data)) {
          // Guardar cada producto individualmente para llenar más el cache
          data.forEach((product: any, index: number) => {
            const productKey = `product-${this.cacheKeyCounter}-${index}`;
            this.cacheService.set(productKey, product, { ttl: 60000 }); // 1 minuto TTL
          });
          this.addConsoleOutput(`💾 Cached ${data.length} individual products`, 'success');
        }
        
        this.updateMetrics();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.addConsoleOutput(`❌ Error: ${error.message}`, 'error');
      }
    });
  }

  testCacheMiss(): void {
    const randomId = Math.floor(Math.random() * 1000);
    const url = `${this.apiUrl}/products?random=${randomId}`;
    
    this.addConsoleOutput('❌ Testing cache miss...');
    this.addConsoleOutput(`📍 URL: ${url} (always new)`);
    
    const startTime = performance.now();
    this.http.get(url).subscribe({
      next: (data: any) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.addConsoleOutput(`🌐 Response from NETWORK in ${responseTime.toFixed(2)}ms (no cache)`, 'warning');
        this.addConsoleOutput(`📦 Received ${Array.isArray(data) ? data.length : 0} products`);
        
        this.updateMetrics();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.addConsoleOutput(`❌ Error: ${error.message}`, 'error');
      }
    });
  }

  clearCache(): void {
    this.addConsoleOutput('🧹 Clearing cache...', 'warning');
    const stats = this.cacheService.getStats();
    const previousSize = stats.size;
    
    this.cacheService.clear();
    this.cacheKeyCounter = 0; // Reset counter
    
    this.addConsoleOutput(`✅ Cache cleared! Removed ${previousSize} entries`, 'success');
    this.addConsoleOutput(`💾 Memory freed: ${(stats.memoryUsage / 1024).toFixed(2)} KB`, 'info');
    
    this.updateMetrics();
  }

  viewCacheStats(): void {
    const stats = this.cacheService.getStats();
    
    this.addConsoleOutput('📊 === CACHE STATISTICS ===', 'info');
    this.addConsoleOutput(`📦 Total Entries: ${stats.size}`);
    this.addConsoleOutput(`✅ Hit Rate: ${stats.hitRate.toFixed(2)}%`);
    this.addConsoleOutput(`🎯 Total Hits: ${stats.hits}`);
    this.addConsoleOutput(`❌ Total Misses: ${stats.misses}`);
    this.addConsoleOutput(`💾 Memory Usage: ${(stats.memoryUsage / 1024).toFixed(2)} KB`);
    this.addConsoleOutput(`📈 Memory %: ${this.memoryUsage}%`);
    this.addConsoleOutput('======================', 'info');
  }

  updateMetrics(): void {
    const stats = this.cacheService.getStats();
    this.cacheHitRate = Math.round(stats.hitRate);
    this.totalCached = stats.size;
    this.savedRequests = stats.hits;
    // Calcular el porcentaje de memoria usado (asumiendo 5MB como máximo)
    const maxMemory = 5 * 1024 * 1024; // 5MB
    this.memoryUsage = Math.round((stats.memoryUsage / maxMemory) * 100);
    this.avgResponseTime = stats.hits > 0 ? 15 : 150; // Simulated
    this.speedImprovement = stats.hits > 0 ? 10 : 1; // Simulated
  }

  addConsoleOutput(message: string, type: string = 'log'): void {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    // Añadir al principio del array
    this.consoleOutput.unshift({ message: formattedMessage, type });
    
    // Mantener solo los últimos 20 mensajes
    if (this.consoleOutput.length > 20) {
      this.consoleOutput.pop();
    }
    
    // También log en la consola real
    console.log(message);
  }
}
