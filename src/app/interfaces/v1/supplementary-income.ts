import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormErrorProvider } from 'app/interfaces/forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';

export class SupplementaryIncome implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public name: string = null,
        public amount: number = null,
        public taxFreeAmount: number = null
    ) {}

    static create(model: SupplementaryIncome): SupplementaryIncome {
        if (model == null) {
            return new SupplementaryIncome();
        }
        return new SupplementaryIncome(
            model.name,
            model.amount,
            model.taxFreeAmount
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxFreeAmount: [
                this.taxFreeAmount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }
}
