import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Renderer2,
  HostBinding,
  HostListener
} from '@angular/core';
import { NgControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface ValidationMessage {
  [key: string]: string;
}

@Directive({
  selector: '[appValidationFeedback]',
  standalone: true
})
export class ValidationFeedbackDirective implements OnInit, OnDestroy {
  @Input() validationMessages: ValidationMessage = {};
  @Input() validationPosition: 'bottom' | 'right' | 'top' | 'left' = 'bottom';
  @Input() validationShowOn: 'touched' | 'dirty' | 'invalid' | 'always' = 'touched';
  @Input() validationTheme: 'default' | 'minimal' | 'floating' = 'default';
  @Input() validationAnimation: boolean = true;

  @HostBinding('class.validation-container') hasValidationContainer = true;

  private control: AbstractControl | null = null;
  private statusChangeSubscription?: Subscription;
  private feedbackElement: HTMLElement | null = null;

  private defaultMessages: ValidationMessage = {
    required: 'Este campo es obligatorio',
    email: 'Ingrese un email válido',
    minlength: 'Mínimo {requiredLength} caracteres',
    maxlength: 'Máximo {requiredLength} caracteres',
    pattern: 'El formato no es válido'
  };

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngControl: NgControl
  ) {}

  @HostListener('blur', ['$event'])
  onBlur(): void {
    this.checkValidation();
  }

  ngOnInit(): void {
    this.setupValidation();
    this.setupControlSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.statusChangeSubscription) {
      this.statusChangeSubscription.unsubscribe();
    }
    this.removeFeedbackElement();
  }

  private setupValidation(): void {
    if (this.ngControl && this.ngControl.control) {
      this.control = this.ngControl.control;
    }
  }

  private setupControlSubscriptions(): void {
    if (!this.control) return;

    this.statusChangeSubscription = this.control.statusChanges.subscribe(() => {
      this.checkValidation();
    });
  }

  private checkValidation(): void {
    if (!this.control) return;

    const shouldShow = this.shouldShowValidation();
    
    if (shouldShow && this.control.invalid && this.control.errors) {
      this.showValidationFeedback(this.control.errors);
      this.applyErrorStyles();
    } else {
      this.hideValidationFeedback();
      this.applySuccessStyles();
    }
  }

  private shouldShowValidation(): boolean {
    if (!this.control) return false;
    return this.control.touched;
  }

  private showValidationFeedback(errors: ValidationErrors): void {
    this.removeFeedbackElement();
    
    const errorMessage = this.getErrorMessage(errors);
    if (!errorMessage) return;

    this.feedbackElement = this.createFeedbackElement(errorMessage);
    this.positionFeedbackElement();
  }

  private hideValidationFeedback(): void {
    this.removeFeedbackElement();
  }

  private getErrorMessage(errors: ValidationErrors): string {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return '';

    const firstErrorKey = errorKeys[0];
    
    if (this.validationMessages[firstErrorKey]) {
      return this.validationMessages[firstErrorKey];
    }

    if (this.defaultMessages[firstErrorKey]) {
      return this.defaultMessages[firstErrorKey];
    }

    return 'Valor no válido';
  }

  private createFeedbackElement(message: string): HTMLElement {
    const feedback = this.renderer.createElement('div');
    this.renderer.addClass(feedback, 'validation-feedback');
    
    this.renderer.setStyle(feedback, 'position', 'absolute');
    this.renderer.setStyle(feedback, 'z-index', '1000');
    this.renderer.setStyle(feedback, 'padding', '6px 10px');
    this.renderer.setStyle(feedback, 'font-size', '12px');
    this.renderer.setStyle(feedback, 'background', '#f8d7da');
    this.renderer.setStyle(feedback, 'color', '#721c24');
    this.renderer.setStyle(feedback, 'border', '1px solid #f5c6cb');
    this.renderer.setStyle(feedback, 'border-radius', '4px');
    this.renderer.setStyle(feedback, 'max-width', '250px');
    
    const textNode = this.renderer.createText(message);
    this.renderer.appendChild(feedback, textNode);
    this.renderer.appendChild(document.body, feedback);
    
    return feedback;
  }

  private positionFeedbackElement(): void {
    if (!this.feedbackElement) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const top = hostRect.bottom + scrollTop + 5;
    const left = hostRect.left + scrollLeft;

    this.renderer.setStyle(this.feedbackElement, 'top', `${top}px`);
    this.renderer.setStyle(this.feedbackElement, 'left', `${left}px`);
  }

  private applyErrorStyles(): void {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'border-color', '#dc3545');
    this.renderer.addClass(element, 'validation-error');
  }

  private applySuccessStyles(): void {
    const element = this.elementRef.nativeElement;
    this.renderer.removeClass(element, 'validation-error');
    
    if (this.control && this.control.valid && this.control.touched) {
      this.renderer.setStyle(element, 'border-color', '#28a745');
    } else {
      this.renderer.setStyle(element, 'border-color', '#ccc');
    }
  }

  private removeFeedbackElement(): void {
    if (this.feedbackElement) {
      this.renderer.removeChild(document.body, this.feedbackElement);
      this.feedbackElement = null;
    }
  }
}
