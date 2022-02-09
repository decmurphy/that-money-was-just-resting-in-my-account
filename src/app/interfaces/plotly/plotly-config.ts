import { PlotlyAxis } from './plotly-axis';

export class PlotlyConfig {
    constructor(
        public id: string = null,
        public title: string = null,
        public events: boolean = false,
        public type: string = null,
        public mode: string = null,
        public x: PlotlyAxis = null,
        public y: PlotlyAxis[] = null,
        public z: PlotlyAxis = null,
        public margin: any = null
    ) {}
}
