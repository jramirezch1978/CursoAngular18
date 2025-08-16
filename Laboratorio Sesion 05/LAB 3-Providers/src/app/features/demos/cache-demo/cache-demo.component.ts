import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  CACHE_STRATEGY, 
  APP_CONFIG,
  CacheStrategy 
} from '../../../core/tokens/config.tokens';
import { MemoryCacheStrategy } from '../../../core/services/cache/memory-cache.strategy';
import { LocalStorageCacheStrategy } from '../../../core/services/cache/localstorage-cache.strategy';

interface CacheItem {
  key: string;
  value: any;
  ttl: number;
}

@Component({
  selector: 'app-cache-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: CACHE_STRATEGY,
      useFactory: (config: any) => {
        switch (config.cache.strategy) {
          case 'localStorage':
            return new LocalStorageCacheStrategy();
          case 'memory':
          default:
            return new MemoryCacheStrategy();
        }
      },
      deps: [APP_CONFIG]
    }
  ],
  template: `
    <div class="cache-demo">
      <h2>🗄️ Demo de Cache</h2>
      
      <div class="cache-info">
        <h3>Estrategia Activa: {{ config.cache.strategy }}</h3>
        <p>TTL por defecto: {{ config.cache.ttl / 1000 }} segundos</p>
      </div>

      <div class="cache-operations">
        <h3>Operaciones de Cache</h3>
        
        <div class="operation-form">
          <h4>Guardar en Cache</h4>
          <div class="form-group">
            <label>Clave:</label>
            <input 
              type="text" 
              [(ngModel)]="newItem.key" 
              placeholder="Ej: user-data"
              class="form-control">
          </div>
          
          <div class="form-group">
            <label>Valor (JSON):</label>
            <textarea 
              [(ngModel)]="newItem.value" 
              placeholder='{"name": "Juan", "age": 30}'
              rows="3"
              class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label>TTL (segundos):</label>
            <input 
              type="number" 
              [(ngModel)]="newItem.ttl" 
              placeholder="300"
              min="1"
              class="form-control">
          </div>
          
          <button (click)="saveToCache()" class="btn btn-primary">
            💾 Guardar
          </button>
        </div>

        <div class="operation-form">
          <h4>Buscar en Cache</h4>
          <div class="form-group">
            <label>Clave a buscar:</label>
            <input 
              type="text" 
              [(ngModel)]="searchKey" 
              placeholder="Ej: user-data"
              class="form-control">
          </div>
          
          <button (click)="getFromCache()" class="btn btn-secondary">
            🔍 Buscar
          </button>
          
          @if (searchResult() !== null) {
            <div class="search-result">
              <h5>Resultado:</h5>
              <pre>{{ searchResult() | json }}</pre>
            </div>
          }
        </div>

        <div class="operation-form">
          <h4>Eliminar de Cache</h4>
          <div class="form-group">
            <label>Clave a eliminar:</label>
            <input 
              type="text" 
              [(ngModel)]="deleteKey" 
              placeholder="Ej: user-data"
              class="form-control">
          </div>
          
          <button (click)="removeFromCache()" class="btn btn-danger">
            🗑️ Eliminar
          </button>
        </div>

        <button (click)="clearCache()" class="btn btn-warning">
          🧹 Limpiar Todo el Cache
        </button>
      </div>

      <!-- Mensajes -->
      @if (message()) {
        <div class="message" [class.success]="messageType() === 'success'" 
             [class.error]="messageType() === 'error'">
          {{ message() }}
        </div>
      }

      <!-- Log de operaciones -->
      <div class="operations-log">
        <h3>📋 Log de Operaciones</h3>
        <div class="log-entries">
          @for (entry of operationsLog(); track $index) {
            <div class="log-entry">
              <span class="timestamp">{{ entry.timestamp | date:'HH:mm:ss' }}</span>
              <span class="operation" [class]="entry.type">{{ entry.operation }}</span>
              <span class="details">{{ entry.details }}</span>
            </div>
          }
          @empty {
            <p>No hay operaciones registradas</p>
          }
        </div>
      </div>

      <!-- Estado del LocalStorage (solo si está activo) -->
      @if (config.cache.strategy === 'localStorage') {
        <div class="localstorage-view">
          <h3>📦 Vista del LocalStorage</h3>
          <button (click)="refreshLocalStorageView()" class="btn btn-sm">
            🔄 Actualizar
          </button>
          <div class="storage-items">
            @for (item of localStorageItems(); track item.key) {
              <div class="storage-item">
                <strong>{{ item.key }}:</strong>
                <code>{{ item.value }}</code>
              </div>
            }
            @empty {
              <p>No hay items en LocalStorage con el prefijo 'provias_cache_'</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cache-demo {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .cache-info {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .cache-operations {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .operation-form {
      border: 1px solid #ddd;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
    }

    .form-group {
      margin-bottom: 10px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: black;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 0.875rem;
    }

    .search-result {
      margin-top: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .search-result pre {
      margin: 0;
      white-space: pre-wrap;
    }

    .message {
      margin-top: 20px;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
    }

    .message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .operations-log {
      margin-top: 30px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .log-entries {
      max-height: 200px;
      overflow-y: auto;
      background: white;
      padding: 10px;
      border-radius: 4px;
    }

    .log-entry {
      padding: 5px 0;
      border-bottom: 1px solid #eee;
      font-size: 0.875rem;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .timestamp {
      color: #666;
      margin-right: 10px;
    }

    .operation {
      font-weight: bold;
      margin-right: 10px;
    }

    .operation.set { color: #28a745; }
    .operation.get { color: #17a2b8; }
    .operation.remove { color: #dc3545; }
    .operation.clear { color: #ffc107; }

    .localstorage-view {
      margin-top: 30px;
      background: #e9ecef;
      padding: 20px;
      border-radius: 8px;
    }

    .storage-items {
      background: white;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      max-height: 300px;
      overflow-y: auto;
    }

    .storage-item {
      padding: 8px;
      border-bottom: 1px solid #eee;
      word-break: break-all;
    }

    .storage-item:last-child {
      border-bottom: none;
    }

    .storage-item code {
      background: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 0.875rem;
    }
  `]
})
export class CacheDemoComponent implements OnInit {
  private readonly cache = inject<CacheStrategy>(CACHE_STRATEGY);
  readonly config = inject(APP_CONFIG);
  
  // Form data
  newItem: CacheItem = {
    key: '',
    value: '',
    ttl: 300
  };
  
  searchKey = '';
  deleteKey = '';
  
  // UI state
  searchResult = signal<any>(null);
  message = signal<string>('');
  messageType = signal<'success' | 'error'>('success');
  operationsLog = signal<Array<{
    timestamp: Date;
    operation: string;
    type: 'set' | 'get' | 'remove' | 'clear';
    details: string;
  }>>([]);
  localStorageItems = signal<Array<{key: string; value: string}>>([]);
  
  ngOnInit(): void {
    console.log('CacheDemoComponent initialized with strategy:', this.config.cache.strategy);
    this.refreshLocalStorageView();
  }
  
  saveToCache(): void {
    if (!this.newItem.key || !this.newItem.value) {
      this.showMessage('Por favor complete todos los campos', 'error');
      return;
    }
    
    try {
      const value = JSON.parse(this.newItem.value);
      this.cache.set(this.newItem.key, value, this.newItem.ttl * 1000);
      
      this.addLogEntry('set', `Guardado: ${this.newItem.key} (TTL: ${this.newItem.ttl}s)`);
      this.showMessage(`✅ Guardado en cache: ${this.newItem.key}`, 'success');
      
      // Limpiar formulario
      this.newItem = { key: '', value: '', ttl: 300 };
      this.refreshLocalStorageView();
    } catch (error) {
      this.showMessage('Error: El valor debe ser un JSON válido', 'error');
    }
  }
  
  getFromCache(): void {
    if (!this.searchKey) {
      this.showMessage('Por favor ingrese una clave para buscar', 'error');
      return;
    }
    
    const value = this.cache.get(this.searchKey);
    this.searchResult.set(value);
    
    if (value !== null) {
      this.addLogEntry('get', `Encontrado: ${this.searchKey}`);
      this.showMessage(`✅ Valor encontrado para: ${this.searchKey}`, 'success');
    } else {
      this.addLogEntry('get', `No encontrado: ${this.searchKey}`);
      this.showMessage(`❌ No se encontró valor para: ${this.searchKey}`, 'error');
    }
  }
  
  removeFromCache(): void {
    if (!this.deleteKey) {
      this.showMessage('Por favor ingrese una clave para eliminar', 'error');
      return;
    }
    
    this.cache.remove(this.deleteKey);
    this.addLogEntry('remove', `Eliminado: ${this.deleteKey}`);
    this.showMessage(`🗑️ Eliminado del cache: ${this.deleteKey}`, 'success');
    this.refreshLocalStorageView();
  }
  
  clearCache(): void {
    if (confirm('¿Está seguro de limpiar todo el cache?')) {
      this.cache.clear();
      this.addLogEntry('clear', 'Cache limpiado completamente');
      this.showMessage('🧹 Cache limpiado completamente', 'success');
      this.searchResult.set(null);
      this.refreshLocalStorageView();
    }
  }
  
  refreshLocalStorageView(): void {
    if (this.config.cache.strategy === 'localStorage') {
      const items: Array<{key: string; value: string}> = [];
      const prefix = 'provias_cache_';
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key) || '';
          items.push({
            key: key.replace(prefix, ''),
            value: value.length > 100 ? value.substring(0, 100) + '...' : value
          });
        }
      }
      
      this.localStorageItems.set(items);
    }
  }
  
  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.message.set(msg);
    this.messageType.set(type);
    
    setTimeout(() => {
      this.message.set('');
    }, 3000);
  }
  
  private addLogEntry(type: 'set' | 'get' | 'remove' | 'clear', details: string): void {
    const log = this.operationsLog();
    log.unshift({
      timestamp: new Date(),
      operation: type.toUpperCase(),
      type,
      details
    });
    
    // Mantener solo las últimas 10 operaciones
    if (log.length > 10) {
      log.pop();
    }
    
    this.operationsLog.set([...log]);
  }
}