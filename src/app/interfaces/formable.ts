import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";

export interface Formable {
    toFormGroup(formBuilder: FormBuilder): FormGroup;
    getError(control: AbstractControl): string;
}