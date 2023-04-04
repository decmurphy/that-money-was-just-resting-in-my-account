import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormData } from 'app/interfaces/v2/form-data';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../../forms/form-with-errors';
import { NamedAmount } from '../named-amount';
import { TaxPayer } from '../tax-payer';
import { StrategyEventOperation } from './strategy-event-operation';
import { StrategyEventType } from './strategy-event-type';

export class StrategyEvent extends FormWithErrors {
    // private _newValue: number = null;
    // private _deltaValue: number = null;

    constructor(
        public taxpayerId: string = null,
        public afterMonths: number = null,
        public type: StrategyEventType = null,
        public operation: StrategyEventOperation = null,
        public value: number = null,
        public namedAmount: NamedAmount = null
    ) {
        super();
    }

    static create(model: StrategyEvent): StrategyEvent {
        if (model == null) {
            return new StrategyEvent();
        }
        return new StrategyEvent(
            model.taxpayerId,
            model.afterMonths,
            model.type,
            model.operation,
            model.value,
            model.namedAmount
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        // console.log(this);
        return formBuilder.group({
            taxpayerId: [this.taxpayerId],
            afterMonths: [
                this.afterMonths,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            type: [this.type, [Validators.required]],
            operation: [this.operation, [Validators.required]],
            value: [this.value, [RequiredNumber, Validators.min(0)]],
            namedAmount: (
                NamedAmount.create(this.namedAmount) || new NamedAmount()
            ).toFormGroup(formBuilder),
        });
    }

    construct(): boolean {
        try {
            this.setAfterMonths(this.afterMonths)
                .setTaxpayer(this.taxpayerId)
                .setType(this.type)
                .setOperation(this.operation)
                .setValue(this.value)
                .setNamedAmount(this.namedAmount);
            return true;
        } catch (err) {
            // console.error(err);
            // console.log(this);
            return false;
        }
    }

    setAfterMonths(afterMonths: number): StrategyEvent {
        if (afterMonths == null) {
            throw new Error('afterMonths is required');
        }
        this.afterMonths = afterMonths;
        return this;
    }

    setTaxpayer(taxpayerId: string): StrategyEvent {
        this.taxpayerId = taxpayerId;
        return this;
    }

    setType(type: StrategyEventType): StrategyEvent {
        if (type == null) {
            throw new Error('quantity is required');
        }

        // if (
        //     [
        //         StrategyEventType.PENSION_PERSONAL_CONTRIB,
        //         StrategyEventType.PENSION_EMPLOYER_CONTRIB,
        //         StrategyEventType.EMPLOYMENT_INCOME,
        //         StrategyEventType.ANCILLARY_INCOME,
        //         StrategyEventType.OTHER_INCOME,
        //     ].indexOf(this.type) > -1 &&
        //     this.taxpayerId == null
        // ) {
        //     throw new Error(`Type ${type} requires a valid TaxPayer`);
        // }

        this.type = type;
        return this;
    }

    setOperation(op: StrategyEventOperation): StrategyEvent {
        if (op == null) {
            throw new Error('operation is required');
        }

        this.operation = op;
        return this;
    }

    setValue(value: number): StrategyEvent {
        // if (value == null) {
        //     throw new Error('value is required');
        // }

        this.value = value;
        switch (this.operation) {
            case StrategyEventOperation.ADD:
            case StrategyEventOperation.CHANGE:
            case StrategyEventOperation.REMOVE:
                break;
            //     this._to(value);
            //     break;
            // case 'add':
            //     this._add(value);
            //     break;
            // case 'subtract':
            //     this._subtract(value);
            //     break;
            default:
                throw new Error('Must set operation before value!');
        }
        return this;
    }

    setNamedAmount(namedAmount: NamedAmount): StrategyEvent {
        // if (namedAmount == null) {
        //     throw new Error('namedAmount is required');
        // }

        this.namedAmount = namedAmount;
        return this;
    }

    // private _to(newValue: number): StrategyEvent {
    //     this._newValue = newValue;
    //     this._deltaValue = null;
    //     return this;
    // }

    // private _add(addValue: number): StrategyEvent {
    //     if (
    //         [
    //             'grossIncome',
    //             'mortgageRepayment',
    //             'monthlyExpenditure',
    //             'yearlyExpenditure',
    //         ].indexOf(this.quantity) === -1
    //     ) {
    //         throw new Error(
    //             "Add/Subtract only supported for ['grossIncome', 'mortgageRepayment', 'monthlyExpenditure', 'yearlyExpenditure']"
    //         );
    //     }
    //     this._deltaValue = addValue;
    //     this._newValue = null;
    //     return this;
    // }

    // private _subtract(subtractValue: number): StrategyEvent {
    //     if (
    //         [
    //             'grossIncome',
    //             'mortgageRepayment',
    //             'monthlyExpenditure',
    //             'yearlyExpenditure',
    //         ].indexOf(this.quantity) === -1
    //     ) {
    //         throw new Error(
    //             "Add/Subtract only supported for ['grossIncome', 'mortgageRepayment', 'monthlyExpenditure', 'yearlyExpenditure']"
    //         );
    //     }
    //     this._deltaValue = -subtractValue;
    //     this._newValue = null;
    //     return this;
    // }

    activate(formData: FormData): void {
        if (!this.construct()) {
            return;
        }

        let tp: TaxPayer = null;
        if (this.taxpayerId != null) {
            tp = formData.taxpayers.find((tp) => tp.id === this.taxpayerId);
        }

        switch (this.type) {
            // case 'pensionPercentage':
            //     if (tp != null) {
            //         if (this._newValue >= 40) {
            //             tp.pension.max = true;
            //         } else {
            //             tp.pension.max = false;
            //             tp.pension.percentage = this._newValue;
            //         }
            //     }
            //     break;
            case StrategyEventType.EMPLOYMENT_INCOME:
                if (tp != null) {
                    // console.log(tp);
                    tp.employment.income.gross = this.value;
                }
                break;
            case StrategyEventType.MONTHLY_EXPENDITURE:
            case StrategyEventType.YEARLY_EXPENDITURE:
                const arr =
                    this.type === StrategyEventType.MONTHLY_EXPENDITURE
                        ? formData.expenditures.monthlyItems
                        : formData.expenditures.yearlyItems;
                let item;
                if (this.namedAmount?.name) {
                    switch (this.operation) {
                        case StrategyEventOperation.ADD:
                            arr.push(this.namedAmount);
                            break;
                        case StrategyEventOperation.CHANGE:
                            item = arr.find(
                                (item) => item.name === this.namedAmount.name
                            );
                            if (item) {
                                item.amount = this.value;
                            } else {
                                throw new Error(
                                    `Couldn't find namedAmount ${this.namedAmount.name} to change`
                                );
                            }
                            break;
                        case StrategyEventOperation.REMOVE:
                            item = arr.find(
                                (item) => item.name === this.namedAmount.name
                            );
                            if (item) {
                                const idx = arr.indexOf(item);
                                if (idx > -1) {
                                    arr.splice(idx, 1);
                                } else {
                                    throw new Error(
                                        `Couldn't find namedAmount ${this.namedAmount.name} to remove (1)`
                                    );
                                }
                            } else {
                                throw new Error(
                                    `Couldn't find namedAmount ${this.namedAmount.name} to remove (2)`
                                );
                            }
                            break;
                        default:
                            throw new Error('What');
                    }
                }
                break;
            case StrategyEventType.MORTGAGE_APRC:
                formData.mortgage.aprc = this.value + '';
                break;
            case StrategyEventType.MORTGAGE_REPAYMENT:
                formData.mortgage.monthlyRepayments = this.value;
                break;
            case StrategyEventType.MORTGAGE_LUMP_SUM:
                formData.mortgageMonths[formData.mortgageMonths.length - 1].remaining -= this.value; // amount -= this.value;
                break;
            default:
                throw new Error(
                    `Haven't implemented Strategy for ${this.type} yet`
                );
        }
    }
}
