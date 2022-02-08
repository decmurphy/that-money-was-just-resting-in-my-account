
export class Trace {

    constructor(
        public simulationId: string = null,
        public resourceId: string = null,
        public stageNumber: number = null,
        public type: string = null,
        public active: boolean = null,
        public data: TraceData = null
    ) {
    }

}

export class TraceData {

    constructor(
        public name: string = null,
        public x: number[] = null,
        public y: number[] = null,
        public z: number[] = null,
        public mode: string = null,
        public type: string = null,
        public marker: any = {
            size: 5
        }
    ) {
    }

}
