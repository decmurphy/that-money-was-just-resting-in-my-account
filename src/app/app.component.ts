import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericPlotData } from './interfaces/plotly/generic-plot-data';
import { Test } from './interfaces/v2/test';
import { DataService } from './services/data.service';

@Component({
    selector: 'fc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    netWorthData$: Observable<GenericPlotData[]>;
    mortgageData$: Observable<GenericPlotData[]>;
    constructor(private dataService: DataService) {}

    ngOnInit(): void {
        this.netWorthData$ = this.dataService.getNetWorthData();
        this.mortgageData$ = this.dataService.getMortgageData();

        Test.run();
    }
}
