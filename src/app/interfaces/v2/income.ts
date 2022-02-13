import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormWithErrors } from '../forms/form-with-errors';
import { TaxPayable } from './tax-payable';
import { TaxRelief } from './tax-relief';

export class Income extends FormWithErrors {
    constructor(
        public name: string = null,
        public taxPayable: TaxPayable = new TaxPayable(),
        public taxRelief: TaxRelief = new TaxRelief(),
        public info: string = null
    ) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            taxPayable: this.taxPayable.toFormGroup(formBuilder),
            taxRelief: this.taxRelief.toFormGroup(formBuilder),
            info: [this.info],
        });
    }

    static paye(gross?: number): Income {
        return new Income(
            'PAYE Income',
            TaxPayable.gross(gross),
            TaxRelief.noRelief()
        );
    }

    static rentARoom(gross?: number): Income {
        return new Income(
            'Rent A Room',
            TaxPayable.gross(gross),
            TaxRelief.incomeTaxRelief(14000, false),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/index.aspx'
        );
    }

    static artistExemption(gross?: number): Income {
        return new Income(
            'Artistic Works Sales',
            TaxPayable.gross(gross),
            TaxRelief.incomeTaxRelief(50000),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/artists-exemption/index.aspx'
        );
    }

    static woodlandsExemption(gross?: number): Income {
        return new Income(
            'Woodlands',
            TaxPayable.gross(gross),
            TaxRelief.incomeTaxRelief(Infinity),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/woodlands/index.aspx'
        );
    }
}
