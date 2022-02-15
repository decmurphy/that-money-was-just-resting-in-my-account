import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'app/services/utility.service';
import { FormWithErrors } from '../forms/form-with-errors';
import { TaxPayer } from './tax-payer';

export class TaxCredit extends FormWithErrors {
    constructor(
        private _id: string = null,
        public name: string = null,
        public value: (taxpayer?: TaxPayer) => number = null
    ) {
        super();
        this._id = this._id || UtilityService.newID('txcrd');
    }

    get id(): string {
        return this._id;
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            value: this.value,
        });
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
            (taxpayer) =>
                taxpayer.details.maritalStatus.getPersonalTaxCreditAmount()
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
