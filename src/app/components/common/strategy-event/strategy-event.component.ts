import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TrackByFunction,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { StrategyEvent } from 'app/interfaces/v2/strategy/strategy-event';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { StrategyEventOperation } from 'app/interfaces/v2/strategy/strategy-event-operation';
import { StrategyEventType } from 'app/interfaces/v2/strategy/strategy-event-type';
import { NamedAmount } from 'app/interfaces/v2/named-amount';
import { FormData } from 'app/interfaces/v2/form-data';

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
    data: FormData;
    taxpayers: TaxPayer[];
    event: StrategyEvent;
    form: FormGroup;
    formValueChangesSub: Subscription;

    SEO = StrategyEventOperation;

    selectedType: StrategyEventType;
    selectedOperation: StrategyEventOperation;
    modifiableNamedAmounts: NamedAmount[];

    operations: StrategyEventOperation[];
    eventTypes: StrategyEventType[];
    valueTypes: StrategyEventType[];
    namedAmountTypes: StrategyEventType[];

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data;
                this.taxpayers = data.taxpayers;
                this.event = data.strategy.events[this.eventIdx];
                // console.log(this.event);
                if (this.event) {
                    this.selectType(this.event.type);
                    this.selectOperation(this.event.operation);
                    this.resetForm();
                }
            });

        this.operations = [
            StrategyEventOperation.ADD,
            StrategyEventOperation.CHANGE,
            StrategyEventOperation.REMOVE,
        ];

        this.eventTypes = [
            StrategyEventType.EMPLOYMENT_INCOME,
            StrategyEventType.MONTHLY_EXPENDITURE,
            StrategyEventType.YEARLY_EXPENDITURE,
            StrategyEventType.ONCE_OFF_EXPENDITURE,
            StrategyEventType.MORTGAGE_APRC,
            StrategyEventType.MORTGAGE_REPAYMENT,
            StrategyEventType.MORTGAGE_LUMP_SUM,
        ];

        this.valueTypes = [
            StrategyEventType.EMPLOYMENT_INCOME,
            StrategyEventType.ONCE_OFF_EXPENDITURE,
            StrategyEventType.MORTGAGE_APRC,
            StrategyEventType.MORTGAGE_REPAYMENT,
            StrategyEventType.MORTGAGE_LUMP_SUM,
        ];

        this.namedAmountTypes = [
            StrategyEventType.MONTHLY_EXPENDITURE,
            StrategyEventType.YEARLY_EXPENDITURE,
        ];
    }

    selectOperation(op: StrategyEventOperation): void {
        this.selectedOperation = op;
    }

    selectType(type: StrategyEventType): void {
        this.selectedType = type;
        switch (this.selectedType) {
            case StrategyEventType.MONTHLY_EXPENDITURE:
                this.modifiableNamedAmounts =
                    this.data.expenditures.monthlyItems;
                break;
            case StrategyEventType.YEARLY_EXPENDITURE:
                this.modifiableNamedAmounts =
                    this.data.expenditures.yearlyItems;
                break;
            default:
                this.modifiableNamedAmounts = [];
                break;
        }
        // console.log(this.modifiableNamedAmounts);
    }

    selectModifiableNamedAmount(na: NamedAmount): void {
        this.form.patchValue({ namedAmount: na });
    }

    resetForm(): void {
        this.event = StrategyEvent.create(this.event);
        this.form = this.event.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setEvent(this.eventIdx, fv))
            )
            .subscribe((fv) => {
                console.log(this.form);
                console.log(fv);
            });
    }

    delete(): void {
        this.onDelete.emit(this.eventIdx);
    }

    saveEvent(): void {
        this.dataService.setEvent(this.eventIdx, this.form.getRawValue());
        this.editing = false;
    }

    get namedAmount(): FormGroup {
        return this.form.get('namedAmount') as FormGroup;
    }

    trackTaxpayer: TrackByFunction<TaxPayer> = (
        index: number,
        item: TaxPayer
    ) => item.id;

    trackOperation: TrackByFunction<StrategyEventOperation> = (
        index: number,
        item: StrategyEventOperation
    ) => index;

    trackType: TrackByFunction<StrategyEventType> = (
        index: number,
        item: StrategyEventType
    ) => index;

    trackNamedAmount: TrackByFunction<NamedAmount> = (
        index: number,
        item: NamedAmount
    ) => item.id;
}

export interface TypeAndOps {
    type: StrategyEventType;
    operations: StrategyEventOperation[];
}
