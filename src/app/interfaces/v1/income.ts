import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { FormErrorProvider } from 'app/interfaces/forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { SupplementaryIncome } from 'app/interfaces/v1/supplementary-income';

export class Income implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public gross: number = 40000,
        public net: number = null,
        public supplementary: SupplementaryIncome[] = []
    ) {}

    static create(model: Income): Income {
        if (model == null) {
            return new Income();
        }
        return new Income(model.gross, model.net);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            gross: [
                this.gross,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            supplementary: new FormArray(
                (this.supplementary || []).map((s) =>
                    s.toFormGroup(formBuilder)
                )
            ),
            net: [
                this.gross,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }
}
