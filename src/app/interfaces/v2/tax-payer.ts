import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from 'app/services/utility.service';
import { FormWithErrors } from '../forms/form-with-errors';
import { Tax } from '../tax/tax';
import { Employment } from './employment';
import { Income } from './income';
import { PersonalDetails } from './personal-details';
import { TaxCredit } from './tax-credit';
import { TaxPayable } from './tax-payable';

export class TaxPayer extends FormWithErrors {
    constructor(
        private _id: string = null,
        public details: PersonalDetails = new PersonalDetails(),
        public employment: Employment = Employment.unemployed(),
        public otherIncomes: Income[] = [],
        public taxPayable: TaxPayable = new TaxPayable(),
        public taxCredits: TaxCredit[] = []
    ) {
        super();
        this._id = this._id || UtilityService.newID('txpyr');
    }

    get id(): string {
        return this._id;
    }

    refreshTaxCredits() {
        const taxCredits = [];

        taxCredits.push(TaxCredit.personalTaxCredit());

        if (this.employment.paye) {
            taxCredits.push(TaxCredit.paye());
        }
        this.employment.benefitInKind
            .filter((bik) => bik.taxCredit != null)
            .forEach((bik) => taxCredits.push(bik.taxCredit));

        this.taxCredits = taxCredits;
    }

    calculateTaxAndPension(year: number): void {
        let gross = 0;

        this.taxPayable.incomeTax = 0;
        this.taxPayable.prsi = 0;
        this.taxPayable.usc = 0;

        this.refreshTaxCredits();

        let incomeTaxBands;
        if (!this.details.maritalStatus.married) {
            incomeTaxBands = Tax.incomeTax.single;
        } else if (this.details.maritalStatus.isAssessor) {
            incomeTaxBands = Tax.incomeTax.married.assessor;
        } else {
            incomeTaxBands = Tax.incomeTax.married.lower;
        }

        /*
            Tax, Income and Pension from Employment
        */
        const ageThisYear = year - this.details.yearOfBirth;
        this.employment.calculateTaxAndPension(incomeTaxBands, ageThisYear);
        gross += this.employment.income.gross;

        /*
            Tax and Income from other Income Streams
        */
        [...this.employment.ancillary, ...this.otherIncomes].forEach((i) => {
            i.calculateTax(incomeTaxBands, gross);
            gross += i.gross;
        });

        /*
            Apply Tax Credits
        */
        let unusedTaxCredits = UtilityService.sum(
            this.taxCredits.map((tc) => (tc.value ? tc.value(this) : 0))
        );

        this.getAllIncomes().forEach((inc) => {
            const taxCreditsToUse = Math.min(
                inc.taxPayable.incomeTax,
                unusedTaxCredits
            );
            inc.net += taxCreditsToUse;
            inc.taxPayable.incomeTax -= taxCreditsToUse;
            inc.taxPayable.taxCreditsUsed = taxCreditsToUse;
            unusedTaxCredits -= taxCreditsToUse;
        });

        /*
            Tally
        */
        this.taxPayable.incomeTax = UtilityService.sum(
            this.getAllIncomes().map((i) => i.taxPayable.incomeTax)
        );
        this.taxPayable.prsi = UtilityService.sum(
            this.getAllIncomes().map((i) => i.taxPayable.prsi)
        );
        this.taxPayable.usc = UtilityService.sum(
            this.getAllIncomes().map((i) => i.taxPayable.usc)
        );
        this.taxPayable.taxCreditsUsed = UtilityService.sum(
            this.getAllIncomes().map((i) => i.taxPayable.taxCreditsUsed)
        );

        /*
            Fin.
        */
    }

    getAllIncomes(): Income[] {
        return [
            this.employment.income,
            ...this.employment.ancillary,
            ...this.otherIncomes,
        ];
    }

    static create(model: TaxPayer): TaxPayer {
        if (model == null) {
            return null;
        }

        return new TaxPayer(
            model._id,
            PersonalDetails.create(model.details),
            Employment.create(model.employment),
            model.otherIncomes.map((i) => Income.create(i)),
            TaxPayable.create(model.taxPayable),
            model.taxCredits.map((tc) => TaxCredit.create(tc))
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            details: this.details.toFormGroup(formBuilder),
            employment: this.employment.toFormGroup(formBuilder),
            otherIncomes: new FormArray(
                this.otherIncomes.map((i) => i.toFormGroup(formBuilder))
            ),
            taxPayable: this.taxPayable.toFormGroup(formBuilder),
            taxCredits: new FormArray(
                this.taxCredits.map((tc) => tc.toFormGroup(formBuilder))
            ),
        });
    }
}
