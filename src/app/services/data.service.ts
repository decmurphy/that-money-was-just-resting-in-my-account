import { Injectable } from '@angular/core';
import { Expenditures } from 'app/interfaces/v2/expenditures';
import { FormData } from 'app/interfaces/v2/form-data';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { MaritalStatus } from 'app/interfaces/v2/marital-status';
import { MonthData } from 'app/interfaces/v2/month-data';
import { Mortgage } from 'app/interfaces/v2/mortgage';
import { Strategy } from 'app/interfaces/v2/strategy';
import { StrategyEvent } from 'app/interfaces/v2/strategy-event';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { AppServicesModule } from 'app/modules/app-services.module';
import { Observable, ReplaySubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { UtilityService } from './utility.service';

@Injectable({
    providedIn: AppServicesModule,
})
export class DataService {
    private dataLSKey: string;
    private data: FormData;
    private dataChanged: ReplaySubject<FormData> = new ReplaySubject();

    private monthData: MonthData[];
    private monthDataChanged: ReplaySubject<MonthData[]> = new ReplaySubject();

    private netWorthData: GenericPlotData[];
    private netWorthDataChanged: ReplaySubject<GenericPlotData[]> =
        new ReplaySubject();
    private mortgageData: GenericPlotData[];
    private mortgageDataChanged: ReplaySubject<GenericPlotData[]> =
        new ReplaySubject();

    constructor(private ls: LocalStorageService) {
        this.dataLSKey = 'mortgageCalcConfigV2';
        const mccString = this.ls.get(this.dataLSKey);
        const mcc = JSON.parse(mccString) || new FormData();
        this.setData(mcc);
    }

    getData(): Observable<FormData> {
        return this.dataChanged.asObservable();
    }

    setData(data: FormData): void {
        this.data = FormData.create(data);
        this.updateFormInputs();
        this.ls.put(this.dataLSKey, JSON.stringify(this.data));
        this.dataChanged.next(this.data);
    }

    getMonthData(): Observable<MonthData[]> {
        return this.monthDataChanged.asObservable();
    }

    setMonthData(monthData: MonthData[]): void {
        this.monthData = monthData;
        this.monthDataChanged.next(this.monthData);
    }

    getNetWorthData(): Observable<GenericPlotData[]> {
        return this.netWorthDataChanged.asObservable();
    }

    setNetWorthData(data: GenericPlotData[]): void {
        this.netWorthData = data;
        this.netWorthDataChanged.next(this.netWorthData);
    }

    getMortgageData(): Observable<GenericPlotData[]> {
        return this.mortgageDataChanged.asObservable();
    }

    setMortgageData(data: GenericPlotData[]): void {
        this.mortgageData = data;
        this.mortgageDataChanged.next(this.mortgageData);
    }

    addTaxpayer() {
        this.data.taxpayers.push(new TaxPayer());
        this.setData(this.data);
    }

    removeTaxpayer(idx: number): void {
        this.data.taxpayers.splice(idx, 1);
        this.setData(this.data);
    }

    setMaritalStatus(model: MaritalStatus): void {
        this.data.maritalStatus = model;
        this.setData(this.data);
    }

    setTaxpayer(idx: number, model: TaxPayer): void {
        this.data.taxpayers[idx] = model;
        this.setData(this.data);
    }

    setMortgage(model: Mortgage): void {
        this.data.mortgage = model;
        this.setData(this.data);
    }

    setExpenditures(model: Expenditures): void {
        this.data.expenditures = model;
        this.setData(this.data);
    }

    setStrategy(model: Strategy): void {
        this.data.strategy = model;
        this.setData(this.data);
    }

    setEvent(i: number, model: StrategyEvent): void {
        this.data.strategy.events[i] = model;
        this.setData(this.data);
    }

    addEvent(): void {
        this.data.strategy.events.push(new StrategyEvent());
        this.setData(this.data);
    }

    deleteEvent(i: number): void {
        this.data.strategy.events.splice(i, 1);
        this.setData(this.data);
    }

    updateFormInputs() {
        this.data = FormData.create(this.data);
        this.populateData(this.data);

        // make copy
        const fv = FormData.create(this.data);

        // again with the strategy for the graphs, and save this one
        const monthData = this.populateData(fv, this.data.strategy);

        const liabilityGrowth = [];
        const savingsGrowth = [];
        const pensionGrowth = [];
        monthData.forEach((mm, i) => {
            /*
                Calculate Savings/Liabilities
            */
            const savingsDelta =
                mm.incomes.reduce((acc, cur) => acc + cur, 0.0) -
                mm.expenditures -
                mm.payment;
            const pensionDelta = mm.pensionContribs.reduce(
                (acc, cur) => acc + cur,
                0.0
            );

            if (i == 0) {
                liabilityGrowth[i] = -mm.remaining;
                savingsGrowth[i] = 0;
                pensionGrowth[i] = 0;
            } else {
                liabilityGrowth[i] = -mm.remaining;
                savingsGrowth[i] = savingsGrowth[i - 1] + savingsDelta;
                pensionGrowth[i] = pensionGrowth[i - 1] + pensionDelta;
            }
        });

        /*
            Set Month Data
        */
        this.setMonthData(monthData);

        /*
            Build Graphs
        */
        this.setNetWorthData([
            {
                mode: 'lines',
                name: 'Net Worth',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: liabilityGrowth.map(
                    (v, i) =>
                        v +
                        fv.mortgage.amount +
                        savingsGrowth[i] +
                        pensionGrowth[i]
                ),
            },
            {
                mode: 'lines',
                name: 'Savings',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: savingsGrowth,
            },
            {
                mode: 'lines',
                name: 'Pension',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: pensionGrowth,
            },
            {
                mode: 'lines',
                name: 'Liabilities',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: liabilityGrowth,
            },
        ]);

        this.setMortgageData([
            {
                mode: 'lines',
                name: 'Mortgage Size',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map((mm) => mm.remaining),
            },
            {
                mode: 'lines',
                name: 'Interest',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map((mm) => mm.incrementalInterest),
            },
            {
                mode: 'lines',
                name: 'Total Interest Paid',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map((mm) => mm.cumulativeInterest),
            },
            {
                mode: 'lines',
                name: 'Payment',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map((mm) => mm.payment),
            },
        ]);
    }

    populateData(formData: FormData, strategy = new Strategy()): MonthData[] {
        let mortgageToRepay = formData.mortgage.amount;
        const mortgageMonths = [] as MonthData[];
        let monthIdx = 0;
        let cumulativeInterest = 0;

        const now = new Date();

        do {
            const _date = new Date(
                now.getTime() + monthIdx * 30 * 24 * 60 * 60 * 1000
            );

            if (strategy.events.length > 0 || monthIdx === 0) {
                // console.log(monthIdx, formData.tp1.income);

                strategy.apply(formData, monthIdx);

                /*
                    Set Marital Status
                */
                if (formData.taxpayers.length == 2) {
                    const tp1IsAssessor =
                        formData.taxpayers[0].employment.income.gross >
                        formData.taxpayers[1].employment.income.gross;
                    formData.taxpayers[0].details.maritalStatus =
                        MaritalStatus.create({
                            ...formData.maritalStatus,
                            isAssessor: tp1IsAssessor,
                        } as MaritalStatus);
                    formData.taxpayers[1].details.maritalStatus =
                        MaritalStatus.create({
                            ...formData.maritalStatus,
                            isAssessor: !tp1IsAssessor,
                        } as MaritalStatus);
                }

                /*
                    Calculate Pension Contribution
                */
                formData.taxpayers.forEach((tp) =>
                    tp.calculateTaxAndPension(_date.getFullYear())
                );
            }

            /*
                Calculate Mortgage Lifecycle
            */
            const monthlyInterestRate =
                Math.pow((100 + formData.mortgage.aprc) / 100.0, 1 / 12) - 1;

            const interestAdded = mortgageToRepay * monthlyInterestRate;
            cumulativeInterest += interestAdded;

            const remaining = Math.max(
                mortgageToRepay +
                    interestAdded -
                    formData.mortgage.monthlyRepayments,
                0
            );

            const monthlyExpenditures = formData.expenditures.monthlyItems
                .map((item) => item.amount)
                .reduce((acc, cur) => acc + cur, 0.0);
            const yearlyExpenditures = formData.expenditures.yearlyItems
                .map((item) => item.amount)
                .reduce((acc, cur) => acc + cur, 0.0);

            const mortgageMonth = new MonthData(
                monthIdx,
                Math.min(
                    mortgageToRepay + interestAdded,
                    formData.mortgage.monthlyRepayments
                ),
                interestAdded,
                cumulativeInterest,
                remaining,
                monthlyExpenditures + yearlyExpenditures / 12.0,
                formData.taxpayers.map(
                    (tp) =>
                        UtilityService.sum(
                            tp.getAllIncomes().map((i) => i.net)
                        ) / 12.0
                ),
                formData.taxpayers.map(
                    (tp) => tp.employment.pension?.summary.amount / 12.0
                )
            );

            if (mortgageMonth.remaining > mortgageToRepay) {
                return [];
                // throw new Error('Impossible Mortgage');
            }

            mortgageToRepay = mortgageMonth.remaining;
            mortgageMonths.push(mortgageMonth);

            monthIdx++;
        } while (mortgageToRepay > 0 || monthIdx <= 300);

        return mortgageMonths;
    }
}
