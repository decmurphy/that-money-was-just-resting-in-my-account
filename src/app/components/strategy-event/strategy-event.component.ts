import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TrackByFunction,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { StrategyEvent } from 'app/interfaces/v2/strategy/strategy-event';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { StrategyEventOperation } from 'app/interfaces/v2/strategy/strategy-event-operation';
import { StrategyEventType } from 'app/interfaces/v2/strategy/strategy-event-type';

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

    selectedQuantity: TypeAndOps;
    availableOperations: StrategyEventOperation[];
    taxpayers: TaxPayer[];

    eventQuantities: TypeAndOps[];

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.taxpayers = data.taxpayers;
                this.event = data.strategy.events[this.eventIdx];
                this.resetForm();
            });

        this.eventQuantities = [
            {
                type: StrategyEventType.EMPLOYMENT_INCOME,
                operations: [StrategyEventOperation.CHANGE],
            },
            {
                type: StrategyEventType.ANCILLARY_INCOME,
                operations: [
                    StrategyEventOperation.CHANGE,
                    StrategyEventOperation.ADD,
                    StrategyEventOperation.REMOVE,
                ],
            },
            {
                type: StrategyEventType.OTHER_INCOME,
                operations: [
                    StrategyEventOperation.CHANGE,
                    StrategyEventOperation.ADD,
                    StrategyEventOperation.REMOVE,
                ],
            },
            {
                type: StrategyEventType.PENSION_EMPLOYER_CONTRIB,
                operations: [StrategyEventOperation.CHANGE],
            },
            {
                type: StrategyEventType.PENSION_PERSONAL_CONTRIB,
                operations: [StrategyEventOperation.CHANGE],
            },
            {
                type: StrategyEventType.MORTGAGE_APRC,
                operations: [StrategyEventOperation.CHANGE],
            },
            {
                type: StrategyEventType.MORTGAGE_REPAYMENT,
                operations: [StrategyEventOperation.CHANGE],
            },
        ];
    }

    selectQuantity(quantity: TypeAndOps): void {
        this.selectedQuantity = quantity;
        this.availableOperations = quantity.operations;
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

    trackTaxpayer: TrackByFunction<TaxPayer> = (
        index: number,
        item: TaxPayer
    ) => item.id;

    trackOperation: TrackByFunction<StrategyEventOperation> = (
        index: number,
        item: StrategyEventOperation
    ) => index;

    trackQuantity: TrackByFunction<TypeAndOps> = (
        index: number,
        item: TypeAndOps
    ) => item.type;
}

export interface TypeAndOps {
    type: StrategyEventType;
    operations: StrategyEventOperation[];
}
