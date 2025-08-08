import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TooltipDirective } from '../../../directives/custom/tooltip.directive';
import { LazyLoadDirective } from '../../../directives/custom/lazy-load.directive';
import { ValidationFeedbackDirective } from '../../../directives/custom/validation-feedback.directive';

interface DemoImage {
  id: string;
  title: string;
  src: string;
  description: string;
  category: 'nature' | 'architecture' | 'technology' | 'people';
}

interface TooltipDemo {
  id: string;
  text: string;
  tooltip: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  theme: 'dark' | 'light' | 'info' | 'warning' | 'error';
}

@Component({
  selector: 'app-custom-directives',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    TooltipDirective,
    LazyLoadDirective,
    ValidationFeedbackDirective
  ],
  templateUrl: './custom-directives.component.html',
  styleUrl: './custom-directives.component.scss'
})
export class CustomDirectivesComponent implements OnInit {
  // Señales para estado reactivo
  activeSection = signal<'tooltip' | 'lazy-load' | 'validation'>('tooltip');
  isLoading = signal(false);
  
  // Formularios reactivos
  userForm: FormGroup;
  contactForm: FormGroup;
  
  // Datos de demostración
  tooltipDemos: TooltipDemo[] = [
    {
      id: 'demo1',
      text: 'Hover para tooltip básico',
      tooltip: 'Este es un tooltip básico con información útil',
      placement: 'top',
      theme: 'dark'
    },
    {
      id: 'demo2',
      text: 'Tooltip con tema claro',
      tooltip: 'Tooltip con fondo claro y bordes',
      placement: 'bottom',
      theme: 'light'
    },
    {
      id: 'demo3',
      text: 'Información importante',
      tooltip: '¡Esta información es muy importante!',
      placement: 'right',
      theme: 'info'
    },
    {
      id: 'demo4',
      text: 'Advertencia',
      tooltip: 'Ten cuidado con esta acción',
      placement: 'left',
      theme: 'warning'
    },
    {
      id: 'demo5',
      text: 'Error crítico',
      tooltip: 'Esta acción puede causar problemas',
      placement: 'top',
      theme: 'error'
    }
  ];

  lazyImages: DemoImage[] = [
    {
      id: 'img1',
      title: 'Paisaje Natural',
      src: 'https://picsum.photos/400/300?random=1',
      description: 'Hermoso paisaje natural con montañas',
      category: 'nature'
    },
    {
      id: 'img2',
      title: 'Arquitectura Moderna',
      src: 'https://picsum.photos/400/300?random=2',
      description: 'Edificio moderno con diseño innovador',
      category: 'architecture'
    },
    {
      id: 'img3',
      title: 'Tecnología',
      src: 'https://picsum.photos/400/300?random=3',
      description: 'Dispositivos tecnológicos avanzados',
      category: 'technology'
    },
    {
      id: 'img4',
      title: 'Personas',
      src: 'https://picsum.photos/400/300?random=4',
      description: 'Grupo de personas trabajando',
      category: 'people'
    },
    {
      id: 'img5',
      title: 'Naturaleza Salvaje',
      src: 'https://picsum.photos/400/300?random=5',
      description: 'Animales en su hábitat natural',
      category: 'nature'
    },
    {
      id: 'img6',
      title: 'Ciudad Nocturna',
      src: 'https://picsum.photos/400/300?random=6',
      description: 'Vista nocturna de la ciudad',
      category: 'architecture'
    }
  ];

  // Configuraciones de validación personalizadas
  validationMessages = {
    required: 'Este campo es obligatorio',
    email: 'Por favor ingrese un email válido',
    minlength: 'Mínimo 3 caracteres requeridos',
    maxlength: 'Máximo 50 caracteres permitidos',
    pattern: 'Solo se permiten letras y espacios'
  };

  constructor(private formBuilder: FormBuilder) {
    // Inicializar formularios
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      bio: ['', [Validators.maxLength(200)]]
    });

    this.contactForm = this.formBuilder.group({
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['medium', [Validators.required]],
      department: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('🎯 LAB 3: Custom Directives Demo inicializado');
  }

  // Métodos para cambiar sección activa
  setActiveSection(section: 'tooltip' | 'lazy-load' | 'validation'): void {
    this.activeSection.set(section);
  }

  // Métodos para manejo de tooltips
  onTooltipShow(text: string): void {
    console.log('Tooltip mostrado:', text);
  }

  onTooltipHide(): void {
    console.log('Tooltip ocultado');
  }

  // Métodos para lazy loading
  onLazyLoadStart(): void {
    console.log('Inicio de carga lazy');
    this.isLoading.set(true);
  }

  onLazyLoadSuccess(src: string): void {
    console.log('Imagen cargada exitosamente:', src);
    this.isLoading.set(false);
  }

  onLazyLoadError(error: Error): void {
    console.error('Error al cargar imagen:', error);
    this.isLoading.set(false);
  }

  onLazyLoadComplete(success: boolean): void {
    console.log('Carga completada, éxito:', success);
  }

  // Métodos para formularios
  onSubmitUserForm(): void {
    if (this.userForm.valid) {
      console.log('Formulario de usuario válido:', this.userForm.value);
      alert('¡Formulario enviado exitosamente!');
      this.userForm.reset();
    } else {
      console.log('Formulario inválido');
      this.markAllFieldsAsTouched(this.userForm);
    }
  }

  onSubmitContactForm(): void {
    if (this.contactForm.valid) {
      console.log('Formulario de contacto válido:', this.contactForm.value);
      alert('¡Mensaje enviado exitosamente!');
      this.contactForm.reset();
    } else {
      console.log('Formulario de contacto inválido');
      this.markAllFieldsAsTouched(this.contactForm);
    }
  }

  private markAllFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Métodos utilitarios
  resetUserForm(): void {
    this.userForm.reset();
  }

  resetContactForm(): void {
    this.contactForm.reset();
  }

  fillSampleData(): void {
    this.userForm.patchValue({
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      phone: '987654321',
      age: 30,
      bio: 'Desarrollador de software con experiencia en Angular y TypeScript.'
    });
  }

  // Getters para fácil acceso a controles de formulario
  get nameControl() { return this.userForm.get('name'); }
  get emailControl() { return this.userForm.get('email'); }
  get phoneControl() { return this.userForm.get('phone'); }
  get ageControl() { return this.userForm.get('age'); }
  get bioControl() { return this.userForm.get('bio'); }
  
  get subjectControl() { return this.contactForm.get('subject'); }
  get messageControl() { return this.contactForm.get('message'); }
  get priorityControl() { return this.contactForm.get('priority'); }
  get departmentControl() { return this.contactForm.get('department'); }

  // Métodos para demostrar funcionalidades avanzadas
  simulateSlowLoading(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      alert('Carga simulada completada');
    }, 3000);
  }

  toggleTooltipsEnabled(): void {
    // Implementar toggle de tooltips
    console.log('Toggling tooltips...');
  }

  exportFormData(): void {
    const formData = {
      user: this.userForm.value,
      contact: this.contactForm.value
    };
    
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'form-data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Método para generar más imágenes dinámicamente
  addMoreImages(): void {
    const newImages: DemoImage[] = [
      {
        id: `img${this.lazyImages.length + 1}`,
        title: 'Nueva Imagen',
        src: `https://picsum.photos/400/300?random=${this.lazyImages.length + 10}`,
        description: 'Imagen agregada dinámicamente',
        category: 'nature'
      }
    ];
    
    this.lazyImages = [...this.lazyImages, ...newImages];
  }

  // Método para limpiar imágenes
  clearImages(): void {
    this.lazyImages = [];
  }

  // Método para resetear todo
  resetAll(): void {
    this.resetUserForm();
    this.resetContactForm();
    this.activeSection.set('tooltip');
    this.isLoading.set(false);
  }
}