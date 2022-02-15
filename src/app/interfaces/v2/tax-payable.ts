import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class TaxPayable extends FormWithErrors {
    constructor(
        public usc: number = null,
        public prsi: number = null,
        public incomeTax: number = null,
        public taxCreditsUsed: number = null
    ) {
        super();
    }

    static create(model: TaxPayable): TaxPayable {
        if (model == null) {
            return new TaxPayable();
        }
        return new TaxPayable(
            model.usc,
            model.prsi,
            model.incomeTax,
            model.taxCreditsUsed
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            usc: [
                this.usc,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            prsi: [
                this.prsi,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            incomeTax: [
                this.incomeTax,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxCreditsUsed: [
                this.taxCreditsUsed,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }
}
