import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { takeUntil } from 'rxjs';

import { MonthData } from 'app/interfaces/month-data';
import { SubscriptionHandler } from 'app/interfaces/subscription-handler';
import { DataService } from 'app/services/data.service';

@Component({
    selector: 'fc-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css'],
})
export class TableComponent
    extends SubscriptionHandler
    implements OnInit, AfterViewInit
{
    math = Math;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    dataSource: MatTableDataSource<MonthData>;
    displayedColumns: string[];

    constructor(private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataSource = new MatTableDataSource<MonthData>([]);

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
                this.dataSource.data = data.filter((mm) => mm.remaining > 0);
            });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }
}
