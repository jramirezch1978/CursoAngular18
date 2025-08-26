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
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective {
  @Input() appDropZone = true;
  @Input() acceptTypes: string[] = [];
  @Input() dropEffect: 'none' | 'copy' | 'link' | 'move' = 'move';
  
  @Output() itemDropped = new EventEmitter<any>();
  @Output() dragEntered = new EventEmitter<DragEvent>();
  @Output() dragLeft = new EventEmitter<DragEvent>();
  @Output() draggedOver = new EventEmitter<DragEvent>();
  
  @HostBinding('class.drop-zone')
  isDropZone = true;
  
  @HostBinding('class.drag-over')
  isDragOver = false;
  
  @HostBinding('class.can-drop')
  canDrop = false;
  
  @HostBinding('style.border')
  get border(): string {
    if (!this.appDropZone) return '2px solid #dee2e6';
    return this.isDragOver 
      ? '2px dashed #667eea' 
      : '2px solid #dee2e6';
  }
  
  @HostBinding('style.background-color')
  get backgroundColor(): string {
    if (!this.appDropZone) return 'transparent';
    return this.isDragOver 
      ? 'rgba(102, 126, 234, 0.1)' 
      : 'transparent';
  }
  
  private dragCounter = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = this.dropEffect;
    
    this.draggedOver.emit(event);
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    event.preventDefault();
    this.dragCounter++;
    
    if (this.dragCounter === 1) {
      this.isDragOver = true;
      this.canDrop = this.checkCanDrop(event);
      this.addHighlight();
      this.dragEntered.emit(event);
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    this.dragCounter--;
    
    if (this.dragCounter === 0) {
      this.isDragOver = false;
      this.canDrop = false;
      this.removeHighlight();
      this.dragLeft.emit(event);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    if (!this.appDropZone) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragOver = false;
    this.canDrop = false;
    this.dragCounter = 0;
    
    // Obtener datos transferidos
    const data = this.getTransferData(event);
    
    // Crear efecto visual de drop
    this.createDropEffect(event);
    
    // Emitir evento con datos
    this.itemDropped.emit({
      data: data,
      event: event,
      target: this.el.nativeElement
    });
    
    this.removeHighlight();
  }

  private checkCanDrop(event: DragEvent): boolean {
    if (this.acceptTypes.length === 0) return true;
    
    const types = event.dataTransfer?.types || [];
    return this.acceptTypes.some(type => types.includes(type));
  }

  private getTransferData(event: DragEvent): any {
    const jsonData = event.dataTransfer?.getData('text/plain');
    try {
      return jsonData ? JSON.parse(jsonData) : null;
    } catch {
      return jsonData;
    }
  }

  private addHighlight(): void {
    this.renderer.addClass(this.el.nativeElement, 'drop-zone-highlight');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.02)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 8px 25px rgba(102, 126, 234, 0.2)');
  }

  private removeHighlight(): void {
    this.renderer.removeClass(this.el.nativeElement, 'drop-zone-highlight');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
  }

  private createDropEffect(event: DragEvent): void {
    const dropEffect = this.renderer.createElement('div');
    this.renderer.addClass(dropEffect, 'drop-effect-ripple');
    
    // Posicionar en el punto de drop
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.renderer.setStyle(dropEffect, 'position', 'absolute');
    this.renderer.setStyle(dropEffect, 'left', `${x}px`);
    this.renderer.setStyle(dropEffect, 'top', `${y}px`);
    this.renderer.setStyle(dropEffect, 'width', '40px');
    this.renderer.setStyle(dropEffect, 'height', '40px');
    this.renderer.setStyle(dropEffect, 'border-radius', '50%');
    this.renderer.setStyle(dropEffect, 'background', 'rgba(102, 126, 234, 0.3)');
    this.renderer.setStyle(dropEffect, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(dropEffect, 'pointer-events', 'none');
    this.renderer.setStyle(dropEffect, 'z-index', '1000');
    
    this.renderer.appendChild(this.el.nativeElement, dropEffect);
    
    // Animar y remover
    setTimeout(() => {
      this.renderer.setStyle(dropEffect, 'width', '200px');
      this.renderer.setStyle(dropEffect, 'height', '200px');
      this.renderer.setStyle(dropEffect, 'opacity', '0');
      this.renderer.setStyle(dropEffect, 'transition', 'all 0.6s ease-out');
    }, 10);
    
    setTimeout(() => {
      this.renderer.removeChild(this.el.nativeElement, dropEffect);
    }, 600);
  }
}
