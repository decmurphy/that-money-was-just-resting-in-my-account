import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { MonthData } from './month-data';

export class Mortgage extends FormWithErrors {

    deposit: number;
    amount: number;
    monthlyRepayments: number;

    constructor(
        public value: number = 500000,
        public ltv: number = 90,
        public startAfterMonth: number = 0,
        public term: number = 25,
        public aprc: number = 3.2,
        public htb: number = 0,
        public overpaymentPct: number = 0
    ) {
        super();
        this.deposit = this.value * (100 - this.ltv) / 100.0 - this.htb;
        this.amount = this.value - (this.deposit + this.htb);
    }

    static create(model: Mortgage): Mortgage {
        if (model == null) {
            return new Mortgage();
        }
        return new Mortgage(
            model.value,
            model.ltv,
            model.startAfterMonth,
            model.term,
            model.aprc,
            model.htb,
            model.overpaymentPct
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            startAfterMonth: [
                this.startAfterMonth,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            value: [
                this.value,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(10e6)],
            ],
            ltv: [
                this.ltv,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(90)],
            ],
            term: [
                this.term,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(5),
                    Validators.max(35),
                ],
            ],
            aprc: [
                this.aprc,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            htb: [
                this.htb,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(0),
                    Validators.max(30000),
                ],
            ],
            overpaymentPct: [
                this.overpaymentPct,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(10)],
            ],
        });
    }

    static aprToMpr(apr: number): number {
        return Math.pow((100 + apr) / 100.0, 1 / 12) - 1;
    }

    findRepaymentForTerm(): number {
        return Mortgage.findRepaymentForTerm(this.amount, this.aprc, this.term * 12, this.overpaymentPct);
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

        while (Math.abs(testTerm) > 0.001 && iters++ < 500) {

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

        return testRepayment * (1 + overpaymentPct / 100.0);

    }

    static getTermForRepayment(mortgage: number, mprc: number, repayment: number): number {

        let remaining = mortgage;
        let term = 0;
        do {
            remaining *= (1 + mprc);
            remaining -= repayment;
            if (remaining >= mortgage) {
                return Infinity;
            }
            term++;
        } while (remaining * (1 + mprc) > repayment);

        return term + (remaining * (1 + mprc) / repayment);

    }

    getTotalInterest(): number {
        return Mortgage.getTotalInterest(this);
    }

    static getTotalInterest(mortgage: Mortgage): number {

        let repayment = Mortgage.findRepaymentForTerm(mortgage.amount, mortgage.aprc, mortgage.term * 12, mortgage.overpaymentPct);
        let mprc = Mortgage.aprToMpr(mortgage.aprc);

        let remaining = mortgage.amount;
        let monthIdx = 0;
        let interestPayment = 0, cumulativeInterest = 0;
        do {

            interestPayment = remaining * mprc;
            cumulativeInterest += interestPayment;

            remaining += interestPayment - repayment;
            if (remaining >= mortgage.amount) {
                return Infinity;
            }

            monthIdx++;

        } while (remaining * (1 + mprc) > repayment);

        return cumulativeInterest + remaining * (mprc);

    }

    generateMortgageLifetimeData(): MonthData[] {

        let monthData = [] as MonthData[];

        let mortgageToRepay = 0;
        let monthIdx = 0;
        let mortgagePayment = 0;
        let cumulativeInterest = 0;
        let interestAdded = 0;

        const monthlyRepayment = Mortgage.findRepaymentForTerm(this.amount, this.aprc, this.term * 12, this.overpaymentPct);
        const mortgageMPR = Mortgage.aprToMpr(this.aprc);

        do {

            interestAdded = 0;
            mortgagePayment = 0;

            if (monthIdx < this.startAfterMonth) {
                mortgageToRepay = 0;
            } else if (monthIdx === this.startAfterMonth) {
                mortgageToRepay = this.amount;
            } else {
                mortgageToRepay = monthData[monthData.length - 1].remaining;
            }

            if (monthIdx >= this.startAfterMonth) {

                interestAdded = mortgageToRepay * mortgageMPR;
                cumulativeInterest += interestAdded;

                mortgageToRepay += interestAdded;

                mortgagePayment = Math.min(mortgageToRepay, monthlyRepayment);
            }

            const monthDataItem = new MonthData(
                monthIdx,
                mortgagePayment,
                interestAdded,
                cumulativeInterest,
                mortgageToRepay - mortgagePayment,
            );

            if (monthDataItem.remaining > mortgageToRepay) {
                throw new Error('Impossible Mortgage');
                return [];
            }

            mortgageToRepay = monthDataItem.remaining;
            monthData.push(monthDataItem);

            monthIdx++;

            // 25 years optimal. 50 absolute max, don't care how big the mortgage is
        } while ((mortgageToRepay > 0 && monthIdx <= 600) || monthIdx <= 300);

        if (mortgageToRepay > 0) {

            console.log(monthData);

            interestAdded = mortgageToRepay * mortgageMPR;
            cumulativeInterest += interestAdded;

            mortgageToRepay += interestAdded;

            const monthDataItem = new MonthData(
                monthIdx,
                mortgageToRepay,
                interestAdded,
                cumulativeInterest,
                mortgageToRepay
            );

            mortgageToRepay = monthDataItem.remaining;
            monthData.push(monthDataItem);

        }

        return monthData;
    }
}
