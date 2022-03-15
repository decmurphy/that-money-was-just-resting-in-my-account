export class PlotlyLayout {
    constructor(
        public title: string = null,
        public showlegend: boolean = false,
        public font: {
            family: string;
            size: number;
            color: string;
        } = null,
        public xaxis: any,
        public yaxis: any,
        public zaxis: any,
        public paper_bgcolor: string = null,
        public plot_bgcolor: string = null,
        public autosize: boolean = null,
        public margin = {
            l: 80,
            b: 80,
            r: 80,
            t: 80,
        } // public legend = { orientation: 'h' }
    ) {}
}
