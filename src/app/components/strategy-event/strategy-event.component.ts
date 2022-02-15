import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { KeyVal } from 'app/interfaces/misc/keyval';
import { StrategyEvent } from 'app/interfaces/v2/strategy-event';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';

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
                this.tp1 = data.taxpayers[0];
                this.tp2 = data.taxpayers[1];
                this.event = data.strategy.events[this.eventIdx];
                this.selectedTp = data.taxpayers[this.event.taxpayerIdx];
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
