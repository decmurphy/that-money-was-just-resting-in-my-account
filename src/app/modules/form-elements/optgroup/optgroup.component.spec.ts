import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptgroupComponent } from './optgroup.component';

describe('OptgroupComponent', () => {
    let component: OptgroupComponent;
    let fixture: ComponentFixture<OptgroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OptgroupComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OptgroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
