import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subject, Subscription, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs';
import { takeUntil, map, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PROVIAS LAB 2 - RxJS y Observables';
  
  // Servicios inyectados
  private http = inject(HttpClient);
  
  // 🧹 Cleanup
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];
  
  // 🎭 Subjects para demostraciones
  private userSubject = new BehaviorSubject<User | null>(null);
  private messagesSubject = new ReplaySubject<string>(3); // Últimos 3 mensajes
  private dataSubject = new Subject<any>();
  private searchSubject = new Subject<string>();
  
  // 📱 Estado de UI
  activeTab: string = 'intro';
  
  // 👤 Usuario actual
  currentUser: User | null = null;
  
  // 💬 Mensajes
  messages: string[] = [];
  newMessage = '';
  
  // 🔍 Búsqueda
  searchTerm = '';
  searchStatus = 'Escribe al menos 2 caracteres para buscar...';
  searchResults: User[] = [];
  
  // 🔄 Resultados de transformaciones
  transformResults: Array<{operator: string, data: any}> = [];
  
  // 🔗 Resultados de combinaciones
  combinationResults: Array<{type: string, data: any}> = [];
  
  // 📋 Log de errores
  errorLogs: Array<{time: string, message: string, type: 'info' | 'error'}> = [];
  
  // 📊 Métricas
  activeSubscriptions = 0;
  eventsEmitted = 0;
  errorsHandled = 0;

  ngOnInit() {
    console.log('🌊 LAB 2: RxJS y Observables - Iniciado');
    console.log('👨‍🏫 Instructor: Ing. Jhonny Alexander Ramirez Chiroque');
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    console.log('🧹 Limpiando suscripciones...');
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ====================================
  // CONFIGURACIÓN DE SUSCRIPCIONES
  // ====================================

  private setupSubscriptions(): void {
    // 👤 Suscripción a cambios de usuario (BehaviorSubject)
    const userSub = this.userSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.eventsEmitted++;
        if (user) {
          this.logEvent(`👤 Usuario actualizado: ${user.name}`);
        }
      });
    this.subscriptions.push(userSub);

    // 💬 Suscripción a mensajes (ReplaySubject)  
    const messagesSub = this.messagesSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.messages = [...this.messages, message];
        if (this.messages.length > 3) {
          this.messages = this.messages.slice(-3); // Mantener solo últimos 3
        }
        this.eventsEmitted++;
        this.logEvent(`💬 Mensaje agregado: ${message.substring(0, 30)}...`);
      });
    this.subscriptions.push(messagesSub);

    // 🔍 Búsqueda reactiva con switchMap
    const searchSub = this.searchSubject
      .pipe(
        debounceTime(300), // Esperar 300ms después de escribir
        distinctUntilChanged(), // Solo buscar si cambió
        switchMap(term => {
          if (term.length < 2) {
            this.searchStatus = 'Escribe al menos 2 caracteres...';
            return [];
          }
          
          this.searchStatus = '🔍 Buscando...';
          
          // Simular búsqueda en API
          return this.http.get<User[]>('/api/users').pipe(
            map(users => users.filter(user => 
              user.name.toLowerCase().includes(term.toLowerCase()) ||
              user.email.toLowerCase().includes(term.toLowerCase())
            )),
            map(results => {
              this.searchStatus = `📋 ${results.length} resultados encontrados`;
              return results;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results;
          this.eventsEmitted++;
          this.logEvent(`🔍 Búsqueda completada: ${results.length} resultados`);
        },
        error: (error) => {
          console.error('Error en búsqueda:', error);
          this.searchResults = [];
          this.searchStatus = '❌ Error en búsqueda';
          this.errorsHandled++;
          this.logEvent(`❌ Error en búsqueda: ${error.message}`, 'error');
        }
      });
    this.subscriptions.push(searchSub);

    this.activeSubscriptions = this.subscriptions.length;
  }

  // ====================================
  // NAVEGACIÓN
  // ====================================

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    console.log(`📑 Cambiando a pestaña: ${tab}`);
  }

  // ====================================
  // SUBJECTS DEMO
  // ====================================

  setRandomUser(): void {
    const users: User[] = [
      { id: 1, name: 'Ana García', email: 'ana@provias.gob.pe', role: 'admin', isActive: true },
      { id: 2, name: 'Carlos López', email: 'carlos@provias.gob.pe', role: 'user', isActive: true },
      { id: 3, name: 'María Rodriguez', email: 'maria@provias.gob.pe', role: 'user', isActive: false },
      { id: 4, name: 'Juan Pérez', email: 'juan@provias.gob.pe', role: 'manager', isActive: true },
      { id: 5, name: 'Lucia Fernandez', email: 'lucia@provias.gob.pe', role: 'user', isActive: true }
    ];
    
    const randomUser = users[Math.floor(Math.random() * users.length)];
    this.userSubject.next(randomUser);
    console.log('👤 Usuario actualizado mediante BehaviorSubject:', randomUser.name);
  }

  addMessage(): void {
    if (this.newMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      const message = `[${timestamp}] ${this.newMessage}`;
      this.messagesSubject.next(message);
      this.newMessage = '';
      console.log('💬 Mensaje agregado al ReplaySubject');
    }
  }

  broadcastData(): void {
    const data = {
      timestamp: new Date().toISOString(),
      message: 'Broadcast desde Subject simple',
      random: Math.floor(Math.random() * 1000)
    };
    
    this.dataSubject.next(data);
    this.logEvent(`📡 Broadcasting data: ${data.message}`);
    console.log('📡 Data broadcast a todos los suscriptores');
  }

  // ====================================
  // BÚSQUEDA REACTIVA
  // ====================================

  onSearch(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  // ====================================
  // OPERADORES DE TRANSFORMACIÓN
  // ====================================

  testTransformOperators(): void {
    this.transformResults = [];
    this.logEvent('🔄 Iniciando test de operadores de transformación');

    // MAP - Transformar nombres a mayúsculas
    const mapSub = this.http.get<User[]>('/api/users')
      .pipe(
        map(users => users.map(user => user.name.toUpperCase())),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (names) => {
          this.transformResults.push({ 
            operator: '🗺️ MAP - Nombres en mayúsculas', 
            data: names 
          });
          this.eventsEmitted++;
          this.logEvent('✅ MAP: Transformación completada');
        },
        error: (error) => {
          this.errorsHandled++;
          this.logEvent(`❌ Error en MAP: ${error.message}`, 'error');
        }
      });
    this.subscriptions.push(mapSub);

    // FILTER - Solo usuarios activos
    const filterSub = this.http.get<User[]>('/api/users')
      .pipe(
        map(users => users.filter(user => user.isActive)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (activeUsers) => {
          this.transformResults.push({ 
            operator: '🚪 FILTER - Solo usuarios activos', 
            data: activeUsers 
          });
          this.eventsEmitted++;
          this.logEvent(`✅ FILTER: ${activeUsers.length} usuarios activos`);
        },
        error: (error) => {
          this.errorsHandled++;
          this.logEvent(`❌ Error en FILTER: ${error.message}`, 'error');
        }
      });
    this.subscriptions.push(filterSub);
  }

  // ====================================
  // OPERADORES DE COMBINACIÓN
  // ====================================

  testCombineLatest(): void {
    this.logEvent('🔄 Iniciando CombineLatest...');
    // Simulación de combineLatest con datos mock
    const mockData = {
      users: ['Ana', 'Carlos', 'María'],
      products: ['Laptop', 'Mouse', 'Teclado'],
      timestamp: new Date().toISOString()
    };
    
    this.combinationResults.unshift({ 
      type: '🔄 CombineLatest - Dashboard en tiempo real', 
      data: mockData 
    });
    this.eventsEmitted++;
    this.logEvent('✅ CombineLatest: Dashboard actualizado');
  }

  testForkJoin(): void {
    this.logEvent('🍴 Iniciando ForkJoin - esperando todos...');
    
    // Simular ForkJoin esperando múltiples APIs
    setTimeout(() => {
      const allData = {
        users: 5,
        products: 3, 
        orders: 4,
        completedAt: new Date().toISOString()
      };
      
      this.combinationResults.unshift({ 
        type: '🍴 ForkJoin - Todo listo definitivo', 
        data: allData 
      });
      this.eventsEmitted++;
      this.logEvent('✅ ForkJoin: Todos los datos cargados');
    }, 1500);
  }

  testMerge(): void {
    this.logEvent('🌊 Iniciando Merge - múltiples streams...');
    
    // Simular múltiples streams convergiendo
    const notifications = [
      'Nuevo usuario registrado',
      'Producto actualizado', 
      'Orden procesada'
    ];
    
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        const existing = this.combinationResults.find(r => r.type.includes('Merge'));
        if (existing) {
          if (!Array.isArray(existing.data)) {
            existing.data = [];
          }
          existing.data.push({
            id: Date.now() + index,
            message: notification,
            timestamp: new Date().toISOString()
          });
        } else {
          this.combinationResults.unshift({ 
            type: '🌊 Merge - Múltiples mangueras', 
            data: [{
              id: Date.now() + index,
              message: notification,
              timestamp: new Date().toISOString()
            }]
          });
        }
        this.eventsEmitted++;
        this.logEvent(`🌊 Merge: ${notification}`);
      }, index * 500);
    });
  }

  testZip(): void {
    this.logEvent('🤐 Iniciando Zip - emparejamiento estricto...');
    
    // Simular ZIP con emparejamiento por índice
    const pairs = [
      { user: 'Ana García', project: 'Carretera Norte' },
      { user: 'Carlos López', project: 'Puente Central' },
      { user: 'María Rodriguez', project: 'Túnel Sur' }
    ];
    
    this.combinationResults.unshift({ 
      type: '🤐 Zip - Parejas de baile', 
      data: pairs 
    });
    this.eventsEmitted++;
    this.logEvent('✅ Zip: Emparejamiento completado');
  }

  // ====================================
  // MANEJO DE ERRORES
  // ====================================

  testRetry(): void {
    this.logEvent('🔄 Iniciando test de retry...');
    
    // Simular operación que falla las primeras veces
    let attempts = 0;
    const flakyOperation = () => {
      attempts++;
      return new Promise<User[]>((resolve, reject) => {
        setTimeout(() => {
          if (attempts < 3) {
            reject(new Error(`Intento ${attempts} falló - error transitorio`));
          } else {
            resolve([
              { id: 1, name: 'Ana García', email: 'ana@provias.gob.pe', role: 'admin', isActive: true }
            ]);
          }
        }, 300);
      });
    };

    // Simular retry pattern
    this.simulateRetry(flakyOperation);
  }

  private simulateRetry(operation: () => Promise<User[]>): void {
    operation()
      .then(users => {
        this.logEvent(`✅ Retry exitoso: ${users.length} usuarios cargados`);
        this.eventsEmitted++;
      })
      .catch(error => {
        this.logEvent(`⏳ Reintentando después de: ${error.message}`);
        setTimeout(() => {
          this.simulateRetry(operation);
        }, 1000);
      });
  }

  testTimeout(): void {
    this.logEvent('⏰ Testing timeout con fallback...');
    
    // Simular operación lenta
    const slowOperation = new Promise<User[]>(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Ana García (timeout test)', email: 'ana@provias.gob.pe', role: 'admin', isActive: true }
        ]);
      }, 2000);
    });
    
    // Simular timeout después de 1.5 segundos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout después de 1.5s'));
      }, 1500);
    });
    
    Promise.race([slowOperation, timeoutPromise])
      .then(users => {
        this.logEvent(`✅ Datos cargados: ${users.length} usuarios`);
        this.eventsEmitted++;
      })
      .catch(error => {
        this.logEvent(`⏰ Timeout ejecutado: ${error.message}`, 'error');
        this.errorsHandled++;
      });
  }

  testCachedData(): void {
    this.logEvent('💾 Cargando datos cacheados...');
    
    // Primera llamada - del servidor
    this.http.get<User[]>('/api/users')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.logEvent(`📥 Primera llamada: ${users.length} usuarios del servidor`);
          this.eventsEmitted++;
          
          // Segunda llamada - simular caché
          setTimeout(() => {
            this.logEvent(`💾 Segunda llamada: datos desde caché (instantáneo)`);
            this.eventsEmitted++;
          }, 500);
        },
        error: (error) => {
          this.logEvent(`❌ Error cargando datos: ${error.message}`, 'error');
          this.errorsHandled++;
        }
      });
  }

  // ====================================
  // UTILIDADES
  // ====================================

  private logEvent(message: string, type: 'info' | 'error' = 'info'): void {
    const time = new Date().toLocaleTimeString();
    this.errorLogs.unshift({ time, message, type });
    
    // Mantener solo últimos 15 logs
    if (this.errorLogs.length > 15) {
      this.errorLogs = this.errorLogs.slice(0, 15);
    }
    
    console.log(`[${time}] ${message}`);
  }
}