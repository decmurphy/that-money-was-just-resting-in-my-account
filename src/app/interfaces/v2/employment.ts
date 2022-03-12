import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'app/services/utility.service';
import { FormWithErrors } from '../forms/form-with-errors';
import { Tax } from '../tax/tax';
import { TaxBand } from '../tax/tax-band';
import { BenefitInKind } from './benefit-in-kind';
import { Income } from './income';
import { Pension } from './pension';

export class Employment extends FormWithErrors {
    constructor(
        private _id: string = null,
        public paye: boolean = false,
        public income: Income = new Income(),
        public pension: Pension = new Pension(),
        public ancillary: Income[] = [],
        public benefitInKind: BenefitInKind[] = []
    ) {
        super();
        this._id = this._id || UtilityService.newID('empl');
    }

    get id(): string {
        return this._id;
    }

    static unemployed(): Employment {
        return new Employment('empl_unemploye', false, Income.none(), null);
    }

    getAllBIKs(): number {
        return UtilityService.sum(this.benefitInKind.map((bik) => bik.amount));
    }

    calculateTaxAndPension(
        incomeTaxBands: TaxBand[],
        ageThisYear: number
    ): void {
        /*
            Calculate Age-limited and Total Earnings-limited income tax relief for pensions
        */
        const pensionTaxFreeAllowance =
            (Math.min(this.income.gross, 115000) *
                Pension.getTaxFreeAllowancePercentage(ageThisYear)) /
            100.0;

        /*
            Pension
        */
        let employeeContribWithTaxRelief = 0,
            employerContribWithTaxRelief = 0;

        let employerContrib = 0,
            employeeContrib = 0;
        if (this.pension) {
            this.pension.calculateContributions(ageThisYear);

            /*
                How much to add to Pension fund for this year. 
                Tax payable also gets calculated on this amount.
            */
            employerContrib =
                (this.pension.employerContribPercent * this.income.gross) / 100;
            employeeContrib =
                (this.pension.personalContribPercent * this.income.gross) / 100;

            switch (this.pension.id) {
                case 'pensn_occptnl__':
                case 'pensn_rac______':
                    employeeContribWithTaxRelief = Math.min(
                        employeeContrib,
                        pensionTaxFreeAllowance
                    );
                    employerContribWithTaxRelief = employerContrib;
                    break;
                case 'pensn_prsa_____':
                    employeeContribWithTaxRelief = Math.min(
                        employeeContrib,
                        pensionTaxFreeAllowance
                    );
                    employerContribWithTaxRelief = Math.min(
                        employerContrib,
                        Math.max(
                            0,
                            pensionTaxFreeAllowance -
                                employeeContribWithTaxRelief
                        )
                    );
                    break;
                default:
                    throw new Error(`Unknown Pension - id=${this._id}`);
            }
        }

        /*
            Gross + BIKs + Taxable Employee Pension Contribs
        */
        const taxableIncome = this.income.gross + this.getAllBIKs();

        /*
            Income Tax
        */
        this.income.taxPayable.incomeTax = Tax.getTaxPayable(
            taxableIncome -
                (employerContrib - employerContribWithTaxRelief) -
                employeeContribWithTaxRelief,
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
        if (this.pension) {
            this.pension.summary.amount = employerContrib + employeeContrib;
        }

        this.income.net =
            this.income.gross -
            this.income.taxPayable.usc -
            this.income.taxPayable.incomeTax -
            this.income.taxPayable.prsi -
            employeeContrib;
    }

    static create(model: Employment): Employment {
        if (model == null) {
            return null;
        }

        return new Employment(
            model._id,
            model.paye,
            Income.create(model.income),
            Pension.create(model.pension),
            model.ancillary.map((i) => Income.create(i)),
            model.benefitInKind.map((bik) => BenefitInKind.create(bik))
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            paye: [this.paye, [Validators.required]],
            income: this.income.toFormGroup(formBuilder),
            pension: this.pension?.toFormGroup(formBuilder),
            ancillary: new FormArray(
                this.ancillary.map((i) => i.toFormGroup(formBuilder))
            ),
            benefitInKind: new FormArray(
                this.benefitInKind.map((bik) => bik.toFormGroup(formBuilder))
            ),
        });
    }
}
