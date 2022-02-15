import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class TaxReliefItem extends FormWithErrors {
    constructor(
        public reliefIsProvided: boolean = false,
        public amount: number = 0,
        public reliefAppliesIfExceeded: boolean = true
    ) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            reliefIsProvided: [this.reliefIsProvided, [Validators.required]],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            reliefAppliesIfExceeded: [
                this.reliefAppliesIfExceeded,
                [Validators.required],
            ],
        });
    }

    static create(model: TaxReliefItem): TaxReliefItem {
        if (model == null) {
            return null;
        }

        return new TaxReliefItem(
            model.reliefIsProvided,
            model.amount,
            model.reliefAppliesIfExceeded
        );
    }

    static noRelief(): TaxReliefItem {
        return new TaxReliefItem(false, 0);
    }

    static relief(
        amount: number,
        reliefAppliesIfExceeded = true
    ): TaxReliefItem {
        return new TaxReliefItem(true, amount, reliefAppliesIfExceeded);
    }
}
