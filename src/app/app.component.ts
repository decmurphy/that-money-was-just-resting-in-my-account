import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericPlotData } from './interfaces/plotly/generic-plot-data';
import { DataService } from './services/data.service';

@Component({
    selector: 'fc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    netWorthData$: Observable<GenericPlotData[]>;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.netWorthData$ = this.dataService.getNetWorthData();
    }
}
