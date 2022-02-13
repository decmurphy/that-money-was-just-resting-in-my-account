import { FormBuilder, FormGroup } from '@angular/forms';
import { FormWithErrors } from '../forms/form-with-errors';
import { Tax } from '../tax/tax';
import { Employment } from './employment';
import { Income } from './income';
import { PersonalDetails } from './personal-details';
import { TaxCredit } from './tax-credit';
import { TaxPayable } from './tax-payable';

export class TaxPayer extends FormWithErrors {
    constructor(
        public details: PersonalDetails = new PersonalDetails(),
        public employment: Employment = null,
        public otherIncomes: Income[] = [],
        public taxPayable: TaxPayable = new TaxPayable(),
        public taxCredits: TaxCredit[] = []
    ) {
        super();
    }

    refreshTaxCredits() {
        const taxCredits = [];

        if (!this.details.maritalStatus.married) {
            taxCredits.push(TaxCredit.singlePerson());
        } else if (this.details.maritalStatus.isAssessor) {
            taxCredits.push(TaxCredit.marriedOrCivilPartner());
        }

        if (this.employment) {
            if (this.employment.paye) {
                taxCredits.push(TaxCredit.paye());
            }
            this.employment.benefitInKind
                .filter((bik) => bik.taxCredit != null)
                .forEach((bik) => taxCredits.push(bik.taxCredit));
        }

        this.taxCredits = taxCredits;
    }

    calculateTaxAndPension(year: number): void {
        this.taxPayable.gross = 0;
        this.taxPayable.incomeTax = 0;
        this.taxPayable.prsi = 0;
        this.taxPayable.usc = 0;
        this.taxPayable.net = 0;

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
        if (this.employment) {
            const ageThisYear = year - this.details.yearOfBirth;
            this.employment.calculateTaxAndPension(incomeTaxBands, ageThisYear);
            /*
                Tally
            */
            this.taxPayable.gross += this.employment.income.taxPayable.gross;
            this.taxPayable.incomeTax +=
                this.employment.income.taxPayable.incomeTax;
            this.taxPayable.prsi += this.employment.income.taxPayable.prsi;
            this.taxPayable.usc += this.employment.income.taxPayable.usc;
            this.taxPayable.net += this.employment.income.taxPayable.net;

            console.log('Employment Tax');
            console.log(this.employment.income.taxPayable);
        }

        // TODO could be cleaner
        /*
            Tax and Income from other Income Streams
        */
        this.otherIncomes.forEach((i) => {
            let taxableIncome;
            /*
                Income Tax
            */
            taxableIncome = i.taxPayable.gross;
            if (i.taxRelief.it.reliefIsProvided) {
                if (
                    i.taxRelief.it.reliefAppliesIfExceeded ||
                    taxableIncome < i.taxRelief.it.amount
                ) {
                    taxableIncome = Math.max(
                        0,
                        i.taxPayable.gross - i.taxRelief.it.amount
                    );
                }
            }
            i.taxPayable.incomeTax = Tax.getMarginalTaxPayable(
                taxableIncome,
                incomeTaxBands,
                this.taxPayable.gross
            );

            /*
                PRSI
            */
            taxableIncome = i.taxPayable.gross;
            if (i.taxRelief.prsi.reliefIsProvided) {
                if (
                    i.taxRelief.prsi.reliefAppliesIfExceeded ||
                    taxableIncome < i.taxRelief.prsi.amount
                ) {
                    taxableIncome = Math.max(
                        0,
                        i.taxPayable.gross - i.taxRelief.prsi.amount
                    );
                }
            }
            i.taxPayable.prsi = Tax.getMarginalTaxPayable(
                taxableIncome,
                Tax.prsiBands,
                this.taxPayable.gross
            );

            /*
                USC
            */
            taxableIncome = i.taxPayable.gross;
            if (i.taxRelief.usc.reliefIsProvided) {
                if (
                    i.taxRelief.usc.reliefAppliesIfExceeded ||
                    taxableIncome < i.taxRelief.usc.amount
                ) {
                    taxableIncome = Math.max(
                        0,
                        i.taxPayable.gross - i.taxRelief.usc.amount
                    );
                }
            }
            i.taxPayable.usc = Tax.getMarginalTaxPayable(
                taxableIncome,
                Tax.uscBands,
                this.taxPayable.gross
            );

            i.taxPayable.net =
                i.taxPayable.gross -
                i.taxPayable.usc -
                i.taxPayable.incomeTax -
                i.taxPayable.prsi;

            /*
                Tally
            */
            this.taxPayable.gross += i.taxPayable.gross;
            this.taxPayable.incomeTax += i.taxPayable.incomeTax;
            this.taxPayable.prsi += i.taxPayable.prsi;
            this.taxPayable.usc += i.taxPayable.usc;
            this.taxPayable.net += i.taxPayable.net;

            console.log(`${i.name} Tax`);
            console.log(i.taxPayable);
        });

        /*
            Last thing always. Do the Tax Credits
        */

        this.taxCredits.forEach((tc) => {
            console.log(`Tax Credit: ${tc.name}, €${tc.amount}`);
        });

        const allTaxCreditsAmount = this.taxCredits
            .map((tc) => tc.amount)
            .reduce((acc, cur) => acc + cur, 0);

        const applicableTaxCredits = Math.min(
            this.taxPayable.incomeTax,
            allTaxCreditsAmount
        );

        this.taxPayable.incomeTax -= applicableTaxCredits;
        this.taxPayable.net += applicableTaxCredits;

        console.log(`Total Tax`);
        console.log(this.taxPayable);

        console.log(`Pension`);
        console.log(this.employment.pension.summary);

        /*
            Fin.
        */
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({});
    }
}
