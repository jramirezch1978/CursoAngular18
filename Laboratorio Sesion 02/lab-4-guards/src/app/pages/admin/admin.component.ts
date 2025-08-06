import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthUser, SecurityEvent, Permission } from '../../models/auth';

interface SystemStat {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

interface AdminAction {
  title: string;
  description: string;
  icon: string;
  action: () => void;
  requiredPermission?: Permission;
  color: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  
  // 👤 Usuario actual
  currentUser: AuthUser | null = null;
  
  // 📊 Estadísticas del sistema
  systemStats: SystemStat[] = [
    { label: 'Usuarios Activos', value: 8, icon: '👥', color: '#3498db' },
    { label: 'Proyectos en Curso', value: 15, icon: '🏗️', color: '#2ecc71' },
    { label: 'Sesiones Activas', value: 3, icon: '🔐', color: '#f39c12' },
    { label: 'Eventos de Seguridad', value: 0, icon: '🚨', color: '#e74c3c' }
  ];
  
  // 🚨 Eventos de seguridad recientes
  securityEvents: SecurityEvent[] = [];
  
  // ⚙️ Acciones administrativas
  adminActions: AdminAction[] = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear, editar y gestionar usuarios del sistema',
      icon: '👥',
      action: () => this.navigateToUserManagement(),
      requiredPermission: Permission.ADMIN_USERS,
      color: '#3498db'
    },
    {
      title: 'Configuración del Sistema',
      description: 'Configurar parámetros y opciones del sistema',
      icon: '⚙️',
      action: () => this.openSystemSettings(),
      requiredPermission: Permission.ADMIN_SETTINGS,
      color: '#9b59b6'
    },
    {
      title: 'Logs del Sistema',
      description: 'Revisar logs y eventos del sistema',
      icon: '📋',
      action: () => this.viewSystemLogs(),
      requiredPermission: Permission.ADMIN_LOGS,
      color: '#f39c12'
    },
    {
      title: 'Backup del Sistema',
      description: 'Crear respaldos de la base de datos',
      icon: '💾',
      action: () => this.createBackup(),
      requiredPermission: Permission.SYSTEM_BACKUP,
      color: '#2ecc71'
    },
    {
      title: 'Monitoreo del Sistema',
      description: 'Ver estado y rendimiento del sistema',
      icon: '📊',
      action: () => this.openSystemMonitor(),
      requiredPermission: Permission.SYSTEM_MONITOR,
      color: '#e67e22'
    },
    {
      title: 'Limpiar Cache',
      description: 'Limpiar cache y datos temporales',
      icon: '🧹',
      action: () => this.clearCache(),
      color: '#95a5a6'
    }
  ];
  
  // 📈 Datos de actividad reciente
  recentActivity = [
    { action: 'Usuario "jperez" inició sesión', time: '2 minutos', icon: '🔑' },
    { action: 'Proyecto "Carretera Central" actualizado', time: '15 minutos', icon: '🏗️' },
    { action: 'Nuevo usuario "mrodriguez" creado', time: '1 hora', icon: '👤' },
    { action: 'Backup automático completado', time: '2 horas', icon: '💾' },
    { action: 'Configuración de sistema actualizada', time: '3 horas', icon: '⚙️' }
  ];
  
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('👑 [AdminComponent] Inicializando panel de administración');
    
    this.loadCurrentUser();
    this.loadSecurityEvents();
    this.updateSecurityStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * 👤 Cargar información del usuario actual
   */
  private loadCurrentUser(): void {
    const userSub = this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      
      if (user) {
        console.log('👤 [AdminComponent] Usuario admin cargado:', user.fullName);
      }
    });
    
    this.subscriptions.add(userSub);
  }

  /**
   * 🚨 Cargar eventos de seguridad
   */
  private loadSecurityEvents(): void {
    const eventsSub = this.authService.getSecurityEvents().subscribe(events => {
      this.securityEvents = events.slice(0, 10); // Últimos 10 eventos
    });
    
    this.subscriptions.add(eventsSub);
  }

  /**
   * 📊 Actualizar estadísticas de seguridad
   */
  private updateSecurityStats(): void {
    // Simular datos en tiempo real
    const securityStat = this.systemStats.find(s => s.label === 'Eventos de Seguridad');
    if (securityStat) {
      securityStat.value = this.securityEvents.length;
    }
  }

  /**
   * ✅ Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: Permission): boolean {
    return this.authService.hasPermission(permission);
  }

  /**
   * 🎨 Verificar si una acción está disponible
   */
  isActionAvailable(action: AdminAction): boolean {
    if (!action.requiredPermission) {
      return true; // Acción sin restricciones
    }
    
    return this.hasPermission(action.requiredPermission);
  }

  /**
   * 🎨 Obtener acciones disponibles para el usuario
   */
  getAvailableActions(): AdminAction[] {
    return this.adminActions.filter(action => this.isActionAvailable(action));
  }

  /**
   * 🎨 Obtener acciones restringidas
   */
  getRestrictedActions(): AdminAction[] {
    return this.adminActions.filter(action => !this.isActionAvailable(action));
  }

  // 🎬 Implementación de acciones administrativas

  /**
   * 👥 Navegar a gestión de usuarios
   */
  private navigateToUserManagement(): void {
    console.log('👥 [AdminComponent] Navegando a gestión de usuarios');
    this.router.navigate(['/admin/users']);
  }

  /**
   * ⚙️ Abrir configuración del sistema
   */
  private openSystemSettings(): void {
    console.log('⚙️ [AdminComponent] Abriendo configuración del sistema');
    
    alert(`⚙️ CONFIGURACIÓN DEL SISTEMA

Esta funcionalidad permitiría configurar:

🔧 Parámetros del Sistema:
• Timeout de sesión
• Número máximo de intentos de login
• Configuración de notificaciones
• Políticas de contraseñas

🎨 Personalización:
• Temas y colores
• Logo de la organización
• Mensajes personalizados

🔐 Seguridad:
• Políticas de acceso
• Configuración de auditoría
• Reglas de autorización

En un sistema real, esto abriría un panel completo de configuración.`);
  }

  /**
   * 📋 Ver logs del sistema
   */
  private viewSystemLogs(): void {
    console.log('📋 [AdminComponent] Viendo logs del sistema');
    
    const logs = `📋 LOGS DEL SISTEMA - ÚLTIMAS 24 HORAS

🕐 2025-01-01 14:30:00 - INFO - Usuario admin inició sesión
🕐 2025-01-01 14:25:00 - INFO - Backup automático completado
🕐 2025-01-01 14:20:00 - WARN - Intento de acceso a ruta restringida por usuario guest
🕐 2025-01-01 14:15:00 - INFO - Proyecto actualizado por jperez
🕐 2025-01-01 14:10:00 - INFO - Nuevo usuario creado: mrodriguez
🕐 2025-01-01 14:00:00 - INFO - Sistema iniciado correctamente

📊 ESTADÍSTICAS:
• Total de eventos: 156
• Errores: 2
• Advertencias: 8
• Información: 146

En un sistema real, esto mostraría logs detallados con filtros y búsqueda.`;

    alert(logs);
  }

  /**
   * 💾 Crear backup
   */
  private createBackup(): void {
    console.log('💾 [AdminComponent] Creando backup del sistema');
    
    // Simular proceso de backup
    const confirmBackup = confirm(`💾 CREAR BACKUP DEL SISTEMA

¿Estás seguro de que quieres crear un backup completo?

El backup incluirá:
✅ Base de datos de usuarios
✅ Configuración del sistema
✅ Logs de seguridad
✅ Archivos de proyectos

Tiempo estimado: 5-10 minutos
Espacio requerido: ~250 MB

¿Continuar con el backup?`);
    
    if (confirmBackup) {
      alert('💾 Backup iniciado. Se notificará cuando esté completo.\n\nEn un sistema real, esto ejecutaría el proceso de backup en background.');
    }
  }

  /**
   * 📊 Abrir monitor del sistema
   */
  private openSystemMonitor(): void {
    console.log('📊 [AdminComponent] Abriendo monitor del sistema');
    
    alert(`📊 MONITOR DEL SISTEMA

🖥️ ESTADO DEL SERVIDOR:
• CPU: 45% (Normal)
• RAM: 2.1GB / 8GB (26%)
• Disco: 156GB / 500GB (31%)
• Red: 12 Mbps

🌐 APLICACIÓN:
• Usuarios conectados: 3
• Sesiones activas: 8
• Requests/min: 24
• Tiempo de respuesta: 120ms

🔄 SERVICIOS:
✅ Base de datos: Activo
✅ Autenticación: Activo  
✅ File Storage: Activo
✅ Backup Service: Activo

En un sistema real, esto mostraría métricas en tiempo real con gráficos.`);
  }

  /**
   * 🧹 Limpiar cache
   */
  private clearCache(): void {
    console.log('🧹 [AdminComponent] Limpiando cache del sistema');
    
    const confirmClear = confirm(`🧹 LIMPIAR CACHE DEL SISTEMA

Esta acción eliminará:
• Cache de sesiones inactivas
• Archivos temporales
• Cache de consultas
• Logs antiguos (>30 días)

Esto podría afectar temporalmente el rendimiento.

¿Continuar con la limpieza?`);
    
    if (confirmClear) {
      // Simular limpieza
      setTimeout(() => {
        alert('🧹 Cache limpiado exitosamente.\n\n• 45 archivos temporales eliminados\n• 12 MB liberados\n• Cache regenerado');
      }, 1000);
    }
  }

  /**
   * 🚪 Cerrar sesión como administrador
   */
  logout(): void {
    console.log('🚪 [AdminComponent] Admin cerrando sesión');
    this.authService.logout('admin_logout');
    this.router.navigate(['/login']);
  }

  /**
   * 🏠 Ir al dashboard principal
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * 🔄 Refrescar datos
   */
  refreshData(): void {
    console.log('🔄 [AdminComponent] Refrescando datos del panel');
    
    // Simular actualización de datos
    this.loadSecurityEvents();
    this.updateSecurityStats();
    
    // Actualizar hora actual en actividad
    this.recentActivity = this.recentActivity.map(activity => ({
      ...activity,
      time: this.getRandomTimeAgo()
    }));
  }

  /**
   * 🕐 Generar tiempo aleatorio para actividad
   */
  private getRandomTimeAgo(): string {
    const times = ['1 minuto', '3 minutos', '8 minutos', '15 minutos', '32 minutos', '1 hora', '2 horas'];
    return times[Math.floor(Math.random() * times.length)];
  }

  /**
   * 🎨 Obtener clase CSS para evento de seguridad
   */
  getSecurityEventClass(event: SecurityEvent): string {
    switch (event.type) {
      case 'login': return 'event-success';
      case 'logout': return 'event-info';
      case 'failed_attempt': return 'event-warning';
      case 'unauthorized_access': return 'event-danger';
      case 'token_expired': return 'event-warning';
      default: return 'event-info';
    }
  }

  /**
   * 📝 Obtener descripción legible del evento
   */
  getSecurityEventDescription(event: SecurityEvent): string {
    switch (event.type) {
      case 'login': return '🔑 Inicio de sesión exitoso';
      case 'logout': return '🚪 Cierre de sesión';
      case 'failed_attempt': return '❌ Intento de login fallido';
      case 'unauthorized_access': return '🚫 Acceso no autorizado';
      case 'token_expired': return '⏰ Token expirado';
      default: return '📝 Evento de seguridad';
    }
  }

  /**
   * 🕐 Formatear timestamp
   */
  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}