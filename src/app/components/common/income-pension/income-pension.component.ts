import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { MaritalStatus } from 'app/interfaces/v2/marital-status';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';

@Component({
    selector: 'fc-income-pension',
    templateUrl: './income-pension.component.html',
    styleUrls: ['./income-pension.component.css'],
})
export class IncomePensionComponent
    extends SubscriptionHandler
    implements OnInit
{
    form: FormGroup;
    formValueChangesSub: Subscription;
    taxpayers: TaxPayer[];
    data: MaritalStatus;
    showInfo = false;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data.maritalStatus;
                this.taxpayers = data.taxpayers;
                this.resetForm();
            });
    }

    resetForm(): void {
        this.data = MaritalStatus.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setMaritalStatus(fv))
            )
            .subscribe((fv) => {});
    }

    addTaxpayer() {
        this.dataService.addTaxpayer();
    }

    removeTaxpayer(idx: number): void {
        this.dataService.removeTaxpayer(idx);
    }

    toggleInfo() {
        this.showInfo = !this.showInfo;
    }
}
