import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NamedAmount } from 'app/interfaces/v2/named-amount';
import { UtilityService } from 'app/services/utility.service';
import { FormWithErrors } from '../forms/form-with-errors';

export class Expenditures extends FormWithErrors {
    constructor(
        private _id: string = null,
        public monthlyItems: NamedAmount[] = [],
        public yearlyItems: NamedAmount[] = [],
        public onceOffItems: {
            amount: NamedAmount,
            monthIdx: number
        }[] = []
    ) {
        super();
        this._id = this._id || UtilityService.newID('exp');
    }

    get id(): string {
        return this._id;
    }

    static create(model: Expenditures): Expenditures {
        if (model == null) {
            return new Expenditures();
        }
        return new Expenditures(
            model._id,
            model.monthlyItems.map((item) => NamedAmount.create(item)),
            model.yearlyItems.map((item) => NamedAmount.create(item)),
            (model.onceOffItems || []).map((item) => ({ amount: NamedAmount.create(item.amount), monthIdx: item.monthIdx }) )
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            monthlyItems: new FormArray(
                this.monthlyItems.map((item) => item.toFormGroup(formBuilder))
            ),
            yearlyItems: new FormArray(
                this.yearlyItems.map((item) => item.toFormGroup(formBuilder))
            ),
        });
    }
}
