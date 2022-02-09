import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable, Subscription, map, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/subscription-handler';
import { TaxPayer } from 'app/interfaces/tax-payer';
import { DataService } from 'app/services/data.service';

@Component({
    selector: 'fc-taxpayer',
    templateUrl: './taxpayer.component.html',
    styleUrls: ['./taxpayer.component.css'],
})
export class TaxpayerComponent extends SubscriptionHandler implements OnInit {
    @Input() taxpayerIndex: number;
    @Output() onDelete: EventEmitter<number> = new EventEmitter();
    editing = false;
    form: FormGroup;
    formValueChangesSub: Subscription;
    data: TaxPayer;

    tpk: string;
    otherTaxpayerExists: boolean;
    lg$: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private breakpointObserver: BreakpointObserver,
        private dataService: DataService
    ) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.tpk = this.taxpayerIndex === 0 ? 'tp1' : 'tp2';
                const otherKey = this.taxpayerIndex === 0 ? 'tp2' : 'tp1';
                this.data = data[this.tpk];
                this.otherTaxpayerExists = data[otherKey] != null;
                this.resetForm();
            });

        this.lg$ = this.breakpointObserver
            .observe(['(min-width: 1024px)']) // screen:lg
            .pipe(map((state: BreakpointState) => state.matches));
    }

    resetForm(): void {
        this.data = TaxPayer.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setTaxpayer(this.tpk, fv))
            )
            .subscribe((fv) => {});
    }

    delete() {
        this.onDelete.emit(this.taxpayerIndex);
    }

    get income(): FormGroup {
        return this.form.get('income') as FormGroup;
    }

    get pension(): FormGroup {
        return this.form.get('pension') as FormGroup;
    }
}
