import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class TaxPayable extends FormWithErrors {
    constructor(
        public gross: number = null,
        public net: number = null,
        public usc: number = null,
        public prsi: number = null,
        public incomeTax: number = null
    ) {
        super();
    }

    static gross(gross: number): TaxPayable {
        return new TaxPayable(gross);
    }

    static create(model: TaxPayable): TaxPayable {
        if (model == null) {
            return new TaxPayable();
        }
        return new TaxPayable(model.usc, model.prsi, model.incomeTax);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            gross: [
                this.gross,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            net: [
                this.net,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
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
        });
    }
}
