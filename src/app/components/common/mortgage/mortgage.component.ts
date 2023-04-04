import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable, Subscription, map, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { Mortgage } from 'app/interfaces/v2/mortgage';

@Component({
    selector: 'fc-mortgage',
    templateUrl: './mortgage.component.html',
    styleUrls: ['./mortgage.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MortgageComponent extends SubscriptionHandler implements OnInit, OnChanges, AfterViewInit {

    @Input() mortgage: Mortgage;
    @Input() alwaysShow: boolean = true;
    @Input() showStartMonth: boolean = false;

    @Output() onDataChange: EventEmitter<Mortgage> = new EventEmitter();

    form: FormGroup;
    formValueChangesSub: Subscription;

    editing = false;
    monthlyRepayments: number;
    totalCumulativeInterest: number = 0;

    math = Math;
    xl$: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private breakpointObserver: BreakpointObserver,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        this.xl$ = this.breakpointObserver
            .observe(['(min-width: 1280px)']) // screen:lg
            .pipe(map((state: BreakpointState) => state.matches));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['mortgage'] && changes['mortgage'].previousValue != changes['mortgage'].currentValue) {
            this.mortgage = Mortgage.create(changes['mortgage'].currentValue);
            this.resetForm();
        }
    }

    ngAfterViewInit(): void {
        if (this.alwaysShow) {
            this.editing = true;
            this.cd.detectChanges();
        }
        this.resetForm();
        this.onDataChange.emit(this.mortgage);
    }

    resetForm() {
        this.mortgage = Mortgage.create(this.mortgage);

        this.monthlyRepayments = this.mortgage.findRepaymentForTerm();
        this.totalCumulativeInterest = this.mortgage.getTotalInterest();

        this.form = this.mortgage.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => {
                    this.onDataChange.emit(fv);
                })
            )
            .subscribe((fv) => { });
    }

}
