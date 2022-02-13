import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
} from '@angular/forms';
import { FormErrorProvider } from '../forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';
import { NamedAmount } from 'app/interfaces/v1/named-amount';

export class Expenditures implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        // public monthly: number = 1000,
        // public yearly: number = 1000,
        public monthlyItems: NamedAmount[] = [],
        public yearlyItems: NamedAmount[] = []
    ) {}

    static create(model: Expenditures): Expenditures {
        if (model == null) {
            return new Expenditures();
        }
        return new Expenditures(
            model.monthlyItems.map((item) => NamedAmount.create(item)),
            model.yearlyItems.map((item) => NamedAmount.create(item))
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            monthlyItems: new FormArray(
                this.monthlyItems.map((item) => item.toFormGroup(formBuilder))
            ),
            yearlyItems: new FormArray(
                this.yearlyItems.map((item) => item.toFormGroup(formBuilder))
            ),
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }
}
