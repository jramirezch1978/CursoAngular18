import { 
  Directive, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  Renderer2,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input('appLazyLoad') dataSrc: string = '';
  @Input() lazyLoadThreshold: string = '50px';
  @Input() lazyLoadPlaceholder: string = '';
  @Input() lazyLoadErrorSrc: string = '';
  @Input() lazyLoadFadeIn: boolean = true;
  @Input() lazyLoadRetryAttempts: number = 3;
  @Input() lazyLoadRetryDelay: number = 1000;

  @Output() lazyLoadStart = new EventEmitter<void>();
  @Output() lazyLoadSuccess = new EventEmitter<string>();
  @Output() lazyLoadError = new EventEmitter<Error>();
  @Output() lazyLoadComplete = new EventEmitter<boolean>();

  private observer: IntersectionObserver | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private retryCount: number = 0;
  private placeholderElement: HTMLElement | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.setupIntersectionObserver();
    this.setupPlaceholder();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    // Verificar soporte del IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores sin soporte
      this.loadContent();
      return;
    }

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: this.lazyLoadThreshold,
      threshold: 0.1
    };

    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isLoaded && !this.isLoading) {
            this.loadContent();
          }
        });
      },
      options
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private setupPlaceholder(): void {
    const element = this.elementRef.nativeElement;
    
    // Si es una imagen, configurar placeholder
    if (element.tagName.toLowerCase() === 'img') {
      this.setupImagePlaceholder(element);
    } else {
      // Para otros elementos, agregar clase de loading
      this.renderer.addClass(element, 'lazy-loading');
      this.addLoadingSpinner();
    }
  }

  private setupImagePlaceholder(imgElement: HTMLImageElement): void {
    // Establecer src inicial como placeholder si está disponible
    if (this.lazyLoadPlaceholder) {
      this.renderer.setAttribute(imgElement, 'src', this.lazyLoadPlaceholder);
    } else {
      // Crear placeholder con data URL de imagen en blanco
      const placeholderDataUrl = this.createPlaceholderDataUrl();
      this.renderer.setAttribute(imgElement, 'src', placeholderDataUrl);
    }

    // Agregar clases CSS para estilos
    this.renderer.addClass(imgElement, 'lazy-image');
    this.renderer.addClass(imgElement, 'lazy-loading');
    
    // Aplicar estilos de placeholder
    this.renderer.setStyle(imgElement, 'background', '#f0f0f0');
    this.renderer.setStyle(imgElement, 'transition', 'opacity 0.3s ease-in-out');
    
    if (this.lazyLoadFadeIn) {
      this.renderer.setStyle(imgElement, 'opacity', '0.7');
    }
  }

  private createPlaceholderDataUrl(): string {
    // Crear imagen placeholder con SVG
    const svg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">
          Cargando...
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private addLoadingSpinner(): void {
    const element = this.elementRef.nativeElement;
    
    // Crear spinner de carga
    const spinner = this.renderer.createElement('div');
    this.renderer.addClass(spinner, 'lazy-load-spinner');
    
    // Estilos del spinner
    this.renderer.setStyle(spinner, 'position', 'absolute');
    this.renderer.setStyle(spinner, 'top', '50%');
    this.renderer.setStyle(spinner, 'left', '50%');
    this.renderer.setStyle(spinner, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(spinner, 'width', '30px');
    this.renderer.setStyle(spinner, 'height', '30px');
    this.renderer.setStyle(spinner, 'border', '3px solid #f3f3f3');
    this.renderer.setStyle(spinner, 'border-top', '3px solid #007bff');
    this.renderer.setStyle(spinner, 'border-radius', '50%');
    this.renderer.setStyle(spinner, 'animation', 'spin 1s linear infinite');
    this.renderer.setStyle(spinner, 'z-index', '1000');

    // Agregar keyframes de animación
    this.addSpinnerAnimation();
    
    // Posición relativa al contenedor
    this.renderer.setStyle(element, 'position', 'relative');
    this.renderer.appendChild(element, spinner);
    
    this.placeholderElement = spinner;
  }

  private addSpinnerAnimation(): void {
    // Verificar si ya existe la animación
    if (document.querySelector('#lazy-load-spinner-keyframes')) {
      return;
    }

    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'id', 'lazy-load-spinner-keyframes');
    this.renderer.setProperty(style, 'textContent', `
      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `);
    this.renderer.appendChild(document.head, style);
  }

  private async loadContent(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;

    this.isLoading = true;
    this.lazyLoadStart.emit();

    const element = this.elementRef.nativeElement;

    try {
      if (element.tagName.toLowerCase() === 'img') {
        await this.loadImage(element);
      } else {
        await this.loadGenericContent();
      }

      this.onLoadSuccess();
    } catch (error) {
      this.onLoadError(error as Error);
    }
  }

  private loadImage(imgElement: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Actualizar src del elemento original
        this.renderer.setAttribute(imgElement, 'src', this.dataSrc);
        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${this.dataSrc}`));
      };

      // Iniciar carga
      img.src = this.dataSrc;
    });
  }

  private loadGenericContent(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simular carga de contenido
      setTimeout(() => {
        try {
          // Aquí se puede implementar lógica específica para cargar contenido
          // Por ejemplo, cargar componentes dinámicamente, datos, etc.
          
          // Renderizar template si existe
          if (this.templateRef) {
            this.viewContainer.createEmbeddedView(this.templateRef);
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 300); // Simular delay de red
    });
  }

  private onLoadSuccess(): void {
    this.isLoaded = true;
    this.isLoading = false;
    this.retryCount = 0;

    const element = this.elementRef.nativeElement;

    // Remover spinner/placeholder
    if (this.placeholderElement) {
      this.renderer.removeChild(element, this.placeholderElement);
      this.placeholderElement = null;
    }

    // Aplicar animación de fade in
    if (this.lazyLoadFadeIn) {
      this.renderer.removeClass(element, 'lazy-loading');
      this.renderer.addClass(element, 'lazy-loaded');
      
      if (element.tagName.toLowerCase() === 'img') {
        this.renderer.setStyle(element, 'opacity', '1');
      }
    }

    // Desconectar observer
    if (this.observer) {
      this.observer.unobserve(element);
    }

    this.lazyLoadSuccess.emit(this.dataSrc);
    this.lazyLoadComplete.emit(true);
  }

  private onLoadError(error: Error): void {
    this.isLoading = false;
    this.retryCount++;

    console.warn(`LazyLoad failed (attempt ${this.retryCount}):`, error);

    if (this.retryCount < this.lazyLoadRetryAttempts) {
      // Reintentar después del delay
      setTimeout(() => {
        this.loadContent();
      }, this.lazyLoadRetryDelay * this.retryCount);
    } else {
      // Máximo de reintentos alcanzado
      this.handleFinalError(error);
    }
  }

  private handleFinalError(error: Error): void {
    const element = this.elementRef.nativeElement;

    // Remover spinner
    if (this.placeholderElement) {
      this.renderer.removeChild(element, this.placeholderElement);
      this.placeholderElement = null;
    }

    // Aplicar imagen de error si es una imagen
    if (element.tagName.toLowerCase() === 'img' && this.lazyLoadErrorSrc) {
      this.renderer.setAttribute(element, 'src', this.lazyLoadErrorSrc);
    }

    // Agregar clase de error
    this.renderer.addClass(element, 'lazy-error');
    this.renderer.removeClass(element, 'lazy-loading');

    // Crear mensaje de error visual
    this.addErrorMessage();

    // Desconectar observer
    if (this.observer) {
      this.observer.unobserve(element);
    }

    this.lazyLoadError.emit(error);
    this.lazyLoadComplete.emit(false);
  }

  private addErrorMessage(): void {
    const element = this.elementRef.nativeElement;
    
    const errorDiv = this.renderer.createElement('div');
    this.renderer.addClass(errorDiv, 'lazy-load-error');
    this.renderer.setStyle(errorDiv, 'position', 'absolute');
    this.renderer.setStyle(errorDiv, 'top', '50%');
    this.renderer.setStyle(errorDiv, 'left', '50%');
    this.renderer.setStyle(errorDiv, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(errorDiv, 'background', 'rgba(220, 53, 69, 0.1)');
    this.renderer.setStyle(errorDiv, 'color', '#dc3545');
    this.renderer.setStyle(errorDiv, 'padding', '10px');
    this.renderer.setStyle(errorDiv, 'border-radius', '4px');
    this.renderer.setStyle(errorDiv, 'font-size', '12px');
    this.renderer.setStyle(errorDiv, 'text-align', 'center');

    const errorText = this.renderer.createText('Error al cargar');
    this.renderer.appendChild(errorDiv, errorText);

    // Botón de reintento
    const retryBtn = this.renderer.createElement('button');
    this.renderer.setStyle(retryBtn, 'margin-top', '5px');
    this.renderer.setStyle(retryBtn, 'padding', '2px 6px');
    this.renderer.setStyle(retryBtn, 'font-size', '10px');
    this.renderer.setStyle(retryBtn, 'background', '#dc3545');
    this.renderer.setStyle(retryBtn, 'color', 'white');
    this.renderer.setStyle(retryBtn, 'border', 'none');
    this.renderer.setStyle(retryBtn, 'border-radius', '2px');
    this.renderer.setStyle(retryBtn, 'cursor', 'pointer');

    const retryText = this.renderer.createText('Reintentar');
    this.renderer.appendChild(retryBtn, retryText);

    this.renderer.listen(retryBtn, 'click', () => {
      this.retryLoad();
    });

    this.renderer.appendChild(errorDiv, retryBtn);
    this.renderer.appendChild(element, errorDiv);
  }

  private retryLoad(): void {
    this.retryCount = 0;
    this.isLoaded = false;
    this.isLoading = false;

    const element = this.elementRef.nativeElement;
    
    // Limpiar estado de error
    this.renderer.removeClass(element, 'lazy-error');
    
    // Remover mensaje de error
    const errorElement = element.querySelector('.lazy-load-error');
    if (errorElement) {
      this.renderer.removeChild(element, errorElement);
    }

    // Reconfigurar placeholder y cargar
    this.setupPlaceholder();
    this.loadContent();
  }

  // Método público para forzar carga
  public forceLoad(): void {
    if (!this.isLoaded && !this.isLoading) {
      this.loadContent();
    }
  }

  // Método público para verificar estado
  public isContentLoaded(): boolean {
    return this.isLoaded;
  }
}