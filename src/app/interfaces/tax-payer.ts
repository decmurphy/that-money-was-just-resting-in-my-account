import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { FormErrorProvider } from './form-error-provider';
import { Formable } from './formable';
import { RequiredNumber } from '../validators/required-number.directive';
import { Income } from './income';
import { MaritalStatus } from './marital-status';
import { Pension } from './pension';
import { Tax } from './tax';
import { TaxPayable } from './tax-payable';

export class TaxPayer implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public name: string = null,
        public yearOfBirth: number = null,
        public income: Income = new Income(),
        public pension: Pension = new Pension(),
        public paye: boolean = true,
        public maritalStatus: MaritalStatus = new MaritalStatus(),
        public taxPayable: TaxPayable = new TaxPayable()
    ) {}

    static create(tp: TaxPayer): TaxPayer {
        if (tp == null) {
            return null;
        }

        return new TaxPayer(
            tp.name,
            tp.yearOfBirth,
            Income.create(tp.income),
            Pension.create(tp.pension),
            tp.paye,
            MaritalStatus.create(tp.maritalStatus),
            TaxPayable.create(tp.taxPayable)
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            yearOfBirth: [
                this.yearOfBirth,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(1900),
                    Validators.max(2030),
                ],
            ],
            income: this.income.toFormGroup(formBuilder),
            pension: this.pension.toFormGroup(formBuilder),
            paye: [this.paye, [Validators.required]],
            maritalStatus: this.maritalStatus.toFormGroup(formBuilder),
            taxPayable: this.taxPayable.toFormGroup(formBuilder),
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

    maxAllowablePensionPercentage(year: number): number {
        const ageThisYear = year - this.yearOfBirth;
        if (ageThisYear >= 60) {
            return 40;
        } else if (ageThisYear >= 55) {
            return 35;
        } else if (ageThisYear >= 50) {
            return 30;
        } else if (ageThisYear >= 40) {
            return 25;
        } else if (ageThisYear >= 30) {
            return 20;
        } else {
            return 15;
        }
    }

    calculatePensionContribution(year: number): void {
        let pensionPercentage;
        if (this.pension.max) {
            pensionPercentage = this.maxAllowablePensionPercentage(year);
        } else {
            pensionPercentage = Math.min(
                this.maxAllowablePensionPercentage(year),
                this.pension.percentage
            );
        }
        this.pension.amount =
            (Math.min(this.income.gross, 115000) * pensionPercentage) / 100.0;
    }

    calculateNetIncome(): void {
        this.taxPayable.usc = this.getUSCChargeable();
        this.taxPayable.prsi = this.getPRSIChargeable();
        this.taxPayable.taxCredits = this.getTaxCredits();

        /*
            Tax Credits can't give you negative income tax!
        */
        const grossTax =
            this.taxPayable.usc +
            this.taxPayable.prsi +
            Math.max(0, this.taxPayable.incomeTax - this.taxPayable.taxCredits);
        this.income.net = this.income.gross - grossTax - this.pension.amount;
    }

    getTaxCredits(): number {
        let taxCredits = 0;

        if (this.maritalStatus.married) {
            // married tax credits
            switch (+this.maritalStatus.assessmentMode) {
                case 0:
                    taxCredits += this.maritalStatus.isAssessor ? 3400 : 0;
                    break;
                case 1:
                    taxCredits += 1700;
                    break; // can be shared though. not sure how to deal with this
                case 2:
                    taxCredits += 1700;
                    break;
            }
        } else {
            // single person tax credit
            taxCredits += 1700;
        }

        // paye tax credit
        if (this.paye) {
            taxCredits += 1700;
        }

        return taxCredits;
    }

    getUSCChargeable(): number {
        return Tax.getTaxPayable(this.income.gross, Tax.usc);
    }

    getPRSIChargeable(): number {
        return Tax.getTaxPayable(this.income.gross, Tax.prsi);
    }

    /*
        Don't forget to remove pension contrib from income before calculating income tax
    */
    getIncomeTaxChargeable_Single(): number {
        const bracket = Tax.incomeTax.single;
        return Tax.getTaxPayable(
            this.income.gross - this.pension.amount,
            bracket.bands
        );
    }

    /*
        Don't forget to remove pension contrib from income before calculating income tax
    */
    static getIncomeTaxChargeable_JointAssessed(
        taxpayer1: TaxPayer,
        taxpayer2: TaxPayer
    ): number[] {
        const brackets = Tax.incomeTax.married;

        const band1 =
            taxpayer1.income.gross >= taxpayer2.income.gross
                ? brackets.assessor.bands
                : brackets.lower.bands;
        const band2 =
            taxpayer1.income.gross < taxpayer2.income.gross
                ? brackets.assessor.bands
                : brackets.lower.bands;

        const incomeTax1 = Tax.getTaxPayable(
            taxpayer1.income.gross - taxpayer1.pension.amount,
            band1
        );
        const incomeTax2 = Tax.getTaxPayable(
            taxpayer2.income.gross - taxpayer2.pension.amount,
            band2
        );

        return [incomeTax1, incomeTax2];
    }
}
