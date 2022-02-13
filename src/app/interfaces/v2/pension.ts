import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { PensionSummary } from './pension-summary';
import { TaxRelief } from './tax-relief';

export class Pension extends FormWithErrors {
    constructor(
        public name: string = null,
        public taxRelief: TaxRelief = null,
        public personalContribPercent: number = null,
        public employerContribPercent: number = null,
        public annualGrowthRate: number = null, // can use this on the UI to simulate pension growth over time
        public summary: PensionSummary = new PensionSummary()
    ) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            taxRelief: this.taxRelief.toFormGroup(formBuilder),
            personalContribPercent: [
                this.personalContribPercent,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            employerContribPercent: [
                this.employerContribPercent,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            annualGrowthRate: [
                this.annualGrowthRate,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(-10),
                    Validators.max(10),
                ],
            ],
            summary: this.summary.toFormGroup(formBuilder),
        });
    }

    static getTaxFreeAllowancePercentage(taxpayerAge: number) {
        if (taxpayerAge >= 60) {
            return 40;
        } else if (taxpayerAge >= 55) {
            return 35;
        } else if (taxpayerAge >= 50) {
            return 30;
        } else if (taxpayerAge >= 40) {
            return 25;
        } else if (taxpayerAge >= 30) {
            return 20;
        } else {
            return 15;
        }
    }

    static contributory(
        employeeContribution: number,
        employerContribution: number
    ): Pension {
        return new Pension(
            'Contributory Occupational Pension',
            TaxRelief.incomeTaxRelief(),
            employeeContribution / 100,
            employerContribution / 100
        );
    }

    static nonContributory(employerContribution: number): Pension {
        return new Pension(
            'Non-Contributory Occupational Pension',
            TaxRelief.incomeTaxRelief(),
            0,
            employerContribution / 100
        );
    }

    static prsa(): Pension {
        return new Pension('PRSA', TaxRelief.incomeTaxRelief(), 0, 0);
    }

    static rac(): Pension {
        return new Pension('RAC', TaxRelief.incomeTaxRelief(), 0, 0);
    }

    static taxExemptPension(): Pension {
        return new Pension(
            'Tax Exempt Pension',
            TaxRelief.fullExemption(),
            0,
            0
        );
    }

    static occupationalPension(): Pension {
        return new Pension('Occupational Pension');
    }
}
