import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamedAmountComponent } from './named-amount.component';

describe('NamedAmountComponent', () => {
  let component: NamedAmountComponent;
  let fixture: ComponentFixture<NamedAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NamedAmountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NamedAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
