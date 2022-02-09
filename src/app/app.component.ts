import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericPlotData } from './interfaces/generic-plot-data';
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
    }
}
