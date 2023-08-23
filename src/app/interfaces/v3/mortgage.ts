import { DatePipe } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { UtilityService } from "app/services/utility.service";
import { RequiredNumber } from "app/validators/required-number.directive";
import { FormWithErrors } from "../forms/form-with-errors";

export class Mortgage extends FormWithErrors {

    public depositAmount: number;
    public principal: number;
    public monthlyRepayment: number;

    public cumulativeInterest: number = 0;

    public paymentSeries: Map<number, number> = new Map();

    public cumulativeInterestSeries: Map<number, number> = new Map();
    public cumulativeCostSeries: Map<number, number> = new Map();
    public cumulativePrincipalSeries: Map<number, number> = new Map();
    public cumulativeEquitySeries: Map<number, number> = new Map();

    private datePipe: DatePipe = new DatePipe('en-US');

    public constructor(
        private _id: string = null,
        public startDate: Date = null,
        public initialPropertyValue: number = null,
        public interestRate: string = null,
        public term: number = null,
        public ltv: number = null,
        public helpToBuyAmount: number = 0,
        public overpaymentPct: number = 0
    ) {
        super();
        this._id = this._id || UtilityService.newID('mortgage');
        this.reset();
    }

    get id(): string {
        return this._id;
    }

    reset() {
        this.depositAmount = (this.initialPropertyValue * (100 - this.ltv) / 100) - this.helpToBuyAmount;
        this.principal = this.initialPropertyValue * this.ltv / 100;
        this.monthlyRepayment = Mortgage.findRepaymentForTerm(this.principal, parseFloat(this.interestRate), this.term * 12, this.overpaymentPct);

        this.cumulativeInterest = 0;

        this.paymentSeries = new Map();
        this.cumulativeInterestSeries = new Map();
        this.cumulativeCostSeries = new Map();
        this.cumulativePrincipalSeries = new Map();
    }

    evaluate(snapshotDate: Date): void {

        if (snapshotDate < this.startDate) {
            this.cumulativeInterestSeries.set(+snapshotDate, 0);
            this.cumulativeCostSeries.set(+snapshotDate, 0);
            this.cumulativePrincipalSeries.set(+snapshotDate, 0);
            this.cumulativeEquitySeries.set(+snapshotDate, 0);
        }
        else {

            const lastMonth = new Date(+snapshotDate);
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            if (this.cumulativeInterestSeries.get(+lastMonth) == null && +snapshotDate != +this.startDate) {
                return;
            }
            else {

                const mpr = Mortgage.aprToMpr(parseFloat(this.interestRate));
                const interestForThisPeriod = this.principal * mpr;

                this.cumulativeInterest += interestForThisPeriod;

                const existingPayment = this.paymentSeries.get(+snapshotDate) || 0;

                if (existingPayment + this.monthlyRepayment <= this.principal + interestForThisPeriod) {
                    this.paymentSeries.set(+snapshotDate, existingPayment + this.monthlyRepayment);
                    this.principal = this.principal + interestForThisPeriod - (existingPayment + this.monthlyRepayment);
                }
                else {
                    this.paymentSeries.set(+snapshotDate, this.principal + interestForThisPeriod);
                    this.principal = 0;
                }

                this.cumulativeInterestSeries.set(+snapshotDate, interestForThisPeriod);
                this.cumulativeCostSeries.set(+snapshotDate, this.cumulativeInterest);
                this.cumulativePrincipalSeries.set(+snapshotDate, this.principal);
                this.cumulativeEquitySeries.set(+snapshotDate, this.initialPropertyValue - this.principal);

            }

        }


    }

    static aprToMpr(apr: number): number {
        return Math.pow((100 + apr) / 100.0, 1 / 12) - 1;
    }

    static findRepaymentForTerm(mortgage: number, aprc: number, termInMonths: number, overpaymentPct: number = 0): number {

        const mprc = Mortgage.aprToMpr(aprc);

        let maxRepayment = 200000;
        let minRepayment = 0;
        let testRepayment = (maxRepayment + minRepayment) / 2.0;

        let maxTerm = Mortgage.getTermForRepayment(mortgage, mprc, maxRepayment) - termInMonths;
        let testTerm = Mortgage.getTermForRepayment(mortgage, mprc, testRepayment) - termInMonths;
        let minTerm = 1;

        let iters = 0;

        while (Math.abs(testTerm) > 0.0001 && iters++ < 500) {

            if (minTerm * testTerm < 0) {
                maxRepayment = testRepayment;
                maxTerm = testTerm;
            }
            else {
                minRepayment = testRepayment;
                minTerm = testTerm;
            }
            testRepayment = (maxRepayment + minRepayment) / 2.0;
            testTerm = Mortgage.getTermForRepayment(mortgage, mprc, testRepayment) - termInMonths;

        }

        const answer = testRepayment * (1 + overpaymentPct / 100.0);
        return Math.ceil(answer * 100) / 100;

    }

    private static getTermForRepayment(mortgage: number, mprc: number, repayment: number): number {

        let remaining = mortgage;
        let term = 0;
        do {
            remaining *= (1 + mprc);
            remaining -= repayment;
            if (remaining >= mortgage) {
                return Infinity;
            }
            term++;
        } while (remaining * (1 + mprc) >= repayment);

        return term + (remaining * (1 + mprc) / repayment);

    }

    getCostOfCredit(): number {

        let remaining = this.initialPropertyValue * this.ltv / 100;

        const mprc = Mortgage.aprToMpr(parseFloat(this.interestRate));
        const repayment = Mortgage.findRepaymentForTerm(remaining, parseFloat(this.interestRate), this.term * 12, this.overpaymentPct);

        let cumulativeInterest = 0;

        do {

            const interestPayment = remaining * mprc;
            cumulativeInterest += interestPayment;

            remaining += interestPayment - repayment;
            if (remaining >= this.principal) {
                return Infinity;
            }

        } while (remaining * (1 + mprc) > repayment);

        return cumulativeInterest + remaining * (mprc);

    }

    static create(model: Mortgage): Mortgage {
        if (model == null) {
            return new Mortgage();
        }

        return new Mortgage(
            model._id,
            new Date(model.startDate).toStartOfMonth(),
            model.initialPropertyValue,
            model.interestRate,
            model.term,
            model.ltv,
            model.helpToBuyAmount,
            model.overpaymentPct
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            startDate: [
                this.datePipe.transform(this.startDate, 'yyyy-MM-dd'),
                [Validators.required],
            ],
            initialPropertyValue: [
                this.initialPropertyValue,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(10e6)],
            ],
            interestRate: [
                this.interestRate,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            term: [
                this.term,
                [Validators.required, RequiredNumber, Validators.min(5), Validators.max(35)],
            ],
            ltv: [
                this.ltv,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(90)],
            ],
            helpToBuyAmount: [
                this.helpToBuyAmount,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(30000)],
            ],
            overpaymentPct: [
                this.overpaymentPct,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(10)],
            ],
        });
    }
}
