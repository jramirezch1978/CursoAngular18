import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  
  // 🌐 Referencias a objetos globales para el template
  Object = Object;
  
  // 📊 Datos mock de usuarios
  users = [
    { id: 1, name: 'Ana García', role: 'admin', status: 'active' },
    { id: 2, name: 'Carlos Mendoza', role: 'project_manager', status: 'active' },
    { id: 3, name: 'María Rodríguez', role: 'engineer', status: 'inactive' },
    { id: 4, name: 'Luis Fernández', role: 'technician', status: 'active' }
  ];

  // 📍 Información de la ruta actual
  currentRoute = '';
  routeParams: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('👥 [UsersComponent] Página de usuarios protegida cargada');
    
    this.currentRoute = this.router.url;
    this.route.params.subscribe(params => {
      this.routeParams = params;
      console.log('📍 [UsersComponent] Parámetros de ruta:', params);
    });
  }

  /**
   * 🏠 Volver al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * 🚪 Cerrar sesión
   */
  logout(): void {
    this.authService.logout('user_logout');
    this.router.navigate(['/login']);
  }

  /**
   * 👑 Intentar acceder a admin
   */
  tryAccessAdmin(): void {
    this.router.navigate(['/admin']);
  }

  /**
   * ✅ Verificar si tiene permiso
   */
  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission as any);
  }
}