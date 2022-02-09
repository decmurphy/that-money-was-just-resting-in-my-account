import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { Observable, Subscription, map, takeUntil, tap } from 'rxjs';

import { GenericPlotData } from './interfaces/generic-plot-data';
import { SubscriptionHandler } from './interfaces/subscription-handler';
import { MonthData } from './interfaces/month-data';
import { FormData } from './interfaces/form-data';
import { Strategy } from './interfaces/strategy';
import { TaxPayer } from './interfaces/tax-payer';
import { KeyVal } from './interfaces/keyval';
import { LocalStorageService } from './services/local-storage.service';
import { MaritalStatus } from './interfaces/marital-status';
import { StrategyEvent } from './interfaces/strategy-event';

@Component({
    selector: 'fc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent extends SubscriptionHandler implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    math = Math;

    dataSource: MatTableDataSource<MonthData>;
    displayedColumns: string[];

    monthlyData: MonthData[];
    mortgageTerm: number;

    netWorthData: GenericPlotData[];
    mortgageData: GenericPlotData[];

    form: FormGroup;
    formValueChangesSub: Subscription;
    data: FormData;

    editingTaxpayerIdx: number;
    editingEventIdx: number;
    editingMortgage = false;

    eventQuantities: KeyVal[];
    eventOperations: KeyVal[];

    lg$: Observable<boolean>;

    constructor(
        private fb: FormBuilder,
        private breakpointObserver: BreakpointObserver,
        private localStorage: LocalStorageService
    ) {
        super();

        this.displayedColumns = ['year', 'month', 'payment', 'incrementalInterest', 'cumulativeInterest', 'remaining'];

        const mortgageCalcConfigString = this.localStorage.get('mortgageCalcConfig');
        const mortgageCalcConfig = JSON.parse(mortgageCalcConfigString) || new FormData();

        this.data = FormData.create(mortgageCalcConfig);
    }

    ngOnInit(): void {
        this.lg$ = this.breakpointObserver
            .observe(['(min-width: 1024px)']) // screen:lg
            .pipe(map((state: BreakpointState) => state.matches));

        // this.lg$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        //     this.cd.detectChanges();
        // });

        this.dataSource = new MatTableDataSource<MonthData>([]);

        this.eventQuantities = [
            new KeyVal('pensionPercentage', 'Pension %'),
            new KeyVal('grossIncome', 'Gross Income'),
            new KeyVal('monthlyExpenditure', 'Monthly Exp.'),
            new KeyVal('yearlyExpenditure', 'Yearly Exp.'),
            new KeyVal('mortgageAPRC', 'APRC'),
            new KeyVal('mortgageRepayment', 'Repayments'),
        ];

        this.eventOperations = [
            new KeyVal('to', 'New Amount'),
            new KeyVal('add', 'Add Amount'),
            new KeyVal('subtract', 'Subtract Amount'),
        ];

        this.resetForm();
    }

    resetForm(): void {
        this.data = FormData.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.localStorage.put('mortgageCalcConfig', JSON.stringify(fv)))
            )
            .subscribe((fv) => {
                this.updateFormInputs(fv);
            });

        // run once at beginning
        this.updateFormInputs(this.form.getRawValue());
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
    }

    updateFormInputs(fv: FormData) {
        this.data = FormData.create(fv);
        this.populateData(this.data);

        // make copy
        fv = FormData.create(fv);

        // again with the strategy for the graphs, and save this one
        this.monthlyData = this.populateData(fv, this.data.strategy);
        this.mortgageTerm = this.monthlyData.filter((mm) => mm.remaining > 0).length;

        const liabilityGrowth = [];
        const savingsGrowth = [];
        const pensionGrowth = [];
        this.monthlyData.forEach((mm, i) => {
            /*
                Calculate Savings/Liabilities
            */
            const savingsDelta = mm.incomes.reduce((acc, cur) => acc + cur, 0.0) - mm.expenditures - mm.payment;
            const pensionDelta = mm.pensionContribs.reduce((acc, cur) => acc + cur, 0.0);

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
            Build Table
        */
        this.dataSource.data = this.monthlyData.filter((mm) => mm.remaining > 0);

        /*
            Build Graphs
        */
        this.netWorthData = [
            {
                mode: 'lines',
                name: 'Net Worth',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: liabilityGrowth.map((v, i) => v + fv.mortgage.amount + savingsGrowth[i] + pensionGrowth[i]),
            },
            {
                mode: 'lines',
                name: 'Savings',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: savingsGrowth,
            },
            {
                mode: 'lines',
                name: 'Pension',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: pensionGrowth,
            },
            {
                mode: 'lines',
                name: 'Liabilities',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: liabilityGrowth,
            },
            // {
            //     mode: "lines",
            //     name: "Net Income tp1",
            //     x: this.mortgageMonths.map(mm => mm.month / 12.0),
            //     y: this.mortgageMonths.map(mm => mm.incomes[0])
            // },{
            //     mode: "lines",
            //     name: "Net Income tp2",
            //     x: this.mortgageMonths.map(mm => mm.month / 12.0),
            //     y: this.mortgageMonths.map(mm => mm.incomes[1])
            // }
        ];

        this.mortgageData = [
            {
                mode: 'lines',
                name: 'Mortgage Size',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: this.monthlyData.map((mm) => mm.remaining),
            },
            {
                mode: 'lines',
                name: 'Interest',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: this.monthlyData.map((mm) => mm.incrementalInterest),
            },
            {
                mode: 'lines',
                name: 'Total Interest Paid',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: this.monthlyData.map((mm) => mm.cumulativeInterest),
            },
            {
                mode: 'lines',
                name: 'Payment',
                x: this.monthlyData.map((mm) => mm.month / 12.0),
                y: this.monthlyData.map((mm) => mm.payment),
            },
        ];
    }

    populateData(formData: FormData, strategy = new Strategy()): MonthData[] {
        let mortgageToRepay = formData.mortgage.amount;
        const mortgageMonths = [] as MonthData[];
        let monthIdx = 0;
        let cumulativeInterest = 0;

        const now = new Date();

        do {
            const _date = new Date(now.getTime() + monthIdx * 30 * 24 * 60 * 60 * 1000);

            if (strategy.events.length > 0 || monthIdx === 0) {
                // console.log(monthIdx, formData.tp1.income);

                strategy.setMonth(monthIdx);
                strategy.apply(formData);

                /*
                    Calculate Pension Contribution
                */
                formData.tp1.calculatePensionContribution(_date.getFullYear());
                if (formData.tp2) {
                    formData.tp2.calculatePensionContribution(_date.getFullYear());
                }

                /*
                    Set Marital Status
                */
                if (formData.tp2) {
                    const tp1IsAssessor = formData.tp1.income.gross > formData.tp2.income.gross;
                    formData.tp1.maritalStatus = MaritalStatus.create({
                        ...formData.maritalStatus,
                        isAssessor: tp1IsAssessor,
                    } as MaritalStatus);
                    formData.tp2.maritalStatus = MaritalStatus.create({
                        ...formData.maritalStatus,
                        isAssessor: !tp1IsAssessor,
                    } as MaritalStatus);
                }

                /*
                    Calculate Income Tax
                */
                if (formData.maritalStatus.married && +formData.maritalStatus.assessmentMode === 0) {
                    const [tp1_incomeTax, tp2_incomeTax] = TaxPayer.getIncomeTaxChargeable_JointAssessed(
                        formData.tp1,
                        formData.tp2
                    );
                    formData.tp1.taxPayable.incomeTax = tp1_incomeTax;
                    if (formData.tp2) {
                        formData.tp2.taxPayable.incomeTax = tp2_incomeTax;
                    }
                } else {
                    formData.tp1.taxPayable.incomeTax = formData.tp1.getIncomeTaxChargeable_Single();
                    if (formData.tp2) {
                        formData.tp2.taxPayable.incomeTax = formData.tp2.getIncomeTaxChargeable_Single();
                    }
                }

                /*
                    Calculate all other taxes
                */
                formData.tp1.calculateNetIncome();
                if (formData.tp2) {
                    formData.tp2.calculateNetIncome();
                }

                // console.log(monthIdx, formData.tp1.pension.amount, formData.tp1.income.net);
            }

            /*
                Calculate Mortgage Lifecycle
            */
            const monthlyInterestRate = Math.pow((100 + formData.mortgage.aprc) / 100.0, 1 / 12) - 1;

            const interestAdded = mortgageToRepay * monthlyInterestRate;
            cumulativeInterest += interestAdded;

            const remaining = Math.max(mortgageToRepay + interestAdded - formData.mortgage.monthlyRepayments, 0);
            const mortgageMonth = new MonthData(
                monthIdx,
                Math.min(mortgageToRepay + interestAdded, formData.mortgage.monthlyRepayments),
                interestAdded,
                cumulativeInterest,
                remaining,
                formData.expenditures.monthly + formData.expenditures.yearly / 12.0,
                [formData.tp1.income.net / 12.0, formData.tp2 ? formData.tp2.income.net / 12.0 : 0],
                [formData.tp1.pension.amount / 12.0, formData.tp2 ? formData.tp2.pension.amount / 12.0 : 0]
            );

            if (mortgageMonth.remaining > mortgageToRepay) {
                throw new Error('Impossible Mortgage');
            }

            mortgageToRepay = mortgageMonth.remaining;
            mortgageMonths.push(mortgageMonth);

            monthIdx++;
        } while (mortgageToRepay > 0 || monthIdx <= 300);

        return mortgageMonths;
    }

    drop(location: CdkDragDrop<StrategyEvent[]>): void {
        if (location.previousIndex !== location.currentIndex) {
            moveItemInArray(this.data.strategy.events, location.previousIndex, location.currentIndex);
            this.resetForm();
        }
    }

    addEvent() {
        this.events.push(new StrategyEvent().toFormGroup(this.fb));
        this.editingEventIdx = this.events.length - 1;
    }

    removeEvent(i: number): void {
        this.events.removeAt(i);
    }

    addTaxpayer() {
        this.data.tp2 = new TaxPayer();
        this.resetForm();
    }

    removeTaxpayer(i: number): void {
        if (i == 0) {
            this.data.tp1 = this.data.tp2;
        }
        this.data.tp2 = null;
        this.resetForm();
    }

    get events(): FormArray {
        const strategyGroup = this.form.get('strategy') as FormGroup;
        return strategyGroup.get('events') as FormArray;
    }

    get tp1(): FormGroup {
        return this.form.get('tp1') as FormGroup;
    }

    get tp2(): FormGroup {
        return this.form.get('tp2') as FormGroup;
    }

    get expenditures(): FormGroup {
        return this.form.get('expenditures') as FormGroup;
    }

    get mortgage(): FormGroup {
        return this.form.get('mortgage') as FormGroup;
    }
}
