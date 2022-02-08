import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormErrorProvider } from "app/shared/http/flight-club/interfaces/form-error-provider";
import { Formable } from "app/shared/http/flight-club/interfaces/formable";
import { RequiredNumber } from "app/shared/validators/required-number.directive";

export class TaxPayable implements Formable {

    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public usc: number = null,
        public prsi: number = null,
        public incomeTax: number = null,
        public taxCredits: number = null,
    ) {
    }

    static create(model: TaxPayable): TaxPayable {
        if (model == null) {
            return new TaxPayable();
        }
        return new TaxPayable(
            model.usc,
            model.prsi,
            model.incomeTax,
            model.taxCredits
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            usc: [this.usc, [Validators.required, RequiredNumber, Validators.min(0)]],
            prsi: [this.prsi, [Validators.required, RequiredNumber, Validators.min(0)]],
            incomeTax: [this.incomeTax, [Validators.required, RequiredNumber, Validators.min(0)]],
            taxCredits: [this.taxCredits, [Validators.required, RequiredNumber, Validators.min(0)]],
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

}
