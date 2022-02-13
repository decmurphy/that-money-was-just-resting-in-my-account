import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FormErrorProvider } from 'app/interfaces/forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';
import { Expenditures } from 'app/interfaces/v1/expenditures';
import { MaritalStatus } from 'app/interfaces/v1/marital-status';
import { Mortgage } from 'app/interfaces/v1/mortgage';
import { Strategy } from 'app/interfaces/v1/strategy';
import { TaxPayer } from 'app/interfaces/v1/tax-payer';

export class FormData implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    constructor(
        public tp1: TaxPayer = new TaxPayer(),
        public tp2: TaxPayer = null,
        public maritalStatus: MaritalStatus = new MaritalStatus(),
        public expenditures: Expenditures = new Expenditures(),
        public mortgage: Mortgage = new Mortgage(),
        public strategy: Strategy = new Strategy()
    ) {}

    static create(fd: FormData): FormData {
        return new FormData(
            TaxPayer.create(fd.tp1),
            TaxPayer.create(fd.tp2),
            MaritalStatus.create(fd.maritalStatus),
            Expenditures.create(fd.expenditures),
            Mortgage.create(fd.mortgage),
            Strategy.create(fd.strategy)
        );
    }

    toFormGroup(fb: FormBuilder): FormGroup {
        return fb.group({
            tp1: this.tp1.toFormGroup(fb),
            tp2: this.tp2 == null ? null : this.tp2.toFormGroup(fb),
            maritalStatus: this.maritalStatus.toFormGroup(fb),
            expenditures: this.expenditures.toFormGroup(fb),
            mortgage: this.mortgage.toFormGroup(fb),
            strategy: this.strategy.toFormGroup(fb),
        });
    }

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }
}
