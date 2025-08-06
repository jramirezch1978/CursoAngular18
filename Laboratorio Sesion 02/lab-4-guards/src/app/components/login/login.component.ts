import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials, AuthResponse, MOCK_USERS } from '../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  
  // 📝 Formulario de login
  loginForm: FormGroup;
  
  // 📊 Estado del componente
  isLoading = false;
  errorMessage = '';
  returnUrl = '/dashboard';
  loginReason = '';
  
  // 👥 Usuarios de demostración
  demoUsers = MOCK_USERS;
  showDemoCredentials = true;
  
  // 🔄 Subscripciones
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializar formulario
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    console.log('🔑 [LoginComponent] Inicializando componente de login');
    
    // Verificar si ya está autenticado
    this.checkCurrentAuthentication();
    
    // Leer parámetros de la URL
    this.parseUrlParameters();
    
    // Pre-rellenar con usuario admin para demo
    this.prefillDemoCredentials();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * ✅ Verificar si ya está autenticado
   */
  private checkCurrentAuthentication(): void {
    const authSub = this.authService.isAuthenticated().subscribe(isAuth => {
      if (isAuth) {
        console.log('✅ [LoginComponent] Usuario ya autenticado, redirigiendo');
        this.router.navigate([this.returnUrl]);
      }
    });
    
    this.subscriptions.add(authSub);
  }

  /**
   * 📖 Parsear parámetros de la URL
   */
  private parseUrlParameters(): void {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
      this.loginReason = params['reason'] || '';
      
      // Mostrar mensaje según la razón
      if (this.loginReason === 'authentication_required') {
        this.errorMessage = '🔐 Debes iniciar sesión para acceder a esta página';
      } else if (this.loginReason === 'session_expired') {
        this.errorMessage = '⏰ Tu sesión ha expirado. Por favor, inicia sesión nuevamente';
      }
      
      console.log('📖 [LoginComponent] Return URL:', this.returnUrl);
    });
  }

  /**
   * 🎯 Pre-rellenar credenciales de demo
   */
  private prefillDemoCredentials(): void {
    // En modo demo, pre-rellenar con admin
    if (this.showDemoCredentials) {
      this.loginForm.patchValue({
        username: 'admin',
        password: 'admin123'
      });
    }
  }

  /**
   * 🔑 Procesar inicio de sesión
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe
    };

    console.log('🔑 [LoginComponent] Iniciando proceso de login:', credentials.username);

    const loginSub = this.authService.login(credentials).subscribe({
      next: (response: AuthResponse) => this.handleLoginResponse(response),
      error: (error) => this.handleLoginError(error),
      complete: () => {
        this.isLoading = false;
      }
    });

    this.subscriptions.add(loginSub);
  }

  /**
   * ✅ Manejar respuesta exitosa de login
   */
  private handleLoginResponse(response: AuthResponse): void {
    if (response.success && response.user) {
      console.log('✅ [LoginComponent] Login exitoso:', response.user.fullName);
      
      // Limpiar URL de retorno del sessionStorage
      sessionStorage.removeItem('provias_redirect_url');
      
      // Redirigir a la URL de retorno
      this.router.navigate([this.returnUrl]);
      
    } else {
      console.log('❌ [LoginComponent] Login fallido:', response.message);
      this.errorMessage = response.message || 'Error en el inicio de sesión';
    }
  }

  /**
   * ❌ Manejar error de login
   */
  private handleLoginError(error: any): void {
    console.error('🚨 [LoginComponent] Error en login:', error);
    this.errorMessage = 'Error interno del sistema. Intenta nuevamente.';
  }

  /**
   * 👤 Usar credenciales de usuario demo
   */
  useDemoUser(user: any): void {
    const username = user.username;
    const password = username === 'admin' ? 'admin123' : 
                    username === 'jperez' ? 'proyecto2024' :
                    username === 'mrodriguez' ? 'ingenieria123' :
                    username === 'cgarcia' ? 'tecnico456' : 'invitado';

    this.loginForm.patchValue({
      username: username,
      password: password
    });

    console.log('👤 [LoginComponent] Credenciales demo aplicadas:', username);
  }

  /**
   * 🎲 Login automático para demo
   */
  quickLogin(username: string): void {
    this.useDemoUser({ username });
    
    // Auto-submit después de un breve delay
    setTimeout(() => {
      this.onSubmit();
    }, 500);
  }

  /**
   * 🔄 Toggle mostrar credenciales demo
   */
  toggleDemoCredentials(): void {
    this.showDemoCredentials = !this.showDemoCredentials;
  }

  /**
   * 🎨 Obtener clase CSS para rol
   */
  getRoleClass(role: string): string {
    return `role-${role.replace('_', '-')}`;
  }

  /**
   * 🏷️ Obtener nombre legible del rol
   */
  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'admin': 'Administrador',
      'project_manager': 'Jefe de Proyecto',
      'engineer': 'Ingeniero',
      'technician': 'Técnico',
      'guest': 'Invitado'
    };
    
    return roleNames[role] || role;
  }

  /**
   * ✅ Verificar si un campo es válido
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.valid && (field.dirty || field.touched) : false;
  }

  /**
   * ❌ Verificar si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * 📝 Obtener mensaje de error para un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${fieldName === 'username' ? 'Usuario' : 'Contraseña'} es requerido`;
    }

    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * 👆 Marcar todos los campos como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * 🏠 Ir al dashboard público
   */
  goToPublicArea(): void {
    this.router.navigate(['/public']);
  }

  /**
   * ❓ Mostrar ayuda
   */
  showHelp(): void {
    alert(`🆘 AYUDA - Sistema PROVIAS

📋 USUARIOS DE DEMOSTRACIÓN:

👨‍💼 Admin: admin / admin123
  - Acceso completo al sistema
  - Panel de administración
  - Gestión de usuarios

👨‍🏗️ Jefe de Proyecto: jperez / proyecto2024
  - Gestión de proyectos
  - Supervisión de equipos

👩‍🔧 Ingeniero: mrodriguez / ingenieria123
  - Edición de proyectos
  - Reportes técnicos

👨‍💻 Técnico: cgarcia / tecnico456
  - Consulta de información
  - Reportes básicos

👤 Invitado: invitado / invitado
  - Solo lectura
  - Acceso limitado

🔧 CARACTERÍSTICAS:
✅ Autenticación con localStorage
✅ Guards de protección de rutas
✅ Roles y permisos granulares
✅ Sesión con timeout automático`);
  }
}