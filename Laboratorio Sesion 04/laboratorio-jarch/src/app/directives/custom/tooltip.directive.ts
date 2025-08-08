import { 
  Directive, 
  ElementRef, 
  HostListener, 
  Input, 
  Renderer2, 
  OnDestroy,
  ViewContainerRef,
  TemplateRef,
  ComponentRef,
  ApplicationRef,
  Injector,
  createComponent
} from '@angular/core';

export interface TooltipPosition {
  top: number;
  left: number;
}

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input() tooltipPlacement: TooltipPlacement = 'top';
  @Input() tooltipDelay: number = 500;
  @Input() tooltipTheme: 'dark' | 'light' | 'info' | 'warning' | 'error' = 'dark';
  @Input() tooltipMaxWidth: string = '250px';
  @Input() tooltipDisabled: boolean = false;

  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any;
  private hideTimeout: any;
  private isVisible: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (this.tooltipDisabled || !this.tooltipText.trim()) return;
    
    this.clearTimeouts();
    this.showTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => {
      this.hideTooltip();
    }, 100);
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (this.tooltipDisabled || !this.tooltipText.trim()) return;
    this.showTooltip();
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    this.hideTooltip();
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // Mantener tooltip visible en click para dispositivos táctiles
    if (this.isVisible) {
      this.hideTooltip();
    } else if (!this.tooltipDisabled && this.tooltipText.trim()) {
      this.showTooltip();
    }
  }

  private showTooltip(): void {
    if (this.isVisible || this.tooltipDisabled) return;

    this.createTooltipElement();
    this.positionTooltip();
    this.isVisible = true;
  }

  private hideTooltip(): void {
    if (!this.isVisible) return;

    if (this.tooltipElement) {
      this.renderer.removeClass(this.tooltipElement, 'tooltip-visible');
      setTimeout(() => {
        if (this.tooltipElement) {
          document.body.removeChild(this.tooltipElement);
          this.tooltipElement = null;
        }
      }, 200);
    }
    this.isVisible = false;
  }

  private createTooltipElement(): void {
    if (this.tooltipElement) return;

    // Crear elemento tooltip
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipTheme}`);
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPlacement}`);
    
    // Configurar estilos
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '10000');
    this.renderer.setStyle(this.tooltipElement, 'max-width', this.tooltipMaxWidth);
    this.renderer.setStyle(this.tooltipElement, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '14px');
    this.renderer.setStyle(this.tooltipElement, 'line-height', '1.4');
    this.renderer.setStyle(this.tooltipElement, 'word-wrap', 'break-word');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.tooltipElement, 'transform', 'scale(0.8)');
    this.renderer.setStyle(this.tooltipElement, 'transition', 'all 0.2s ease-in-out');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');

    // Aplicar tema
    this.applyTheme();

    // Agregar texto
    const textNode = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, textNode);

    // Agregar arrow
    this.createArrow();

    // Agregar al DOM
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Mostrar con animación
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'tooltip-visible');
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
        this.renderer.setStyle(this.tooltipElement, 'transform', 'scale(1)');
      }
    }, 10);
  }

  private applyTheme(): void {
    if (!this.tooltipElement) return;

    const themes = {
      dark: {
        background: '#333',
        color: '#fff',
        border: 'none'
      },
      light: {
        background: '#fff',
        color: '#333',
        border: '1px solid #ddd'
      },
      info: {
        background: '#007bff',
        color: '#fff',
        border: 'none'
      },
      warning: {
        background: '#ffc107',
        color: '#212529',
        border: 'none'
      },
      error: {
        background: '#dc3545',
        color: '#fff',
        border: 'none'
      }
    };

    const theme = themes[this.tooltipTheme];
    this.renderer.setStyle(this.tooltipElement, 'background', theme.background);
    this.renderer.setStyle(this.tooltipElement, 'color', theme.color);
    if (theme.border) {
      this.renderer.setStyle(this.tooltipElement, 'border', theme.border);
    }
    this.renderer.setStyle(this.tooltipElement, 'box-shadow', '0 4px 12px rgba(0,0,0,0.15)');
  }

  private createArrow(): void {
    if (!this.tooltipElement) return;

    const arrow = this.renderer.createElement('div');
    this.renderer.addClass(arrow, 'tooltip-arrow');
    this.renderer.setStyle(arrow, 'position', 'absolute');
    this.renderer.setStyle(arrow, 'width', '0');
    this.renderer.setStyle(arrow, 'height', '0');
    
    const themes = {
      dark: '#333',
      light: '#fff',
      info: '#007bff',
      warning: '#ffc107',
      error: '#dc3545'
    };

    const color = themes[this.tooltipTheme];

    // Posición y estilo del arrow según placement
    switch (this.tooltipPlacement) {
      case 'top':
        this.renderer.setStyle(arrow, 'bottom', '-5px');
        this.renderer.setStyle(arrow, 'left', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(arrow, 'border-left', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-top', `5px solid ${color}`);
        break;
      case 'bottom':
        this.renderer.setStyle(arrow, 'top', '-5px');
        this.renderer.setStyle(arrow, 'left', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(arrow, 'border-left', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-bottom', `5px solid ${color}`);
        break;
      case 'left':
        this.renderer.setStyle(arrow, 'right', '-5px');
        this.renderer.setStyle(arrow, 'top', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(arrow, 'border-top', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-bottom', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-left', `5px solid ${color}`);
        break;
      case 'right':
        this.renderer.setStyle(arrow, 'left', '-5px');
        this.renderer.setStyle(arrow, 'top', '50%');
        this.renderer.setStyle(arrow, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(arrow, 'border-top', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-bottom', '5px solid transparent');
        this.renderer.setStyle(arrow, 'border-right', `5px solid ${color}`);
        break;
    }

    this.renderer.appendChild(this.tooltipElement, arrow);
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let position: TooltipPosition;
    let finalPlacement = this.tooltipPlacement;

    // Auto-posicionamiento si placement es 'auto'
    if (this.tooltipPlacement === 'auto') {
      finalPlacement = this.determineBestPlacement(hostRect, tooltipRect, viewport);
    }

    position = this.calculatePosition(hostRect, tooltipRect, finalPlacement);

    // Ajustar si se sale del viewport
    position = this.adjustForViewport(position, tooltipRect, viewport);

    this.renderer.setStyle(this.tooltipElement, 'top', `${position.top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${position.left}px`);
  }

  private determineBestPlacement(
    hostRect: DOMRect, 
    tooltipRect: DOMRect, 
    viewport: any
  ): TooltipPlacement {
    const spaces = {
      top: hostRect.top,
      bottom: viewport.height - hostRect.bottom,
      left: hostRect.left,
      right: viewport.width - hostRect.right
    };

    const maxSpace = Math.max(...Object.values(spaces));
    return Object.keys(spaces).find(key => spaces[key as keyof typeof spaces] === maxSpace) as TooltipPlacement;
  }

  private calculatePosition(
    hostRect: DOMRect, 
    tooltipRect: DOMRect, 
    placement: TooltipPlacement
  ): TooltipPosition {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (placement) {
      case 'top':
        return {
          top: hostRect.top + scrollTop - tooltipRect.height - 10,
          left: hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2
        };
      case 'bottom':
        return {
          top: hostRect.bottom + scrollTop + 10,
          left: hostRect.left + scrollLeft + (hostRect.width - tooltipRect.width) / 2
        };
      case 'left':
        return {
          top: hostRect.top + scrollTop + (hostRect.height - tooltipRect.height) / 2,
          left: hostRect.left + scrollLeft - tooltipRect.width - 10
        };
      case 'right':
        return {
          top: hostRect.top + scrollTop + (hostRect.height - tooltipRect.height) / 2,
          left: hostRect.right + scrollLeft + 10
        };
      default:
        return { top: 0, left: 0 };
    }
  }

  private adjustForViewport(
    position: TooltipPosition, 
    tooltipRect: DOMRect, 
    viewport: any
  ): TooltipPosition {
    // Ajustar horizontalmente
    if (position.left < 0) {
      position.left = 10;
    } else if (position.left + tooltipRect.width > viewport.width) {
      position.left = viewport.width - tooltipRect.width - 10;
    }

    // Ajustar verticalmente
    if (position.top < 0) {
      position.top = 10;
    } else if (position.top + tooltipRect.height > viewport.height) {
      position.top = viewport.height - tooltipRect.height - 10;
    }

    return position;
  }

  private clearTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
    this.hideTooltip();
  }
}