import { Injectable } from '@angular/core';

import Plotly from 'plotly.js/dist/plotly-tmwjrima.min';

import { PlotlyModule } from '../modules/chart/plotly.module';
import { PlotlyLayoutFactory } from '../interfaces/plotly/plotly-layout.factory';
import { PlotlyConfig } from '../interfaces/plotly/plotly-config';
import { Trace } from '../interfaces/plotly/trace';
import { PlotlyLayout } from '../interfaces/plotly/plotly-layout';
import { GenericPlotData } from '../interfaces/generic-plot-data';

@Injectable({
    providedIn: PlotlyModule,
})
export class PlotlyService {
    plotData: {
        [key: string]: {
            htmlElement: HTMLElement;
            traces: Trace[];
        };
    };

    constructor(private plotlyLayoutFactory: PlotlyLayoutFactory) {
        this.plotData = {};
    }

    getLayout(plotConfig: PlotlyConfig): PlotlyLayout {
        return this.plotlyLayoutFactory.getLayout(plotConfig);
    }

    makeGenericPlot(
        element: any,
        title: string,
        xTitle: string,
        yTitle: string,
        data: GenericPlotData[]
    ) {
        const layout = this.getLayout({
            title: title,
            type: 'lines',
            x: {
                type: 'linear',
                label: xTitle,
                // range: [-180,180]
            },
            y: [
                {
                    type: 'linear',
                    label: yTitle,
                    // range: [0,90]
                },
            ],
            // margin: {
            //     t: 10, //top margin
            //     l: 10, //left margin
            //     r: 10, //right margin
            //     b: 10 //bottom margin
            // }
        } as PlotlyConfig);

        Plotly.newPlot(element, data, layout).then((htmlElement) => {
            // this.plotData[html.id].htmlElement = htmlElement;
        });
    }

    resize(element) {
        Plotly.relayout(element, {});
    }
}
