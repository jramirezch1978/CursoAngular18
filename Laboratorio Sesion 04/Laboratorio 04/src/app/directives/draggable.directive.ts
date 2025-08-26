import { Directive, Input, Output, EventEmitter, HostListener, HostBinding, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() appDraggable: any; // Datos del elemento a arrastrar
  @Input() dragDisabled: boolean = false;
  
  @Output() dragStart = new EventEmitter<any>();
  @Output() dragEnd = new EventEmitter<void>();
  
  private isDragging = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  // HostBinding para propiedades del elemento
  @HostBinding('draggable')
  get draggable() {
    return !this.dragDisabled;
  }

  @HostBinding('class.is-dragging')
  get draggingClass() {
    return this.isDragging;
  }

  @HostBinding('style.opacity')
  get dragOpacity() {
    return this.isDragging ? '0.5' : '1';
  }

  @HostBinding('style.cursor')
  get cursor() {
    return this.dragDisabled ? 'not-allowed' : 'grab';
  }

  @HostBinding('style.transform')
  get transform() {
    return this.isDragging ? 'scale(1.05) rotate(2deg)' : 'none';
  }

  // HostListener para eventos de drag
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    if (this.dragDisabled) {
      event.preventDefault();
      return;
    }

    this.isDragging = true;
    
    // Configurar datos de transferencia
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', JSON.stringify(this.appDraggable));
    
    // Crear imagen de arrastre personalizada
    this.createDragImage(event);
    
    // Agregar clase visual al documento
    this.renderer.addClass(document.body, 'dragging-active');
    
    // Emitir evento
    this.dragStart.emit(this.appDraggable);
    
    console.log('🖱️ Iniciando arrastre:', this.appDraggable.title);
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent) {
    this.isDragging = false;
    
    // Remover clase visual del documento
    this.renderer.removeClass(document.body, 'dragging-active');
    
    this.dragEnd.emit();
    
    console.log('✅ Arrastre finalizado');
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.dragDisabled) {
      this.renderer.addClass(this.el.nativeElement, 'drag-hover');
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.removeClass(this.el.nativeElement, 'drag-hover');
  }

  private createDragImage(event: DragEvent) {
    // Crear una copia del elemento para la imagen de arrastre
    const dragImage = this.renderer.createElement('div');
    this.renderer.setStyle(dragImage, 'background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    this.renderer.setStyle(dragImage, 'color', 'white');
    this.renderer.setStyle(dragImage, 'padding', '12px 16px');
    this.renderer.setStyle(dragImage, 'border-radius', '8px');
    this.renderer.setStyle(dragImage, 'box-shadow', '0 8px 24px rgba(102, 126, 234, 0.4)');
    this.renderer.setStyle(dragImage, 'position', 'absolute');
    this.renderer.setStyle(dragImage, 'top', '-1000px');
    this.renderer.setStyle(dragImage, 'left', '-1000px');
    this.renderer.setStyle(dragImage, 'font-weight', '600');
    this.renderer.setStyle(dragImage, 'font-size', '14px');
    this.renderer.setStyle(dragImage, 'white-space', 'nowrap');
    this.renderer.setStyle(dragImage, 'z-index', '9999');
    
    // Crear contenido de la imagen
    const content = this.renderer.createElement('div');
    const icon = this.renderer.createText('🚀 ');
    const text = this.renderer.createText(`${this.appDraggable.title}`);
    
    this.renderer.appendChild(content, icon);
    this.renderer.appendChild(content, text);
    this.renderer.appendChild(dragImage, content);
    this.renderer.appendChild(document.body, dragImage);
    
    // Establecer como imagen de arrastre
    event.dataTransfer!.setDragImage(dragImage, 80, 20);
    
    // Limpiar después de un momento
    setTimeout(() => {
      this.renderer.removeChild(document.body, dragImage);
    }, 0);
  }
}
