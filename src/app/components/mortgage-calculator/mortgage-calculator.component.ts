import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject, map, takeUntil } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { MonthData } from 'app/interfaces/v2/month-data';
import { Mortgage } from 'app/interfaces/v2/mortgage';
import { FormData } from 'app/interfaces/v2/form-data';

@Component({
  selector: 'fc-mortgage-calculator',
  templateUrl: './mortgage-calculator.component.html',
  styleUrls: ['./mortgage-calculator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MortgageCalculatorComponent extends SubscriptionHandler implements OnInit {

  mortgage: Mortgage = FormData.sampleData().mortgage;

  tableData$: Observable<MonthData[]>;
  plotData$: Observable<GenericPlotData[]>;

  private monthData: MonthData[] = [];
  private monthDataChanged: ReplaySubject<MonthData[]> = new ReplaySubject();

  constructor(
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {

    this.tableData$ = this.getMonthData()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(data => data.filter((mm) => mm.payment > 0))
      );

    this.plotData$ = this.getMonthData()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        map(data => {
          return [
            {
              mode: 'lines', name: 'Mortgage',
              x: data.filter(mm => mm.payment > 0).map((mm) => mm.month / 12.0), y: data.map((mm) => mm.remaining)
            },
            {
              mode: 'lines', name: 'Incr. Interest',
              x: data.filter(mm => mm.payment > 0).map((mm) => mm.month / 12.0), y: data.map((mm) => mm.incrementalInterest)
            },
            {
              mode: 'lines', name: 'Cum. Interest',
              x: data.filter(mm => mm.payment > 0).map((mm) => mm.month / 12.0), y: data.map((mm) => mm.cumulativeInterest)
            },
            {
              mode: 'lines', name: 'Payment',
              x: data.filter(mm => mm.payment > 0).map((mm) => mm.month / 12.0), y: data.map((mm) => mm.payment)
            },
          ] as GenericPlotData[];
        })
      );
  }

  ngAfterViewInit() {
    this.onMortgageDataChange(this.mortgage);
    this.cd.detectChanges();
  }

  getMonthData(): Observable<MonthData[]> {
    return this.monthDataChanged.asObservable();
  }

  setMonthData(monthData: MonthData[]): void {
    this.monthData = monthData;
    this.monthDataChanged.next(this.monthData);
  }

  onMortgageDataChange(mortgageParams: Mortgage): void {
    this.mortgage = Mortgage.create(mortgageParams);
    const monthData = this.mortgage.generateMortgageLifetimeData();
    this.setMonthData(monthData);
  }

}
