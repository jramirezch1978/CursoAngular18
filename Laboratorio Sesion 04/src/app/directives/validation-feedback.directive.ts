import { 
  Directive, 
  ElementRef, 
  HostBinding, 
  HostListener,
  Input,
  Renderer2,
  OnInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appValidationFeedback]',
  standalone: true
})
export class ValidationFeedbackDirective implements OnInit, OnDestroy {
  @Input() appValidationFeedback: 'valid' | 'invalid' | 'pending' | 'none' = 'none';
  @Input() validationMessage = '';
  @Input() showOnBlur = true;
  @Input() showOnDirty = false;
  
  private messageElement?: HTMLDivElement;
  private isDirty = false;
  private isTouched = false;
  
  @HostBinding('class.validation-valid')
  get isValid(): boolean {
    return this.shouldShowValidation() && this.appValidationFeedback === 'valid';
  }
  
  @HostBinding('class.validation-invalid')
  get isInvalid(): boolean {
    return this.shouldShowValidation() && this.appValidationFeedback === 'invalid';
  }
  
  @HostBinding('class.validation-pending')
  get isPending(): boolean {
    return this.shouldShowValidation() && this.appValidationFeedback === 'pending';
  }
  
  @HostBinding('class.validation-shake')
  private shake = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupValidationStyles();
  }

  ngOnDestroy(): void {
    this.removeMessage();
  }

  @HostListener('blur')
  onBlur(): void {
    this.isTouched = true;
    this.updateValidationDisplay();
  }

  @HostListener('input')
  onInput(): void {
    this.isDirty = true;
    this.updateValidationDisplay();
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.appValidationFeedback === 'invalid') {
      this.showMessage();
    }
  }

  private shouldShowValidation(): boolean {
    if (this.showOnDirty && this.isDirty) return true;
    if (this.showOnBlur && this.isTouched) return true;
    return false;
  }

  private updateValidationDisplay(): void {
    if (this.shouldShowValidation()) {
      if (this.appValidationFeedback === 'invalid' && this.validationMessage) {
        this.showMessage();
        this.triggerShake();
      } else {
        this.removeMessage();
      }
    }
  }

  private setupValidationStyles(): void {
    const parent = this.el.nativeElement.parentElement;
    if (parent) {
      this.renderer.setStyle(parent, 'position', 'relative');
    }
  }

  private showMessage(): void {
    if (this.messageElement) return;

    this.messageElement = this.renderer.createElement('div');
    this.renderer.addClass(this.messageElement, 'validation-message');
    this.renderer.addClass(this.messageElement, 'validation-message-error');
    
    const text = this.renderer.createText(this.validationMessage);
    this.renderer.appendChild(this.messageElement, text);
    
    const parent = this.el.nativeElement.parentElement;
    if (parent) {
      this.renderer.appendChild(parent, this.messageElement);
    }

    setTimeout(() => {
      if (this.messageElement) {
        this.renderer.addClass(this.messageElement, 'validation-message-visible');
      }
    }, 10);
  }

  private removeMessage(): void {
    if (!this.messageElement) return;

    this.renderer.removeClass(this.messageElement, 'validation-message-visible');
    
    setTimeout(() => {
      if (this.messageElement && this.messageElement.parentElement) {
        this.renderer.removeChild(
          this.messageElement.parentElement,
          this.messageElement
        );
        this.messageElement = undefined;
      }
    }, 300);
  }

  private triggerShake(): void {
    this.shake = true;
    setTimeout(() => {
      this.shake = false;
    }, 500);
  }
}
