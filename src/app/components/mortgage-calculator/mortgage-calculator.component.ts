import { Component, OnInit } from '@angular/core';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { DataService } from 'app/services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'fc-mortgage-calculator',
  templateUrl: './mortgage-calculator.component.html',
  styleUrls: ['./mortgage-calculator.component.css']
})
export class MortgageCalculatorComponent implements OnInit {

  netWorthData$: Observable<GenericPlotData[]>;
  mortgageData$: Observable<GenericPlotData[]>;
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.netWorthData$ = this.dataService.getNetWorthData();
    this.mortgageData$ = this.dataService.getMortgageData();
  }

}
