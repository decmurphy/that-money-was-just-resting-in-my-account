import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { Expenditures } from 'app/interfaces/v1/expenditures';
import { NamedAmount } from 'app/interfaces/v1/named-amount';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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

    addMonthlyItem() {
        this.data.monthlyItems.push(new NamedAmount());
        this.dataService.setExpenditures(this.data);
    }

    addYearlyItem() {
        this.data.monthlyItems.push(new NamedAmount());
        this.dataService.setExpenditures(this.data);
    }

    deleteMonthlyItem(i: number): void {
        this.data.monthlyItems.splice(i, 1);
        this.dataService.setExpenditures(this.data);
    }

    deleteYearlyItem(i: number): void {
        this.data.yearlyItems.splice(i, 1);
        this.dataService.setExpenditures(this.data);
    }

    dropMonthlyItem(location: CdkDragDrop<NamedAmount[]>): void {
        if (location.previousIndex !== location.currentIndex) {
            moveItemInArray(
                this.data.monthlyItems,
                location.previousIndex,
                location.currentIndex
            );
            this.dataService.setExpenditures(this.data);
        }
    }

    dropYearlyItem(location: CdkDragDrop<NamedAmount[]>): void {
        if (location.previousIndex !== location.currentIndex) {
            moveItemInArray(
                this.data.yearlyItems,
                location.previousIndex,
                location.currentIndex
            );
            this.dataService.setExpenditures(this.data);
        }
    }
}
