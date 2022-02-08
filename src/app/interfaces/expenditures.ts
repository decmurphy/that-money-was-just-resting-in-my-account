import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormErrorProvider } from "app/shared/http/flight-club/interfaces/form-error-provider";
import { Formable } from "app/shared/http/flight-club/interfaces/formable";
import { RequiredNumber } from "app/shared/validators/required-number.directive";

export class Expenditures implements Formable {

    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public monthly: number = 1000,
        public yearly: number = 1000
    ) {
    }

    static create(model: Expenditures): Expenditures {
        if (model == null) {
            return new Expenditures();
        }
        return new Expenditures(
            model.monthly,
            model.yearly
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            monthly: [this.monthly, [Validators.required, RequiredNumber, Validators.min(0)]],
            yearly: [this.yearly, [Validators.required, RequiredNumber, Validators.min(0)]],
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

}
