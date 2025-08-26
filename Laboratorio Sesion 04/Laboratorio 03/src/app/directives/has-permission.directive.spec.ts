import { TemplateRef, ViewContainerRef } from '@angular/core';
import { HasPermissionDirective } from './has-permission.directive';

describe('HasPermissionDirective', () => {
  it('should create an instance', () => {
    const mockTemplateRef = {} as TemplateRef<any>;
    const mockViewContainer = {} as ViewContainerRef;
    const directive = new HasPermissionDirective(mockTemplateRef, mockViewContainer);
    expect(directive).toBeTruthy();
  });
});
