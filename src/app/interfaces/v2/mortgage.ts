import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class Mortgage extends FormWithErrors {

    deposit: number;
    amount: number;
    monthlyRepayments: number;

    constructor(
        public value: number = 500000,
        public ltv: number = 90,
        public startAfterMonth: number = 0,
        public term: number = 25,
        public aprc: number = 3.2,
        public htb: number = 0,
        public overpaymentPct: number = 0
    ) {
        super();
        this.deposit = this.value * (100 - this.ltv) / 100.0 - this.htb;
        this.amount = this.value - (this.deposit + this.htb);
    }

    static create(model: Mortgage): Mortgage {
        if (model == null) {
            return new Mortgage();
        }
        return new Mortgage(
            model.value,
            model.ltv,
            model.startAfterMonth,
            model.term,
            model.aprc,
            model.htb,
            model.overpaymentPct
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            startAfterMonth: [
                this.startAfterMonth,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            value: [
                this.value,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(10e6)],
            ],
            ltv: [
                this.ltv,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(90)],
            ],
            term: [
                this.term,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(5),
                    Validators.max(35),
                ],
            ],
            aprc: [
                this.aprc,
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
            overpaymentPct: [
                this.overpaymentPct,
                [Validators.required, RequiredNumber, Validators.min(0), Validators.max(10)],
            ],
        });
    }
}
