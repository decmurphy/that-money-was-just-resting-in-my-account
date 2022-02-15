import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormWithErrors } from '../forms/form-with-errors';

export class MaritalStatus extends FormWithErrors {
    constructor(
        public married: boolean = false,
        public assessmentMode: string = '0',
        public isAssessor: boolean = false
    ) {
        super();
    }

    static create(ms: MaritalStatus): MaritalStatus {
        if (ms == null) {
            return new MaritalStatus();
        }
        return new MaritalStatus(ms.married, ms.assessmentMode, ms.isAssessor);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            married: [this.married, [Validators.required]],
            assessmentMode: [this.assessmentMode, [Validators.required]],
            isAssessor: [this.isAssessor, [Validators.required]],
        });
    }

    getPersonalTaxCreditAmount(): number {
        if (this.married && this.assessmentMode === '0' && this.isAssessor) {
            return 3400;
        } else {
            return 1700;
        }
    }
}
