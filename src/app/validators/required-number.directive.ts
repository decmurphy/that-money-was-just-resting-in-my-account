import { AbstractControl, ValidationErrors } from '@angular/forms';

export function RequiredNumber(control: AbstractControl): ValidationErrors | null {
    const invalid = isNaN(+control.value);
    return invalid ? { NaN: { value: control.value } } : null;
}
