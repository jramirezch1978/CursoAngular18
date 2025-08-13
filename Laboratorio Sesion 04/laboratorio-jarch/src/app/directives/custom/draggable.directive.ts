import { 
  Directive, 
  ElementRef, 
  Input, 
  Output, 
  EventEmitter, 
  HostListener, 
  HostBinding, 
  OnInit, 
  OnDestroy,
  Renderer2
} from '@angular/core';

export interface DragData {
  id: string;
  type: string;
  data: any;
  sourceContainer?: string;
}

export interface DragEvent {
  dragData: DragData;
  originalEvent: Event;
  element: HTMLElement;
}

@Directive({
  selector: '[appDraggable]',
  standalone: true
})
export class DraggableDirective implements OnInit, OnDestroy {
  @Input('appDraggable') dragData: DragData = { id: '', type: '', data: null };
  @Input() dragDisabled: boolean = false;
  @Input() dragCursor: string = 'grab';
  @Input() dragOpacity: number = 0.7;
  @Input() dragZIndex: number = 1000;
  @Input() dragPreview: boolean = true;
  @Input() dragHandle: string = ''; // CSS selector for drag handle

  @Output() dragStart = new EventEmitter<DragEvent>();
  @Output() dragEnd = new EventEmitter<DragEvent>();
  @Output() dragMove = new EventEmitter<DragEvent>();

  @HostBinding('attr.draggable') get draggable() {
    return !this.dragDisabled;
  }

  @HostBinding('style.cursor') get cursor() {
    return this.dragDisabled ? 'default' : this.dragCursor;
  }

  private isDragging: boolean = false;
  private dragImage: HTMLElement | null = null;
  private originalOpacity: string = '';
  private originalZIndex: string = '';
  private mouseOffset = { x: 0, y: 0 };

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupDragHandles();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupDragHandles(): void {
    if (this.dragHandle) {
      const handles = this.elementRef.nativeElement.querySelectorAll(this.dragHandle);
      handles.forEach((handle: HTMLElement) => {
        this.renderer.setStyle(handle, 'cursor', this.dragCursor);
        this.renderer.setAttribute(handle, 'draggable', 'true');
      });
    }
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    if (this.dragDisabled) {
      event.preventDefault();
      return;
    }

    // Verificar si se arrastró desde el handle correcto
    if (this.dragHandle && !this.isValidDragHandle(event.target as HTMLElement)) {
      event.preventDefault();
      return;
    }

    this.isDragging = true;
    
    // Configurar datos del drag
    const dragEvent: DragEvent = {
      dragData: this.dragData,
      originalEvent: event,
      element: this.elementRef.nativeElement
    };

    // Configurar dataTransfer
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(this.dragData));
      
      // Crear imagen de preview personalizada
      if (this.dragPreview) {
        this.createDragImage(event);
      }
    }

    // Aplicar estilos de drag
    this.applyDragStyles();

    // Emitir evento
    this.dragStart.emit(dragEvent);
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Restaurar estilos originales
    this.restoreOriginalStyles();

    // Limpiar imagen de drag
    this.cleanup();

    const dragEvent: DragEvent = {
      dragData: this.dragData,
      originalEvent: event,
      element: this.elementRef.nativeElement
    };

    this.dragEnd.emit(dragEvent);
  }

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent): void {
    if (!this.isDragging) return;

    const dragEvent: DragEvent = {
      dragData: this.dragData,
      originalEvent: event,
      element: this.elementRef.nativeElement
    };

    this.dragMove.emit(dragEvent);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // Calcular offset del mouse para posicionamiento preciso
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.mouseOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private isValidDragHandle(target: HTMLElement): boolean {
    if (!this.dragHandle) return true;
    
    const handles = this.elementRef.nativeElement.querySelectorAll(this.dragHandle);
    for (let handle of handles) {
      if (handle.contains(target)) {
        return true;
      }
    }
    return false;
  }

  private createDragImage(event: DragEvent): void {
    if (!event.dataTransfer) return;

    const element = this.elementRef.nativeElement;
    
    // Crear clon del elemento para la imagen de drag
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Estilos para el clon
    this.renderer.setStyle(clone, 'position', 'absolute');
    this.renderer.setStyle(clone, 'top', '-9999px');
    this.renderer.setStyle(clone, 'left', '-9999px');
    this.renderer.setStyle(clone, 'transform', 'rotate(5deg)');
    this.renderer.setStyle(clone, 'opacity', '0.8');
    this.renderer.setStyle(clone, 'border', '2px dashed #007bff');
    this.renderer.setStyle(clone, 'border-radius', '8px');
    this.renderer.setStyle(clone, 'box-shadow', '0 4px 12px rgba(0,0,0,0.3)');
    this.renderer.setStyle(clone, 'pointer-events', 'none');
    this.renderer.setStyle(clone, 'z-index', '10000');

    // Agregar al DOM temporalmente
    this.renderer.appendChild(document.body, clone);
    this.dragImage = clone;

    // Configurar imagen de drag
    event.dataTransfer.setDragImage(
      clone, 
      this.mouseOffset.x, 
      this.mouseOffset.y
    );

    // Remover después de un frame
    setTimeout(() => {
      if (this.dragImage && document.body.contains(this.dragImage)) {
        this.renderer.removeChild(document.body, this.dragImage);
      }
    }, 0);
  }

  private applyDragStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Guardar estilos originales
    this.originalOpacity = element.style.opacity || '1';
    this.originalZIndex = element.style.zIndex || 'auto';

    // Aplicar estilos de drag
    this.renderer.setStyle(element, 'opacity', this.dragOpacity.toString());
    this.renderer.setStyle(element, 'z-index', this.dragZIndex.toString());
    this.renderer.addClass(element, 'dragging');
    
    // Efectos visuales adicionales
    this.renderer.setStyle(element, 'transform', 'scale(0.95) rotate(2deg)');
    this.renderer.setStyle(element, 'transition', 'all 0.2s ease');
    this.renderer.setStyle(element, 'box-shadow', '0 8px 25px rgba(0,0,0,0.3)');
  }

  private restoreOriginalStyles(): void {
    const element = this.elementRef.nativeElement;
    
    // Restaurar estilos
    this.renderer.setStyle(element, 'opacity', this.originalOpacity);
    this.renderer.setStyle(element, 'z-index', this.originalZIndex);
    this.renderer.removeClass(element, 'dragging');
    
    // Remover efectos visuales
    this.renderer.removeStyle(element, 'transform');
    this.renderer.removeStyle(element, 'transition');
    this.renderer.removeStyle(element, 'box-shadow');
  }

  private cleanup(): void {
    if (this.dragImage && document.body.contains(this.dragImage)) {
      this.renderer.removeChild(document.body, this.dragImage);
      this.dragImage = null;
    }
  }

  // Métodos públicos para control externo
  public setDragData(data: DragData): void {
    this.dragData = data;
  }

  public getDragData(): DragData {
    return this.dragData;
  }

  public setDragDisabled(disabled: boolean): void {
    this.dragDisabled = disabled;
  }

  public isDragActive(): boolean {
    return this.isDragging;
  }
}