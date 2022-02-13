import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { MaritalStatus } from 'app/interfaces/v1/marital-status';

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
    data: MaritalStatus;
    tp2Exists: boolean;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data.maritalStatus;
                this.tp2Exists = data.tp2 != null;
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

    removeTaxpayer(i: number): void {
        this.dataService.removeTaxpayer(i == 0 ? 'tp1' : 'tp2');
    }
}
