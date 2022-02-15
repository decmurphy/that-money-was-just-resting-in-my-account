import { FormBuilder, FormGroup } from '@angular/forms';
import { FormWithErrors } from '../forms/form-with-errors';
import { TaxReliefItem } from './tax-relief-item';

export class TaxRelief extends FormWithErrors {
    constructor(
        public it: TaxReliefItem = new TaxReliefItem(),
        public usc: TaxReliefItem = new TaxReliefItem(),
        public prsi: TaxReliefItem = new TaxReliefItem()
    ) {
        super();
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            it: this.it.toFormGroup(formBuilder),
            usc: this.usc.toFormGroup(formBuilder),
            prsi: this.prsi.toFormGroup(formBuilder),
        });
    }

    static create(model: TaxRelief): TaxRelief {
        if (model == null) {
            return null;
        }

        return new TaxRelief(
            TaxReliefItem.create(model.it),
            TaxReliefItem.create(model.usc),
            TaxReliefItem.create(model.prsi)
        );
    }

    static noRelief(): TaxRelief {
        return new TaxRelief(
            TaxReliefItem.noRelief(),
            TaxReliefItem.noRelief(),
            TaxReliefItem.noRelief()
        );
    }

    static fullExemption(): TaxRelief {
        return new TaxRelief(
            TaxReliefItem.relief(Infinity),
            TaxReliefItem.relief(Infinity),
            TaxReliefItem.relief(Infinity)
        );
    }

    static incomeTaxRelief(
        amount = Infinity,
        reliefAppliesIfExceeded = true
    ): TaxRelief {
        return new TaxRelief(
            TaxReliefItem.relief(amount, reliefAppliesIfExceeded),
            TaxReliefItem.noRelief(),
            TaxReliefItem.noRelief()
        );
    }

    static uscRelief(uscAmount = Infinity): TaxRelief {
        return new TaxRelief(
            TaxReliefItem.noRelief(),
            TaxReliefItem.relief(uscAmount),
            TaxReliefItem.noRelief()
        );
    }

    static prsiRelief(prsiAmount = Infinity): TaxRelief {
        return new TaxRelief(
            TaxReliefItem.noRelief(),
            TaxReliefItem.noRelief(),
            TaxReliefItem.relief(prsiAmount)
        );
    }

    static uscAndPrsiRelief(
        uscAmount = Infinity,
        prsiAmount = Infinity
    ): TaxRelief {
        return new TaxRelief(
            TaxReliefItem.noRelief(),
            TaxReliefItem.relief(uscAmount),
            TaxReliefItem.relief(prsiAmount)
        );
    }
}
