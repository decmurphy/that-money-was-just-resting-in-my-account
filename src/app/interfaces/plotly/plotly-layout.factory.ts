import { Injectable } from '@angular/core';
import { PlotlyModule } from '../../modules/chart/plotly.module';
import { PlotlyConfig } from './plotly-config';
import { PlotlyLayout } from './plotly-layout';

@Injectable({
    providedIn: PlotlyModule,
})
export class PlotlyLayoutFactory {
    fontColor = '#0c4a6e';
    gridColor = '#bbbbbb';

    constructor() {}

    getLayout(plotConfig: PlotlyConfig): PlotlyLayout {
        switch (plotConfig.type) {
            case 'lines':
                return this.getLineChartLayout(plotConfig);
            case 'scatter3d':
                return this.getScatter3dLayout(plotConfig);
            case 'contour':
                return this.getContourLayout(plotConfig);
            default:
                throw new Error(
                    `PlotlyLayoutFactory not configured for type: ${plotConfig.type}`
                );
        }
    }

    getLineChartLayout(plotConfig: PlotlyConfig): PlotlyLayout {
        return new PlotlyLayout(
            plotConfig.title,
            true,
            {
                family: 'Montserrat',
                size: 15,
                color: this.fontColor,
            },
            {
                color: this.fontColor,
                gridcolor: this.gridColor,
                type: plotConfig.x.type,
                title: plotConfig.x.label,
                range: plotConfig.x.range,
            },
            {
                color: this.fontColor,
                gridcolor: this.gridColor,
                type: plotConfig.y[0].type,
                title: plotConfig.y[0].label,
                range: plotConfig.y[0].range,
            },
            null,
            'rgba(10, 10, 10, 0.0)',
            'rgba(255, 0, 0, 0.0)',
            true,
            plotConfig.margin || { l: 80, b: 80, r: 80, t: 80 }
        );
    }

    getScatter3dLayout(plotConfig: PlotlyConfig): PlotlyLayout {
        const layout = new PlotlyLayout(
            plotConfig.title,
            false,
            {
                family: 'Montserrat',
                size: 15,
                color: this.fontColor,
            },
            {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showticklabels: false,
            },
            {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showticklabels: false,
            },
            {
                showgrid: false,
                autorange: true,
                zeroline: false,
                showticklabels: false,
            },
            'rgba(255, 255, 255, 0.0)',
            'rgba(255, 0, 0, 0.0)',
            true,
            { l: 0, b: 0, r: 0, t: 40 }
        ) as any;
        layout.scene = {
            xaxis: { title: plotConfig.x.label },
            yaxis: { title: plotConfig.y[0].label },
            zaxis: { title: plotConfig.z.label },
        };
        return layout;
    }

    getContourLayout(plotConfig: PlotlyConfig): PlotlyLayout {
        console.log(plotConfig);

        return new PlotlyLayout(
            plotConfig.title,
            false,
            {
                family: 'Montserrat',
                size: 15,
                color: this.fontColor,
            },
            {
                type: 'date',
                label: plotConfig.x.label,
            },
            {
                type: 'date',
                label: plotConfig.y[0].label,
            },
            null,
            'rgba(255, 255, 255, 0.0)',
            'rgba(255, 0, 0, 0.0)',
            true,
            plotConfig.margin || { l: 80, b: 80, r: 80, t: 80 }
        );
    }
}
