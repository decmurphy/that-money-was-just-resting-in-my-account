import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'app/services/utility.service';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { PensionSummary } from './pension-summary';
import { TaxRelief } from './tax-relief';

export class Pension extends FormWithErrors {
    constructor(
        private _id: string = null,
        public name: string = null,
        public taxRelief: TaxRelief = null,
        public personalContribPercent: number = null,
        public employerContribPercent: number = null,
        public maxTaxFree: boolean = false,
        public annualGrowthRate: number = 0, // can use this on the UI to simulate pension growth over time
        public summary: PensionSummary = new PensionSummary()
    ) {
        super();
        this._id = this._id || UtilityService.newID('pensn');
    }

    get id(): string {
        return this._id;
    }

    calculateContributions(ageThisYear: number): void {
        if (this.maxTaxFree) {
            const taxFreeAllowance =
                Pension.getTaxFreeAllowancePercentage(ageThisYear);
            switch (this._id) {
                case 'pensn_occptnl__':
                    this.personalContribPercent = taxFreeAllowance;
                    break;
                case 'pensn_prsa_____':
                    this.personalContribPercent =
                        taxFreeAllowance - this.employerContribPercent;
                    break;
                case 'pensn_rac______':
                    this.personalContribPercent = taxFreeAllowance;
                    break;
                default:
                    throw new Error(`Unknown Pension - id=${this._id}`);
            }
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            taxRelief: this.taxRelief.toFormGroup(formBuilder),
            personalContribPercent: [
                this.personalContribPercent,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(0),
                    Validators.max(40),
                ],
            ],
            employerContribPercent: [
                this.employerContribPercent,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(0),
                    Validators.max(40),
                ],
            ],
            maxTaxFree: [this.maxTaxFree],
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

    static create(model: Pension): Pension {
        if (model == null) {
            return null;
        }

        return new Pension(
            model._id,
            model.name,
            TaxRelief.create(model.taxRelief),
            model.personalContribPercent,
            model.employerContribPercent,
            model.maxTaxFree,
            model.annualGrowthRate,
            PensionSummary.create(model.summary)
        );
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

    // static contributory(
    //     employeeContribution: number,
    //     employerContribution: number
    // ): Pension {
    //     return new Pension(
    //         'pensn_contribut',
    //         'Contributory Pension',
    //         TaxRelief.incomeTaxRelief(),
    //         employeeContribution,
    //         employerContribution
    //     );
    // }

    // static nonContributory(employerContribution: number): Pension {
    //     return new Pension(
    //         'pensn_noncontri',
    //         'Non-Contributory Pension',
    //         TaxRelief.incomeTaxRelief(),
    //         0,
    //         employerContribution
    //     );
    // }

    static occupational(employerContribution: number): Pension {
        return new Pension(
            'pensn_occptnl__',
            'Occupational',
            TaxRelief.incomeTaxRelief(),
            0,
            employerContribution
        );
    }

    static prsa(): Pension {
        return new Pension(
            'pensn_prsa_____',
            'PRSA',
            TaxRelief.incomeTaxRelief(),
            0,
            0
        );
    }

    static rac(): Pension {
        return new Pension(
            'pensn_rac______',
            'RAC',
            TaxRelief.incomeTaxRelief(),
            0,
            0
        );
    }

    // static none(): Pension {
    //     return new Pension(
    //         'pensn_nopension',
    //         'No Pension',
    //         TaxRelief.noRelief(),
    //         0,
    //         0
    //     );
    // }

    // static taxExemptPension(): Pension {
    //     return new Pension(
    //         'pensn_taxexempt',
    //         'Tax Exempt Pension',
    //         TaxRelief.fullExemption(),
    //         0,
    //         0
    //     );
    // }

    // static custom(): Pension {
    //     return new Pension(null, 'Custom');
    // }
}
