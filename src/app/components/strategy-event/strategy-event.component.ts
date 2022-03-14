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
    formValueChangesSub: Subscription;

    selectedType: StrategyEventType;
    operations: StrategyEventOperation[];
    taxpayers: TaxPayer[];

    eventTypes: StrategyEventType[];

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
                this.selectedType = this.event.type;
                this.resetForm();
            });

        this.operations = [
            StrategyEventOperation.ADD,
            StrategyEventOperation.CHANGE,
            StrategyEventOperation.REMOVE,
        ];

        this.eventTypes = [
            StrategyEventType.MORTGAGE_APRC,
            StrategyEventType.MORTGAGE_REPAYMENT,
        ];
    }

    selectType(type: StrategyEventType): void {
        this.selectedType = type;
    }

    resetForm(): void {
        this.event = StrategyEvent.create(this.event);
        this.form = this.event.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        console.log(this.form);

        //     console.log('reset form');

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
}

export interface TypeAndOps {
    type: StrategyEventType;
    operations: StrategyEventOperation[];
}
