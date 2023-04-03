import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategyEventComponent } from './strategy-event.component';

describe('StrategyEventComponent', () => {
    let component: StrategyEventComponent;
    let fixture: ComponentFixture<StrategyEventComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StrategyEventComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StrategyEventComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
