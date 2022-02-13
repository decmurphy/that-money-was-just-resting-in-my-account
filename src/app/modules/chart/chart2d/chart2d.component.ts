import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';

import { GenericPlotData } from '../../../interfaces/plotly/generic-plot-data';
import { PlotlyService } from '../../../services/plotly.service';

@Component({
    selector: 'fc-chart2d',
    templateUrl: './chart2d.component.html',
    styleUrls: ['./chart2d.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class Chart2dComponent implements OnInit, OnChanges {
    @ViewChild('chart', { static: true }) chart: ElementRef;
    @Input() genericData: GenericPlotData[];
    @Input() config: any;

    @Input() title: any;
    @Input() xTitle: any;
    @Input() yTitle: any;

    initialised = false;

    constructor(private plotly: PlotlyService) {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['genericData'] && changes['genericData'].currentValue) {
            this.plotly.makeGenericPlot(
                this.chart.nativeElement,
                this.title,
                this.xTitle,
                this.yTitle,
                changes['genericData'].currentValue
            );
            this.initialised = true; // after first change, should be true for all subsequent changes
            setTimeout(() => {
                this.relayout();
            }, 2500);
        }
    }

    @HostListener('window:resize')
    relayout() {
        this.plotly.resize(this.chart.nativeElement);
    }
}
