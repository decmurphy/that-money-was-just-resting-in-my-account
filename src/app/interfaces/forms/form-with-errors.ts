import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FormErrorProviderV2 } from './form-error-provider-v2';
import { Formable } from './formable';

export abstract class FormWithErrors implements Formable {
    getError(control: AbstractControl): string {
        return FormErrorProviderV2.getError(control);
    }
    abstract toFormGroup(formBuilder: FormBuilder): FormGroup;
}
