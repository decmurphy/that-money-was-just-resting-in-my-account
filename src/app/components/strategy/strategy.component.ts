import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { StrategyEvent } from 'app/interfaces/v1/strategy-event';
import { Strategy } from 'app/interfaces/v1/strategy';

@Component({
    selector: 'fc-strategy',
    templateUrl: './strategy.component.html',
    styleUrls: ['./strategy.component.css'],
})
export class StrategyComponent extends SubscriptionHandler implements OnInit {
    form: FormGroup;
    formValueChangesSub: Subscription;
    data: Strategy;

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

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setStrategy(fv))
            )
            .subscribe((fv) => {});
    }

    addEvent() {
        this.dataService.addEvent();
    }

    deleteEvent(i: number): void {
        this.dataService.deleteEvent(i);
    }

    drop(location: CdkDragDrop<StrategyEvent[]>): void {
        if (location.previousIndex !== location.currentIndex) {
            moveItemInArray(
                this.data.events,
                location.previousIndex,
                location.currentIndex
            );
            this.dataService.setStrategy(this.data);
        }
    }
}
