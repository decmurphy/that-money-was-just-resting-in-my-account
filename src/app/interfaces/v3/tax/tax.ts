import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormWithErrors } from 'app/interfaces/forms/form-with-errors';
import { UtilityService } from 'app/services/utility.service';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { TaxPayer } from '../people/people';

export interface TaxBand {
    percentage: number;
    from: number;
    to: number;
}

export class Tax {
    private static _incomeTaxBands: TaxBand[] = [
        { percentage: 20, from: 0, to: 36800 },
        { percentage: 40, from: 36800, to: Infinity },
    ];

    private static _uscBands: TaxBand[] = [
        { percentage: 0.5, from: 0, to: 12012 },
        { percentage: 2, from: 12012, to: 21295 },
        { percentage: 4.5, from: 21295, to: 70044 },
        { percentage: 8, from: 70044, to: Infinity },
    ];

    private static _prsiBands: TaxBand[] = [
        { percentage: 4, from: 0, to: Infinity },
    ];

    constructor() { }

    static get incomeTax() {
        return Tax._incomeTaxBands;
    }

    static get uscBands(): TaxBand[] {
        return Tax._uscBands;
    }

    static get prsiBands(): TaxBand[] {
        return Tax._prsiBands;
    }

    /**
     * @description Calculates Tax on entire amount according to bands specified
     * @param amount
     * @param bands
     * @returns
     */
    static getTaxPayable(amount: number, bands: TaxBand[]): number {
        let tax = 0;
        for (const band of bands) {
            if (amount < band.from) {
                // amount below band
            } else if (amount > band.to) {
                // amount above band
                tax += ((band.to - band.from) * band.percentage) / 100.0;
            } else {
                // amount mid-band
                tax += ((amount - band.from) * band.percentage) / 100.0;
            }
        }
        return tax;
    }

    /**
     * @description Calculates Tax on an @param amount of money starting at @param marginalAmount. For example if calculating Income Tax
     * and the @param marginalAmount = 30000 and @param amount = 10000, then 6800 will be taxed at 20% and the remainder at 40%
     * @param amount
     * @param bands
     * @param marginalAmount
     * @returns
     */
    static getMarginalTaxPayable(
        amount: number,
        bands: TaxBand[],
        marginalAmount = 0
    ): number {
        const lower = Tax.getTaxPayable(marginalAmount, bands);
        const higher = Tax.getTaxPayable(marginalAmount + amount, bands);

        return higher - lower;
    }
}

export class TaxCredit extends FormWithErrors {
    constructor(
        private _id: string = null,
        public name: string = null,
        public value: (taxpayer?: TaxPayer) => number = null
    ) {
        super();
        this._id = this._id || UtilityService.newID('tc');
    }

    get id() {
        return this._id;
    }

    static create(model: TaxCredit): TaxCredit {
        if (model == null) {
            return null;
        }

        switch (model.name) {
            case 'Single Person':
                return TaxCredit.singlePerson();
            case 'Married Person or Civil Partner':
                return TaxCredit.marriedOrCivilPartner();
            case 'Personal Tax Credit':
                return TaxCredit.personalTaxCredit();
            case 'PAYE Employee':
                return TaxCredit.paye();
            case 'Medical Insurance Tax Relief':
                return TaxCredit.medicalInsurance();
            default:
                return new TaxCredit(model._id, model.name, model.value);
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            value: this.value,
        });
    }

    static singlePerson(): TaxCredit {
        return new TaxCredit(
            'txcrd_singleper',
            'Single Person',
            (taxpayer) => 1700
        );
    }

    static marriedOrCivilPartner(): TaxCredit {
        return new TaxCredit(
            'txcrd_marcivpar',
            'Married Person or Civil Partner',
            (taxpayer) => 3400
        );
    }

    static personalTaxCredit(): TaxCredit {
        return new TaxCredit(
            'txcrd_personalt',
            'Personal Tax Credit',
            (taxpayer) => 1700
        );
    }

    static paye(): TaxCredit {
        return new TaxCredit(
            'txcrd_payeemplo',
            'PAYE Employee',
            (taxpayer) => 1700
        );
    }

    static medicalInsurance(): TaxCredit {
        const getTaxCreditValue = (taxpayer: TaxPayer) => {
            const healthInsuranceBIK = taxpayer.employment.benefitInKind.find(
                (bik) => bik.name === 'Health Insurance'
            );
            const amount = healthInsuranceBIK.amount;
            return Math.min(200, 0.2 * amount);
        };
        return new TaxCredit(
            'txcrd_medicalin',
            'Medical Insurance Tax Relief',
            getTaxCreditValue
        );
    }

    static custom(value: number): TaxCredit {
        return new TaxCredit(null, 'Custom', () => value);
    }
}

export class TaxPayable extends FormWithErrors {
    constructor(
        public usc: number = null,
        public prsi: number = null,
        public incomeTax: number = null,
        public taxCreditsUsed: number = null
    ) {
        super();
    }

    static create(model: TaxPayable): TaxPayable {
        if (model == null) {
            return new TaxPayable();
        }
        return new TaxPayable(
            model.usc,
            model.prsi,
            model.incomeTax,
            model.taxCreditsUsed
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            usc: [
                this.usc,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            prsi: [
                this.prsi,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            incomeTax: [
                this.incomeTax,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxCreditsUsed: [
                this.taxCreditsUsed,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }
}

export class TaxRelief extends FormWithErrors {

    public constructor(
        public it: TaxReliefItem = new TaxReliefItem(),
        public usc: TaxReliefItem = new TaxReliefItem(),
        public prsi: TaxReliefItem = new TaxReliefItem()
    ) {
        super();
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

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            it: this.it.toFormGroup(formBuilder),
            usc: this.usc.toFormGroup(formBuilder),
            prsi: this.prsi.toFormGroup(formBuilder),
        });
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

export class TaxReliefItem extends FormWithErrors {

    public constructor(
        public reliefIsProvided: boolean = false,
        public amount: number = 0,
        public reliefAppliesIfExceeded: boolean = true
    ) {
        super();
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
