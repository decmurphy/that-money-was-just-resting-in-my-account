import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/subscription-handler';
import { TaxPayer } from 'app/interfaces/tax-payer';
import { DataService } from 'app/services/data.service';
import { StrategyEvent } from 'app/interfaces/strategy-event';
import { KeyVal } from 'app/interfaces/keyval';

@Component({
    selector: 'fc-strategy-event',
    templateUrl: './strategy-event.component.html',
    styleUrls: ['./strategy-event.component.css'],
})
export class StrategyEventComponent
    extends SubscriptionHandler
    implements OnInit
{
    @Input() eventIdx: number;
    @Output() onDelete: EventEmitter<number> = new EventEmitter();
    editing = false;
    event: StrategyEvent;
    form: FormGroup;

    tp1: TaxPayer;
    tp2: TaxPayer;
    selectedTp: TaxPayer;

    eventQuantities: KeyVal[];
    eventOperations: KeyVal[];

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.tp1 = data.tp1;
                this.tp2 = data.tp2;
                this.event = data.strategy.events[this.eventIdx];
                this.selectedTp =
                    this.event.taxpayer === '0' ? this.tp1 : this.tp2;
                this.resetForm();
            });

        this.eventQuantities = [
            new KeyVal('pensionPercentage', 'Pension %'),
            new KeyVal('grossIncome', 'Gross Income'),
            new KeyVal('monthlyExpenditure', 'Monthly Exp.'),
            new KeyVal('yearlyExpenditure', 'Yearly Exp.'),
            new KeyVal('mortgageAPRC', 'APRC'),
            new KeyVal('mortgageRepayment', 'Repayments'),
        ];

        this.eventOperations = [
            new KeyVal('to', 'New Amount'),
            new KeyVal('add', 'Add Amount'),
            new KeyVal('subtract', 'Subtract Amount'),
        ];
    }

    resetForm(): void {
        this.event = StrategyEvent.create(this.event);
        this.form = this.event.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();
    }

    delete(): void {
        this.onDelete.emit(this.eventIdx);
    }

    saveEvent(): void {
        this.dataService.setEvent(this.eventIdx, this.form.getRawValue());
        this.editing = false;
    }
}
