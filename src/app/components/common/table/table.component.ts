import { Component, OnInit, TrackByFunction } from '@angular/core';
import { takeUntil } from 'rxjs';

import { MonthData } from 'app/interfaces/v2/month-data';
import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';

@Component({
    selector: 'fc-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css'],
})
export class TableComponent extends SubscriptionHandler implements OnInit {
    math = Math;

    tableData: MonthData[];
    displayedColumns: string[];

    constructor(private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.displayedColumns = [
            'year',
            'month',
            'payment',
            'incrementalInterest',
            'cumulativeInterest',
            'remaining',
        ];

        this.dataService
            .getMonthData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.tableData = data.filter((mm) => mm.remaining > 0);
            });
    }

    trackMonth: TrackByFunction<MonthData> = (index: number, item: MonthData) =>
        index;

    trackCol: TrackByFunction<string> = (index: number, item: string) => index;
}
