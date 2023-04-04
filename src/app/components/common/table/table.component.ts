import { Component, Input, OnInit, TrackByFunction } from '@angular/core';

import { MonthData } from 'app/interfaces/v2/month-data';
import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';

@Component({
    selector: 'fc-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css'],
})
export class TableComponent extends SubscriptionHandler implements OnInit {
    math = Math;

    @Input() tableData: MonthData[];
    displayedColumns: string[];

    constructor() {
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
    }

    trackMonth: TrackByFunction<MonthData> = (index: number, item: MonthData) =>
        index;

    trackCol: TrackByFunction<string> = (index: number, item: string) => index;
}
