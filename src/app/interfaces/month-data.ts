
export class MonthData {

    constructor(
        public month: number,
        public payment: number,
        public incrementalInterest: number,
        public cumulativeInterest: number,
        public remaining: number,
        public expenditures: number,
        public incomes: number[],
        public pensionContribs: number[]
    ) { }

}
