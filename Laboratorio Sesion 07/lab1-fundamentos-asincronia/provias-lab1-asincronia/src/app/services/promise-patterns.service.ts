/**
 * 🎯 PROMISE PATTERNS SERVICE - LAB 1
 * 
 * "Estos patrones no son teóricos. Los usarán constantemente. Múltiples llamadas 
 * a APIs, timeouts para servicios externos, manejo robusto cuando algunos datos 
 * son opcionales. Es su caja de herramientas para asincronía con Promises." 
 * - Ing. Jhonny Ramirez
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User, Product, Order, RetryConfig, TimeoutConfig, BatchConfig } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PromisePatternsService {
  private http = inject(HttpClient);
  private apiUrl = '/api';
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  // ================================
  // 1. PROMISE.ALL - PARALELISMO PURO
  // ================================

  /**
   * 🚀 PROMISE.ALL - El poder del paralelismo
   * 
   * "Promise.all muestra el poder de las operaciones paralelas. Imaginen que necesitan 
   * información de 5 proveedores diferentes para un proyecto. En lugar de llamar uno 
   * por uno secuencialmente (que tomaría 5 veces más), llaman a todos en paralelo." 
   * - Ing. Jhonny Ramirez
   */
  async getMultipleResourcesParallel(): Promise<{
    users: User[];
    products: Product[];
    orders: Order[];
  }> {
    console.log('🚀 INICIANDO peticiones paralelas con Promise.all');
    const startTime = performance.now();

    try {
      // ✨ Magia del paralelismo: todas las peticiones se ejecutan simultáneamente
      const [users, products, orders] = await Promise.all([
        firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/users`)),
        firstValueFrom(this.http.get<Product[]>(`${this.apiUrl}/products`)),
        firstValueFrom(this.http.get<Order[]>(`${this.apiUrl}/orders`))
      ]);

      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`✅ Promise.all completado en ${duration.toFixed(2)}ms`);
      console.log(`📊 Datos obtenidos: ${users.length} usuarios, ${products.length} productos, ${orders.length} órdenes`);

      return { users, products, orders };
    } catch (error) {
      console.error('❌ Error en Promise.all - Si una falla, todas fallan:', error);
      throw error;
    }
  }

  // ================================
  // 2. PROMISE.ALLSETTLED - RESILIENCIA
  // ================================

  /**
   * 🛡️ PROMISE.ALLSETTLED - Resiliencia pura
   * 
   * "Promise.allSettled es resiliencia pura. A diferencia de Promise.all, no falla 
   * si una promesa falla. Es como enviar invitaciones a una reunión: si algunos no 
   * pueden venir, la reunión continúa con los que sí pueden." - Ing. Jhonny Ramirez
   */
  async getMultipleResourcesSafe(): Promise<PromiseSettledResult<any>[]> {
    console.log('🛡️ INICIANDO peticiones resilientes con Promise.allSettled');
    
    const promises = [
      firstValueFrom(this.http.get(`${this.apiUrl}/users`)),
      firstValueFrom(this.http.get(`${this.apiUrl}/products`)),
      firstValueFrom(this.http.get(`${this.apiUrl}/invalid-endpoint`)) // 💥 Esta fallará intencionalmente
    ];

    const results = await Promise.allSettled(promises);
    
    // 📊 Análisis detallado de resultados
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = Array.isArray(result.value) ? result.value : [result.value];
        console.log(`✅ Promesa ${index + 1} exitosa: ${data.length} elementos obtenidos`);
      } else {
        console.log(`❌ Promesa ${index + 1} falló: ${result.reason.message}`);
      }
    });

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    console.log(`📈 Resumen: ${successful} exitosas, ${failed} fallidas - ¡La aplicación sigue funcionando!`);

    return results;
  }

  // ================================
  // 3. PROMISE.RACE - TIMEOUT PATTERN
  // ================================

  /**
   * ⏰ PROMISE.RACE - Patrón Timeout
   * 
   * "getUserWithTimeout resuelve un problema real: servicios lentos. Es como poner 
   * un límite de tiempo en una reunión. Si no han terminado en 5 segundos, asumimos 
   * que algo anda mal y seguimos adelante." - Ing. Jhonny Ramirez
   */
  async fetchWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 5000,
    timeoutMessage: string = `Timeout después de ${timeoutMs}ms`
  ): Promise<T> {
    console.log(`⏰ Configurando timeout de ${timeoutMs}ms`);
    
    // 🏁 Carrera entre la promesa real y el timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.log(`⏰ ¡Timeout! Operación cancelada después de ${timeoutMs}ms`);
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    // 🏆 El primero que termine gana
    return Promise.race([promise, timeoutPromise]);
  }

  // ================================
  // 4. RETRY PATTERN - PERSISTENCIA INTELIGENTE
  // ================================

  /**
   * 🔄 RETRY PATTERN - Persistencia inteligente
   * 
   * "fetchWithRetry es resiliencia inteligente. En el mundo real, las redes fallan, 
   * los servidores tienen hipos. Este patrón reintenta automáticamente con backoff 
   * exponencial: espera 1 segundo, luego 2, luego 4." - Ing. Jhonny Ramirez
   */
  async fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000,
    backoffFactor: number = 2
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const attemptNumber = attempt + 1;
        console.log(`🔄 Intento ${attemptNumber} de ${maxRetries + 1}`);
        
        const result = await fetchFn();
        
        if (attempt > 0) {
          console.log(`🎉 ¡Éxito en intento ${attemptNumber}! La persistencia valió la pena`);
        } else {
          console.log(`✅ Éxito en primer intento`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.log(`❌ Intento ${attempt + 1} falló: ${error.message}`);
        
        if (attempt < maxRetries) {
          // 📈 Backoff exponencial: cada vez esperamos más tiempo
          const delay = initialDelay * Math.pow(backoffFactor, attempt);
          console.log(`⏳ Esperando ${delay}ms antes de reintentar (backoff exponencial)...`);
          await this.sleep(delay);
        }
      }
    }
    
    console.error(`💀 Todos los intentos fallaron. Rendirse después de ${maxRetries + 1} intentos`);
    throw lastError;
  }

  // ================================
  // 5. BATCH PROCESSING - PROCESAMIENTO POR LOTES
  // ================================

  /**
   * 📦 BATCH PROCESSING - Optimización inteligente
   * 
   * "processBatch es optimización inteligente. Tienen 100 operaciones pero no quieren 
   * abrumar el servidor con 100 peticiones simultáneas. Procesan en lotes de 5: 
   * suficiente paralelismo para ser eficiente, suficiente control para no sobrecargar." 
   * - Ing. Jhonny Ramirez
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 5,
    delayBetweenBatches: number = 100
  ): Promise<R[]> {
    console.log(`📦 INICIANDO batch processing: ${items.length} items en lotes de ${batchSize}`);
    const results: R[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const batch = items.slice(i, i + batchSize);
      
      console.log(`🔄 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} items)`);
      const startTime = performance.now();
      
      // ⚡ Procesar todos los items del lote en paralelo
      const batchResults = await Promise.all(
        batch.map((item, index) => {
          console.log(`  ⚙️ Procesando item ${i + index + 1}/${items.length}`);
          return processor(item);
        })
      );
      
      const batchDuration = performance.now() - startTime;
      console.log(`✅ Lote ${batchNumber} completado en ${batchDuration.toFixed(2)}ms`);
      
      results.push(...batchResults);
      
      // 😴 Pequeña pausa entre lotes para no sobrecargar el servidor
      if (batchNumber < totalBatches && delayBetweenBatches > 0) {
        console.log(`😴 Pausa de ${delayBetweenBatches}ms entre lotes...`);
        await this.sleep(delayBetweenBatches);
      }
    }
    
    console.log(`🎯 Batch processing completado: ${results.length} items procesados`);
    return results;
  }

  // ================================
  // 6. SEQUENTIAL PROCESSING - ORDEN GARANTIZADO
  // ================================

  /**
   * ➡️ SEQUENTIAL PROCESSING - Cuando el orden importa
   * 
   * "processSequentially es para cuando el orden importa. Imaginen que están 
   * procesando transferencias bancarias: cada una debe completarse antes de 
   * procesar la siguiente para mantener el balance correcto." - Ing. Jhonny Ramirez
   */
  async processSequentially<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>
  ): Promise<R[]> {
    console.log(`➡️ INICIANDO procesamiento secuencial: ${items.length} items (orden garantizado)`);
    const results: R[] = [];
    
    for (const [index, item] of items.entries()) {
      const itemNumber = index + 1;
      console.log(`📝 Procesando item ${itemNumber}/${items.length} secuencialmente`);
      const startTime = performance.now();
      
      const result = await processor(item, index);
      const duration = performance.now() - startTime;
      
      console.log(`✅ Item ${itemNumber} completado en ${duration.toFixed(2)}ms`);
      results.push(result);
    }
    
    console.log(`🏁 Procesamiento secuencial completado: ${results.length} items en orden`);
    return results;
  }

  // ================================
  // 7. DEBOUNCED PROMISE - BÚSQUEDAS INTELIGENTES
  // ================================

  /**
   * 🔍 DEBOUNCED PROMISE - Para búsquedas optimizadas
   * 
   * "Es como tener un asistente que, cuando le cambian las instrucciones, 
   * inmediatamente olvida la tarea anterior y se enfoca en la nueva." 
   * - Ing. Jhonny Ramirez
   */
  debouncedFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    delay: number = 300
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 🧹 Cancelar búsqueda anterior si existe
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        console.log(`🔄 Cancelando búsqueda anterior para: ${key}`);
        clearTimeout(existingTimer);
      }

      // ⏰ Programar nueva búsqueda
      const timer = setTimeout(async () => {
        try {
          console.log(`🔍 Ejecutando búsqueda debounced para: ${key}`);
          const result = await fetchFn();
          resolve(result);
        } catch (error) {
          console.error(`❌ Error en búsqueda debounced para ${key}:`, error);
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, delay);

      this.debounceTimers.set(key, timer);
      console.log(`⏳ Búsqueda programada para ${key} en ${delay}ms`);
    });
  }

  // ================================
  // 8. CASO REAL PROVIAS - INTEGRACIÓN COMPLETA
  // ================================

  /**
   * 🏗️ CASO REAL PROVIAS - Carga completa de datos de proyecto
   * 
   * "Este ejemplo integra todos los patrones aprendidos en un caso real de PROVIAS"
   */
  async loadProjectCompleteData(projectId: number): Promise<any> {
    console.log(`🏗️ CARGANDO datos completos del proyecto ${projectId} (Caso real PROVIAS)`);
    
    try {
      // 🎯 1. Cargar datos básicos del proyecto con timeout
      console.log('📋 Fase 1: Cargando datos básicos del proyecto...');
      const projectPromise = firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/users/${projectId}`) // Simulamos con users
      );
      const project = await this.fetchWithTimeout(projectPromise, 3000);

      // 🚀 2. Cargar datos relacionados en paralelo
      console.log('📊 Fase 2: Cargando datos relacionados en paralelo...');
      const [engineers, materials, progress] = await Promise.all([
        firstValueFrom(this.http.get(`${this.apiUrl}/users`)), // Simulamos ingenieros
        firstValueFrom(this.http.get(`${this.apiUrl}/products`)), // Simulamos materiales
        firstValueFrom(this.http.get(`${this.apiUrl}/orders`)) // Simulamos progreso
      ]);

      // 📦 3. Procesar materiales en lotes si hay muchos
      let processedMaterials = materials;
      if (Array.isArray(materials) && materials.length > 3) { // Límite bajo para demo
        console.log('🔧 Fase 3: Procesando materiales en lotes...');
        processedMaterials = await this.processBatch(
          materials,
          async (material: any) => {
            // Simular validación compleja de material
            await this.sleep(100);
            return { 
              ...material, 
              validated: true, 
              validatedAt: new Date().toISOString() 
            };
          },
          2 // Lotes pequeños para demo
        );
      }

      const result = {
        project,
        engineers: Array.isArray(engineers) ? engineers : [engineers],
        materials: processedMaterials,
        progress: Array.isArray(progress) ? progress : [progress],
        loadedAt: new Date(),
        summary: {
          totalEngineers: Array.isArray(engineers) ? engineers.length : 1,
          totalMaterials: Array.isArray(materials) ? materials.length : 1,
          totalTasks: Array.isArray(progress) ? progress.length : 1
        }
      };

      console.log('🎉 ¡Datos completos del proyecto cargados exitosamente!');
      console.log(`📈 Resumen: ${result.summary.totalEngineers} ingenieros, ${result.summary.totalMaterials} materiales, ${result.summary.totalTasks} tareas`);

      return result;

    } catch (error: any) {
      console.error('💥 Error cargando datos del proyecto:', error);
      
      // 🔄 Retry inteligente para errores de timeout
      if (error.message.includes('Timeout')) {
        console.log('🔄 Error de timeout detectado, aplicando retry...');
        return this.fetchWithRetry(
          () => this.loadProjectCompleteData(projectId),
          2,
          2000
        );
      }
      
      throw error;
    }
  }

  // ================================
  // UTILIDADES
  // ================================

  /**
   * 😴 SLEEP - Utilidad para pausas
   * "JavaScript no tiene un sleep nativo, así que lo creamos. Simple pero indispensable."
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🧹 CLEANUP - Limpieza de recursos
   */
  cleanup(): void {
    console.log('🧹 Limpiando timers de debounce...');
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}
