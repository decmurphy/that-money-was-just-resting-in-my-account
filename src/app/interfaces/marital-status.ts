import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormErrorProvider } from "./form-error-provider";
import { Formable } from "./formable";

export class MaritalStatus implements Formable {

    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public married: boolean = false,
        public assessmentMode: string = '0',
        public isAssessor: boolean = false
    ) {
    }

    static create(ms: MaritalStatus): MaritalStatus {
        if (ms == null) {
            return new MaritalStatus();
        }
        return new MaritalStatus(
            ms.married,
            ms.assessmentMode,
            ms.isAssessor
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            married: [this.married, [Validators.required]],
            assessmentMode: [this.assessmentMode, [Validators.required]],
            isAssessor: [this.isAssessor, [Validators.required]],
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

}
