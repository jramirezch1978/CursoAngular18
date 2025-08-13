# LAB 2: MIGRACIÓN A COMPONENTES STANDALONE

**Duración:** 45 minutos  
**Objetivo:** Migrar componentes NgModule a Standalone y optimizar imports

## 🎯 QUÉ VAS A APRENDER

- Migración de NgModules a componentes standalone
- Optimización de imports específicos
- Servicios modernos con Signals
- Dashboard de métricas reactivo
- Integración de múltiples servicios standalone

## 📋 PASO 1: Preparar Componente Legacy (5 minutos)

### 1.1 Crear ejemplo de componente legacy (antes de migración)

Crear archivo `examples/user-dashboard-legacy.component.ts.example`:

```typescript
// CÓDIGO LEGACY - Antes de migración
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { MetricsService } from '../services/metrics.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  users: any[] = [];
  metrics: any = {};
  loading = false;
  selectedPeriod = 'month';

  constructor(
    private userService: UserService,
    private metricsService: MetricsService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.updateMetrics();
      this.loading = false;
    });
  }

  updateMetrics() {
    this.metrics = this.metricsService.calculateMetrics(this.users);
  }
}
```

## 🔧 PASO 2: Crear Servicios Modernos (10 minutos)

### 2.1 Crear servicio de usuarios con signals

```bash
ng generate service features/user-management/services/user --skip-tests
```

Crear `src/app/features/user-management/services/user.service.ts`:

```typescript
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
```

### 2.2 Crear servicio de métricas

```bash
ng generate service features/user-management/services/metrics --skip-tests
```

Crear `src/app/features/user-management/services/metrics.service.ts`:

```typescript
import { Injectable, computed, inject } from '@angular/core';
import { UserService } from './user.service';

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  averageProjectsPerUser: number;
  departmentDistribution: Record<string, number>;
  recentlyActive: number;
  growthRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private userService = inject(UserService);
  
  metrics = computed((): UserMetrics => {
    const users = this.userService.users();
    
    if (users.length === 0) {
      return this.getEmptyMetrics();
    }
    
    const departmentCount = users.reduce((acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentlyActive = users.filter(u => 
      u.active && new Date(u.lastLogin) > weekAgo
    ).length;
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.active).length,
      inactiveUsers: users.filter(u => !u.active).length,
      usersByRole: {
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        developer: users.filter(u => u.role === 'developer').length,
        viewer: users.filter(u => u.role === 'viewer').length
      },
      averageProjectsPerUser: users.length > 0 
        ? users.reduce((sum, u) => sum + u.projects.length, 0) / users.length 
        : 0,
      departmentDistribution: departmentCount,
      recentlyActive,
      growthRate: this.calculateGrowthRate(users)
    };
  });

  // Métricas específicas por departamento
  departmentMetrics = computed(() => {
    const users = this.userService.users();
    const departments = this.userService.usersByDepartment();
    const metrics = new Map<string, any>();

    departments.forEach((deptUsers, department) => {
      const activeCount = deptUsers.filter(u => u.active).length;
      const avgProjects = deptUsers.reduce((sum, u) => sum + u.projects.length, 0) / deptUsers.length;
      
      metrics.set(department, {
        total: deptUsers.length,
        active: activeCount,
        inactive: deptUsers.length - activeCount,
        averageProjects: Math.round(avgProjects * 10) / 10,
        roles: deptUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    });

    return metrics;
  });

  // Tendencias temporales
  trends = computed(() => {
    const users = this.userService.users();
    const now = new Date();
    
    return {
      lastWeekLogins: users.filter(u => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(u.lastLogin) > weekAgo;
      }).length,
      lastMonthLogins: users.filter(u => {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return new Date(u.lastLogin) > monthAgo;
      }).length,
      activePercentage: users.length > 0 
        ? Math.round((users.filter(u => u.active).length / users.length) * 100)
        : 0
    };
  });
  
  private getEmptyMetrics(): UserMetrics {
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByRole: {},
      averageProjectsPerUser: 0,
      departmentDistribution: {},
      recentlyActive: 0,
      growthRate: 0
    };
  }

  private calculateGrowthRate(users: any[]): number {
    // Simular cálculo de tasa de crecimiento
    // En una aplicación real, esto vendría de datos históricos
    const baseGrowth = Math.random() * 20 - 5; // Entre -5% y 15%
    return Math.round(baseGrowth * 10) / 10;
  }
}
```

## 🚀 PASO 3: Migrar Componente a Standalone (15 minutos)

### 3.1 Crear componente standalone migrado

```bash
ng generate component features/user-management/user-dashboard --standalone
```

Actualizar `src/app/features/user-management/user-dashboard/user-dashboard.component.ts`:

```typescript
import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MetricsService } from '../services/metrics.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  // Servicios inyectados con inject()
  private userService = inject(UserService);
  private metricsService = inject(MetricsService);
  private notificationService = inject(NotificationService);
  
  // Signals del servicio
  users = this.userService.users;
  loading = this.userService.loading;
  metrics = this.metricsService.metrics;
  departmentMetrics = this.metricsService.departmentMetrics;
  trends = this.metricsService.trends;
  usersByRole = this.userService.usersByRole;
  
  // Signals locales
  selectedPeriod = signal<'day' | 'week' | 'month' | 'year'>('month');
  showChart = signal(true);
  selectedDepartment = signal<string | null>(null);
  viewMode = signal<'grid' | 'table'>('grid');
  
  // Computed para datos del gráfico
  chartData = computed(() => {
    const metrics = this.metrics();
    const period = this.selectedPeriod();
    
    return this.prepareChartData(metrics, period);
  });

  // Computed para usuarios filtrados
  filteredUsers = computed(() => {
    const users = this.users();
    const selectedDept = this.selectedDepartment();
    
    if (!selectedDept) return users;
    
    return users.filter(user => user.department === selectedDept);
  });

  // Array de departamentos para el selector
  departments = computed(() => {
    const deptMap = this.userService.usersByDepartment();
    return Array.from(deptMap.keys()).sort();
  });
  
  constructor() {
    // Effect para logging
    effect(() => {
      const userCount = this.users().length;
      console.log(`📊 Dashboard: ${userCount} usuarios cargados`);
    });

    // Effect para notificaciones automáticas
    effect(() => {
      const metrics = this.metrics();
      if (metrics.totalUsers > 0) {
        const inactivePercentage = (metrics.inactiveUsers / metrics.totalUsers) * 100;
        if (inactivePercentage > 20) {
          this.notificationService.warning(
            'Alto porcentaje de usuarios inactivos',
            `${Math.round(inactivePercentage)}% de usuarios están inactivos`
          );
        }
      }
    });
  }
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.notificationService.info('Cargando usuarios', 'Obteniendo datos del servidor...');
    
    this.userService.loadUsers().subscribe({
      next: () => {
        this.notificationService.success('Usuarios cargados', 'Datos actualizados correctamente');
        console.log('✅ Usuarios cargados exitosamente');
      },
      error: (err) => {
        this.notificationService.error('Error al cargar usuarios', err.message);
        console.error('❌ Error cargando usuarios:', err);
      }
    });
  }
  
  changePeriod(period: 'day' | 'week' | 'month' | 'year'): void {
    this.selectedPeriod.set(period);
    this.notificationService.info('Período actualizado', `Mostrando datos de: ${period}`);
  }

  selectDepartment(department: string | null): void {
    this.selectedDepartment.set(department);
    const message = department 
      ? `Filtrando por: ${department}` 
      : 'Mostrando todos los departamentos';
    this.notificationService.info('Filtro aplicado', message);
  }

  changeViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  selectUser(userId: string): void {
    this.userService.selectUser(userId);
    const user = this.userService.selectedUser();
    if (user) {
      this.notificationService.info('Usuario seleccionado', `${user.name} - ${user.role}`);
    }
  }

  toggleUserStatus(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      this.userService.updateUser(userId, { active: !user.active });
      const status = !user.active ? 'activado' : 'desactivado';
      this.notificationService.success('Estado actualizado', `Usuario ${status}`);
    }
  }

  deleteUser(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user && confirm(`¿Está seguro de eliminar a ${user.name}?`)) {
      this.userService.deleteUser(userId);
      this.notificationService.warning('Usuario eliminado', `${user.name} fue eliminado del sistema`);
    }
  }

  getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      admin: '👑',
      manager: '👔',
      developer: '💻',
      viewer: '👁️'
    };
    return icons[role] || '👤';
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      admin: '#dc3545',
      manager: '#fd7e14',
      developer: '#20c997',
      viewer: '#6f42c1'
    };
    return colors[role] || '#6c757d';
  }

  getDepartmentColor(department: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const index = department.charCodeAt(0) % colors.length;
    return colors[index];
  }
  
  private prepareChartData(metrics: any, period: string): any {
    // Lógica de preparación de datos para gráficos
    return {
      labels: this.getLabelsForPeriod(period),
      datasets: [{
        label: 'Usuarios Activos',
        data: this.getDataForPeriod(metrics, period),
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2
      }]
    };
  }
  
  private getLabelsForPeriod(period: string): string[] {
    switch (period) {
      case 'day': return ['00:00', '06:00', '12:00', '18:00', '24:00'];
      case 'week': return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      case 'month': return ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      case 'year': return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      default: return [];
    }
  }
  
  private getDataForPeriod(metrics: any, period: string): number[] {
    // Datos simulados basados en métricas
    const base = metrics.activeUsers || 0;
    switch (period) {
      case 'day': return [base * 0.6, base * 0.8, base, base * 0.9, base * 0.7];
      case 'week': return Array(7).fill(0).map(() => base + Math.random() * 10);
      case 'month': return Array(4).fill(0).map(() => base + Math.random() * 20);
      case 'year': return Array(12).fill(0).map(() => base + Math.random() * 30);
      default: return [];
    }
  }
}
```

## 📝 PASO 4: Crear Template Migrado (10 minutos)

Ver archivo completo del template en el directorio del laboratorio...

## 🎨 PASO 5: Agregar Estilos (5 minutos)

Ver archivo completo de estilos en el directorio del laboratorio...

## 🧪 TESTING

Crear archivo de test para verificar la migración:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';

describe('UserDashboardComponent (Standalone)', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent] // Import the standalone component
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    expect(component.loadData).toHaveBeenCalled();
  });
});
```

## 🚀 COMANDOS PARA VERIFICACIÓN

```bash
# Compilar proyecto
ng build

# Verificar componentes standalone
grep -r "standalone: true" src/app/features/

# Verificar uso de inject()
grep -r "inject(" src/app/features/user-management/

# Ejecutar tests
ng test --include='**/user-dashboard.component.spec.ts'

# Verificar bundle size
ng build --configuration production --source-map
```

## ✅ CHECKLIST LAB 2

- [ ] UserService con signals implementado
- [ ] MetricsService con computed signals funcionando
- [ ] UserDashboardComponent migrado a standalone
- [ ] Template utilizando sintaxis @if/@for
- [ ] Estilos aplicados correctamente
- [ ] Servicios inyectados con inject()
- [ ] Computed signals para métricas automáticas
- [ ] Effects para logging y notificaciones
- [ ] Filtrado por departamento funcionando
- [ ] Tests pasando para componente standalone
- [ ] Aplicación compilando sin errores

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### ANTES (NgModule)
- 15+ líneas de imports en módulo
- Constructor injection verboso
- Manejo manual de subscripciones
- Estado mutable con BehaviorSubjects
- Acoplamiento fuerte al módulo

### DESPUÉS (Standalone)
- Imports explícitos y mínimos
- inject() moderno y flexible
- Signals reactivos automáticos
- Estado inmutable con signals
- Componente completamente independiente

## 🎯 ¡Siguiente: LAB 3!

¡Excelente trabajo! Has migrado exitosamente a componentes standalone. Ahora vamos a explorar providers avanzados y jerarquía de inyectores.
