import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable, Subscription, map, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { Mortgage } from 'app/interfaces/v1/mortgage';

@Component({
    selector: 'fc-mortgage',
    templateUrl: './mortgage.component.html',
    styleUrls: ['./mortgage.component.css'],
})
export class MortgageComponent extends SubscriptionHandler implements OnInit {
    editing = false;
    form: FormGroup;
    formValueChangesSub: Subscription;
    data: Mortgage;

    xl$: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private dataService: DataService,
        private breakpointObserver: BreakpointObserver
    ) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data.mortgage;
                this.resetForm();
            });

        this.xl$ = this.breakpointObserver
            .observe(['(min-width: 1280px)']) // screen:lg
            .pipe(map((state: BreakpointState) => state.matches));
    }

    resetForm(): void {
        this.data = Mortgage.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setMortgage(fv))
            )
            .subscribe((fv) => {});
    }
}
