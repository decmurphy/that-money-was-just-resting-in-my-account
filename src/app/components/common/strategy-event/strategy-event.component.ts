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
import { Household } from 'app/interfaces/v3/household';
import { Income, TaxPayer } from 'app/interfaces/v3/people/people';
import { NamedAmount } from 'app/interfaces/v3/named-amount';
import { Event, StrategyEventType } from 'app/interfaces/v3/events/events';

@Component({
    selector: 'fc-strategy-event',
    templateUrl: './strategy-event.component.html',
    styleUrls: ['./strategy-event.component.css'],
})
export class StrategyEventComponent extends SubscriptionHandler implements OnInit {

    @Input() eventId: string;
    @Output() onDelete: EventEmitter<string> = new EventEmitter();

    editing = false;
    data: Household;
    taxpayers: TaxPayer[];
    allExpenditures: NamedAmount[];
    allIncomes: Income[];
    event: Event;
    form: FormGroup;
    formValueChangesSub: Subscription;

    ALL_TYPES = StrategyEventType;
    selectedType: StrategyEventType;
    eventTypes: StrategyEventType[];

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
                this.event = data.strategy.events.find(ev => ev.id == this.eventId);
                if (this.event) {
                    this.selectedType = this.event.type;
                    this.resetForm();
                }

                this.data.expenditures.addedItems = this.data.strategy.events.filter(ev => {
                    return ev.type == StrategyEventType.MONTHLY_EXPENDITURE || ev.type == StrategyEventType.YEARLY_EXPENDITURE;
                }).map(ev => (ev as any).expenditure);

                this.allExpenditures = [
                    ...this.data.expenditures.monthlyItems,
                    ...this.data.expenditures.yearlyItems,
                    ...this.data.expenditures.addedItems,
                    ...this.data.expenditures.onceOffItems
                ];
                this.allIncomes = data.taxpayers.map(tp => tp.getAllIncomes()).flat();

            });

        this.eventTypes = [
            StrategyEventType.EMPLOYMENT_INCOME,
            StrategyEventType.MONTHLY_EXPENDITURE,
            StrategyEventType.YEARLY_EXPENDITURE,
            StrategyEventType.ONCE_OFF_EXPENDITURE,
            StrategyEventType.REMOVE_EXPENDITURE,
            StrategyEventType.CHANGE_EXPENDITURE,
            StrategyEventType.MORTGAGE_APRC,
            StrategyEventType.MORTGAGE_REPAYMENT,
            StrategyEventType.MORTGAGE_LUMP_SUM,
        ];

    }

    selectModifiableNamedAmount(na: NamedAmount): void {
        this.form.patchValue({ namedAmount: na });
    }

    resetForm(): void {
        this.event = Event.create(this.event);
        this.form = this.event.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => {
                    this.dataService.setEvent(this.eventId, fv);
                })
            )
            .subscribe((fv) => {
            });
    }

    delete(): void {
        this.onDelete.emit(this.eventId);
    }

    get expenditure(): FormGroup {
        return this.form.get('expenditure') as FormGroup;
    }

    get salary(): FormGroup {
        return this.form.get('salary') as FormGroup;
    }

    trackTaxpayer: TrackByFunction<TaxPayer> = (
        index: number,
        item: TaxPayer
    ) => item.id;

    trackType: TrackByFunction<StrategyEventType> = (
        index: number,
        item: StrategyEventType
    ) => item;

    trackNamedAmount: TrackByFunction<NamedAmount> = (
        index: number,
        item: NamedAmount
    ) => item.id;

    trackIncome: TrackByFunction<Income> = (
        index: number,
        item: Income
    ) => item.id;
}