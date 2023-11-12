import { Component, OnInit, TrackByFunction } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { Strategy } from 'app/interfaces/v3/strategy';
import { Event } from 'app/interfaces/v3/events/events';

@Component({
    selector: 'fc-strategy',
    templateUrl: './strategy.component.html',
    styleUrls: ['./strategy.component.css'],
})
export class StrategyComponent extends SubscriptionHandler implements OnInit {
    form: FormGroup;
    formValueChangesSub: Subscription;
    data: Strategy;
    showInfo = false;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data.strategy;
                this.resetForm();
            });
    }

    resetForm(): void {
        this.data = Strategy.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        console.log(this.data);

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setStrategy(fv))
            )
            .subscribe((fv) => { });
    }

    addEvent() {
        this.dataService.addEvent();
    }

    deleteEvent(id: string): void {
        this.dataService.deleteEvent(id);
    }

    toggleInfo() {
        this.showInfo = !this.showInfo;
    }

    trackEvent: TrackByFunction<Event> = (
        index: number,
        item: Event
    ) => item.id;
}
