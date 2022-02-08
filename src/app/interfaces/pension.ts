import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormErrorProvider } from "app/shared/http/flight-club/interfaces/form-error-provider";
import { Formable } from "app/shared/http/flight-club/interfaces/formable";
import { RequiredNumber } from "app/shared/validators/required-number.directive";

export class Pension implements Formable {

    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public percentage: number = 15,
        public amount: number = null,
        public max: boolean = false
    ) {
    }

    static create(model: Pension): Pension {
        if (model == null) {
            return new Pension();
        }
        return new Pension(
            model.percentage,
            model.amount,
            model.max
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            percentage: [this.percentage, [RequiredNumber, Validators.min(0)]],
            amount: [this.amount, [RequiredNumber, Validators.min(0)]],
            max: [this.max]
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

}
