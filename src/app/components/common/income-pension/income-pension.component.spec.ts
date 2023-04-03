import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomePensionComponent } from './income-pension.component';

describe('IncomePensionComponent', () => {
  let component: IncomePensionComponent;
  let fixture: ComponentFixture<IncomePensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomePensionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomePensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
