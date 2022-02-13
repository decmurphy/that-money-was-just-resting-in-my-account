import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { FormErrorProvider } from 'app/interfaces/forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';
import { RequiredNumber } from 'app/validators/required-number.directive';

export class Mortgage implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public amount: number = 300000,
        public aprc: number = 3.4,
        public monthlyRepayments: number = 2000
    ) {}

    static create(model: Mortgage): Mortgage {
        if (model == null) {
            return new Mortgage();
        }
        return new Mortgage(model.amount, model.aprc, model.monthlyRepayments);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            aprc: [
                this.aprc,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            monthlyRepayments: [
                this.monthlyRepayments,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }
}
