import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";
import { FormErrorProvider } from "../interfaces/form-error-provider";
import { Formable } from "../interfaces/formable";

export class KeyVal implements Formable {

    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public key: string = null,
        public value: string = null
    ) {
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group(this);
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

}
