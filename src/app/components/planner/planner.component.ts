import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable, map, takeUntil } from 'rxjs';

import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { Mortgage } from 'app/interfaces/v2/mortgage';
import { DataService } from 'app/services/data.service';
import { MonthData } from 'app/interfaces/v2/month-data';
import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';

@Component({
  selector: 'fc-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlannerComponent extends SubscriptionHandler implements OnInit {

  mortgage$: Observable<Mortgage>;

  tableData$: Observable<MonthData[]>;
  plotData$: Observable<GenericPlotData[]>;
  netWorthData$: Observable<GenericPlotData[]>;

  constructor(private dataService: DataService) {
    super();
  }

  ngOnInit(): void {

    this.mortgage$ = this.dataService.getData().pipe(map(data => data.mortgage));

    this.netWorthData$ = this.dataService.getNetWorthData();

    this.tableData$ = this.dataService.getMonthData()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(data => data.filter((mm) => mm.payment > 0))
      );

    this.plotData$ = this.dataService.getMonthData()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(data => {
          return [
            {
              mode: 'lines', name: 'Mortgage',
              x: data.map((mm) => mm.month / 12.0), y: data.map((mm) => mm.remaining)
            },
            {
              mode: 'lines', name: 'Incr. Interest',
              x: data.map((mm) => mm.month / 12.0), y: data.map((mm) => mm.incrementalInterest)
            },
            {
              mode: 'lines', name: 'Cum. Interest',
              x: data.map((mm) => mm.month / 12.0), y: data.map((mm) => mm.cumulativeInterest)
            },
            {
              mode: 'lines', name: 'Payment',
              x: data.map((mm) => mm.month / 12.0), y: data.map((mm) => mm.payment)
            },
          ] as GenericPlotData[];
        })
      );
  }

  onMortgageDataChange(mortgage: Mortgage): void {
    mortgage = Mortgage.create(mortgage);
    const monthData = mortgage.generateMortgageLifetimeData();
    this.dataService.setMonthData(monthData);
    this.dataService.setMortgage(mortgage);
  }

}
