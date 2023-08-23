import { UtilityService } from "app/services/utility.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { FormWithErrors } from "../forms/form-with-errors";
import { RequiredNumber } from "app/validators/required-number.directive";

export class NamedAmount extends FormWithErrors {

    public constructor(
        private _id: string = null,
        public name: string = null,
        public amount: number = null
    ) {
        super();
        this._id = this._id || UtilityService.newID('namt');
    }

    get id(): string {
        return this._id;
    }

    static create(model: NamedAmount): NamedAmount {
        if (model == null) {
            return new NamedAmount();
        }
        return new NamedAmount(model._id, model.name, model.amount);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            amount: [
                this.amount,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

}
