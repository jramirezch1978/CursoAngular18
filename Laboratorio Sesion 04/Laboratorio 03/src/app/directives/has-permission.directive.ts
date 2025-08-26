import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, inject } from '@angular/core';

// Simulación de un servicio de permisos
export interface PermissionService {
  hasPermission(permission: string): boolean;
  getUserRole(): string;
}

export const MOCK_PERMISSION_SERVICE: PermissionService = {
  // Simulamos algunos permisos para demostración
  hasPermission(permission: string): boolean {
    const userRole = this.getUserRole();
    const permissions = {
      'admin': ['read', 'write', 'delete', 'edit-users', 'view-reports'],
      'user': ['read', 'write'],
      'guest': ['read']
    };
    
    return permissions[userRole as keyof typeof permissions]?.includes(permission) || false;
  },
  
  getUserRole(): string {
    // Para demostración, alternamos entre diferentes roles
    const roles = ['admin', 'user', 'guest'];
    const savedRole = localStorage.getItem('userRole');
    if (savedRole && roles.includes(savedRole)) {
      return savedRole;
    }
    // Por defecto, devolvemos 'user'
    return 'user';
  }
};

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission!: string;
  @Input() permissionMode: 'show' | 'hide' = 'show'; // show: muestra si tiene permiso, hide: oculta si tiene permiso
  
  private hasView = false;
  private permissionService = MOCK_PERMISSION_SERVICE;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    const hasPermission = this.permissionService.hasPermission(this.appHasPermission);
    
    // Lógica basada en el modo
    const shouldShow = this.permissionMode === 'show' ? hasPermission : !hasPermission;
    
    if (shouldShow && !this.hasView) {
      // Mostrar el contenido
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!shouldShow && this.hasView) {
      // Ocultar el contenido
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  // Método público para cambiar el rol del usuario (solo para demostración)
  static changeUserRole(role: 'admin' | 'user' | 'guest') {
    localStorage.setItem('userRole', role);
    // En una aplicación real, esto triggearía una actualización de todas las directivas
    window.location.reload();
  }
}
