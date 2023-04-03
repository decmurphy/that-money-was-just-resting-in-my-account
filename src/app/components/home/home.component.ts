import { Component, OnInit } from '@angular/core';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { DataService } from 'app/services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'fc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  netWorthData$: Observable<GenericPlotData[]>;
  mortgageData$: Observable<GenericPlotData[]>;
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.netWorthData$ = this.dataService.getNetWorthData();
    this.mortgageData$ = this.dataService.getMortgageData();
  }

}
