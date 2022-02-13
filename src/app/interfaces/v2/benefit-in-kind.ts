import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { TaxCredit } from './tax-credit';

export class BenefitInKind extends FormWithErrors {
    constructor(
        public name: string = null,
        public amount: number = null,
        public taxCredit: TaxCredit = null
    ) {
        super();
    }

    static healthInsurance(amount: number = null): BenefitInKind {
        return new BenefitInKind(
            'Health Insurance',
            amount,
            TaxCredit.medicalInsurance(Math.min(200, 0.2 * amount))
        );
    }

    static create(model: BenefitInKind): BenefitInKind {
        if (model == null) {
            return null;
        }

        return new BenefitInKind(model.name, model.amount);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxCredit: this.taxCredit.toFormGroup(formBuilder),
        });
    }
}
