import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject, map, takeUntil } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { Household } from 'app/interfaces/v3/household';
import { Snapshot } from 'app/interfaces/v3/snapshot';
import { Mortgage } from 'app/interfaces/v3/mortgage';

@Component({
  selector: 'fc-mortgage-calculator',
  templateUrl: './mortgage-calculator.component.html',
  styleUrls: ['./mortgage-calculator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MortgageCalculatorComponent extends SubscriptionHandler implements OnInit {

  mortgage: Mortgage = Household.sampleData().mortgage;

  tableData$: Observable<Snapshot[]>;
  plotData$: Observable<GenericPlotData[]>;

  private monthDataChanged: ReplaySubject<Snapshot[]> = new ReplaySubject();

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
          const xLabels = data.filter((mm) => mm.payment > 0).map((mm) => new Date(mm.timestamp).getFractionalYear());
          return [
            {
              mode: 'lines', name: 'Mortgage',
              x: xLabels, y: data.map((mm) => mm.principal)
            },
            {
              mode: 'lines', name: 'Incr. Interest',
              x: xLabels, y: data.map((mm) => mm.interestDelta)
            },
            {
              mode: 'lines', name: 'Cum. Interest',
              x: xLabels, y: data.map((mm) => mm.interestPaid)
            },
            {
              mode: 'lines', name: 'Payment',
              x: xLabels, y: data.map((mm) => mm.payment)
            },
          ] as GenericPlotData[];
        })
      );
  }

  ngAfterViewInit() {
    this.onMortgageDataChange(this.mortgage);
    this.cd.detectChanges();
  }

  getMonthData(): Observable<Snapshot[]> {
    return this.monthDataChanged.asObservable();
  }

  setMonthData(monthData: Snapshot[]): void {
    this.monthDataChanged.next(monthData);
  }

  onMortgageDataChange(mortgageParams: Mortgage): void {
    this.mortgage = Mortgage.create(mortgageParams);
    const household = new Household(null, [], null, this.mortgage, null);

    var snapshotDate = new Date(mortgageParams.startDate.getTime()).toStartOfMonth();
    const endDate = snapshotDate.plusYears(35).toStartOfMonth();
    while (+snapshotDate < +endDate) {
      this.mortgage.evaluate(snapshotDate);
      snapshotDate.setMonth(snapshotDate.getMonth() + 1);
    }
    this.setMonthData(household.createSnapshotSeries(mortgageParams.startDate, endDate));
  }

}
