import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective {
  @Input() appDraggable = true;
  @Input() dragData: any = null;
  @Input() dragHandle = '';
  @Input() dragPreview = true;
  
  @Output() dragStart = new EventEmitter<DragEvent>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() dragMove = new EventEmitter<DragEvent>();
  
  @HostBinding('draggable')
  get draggable(): boolean {
    return this.appDraggable && !this.dragHandle;
  }
  
  @HostBinding('class.dragging')
  isDragging = false;
  
  @HostBinding('style.cursor')
  get cursor(): string {
    return this.appDraggable ? 'move' : 'default';
  }
  
  @HostBinding('style.opacity')
  get opacity(): string {
    return this.isDragging ? '0.5' : '1';
  }
  
  @HostBinding('style.transform')
  get transform(): string {
    return this.isDragging ? 'scale(1.05)' : 'scale(1)';
  }
  
  private dragCounter = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.setupDragHandle();
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (!this.appDraggable) {
      event.preventDefault();
      return;
    }

    this.isDragging = true;
    this.dragCounter = 0;

    // Configurar datos de transferencia
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', JSON.stringify(this.dragData || {}));
    event.dataTransfer!.setData('dragElementId', this.el.nativeElement.id || '');

    // Crear preview personalizado si está habilitado
    if (this.dragPreview) {
      this.createDragPreview(event);
    }

    this.dragStart.emit(event);
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    this.isDragging = false;
    this.dragEnd.emit(event);
    this.cleanupDragPreview();
  }

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent): void {
    this.dragCounter++;
    if (this.dragCounter % 5 === 0) { // Emitir cada 5 eventos para optimización
      this.dragMove.emit(event);
    }
  }

  private setupDragHandle(): void {
    if (this.dragHandle) {
      const handle = this.el.nativeElement.querySelector(this.dragHandle);
      if (handle) {
        this.renderer.setAttribute(handle, 'draggable', 'true');
        this.renderer.setStyle(handle, 'cursor', 'move');
      }
    }
  }

  private createDragPreview(event: DragEvent): void {
    const preview = this.renderer.createElement('div');
    this.renderer.addClass(preview, 'drag-preview');
    this.renderer.setStyle(preview, 'position', 'absolute');
    this.renderer.setStyle(preview, 'top', '-1000px');
    this.renderer.setStyle(preview, 'left', '-1000px');
    this.renderer.setStyle(preview, 'opacity', '0.8');
    this.renderer.setStyle(preview, 'transform', 'rotate(2deg) scale(1.05)');
    this.renderer.setStyle(preview, 'box-shadow', '0 10px 30px rgba(0, 0, 0, 0.3)');
    this.renderer.setStyle(preview, 'border-radius', '8px');
    this.renderer.setStyle(preview, 'background', 'white');
    this.renderer.setStyle(preview, 'padding', '10px');
    
    // Copiar contenido del elemento
    const content = this.el.nativeElement.cloneNode(true);
    this.renderer.appendChild(preview, content);
    this.renderer.appendChild(document.body, preview);
    
    // Establecer como imagen de arrastre
    event.dataTransfer!.setDragImage(preview, 0, 0);
    
    // Limpiar después de un pequeño retraso
    setTimeout(() => {
      this.renderer.removeChild(document.body, preview);
    }, 0);
  }

  private cleanupDragPreview(): void {
    // Limpieza adicional si es necesaria
  }
}
