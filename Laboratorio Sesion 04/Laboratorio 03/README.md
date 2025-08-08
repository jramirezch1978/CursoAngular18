# LAB 3: DIRECTIVAS PERSONALIZADAS COMPLEJAS

## 🎯 Objetivo
Crear directivas personalizadas avanzadas usando HostListener, HostBinding y Renderer2 para resolver problemas reales de UI/UX.

## ⏱️ Duración: 45 minutos

## 📋 Conceptos Clave

### 1. Arquitectura de Directivas Personalizadas

Las directivas personalizadas en Angular son clases decoradas que extienden el comportamiento de elementos HTML:

```typescript
@Directive({
  selector: '[appCustomBehavior]',
  standalone: true
})
export class CustomBehaviorDirective {
  @Input() appCustomBehavior = '';
  
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}
}
```

#### Componentes Clave:
- **ElementRef**: Acceso al elemento DOM nativo
- **Renderer2**: Manipulación segura del DOM
- **HostListener**: Escucha eventos del elemento host
- **HostBinding**: Modifica propiedades del elemento host

### 2. HostListener - Escuchando Eventos

HostListener permite reaccionar a eventos del elemento host de forma declarativa:

```typescript
@HostListener('mouseenter')
onMouseEnter(): void {
  this.showTooltip();
}

@HostListener('mouseleave')
onMouseLeave(): void {
  this.hideTooltip();
}

@HostListener('click', ['$event'])
onClick(event: MouseEvent): void {
  console.log('Clicked at:', event.clientX, event.clientY);
}

// Eventos globales
@HostListener('window:resize', ['$event'])
onWindowResize(event: Event): void {
  this.adjustPosition();
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event): void {
  if (!this.el.nativeElement.contains(event.target)) {
    this.closeDropdown();
  }
}
```

### 3. HostBinding - Modificando Propiedades

HostBinding permite modificar propiedades del elemento host reactivamente:

```typescript
@HostBinding('class.active') isActive = false;
@HostBinding('style.opacity') opacity = '1';
@HostBinding('attr.aria-expanded') ariaExpanded = 'false';

// Con getters para lógica compleja
@HostBinding('class.loading')
get isLoading(): boolean {
  return this.loadingState === 'loading';
}

@HostBinding('style.transform')
get transform(): string {
  return this.isHovered ? 'scale(1.05)' : 'scale(1)';
}

@HostBinding('style.background-color')
get backgroundColor(): string {
  return this.isValid ? '#d4edda' : '#f8d7da';
}
```

### 4. Renderer2 - Manipulación Segura del DOM

Renderer2 proporciona métodos seguros para manipular el DOM:

```typescript
// Crear elementos
const tooltip = this.renderer.createElement('div');
const text = this.renderer.createText('Tooltip content');

// Modificar propiedades
this.renderer.addClass(tooltip, 'tooltip');
this.renderer.setStyle(tooltip, 'position', 'absolute');
this.renderer.setAttribute(tooltip, 'role', 'tooltip');

// Manipular jerarquía
this.renderer.appendChild(tooltip, text);
this.renderer.appendChild(document.body, tooltip);

// Eventos seguros
const unsubscribe = this.renderer.listen(
  this.el.nativeElement, 
  'click', 
  (event) => this.handleClick(event)
);
```

**¿Por qué Renderer2 en lugar de DOM directo?**
- ✅ **Seguridad**: Protege contra XSS attacks
- ✅ **SSR Compatible**: Funciona en server-side rendering
- ✅ **Platform Independent**: Funciona en todos los entornos
- ✅ **Angular Integration**: Se integra con el ciclo de vida de Angular

### 5. Directivas Avanzadas - Patrones Comunes

#### Tooltip Inteligente
```typescript
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay = 500;
  
  private tooltipElement?: HTMLDivElement;
  private delayTimeout?: any;
  
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.delayTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }
  
  @HostListener('mouseleave')
  onMouseLeave(): void {
    clearTimeout(this.delayTimeout);
    this.hideTooltip();
  }
}
```

#### Lazy Loading de Imágenes
```typescript
@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad = '';
  @Input() lazyLoadPlaceholder = 'assets/placeholder.jpg';
  
  @HostBinding('class.lazy-loading') isLoading = true;
  @HostBinding('class.lazy-loaded') isLoaded = false;
  
  private observer?: IntersectionObserver;
  
  ngOnInit(): void {
    this.setupIntersectionObserver();
  }
  
  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
        }
      });
    });
    
    this.observer.observe(this.el.nativeElement);
  }
}
```

## 🛠️ Implementación Paso a Paso

### PASO 1: Crear Directivas Base (15 minutos)

#### 1.1 Directiva de Tooltip Avanzado

```bash
ng generate directive directives/custom/tooltip --standalone
```

Actualizar `src/app/directives/custom/tooltip.directive.ts`:

```typescript
import { 
  Directive, 
  ElementRef, 
  HostListener, 
  Input, 
  Renderer2,
  OnDestroy 
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay = 500;
  @Input() tooltipClass = '';
  
  private tooltipElement?: HTMLDivElement;
  private delayTimeout?: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.delayTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    clearTimeout(this.delayTimeout);
    this.hideTooltip();
  }

  @HostListener('click')
  onClick(): void {
    if (this.tooltipElement) {
      this.hideTooltip();
    }
  }

  private showTooltip(): void {
    if (!this.appTooltip || this.tooltipElement) return;

    // Crear elemento tooltip
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);
    
    if (this.tooltipClass) {
      this.tooltipClass.split(' ').forEach(cls => {
        this.renderer.addClass(this.tooltipElement, cls);
      });
    }

    // Agregar contenido
    const text = this.renderer.createText(this.appTooltip);
    this.renderer.appendChild(this.tooltipElement, text);

    // Posicionar tooltip
    this.positionTooltip();

    // Agregar al DOM
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Animación de entrada
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'tooltip-visible');
      }
    }, 10);
  }

  private hideTooltip(): void {
    if (!this.tooltipElement) return;

    this.renderer.removeClass(this.tooltipElement, 'tooltip-visible');
    
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.removeChild(document.body, this.tooltipElement);
        this.tooltipElement = undefined;
      }
    }, 300);
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostPos.top - tooltipPos.height - 10;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'bottom':
        top = hostPos.bottom + 10;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left - tooltipPos.width - 10;
        break;
      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + 10;
        break;
    }

    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipElement, 'top', `${top + scrollPos}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  ngOnDestroy(): void {
    clearTimeout(this.delayTimeout);
    this.hideTooltip();
  }
}
```

#### 1.2 Directiva de Lazy Load para Imágenes

```bash
ng generate directive directives/custom/lazy-load --standalone
```

Actualizar `src/app/directives/custom/lazy-load.directive.ts`:

```typescript
import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy,
  Renderer2,
  HostBinding
} from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad = ''; // URL de la imagen a cargar
  @Input() lazyLoadPlaceholder = 'assets/images/placeholder.jpg';
  @Input() lazyLoadError = 'assets/images/error.jpg';
  @Input() lazyLoadThreshold = 0.1;
  @Input() lazyLoadRootMargin = '50px';
  
  @HostBinding('class.lazy-loading') isLoading = true;
  @HostBinding('class.lazy-loaded') isLoaded = false;
  @HostBinding('class.lazy-error') hasError = false;
  
  private observer?: IntersectionObserver;
  private hasIntersected = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupPlaceholder();
    this.setupObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupPlaceholder(): void {
    if (this.el.nativeElement.tagName === 'IMG') {
      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        this.lazyLoadPlaceholder
      );
    } else {
      this.renderer.setStyle(
        this.el.nativeElement,
        'background-image',
        `url(${this.lazyLoadPlaceholder})`
      );
    }
  }

  private setupObserver(): void {
    const options = {
      root: null,
      rootMargin: this.lazyLoadRootMargin,
      threshold: this.lazyLoadThreshold
    };

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasIntersected) {
          this.hasIntersected = true;
          this.loadImage();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = new Image();
    
    img.onload = () => {
      this.setImage(this.appLazyLoad);
      this.isLoading = false;
      this.isLoaded = true;
      this.renderer.addClass(this.el.nativeElement, 'fade-in');
    };

    img.onerror = () => {
      this.setImage(this.lazyLoadError);
      this.isLoading = false;
      this.hasError = true;
      console.error(`Failed to load image: ${this.appLazyLoad}`);
    };

    img.src = this.appLazyLoad;
  }

  private setImage(src: string): void {
    if (this.el.nativeElement.tagName === 'IMG') {
      this.renderer.setAttribute(this.el.nativeElement, 'src', src);
    } else {
      this.renderer.setStyle(
        this.el.nativeElement,
        'background-image',
        `url(${src})`
      );
    }
  }
}
```

#### 1.3 Directiva de Validación Visual

```bash
ng generate directive directives/custom/validation-feedback --standalone
```

Actualizar `src/app/directives/custom/validation-feedback.directive.ts`:

```typescript
import { 
  Directive, 
  ElementRef, 
  HostBinding, 
  HostListener,
  Input,
  Renderer2,
  OnInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appValidationFeedback]',
  standalone: true
})
export class ValidationFeedbackDirective implements OnInit, OnDestroy {
  @Input() appValidationFeedback: 'valid' | 'invalid' | 'pending' | 'none' = 'none';
  @Input() validationMessage = '';
  @Input() showOnBlur = true;
  @Input() showOnDirty = false;
  
  private messageElement?: HTMLDivElement;
  private isDirty = false;
  private isTouched = false;
  
  @HostBinding('class.validation-valid')
  get isValid(): boolean {
    return this.shouldShowValidation() && this.appValidationFeedback === 'valid';
  }
  
  @HostBinding('class.validation-invalid')
  get isInvalid(): boolean {
    return this.shouldShowValidation() && this.appValidationFeedback === 'invalid';
  }
  
  @HostBinding('class.validation-pending')
  get isPending(): boolean {
    return this.shouldShowValidation() && this.appValidationFeedback === 'pending';
  }
  
  @HostBinding('class.validation-shake')
  private shake = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupValidationStyles();
  }

  ngOnDestroy(): void {
    this.removeMessage();
  }

  @HostListener('blur')
  onBlur(): void {
    this.isTouched = true;
    this.updateValidationDisplay();
  }

  @HostListener('input')
  onInput(): void {
    this.isDirty = true;
    this.updateValidationDisplay();
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.appValidationFeedback === 'invalid') {
      this.showMessage();
    }
  }

  private shouldShowValidation(): boolean {
    if (this.showOnDirty && this.isDirty) return true;
    if (this.showOnBlur && this.isTouched) return true;
    return false;
  }

  private updateValidationDisplay(): void {
    if (this.shouldShowValidation()) {
      if (this.appValidationFeedback === 'invalid' && this.validationMessage) {
        this.showMessage();
        this.triggerShake();
      } else {
        this.removeMessage();
      }
    }
  }

  private setupValidationStyles(): void {
    const parent = this.el.nativeElement.parentElement;
    if (parent) {
      this.renderer.setStyle(parent, 'position', 'relative');
    }
  }

  private showMessage(): void {
    if (this.messageElement) return;

    this.messageElement = this.renderer.createElement('div');
    this.renderer.addClass(this.messageElement, 'validation-message');
    this.renderer.addClass(this.messageElement, 'validation-message-error');
    
    const text = this.renderer.createText(this.validationMessage);
    this.renderer.appendChild(this.messageElement, text);
    
    const parent = this.el.nativeElement.parentElement;
    if (parent) {
      this.renderer.appendChild(parent, this.messageElement);
    }

    setTimeout(() => {
      if (this.messageElement) {
        this.renderer.addClass(this.messageElement, 'validation-message-visible');
      }
    }, 10);
  }

  private removeMessage(): void {
    if (!this.messageElement) return;

    this.renderer.removeClass(this.messageElement, 'validation-message-visible');
    
    setTimeout(() => {
      if (this.messageElement && this.messageElement.parentElement) {
        this.renderer.removeChild(
          this.messageElement.parentElement,
          this.messageElement
        );
        this.messageElement = undefined;
      }
    }, 300);
  }

  private triggerShake(): void {
    this.shake = true;
    setTimeout(() => {
      this.shake = false;
    }, 500);
  }
}
```

### PASO 2: Crear Componente Demo (15 minutos)

```bash
ng generate component components/directivas-demo/custom-directives-showcase --standalone --skip-tests
```

Actualizar `src/app/components/directivas-demo/custom-directives-showcase/custom-directives-showcase.component.ts`:

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipDirective } from '../../../directives/custom/tooltip.directive';
import { LazyLoadDirective } from '../../../directives/custom/lazy-load.directive';
import { ValidationFeedbackDirective } from '../../../directives/custom/validation-feedback.directive';

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
```

Crear template `src/app/components/directivas-demo/custom-directives-showcase/custom-directives-showcase.component.html`:

```html
<div class="custom-directives-showcase">
  <!-- Header -->
  <header class="showcase-header">
    <h1>🚀 Directivas Personalizadas Avanzadas</h1>
    <p class="subtitle">Demostración de HostListener, HostBinding y Renderer2 en acción</p>
  </header>

  <!-- Sección de Tooltips -->
  <section class="demo-section">
    <h2>💬 Tooltips Inteligentes</h2>
    <p>Hover sobre los elementos para ver tooltips personalizados</p>
    
    <div class="tooltip-demos">
      <button 
        class="demo-button primary"
        appTooltip="Este es un tooltip básico que aparece arriba"
        tooltipPosition="top"
        [tooltipDelay]="300">
        🔝 Tooltip Arriba
      </button>
      
      <button 
        class="demo-button secondary"
        appTooltip="Tooltip con posición personalizada abajo"
        tooltipPosition="bottom"
        [tooltipDelay]="500">
        🔻 Tooltip Abajo
      </button>
      
      <button 
        class="demo-button success"
        appTooltip="Tooltip a la izquierda con información detallada"
        tooltipPosition="left"
        tooltipClass="tooltip-large">
        ⬅️ Tooltip Izquierda
      </button>
      
      <button 
        class="demo-button warning"
        appTooltip="Tooltip a la derecha con animación"
        tooltipPosition="right"
        [tooltipDelay]="200">
        ➡️ Tooltip Derecha
      </button>
    </div>

    <div class="feature-highlights">
      <div 
        class="feature-card"
        appTooltip="🎯 HostListener detecta eventos de mouse automáticamente"
        tooltipPosition="top">
        <h4>🎧 HostListener</h4>
        <p>Escucha eventos mouseenter/mouseleave automáticamente</p>
      </div>
      
      <div 
        class="feature-card"
        appTooltip="🎨 Renderer2 crea elementos DOM de forma segura"
        tooltipPosition="top">
        <h4>🛡️ Renderer2</h4>
        <p>Manipulación segura del DOM sin riesgos XSS</p>
      </div>
      
      <div 
        class="feature-card"
        appTooltip="⚡ Posicionamiento dinámico inteligente"
        tooltipPosition="top">
        <h4>📍 Posicionamiento</h4>
        <p>Calcula automáticamente la mejor posición</p>
      </div>
    </div>
  </section>

  <!-- Sección de Lazy Loading -->
  <section class="demo-section">
    <h2>🖼️ Lazy Loading de Imágenes</h2>
    <p>Las imágenes se cargan automáticamente cuando entran en el viewport</p>
    
    <div class="lazy-load-grid">
      @for (item of demoItems(); track item.id) {
        <div class="project-card">
          <div 
            class="project-image"
            [appLazyLoad]="item.image"
            lazyLoadPlaceholder="assets/images/project-placeholder.jpg"
            lazyLoadError="assets/images/project-error.jpg"
            [lazyLoadThreshold]="0.2"
            lazyLoadRootMargin="100px"
            [appTooltip]="'Proyecto: ' + item.title + ' - Categoría: ' + item.category"
            tooltipPosition="top">
          </div>
          
          <div class="project-info">
            <h4>{{ item.title }}</h4>
            <p class="project-description">{{ item.description }}</p>
            <div class="project-meta">
              <span 
                class="project-category"
                [appTooltip]="'Categoría del proyecto'"
                tooltipPosition="top">
                🏷️ {{ item.category }}
              </span>
              <span 
                class="project-rating"
                [appTooltip]="'Calificación: ' + item.rating + '/5 estrellas'"
                tooltipPosition="top">
                {{ getRatingStars(item.rating) }} {{ item.rating }}
              </span>
            </div>
          </div>
        </div>
      }
    </div>

    <div class="lazy-loading-info">
      <div class="info-card">
        <h4>📊 IntersectionObserver</h4>
        <p>API moderna para detectar cuando elementos entran en viewport</p>
      </div>
      <div class="info-card">
        <h4>🎭 HostBinding</h4>
        <p>Clases CSS dinámicas para estados: loading, loaded, error</p>
      </div>
      <div class="info-card">
        <h4>⚡ Performance</h4>
        <p>Solo carga imágenes cuando son necesarias, mejorando velocidad</p>
      </div>
    </div>
  </section>

  <!-- Sección de Validación -->
  <section class="demo-section">
    <h2>✅ Validación Visual Avanzada</h2>
    <p>Formulario con feedback visual inmediato y validación en tiempo real</p>
    
    <form class="validation-form" (ngSubmit)="submitForm()">
      <div class="form-row">
        <div class="form-group">
          <label for="name">Nombre Completo *</label>
          <input 
            id="name"
            type="text"
            class="form-control"
            [value]="contactForm().name"
            (input)="updateForm('name', $any($event.target).value)"
            placeholder="Ingrese su nombre completo"
            appValidationFeedback
            [appValidationFeedback]="validationState().name"
            [validationMessage]="getValidationMessage('name')"
            [showOnBlur]="true"
            [showOnDirty]="true">
        </div>
        
        <div class="form-group">
          <label for="email">
            Email *
            @if (validationState().email === 'pending') {
              <span class="validating">🔄 Validando...</span>
            }
          </label>
          <input 
            id="email"
            type="email"
            class="form-control"
            [value]="contactForm().email"
            (input)="updateForm('email', $any($event.target).value)"
            placeholder="ejemplo@empresa.com"
            appValidationFeedback
            [appValidationFeedback]="validationState().email"
            [validationMessage]="getValidationMessage('email')"
            [showOnBlur]="true"
            [showOnDirty]="true">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="phone">Teléfono</label>
          <input 
            id="phone"
            type="tel"
            class="form-control"
            [value]="contactForm().phone"
            (input)="updateForm('phone', $any($event.target).value)"
            placeholder="+51 987 654 321"
            appValidationFeedback
            [appValidationFeedback]="validationState().phone"
            [validationMessage]="getValidationMessage('phone')"
            [showOnBlur]="true">
        </div>
        
        <div class="form-group">
          <label for="company">Empresa *</label>
          <input 
            id="company"
            type="text"
            class="form-control"
            [value]="contactForm().company"
            (input)="updateForm('company', $any($event.target).value)"
            placeholder="Nombre de su empresa"
            appValidationFeedback
            [appValidationFeedback]="validationState().company"
            [validationMessage]="getValidationMessage('company')"
            [showOnBlur]="true"
            [showOnDirty]="true">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="projectType">Tipo de Proyecto</label>
          <select 
            id="projectType"
            class="form-control"
            [value]="contactForm().projectType"
            (change)="updateForm('projectType', $any($event.target).value)"
            appTooltip="Seleccione el tipo de proyecto que más se ajuste a sus necesidades"
            tooltipPosition="top">
            <option value="">Seleccione...</option>
            @for (type of projectTypes; track type) {
              <option [value]="type">{{ type }}</option>
            }
          </select>
        </div>
        
        <div class="form-group">
          <label for="budget">Presupuesto Estimado</label>
          <select 
            id="budget"
            class="form-control"
            [value]="contactForm().budget"
            (change)="updateForm('budget', $any($event.target).value)"
            [appTooltip]="formatBudget(contactForm().budget)"
            tooltipPosition="top">
            <option value="">Seleccione rango...</option>
            @for (range of budgetRanges; track range) {
              <option [value]="range">{{ range }}</option>
            }
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="message">Mensaje *</label>
        <textarea 
          id="message"
          class="form-control"
          rows="4"
          [value]="contactForm().message"
          (input)="updateForm('message', $any($event.target).value)"
          placeholder="Describa su proyecto y requerimientos específicos..."
          appValidationFeedback
          [appValidationFeedback]="validationState().message"
          [validationMessage]="getValidationMessage('message')"
          [showOnBlur]="true"
          [showOnDirty]="true">
        </textarea>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-secondary"
          (click)="resetForm()"
          appTooltip="Limpiar todos los campos del formulario"
          tooltipPosition="top">
          🧹 Limpiar
        </button>
        
        <button 
          type="submit" 
          class="btn btn-primary"
          appTooltip="Enviar formulario de contacto"
          tooltipPosition="top">
          📨 Enviar Consulta
        </button>
      </div>
    </form>

    <div class="validation-features">
      <div class="feature-item">
        <h4>🎯 Validación en Tiempo Real</h4>
        <p>Los campos se validan mientras el usuario escribe</p>
      </div>
      <div class="feature-item">
        <h4>🔄 Validación Asíncrona</h4>
        <p>El email se valida contra el servidor (simulado)</p>
      </div>
      <div class="feature-item">
        <h4>💫 Animación de Error</h4>
        <p>Los campos inválidos muestran animación de "shake"</p>
      </div>
      <div class="feature-item">
        <h4>🎨 Estados Visuales</h4>
        <p>Colores y bordes cambian según el estado de validación</p>
      </div>
    </div>
  </section>

  <!-- Resumen de Implementación -->
  <section class="implementation-summary">
    <h2>🎯 Directivas Personalizadas Implementadas</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <h3>TooltipDirective</h3>
        <ul>
          <li><code>@HostListener</code> para eventos mouse</li>
          <li><code>@Input</code> para configuración</li>
          <li><code>Renderer2</code> para creación segura</li>
          <li>Posicionamiento dinámico inteligente</li>
          <li>Cleanup automático en destroy</li>
        </ul>
      </div>
      
      <div class="summary-card">
        <h3>LazyLoadDirective</h3>
        <ul>
          <li><code>@HostBinding</code> para clases CSS</li>
          <li><code>IntersectionObserver</code> para viewport</li>
          <li>Manejo de estados: loading, loaded, error</li>
          <li>Placeholders personalizables</li>
          <li>Optimización de performance</li>
        </ul>
      </div>
      
      <div class="summary-card">
        <h3>ValidationFeedbackDirective</h3>
        <ul>
          <li><code>@HostBinding</code> con getters</li>
          <li><code>@HostListener</code> para eventos form</li>
          <li>Estados: valid, invalid, pending</li>
          <li>Mensajes dinámicos con <code>Renderer2</code></li>
          <li>Animaciones de feedback visual</li>
        </ul>
      </div>
    </div>

    <div class="key-concepts">
      <h3>🔑 Conceptos Clave Aplicados</h3>
      <div class="concepts-grid">
        <div class="concept-item">
          <h4>ElementRef + Renderer2</h4>
          <p>Acceso seguro al DOM nativo sin manipulación directa</p>
        </div>
        <div class="concept-item">
          <h4>HostListener</h4>
          <p>Escucha eventos del elemento host de forma declarativa</p>
        </div>
        <div class="concept-item">
          <h4>HostBinding</h4>
          <p>Modifica propiedades del host reactivamente</p>
        </div>
        <div class="concept-item">
          <h4>Lifecycle Hooks</h4>
          <p>Gestión de recursos y cleanup en ngOnDestroy</p>
        </div>
      </div>
    </div>
  </section>
</div>
```

### PASO 3: Estilos y Verificación (15 minutos)

Crear estilos globales para las directivas en `src/styles/directives.scss`:

```scss
// Estilos globales para directivas personalizadas

// Tooltip
.custom-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 10000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  max-width: 300px;

  &.tooltip-visible {
    opacity: 1;
  }

  &.tooltip-large {
    max-width: 400px;
    padding: 12px 16px;
    font-size: 16px;
  }

  // Flechas para diferentes posiciones
  &.tooltip-top::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }

  &.tooltip-bottom::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: rgba(0, 0, 0, 0.9);
  }

  &.tooltip-left::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-left-color: rgba(0, 0, 0, 0.9);
  }

  &.tooltip-right::after {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-right-color: rgba(0, 0, 0, 0.9);
  }
}

// Lazy Loading
.lazy-loading {
  filter: blur(5px);
  transition: filter 0.3s ease;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  background-size: 400% 400%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.lazy-loaded {
  filter: blur(0);
  animation: fadeIn 0.5s ease;
}

.lazy-error {
  filter: grayscale(100%) brightness(0.7);
  opacity: 0.6;
}

.fade-in {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

// Validation Feedback
.validation-valid {
  border: 2px solid #28a745 !important;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
  background: rgba(40, 167, 69, 0.05);
}

.validation-invalid {
  border: 2px solid #dc3545 !important;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.2);
  background: rgba(220, 53, 69, 0.05);
}

.validation-pending {
  border: 2px solid #ffc107 !important;
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.2);
  background: rgba(255, 193, 7, 0.05);
}

.validation-shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.validation-message {
  position: absolute;
  bottom: -25px;
  left: 0;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  z-index: 1000;

  &.validation-message-error {
    background: #dc3545;
    color: white;
  }

  &.validation-message-visible {
    opacity: 1;
  }
}
```

Importar en `src/styles.scss`:
```scss
// Estilos globales existentes...
@import 'styles/directives';
```

## ✅ CHECKLIST DE VERIFICACIÓN LAB 3

### Directivas Creadas
- [ ] TooltipDirective con posicionamiento dinámico
- [ ] LazyLoadDirective con IntersectionObserver
- [ ] ValidationFeedbackDirective con estados visuales
- [ ] Todas las directivas standalone

### HostListener Implementado
- [ ] Eventos de mouse (mouseenter, mouseleave)
- [ ] Eventos de teclado y formulario
- [ ] Eventos globales (window, document)
- [ ] Cleanup de eventos en ngOnDestroy

### HostBinding Implementado
- [ ] Binding de clases CSS dinámicas
- [ ] Binding de estilos inline
- [ ] Binding de atributos (aria, data)
- [ ] Getters para lógica compleja

### Renderer2 Implementado
- [ ] Creación segura de elementos
- [ ] Manipulación de clases y estilos
- [ ] Gestión de jerarquía DOM
- [ ] Cleanup automático de elementos

### Testing Manual
```bash
# Ejecutar la aplicación
ng serve --open

# Navegar a http://localhost:4200/custom-directives-showcase
# Verificar:
# 1. Tooltips aparecen con hover y posicionamiento correcto
# 2. Imágenes cargan solo cuando entran en viewport
# 3. Validación muestra feedback visual inmediato
# 4. Animaciones y transiciones funcionan suavemente
# 5. No hay errores en consola
```

## 🎓 Conocimientos Adquiridos

Al completar este laboratorio habrás dominado:

### 1. Arquitectura de Directivas
- ✅ **Selector y configuración**: Configuración standalone moderna
- ✅ **Inyección de dependencias**: ElementRef, Renderer2
- ✅ **Lifecycle management**: OnInit, OnDestroy, cleanup

### 2. HostListener Avanzado
- ✅ **Eventos locales**: Mouse, keyboard, form events
- ✅ **Eventos globales**: Window, document events
- ✅ **Event parameters**: Acceso a $event y propiedades
- ✅ **Performance**: Debouncing y throttling

### 3. HostBinding Dinámico
- ✅ **Clases CSS**: Binding reactivo de clases
- ✅ **Estilos inline**: Propiedades CSS dinámicas
- ✅ **Atributos HTML**: ARIA, data attributes
- ✅ **Getters computados**: Lógica compleja reactiva

### 4. Renderer2 Profesional
- ✅ **DOM Manipulation**: Creación y modificación segura
- ✅ **Event Handling**: Listeners con cleanup automático
- ✅ **Security**: Prevención de XSS attacks
- ✅ **Platform Independence**: Compatible con SSR

### 5. Patrones Avanzados
- ✅ **IntersectionObserver**: APIs modernas del navegador
- ✅ **Async Validation**: Validación asíncrona con estados
- ✅ **Dynamic Positioning**: Cálculos de posición inteligentes
- ✅ **Memory Management**: Prevención de memory leaks

## 💡 Casos de Uso Reales

Estas directivas tienen aplicaciones directas en:

- **🔧 Sistemas de Help**: Tooltips contextuales en aplicaciones complejas
- **📱 Apps Mobile-First**: Lazy loading para performance en dispositivos móviles
- **📝 Formularios Empresariales**: Validación visual inmediata y profesional
- **🎮 Interfaces Interactivas**: Feedback visual y animaciones de estado
- **♿ Accesibilidad**: ARIA attributes y navegación por teclado

## 🚀 Siguiente Paso

Una vez dominadas las directivas personalizadas complejas, estarás listo para el **LAB 4: Host Binding y Renderer2 Avanzado** donde implementarás un sistema completo de Drag & Drop usando todas las técnicas aprendidas.

---

*Este laboratorio demuestra el poder de las directivas personalizadas en Angular 18. Has creado herramientas reutilizables que resuelven problemas reales de UI/UX de forma elegante y profesional.*
