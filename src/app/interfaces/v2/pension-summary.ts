import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class PensionSummary extends FormWithErrors {
    constructor(public amount: number = null) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }
}
