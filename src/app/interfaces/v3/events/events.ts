import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormWithErrors } from 'app/interfaces/forms/form-with-errors';
import { UtilityService } from 'app/services/utility.service';
import { RequiredNumber } from 'app/validators/required-number.directive';

import 'app/interfaces/extensions/date.extensions';
import { NamedAmount } from '../named-amount';
import { Household } from '../household';

export abstract class Event extends FormWithErrors {

    protected _type: StrategyEventType;

    public constructor(
        protected _id: string,
        public startDate: Date = new Date().toStartOfMonth()
    ) {
        super();
        this._id = this._id || UtilityService.newID('event');
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    static create(fd: any): Event {
        switch (fd._type) {
            case StrategyEventType.NOOP:
                return new Noop(fd._id, fd.startDate);
            case StrategyEventType.MORTGAGE_LUMP_SUM:
                return new PayOffLumpSum(fd._id, fd.startDate, fd.amount);
            case StrategyEventType.MORTGAGE_APRC:
                return new ChangeInterestRate(fd._id, fd.startDate, fd.newRate);
            case StrategyEventType.MORTGAGE_REPAYMENT:
                return new ChangeMonthlyRepayment(fd._id, fd.startDate, fd.newMonthlyRepayment);
            case StrategyEventType.EMPLOYMENT_INCOME:
                return new ChangeSalary(fd._id, fd.startDate, fd.jobName, fd.newSalary);
            case StrategyEventType.YEARLY_EXPENDITURE:
                return new AddAnnualExpenditure(fd._id, fd.startDate, NamedAmount.create(fd.expenditure));
            case StrategyEventType.MONTHLY_EXPENDITURE:
                return new AddMonthlyExpenditure(fd._id, fd.startDate, NamedAmount.create(fd.expenditure));
            case StrategyEventType.ONCE_OFF_EXPENDITURE:
                return new AddOnceOffExpenditure(fd._id, fd.startDate, NamedAmount.create(fd.expenditure));
            case StrategyEventType.CHANGE_EXPENDITURE:
                return new ChangeExpenditure(fd._id, fd.startDate, fd.expenditureName, fd.newValue);
            case StrategyEventType.REMOVE_EXPENDITURE:
                return new RemoveExpenditure(fd._id, fd.startDate, fd.expenditureName);
            default:
                throw Error(`Unknown Event Type ${fd.type}`);
        }
    }

    static createByType(type: StrategyEventType): Event {
        switch (type) {
            case StrategyEventType.NOOP:
                return new Noop();
            case StrategyEventType.MORTGAGE_LUMP_SUM:
                return new PayOffLumpSum();
            case StrategyEventType.MORTGAGE_APRC:
                return new ChangeInterestRate();
            case StrategyEventType.MORTGAGE_REPAYMENT:
                return new ChangeMonthlyRepayment();
            case StrategyEventType.EMPLOYMENT_INCOME:
                return new ChangeSalary();
            case StrategyEventType.YEARLY_EXPENDITURE:
                return new AddAnnualExpenditure();
            case StrategyEventType.MONTHLY_EXPENDITURE:
                return new AddMonthlyExpenditure();
            case StrategyEventType.ONCE_OFF_EXPENDITURE:
                return new AddOnceOffExpenditure();
            case StrategyEventType.CHANGE_EXPENDITURE:
                return new ChangeExpenditure();
            case StrategyEventType.REMOVE_EXPENDITURE:
                return new RemoveExpenditure();
            default:
                throw Error(`Unknown Event Type ${type}`);
        }
    }

    abstract execute(household: Household): void;
}

export class Noop extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.NOOP;
    }

    execute(household: Household): void {
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
        });
    }

}

export class PayOffLumpSum extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public amount: number = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.MORTGAGE_LUMP_SUM;
    }

    execute(household: Household): void {
        let amountToPayOff = Math.min(household.cumulativeSavings, this.amount, household.mortgage.principal);
        amountToPayOff = Math.ceil(amountToPayOff * 100) / 100;

        household.mortgage.paymentSeries.set(+new Date(this.startDate).toStartOfMonth(), amountToPayOff);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            amount: [this.amount, [Validators.required, RequiredNumber, Validators.min(0)]]
        });
    }

}

export class ChangeInterestRate extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public newRate: number = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.MORTGAGE_APRC;
    }

    execute(household: Household): void {
        household.mortgage.interestRate = this.newRate + "";
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            newRate: [this.newRate, [Validators.required, RequiredNumber, Validators.min(0)]]
        });
    }

}

export class ChangeMonthlyRepayment extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public newMonthlyRepayment: number = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.MORTGAGE_REPAYMENT;
    }

    execute(household: Household): void {
        household.mortgage.monthlyRepayment = this.newMonthlyRepayment;
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            newMonthlyRepayment: [this.newMonthlyRepayment, [Validators.required, RequiredNumber, Validators.min(0)]]
        });
    }

}

export class ChangeSalary extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public jobName: string = null,
        public newSalary: number = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.EMPLOYMENT_INCOME;
    }

    execute(household: Household): void {
        const job = household.taxpayers.map(tp => tp.getAllIncomes()).flat().find(el => el.name == this.jobName);
        if (job != null) {
            job.gross = this.newSalary;
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            jobName: [this.jobName, [Validators.required]],
            newSalary: [this.newSalary, [Validators.required, RequiredNumber, Validators.min(0)]]
        });
    }

}

export class AddAnnualExpenditure extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public expenditure: NamedAmount = new NamedAmount()
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.YEARLY_EXPENDITURE;
    }

    execute(household: Household): void {
        if (household.expenditures.yearlyItems.find(el => el.name == this.expenditure.name)
            || household.expenditures.monthlyItems.find(el => el.name == this.expenditure.name)
            || household.expenditures.onceOffItems.find(el => el.name == this.expenditure.name)) {
        }
        else {
            household.expenditures.yearlyItems.push(this.expenditure);
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            expenditure: this.expenditure.toFormGroup(formBuilder)
        });
    }

}

export class AddMonthlyExpenditure extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public expenditure: NamedAmount = new NamedAmount()
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.MONTHLY_EXPENDITURE;
    }

    execute(household: Household): void {
        if (household.expenditures.yearlyItems.find(el => el.name == this.expenditure.name)
            || household.expenditures.monthlyItems.find(el => el.name == this.expenditure.name)
            || household.expenditures.onceOffItems.find(el => el.name == this.expenditure.name)) {
        }
        else {
            household.expenditures.monthlyItems.push(this.expenditure);
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            expenditure: this.expenditure.toFormGroup(formBuilder)
        });
    }

}

export class AddOnceOffExpenditure extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public expenditure: NamedAmount = new NamedAmount()
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.ONCE_OFF_EXPENDITURE;
    }

    execute(household: Household): void {
        if (household.expenditures.yearlyItems.find(el => el.name == this.expenditure.name)
            || household.expenditures.monthlyItems.find(el => el.name == this.expenditure.name)
            || household.expenditures.onceOffItems.find(el => el.name == this.expenditure.name)) {
        }
        else {
            household.expenditures.onceOffItems.push(this.expenditure);
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            expenditure: this.expenditure.toFormGroup(formBuilder)
        });
    }

}

export class RemoveExpenditure extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public expenditureName: string = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.REMOVE_EXPENDITURE;
    }

    execute(household: Household): void {
        let exp = household.expenditures.yearlyItems.find(el => el.name == this.expenditureName);
        if (exp) {
            household.expenditures.yearlyItems.splice(household.expenditures.yearlyItems.indexOf(exp), 1);
        }
        exp = household.expenditures.monthlyItems.find(el => el.name == this.expenditureName);
        if (exp) {
            household.expenditures.monthlyItems.splice(household.expenditures.monthlyItems.indexOf(exp), 1);
        }
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            expenditureName: [this.expenditureName, [Validators.required]]
        });
    }

}

export class ChangeExpenditure extends Event {

    public constructor(
        _id: string = null,
        startDate: Date = null,
        public expenditureName: string = null,
        public newValue: number = null
    ) {
        super(_id, startDate);
        this._type = StrategyEventType.CHANGE_EXPENDITURE;
    }

    execute(household: Household): void {
        household.expenditures.yearlyItems.filter(el => el.name == this.expenditureName).forEach(el => el.amount = this.newValue);
        household.expenditures.monthlyItems.filter(el => el.name == this.expenditureName).forEach(el => el.amount = this.newValue);
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            _type: [this._type],
            startDate: [this.startDate, [Validators.required]],
            expenditureName: [this.expenditureName, [Validators.required]],
            newValue: [this.newValue, [Validators.required, RequiredNumber, Validators.min(0)]]
        });
    }

}

export enum StrategyEventType {
    /*
        Pension Contributions
    */
    NOOP = 'Empty Event',
    // PENSION_EMPLOYER_CONTRIB = 'Employer Pension Contribution',
    // PENSION_PERSONAL_CONTRIB = 'Personal Pension Contribution',

    /*
        Income
    */
    EMPLOYMENT_INCOME = 'Salary',
    // ANCILLARY_INCOME = 'Ancillary Income',
    // OTHER_INCOME = 'Other Income',

    /*
        Expenditures
    */
    MONTHLY_EXPENDITURE = 'Add Monthly Expenditure',
    YEARLY_EXPENDITURE = 'Add Annual Expenditure',
    ONCE_OFF_EXPENDITURE = 'Add Once Off Expenditure',
    REMOVE_EXPENDITURE = 'Remove Expenditure',
    CHANGE_EXPENDITURE = 'Change Expenditure',

    /*
        Mortgage
    */
    MORTGAGE_APRC = 'Mortgage APRC',
    MORTGAGE_REPAYMENT = 'Mortgage Repayment',
    MORTGAGE_LUMP_SUM = 'Mortgage Lump Sum'
}