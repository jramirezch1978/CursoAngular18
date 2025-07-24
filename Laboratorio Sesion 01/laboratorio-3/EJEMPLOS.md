# Ejemplos Laboratorio 3: CLI Avanzado y Optimización

## 1. Comandos Avanzados de Angular CLI
```bash
ng generate directive directives/highlight
ng generate pipe pipes/truncate
ng generate guard guards/auth
ng generate interface models/user
```

## 2. Ejemplo de Directiva Highlight
```typescript
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  @Input() appHighlight = '#ffeb3b';
  constructor(private el: ElementRef) {}
  @HostListener('mouseenter') onMouseEnter() { this.highlight(this.appHighlight); }
  @HostListener('mouseleave') onMouseLeave() { this.highlight(''); }
  private highlight(color: string) { this.el.nativeElement.style.backgroundColor = color; }
}
```

## 3. Testing y Linting
```bash
ng test --code-coverage --watch=false --browsers=ChromeHeadless
ng lint
```

## 4. Build y Optimización
```bash
ng build --configuration production
npm run build:analyze
npm run optimize:assets
```

## 5. Scripts Útiles en package.json
```json
{
  "scripts": {
    "lint": "ng lint",
    "test:coverage": "ng test --code-coverage --watch=false --browsers=ChromeHeadless",
    "build:analyze": "ng build --stats-json && npx webpack-bundle-analyzer dist/mi-primera-app-angular/stats.json",
    "optimize:assets": "node scripts/optimize-assets.js"
  }
}
```

---
¡Con estos ejemplos puedes validar y optimizar tu proyecto Angular v18! 