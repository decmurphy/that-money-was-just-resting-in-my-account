import { Component, Input, OnInit, TrackByFunction } from '@angular/core';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { Snapshot } from 'app/interfaces/v3/snapshot';

@Component({
    selector: 'fc-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css'],
})
export class TableComponent extends SubscriptionHandler implements OnInit {
    math = Math;

    @Input() tableData: Snapshot[];
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

    trackMonth: TrackByFunction<Snapshot> = (index: number, item: Snapshot) =>
        index;

    trackCol: TrackByFunction<string> = (index: number, item: string) => index;
}
