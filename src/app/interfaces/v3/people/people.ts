import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormWithErrors } from 'app/interfaces/forms/form-with-errors';
import { UtilityService } from 'app/services/utility.service';
import { RequiredNumber } from 'app/validators/required-number.directive';

import 'app/interfaces/extensions/date.extensions';
import { Tax, TaxCredit, TaxPayable, TaxRelief } from '../tax/tax';
import { Mortgage } from '../mortgage';

export class TaxPayer extends FormWithErrors {

    public cumulativePension: number = 0;

    public grossIncomeSeries: Map<number, number> = new Map();
    public taxPaidSeries: Map<number, number> = new Map();

    public cumulativePensionSeries: Map<number, number> = new Map();
    public cumulativeCashSeries: Map<number, number> = new Map();

    constructor(
        private _id: string = null,
        public details: PersonalDetails = new PersonalDetails(),
        public employment: Employment = Employment.unemployed(),
        public otherIncomes: Income[] = [],
        public taxPayable: TaxPayable = new TaxPayable(),
        public taxCredits: TaxCredit[] = []
    ) {
        super();
        this._id = this._id || UtilityService.newID('tp');
        this.reset();
    }

    get id() {
        return this._id;
    }

    reset() {
        this.cumulativePension = this.details.initialPension;

        this.cumulativeCashSeries = new Map();
        this.grossIncomeSeries = new Map();
        this.cumulativePensionSeries = new Map();
        this.taxPaidSeries = new Map();
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

    private refreshTaxCredits() {
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

    evaluatePension(snapshotDate: Date): void {

        const ageThisYear = snapshotDate.getFullYear() - this.details.yearOfBirth;
        this.employment.calculatePension(ageThisYear);

        if (this.employment.pension) {
            const pensionMpr = Mortgage.aprToMpr(this.employment.pension.annualGrowthRate);
            this.cumulativePension += pensionMpr * this.cumulativePension + (this.employment.pension.summary / 12.0);
        }

        this.cumulativePensionSeries.set(snapshotDate.getTime(), this.cumulativePension);


    }

    evaluateTax(snapshotDate: Date): void {

        this.taxPayable.incomeTax = 0;
        this.taxPayable.prsi = 0;
        this.taxPayable.usc = 0;

        this.refreshTaxCredits();

        /*
            Tax, Income and Pension from Employment
        */
        this.employment.calculateTax();
        let gross = this.employment.income.gross;

        /*
            Tax and Income from other Income Streams
        */
        [...this.employment.ancillary, ...this.otherIncomes].forEach((i) => {
            i.calculateTax(gross);
            gross += i.gross;
        });

        /*
            Apply Tax Credits
        */
        let unusedTaxCredits = this.taxCredits.map((tc) => (tc.value ? tc.value(this) : 0)).reduce((acc, cur) => acc + cur, 0.0);

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
        this.taxPayable.incomeTax = this.getAllIncomes().map((i) => i.taxPayable.incomeTax).reduce((acc, cur) => acc + cur, 0.0);
        this.taxPayable.prsi = this.getAllIncomes().map((i) => i.taxPayable.prsi).reduce((acc, cur) => acc + cur, 0.0);
        this.taxPayable.usc = this.getAllIncomes().map((i) => i.taxPayable.usc).reduce((acc, cur) => acc + cur, 0.0);
        this.taxPayable.taxCreditsUsed = this.getAllIncomes().map((i) => i.taxPayable.taxCreditsUsed).reduce((acc, cur) => acc + cur, 0.0);

        /*
            Fin.
        */

        this.grossIncomeSeries.set(snapshotDate.getTime(), gross / 12.0);
        this.taxPaidSeries.set(snapshotDate.getTime(), (this.taxPayable.incomeTax + this.taxPayable.prsi + this.taxPayable.usc) / 12.0);

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
}

export class PersonalDetails extends FormWithErrors {
    constructor(
        public name: string = null,
        public yearOfBirth: number = null,
        public initialSavings: number = 0,
        public initialPension: number = 0
    ) {
        super();
    }

    static create(model: PersonalDetails): PersonalDetails {
        if (model == null) {
            return null;
        }

        return new PersonalDetails(
            model.name,
            model.yearOfBirth,
            model.initialSavings,
            model.initialPension
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            name: [this.name, [Validators.required]],
            yearOfBirth: [
                this.yearOfBirth,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(1900),
                    Validators.max(2030),
                ],
            ],
            initialSavings: [
                this.initialSavings,
                [Validators.required, RequiredNumber],
            ],
            initialPension: [
                this.initialPension,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }
}

export class Employment extends FormWithErrors {

    private employeeContribution: number;
    private employerContribution: number;
    private employeeContributionWithTaxRelief: number;
    private employerContributionWithTaxRelief: number;

    constructor(
        private _id: string = null,
        public paye: boolean = false,
        public income: Income = new Income(),
        public pension: Pension = new Pension(),
        public ancillary: Income[] = [],
        public benefitInKind: BenefitInKind[] = []
    ) {
        super();
        this._id = this._id || UtilityService.newID('empl');
    }

    static unemployed(): Employment {
        return new Employment('empl_unemploye', false, Income.none(), null);
    }

    getAllBIKs(): number {
        return this.benefitInKind.map((bik) => bik.amount).reduce((acc, cur) => acc + cur, 0.0);
    }

    calculatePension(ageThisYear: number): void {

        if (this.pension != null) {
            /*
                Calculate Age-limited and Total Earnings-limited income tax relief for pensions
            */
            const pensionTaxFreeAllowance = (Math.min(this.income.gross, 115000) * Pension.getTaxFreeAllowancePercentage(ageThisYear)) / 100.0;

            /*
                Pension
            */

            this.pension.calculateContributions(ageThisYear);

            /*
                How much to add to Pension fund for this year. 
                Tax payable also gets calculated on this amount.
            */
            this.employerContribution = (this.pension.employerContribPercent * this.income.gross) / 100;
            this.employeeContribution = (this.pension.personalContribPercent * this.income.gross) / 100;

            switch (this.pension.id) {
                case 'pensn_occptnl__':
                case 'pensn_rac______':
                    this.employeeContributionWithTaxRelief = Math.min(this.employeeContribution, pensionTaxFreeAllowance);
                    this.employerContributionWithTaxRelief = this.employerContribution;
                    break;
                case 'pensn_prsa_____':
                    this.employeeContributionWithTaxRelief = Math.min(this.employeeContribution, pensionTaxFreeAllowance);
                    this.employerContributionWithTaxRelief = Math.min(this.employerContribution, Math.max(0, pensionTaxFreeAllowance - this.employeeContributionWithTaxRelief));
                    break;
                default:
                    throw new Error(`Unknown Pension - id=${this._id}`);
            }

            this.pension.summary = this.employerContribution + this.employeeContribution;
        }
        else {
            this.employeeContribution = 0;
            this.employerContribution = 0;
            this.employeeContributionWithTaxRelief = 0;
            this.employerContributionWithTaxRelief = 0;
        }

    }

    calculateTax(): void {

        /*
            Gross + BIKs + Taxable Employee Pension Contribs
        */
        const taxableIncome = this.income.gross + this.getAllBIKs();

        /*
            Income Tax
        */
        this.income.taxPayable.incomeTax = Tax.getTaxPayable(
            taxableIncome
            - (this.employerContribution - this.employerContributionWithTaxRelief)
            - this.employeeContributionWithTaxRelief,
            Tax.incomeTax);

        /*
            PRSI
        */
        this.income.taxPayable.prsi = Tax.getTaxPayable(taxableIncome, Tax.prsiBands);

        /*
            USC
        */
        this.income.taxPayable.usc = Tax.getTaxPayable(taxableIncome, Tax.uscBands);

        this.income.net = this.income.gross
            - this.income.taxPayable.usc
            - this.income.taxPayable.incomeTax
            - this.income.taxPayable.prsi
            - this.employeeContribution;
    }

    static create(model: Employment): Employment {
        if (model == null) {
            return null;
        }

        return new Employment(
            model._id,
            model.paye,
            Income.create(model.income),
            Pension.create(model.pension),
            model.ancillary.map((i) => Income.create(i)),
            model.benefitInKind.map((bik) => BenefitInKind.create(bik))
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            paye: [this.paye, [Validators.required]],
            income: this.income.toFormGroup(formBuilder),
            pension: this.pension?.toFormGroup(formBuilder),
            ancillary: new FormArray(
                this.ancillary.map((i) => i.toFormGroup(formBuilder))
            ),
            benefitInKind: new FormArray(
                this.benefitInKind.map((bik) => bik.toFormGroup(formBuilder))
            ),
        });
    }
}

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

    get id() {
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

export class Income extends FormWithErrors {

    public constructor(
        private _id: string = null,
        public name: string = null,
        public gross: number = null,
        public taxRelief: TaxRelief = new TaxRelief(),
        public taxPayable: TaxPayable = new TaxPayable(),
        public info: string = null,
        public net: number = null,
        public editable: boolean = false
    ) {
        super();
        this._id = this._id || UtilityService.newID('inc');
    }

    get id() {
        return this._id;
    }

    calculateTax(gross = 0): void {
        let taxableIncome;
        /*
            Income Tax
        */
        taxableIncome = this.gross;
        if (this.taxRelief.it.reliefIsProvided) {
            if (this.taxRelief.it.reliefAppliesIfExceeded || taxableIncome <= this.taxRelief.it.amount) {
                taxableIncome = Math.max(0, this.gross - this.taxRelief.it.amount);
            }
        }
        this.taxPayable.incomeTax = Tax.getMarginalTaxPayable(taxableIncome, Tax.incomeTax, gross);

        /*
            PRSI
        */
        taxableIncome = this.gross;
        if (this.taxRelief.prsi.reliefIsProvided) {
            if (this.taxRelief.prsi.reliefAppliesIfExceeded || taxableIncome <= this.taxRelief.prsi.amount) {
                taxableIncome = Math.max(0, this.gross - this.taxRelief.prsi.amount);
            }
        }
        this.taxPayable.prsi = Tax.getMarginalTaxPayable(taxableIncome, Tax.prsiBands, gross);

        /*
            USC
        */
        taxableIncome = this.gross;
        if (this.taxRelief.usc.reliefIsProvided) {
            if (this.taxRelief.usc.reliefAppliesIfExceeded || taxableIncome <= this.taxRelief.usc.amount) {
                taxableIncome = Math.max(0, this.gross - this.taxRelief.usc.amount);
            }
        }
        this.taxPayable.usc = Tax.getMarginalTaxPayable(taxableIncome, Tax.uscBands, gross);

        this.net = this.gross - this.taxPayable.usc - this.taxPayable.incomeTax - this.taxPayable.prsi;
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            gross: [
                this.gross,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            taxRelief: this.taxRelief.toFormGroup(formBuilder),
            taxPayable: this.taxPayable.toFormGroup(formBuilder),
            info: [this.info],
            net: [
                this.net,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            editable: [this.editable],
        });
    }

    static create(model: Income): Income {
        if (model == null) {
            return null;
        }

        return new Income(
            model._id,
            model.name,
            model.gross,
            TaxRelief.create(model.taxRelief),
            TaxPayable.create(model.taxPayable),
            model.info,
            model.net,
            model.editable
        );
    }

    static none(): Income {
        return new Income(
            'inc_none_____',
            'No Income',
            0,
            TaxRelief.noRelief()
        );
    }

    static paye(gross?: number): Income {
        return new Income(
            'inc_paye_____',
            'PAYE Income',
            gross,
            TaxRelief.noRelief()
        );
    }

    static rentARoom(gross?: number): Income {
        return new Income(
            'inc_rentaroom',
            'Rent A Room',
            gross,
            TaxRelief.incomeTaxRelief(14000, false),
            new TaxPayable(),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/rent-a-room-relief/index.aspx'
        );
    }

    static artistExemption(gross?: number): Income {
        return new Income(
            'inc_artistexe',
            'Artistic Works Sales',
            gross,
            TaxRelief.incomeTaxRelief(50000),
            new TaxPayable(),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/artists-exemption/index.aspx'
        );
    }

    static woodlandsExemption(gross?: number): Income {
        return new Income(
            'inc_woodlands',
            'Woodlands',
            gross,
            TaxRelief.incomeTaxRelief(Infinity),
            new TaxPayable(),
            'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/land-and-property/woodlands/index.aspx'
        );
    }

    static overtime(gross?: number): Income {
        return new Income(
            'inc_overtime_',
            'Overtime',
            gross,
            TaxRelief.noRelief()
        );
    }

    static annualBonus(gross?: number): Income {
        return new Income(
            'inc_annlbonus',
            'Annual Bonus',
            gross,
            TaxRelief.noRelief()
        );
    }

    static custom(gross?: number): Income {
        const inc = new Income(null, 'Custom', gross, TaxRelief.noRelief());
        inc.editable = true;
        return inc;
    }

}

export class Pension extends FormWithErrors {

    public constructor(
        private _id: string = null,
        public name: string = null,
        public taxRelief: TaxRelief = null,
        public personalContribPercent: number = null,
        public employerContribPercent: number = null,
        public maxTaxFree: boolean = false,
        public annualGrowthRate: number = 0, // can use this on the UI to simulate pension growth over time
        public summary: number = 0
    ) {
        super();
        this._id = this._id || UtilityService.newID('pension');
    }

    get id(): string {
        return this._id;
    }

    calculateContributions(ageThisYear: number): void {
        if (this.maxTaxFree) {
            const taxFreeAllowance =
                Pension.getTaxFreeAllowancePercentage(ageThisYear);
            switch (this._id) {
                case 'pensn_occptnl__':
                    this.personalContribPercent = taxFreeAllowance;
                    break;
                case 'pensn_prsa_____':
                    this.personalContribPercent =
                        taxFreeAllowance - this.employerContribPercent;
                    break;
                case 'pensn_rac______':
                    this.personalContribPercent = taxFreeAllowance;
                    break;
                default:
                    throw new Error(`Unknown Pension - id=${this._id}`);
            }
        }
    }

    static create(model: Pension): Pension {
        if (model == null) {
            return null;
        }

        return new Pension(
            model._id,
            model.name,
            TaxRelief.create(model.taxRelief),
            model.personalContribPercent,
            model.employerContribPercent,
            model.maxTaxFree,
            model.annualGrowthRate,
            model.summary
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            name: [this.name, [Validators.required]],
            taxRelief: this.taxRelief.toFormGroup(formBuilder),
            personalContribPercent: [
                this.personalContribPercent,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(0),
                    Validators.max(40),
                ],
            ],
            employerContribPercent: [
                this.employerContribPercent,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(0),
                    Validators.max(40),
                ],
            ],
            maxTaxFree: [this.maxTaxFree],
            annualGrowthRate: [
                this.annualGrowthRate,
                [
                    Validators.required,
                    RequiredNumber,
                    Validators.min(-10),
                    Validators.max(10),
                ],
            ],
            summary: [
                this.summary,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    static getTaxFreeAllowancePercentage(taxpayerAge: number) {
        if (taxpayerAge >= 60) {
            return 40;
        } else if (taxpayerAge >= 55) {
            return 35;
        } else if (taxpayerAge >= 50) {
            return 30;
        } else if (taxpayerAge >= 40) {
            return 25;
        } else if (taxpayerAge >= 30) {
            return 20;
        } else {
            return 15;
        }
    }

    // static contributory(
    //     employeeContribution: number,
    //     employerContribution: number
    // ): Pension {
    //     return new Pension(
    //         'pensn_contribut',
    //         'Contributory Pension',
    //         TaxRelief.incomeTaxRelief(),
    //         employeeContribution,
    //         employerContribution
    //     );
    // }

    // static nonContributory(employerContribution: number): Pension {
    //     return new Pension(
    //         'pensn_noncontri',
    //         'Non-Contributory Pension',
    //         TaxRelief.incomeTaxRelief(),
    //         0,
    //         employerContribution
    //     );
    // }

    static occupational(
        employeeContribution?: number,
        employerContribution?: number,
        maxTaxFree?: boolean,
        growthRate?: number
    ): Pension {
        return new Pension(
            'pensn_occptnl__',
            'Occupational',
            TaxRelief.incomeTaxRelief(),
            employeeContribution,
            employerContribution,
            maxTaxFree,
            growthRate
        );
    }

    static prsa(
        employeeContribution?: number,
        employerContribution?: number,
        maxTaxFree?: boolean,
        growthRate?: number
    ): Pension {
        return new Pension(
            'pensn_prsa_____',
            'PRSA',
            TaxRelief.incomeTaxRelief(),
            employeeContribution,
            employerContribution,
            maxTaxFree,
            growthRate
        );
    }

    static rac(): Pension {
        return new Pension(
            'pensn_rac______',
            'RAC',
            TaxRelief.incomeTaxRelief(),
            0,
            0
        );
    }

    // static none(): Pension {
    //     return new Pension(
    //         'pensn_nopension',
    //         'No Pension',
    //         TaxRelief.noRelief(),
    //         0,
    //         0
    //     );
    // }

    // static taxExemptPension(): Pension {
    //     return new Pension(
    //         'pensn_taxexempt',
    //         'Tax Exempt Pension',
    //         TaxRelief.fullExemption(),
    //         0,
    //         0
    //     );
    // }

    // static custom(): Pension {
    //     return new Pension(null, 'Custom');
    // }
}
