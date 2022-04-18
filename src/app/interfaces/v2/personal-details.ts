import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { MaritalStatus } from './marital-status';

export class PersonalDetails extends FormWithErrors {
    constructor(
        public name: string = null,
        public yearOfBirth: number = null,
        public maritalStatus: MaritalStatus = new MaritalStatus(),
        public initialSavings: number = 0,
        public initialPension: number = 0
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
            initialSavings: [
                this.initialSavings,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            initialPension: [
                this.initialPension,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    static create(model: PersonalDetails): PersonalDetails {
        if (model == null) {
            return null;
        }

        return new PersonalDetails(
            model.name,
            model.yearOfBirth,
            MaritalStatus.create(model.maritalStatus),
            model.initialSavings,
            model.initialPension
        );
    }
}
