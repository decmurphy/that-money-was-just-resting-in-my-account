import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class Mortgage extends FormWithErrors {
    constructor(
        public startAfterMonth: number = 0,
        public deposit: number = 30000,
        public amount: number = 300000,
        public aprc: number = 3.4,
        public monthlyRepayments: number = 2000,
        public htb: number = 30000
    ) {
        super();
    }

    static create(model: Mortgage): Mortgage {
        if (model == null) {
            return new Mortgage();
        }
        return new Mortgage(
            model.startAfterMonth,
            model.deposit,
            model.amount,
            model.aprc,
            model.monthlyRepayments,
            model.htb
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            startAfterMonth: [
                this.startAfterMonth,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            deposit: [
                this.deposit,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            aprc: [
                this.aprc,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            monthlyRepayments: [
                this.monthlyRepayments,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            htb: [
                this.htb,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(0),
                    Validators.max(30000),
                ],
            ],
        });
    }
}
