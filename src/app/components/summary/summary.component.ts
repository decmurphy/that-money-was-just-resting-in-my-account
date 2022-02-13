import { Component, OnInit } from '@angular/core';

import { takeUntil } from 'rxjs';

import { MonthData } from 'app/interfaces/v1/month-data';
import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { FormData } from 'app/interfaces/v1/form-data';

@Component({
    selector: 'fc-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css'],
})
export class SummaryComponent extends SubscriptionHandler implements OnInit {
    math = Math;

    data: FormData;
    monthData: MonthData[];
    mortgageTerm: number;

    constructor(private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getMonthData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.monthData = data;

                this.mortgageTerm = this.monthData.filter(
                    (mm) => mm.remaining > 0
                ).length;
            });

        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.data = data;
            });
    }
}
