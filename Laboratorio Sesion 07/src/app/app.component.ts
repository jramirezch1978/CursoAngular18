import { Component, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface HistoryEntry {
  id: number;
  value: number;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'PROVIAS LAB 3 - Angular Signals';
  
  // ====================================
  // 📱 NAVEGACIÓN
  // ====================================
  
  activeTab = signal<string>('intro');
  
  // ====================================
  // 🔢 COUNTER DEMO - Signals Básicos
  // ====================================
  
  // Signals básicos
  count = signal(0);
  history = signal<HistoryEntry[]>([]);
  
  // Computed values - derivaciones automáticas
  doubled = computed(() => this.count() * 2);
  isEven = computed(() => this.count() % 2 === 0);
  squared = computed(() => this.count() * this.count());
  
  // ====================================
  // 👤 USER FORM DEMO - Signals Granulares
  // ====================================
  
  // Signals granulares (recomendado)
  firstName = signal('Ana');
  lastName = signal('García');
  email = signal('ana@provias.gob.pe');
  role = signal<'user' | 'admin' | 'manager'>('user');
  
  // Computed values derivados
  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
  initials = computed(() => `${this.firstName()[0]}${this.lastName()[0]}`);
  isEmailValid = computed(() => {
    const email = this.email();
    return email.includes('@') && email.includes('.') && email.length > 5;
  });
  emailDomain = computed(() => {
    const email = this.email();
    return email.includes('@') ? email.split('@')[1] : 'sin dominio';
  });
  isProviasUser = computed(() => this.email().includes('@provias.gob.pe'));
  accessLevel = computed(() => {
    const role = this.role();
    switch (role) {
      case 'admin': return 'Administrador Total';
      case 'manager': return 'Gerente de Área';
      default: return 'Usuario Estándar';
    }
  });
  
  // ====================================
  // 🔍 SEARCH DEMO - Effects en Acción
  // ====================================
  
  searchTerm = signal('');
  isSearching = signal(false);
  searchResults = signal<any[]>([]);
  lastSaved = signal<string | null>(null);
  isAnimating = signal(false);
  effectsExecuted = signal(0);
  
  // ====================================
  // 📝 TODO APP - Aplicación Completa
  // ====================================
  
  todos = signal<Todo[]>([]);
  currentFilter = signal<'all' | 'active' | 'completed'>('all');
  newTodo = '';
  
  // Computed todos
  activeTodos = computed(() => 
    this.todos().filter(todo => !todo.completed)
  );
  
  completedTodos = computed(() => 
    this.todos().filter(todo => todo.completed)
  );
  
  filteredTodos = computed(() => {
    const filter = this.currentFilter();
    const todos = this.todos();
    
    switch (filter) {
      case 'active': return this.activeTodos();
      case 'completed': return this.completedTodos();
      default: return todos;
    }
  });
  
  completionPercentage = computed(() => {
    const total = this.todos().length;
    if (total === 0) return 0;
    const completed = this.completedTodos().length;
    return Math.round((completed / total) * 100);
  });
  
  // Filtros con contadores dinámicos
  filters = [
    { 
      value: 'all' as const, 
      label: 'Todos', 
      count: computed(() => this.todos().length) 
    },
    { 
      value: 'active' as const, 
      label: 'Activos', 
      count: computed(() => this.activeTodos().length) 
    },
    { 
      value: 'completed' as const, 
      label: 'Completados', 
      count: computed(() => this.completedTodos().length) 
    }
  ];

  constructor() {
    console.log('🔮 LAB 3: Angular Signals - La Revolución Silenciosa');
    console.log('👨‍🏫 Instructor: Ing. Jhonny Alexander Ramirez Chiroque');
    
    this.setupEffects();
    this.loadInitialData();
  }

  // ====================================
  // ⚡ EFFECTS - CONFIGURACIÓN
  // ====================================

  private setupEffects(): void {
    // 📚 Effect: Actualizar historial cuando count cambie
    effect(() => {
      const currentCount = this.count();
      const timestamp = new Date().toLocaleTimeString();
      
      this.history.update(prev => [
        { id: Date.now(), value: currentCount, timestamp },
        ...prev.slice(0, 9) // Mantener solo últimos 10
      ]);
      
      this.effectsExecuted.update(v => v + 1);
      console.log(`📊 Count cambió a: ${currentCount}`);
    });

    // 🔍 Effect: Auto-búsqueda cuando searchTerm cambie
    effect(() => {
      const term = this.searchTerm();
      
      if (term.length > 2) {
        // untracked previene dependencia circular
        untracked(() => {
          this.isSearching.set(true);
          this.performSearch(term);
        });
      } else {
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });

    // 💾 Effect: Persistencia automática de todos
    effect(() => {
      const todos = this.todos();
      localStorage.setItem('provias-todos', JSON.stringify(todos));
      
      if (todos.length > 0) {
        this.lastSaved.set(new Date().toLocaleTimeString());
        console.log(`💾 ${todos.length} todos guardados automáticamente`);
      }
    });

    // 📊 Effect: Logging de estadísticas
    effect(() => {
      const stats = {
        total: this.todos().length,
        active: this.activeTodos().length,
        completed: this.completedTodos().length,
        percentage: this.completionPercentage()
      };
      console.log('📊 Todo Stats:', stats);
    });

    // 🎨 Effect con cleanup para animaciones
    effect((onCleanup) => {
      const isAnimating = this.isAnimating();
      
      if (isAnimating) {
        const animationClass = 'signals-animation-active';
        document.body.classList.add(animationClass);
        
        const timeout = setTimeout(() => {
          this.isAnimating.set(false);
        }, 3000);
        
        // 🧹 Cleanup cuando effect se re-ejecuta
        onCleanup(() => {
          document.body.classList.remove(animationClass);
          clearTimeout(timeout);
        });
      }
    });
  }

  // ====================================
  // 🎮 MÉTODOS DE INTERACCIÓN
  // ====================================

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    console.log(`📑 Cambiando a pestaña: ${tab}`);
  }

  // Counter methods
  increment(): void {
    this.count.update(v => v + 1);
  }

  decrement(): void {
    this.count.update(v => v - 1);
  }

  reset(): void {
    this.count.set(0);
  }

  // User form methods
  updateFirstName(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.firstName.set(value);
  }

  updateLastName(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.lastName.set(value);
  }

  updateEmail(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.email.set(value);
  }

  updateRole(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'user' | 'admin' | 'manager';
    this.role.set(value);
  }

  // Search methods
  updateSearchTerm(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  private async performSearch(term: string): Promise<void> {
    try {
      // Simular búsqueda asíncrona
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUsers = [
        { id: 1, name: 'Ana García', email: 'ana@provias.gob.pe' },
        { id: 2, name: 'Carlos López', email: 'carlos@provias.gob.pe' },
        { id: 3, name: 'María Rodriguez', email: 'maria@provias.gob.pe' },
        { id: 4, name: 'Juan Pérez', email: 'juan@provias.gob.pe' },
        { id: 5, name: 'Lucia Fernandez', email: 'lucia@provias.gob.pe' }
      ];
      
      const results = mockUsers.filter(user => 
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      );
      
      this.searchResults.set(results);
      this.isSearching.set(false);
      console.log(`🔍 Búsqueda completada: ${results.length} resultados para "${term}"`);
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      this.searchResults.set([]);
      this.isSearching.set(false);
    }
  }

  // Animation method
  triggerAnimation(): void {
    this.isAnimating.set(true);
    console.log('🎨 Animación activada por 3 segundos');
  }

  // ====================================
  // 📝 TODO APP METHODS
  // ====================================

  addTodo(): void {
    if (this.newTodo.trim()) {
      const newTodoItem: Todo = {
        id: Date.now(),
        text: this.newTodo.trim(),
        completed: false,
        createdAt: new Date()
      };
      
      this.todos.update(todos => [...todos, newTodoItem]);
      this.newTodo = '';
      console.log(`✅ Todo agregado: ${newTodoItem.text}`);
    }
  }

  toggleTodo(id: number): void {
    this.todos.update(todos =>
      todos.map(todo =>
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
    console.log(`🔄 Todo ${id} toggled`);
  }

  removeTodo(id: number): void {
    this.todos.update(todos => todos.filter(todo => todo.id !== id));
    console.log(`❌ Todo ${id} eliminado`);
  }

  clearCompleted(): void {
    const completedCount = this.completedTodos().length;
    this.todos.update(todos => todos.filter(todo => !todo.completed));
    console.log(`🧹 ${completedCount} todos completados eliminados`);
  }

  clearAll(): void {
    const totalCount = this.todos().length;
    this.todos.set([]);
    console.log(`🗑️ ${totalCount} todos eliminados completamente`);
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter.set(filter);
    console.log(`🔽 Filtro cambiado a: ${filter}`);
  }

  // ====================================
  // 📊 MÉTRICAS Y UTILIDADES
  // ====================================

  getSignalCount(): number {
    // Contar signals principales
    return 8; // count, history, firstName, lastName, email, role, searchTerm, todos, etc.
  }

  getComputedCount(): number {
    // Contar computed values
    return 12; // doubled, isEven, squared, fullName, initials, etc.
  }

  private loadInitialData(): void {
    // Cargar todos desde localStorage
    const stored = localStorage.getItem('provias-todos');
    if (stored) {
      try {
        const todos = JSON.parse(stored);
        this.todos.set(todos);
        console.log(`🔄 ${todos.length} todos cargados desde localStorage`);
      } catch (error) {
        console.error('❌ Error cargando todos:', error);
      }
    }

    // Datos de ejemplo si no hay todos guardados
    if (this.todos().length === 0) {
      const exampleTodos: Todo[] = [
        {
          id: 1,
          text: 'Revisar proyecto de carretera Norte',
          completed: false,
          createdAt: new Date()
        },
        {
          id: 2,
          text: 'Aprobar presupuesto Q4',
          completed: true,
          createdAt: new Date()
        },
        {
          id: 3,
          text: 'Reunión con ingenieros de puentes',
          completed: false,
          createdAt: new Date()
        }
      ];
      
      this.todos.set(exampleTodos);
      console.log('📝 Datos de ejemplo cargados');
    }
  }
}