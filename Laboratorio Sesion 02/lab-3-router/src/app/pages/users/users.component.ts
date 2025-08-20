import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isActive: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  
  // 👥 Lista de usuarios mock
  users: User[] = [
    {
      id: 1,
      name: 'Ana García López',
      email: 'ana.garcia@provias.gob.pe',
      role: 'Project Manager',
      avatar: '👩‍💼',
      isActive: true
    },
    {
      id: 2,
      name: 'Carlos Mendoza Silva',
      email: 'carlos.mendoza@provias.gob.pe',
      role: 'Engineer',
      avatar: '👨‍🔧',
      isActive: true
    },
    {
      id: 3,
      name: 'María Rodriguez Paz',
      email: 'maria.rodriguez@provias.gob.pe',
      role: 'Technician',
      avatar: '👩‍💻',
      isActive: false
    },
    {
      id: 4,
      name: 'Luis Fernández Torres',
      email: 'luis.fernandez@provias.gob.pe',
      role: 'Administrator',
      avatar: '👨‍💼',
      isActive: true
    }
  ];

  // 🔍 Usuario seleccionado y estado de la página
  selectedUserId: number | null = null;
  selectedUser: User | null = null;
  currentMode: 'list' | 'view' | 'edit' | 'new' = 'list';
  routeParams: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('👥 [UsersComponent] Cargando página de usuarios');
    
    // 📖 Leer parámetros de ruta
    this.route.params.subscribe(params => {
      this.routeParams = params;
      console.log('📍 [UsersComponent] Parámetros de ruta:', params);
      
      if (params['id']) {
        this.selectedUserId = +params['id'];
        this.selectedUser = this.getUserById(this.selectedUserId);
        
        // Determinar el modo basado en la URL
        const urlSegments = this.route.snapshot.url;
        const lastSegment = urlSegments[urlSegments.length - 1]?.path;
        
        if (lastSegment === 'edit') {
          this.currentMode = 'edit';
          console.log('✏️ [UsersComponent] Modo edición para usuario:', this.selectedUserId);
        } else if (params['id'] === 'new') {
          this.currentMode = 'new';
          this.selectedUser = null;
          this.selectedUserId = null;
          console.log('➕ [UsersComponent] Modo nuevo usuario');
        } else {
          this.currentMode = 'view';
          console.log('🔍 [UsersComponent] Modo vista para usuario:', this.selectedUserId);
        }
      } else {
        this.currentMode = 'list';
        this.selectedUser = null;
        this.selectedUserId = null;
        console.log('📋 [UsersComponent] Modo lista de usuarios');
      }
    });
    
    // 📖 Leer parámetros de query si existen
    this.route.queryParams.subscribe(params => {
      if (params['selected']) {
        this.selectedUserId = +params['selected'];
        console.log('🎯 [UsersComponent] Usuario preseleccionado via query:', this.selectedUserId);
      }
    });
  }

  /**
   * 👤 Ver detalles de un usuario específico
   * 🧭 Demuestra navegación con parámetros
   */
  viewUser(userId: number): void {
    console.log('🔍 [UsersComponent] Navegando a detalles del usuario:', userId);
    this.router.navigate(['/users', userId]);
  }

  /**
   * ✏️ Editar usuario
   * 🧭 Navegación con query parameters
   */
  editUser(userId: number): void {
    console.log('✏️ [UsersComponent] Navegando a edición del usuario:', userId);
    this.router.navigate(['/users', userId, 'edit']);
  }

  /**
   * 🔍 Filtrar usuarios por estado
   * 🧭 Uso de query parameters para estado
   */
  filterByStatus(status: 'all' | 'active' | 'inactive'): void {
    const queryParams = status !== 'all' ? { filter: status } : {};
    this.router.navigate(['/users'], { queryParams });
  }

  /**
   * 🏠 Volver al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * ➕ Agregar nuevo usuario
   */
  addNewUser(): void {
    this.router.navigate(['/users', 'new']);
  }

  /**
   * 📊 Obtener usuarios activos
   */
  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }

  /**
   * 📊 Obtener usuarios inactivos  
   */
  getInactiveUsers(): User[] {
    return this.users.filter(user => !user.isActive);
  }

  /**
   * 🎯 Verificar si un usuario está seleccionado
   */
  isUserSelected(userId: number): boolean {
    return this.selectedUserId === userId;
  }

  /**
   * 🎨 Obtener clase CSS según el rol
   */
  getRoleClass(role: string): string {
    return role.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * 🔍 Buscar usuario por ID
   */
  getUserById(id: number): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  /**
   * ⬅️ Volver a la lista
   */
  goBackToList(): void {
    this.router.navigate(['/users']);
  }

  /**
   * 💾 Simular guardado (para modo edit)
   */
  saveUser(): void {
    console.log('💾 [UsersComponent] Guardando usuario:', this.selectedUser);
    alert('Usuario guardado correctamente (simulación)');
    this.goBackToList();
  }

  /**
   * ❌ Cancelar edición
   */
  cancelEdit(): void {
    console.log('❌ [UsersComponent] Cancelando edición');
    if (this.selectedUserId) {
      this.router.navigate(['/users', this.selectedUserId]);
    } else {
      this.goBackToList();
    }
  }
}