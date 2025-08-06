import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  description: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, OnDestroy {
  
  // 🧭 Elementos de navegación principal
  navigationItems: NavigationItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '🏠',
      description: 'Página principal con estadísticas'
    },
    {
      path: '/users',
      label: 'Usuarios',
      icon: '👥',
      description: 'Gestión de usuarios del sistema'
    },
    {
      path: '/projects',
      label: 'Proyectos',
      icon: '🏗️',
      description: 'Supervisión de proyectos viales'
    }
  ];
  
  // 🍞 Breadcrumbs dinámicos
  breadcrumbs: BreadcrumbItem[] = [];
  
  // 📍 URL actual para destacar navegación activa
  currentUrl: string = '';
  
  // 🔄 Subscripción para eventos de navegación
  private navigationSubscription?: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('🧭 [NavigationComponent] Inicializando navegación');
    this.setupNavigationTracking();
    this.updateCurrentUrl();
    this.generateBreadcrumbs();
  }

  ngOnDestroy(): void {
    console.log('🧭 [NavigationComponent] Limpiando subscripciones');
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  /**
   * 🔄 Configurar tracking de navegación
   * Escucha cambios de ruta y actualiza breadcrumbs
   */
  private setupNavigationTracking(): void {
    this.navigationSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => event as NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        console.log('🧭 [NavigationComponent] Navegación detectada:', event.url);
        this.currentUrl = event.url;
        this.generateBreadcrumbs();
        this.updateActiveStates();
      });
  }

  /**
   * 📍 Actualizar URL actual
   */
  private updateCurrentUrl(): void {
    this.currentUrl = this.router.url;
  }

  /**
   * 🍞 Generar breadcrumbs dinámicos basados en la URL actual
   */
  private generateBreadcrumbs(): void {
    const url = this.currentUrl;
    const segments = url.split('/').filter(segment => segment);
    
    // Resetear breadcrumbs
    this.breadcrumbs = [];
    
    // Siempre incluir Home
    this.breadcrumbs.push({
      label: 'Inicio',
      url: '/dashboard',
      isActive: url === '/dashboard' || url === '/'
    });
    
    // Construir breadcrumbs basados en segmentos de URL
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      const breadcrumb = this.createBreadcrumbFromSegment(segment, currentPath, i, segments);
      if (breadcrumb) {
        // Marcar como activo si es el último segmento
        breadcrumb.isActive = i === segments.length - 1;
        this.breadcrumbs.push(breadcrumb);
      }
    }
    
    console.log('🍞 [NavigationComponent] Breadcrumbs generados:', this.breadcrumbs);
  }

  /**
   * 🏷️ Crear breadcrumb desde un segmento de URL
   */
  private createBreadcrumbFromSegment(
    segment: string, 
    fullPath: string, 
    index: number, 
    allSegments: string[]
  ): BreadcrumbItem | null {
    
    // Mapeo de segmentos a labels legibles
    const segmentMappings: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'users': 'Usuarios',
      'projects': 'Proyectos',
      'new': 'Nuevo',
      'edit': 'Editar'
    };
    
    // Si es un ID numérico, crear breadcrumb específico
    if (/^\d+$/.test(segment)) {
      const parentSegment = allSegments[index - 1];
      if (parentSegment === 'users') {
        return {
          label: `Usuario #${segment}`,
          url: fullPath,
          isActive: false
        };
      } else if (parentSegment === 'projects') {
        return {
          label: `Proyecto #${segment}`,
          url: fullPath,
          isActive: false
        };
      }
    }
    
    // Usar mapeo o capitalizar segmento
    const label = segmentMappings[segment] || this.capitalizeFirst(segment);
    
    // No crear breadcrumb para segmentos desconocidos muy largos
    if (label.length > 20 && !segmentMappings[segment]) {
      return null;
    }
    
    return {
      label,
      url: fullPath,
      isActive: false
    };
  }

  /**
   * ✨ Capitalizar primera letra
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 🎯 Actualizar estados activos de navegación
   */
  private updateActiveStates(): void {
    this.navigationItems.forEach(item => {
      item.isActive = this.isRouteActive(item.path);
    });
  }

  /**
   * ✅ Verificar si una ruta está activa
   */
  isRouteActive(routePath: string): boolean {
    return this.currentUrl.startsWith(routePath);
  }

  /**
   * 🧭 Navegar a una ruta específica
   */
  navigateTo(path: string): void {
    console.log('🧭 [NavigationComponent] Navegando a:', path);
    this.router.navigate([path]);
  }

  /**
   * 🍞 Navegar usando breadcrumb
   */
  navigateToBreadcrumb(breadcrumb: BreadcrumbItem): void {
    if (!breadcrumb.isActive) {
      console.log('🍞 [NavigationComponent] Navegando via breadcrumb a:', breadcrumb.url);
      this.router.navigate([breadcrumb.url]);
    }
  }

  /**
   * 🏠 Ir al inicio
   */
  goHome(): void {
    this.navigateTo('/dashboard');
  }

  /**
   * ⬅️ Ir atrás
   */
  goBack(): void {
    console.log('⬅️ [NavigationComponent] Volviendo atrás');
    window.history.back();
  }

  /**
   * 📊 Obtener información de la página actual
   */
  getCurrentPageInfo(): { title: string; description: string } {
    const currentItem = this.navigationItems.find(item => this.isRouteActive(item.path));
    
    if (currentItem) {
      return {
        title: currentItem.label,
        description: currentItem.description
      };
    }
    
    // Información por defecto basada en la URL
    if (this.currentUrl.includes('/users/')) {
      if (this.currentUrl.includes('/edit')) {
        return { title: 'Editar Usuario', description: 'Modificar información del usuario' };
      } else if (this.currentUrl.includes('/new')) {
        return { title: 'Nuevo Usuario', description: 'Crear nuevo usuario en el sistema' };
      } else {
        return { title: 'Detalle Usuario', description: 'Información detallada del usuario' };
      }
    }
    
    if (this.currentUrl.includes('/projects/')) {
      if (this.currentUrl.includes('/edit')) {
        return { title: 'Editar Proyecto', description: 'Modificar información del proyecto' };
      } else if (this.currentUrl.includes('/new')) {
        return { title: 'Nuevo Proyecto', description: 'Crear nuevo proyecto de infraestructura' };
      } else {
        return { title: 'Detalle Proyecto', description: 'Información detallada del proyecto' };
      }
    }
    
    return { title: 'PROVIAS', description: 'Sistema de gestión de infraestructura vial' };
  }

  /**
   * 🔍 Obtener clase CSS para el estado de navegación
   */
  getNavItemClass(item: NavigationItem): string {
    return this.isRouteActive(item.path) ? 'nav-item active' : 'nav-item';
  }

  /**
   * 📱 Toggle del menú móvil (para responsive)
   */
  toggleMobileMenu(): void {
    console.log('📱 [NavigationComponent] Toggle menú móvil');
    // Implementar lógica de menú móvil si es necesario
  }
}