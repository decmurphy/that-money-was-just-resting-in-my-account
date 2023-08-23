import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { Snapshot } from "./snapshot";
import { Expenditures } from "./expenditures";
import { Mortgage } from "./mortgage";
import { Strategy } from "./strategy";
import { FormWithErrors } from "../forms/form-with-errors";
import { BenefitInKind, Employment, Income, Pension, PersonalDetails, TaxPayer } from "./people/people";
import { UtilityService } from "app/services/utility.service";
import { NamedAmount } from "./named-amount";

export class Household extends FormWithErrors {

    cumulativeSavings: number = 0;

    cumulativeSavingsSeries: Map<number, number> = new Map();
    cumulativeNetWorthSeries: Map<number, number> = new Map();

    constructor(
        public _id: string = null,
        public taxpayers: TaxPayer[],
        public expenditures: Expenditures,
        public mortgage: Mortgage,
        public strategy: Strategy
    ) {
        super();
        this._id = this._id || UtilityService.newID('household');
        this.reset();
    }

    static sampleData(): Household {
        const taxpayers = [
            new TaxPayer(
                null,
                new PersonalDetails(
                    'Alex',
                    1990
                ),
                new Employment(
                    null,
                    true,
                    Income.paye(50000),
                    Pension.occupational(5, 0, true, 2),
                    [],
                    [BenefitInKind.healthInsurance(1500)]
                ),
                []
            ),
            new TaxPayer(
                null,
                new PersonalDetails(
                    'Jamie',
                    1990
                ),
                new Employment(
                    null,
                    true,
                    Income.paye(35000),
                    Pension.prsa(8, 0, true, 2),
                    [Income.annualBonus(3000)],
                    []
                ),
                [Income.rentARoom(5000)]
            ),
        ];

        const rent = new NamedAmount(null, 'Rent', 2000);

        const today = new Date().toStartOfMonth();
        const startDate = new Date().toStartOfMonth();
        startDate.toStartOfMonth();

        const thirtyFiveYearsFromNow = startDate.plusYears(35);

        return new Household(
            null,
            taxpayers,
            new Expenditures(
                null,
                [
                    new NamedAmount(null, 'Groceries', 600),
                    new NamedAmount(null, 'Petrol', 300),
                    new NamedAmount(null, 'Leap Card', 200),
                    new NamedAmount(null, 'Car Insurance', 100),
                    new NamedAmount(null, 'Bills', 200),
                    new NamedAmount(null, 'Going Out', 500),
                    new NamedAmount(null, 'Vet', 50),
                    // rent,
                ],
                [
                    new NamedAmount(null, 'Car Tax', 100),
                    new NamedAmount(null, 'Accountant', 400),
                ]
            ),
            new Mortgage(null, startDate, 450000, '3.65', 35, 90, 30000, 0),
            new Strategy(
                null,
                today,
                thirtyFiveYearsFromNow,
                [
                    // new StrategyEvent(
                    //     taxpayers[1].id,
                    //     12,
                    //     StrategyEventType.EMPLOYMENT_INCOME,
                    //     StrategyEventOperation.CHANGE,
                    //     50000
                    // ),
                    // new StrategyEvent(
                    //     null,
                    //     24,
                    //     StrategyEventType.MONTHLY_EXPENDITURE,
                    //     StrategyEventOperation.REMOVE,
                    //     null,
                    //     rent
                    // ),
                    // new StrategyEvent(
                    //     taxpayers[0].id,
                    //     48,
                    //     StrategyEventType.EMPLOYMENT_INCOME,
                    //     StrategyEventOperation.CHANGE,
                    //     75000
                    // ),
                    // new StrategyEvent(
                    //     null,
                    //     54,
                    //     StrategyEventType.MONTHLY_EXPENDITURE,
                    //     StrategyEventOperation.ADD,
                    //     null,
                    //     new NamedAmount(null, 'Baby!', 2000)
                    // ),
                    // new StrategyEvent(
                    //     taxpayers[1].id,
                    //     72,
                    //     StrategyEventType.EMPLOYMENT_INCOME,
                    //     StrategyEventOperation.CHANGE,
                    //     80000
                    // ),
                    // new StrategyEvent(
                    //     null,
                    //     72,
                    //     StrategyEventType.MORTGAGE_REPAYMENT,
                    //     StrategyEventOperation.CHANGE,
                    //     3000
                    // ),
                ])
        );
    }

    static create(fd: Household): Household {
        if (fd == null) {
            return null;
        }
        return new Household(
            fd._id,
            fd.taxpayers.map((tp) => TaxPayer.create(tp)),
            Expenditures.create(fd.expenditures),
            Mortgage.create(fd.mortgage),
            Strategy.create(fd.strategy)
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            taxpayers: new FormArray(
                this.taxpayers.map((item) => item.toFormGroup(formBuilder))
            ),
            expenditures: this.expenditures.toFormGroup(formBuilder),
            mortgage: this.mortgage.toFormGroup(formBuilder),
            strategy: this.strategy.toFormGroup(formBuilder)
        });
    }

    private reset() {
        this.cumulativeSavings = this.taxpayers.map(tp => tp.details.initialSavings).reduce((acc, cur) => acc + cur, 0.0);
        this.cumulativeSavingsSeries = new Map();
        this.taxpayers.forEach(tp => tp.reset());
        this.expenditures?.reset();
        this.mortgage.reset();
    }

    evaluate(): void {

        this.reset();

        var snapshotDate = new Date(this.strategy.startDate.getTime());

        // this.strategy.events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).forEach(e => {
        //     console.log(e.type, e.startDate);
        // });

        while (+snapshotDate < +this.strategy.endDate) {

            this.strategy.findEvents(snapshotDate).forEach(event => {
                // console.log(`Executing ${event.type} (${event.startDate} @ ${snapshotDate})`);
                event.execute(this);
            });

            this.taxpayers.forEach(tp => tp.evaluatePension(snapshotDate));
            this.taxpayers.forEach(tp => tp.evaluateTax(snapshotDate));

            this.mortgage.evaluate(snapshotDate);

            this.expenditures.evaluate(snapshotDate);
            this.evaluateSavings(snapshotDate);

            snapshotDate.setMonth(snapshotDate.getMonth() + 1);
        }

    }

    evaluateSavings(snapshotDate: Date): void {

        if (+snapshotDate == +this.mortgage.startDate) {
            this.cumulativeSavings -= this.mortgage.depositAmount;
        }

        const allExpenditures = (this.mortgage.paymentSeries.get(snapshotDate.getTime()) || 0)
            + (this.expenditures.expenditureSeries.get(snapshotDate.getTime()) || 0);

        const allIncome = this.taxpayers.map(tp => tp.getAllIncomes()).flat().map(i => i.net).reduce((acc, cur) => acc + cur, 0.0) / 12.0;

        this.cumulativeSavings += allIncome - allExpenditures;
        this.cumulativeSavingsSeries.set(snapshotDate.getTime(), this.cumulativeSavings);

        const netWorth = this.cumulativeSavings
            + this.taxpayers.map(tp => tp.employment.pension?.summary || 0).reduce((acc, cur) => acc + cur, 0.0) / 12.0
            + (this.mortgage.cumulativeEquitySeries.get(snapshotDate.getTime()) || 0);

        this.cumulativeNetWorthSeries.set(snapshotDate.getTime(), netWorth);

    }

    createSnapshotSeries(startDate: Date = this.strategy.startDate, endDate: Date = this.strategy.endDate): Snapshot[] {
        const startTimestamp = startDate.toStartOfYear().getTime();
        const endTimestamp = endDate.toStartOfMonth().getTime();

        const snapshots = [];

        let snapshotDate = new Date(startTimestamp);
        while (+snapshotDate < +endTimestamp) {
            snapshots.push(this.createSnapshot(+snapshotDate));
            snapshotDate.setMonth(snapshotDate.getMonth() + 1);
        }

        return snapshots;
    }

    createSnapshot(timestamp: number): Snapshot {
        return new Snapshot(
            null,
            timestamp,
            this.cumulativeSavingsSeries.get(timestamp),
            this.taxpayers.map(tp => tp.cumulativePensionSeries.get(timestamp)),
            this.mortgage.cumulativePrincipalSeries.get(timestamp),
            this.mortgage.cumulativeInterestSeries.get(timestamp),
            this.mortgage.cumulativeCostSeries.get(timestamp),
            this.mortgage.paymentSeries.get(timestamp),
            this.mortgage.cumulativeEquitySeries.get(timestamp),
            this.cumulativeNetWorthSeries.get(timestamp)
        );
    }

}
