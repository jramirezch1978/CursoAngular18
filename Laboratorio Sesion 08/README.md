# LAB 4: PERFORMANCE Y ACCESIBILIDAD

## 📋 INFORMACIÓN DEL LABORATORIO

**Duración:** 20 minutos  
**Nivel:** Avanzado  
**Enfoque:** Optimización de performance y accesibilidad (a11y)  
**Instructor:** Ing. Jhonny Alexander Ramirez Chiroque  

## 🎯 OBJETIVOS DE APRENDIZAJE

- **Implementar OnPush Change Detection** para optimización extrema
- **Configurar Lazy Loading** de módulos y componentes  
- **Aplicar técnicas de accesibilidad** (WCAG 2.1)
- **Optimizar bundle size** con tree-shaking
- **Implementar Virtual Scrolling** para listas grandes
- **Crear interfaces accesibles** para todos los usuarios
- **Medir y optimizar Core Web Vitals**

## 📚 MARCO TEÓRICO Y CONCEPTOS FUNDAMENTALES

### Performance en Angular

> *"OnPush Change Detection es como pasar de revisar todo constantemente a revisar solo cuando hay notificaciones. En aplicaciones grandes, la diferencia es dramática. De cientos de chequeos por segundo a decenas. De lag perceptible a fluidez instantánea."*

#### Estrategias de Change Detection

**Default Strategy (Costosa):**
```typescript
// ❌ Angular revisa TODOS los componentes en cada ciclo
@Component({
  selector: 'app-expensive',
  // changeDetection: ChangeDetectionStrategy.Default (por defecto)
})
```

**OnPush Strategy (Eficiente):**
```typescript
// ✅ Solo se revisa cuando:
// - @Input cambia referencia
// - Evento se dispara
// - Observable emite con async pipe
@Component({
  selector: 'app-efficient', 
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Lazy Loading Inteligente

> *"Lazy Loading es como un buffet donde solo traen los platos cuando los piden, no todos de una vez. Una aplicación de 5MB puede tener un bundle inicial de 1.5MB con Lazy Loading. Es 70% menos tiempo de carga inicial."*

#### Implementación de Lazy Loading

```typescript
// Rutas con lazy loading
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component')
      .then(c => c.AdminComponent)
  },
  {
    path: 'reports', 
    loadChildren: () => import('./reports/reports.routes')
      .then(r => r.REPORTS_ROUTES)
  }
];
```

### Accesibilidad Web (a11y)

> *"La accesibilidad no es caridad; es profesionalismo. Sus formularios deben funcionar para todos. La accesibilidad beneficia a todos: usuarios en móviles, usuarios en ambientes ruidosos, usuarios cansados. Es diseño universal."*

#### Principios WCAG 2.1

1. **Perceptible**: La información debe ser presentada de formas que los usuarios puedan percibir
2. **Operable**: Los componentes de la interfaz deben ser operables
3. **Comprensible**: La información y el funcionamiento de la interfaz debe ser comprensible
4. **Robusto**: El contenido debe ser lo suficientemente robusto para ser interpretado por una gran variedad de agentes de usuario

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### 1. OnPush + Inmutabilidad

```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngFor="let user of users$ | async; trackBy: trackByUserId">
      {{ user.name }}
    </div>
  `
})
export class UserListComponent {
  users$ = this.userService.users$.pipe(
    // ✅ Crear nuevos arrays para disparar OnPush
    map(users => [...users.sort((a, b) => a.name.localeCompare(b.name))])
  );
  
  // ✅ TrackBy para optimizar *ngFor
  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
```

### 2. Virtual Scrolling para Listas Grandes

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-virtual-list',
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items">{{item}}</div>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .viewport { 
      height: 400px; 
      width: 100%;
    }
  `]
})
export class VirtualListComponent {
  items = Array.from({length: 100000}).map((_, i) => `Item #${i}`);
}
```

### 3. Lazy Loading de Imágenes

```typescript
@Directive({
  selector: 'img[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad!: string;
  
  private observer?: IntersectionObserver;
  
  constructor(private el: ElementRef<HTMLImageElement>) {}
  
  ngOnInit() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    });
    
    this.observer.observe(this.el.nativeElement);
  }
  
  private loadImage() {
    this.el.nativeElement.src = this.appLazyLoad;
  }
}
```

### 4. Memoización con Pure Pipes

```typescript
@Pipe({ 
  name: 'expensiveCalculation',
  pure: true // ✅ Solo recalcula si cambian los inputs
})
export class ExpensiveCalculationPipe implements PipeTransform {
  private cache = new Map<string, number>();
  
  transform(value: number, factor: number): number {
    const cacheKey = `${value}-${factor}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Simulación de cálculo costoso
    const result = this.heavyCalculation(value, factor);
    this.cache.set(cacheKey, result);
    
    return result;
  }
}
```

## ♿ IMPLEMENTACIONES DE ACCESIBILIDAD

### 1. Formularios Accesibles

```typescript
@Component({
  template: `
    <!-- ✅ Labels correctamente asociados -->
    <label for="email">Email *</label>
    <input 
      id="email"
      type="email"
      [attr.aria-describedby]="emailError ? 'email-error' : null"
      [attr.aria-invalid]="emailControl.invalid && emailControl.touched"
      formControlName="email">
    
    <!-- ✅ Error anunciado por screen readers -->
    <div 
      id="email-error" 
      role="alert" 
      *ngIf="emailControl.invalid && emailControl.touched">
      El email es obligatorio
    </div>
    
    <!-- ✅ Progress indicator -->
    <div 
      role="progressbar" 
      [attr.aria-valuenow]="formProgress"
      aria-valuemin="0" 
      aria-valuemax="100"
      [attr.aria-label]="'Progreso del formulario: ' + formProgress + '%'">
      Progreso: {{formProgress}}%
    </div>
  `
})
export class AccessibleFormComponent {
  get emailControl() { return this.form.get('email')!; }
  get formProgress() { return this.calculateFormProgress(); }
}
```

### 2. Navegación por Teclado

```typescript
@Directive({
  selector: '[appKeyboardNav]'
})
export class KeyboardNavDirective {
  
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        this.focusNext();
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.focusPrevious();
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        this.activate();
        event.preventDefault();
        break;
      case 'Escape':
        this.close();
        event.preventDefault();
        break;
    }
  }
  
  private focusNext() {
    const focusable = this.getFocusableElements();
    const current = focusable.indexOf(document.activeElement as HTMLElement);
    const next = (current + 1) % focusable.length;
    focusable[next]?.focus();
  }
}
```

### 3. Contraste y Colores Accesibles

```scss
// Variables con contrastes WCAG AA compliant
:root {
  // ✅ Ratio 4.5:1 para texto normal
  --color-text-primary: #212529;     // 16.94:1 contra blanco
  --color-text-secondary: #495057;   // 8.90:1 contra blanco
  
  // ✅ Ratio 3:1 para texto grande
  --color-text-large: #6c757d;       // 4.53:1 contra blanco
  
  // ✅ Estados de error visibles
  --color-error: #dc3545;             // 5.14:1 contra blanco
  --color-success: #198754;           // 4.52:1 contra blanco
  
  // ✅ Focus visible
  --focus-outline: 2px solid #0066cc;
}

// Utilities para accesibilidad
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.focus-visible {
  outline: var(--focus-outline);
  outline-offset: 2px;
}

// High contrast mode support
@media (prefers-contrast: high) {
  :root {
    --color-text-primary: #000000;
    --color-background: #ffffff;
    --border-color: #000000;
  }
}

// Reduced motion support  
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Live Regions para Feedback Dinámico

```typescript
@Injectable({ providedIn: 'root' })
export class LiveAnnouncer {
  private liveElement!: HTMLElement;
  
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.createLiveElement();
  }
  
  private createLiveElement() {
    this.liveElement = this.document.createElement('div');
    this.liveElement.setAttribute('aria-live', 'polite');
    this.liveElement.setAttribute('aria-atomic', 'true');
    this.liveElement.className = 'sr-only';
    this.document.body.appendChild(this.liveElement);
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    this.liveElement.setAttribute('aria-live', priority);
    this.liveElement.textContent = message;
    
    // Limpiar después de anunciar
    setTimeout(() => {
      this.liveElement.textContent = '';
    }, 1000);
  }
}
```

## 📊 MÉTRICAS Y MONITOREO

### Core Web Vitals

```typescript
@Injectable({ providedIn: 'root' })
export class PerformanceMonitorService {
  
  measureCLS() {
    return new Promise(resolve => {
      new PerformanceObserver((list) => {
        let clsValue = 0;
        
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        resolve(clsValue);
      }).observe({entryTypes: ['layout-shift']});
    });
  }
  
  measureFCP() {
    return new Promise(resolve => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            resolve(entry.startTime);
          }
        }
      }).observe({entryTypes: ['paint']});
    });
  }
  
  measureLCP() {
    return new Promise(resolve => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({entryTypes: ['largest-contentful-paint']});
    });
  }
}
```

## 🧪 TESTING DE PERFORMANCE Y ACCESIBILIDAD

### Lighthouse CI Integration

```typescript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run serve:prod',
      url: ['http://localhost:4200'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Axe-core para Testing de Accesibilidad

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const fixture = TestBed.createComponent(FormComponent);
    const compiled = fixture.nativeElement;
    
    const results = await axe(compiled);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper focus management', () => {
    const fixture = TestBed.createComponent(FormComponent);
    const button = fixture.nativeElement.querySelector('button');
    
    button.click();
    
    const modal = document.querySelector('[role="dialog"]');
    const focusedElement = modal?.querySelector('[autofocus]');
    
    expect(document.activeElement).toBe(focusedElement);
  });
});
```

## 📋 CHECKLIST DE OPTIMIZACIÓN

### Performance
- [ ] ✅ OnPush implementado en componentes críticos
- [ ] ✅ TrackBy functions en *ngFor
- [ ] ✅ Lazy loading configurado
- [ ] ✅ Bundle analyzer ejecutado
- [ ] ✅ Imágenes optimizadas y lazy loaded
- [ ] ✅ Virtual scrolling para listas grandes
- [ ] ✅ Pure pipes para cálculos costosos
- [ ] ✅ Service Workers configurados

### Accesibilidad  
- [ ] ✅ Contraste mínimo 4.5:1 (texto normal)
- [ ] ✅ Contraste mínimo 3:1 (texto grande)
- [ ] ✅ Navegación por teclado funcional
- [ ] ✅ Screen reader compatible
- [ ] ✅ Labels correctamente asociados
- [ ] ✅ Live regions implementadas
- [ ] ✅ Estados de error anunciados
- [ ] ✅ Focus management implementado

### Métricas
- [ ] ✅ First Contentful Paint < 1.8s
- [ ] ✅ Largest Contentful Paint < 2.5s
- [ ] ✅ Cumulative Layout Shift < 0.1
- [ ] ✅ Lighthouse Score > 90
- [ ] ✅ Axe-core tests passing

## 🛠️ HERRAMIENTAS DE DESARROLLO

### Bundle Analysis
```bash
# Analizar bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/*/stats.json
```

### Performance Profiling
```bash
# Production build con source maps
ng build --prod --source-map

# Serve con gzip
npx http-server dist/ -g -p 8080
```

### Accessibility Testing
```bash
# Instalar herramientas
npm install --save-dev @axe-core/puppeteer
npm install --save-dev lighthouse-ci

# Ejecutar auditorías
npx lighthouse-ci collect
```

## 🎯 TARGETS DE PERFORMANCE

### Métricas Objetivo (Mobile)
- **First Contentful Paint**: < 1.8 segundos
- **Largest Contentful Paint**: < 2.5 segundos  
- **First Input Delay**: < 100 milisegundos
- **Cumulative Layout Shift**: < 0.1

### Métricas de Accesibilidad
- **Lighthouse Accessibility Score**: > 95
- **Axe Violations**: 0
- **Keyboard Navigation**: 100% funcional
- **Screen Reader Compatibility**: 100%

## 💡 MEJORES PRÁCTICAS ESTABLECIDAS

1. **Performance First**: Optimizar desde el diseño
2. **Measure Everything**: Lo que no se mide no se mejora
3. **Progressive Enhancement**: Funcionar en todos los dispositivos
4. **Accessibility by Design**: Incluir desde el principio
5. **Monitor Continuously**: Performance es un proceso continuo

## 🚀 SIGUIENTES PASOS

Una vez completado este laboratorio, habrás implementado:

✅ **Performance extrema** con OnPush y lazy loading  
✅ **Accesibilidad completa** siguiendo WCAG 2.1  
✅ **Monitoreo continuo** de métricas clave  
✅ **Testing automatizado** de performance y a11y  

Tus aplicaciones serán **rápidas, accesibles y profesionales**.

---

### 💡 REFLEXIÓN FINAL

> *"La performance y accesibilidad no son características opcionales. Son requisitos fundamentales de cualquier aplicación moderna. Cada milisegundo cuenta, cada usuario importa."*

**Instructor: Ing. Jhonny Alexander Ramirez Chiroque**  
**PROVIAS DESCENTRALIZADO - Angular v18**