import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxpayerComponent } from './taxpayer.component';

describe('TaxpayerComponent', () => {
  let component: TaxpayerComponent;
  let fixture: ComponentFixture<TaxpayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxpayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxpayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
