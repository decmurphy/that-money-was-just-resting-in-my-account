import { Injectable } from '@angular/core';
import { Expenditures } from 'app/interfaces/v2/expenditures';
import { FormData } from 'app/interfaces/v2/form-data';
import { GenericPlotData } from 'app/interfaces/plotly/generic-plot-data';
import { MaritalStatus } from 'app/interfaces/v2/marital-status';
import { MonthData } from 'app/interfaces/v2/month-data';
import { Mortgage } from 'app/interfaces/v2/mortgage';
import { Strategy } from 'app/interfaces/v2/strategy/strategy';
import { StrategyEvent } from 'app/interfaces/v2/strategy/strategy-event';
import { AppServicesModule } from 'app/modules/app-services.module';
import { Observable, ReplaySubject, debounceTime } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { UtilityService } from './utility.service';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';

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
        const mcc = JSON.parse(mccString) || FormData.sampleData();
        this.setData(mcc);

        this.getData()
            .pipe(debounceTime(200))
            .subscribe(() => {
                this.updateFormInputs();
                this.ls.put(this.dataLSKey, JSON.stringify(this.data));
            });
    }

    getData(): Observable<FormData> {
        return this.dataChanged.asObservable();
    }

    setData(data: FormData): void {
        this.data = FormData.create(data);
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

        const pensionMpr = fv.taxpayers
            .map((tp) =>
                tp.employment.pension
                    ? tp.employment.pension.annualGrowthRate
                    : 0
            )
            .map((apr) => this.aprToMpr(apr));

        const liabilities = [];
        const savingsFund = [];
        const pensionFund = fv.taxpayers.map((tp, i) => [] as number[]);
        monthData.forEach((mm, i) => {
            /*
                Calculate Savings/Liabilities
            */

            if (i == 0) {
                liabilities[i] = -mm.remaining;
                savingsFund[i] = 0;
                fv.taxpayers.forEach((tp, j) => pensionFund[j].push(0));
            } else {
                // const liabilitiesDelta = -mm.remaining;

                liabilities[i] = -mm.remaining;

                const savingsDelta =
                    mm.incomes.reduce((acc, cur) => acc + cur, 0.0) -
                    mm.expenditures -
                    mm.payment;

                savingsFund[i] = savingsFund[i - 1] + savingsDelta;

                const pensionDelta = fv.taxpayers.map((tp, j) => {
                    const pensionInterest =
                        pensionFund[j][i - 1] * pensionMpr[j];
                    const pensionContrib = mm.pensionContribs[j];
                    return pensionInterest + pensionContrib;
                });

                fv.taxpayers.forEach((tp, j) =>
                    pensionFund[j].push(pensionFund[j][i - 1] + pensionDelta[j])
                );
            }
        });

        // console.log(pensionFund);

        /*
            Set Month Data
        */
        this.setMonthData(monthData);

        /*
            Build Graphs
        */
        const netWorthData = [];
        fv.taxpayers.forEach((tp, i) => {
            netWorthData.push({
                mode: 'lines',
                name: `Pension (${tp.details.name})`,
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: pensionFund[i],
            });
        });

        const combinedPensionFund = [];
        for (let i = 0; i < this.monthData.length; i++) {
            const combinedContribs = UtilityService.sum(
                fv.taxpayers.map((tp, j) => pensionFund[j][i])
            );
            combinedPensionFund.push(combinedContribs);
        }

        netWorthData.push(
            {
                mode: 'lines',
                name: 'Net Worth',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map(
                    (mm, i) =>
                        liabilities[i] +
                        (i >= fv.mortgage.startAfterMonth
                            ? fv.mortgage.amount
                            : 0) +
                        savingsFund[i] +
                        combinedPensionFund[i]
                ),
            },
            {
                mode: 'lines',
                name: 'Savings',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: savingsFund,
            },
            {
                mode: 'lines',
                name: 'Liabilities',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: liabilities,
            }
        );

        // console.log(netWorthData);

        this.setNetWorthData(netWorthData);

        this.setMortgageData([
            {
                mode: 'lines',
                name: 'Mortgage',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map((mm) => mm.remaining),
            },
            {
                mode: 'lines',
                name: 'Incr. Interest',
                x: this.monthData.map((mm) => mm.month / 12.0),
                y: this.monthData.map((mm) => mm.incrementalInterest),
            },
            {
                mode: 'lines',
                name: 'Cum. Interest',
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
        let mortgageToRepay = 0;
        const mortgageMonths = [] as MonthData[];
        let monthIdx = 0;
        let mortgagePayment = 0;
        let cumulativeInterest = 0;
        let interestAdded = 0;

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
            interestAdded = 0;
            mortgagePayment = 0;

            if (monthIdx < formData.mortgage.startAfterMonth) {
                mortgageToRepay = 0;
            } else if (monthIdx === formData.mortgage.startAfterMonth) {
                mortgageToRepay = formData.mortgage.amount;
            }

            if (monthIdx >= formData.mortgage.startAfterMonth) {
                const mortgageMPR = this.aprToMpr(formData.mortgage.aprc);

                interestAdded = mortgageToRepay * mortgageMPR;
                cumulativeInterest += interestAdded;

                mortgageToRepay += interestAdded;

                mortgagePayment = Math.min(
                    mortgageToRepay,
                    formData.mortgage.monthlyRepayments
                );
            }

            const monthlyExpenditures = UtilityService.sum(
                formData.expenditures.monthlyItems.map((item) => item.amount)
            );
            const yearlyExpenditures = UtilityService.sum(
                formData.expenditures.yearlyItems.map((item) => item.amount)
            );

            // console.log(monthIdx, mortgageToRepay, mortgagePayment);

            const mortgageMonth = new MonthData(
                monthIdx,
                mortgagePayment,
                interestAdded,
                cumulativeInterest,
                mortgageToRepay - mortgagePayment,
                monthlyExpenditures + yearlyExpenditures / 12.0,
                formData.taxpayers.map(
                    (tp) =>
                        UtilityService.sum(
                            tp.getAllIncomes().map((i) => i.net)
                        ) / 12.0
                ),
                formData.taxpayers.map((tp) =>
                    tp.employment.pension
                        ? tp.employment.pension.summary.amount / 12.0
                        : 0
                )
            );

            if (mortgageMonth.remaining > mortgageToRepay) {
                throw new Error('Impossible Mortgage');
                return [];
            }

            mortgageToRepay = mortgageMonth.remaining;
            mortgageMonths.push(mortgageMonth);

            monthIdx++;

            // 25 years optimal. 50 absolute max, don't care how big the mortgage is
        } while ((mortgageToRepay > 0 && monthIdx <= 600) || monthIdx <= 300);

        return mortgageMonths;
    }

    aprToMpr(apr: number): number {
        return Math.pow((100 + apr) / 100.0, 1 / 12) - 1;
    }
}
