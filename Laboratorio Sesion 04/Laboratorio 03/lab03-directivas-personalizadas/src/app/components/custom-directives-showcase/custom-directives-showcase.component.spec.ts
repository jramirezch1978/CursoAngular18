import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDirectivesShowcaseComponent } from './custom-directives-showcase.component';

describe('CustomDirectivesShowcaseComponent', () => {
  let component: CustomDirectivesShowcaseComponent;
  let fixture: ComponentFixture<CustomDirectivesShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDirectivesShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDirectivesShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
