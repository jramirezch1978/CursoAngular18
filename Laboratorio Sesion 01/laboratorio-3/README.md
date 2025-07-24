# Laboratorio 3: CLI Avanzado, Herramientas, Testing y Optimización

## Propósito
Dominar Angular CLI, configurar herramientas de desarrollo, implementar testing, optimizar el proyecto y preparar la aplicación para producción.

## Pasos Detallados

### 1. Comandos Avanzados de Angular CLI
```bash
ng generate directive directives/highlight
ng generate pipe pipes/truncate
ng generate guard guards/auth
ng generate interface models/user
```
- Implementa lógica personalizada en cada archivo generado.

### 2. Uso de Pipes y Directivas
- Usa el pipe `truncate` y la directiva `highlight` en el componente Home.

### 3. Configuración de Herramientas de Desarrollo
- Crea la carpeta `.vscode` y configura `settings.json`, `launch.json` y `tasks.json`.
- Configura Prettier y ESLint para formateo y calidad de código.

### 4. Testing y Calidad de Código
```bash
ng test
ng lint
ng test --code-coverage --watch=false --browsers=ChromeHeadless
```
- Implementa tests personalizados para servicios y pipes.

### 5. Build y Optimización
```bash
ng build --configuration production
npm run build:analyze
npm run optimize:assets
```
- Analiza el bundle y optimiza assets.
- Configura variables de entorno y proxy para APIs.

## Ejemplo de Código: Directiva Highlight
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

## Checklist de Validación
- [ ] Directiva y pipe personalizados funcionando
- [ ] Guard e interfaces implementados
- [ ] Herramientas de desarrollo configuradas
- [ ] Tests unitarios y coverage report generados
- [ ] Linting sin errores
- [ ] Build de producción optimizado
- [ ] Proxy y environment variables funcionando
- [ ] Aplicación lista para producción y validada en Angular v18

---
¡Has completado todos los laboratorios de la Sesión 1! Tu aplicación Angular v18 está lista para el siguiente nivel. 