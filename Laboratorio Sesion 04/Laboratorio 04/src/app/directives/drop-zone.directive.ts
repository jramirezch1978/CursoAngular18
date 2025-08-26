import { Directive, Input, Output, EventEmitter, HostListener, HostBinding, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Input() appDropZone!: string; // ID de la zona de drop
  @Input() acceptedTypes: string[] = ['*'];
  
  @Output() itemDropped = new EventEmitter<{item: any, zone: string}>();
  
  private isDragOver = false;
  private dropIndicator?: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  // HostBinding para clases CSS
  @HostBinding('class.drop-zone')
  get isDropZone() {
    return true;
  }

  @HostBinding('class.drag-over')
  get dragOverClass() {
    return this.isDragOver;
  }

  @HostBinding('style.transition')
  get transition() {
    return 'all 0.3s ease';
  }

  // HostListener para eventos de drop
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    
    if (!this.isDragOver) {
      this.isDragOver = true;
      this.createDropIndicator();
      console.log('🎯 Zona de drop activada:', this.appDropZone);
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    // Solo activar si realmente salimos del elemento (considerando elementos hijos)
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.isDragOver = false;
      this.removeDropIndicator();
      console.log('🚫 Saliendo de zona de drop:', this.appDropZone);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    this.removeDropIndicator();
    
    try {
      const dragData = JSON.parse(event.dataTransfer!.getData('text/plain'));
      
      // Crear efecto visual de drop exitoso
      this.createDropSuccessEffect();
      
      // Emitir evento
      this.itemDropped.emit({
        item: dragData,
        zone: this.appDropZone
      });
      
      console.log('✅ Drop exitoso en:', this.appDropZone, dragData);
    } catch (error) {
      console.error('❌ Error al procesar drop:', error);
      this.createDropErrorEffect();
    }
  }

  private createDropIndicator() {
    this.removeDropIndicator(); // Asegurar que no hay duplicados
    
    this.dropIndicator = this.renderer.createElement('div');
    this.renderer.addClass(this.dropIndicator, 'drop-indicator');
    
    // Estilos del indicador con Renderer2
    this.renderer.setStyle(this.dropIndicator, 'position', 'absolute');
    this.renderer.setStyle(this.dropIndicator, 'top', '4px');
    this.renderer.setStyle(this.dropIndicator, 'left', '4px');
    this.renderer.setStyle(this.dropIndicator, 'right', '4px');
    this.renderer.setStyle(this.dropIndicator, 'bottom', '4px');
    this.renderer.setStyle(this.dropIndicator, 'background', 'rgba(59, 130, 246, 0.1)');
    this.renderer.setStyle(this.dropIndicator, 'border', '2px dashed #3b82f6');
    this.renderer.setStyle(this.dropIndicator, 'border-radius', '12px');
    this.renderer.setStyle(this.dropIndicator, 'pointer-events', 'none');
    this.renderer.setStyle(this.dropIndicator, 'animation', 'dropPulse 1.5s infinite');
    this.renderer.setStyle(this.dropIndicator, 'z-index', '10');
    
    // Agregar ícono central
    const dropIcon = this.renderer.createElement('div');
    this.renderer.setStyle(dropIcon, 'position', 'absolute');
    this.renderer.setStyle(dropIcon, 'top', '50%');
    this.renderer.setStyle(dropIcon, 'left', '50%');
    this.renderer.setStyle(dropIcon, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(dropIcon, 'font-size', '24px');
    this.renderer.setStyle(dropIcon, 'color', '#3b82f6');
    
    const iconText = this.renderer.createText('🎯');
    this.renderer.appendChild(dropIcon, iconText);
    this.renderer.appendChild(this.dropIndicator, dropIcon);
    
    this.renderer.appendChild(this.el.nativeElement, this.dropIndicator);
  }

  private removeDropIndicator() {
    if (this.dropIndicator) {
      this.renderer.removeChild(this.el.nativeElement, this.dropIndicator);
      this.dropIndicator = undefined;
    }
  }

  private createDropSuccessEffect() {
    const successEffect = this.renderer.createElement('div');
    this.renderer.addClass(successEffect, 'drop-success-effect');
    
    // Estilos del efecto de éxito
    this.renderer.setStyle(successEffect, 'position', 'absolute');
    this.renderer.setStyle(successEffect, 'top', '50%');
    this.renderer.setStyle(successEffect, 'left', '50%');
    this.renderer.setStyle(successEffect, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(successEffect, 'width', '80px');
    this.renderer.setStyle(successEffect, 'height', '80px');
    this.renderer.setStyle(successEffect, 'background', 'linear-gradient(135deg, #10b981 0%, #34d399 100%)');
    this.renderer.setStyle(successEffect, 'border-radius', '50%');
    this.renderer.setStyle(successEffect, 'display', 'flex');
    this.renderer.setStyle(successEffect, 'align-items', 'center');
    this.renderer.setStyle(successEffect, 'justify-content', 'center');
    this.renderer.setStyle(successEffect, 'color', 'white');
    this.renderer.setStyle(successEffect, 'font-size', '32px');
    this.renderer.setStyle(successEffect, 'font-weight', 'bold');
    this.renderer.setStyle(successEffect, 'animation', 'dropSuccess 0.8s ease-out');
    this.renderer.setStyle(successEffect, 'pointer-events', 'none');
    this.renderer.setStyle(successEffect, 'z-index', '20');
    this.renderer.setStyle(successEffect, 'box-shadow', '0 8px 24px rgba(16, 185, 129, 0.4)');
    
    // Agregar ícono de éxito
    const checkIcon = this.renderer.createText('✅');
    this.renderer.appendChild(successEffect, checkIcon);
    
    this.renderer.appendChild(this.el.nativeElement, successEffect);
    
    // Remover después de la animación
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, successEffect);
    }, 800);
  }

  private createDropErrorEffect() {
    const errorEffect = this.renderer.createElement('div');
    this.renderer.addClass(errorEffect, 'drop-error-effect');
    
    // Estilos del efecto de error
    this.renderer.setStyle(errorEffect, 'position', 'absolute');
    this.renderer.setStyle(errorEffect, 'top', '50%');
    this.renderer.setStyle(errorEffect, 'left', '50%');
    this.renderer.setStyle(errorEffect, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(errorEffect, 'width', '80px');
    this.renderer.setStyle(errorEffect, 'height', '80px');
    this.renderer.setStyle(errorEffect, 'background', 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)');
    this.renderer.setStyle(errorEffect, 'border-radius', '50%');
    this.renderer.setStyle(errorEffect, 'display', 'flex');
    this.renderer.setStyle(errorEffect, 'align-items', 'center');
    this.renderer.setStyle(errorEffect, 'justify-content', 'center');
    this.renderer.setStyle(errorEffect, 'color', 'white');
    this.renderer.setStyle(errorEffect, 'font-size', '32px');
    this.renderer.setStyle(errorEffect, 'animation', 'dropError 0.6s ease-out');
    this.renderer.setStyle(errorEffect, 'pointer-events', 'none');
    this.renderer.setStyle(errorEffect, 'z-index', '20');
    
    const errorIcon = this.renderer.createText('❌');
    this.renderer.appendChild(errorEffect, errorIcon);
    
    this.renderer.appendChild(this.el.nativeElement, errorEffect);
    
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, errorEffect);
    }, 600);
  }
}
