import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/subscription-handler';
import { DataService } from 'app/services/data.service';
import { Expenditures } from 'app/interfaces/expenditures';

@Component({
    selector: 'fc-expenditures',
    templateUrl: './expenditures.component.html',
    styleUrls: ['./expenditures.component.css'],
})
export class ExpendituresComponent
    extends SubscriptionHandler
    implements OnInit
{
    form: FormGroup;
    formValueChangesSub: Subscription;
    data: Expenditures;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data.expenditures;
                this.resetForm();
            });
    }

    resetForm(): void {
        this.data = Expenditures.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setExpenditures(fv))
            )
            .subscribe((fv) => {});
    }
}
