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
  @Input() lazyLoadPlaceholder = 'https://via.placeholder.com/300x200?text=Loading...';
  @Input() lazyLoadError = 'https://via.placeholder.com/300x200?text=Error';
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
