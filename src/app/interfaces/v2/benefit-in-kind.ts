import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'app/services/utility.service';

import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';
import { TaxCredit } from './tax-credit';

export class BenefitInKind extends FormWithErrors {
    constructor(
        private _id: string = null,
        public name: string = null,
        public amount: number = null,
        public taxCredit: TaxCredit = null
    ) {
        super();
        this._id = this._id || UtilityService.newID('bik');
    }

    get id(): string {
        return this._id;
    }

    static healthInsurance(amount: number = null): BenefitInKind {
        return new BenefitInKind(
            'bik_healthins',
            'Health Insurance',
            amount,
            TaxCredit.medicalInsurance()
        );
    }

    static custom(): BenefitInKind {
        return new BenefitInKind(null, 'Custom');
    }

    static create(model: BenefitInKind): BenefitInKind {
        if (model == null) {
            return null;
        }

        return new BenefitInKind(
            model._id,
            model.name,
            model.amount,
            TaxCredit.create(model.taxCredit)
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxCredit: this.taxCredit.toFormGroup(formBuilder),
        });
    }
}
