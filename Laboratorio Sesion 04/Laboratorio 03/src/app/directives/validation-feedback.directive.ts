import { Directive, Input, HostBinding, ElementRef } from '@angular/core';

@Directive({
  selector: '[appValidationFeedback]',
  standalone: true
})
export class ValidationFeedbackDirective {
  @Input() appValidationFeedback: 'valid' | 'invalid' | 'pending' | 'neutral' = 'neutral';

  constructor(private el: ElementRef) { }

  @HostBinding('class')
  get validationClasses(): string {
    const baseClasses = 'validation-feedback transition-all duration-300';
    const statusClasses = {
      valid: 'border-green-500 bg-green-50',
      invalid: 'border-red-500 bg-red-50 shake',
      pending: 'border-yellow-500 bg-yellow-50',
      neutral: 'border-gray-300 bg-white'
    };
    
    return `${baseClasses} ${statusClasses[this.appValidationFeedback] || statusClasses.neutral}`;
  }

  @HostBinding('style.border-width') 
  get borderWidth(): string {
    return this.appValidationFeedback !== 'neutral' ? '2px' : '1px';
  }
}
