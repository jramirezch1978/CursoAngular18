import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../models/auth';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss'
})
export class AccessDeniedComponent implements OnInit {
  
  // 📊 Información del acceso denegado
  reason = '';
  requiredPermissions: string[] = [];
  attemptedUrl = '';
  currentUser: AuthUser | null = null;
  
  // 🎯 Acciones sugeridas
  suggestedActions = [
    {
      title: 'Contactar Administrador',
      description: 'Solicita permisos adicionales al administrador del sistema',
      icon: '👨‍💼',
      action: () => this.contactAdmin()
    },
    {
      title: 'Ir al Dashboard',
      description: 'Volver a la página principal donde tienes acceso',
      icon: '🏠',
      action: () => this.goToDashboard()
    },
    {
      title: 'Cambiar de Usuario',
      description: 'Cerrar sesión e iniciar con un usuario diferente',
      icon: '🔄',
      action: () => this.changeUser()
    },
    {
      title: 'Ver Mis Permisos',
      description: 'Revisar qué permisos tienes actualmente',
      icon: '🔑',
      action: () => this.viewMyPermissions()
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🔒 [AccessDeniedComponent] Página de acceso denegado cargada');
    
    this.loadCurrentUser();
    this.parseUrlParameters();
  }

  /**
   * 👤 Cargar usuario actual
   */
  private loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      console.log('👤 [AccessDeniedComponent] Usuario actual:', user?.fullName);
    });
  }

  /**
   * 📖 Parsear parámetros de la URL
   */
  private parseUrlParameters(): void {
    this.route.queryParams.subscribe(params => {
      this.reason = params['reason'] || 'unknown';
      this.attemptedUrl = params['attemptedUrl'] || '';
      
      const permissionsParam = params['requiredPermissions'];
      if (permissionsParam) {
        this.requiredPermissions = permissionsParam.split(',');
      }
      
      console.log('📖 [AccessDeniedComponent] Parámetros:', {
        reason: this.reason,
        attemptedUrl: this.attemptedUrl,
        requiredPermissions: this.requiredPermissions
      });
    });
  }

  /**
   * 📝 Obtener mensaje de error personalizado
   */
  getErrorMessage(): string {
    switch (this.reason) {
      case 'insufficient_permissions':
        return '🔒 Tu rol actual no tiene los permisos necesarios para acceder a esta funcionalidad.';
      
      case 'admin_required':
        return '👑 Esta área está restringida solo para administradores del sistema.';
      
      case 'authentication_required':
        return '🔐 Debes iniciar sesión para acceder a esta página.';
      
      case 'role_restricted':
        return '🎭 Tu rol actual no tiene autorización para esta acción.';
      
      default:
        return '🚫 No tienes autorización para acceder a este recurso.';
    }
  }

  /**
   * 🎯 Obtener título del error
   */
  getErrorTitle(): string {
    switch (this.reason) {
      case 'insufficient_permissions':
        return 'Permisos Insuficientes';
      
      case 'admin_required':
        return 'Acceso de Administrador Requerido';
      
      case 'authentication_required':
        return 'Autenticación Requerida';
      
      case 'role_restricted':
        return 'Rol No Autorizado';
      
      default:
        return 'Acceso Denegado';
    }
  }

  /**
   * 📋 Obtener permisos faltantes formateados
   */
  getFormattedPermissions(): string[] {
    return this.requiredPermissions.map(permission => {
      // Convertir formato técnico a legible
      return permission
        .replace(/_/g, ' ')
        .replace(/:/g, ' - ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    });
  }

  // 🎬 Implementación de acciones sugeridas

  /**
   * 👨‍💼 Contactar administrador
   */
  private contactAdmin(): void {
    const subject = encodeURIComponent('Solicitud de Permisos - Sistema PROVIAS');
    const body = encodeURIComponent(`Estimado Administrador,

Solicito permisos adicionales para acceder a la siguiente funcionalidad:

📍 URL solicitada: ${this.attemptedUrl}
🔑 Permisos requeridos: ${this.requiredPermissions.join(', ')}
👤 Usuario: ${this.currentUser?.fullName} (${this.currentUser?.email})
🎭 Rol actual: ${this.currentUser?.role}

Motivo de la solicitud:
[Describe aquí por qué necesitas estos permisos]

Gracias por su atención.`);

    // En un entorno real, esto podría abrir un sistema de tickets
    window.open(`mailto:admin@provias.gob.pe?subject=${subject}&body=${body}`);
  }

  /**
   * 🏠 Ir al dashboard
   */
  private goToDashboard(): void {
    console.log('🏠 [AccessDeniedComponent] Navegando al dashboard');
    this.router.navigate(['/dashboard']);
  }

  /**
   * 🔄 Cambiar de usuario
   */
  private changeUser(): void {
    const confirmChange = confirm(`🔄 CAMBIAR USUARIO

¿Estás seguro de que quieres cerrar la sesión actual?

Usuario actual: ${this.currentUser?.fullName}
Rol: ${this.currentUser?.role}

Serás redirigido a la página de login.

¿Continuar?`);

    if (confirmChange) {
      console.log('🔄 [AccessDeniedComponent] Cambiando usuario');
      this.authService.logout('user_change_request');
      this.router.navigate(['/login']);
    }
  }

  /**
   * 🔑 Ver mis permisos
   */
  private viewMyPermissions(): void {
    if (!this.currentUser) {
      alert('❌ No se puede obtener información del usuario actual.');
      return;
    }

    const permissionsInfo = `🔑 TUS PERMISOS ACTUALES

👤 Usuario: ${this.currentUser.fullName}
📧 Email: ${this.currentUser.email}
🎭 Rol: ${this.currentUser.role}

📋 PERMISOS ASIGNADOS (${this.currentUser.permissions.length}):

${this.currentUser.permissions.map(permission => 
  '✅ ' + permission.replace(/_/g, ' ').replace(/:/g, ' - ')
).join('\n')}

🚫 PERMISOS REQUERIDOS PARA ESTA ACCIÓN:

${this.getFormattedPermissions().map(permission => 
  '❌ ' + permission
).join('\n')}

💡 Para obtener permisos adicionales, contacta al administrador del sistema.`;

    alert(permissionsInfo);
  }

  /**
   * ⬅️ Volver atrás
   */
  goBack(): void {
    console.log('⬅️ [AccessDeniedComponent] Volviendo atrás');
    window.history.back();
  }

  /**
   * 🔐 Ir a login
   */
  goToLogin(): void {
    console.log('🔐 [AccessDeniedComponent] Navegando a login');
    this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: this.attemptedUrl,
        reason: 'access_denied_redirect'
      }
    });
  }

  /**
   * ❓ Mostrar ayuda
   */
  showHelp(): void {
    alert(`❓ AYUDA - ACCESO DENEGADO

🔍 ¿POR QUÉ VEO ESTA PÁGINA?

Esta página aparece cuando intentas acceder a una funcionalidad para la cual tu usuario no tiene permisos suficientes.

🛡️ SISTEMA DE PERMISOS:

El sistema PROVIAS usa un control de acceso basado en roles:

👑 Administrador: Acceso completo
👨‍🏗️ Jefe de Proyecto: Gestión de proyectos y usuarios
👩‍🔧 Ingeniero: Edición de proyectos asignados
👨‍💻 Técnico: Solo lectura de información
👤 Invitado: Acceso muy limitado

🔧 ¿QUÉ PUEDO HACER?

1. Contactar al administrador para solicitar permisos
2. Usar una cuenta con más privilegios
3. Acceder solo a las áreas permitidas para tu rol

🆘 SOPORTE:

Email: admin@provias.gob.pe
Teléfono: (01) 615-7800`);
  }
}