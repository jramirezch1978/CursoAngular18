import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // 👤 Usuario actual
  currentUser: AuthUser | null = null;
  
  // 📊 Datos mock del dashboard
  stats = {
    totalProjects: 15,
    activeUsers: 8,
    completedTasks: 142,
    pendingReviews: 7
  };
  
  // 🚀 Accesos rápidos según permisos
  quickActions = [
    {
      title: 'Ver Usuarios',
      route: '/users',
      icon: '👥',
      description: 'Gestión de usuarios del sistema',
      requiredPermission: 'users:view'
    },
    {
      title: 'Ver Proyectos',
      route: '/projects',
      icon: '🏗️',
      description: 'Gestión de proyectos PROVIAS',
      requiredPermission: 'projects:view'
    },
    {
      title: 'Panel de Admin',
      route: '/admin',
      icon: '👑',
      description: 'Panel de administración (Solo Admin)',
      requiredPermission: 'admin:panel'
    }
  ];
  
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🏠 [DashboardComponent] Cargando dashboard protegido');
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * 👤 Cargar usuario actual
   */
  private loadCurrentUser(): void {
    const userSub = this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log('👤 [DashboardComponent] Usuario autenticado:', user?.fullName);
    });
    
    this.subscriptions.add(userSub);
  }

  /**
   * 🧭 Navegar a ruta
   */
  navigateTo(route: string): void {
    console.log('🧭 [DashboardComponent] Navegando a:', route);
    this.router.navigate([route]);
  }

  /**
   * 🔑 Verificar si tiene permiso para una acción
   */
  hasPermissionForAction(requiredPermission: string): boolean {
    return this.authService.hasPermission(requiredPermission as any);
  }

  /**
   * 🎯 Obtener acciones disponibles
   */
  getAvailableActions() {
    return this.quickActions.filter(action => this.hasPermissionForAction(action.requiredPermission));
  }

  /**
   * 🚪 Cerrar sesión
   */
  logout(): void {
    console.log('🚪 [DashboardComponent] Cerrando sesión desde dashboard');
    this.authService.logout('user_logout');
    this.router.navigate(['/login']);
  }
}