import { AbstractControl } from "@angular/forms";

export class FormErrorProvider {

    getError(control: AbstractControl): string {

        if (control.hasError('required')) {
            return 'A value is required';
        }
        
        if (control.hasError('email')) {
            return 'Must be a valid email';
        }
        
        if (control.hasError('min')) {
            const error = control.errors['min'];
            return `Minimum allowable value is ${error.min}`;
        }
        
        if (control.hasError('max')) {
            const error = control.errors['max'];
            return `Maximum allowable value is ${error.max}`;
        }
        
        if (control.hasError('minlength')) {
            const error = control.errors['minlength'];
            return `Minimum allowable length is ${error.requiredLength}`;
        }
        
        if (control.hasError('maxlength')) {
            const error = control.errors['maxlength'];
            return `Maximum allowable length is ${error.requiredLength}`;
        }
        
        if (control.hasError('NaN')) {
            return 'Must be a number';
        }

        if (control.hasError('ZeroNorm')) {
            return 'Vector must have a non-zero norm';
        }

        if (control.hasError('ISO8601')) {
            return control.errors['ISO8601'];
        }

        return '';

    }

}