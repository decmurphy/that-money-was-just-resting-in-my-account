import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, map, takeUntil } from 'rxjs';

import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { DataService } from 'app/services/data.service';
import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { Snapshot } from 'app/interfaces/v3/snapshot';
import { Mortgage } from 'app/interfaces/v3/mortgage';

@Component({
  selector: 'fc-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannerComponent extends SubscriptionHandler implements OnInit {

  mortgage$: Observable<Mortgage>;

  tableData$: Observable<Snapshot[]>;
  plotData$: Observable<GenericPlotData[]>;
  netWorthData$: Observable<GenericPlotData[]>;

  constructor(private dataService: DataService) {
    super();
  }

  ngOnInit(): void {

    this.mortgage$ = this.dataService.getData().pipe(map(data => data.mortgage));

    this.netWorthData$ = this.dataService.getNetWorthData();

    this.tableData$ = this.dataService.getSnapshot()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(data => data.filter((mm) => mm.payment > 0))
      );

    this.plotData$ = this.dataService.getSnapshot()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(data => {
          return [
            {
              mode: 'lines', name: 'Mortgage',
              x: data.map((mm) => new Date(mm.timestamp).getFractionalYear()), y: data.map((mm) => mm.principal)
            },
            {
              mode: 'lines', name: 'Incr. Interest',
              x: data.map((mm) => new Date(mm.timestamp).getFractionalYear()), y: data.map((mm) => mm.interestDelta)
            },
            {
              mode: 'lines', name: 'Cum. Interest',
              x: data.map((mm) => new Date(mm.timestamp).getFractionalYear()), y: data.map((mm) => mm.interestPaid)
            },
            {
              mode: 'lines', name: 'Payment',
              x: data.map((mm) => new Date(mm.timestamp).getFractionalYear()), y: data.map((mm) => mm.payment)
            },
          ] as GenericPlotData[];
        })
      );
  }

  onMortgageDataChange(mortgage: Mortgage): void {
    mortgage = Mortgage.create(mortgage);

    var snapshotDate = new Date(mortgage.startDate.getTime()).toStartOfMonth();
    const endDate = mortgage.startDate.plusYears(35).toStartOfMonth();
    while (+snapshotDate < +endDate) {
      mortgage.evaluate(snapshotDate);
      snapshotDate.setMonth(snapshotDate.getMonth() + 1);
    }

    this.dataService.setMortgage(mortgage);
  }

}
