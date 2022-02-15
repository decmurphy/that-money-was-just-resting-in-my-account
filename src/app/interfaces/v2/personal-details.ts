import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { MaritalStatus } from './marital-status';

export class PersonalDetails extends FormWithErrors {
    constructor(
        public name: string = null,
        public yearOfBirth: number = null,
        public maritalStatus: MaritalStatus = new MaritalStatus()
    ) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            yearOfBirth: [
                this.yearOfBirth,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(1900),
                    Validators.max(2030),
                ],
            ],
            maritalStatus: this.maritalStatus.toFormGroup(formBuilder),
        });
    }

    static create(model: PersonalDetails): PersonalDetails {
        if (model == null) {
            return null;
        }

        return new PersonalDetails(
            model.name,
            model.yearOfBirth,
            MaritalStatus.create(model.maritalStatus)
        );
    }
}
