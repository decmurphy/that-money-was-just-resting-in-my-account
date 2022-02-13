import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormErrorProvider } from 'app/interfaces/forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';

export class NamedAmount implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(public name: string = null, public amount: number = null) {}

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

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }
}
