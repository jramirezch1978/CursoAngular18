import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AsyncFundamentalsService } from './services/async-fundamentals.service';
import { PromisePatternsService } from './services/promise-patterns.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'PROVIAS LAB 1 - Fundamentos de Asincronía';
  
  // Inyección de servicios
  private asyncService = inject(AsyncFundamentalsService);
  private patternsService = inject(PromisePatternsService);
  
  // Estado de navegación
  activeTab: string = 'intro';
  
  // Estados de carga para cada demostración
  loadingStates = {
    sync: false,
    callback: false,
    callbackHell: false,
    promise: false,
    promiseChain: false,
    asyncAwait: false,
    promiseAll: false,
    promiseAllSettled: false,
    timeout: false,
    retry: false
  };
  
  // Resultados de cada demostración
  results: any = {
    sync: null,
    callback: null,
    callbackHell: null,
    promise: null,
    promiseChain: null,
    asyncAwait: null,
    promiseAll: null,
    promiseAllSettled: null,
    timeout: null,
    retry: null
  };
  
  // Métricas de performance
  performanceMetrics: Array<{operation: string, time: number}> = [];

  ngOnInit() {
    console.log('🔬 LAB 1: Fundamentos de Asincronía - Iniciado');
    console.log('👨‍🏫 Instructor: Ing. Jhonny Alexander Ramirez Chiroque');
  }
  
  // Navegación entre pestañas
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    console.log(`📑 Cambiando a pestaña: ${tab}`);
  }
  
  // Operación síncrona de demostración
  testSyncOperation(): void {
    console.log('⚠️ INICIANDO operación síncrona - ¡La UI se bloqueará!');
    this.loadingStates.sync = true;
    this.results.sync = 'Procesando... (UI bloqueada)';
    
    const startTime = performance.now();
    
    setTimeout(() => {
      const result = this.asyncService.fetchDataSync();
      const endTime = performance.now();
      
      this.results.sync = result;
      this.loadingStates.sync = false;
      this.addMetric('Operación Síncrona', endTime - startTime);
    }, 100);
  }
  
  // Operación con callback
  testCallbackOperation(): void {
    console.log('🔄 Iniciando operación con callback');
    this.loadingStates.callback = true;
    this.results.callback = 'Esperando callback...';
    
    const startTime = performance.now();
    
    this.asyncService.fetchDataWithCallback(
      (data) => {
        const endTime = performance.now();
        this.results.callback = data;
        this.loadingStates.callback = false;
        this.addMetric('Callback Exitoso', endTime - startTime);
      },
      (error) => {
        const endTime = performance.now();
        this.results.callback = `Error: ${error.message}`;
        this.loadingStates.callback = false;
        this.addMetric('Callback con Error', endTime - startTime);
      }
    );
  }
  
  // Callback Hell
  testCallbackHell(): void {
    console.log('🌋 ENTRANDO AL CALLBACK HELL');
    this.loadingStates.callbackHell = true;
    this.results.callbackHell = 'Descendiendo al infierno...';
    
    const startTime = performance.now();
    
    this.asyncService.getUserDataNested(1, (result) => {
      const endTime = performance.now();
      this.results.callbackHell = result;
      this.loadingStates.callbackHell = false;
      this.addMetric('Callback Hell', endTime - startTime);
    });
  }
  
  // Promise simple
  testPromise(): void {
    console.log('🤝 Probando Promise simple');
    this.loadingStates.promise = true;
    this.results.promise = 'Esperando Promise...';
    
    const startTime = performance.now();
    
    this.asyncService.fetchDataWithPromise()
      .then((data) => {
        const endTime = performance.now();
        this.results.promise = data;
        this.loadingStates.promise = false;
        this.addMetric('Promise Exitosa', endTime - startTime);
      })
      .catch((error) => {
        const endTime = performance.now();
        this.results.promise = `Error: ${error.message}`;
        this.loadingStates.promise = false;
        this.addMetric('Promise Error', endTime - startTime);
      });
  }
  
  // Promise chain
  testPromiseChain(): void {
    console.log('⛓️ Probando Promise chain');
    this.loadingStates.promiseChain = true;
    this.results.promiseChain = 'Encadenando promises...';
    
    const startTime = performance.now();
    
    this.asyncService.getUserDataChained(1)
      .then((result) => {
        const endTime = performance.now();
        this.results.promiseChain = result;
        this.loadingStates.promiseChain = false;
        this.addMetric('Promise Chain', endTime - startTime);
      })
      .catch((error) => {
        const endTime = performance.now();
        this.results.promiseChain = { error: error.message };
        this.loadingStates.promiseChain = false;
        this.addMetric('Promise Chain Error', endTime - startTime);
      });
  }
  
  // Async/Await
  async testAsyncAwait(): Promise<void> {
    console.log('🎭 Probando Async/Await');
    this.loadingStates.asyncAwait = true;
    this.results.asyncAwait = 'Ejecutando con elegancia...';
    
    const startTime = performance.now();
    
    try {
      const result = await this.asyncService.getUserDataAsync(1);
      const endTime = performance.now();
      
      this.results.asyncAwait = result;
      this.loadingStates.asyncAwait = false;
      this.addMetric('Async/Await', endTime - startTime);
    } catch (error: any) {
      const endTime = performance.now();
      this.results.asyncAwait = { error: error.message };
      this.loadingStates.asyncAwait = false;
      this.addMetric('Async/Await Error', endTime - startTime);
    }
  }
  
  // Promise.all
  async testPromiseAll(): Promise<void> {
    console.log('🚀 Probando Promise.all');
    this.loadingStates.promiseAll = true;
    this.results.promiseAll = 'Ejecutando en paralelo...';
    
    const startTime = performance.now();
    
    try {
      const result = await this.patternsService.getMultipleResourcesParallel();
      const endTime = performance.now();
      
      this.results.promiseAll = {
        message: '✅ Todas las peticiones exitosas',
        data: result,
        totalUsers: result.users.length,
        totalProducts: result.products.length,
        totalOrders: result.orders.length
      };
      this.loadingStates.promiseAll = false;
      this.addMetric('Promise.all', endTime - startTime);
    } catch (error: any) {
      const endTime = performance.now();
      this.results.promiseAll = { error: error.message };
      this.loadingStates.promiseAll = false;
      this.addMetric('Promise.all Error', endTime - startTime);
    }
  }
  
  // Promise.allSettled
  async testPromiseAllSettled(): Promise<void> {
    console.log('🛡️ Probando Promise.allSettled');
    this.loadingStates.promiseAllSettled = true;
    this.results.promiseAllSettled = 'Siendo resiliente...';
    
    const startTime = performance.now();
    
    try {
      const results = await this.patternsService.getMultipleResourcesSafe();
      const endTime = performance.now();
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      this.results.promiseAllSettled = {
        message: `✅ Completado: ${successful} exitosas, ${failed} fallidas`,
        successful,
        failed,
        results: results.map((result, index) => ({
          index: index + 1,
          status: result.status,
          data: result.status === 'fulfilled' ? 'Datos obtenidos' : result.reason?.message
        }))
      };
      this.loadingStates.promiseAllSettled = false;
      this.addMetric('Promise.allSettled', endTime - startTime);
    } catch (error: any) {
      const endTime = performance.now();
      this.results.promiseAllSettled = { error: error.message };
      this.loadingStates.promiseAllSettled = false;
      this.addMetric('Promise.allSettled Error', endTime - startTime);
    }
  }
  
  // Timeout pattern
  async testTimeout(): Promise<void> {
    console.log('⏰ Probando timeout');
    this.loadingStates.timeout = true;
    this.results.timeout = 'Corriendo contra el tiempo...';
    
    const startTime = performance.now();
    
    try {
      const slowPromise = new Promise(resolve => 
        setTimeout(() => resolve('Operación completada'), 2000)
      );
      
      const result = await this.patternsService.fetchWithTimeout(slowPromise, 3000);
      const endTime = performance.now();
      
      this.results.timeout = `✅ ${result} (completada antes del timeout)`;
      this.loadingStates.timeout = false;
      this.addMetric('Timeout Success', endTime - startTime);
    } catch (error: any) {
      const endTime = performance.now();
      this.results.timeout = `⏰ ${error.message}`;
      this.loadingStates.timeout = false;
      this.addMetric('Timeout Error', endTime - startTime);
    }
  }
  
  // Retry pattern
  async testRetry(): Promise<void> {
    console.log('🔄 Probando retry');
    this.loadingStates.retry = true;
    this.results.retry = 'Intentando con persistencia...';
    
    const startTime = performance.now();
    
    try {
      let attemptCount = 0;
      const flakyOperation = () => {
        attemptCount++;
        return new Promise<string>((resolve, reject) => {
          setTimeout(() => {
            if (attemptCount < 3) {
              reject(new Error(`Intento ${attemptCount} falló`));
            } else {
              resolve(`¡Éxito en intento ${attemptCount}!`);
            }
          }, 500);
        });
      };
      
      const result = await this.patternsService.fetchWithRetry(flakyOperation, 3, 1000);
      const endTime = performance.now();
      
      this.results.retry = result;
      this.loadingStates.retry = false;
      this.addMetric('Retry Success', endTime - startTime);
    } catch (error: any) {
      const endTime = performance.now();
      this.results.retry = `💀 Falló: ${error.message}`;
      this.loadingStates.retry = false;
      this.addMetric('Retry Failed', endTime - startTime);
    }
  }
  
  private addMetric(operation: string, time: number): void {
    this.performanceMetrics = [
      { operation, time: Math.round(time) },
      ...this.performanceMetrics.slice(0, 9)
    ];
  }
}