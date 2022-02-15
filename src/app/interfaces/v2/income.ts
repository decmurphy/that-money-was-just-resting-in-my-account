import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'app/services/utility.service';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { Tax } from '../tax/tax';
import { TaxBand } from '../tax/tax-band';
import { TaxPayable } from './tax-payable';
import { TaxRelief } from './tax-relief';

export class Income extends FormWithErrors {
    constructor(
        private _id: string = null,
        public name: string = null,
        public gross: number = null,
        public taxRelief: TaxRelief = new TaxRelief(),
        public taxPayable: TaxPayable = new TaxPayable(),
        public info: string = null,
        public net: number = null,
        public editable: boolean = false
    ) {
        super();
        this._id = this._id || UtilityService.newID('inc');
    }

    get id(): string {
        return this._id;
    }

    calculateTax(incomeTaxBands: TaxBand[], gross = 0): void {
        let taxableIncome;
        /*
            Income Tax
        */
        taxableIncome = this.gross;
        if (this.taxRelief.it.reliefIsProvided) {
            if (
                this.taxRelief.it.reliefAppliesIfExceeded ||
                taxableIncome <= this.taxRelief.it.amount
            ) {
                taxableIncome = Math.max(
                    0,
                    this.gross - this.taxRelief.it.amount
                );
            }
        }
        this.taxPayable.incomeTax = Tax.getMarginalTaxPayable(
            taxableIncome,
            incomeTaxBands,
            gross
        );

        /*
            PRSI
        */
        taxableIncome = this.gross;
        if (this.taxRelief.prsi.reliefIsProvided) {
            if (
                this.taxRelief.prsi.reliefAppliesIfExceeded ||
                taxableIncome <= this.taxRelief.prsi.amount
            ) {
                taxableIncome = Math.max(
                    0,
                    this.gross - this.taxRelief.prsi.amount
                );
            }
        }
        this.taxPayable.prsi = Tax.getMarginalTaxPayable(
            taxableIncome,
            Tax.prsiBands,
            gross
        );

        /*
            USC
        */
        taxableIncome = this.gross;
        if (this.taxRelief.usc.reliefIsProvided) {
            if (
                this.taxRelief.usc.reliefAppliesIfExceeded ||
                taxableIncome <= this.taxRelief.usc.amount
            ) {
                taxableIncome = Math.max(
                    0,
                    this.gross - this.taxRelief.usc.amount
                );
            }
        }
        this.taxPayable.usc = Tax.getMarginalTaxPayable(
            taxableIncome,
            Tax.uscBands,
            gross
        );

        this.net =
            this.gross -
            this.taxPayable.usc -
            this.taxPayable.incomeTax -
            this.taxPayable.prsi;
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            gross: [
                this.gross,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxRelief: this.taxRelief.toFormGroup(formBuilder),
            taxPayable: this.taxPayable.toFormGroup(formBuilder),
            info: [this.info],
            net: [
                this.net,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            editable: [this.editable],
        });
    }

    static create(model: Income): Income {
        if (model == null) {
            return null;
        }

        return new Income(
            model._id,
            model.name,
            model.gross,
            TaxRelief.create(model.taxRelief),
            TaxPayable.create(model.taxPayable),
            model.info,
            model.net,
            model.editable
        );
    }

    static none(): Income {
        return new Income(
            'inc_none_____',
            'No Income',
            0,
            TaxRelief.noRelief()
        );
    }

    static paye(gross?: number): Income {
        return new Income(
            'inc_paye_____',
            'PAYE Income',
            gross,
            TaxRelief.noRelief()
        );
    }

    static rentARoom(gross?: number): Income {
        return new Income(
            'inc_rentaroom',
            'Rent A Room',
            gross,
            TaxRelief.incomeTaxRelief(14000, false),
            new TaxPayable(),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/index.aspx'
        );
    }

    static artistExemption(gross?: number): Income {
        return new Income(
            'inc_artistexe',
            'Artistic Works Sales',
            gross,
            TaxRelief.incomeTaxRelief(50000),
            new TaxPayable(),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/artists-exemption/index.aspx'
        );
    }

    static woodlandsExemption(gross?: number): Income {
        return new Income(
            'inc_woodlands',
            'Woodlands',
            gross,
            TaxRelief.incomeTaxRelief(Infinity),
            new TaxPayable(),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/woodlands/index.aspx'
        );
    }

    static overtime(gross?: number): Income {
        return new Income(
            'inc_overtime_',
            'Overtime',
            gross,
            TaxRelief.noRelief()
        );
    }

    static annualBonus(gross?: number): Income {
        return new Income(
            'inc_annlbonus',
            'Annual Bonus',
            gross,
            TaxRelief.noRelief()
        );
    }

    static custom(gross?: number): Income {
        const inc = new Income(null, 'Custom', gross, TaxRelief.noRelief());
        inc.editable = true;
        return inc;
    }
}
