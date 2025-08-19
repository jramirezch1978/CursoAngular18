/**
 * 🔬 ASYNC FUNDAMENTALS SERVICE - LAB 1
 * 
 * "La diferencia entre código síncrono y asíncrono es fundamental. 
 * El código síncrono es como hacer cola en el banco: cada cliente debe ser 
 * atendido completamente antes de pasar al siguiente. Si alguien tarda 30 minutos, 
 * todos esperan. Es predecible pero ineficiente." - Ing. Jhonny Ramirez
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User, Order, Notification, UserCompleteData } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AsyncFundamentalsService {
  private http = inject(HttpClient);
  private apiUrl = '/api';

  // ================================
  // 1. OPERACIÓN SÍNCRONA (BLOQUEANTE)
  // ================================
  
  /**
   * ❌ DEMOSTRACIÓN: Operación síncrona bloqueante
   * 
   * Como dice el instructor: "Esta función bloquearía completamente su aplicación 
   * por 3 segundos. En el mundo web, 3 segundos es una eternidad. Los usuarios 
   * pensarían que la aplicación se colgó. Es como si un cajero del banco se fuera 
   * a almorzar mientras lo atiende."
   */
  fetchDataSync(): string {
    console.log('⚠️ INICIANDO operación SÍNCRONA - La UI se bloqueará');
    const startTime = Date.now();
    
    // 🚨 NUNCA HACER ESTO EN PRODUCCIÓN - Bloquea el hilo principal
    while (Date.now() - startTime < 3000) {
      // Simula operación pesada bloqueante
    }
    
    console.log('✅ Operación síncrona completada después de 3 segundos');
    return 'Datos obtenidos de forma síncrona (¡La UI estuvo congelada!)';
  }

  // ================================
  // 2. CALLBACKS TRADICIONALES  
  // ================================

  /**
   * 📞 CALLBACK BÁSICO
   * 
   * "El código asíncrono es como un restaurante bien organizado. El mesero toma 
   * su orden y no se queda parado esperando que el chef cocine. Atiende otras 
   * mesas, y cuando su plato está listo, se lo trae." - Ing. Jhonny Ramirez
   */
  fetchDataWithCallback(
    callback: (data: string) => void, 
    errorCallback?: (error: Error) => void
  ): void {
    console.log('🔄 Iniciando operación con CALLBACK');
    
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.2) { // 80% de éxito
        console.log('✅ Callback exitoso');
        callback('Datos obtenidos con callback - ¡UI nunca se bloqueó!');
      } else {
        console.log('❌ Callback falló');
        errorCallback?.(new Error('Error simulado en callback'));
      }
    }, 1000);
  }

  /**
   * 🌋 CALLBACK HELL - Demostración del problema
   * 
   * "El Callback Hell que ven es una pesadilla real que muchos desarrolladores 
   * vivieron. Es como esas instrucciones de muebles donde cada paso depende del 
   * anterior, pero escritas en un solo párrafo interminable." - Ing. Jhonny Ramirez
   */
  getUserDataNested(userId: number, callback: (result: UserCompleteData) => void): void {
    console.log('🌋 INICIANDO Callback Hell - Prepare for the pyramid of doom!');
    
    // Nivel 1: Obtener usuario
    this.fetchUser(userId, (user) => {
      console.log('📝 Usuario obtenido, buscando órdenes...');
      
      // Nivel 2: Obtener órdenes del usuario  
      this.fetchOrders(user.id, (orders) => {
        console.log('📋 Órdenes obtenidas, buscando notificaciones...');
        
        // Nivel 3: Obtener notificaciones
        this.fetchNotifications(user.id, (notifications) => {
          console.log('🔔 Notificaciones obtenidas, procesando preferencias...');
          
          // Nivel 4: Procesar preferencias 
          this.processPreferences(user, (preferences) => {
            console.log('⚙️ Preferencias procesadas - ¡Callback Hell completado!');
            
            // ¡Finalmente! Después de 4 niveles de anidación
            const result: UserCompleteData = {
              user,
              orders,
              notifications,
              preferences,
              lastActivity: new Date()
            };
            
            callback(result);
          });
        });
      });
    });
  }

  // ================================
  // 3. PROMISES - LA SALVACIÓN
  // ================================

  /**
   * ✨ PROMISE BÁSICA
   * 
   * "Las Promises llegaron como salvación. Transformaron la pirámide en una 
   * cadena elegante. Cada 'then' es como un paso en un proceso bien documentado." 
   * - Ing. Jhonny Ramirez
   */
  fetchDataWithPromise(): Promise<string> {
    console.log('🤝 Iniciando operación con PROMISE');
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const random = Math.random();
        if (random > 0.2) { // 80% de éxito
          console.log('✅ Promise resuelta exitosamente');
          resolve('Datos obtenidos con Promise - ¡Cadena elegante!');
        } else {
          console.log('❌ Promise rechazada');
          reject(new Error('Error simulado en Promise'));
        }
      }, 1000);
    });
  }

  /**
   * ⛓️ PROMISE CHAIN - Cadena elegante
   * 
   * "Es como tener un supervisor que sabe exactamente qué hacer cuando algo 
   * sale mal, sin importar en qué paso ocurra." - Ing. Jhonny Ramirez
   */
  getUserDataChained(userId: number): Promise<UserCompleteData> {
    console.log('⛓️ INICIANDO Promise Chain - Del caos al orden');
    
    return this.fetchUserPromise(userId)
      .then(user => {
        console.log('👤 Usuario obtenido, continuando cadena...');
        return Promise.all([
          Promise.resolve(user),
          this.fetchOrdersPromise(user.id),
          this.fetchNotificationsPromise(user.id)
        ]);
      })
      .then(([user, orders, notifications]) => {
        console.log('📦 Datos paralelos obtenidos, procesando preferencias...');
        return this.processPreferencesPromise(user)
          .then(preferences => ({
            user,
            orders,
            notifications, 
            preferences,
            lastActivity: new Date()
          }));
      });
  }

  // ================================
  // 4. ASYNC/AWAIT - LA CEREZA DEL PASTEL
  // ================================

  /**
   * 🎂 ASYNC/AWAIT - Poesía en código
   * 
   * "Async/await es la cereza del pastel. Hace que el código asíncrono se lea 
   * como síncrono. Es engañosamente simple. La función getShippingInfo es poesía 
   * en código." - Ing. Jhonny Ramirez
   */
  async getUserDataAsync(userId: number): Promise<UserCompleteData> {
    console.log('🎭 INICIANDO Async/Await - Poesía en código');
    
    try {
      // Paso 1: Obtener usuario (lee como código secuencial)
      console.log('👤 Obteniendo usuario...');
      const user = await this.fetchUserPromise(userId);
      
      // Paso 2: Obtener datos relacionados en paralelo  
      console.log('📊 Obteniendo datos relacionados en paralelo...');
      const [orders, notifications] = await Promise.all([
        this.fetchOrdersPromise(user.id),
        this.fetchNotificationsPromise(user.id)
      ]);
      
      // Paso 3: Procesar preferencias
      console.log('⚙️ Procesando preferencias del usuario...');
      const preferences = await this.processPreferencesPromise(user);
      
      console.log('✨ ¡Async/Await completado con elegancia!');
      
      // Resultado final - código limpio y legible
      return {
        user,
        orders,
        notifications,
        preferences,
        lastActivity: new Date()
      };
      
    } catch (error) {
      console.error('❌ Error en cadena async/await:', error);
      // "El try/catch envuelve todo en un manejo de errores familiar y limpio"
      throw error;
    }
  }

  // ================================
  // MÉTODOS AUXILIARES (SIMULAN APIs)
  // ================================

  private fetchUser(userId: number, callback: (user: User) => void): void {
    setTimeout(() => {
      callback({
        id: userId,
        name: `Usuario ${userId}`,
        email: `user${userId}@provias.gob.pe`,
        role: 'user',
        isActive: true
      });
    }, 500);
  }

  private fetchOrders(userId: number, callback: (orders: Order[]) => void): void {
    setTimeout(() => {
      callback([
        { id: 1, userId, products: [1, 2], total: 1500, status: 'completed' },
        { id: 2, userId, products: [3], total: 800, status: 'pending' }
      ]);
    }, 700);
  }

  private fetchNotifications(userId: number, callback: (notifications: Notification[]) => void): void {
    setTimeout(() => {
      callback([
        { id: 1, userId, message: 'Orden procesada', read: false, type: 'success' },
        { id: 2, userId, message: 'Pago confirmado', read: true, type: 'info' }
      ]);
    }, 300);
  }

  private processPreferences(user: User, callback: (preferences: any) => void): void {
    setTimeout(() => {
      callback({
        theme: 'light',
        language: 'es', 
        notifications: true
      });
    }, 400);
  }

  // Versiones Promise de los métodos auxiliares
  private fetchUserPromise(userId: number): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.apiUrl}/users/${userId}`));
  }

  private fetchOrdersPromise(userId: number): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${this.apiUrl}/orders?userId=${userId}`));
  }

  private fetchNotificationsPromise(userId: number): Promise<Notification[]> {
    return firstValueFrom(this.http.get<Notification[]>(`${this.apiUrl}/notifications?userId=${userId}`));
  }

  private processPreferencesPromise(user: User): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          theme: user.role === 'admin' ? 'dark' : 'light',
          language: 'es',
          notifications: user.isActive
        });
      }, 200);
    });
  }

  // ================================
  // UTILIDADES PARA MÉTRICAS
  // ================================

  /**
   * 📊 Utilidad para medir performance
   * "La medición es crucial para entender el impacto real de la asincronía"
   */
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    console.log(`⏱️ Midiendo performance de: ${operation}`);
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      console.log(`✅ ${operation} completado en ${duration.toFixed(2)}ms`);
      return { result, duration };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.log(`❌ ${operation} falló después de ${duration.toFixed(2)}ms`);
      throw error;
    }
  }
}
