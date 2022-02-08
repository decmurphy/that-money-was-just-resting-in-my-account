import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormErrorProvider } from "app/shared/http/flight-club/interfaces/form-error-provider";
import { Formable } from "app/shared/http/flight-club/interfaces/formable";
import { RequiredNumber } from "app/shared/validators/required-number.directive";

export class Income implements Formable {

    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public gross: number = 40000,
        public net: number = null
    ) {
    }

    static create(model: Income): Income {
        if (model == null) {
            return new Income();
        }
        return new Income(
            model.gross,
            model.net
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            gross: [this.gross, [Validators.required, RequiredNumber, Validators.min(0)]],
            net: [this.gross, [Validators.required, RequiredNumber, Validators.min(0)]]
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

}
