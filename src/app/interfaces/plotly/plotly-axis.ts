export class PlotlyAxis {
    constructor(
        public axis: string = null,
        public label: string = null,
        public type: string = 'linear' || 'log',
        public range: number[] = null
    ) {}
}
