import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class TaxCredit extends FormWithErrors {
    constructor(public name: string = null, public amount: number = null) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    static singlePerson(): TaxCredit {
        return new TaxCredit('Single Person', 1700);
    }

    static marriedOrCivilPartner(): TaxCredit {
        return new TaxCredit('Married Person or Civil Partner', 3400);
    }

    static paye(): TaxCredit {
        return new TaxCredit('PAYE Employee', 1700);
    }

    static medicalInsurance(amount: number): TaxCredit {
        return new TaxCredit('Medical Insurance Tax Relief', amount);
    }
}
