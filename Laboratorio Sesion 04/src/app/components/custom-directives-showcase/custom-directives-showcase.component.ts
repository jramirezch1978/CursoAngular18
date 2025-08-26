import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';
import { ValidationFeedbackDirective } from '../../directives/validation-feedback.directive';

interface DemoItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  rating: number;
}

@Component({
  selector: 'app-custom-directives-showcase',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TooltipDirective,
    LazyLoadDirective,
    ValidationFeedbackDirective
  ],
  templateUrl: './custom-directives-showcase.component.html',
  styleUrl: './custom-directives-showcase.component.scss'
})
export class CustomDirectivesShowcaseComponent implements OnInit {
  // Datos para demostración
  demoItems = signal<DemoItem[]>([
    {
      id: '1',
      title: 'Proyecto Carretera Nacional',
      description: 'Construcción de 50km de carretera con tecnología moderna',
      image: 'https://picsum.photos/400/300?random=1',
      category: 'Infraestructura',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Puente Río Grande',
      description: 'Puente vehicular de 200m sobre el río principal',
      image: 'https://picsum.photos/400/300?random=2',
      category: 'Construcción',
      rating: 4.6
    },
    {
      id: '3',
      title: 'Terminal Intermodal',
      description: 'Centro de transporte con múltiples modalidades',
      image: 'https://picsum.photos/400/300?random=3',
      category: 'Transporte',
      rating: 4.9
    },
    {
      id: '4',
      title: 'Sistema de Túneles',
      description: 'Red de túneles urbanos para descongestión',
      image: 'https://picsum.photos/400/300?random=4',
      category: 'Infraestructura',
      rating: 4.7
    },
    {
      id: '5',
      title: 'Puerto Logístico',
      description: 'Complejo portuario con tecnología avanzada',
      image: 'https://picsum.photos/400/300?random=5',
      category: 'Logística',
      rating: 4.5
    },
    {
      id: '6',
      title: 'Aeropuerto Regional',
      description: 'Terminal aérea con capacidad para 2M pasajeros/año',
      image: 'https://picsum.photos/400/300?random=6',
      category: 'Aviación',
      rating: 4.8
    }
  ]);

  // Formulario de contacto para demostrar validación
  contactForm = signal({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    budget: '',
    projectType: ''
  });

  // Estado de validación
  validationState = signal({
    name: 'none' as 'valid' | 'invalid' | 'pending' | 'none',
    email: 'none' as 'valid' | 'invalid' | 'pending' | 'none',
    phone: 'none' as 'valid' | 'invalid' | 'pending' | 'none',
    company: 'none' as 'valid' | 'invalid' | 'pending' | 'none',
    message: 'none' as 'valid' | 'invalid' | 'pending' | 'none'
  });

  // Opciones para selects
  projectTypes = [
    'Carreteras',
    'Puentes',
    'Túneles',
    'Aeropuertos',
    'Puertos',
    'Ferrocarriles',
    'Otro'
  ];

  budgetRanges = [
    'Menos de $1M',
    '$1M - $5M',
    '$5M - $10M',
    '$10M - $50M',
    'Más de $50M'
  ];

  ngOnInit(): void {
    console.log('🎯 LAB 3: Custom Directives Showcase inicializado');
  }

  // Validación en tiempo real
  validateField(fieldName: keyof typeof this.contactForm.value): void {
    const value = this.contactForm()[fieldName];
    let isValid = false;

    switch (fieldName) {
      case 'name':
        isValid = value.length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'phone':
        isValid = /^\+?[\d\s\-\(\)]{9,}$/.test(value);
        break;
      case 'company':
        isValid = value.length >= 2;
        break;
      case 'message':
        isValid = value.length >= 10;
        break;
    }

    this.validationState.update(state => ({
      ...state,
      [fieldName]: isValid ? 'valid' : 'invalid'
    }));
  }

  // Simulación de validación asíncrona
  async validateEmailAsync(email: string): Promise<void> {
    if (!email || email.length < 3) return;

    this.validationState.update(state => ({
      ...state,
      email: 'pending'
    }));

    // Simular llamada a API
    setTimeout(() => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      this.validationState.update(state => ({
        ...state,
        email: isValid ? 'valid' : 'invalid'
      }));
    }, 1500);
  }

  // Actualizar formulario
  updateForm(field: keyof typeof this.contactForm.value, value: string): void {
    this.contactForm.update(form => ({
      ...form,
      [field]: value
    }));

    // Validar campo después de un pequeño delay
    setTimeout(() => {
      this.validateField(field);
    }, 300);

    // Validación especial para email
    if (field === 'email') {
      this.validateEmailAsync(value);
    }
  }

  // Enviar formulario
  submitForm(): void {
    const form = this.contactForm();
    const validation = this.validationState();
    
    // Verificar que todos los campos requeridos estén válidos
    const requiredFields: (keyof typeof validation)[] = ['name', 'email', 'company', 'message'];
    const isFormValid = requiredFields.every(field => validation[field] === 'valid');

    if (isFormValid) {
      console.log('✅ Formulario válido:', form);
      alert('¡Formulario enviado exitosamente! En un proyecto real, esto se enviaría al servidor.');
      this.resetForm();
    } else {
      console.log('❌ Formulario inválido');
      alert('Por favor, corrija los errores en el formulario antes de enviar.');
    }
  }

  // Resetear formulario
  resetForm(): void {
    this.contactForm.set({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      budget: '',
      projectType: ''
    });

    this.validationState.set({
      name: 'none',
      email: 'none',
      phone: 'none',
      company: 'none',
      message: 'none'
    });
  }

  // Helpers para el template
  getValidationMessage(field: keyof typeof this.validationState.value): string {
    const messages: Record<string, string> = {
      name: 'El nombre debe tener al menos 2 caracteres y solo contener letras',
      email: 'Ingrese un email válido (ejemplo@dominio.com)',
      phone: 'Ingrese un teléfono válido con al menos 9 dígitos',
      company: 'El nombre de la empresa es requerido',
      message: 'El mensaje debe tener al menos 10 caracteres'
    };
    return messages[field] || '';
  }

  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    return stars;
  }

  formatBudget(budget: string): string {
    if (!budget) return 'Presupuesto no especificado';
    return `Presupuesto estimado: ${budget}`;
  }
}
