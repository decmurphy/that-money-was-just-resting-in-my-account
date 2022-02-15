import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class NamedAmount extends FormWithErrors {
    constructor(public name: string = null, public amount: number = null) {
        super();
    }

    static create(model: NamedAmount): NamedAmount {
        if (model == null) {
            return new NamedAmount();
        }
        return new NamedAmount(model.name, model.amount);
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
}
