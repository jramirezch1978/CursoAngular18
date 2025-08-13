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
import { DragData } from './draggable.directive';

export interface DropEvent {
  dragData: DragData;
  dropZone: string;
  originalEvent: Event;
  element: HTMLElement;
  position?: { x: number; y: number };
}

export interface DropValidation {
  allowedTypes: string[];
  allowedIds?: string[];
  maxItems?: number;
  validator?: (data: DragData) => boolean;
}

@Directive({
  selector: '[appDropZone]',
  standalone: true
})
export class DropZoneDirective implements OnInit, OnDestroy {
  @Input('appDropZone') dropZoneId: string = '';
  @Input() dropValidation: DropValidation = { allowedTypes: [] };
  @Input() dropDisabled: boolean = false;
  @Input() dropEffect: 'copy' | 'move' | 'link' | 'none' = 'move';
  @Input() dropIndicator: boolean = true;
  @Input() dropAnimation: boolean = true;
  @Input() dropFeedback: 'visual' | 'audio' | 'both' | 'none' = 'visual';

  @Output() dragEnter = new EventEmitter<DropEvent>();
  @Output() dragOver = new EventEmitter<DropEvent>();
  @Output() dragLeave = new EventEmitter<DropEvent>();
  @Output() drop = new EventEmitter<DropEvent>();
  @Output() dropValidationFailed = new EventEmitter<{ reason: string; data: DragData }>();

  @HostBinding('class.drop-zone') isDropZone = true;
  @HostBinding('class.drop-zone-disabled') get isDisabled() {
    return this.dropDisabled;
  }
  @HostBinding('class.drop-zone-active') isActive = false;
  @HostBinding('class.drop-zone-valid') isValidDrop = false;
  @HostBinding('class.drop-zone-invalid') isInvalidDrop = false;

  private dragCounter: number = 0;
  private dropIndicatorElement: HTMLElement | null = null;
  private originalStyles: { [key: string]: string } = {};

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupDropZone();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupDropZone(): void {
    const element = this.elementRef.nativeElement;
    
    // Configurar estilos base
    this.renderer.setStyle(element, 'position', 'relative');
    this.renderer.addClass(element, 'drop-zone-ready');
    
    // Guardar estilos originales
    this.saveOriginalStyles();
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent): void {
    if (this.dropDisabled) return;

    event.preventDefault();
    event.stopPropagation();

    this.dragCounter++;

    if (this.dragCounter === 1) {
      this.isActive = true;
      
      const dragData = this.extractDragData(event);
      const isValid = this.validateDrop(dragData);
      
      this.isValidDrop = isValid;
      this.isInvalidDrop = !isValid;

      if (this.dropIndicator) {
        this.showDropIndicator(isValid);
      }

      this.applyDragEnterStyles(isValid);

      const dropEvent: DropEvent = {
        dragData,
        dropZone: this.dropZoneId,
        originalEvent: event,
        element: this.elementRef.nativeElement
      };

      this.dragEnter.emit(dropEvent);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (this.dropDisabled) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.dropEffect;
    }

    const dragData = this.extractDragData(event);
    const dropEvent: DropEvent = {
      dragData,
      dropZone: this.dropZoneId,
      originalEvent: event,
      element: this.elementRef.nativeElement,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    };

    this.dragOver.emit(dropEvent);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    if (this.dropDisabled) return;

    event.preventDefault();
    event.stopPropagation();

    this.dragCounter--;

    if (this.dragCounter === 0) {
      this.resetDropZoneState();

      const dragData = this.extractDragData(event);
      const dropEvent: DropEvent = {
        dragData,
        dropZone: this.dropZoneId,
        originalEvent: event,
        element: this.elementRef.nativeElement
      };

      this.dragLeave.emit(dropEvent);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    if (this.dropDisabled) return;

    event.preventDefault();
    event.stopPropagation();

    this.dragCounter = 0;
    this.resetDropZoneState();

    const dragData = this.extractDragData(event);
    
    if (!this.validateDrop(dragData)) {
      this.handleValidationFailure(dragData);
      return;
    }

    // Efectos visuales de drop exitoso
    this.showDropSuccess();

    const dropEvent: DropEvent = {
      dragData,
      dropZone: this.dropZoneId,
      originalEvent: event,
      element: this.elementRef.nativeElement,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    };

    this.drop.emit(dropEvent);

    // Feedback de audio si está habilitado
    if (this.dropFeedback === 'audio' || this.dropFeedback === 'both') {
      this.playDropSound();
    }
  }

  private extractDragData(event: DragEvent): DragData {
    if (event.dataTransfer) {
      try {
        const dataString = event.dataTransfer.getData('text/plain');
        return JSON.parse(dataString) as DragData;
      } catch (e) {
        console.warn('Could not parse drag data:', e);
      }
    }
    return { id: '', type: '', data: null };
  }

  private validateDrop(dragData: DragData): boolean {
    const validation = this.dropValidation;

    // Verificar tipos permitidos
    if (validation.allowedTypes.length > 0 && !validation.allowedTypes.includes(dragData.type)) {
      return false;
    }

    // Verificar IDs permitidos
    if (validation.allowedIds && validation.allowedIds.length > 0 && !validation.allowedIds.includes(dragData.id)) {
      return false;
    }

    // Verificar máximo de elementos
    if (validation.maxItems !== undefined) {
      const currentItems = this.elementRef.nativeElement.children.length;
      if (currentItems >= validation.maxItems) {
        return false;
      }
    }

    // Validador personalizado
    if (validation.validator && !validation.validator(dragData)) {
      return false;
    }

    return true;
  }

  private handleValidationFailure(dragData: DragData): void {
    let reason = 'Invalid drop';
    
    if (this.dropValidation.allowedTypes.length > 0 && !this.dropValidation.allowedTypes.includes(dragData.type)) {
      reason = `Type '${dragData.type}' not allowed`;
    } else if (this.dropValidation.maxItems !== undefined) {
      const currentItems = this.elementRef.nativeElement.children.length;
      if (currentItems >= this.dropValidation.maxItems) {
        reason = `Maximum ${this.dropValidation.maxItems} items allowed`;
      }
    }

    this.showDropError();
    this.dropValidationFailed.emit({ reason, data: dragData });
  }

  private showDropIndicator(isValid: boolean): void {
    if (!this.dropIndicator) return;

    this.removeDropIndicator();

    const element = this.elementRef.nativeElement;
    const indicator = this.renderer.createElement('div');
    
    this.renderer.addClass(indicator, 'drop-indicator');
    this.renderer.addClass(indicator, isValid ? 'drop-indicator-valid' : 'drop-indicator-invalid');
    
    // Estilos del indicador
    this.renderer.setStyle(indicator, 'position', 'absolute');
    this.renderer.setStyle(indicator, 'top', '0');
    this.renderer.setStyle(indicator, 'left', '0');
    this.renderer.setStyle(indicator, 'right', '0');
    this.renderer.setStyle(indicator, 'bottom', '0');
    this.renderer.setStyle(indicator, 'border', isValid ? '3px dashed #28a745' : '3px dashed #dc3545');
    this.renderer.setStyle(indicator, 'border-radius', '8px');
    this.renderer.setStyle(indicator, 'background', isValid ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)');
    this.renderer.setStyle(indicator, 'pointer-events', 'none');
    this.renderer.setStyle(indicator, 'z-index', '1000');
    
    if (this.dropAnimation) {
      this.renderer.setStyle(indicator, 'animation', 'dropPulse 1.5s infinite');
    }

    // Agregar texto del indicador
    const text = this.renderer.createElement('div');
    this.renderer.setStyle(text, 'position', 'absolute');
    this.renderer.setStyle(text, 'top', '50%');
    this.renderer.setStyle(text, 'left', '50%');
    this.renderer.setStyle(text, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(text, 'color', isValid ? '#28a745' : '#dc3545');
    this.renderer.setStyle(text, 'font-weight', 'bold');
    this.renderer.setStyle(text, 'font-size', '1.2rem');
    this.renderer.setStyle(text, 'text-align', 'center');
    
    const textNode = this.renderer.createText(isValid ? '✓ Drop Here' : '✗ Invalid Drop');
    this.renderer.appendChild(text, textNode);
    this.renderer.appendChild(indicator, text);
    
    this.renderer.appendChild(element, indicator);
    this.dropIndicatorElement = indicator;
  }

  private removeDropIndicator(): void {
    if (this.dropIndicatorElement) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.dropIndicatorElement);
      this.dropIndicatorElement = null;
    }
  }

  private applyDragEnterStyles(isValid: boolean): void {
    const element = this.elementRef.nativeElement;
    
    if (this.dropAnimation) {
      this.renderer.setStyle(element, 'transition', 'all 0.3s ease');
      this.renderer.setStyle(element, 'transform', 'scale(1.02)');
    }
    
    if (isValid) {
      this.renderer.setStyle(element, 'box-shadow', '0 0 20px rgba(40, 167, 69, 0.5)');
      this.renderer.setStyle(element, 'background-color', 'rgba(40, 167, 69, 0.05)');
    } else {
      this.renderer.setStyle(element, 'box-shadow', '0 0 20px rgba(220, 53, 69, 0.5)');
      this.renderer.setStyle(element, 'background-color', 'rgba(220, 53, 69, 0.05)');
    }
  }

  private showDropSuccess(): void {
    const element = this.elementRef.nativeElement;
    
    this.renderer.addClass(element, 'drop-success');
    this.renderer.setStyle(element, 'background-color', 'rgba(40, 167, 69, 0.2)');
    this.renderer.setStyle(element, 'transform', 'scale(1.05)');
    
    setTimeout(() => {
      this.renderer.removeClass(element, 'drop-success');
      this.restoreOriginalStyles();
    }, 500);
  }

  private showDropError(): void {
    const element = this.elementRef.nativeElement;
    
    this.renderer.addClass(element, 'drop-error');
    this.renderer.setStyle(element, 'background-color', 'rgba(220, 53, 69, 0.2)');
    this.renderer.setStyle(element, 'animation', 'shake 0.5s ease-in-out');
    
    setTimeout(() => {
      this.renderer.removeClass(element, 'drop-error');
      this.renderer.removeStyle(element, 'animation');
      this.restoreOriginalStyles();
    }, 500);
  }

  private resetDropZoneState(): void {
    this.isActive = false;
    this.isValidDrop = false;
    this.isInvalidDrop = false;
    
    this.removeDropIndicator();
    this.restoreOriginalStyles();
  }

  private saveOriginalStyles(): void {
    const element = this.elementRef.nativeElement;
    const computedStyles = window.getComputedStyle(element);
    
    this.originalStyles = {
      backgroundColor: computedStyles.backgroundColor,
      boxShadow: computedStyles.boxShadow,
      transform: computedStyles.transform,
      transition: computedStyles.transition
    };
  }

  private restoreOriginalStyles(): void {
    const element = this.elementRef.nativeElement;
    
    Object.keys(this.originalStyles).forEach(property => {
      this.renderer.setStyle(element, property, this.originalStyles[property]);
    });
  }

  private playDropSound(): void {
    // Crear y reproducir sonido de drop
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  private cleanup(): void {
    this.removeDropIndicator();
    this.resetDropZoneState();
  }

  // Métodos públicos para control externo
  public setDropValidation(validation: DropValidation): void {
    this.dropValidation = validation;
  }

  public setDropDisabled(disabled: boolean): void {
    this.dropDisabled = disabled;
  }

  public getDropZoneId(): string {
    return this.dropZoneId;
  }

  public isDropZoneActive(): boolean {
    return this.isActive;
  }

  public getCurrentItemCount(): number {
    return this.elementRef.nativeElement.children.length;
  }
}