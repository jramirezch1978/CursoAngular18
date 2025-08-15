import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, delay, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'viewer';
  department: string;
  active: boolean;
  lastLogin: Date;
  projects: string[];
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  
  // Signals para estado
  private usersSignal = signal<User[]>([]);
  private loadingSignal = signal(false);
  private selectedUserSignal = signal<User | null>(null);
  
  // Computed signals públicos
  users = computed(() => this.usersSignal());
  loading = computed(() => this.loadingSignal());
  selectedUser = computed(() => this.selectedUserSignal());
  
  activeUsers = computed(() => 
    this.usersSignal().filter(u => u.active)
  );
  
  usersByRole = computed(() => {
    const users = this.usersSignal();
    return {
      admin: users.filter(u => u.role === 'admin'),
      manager: users.filter(u => u.role === 'manager'),
      developer: users.filter(u => u.role === 'developer'),
      viewer: users.filter(u => u.role === 'viewer')
    };
  });

  usersByDepartment = computed(() => {
    const users = this.usersSignal();
    const departments = new Map<string, User[]>();
    
    users.forEach(user => {
      if (!departments.has(user.department)) {
        departments.set(user.department, []);
      }
      departments.get(user.department)!.push(user);
    });
    
    return departments;
  });
  
  loadUsers(): Observable<User[]> {
    this.loadingSignal.set(true);
    
    // Simular llamada HTTP con datos mock
    return of(this.generateMockUsers()).pipe(
      delay(800), // Simular latencia de red
      tap(users => {
        this.usersSignal.set(users);
        this.loadingSignal.set(false);
      })
    );
  }
  
  selectUser(userId: string): void {
    const user = this.usersSignal().find(u => u.id === userId);
    this.selectedUserSignal.set(user || null);
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`
    };
    
    this.usersSignal.update(users => [...users, newUser]);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): void {
    this.usersSignal.update(users =>
      users.map(user =>
        user.id === id ? { ...user, ...updates } : user
      )
    );
  }

  deleteUser(id: string): void {
    this.usersSignal.update(users => users.filter(u => u.id !== id));
  }

  private generateMockUsers(): User[] {
    const departments = ['Ingeniería', 'Proyectos', 'Administración', 'Operaciones'];
    const names = [
      'Carlos López', 'Ana García', 'María Rodriguez', 'Jorge Mendoza',
      'Lucía Fernández', 'Pedro Martínez', 'Carmen Ruiz', 'Roberto Silva',
      'Patricia Torres', 'Fernando Vargas', 'Elena Morales', 'Diego Herrera'
    ];
    const roles: User['role'][] = ['admin', 'manager', 'developer', 'viewer'];

    return Array.from({ length: 12 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: names[i],
      email: `${names[i].toLowerCase().replace(' ', '.')}@provias.gob.pe`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      active: Math.random() > 0.1, // 90% activos
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      projects: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, 
        (_, j) => `PRY-${String(j + 1).padStart(3, '0')}`),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(names[i])}`
    }));
  }
}
