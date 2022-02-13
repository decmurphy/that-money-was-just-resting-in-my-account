import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormWithErrors } from '../forms/form-with-errors';
import { Tax } from '../tax/tax';
import { TaxBand } from '../tax/tax-band';
import { BenefitInKind } from './benefit-in-kind';
import { Income } from './income';
import { Pension } from './pension';

export class Employment extends FormWithErrors {
    constructor(
        public paye: boolean,
        public income: Income,
        public pension: Pension,
        public benefitInKind: BenefitInKind[]
    ) {
        super();
    }

    getAllBIKs(): number {
        return this.benefitInKind
            .map((bik) => bik.amount)
            .reduce((acc, cur) => acc + cur, 0.0);
    }

    calculateTaxAndPension(
        incomeTaxBands: TaxBand[],
        ageThisYear: number
    ): void {
        /*
            Pension
            Calculate Age-limited and Total Earnings-limited income tax relief for pensions
        */
        const pensionTaxFreeAllowance = Math.min(
            (Math.min(this.income.taxPayable.gross, 115000) *
                Pension.getTaxFreeAllowancePercentage(ageThisYear)) /
                100.0
        );

        /*
            How much to deduct from Gross Pay for purposes of NET income only
        */
        const pensionDeduction =
            this.pension.personalContribPercent * this.income.taxPayable.gross;

        /*
            How much to add to Pension fund for this year. 
            Tax payable also gets calculated on this amount.
        */
        const totalPensionContribution =
            (this.pension.personalContribPercent +
                this.pension.employerContribPercent) *
            this.income.taxPayable.gross;

        /*
            Apply the tax-free limit to see how much of the pension payments are taxable
        */
        const pensionContributionsWithIncomeTaxRelief = Math.min(
            totalPensionContribution,
            pensionTaxFreeAllowance
        );

        /*
            Gross + BIKs + Employer Pension Contribs
        */
        const taxableIncome =
            this.income.taxPayable.gross +
            this.getAllBIKs() +
            totalPensionContribution -
            pensionDeduction;

        /*
            Income Tax
        */
        this.income.taxPayable.incomeTax = Tax.getTaxPayable(
            taxableIncome - pensionContributionsWithIncomeTaxRelief,
            incomeTaxBands
        );

        /*
            PRSI
        */
        this.income.taxPayable.prsi = Tax.getTaxPayable(
            taxableIncome,
            Tax.prsiBands
        );

        /*
            USC
        */
        this.income.taxPayable.usc = Tax.getTaxPayable(
            taxableIncome,
            Tax.uscBands
        );

        /*
            Pension
        */
        this.pension.summary.amount = totalPensionContribution;

        this.income.taxPayable.net =
            this.income.taxPayable.gross -
            this.income.taxPayable.usc -
            this.income.taxPayable.incomeTax -
            this.income.taxPayable.prsi -
            pensionDeduction;
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            paye: [this.paye, [Validators.required]],
            income: this.income.toFormGroup(formBuilder),
            pension: this.pension.toFormGroup(formBuilder),
            benefitInKind: new FormArray(
                this.benefitInKind.map((bik) => bik.toFormGroup(formBuilder))
            ),
        });
    }
}
