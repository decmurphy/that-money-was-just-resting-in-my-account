import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Expenditures } from 'app/interfaces/v2/expenditures';
import { MaritalStatus } from 'app/interfaces/v2/marital-status';
import { Mortgage } from 'app/interfaces/v2/mortgage';
import { Strategy } from 'app/interfaces/v2/strategy/strategy';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { FormWithErrors } from '../forms/form-with-errors';

export class FormData extends FormWithErrors {
    constructor(
        public taxpayers: TaxPayer[] = [new TaxPayer()],
        public maritalStatus: MaritalStatus = new MaritalStatus(),
        public expenditures: Expenditures = new Expenditures(),
        public mortgage: Mortgage = new Mortgage(),
        public strategy: Strategy = new Strategy()
    ) {
        super();
    }

    static create(fd: FormData): FormData {
        if (fd == null) {
            return null;
        }
        return new FormData(
            fd.taxpayers.map((tp) => TaxPayer.create(tp)),
            MaritalStatus.create(fd.maritalStatus),
            Expenditures.create(fd.expenditures),
            Mortgage.create(fd.mortgage),
            Strategy.create(fd.strategy)
        );
    }

    toFormGroup(fb: FormBuilder): FormGroup {
        return fb.group({
            taxpayers: new FormArray(
                this.taxpayers.map((tp) => tp.toFormGroup(fb))
            ),
            maritalStatus: this.maritalStatus.toFormGroup(fb),
            expenditures: this.expenditures.toFormGroup(fb),
            mortgage: this.mortgage.toFormGroup(fb),
            strategy: this.strategy.toFormGroup(fb),
        });
    }
}
