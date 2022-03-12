import { Component, OnInit, TrackByFunction } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { Expenditures } from 'app/interfaces/v2/expenditures';
import { NamedAmount } from 'app/interfaces/v2/named-amount';

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
    showInfo = false;

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

    addMonthlyItem() {
        this.data.monthlyItems.push(new NamedAmount());
        this.dataService.setExpenditures(this.data);
    }

    addYearlyItem() {
        this.data.yearlyItems.push(new NamedAmount());
        this.dataService.setExpenditures(this.data);
    }

    removeMonthlyItem(item: NamedAmount): void {
        const idx = this.data.monthlyItems.indexOf(item);
        if (idx > -1) {
            this.data.monthlyItems.splice(idx, 1);
        }
        this.dataService.setExpenditures(this.data);
    }

    removeYearlyItem(item: NamedAmount): void {
        const idx = this.data.yearlyItems.indexOf(item);
        if (idx > -1) {
            this.data.yearlyItems.splice(idx, 1);
        }
        this.dataService.setExpenditures(this.data);
    }

    toggleInfo() {
        this.showInfo = !this.showInfo;
    }

    get monthlyItems(): FormArray {
        return this.form.get('monthlyItems') as FormArray;
    }

    get yearlyItems(): FormArray {
        return this.form.get('yearlyItems') as FormArray;
    }

    trackNamedAmount: TrackByFunction<NamedAmount> = (
        index: number,
        item: NamedAmount
    ) => item.id;
}
