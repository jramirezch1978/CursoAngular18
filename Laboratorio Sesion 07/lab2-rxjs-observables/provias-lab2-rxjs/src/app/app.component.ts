import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subject, Subscription, BehaviorSubject, ReplaySubject } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
  
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];
  
  // Subjects para demostraciones
  private userSubject = new BehaviorSubject<User | null>(null);
  private messagesSubject = new ReplaySubject<string>(3);
  private searchSubject = new Subject<string>();
  
  // Estado de UI
  activeTab: string = 'intro';
  currentUser: User | null = null;
  messages: string[] = [];
  newMessage = '';
  searchTerm = '';
  searchStatus = 'Escribe al menos 2 caracteres para buscar...';
  searchResults: User[] = [];
  
  // Métricas
  activeSubscriptions = 0;
  eventsEmitted = 0;
  errorsHandled = 0;

  ngOnInit() {
    console.log('🌊 LAB 2: RxJS y Observables - Iniciado');
    console.log('👨‍🏫 Instructor: Ing. Jhonny Alexander Ramirez Chiroque');
    console.log('🎯 Interface RxJS personalizada cargada - NO es dashboard por defecto');
    this.setupSubscriptions();
  }

  ngOnDestroy() {
    console.log('🧹 Limpiando suscripciones RxJS...');
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions(): void {
    // Usuario actual (BehaviorSubject)
    const userSub = this.userSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.eventsEmitted++;
        if (user) {
          console.log(`👤 Usuario actualizado: ${user.name}`);
        }
      });
    this.subscriptions.push(userSub);

    // Mensajes (ReplaySubject)
    const messagesSub = this.messagesSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.messages = [...this.messages, message];
        if (this.messages.length > 3) {
          this.messages = this.messages.slice(-3);
        }
        this.eventsEmitted++;
      });
    this.subscriptions.push(messagesSub);

    // Búsqueda reactiva con switchMap
    const searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          if (term.length < 2) {
            this.searchStatus = 'Escribe al menos 2 caracteres...';
            return [];
          }
          
          this.searchStatus = '🔍 Buscando...';
          
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
        },
        error: (error) => {
          console.error('Error en búsqueda:', error);
          this.searchResults = [];
          this.searchStatus = '❌ Error en búsqueda';
          this.errorsHandled++;
        }
      });
    this.subscriptions.push(searchSub);

    this.activeSubscriptions = this.subscriptions.length;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    console.log(`📑 Cambiando a pestaña: ${tab}`);
  }

  setRandomUser(): void {
    const users: User[] = [
      { id: 1, name: 'Ana García', email: 'ana@provias.gob.pe', role: 'admin', isActive: true },
      { id: 2, name: 'Carlos López', email: 'carlos@provias.gob.pe', role: 'user', isActive: true },
      { id: 3, name: 'María Rodriguez', email: 'maria@provias.gob.pe', role: 'user', isActive: false },
      { id: 4, name: 'Juan Pérez', email: 'juan@provias.gob.pe', role: 'manager', isActive: true }
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

  onSearch(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }
}