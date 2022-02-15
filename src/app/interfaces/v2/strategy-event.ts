import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormData } from 'app/interfaces/v2/form-data';
import { NamedAmount } from 'app/interfaces/v2/named-amount';
import { RequiredNumber } from 'app/validators/required-number.directive';
import { FormWithErrors } from '../forms/form-with-errors';

export class StrategyEvent extends FormWithErrors {
    private _newValue: number = null;
    private _deltaValue: number = null;

    constructor(
        public taxpayerIdx: number = null,
        public afterMonths: number = null,
        public quantity:
            | 'pensionPercentage'
            | 'grossIncome'
            | 'monthlyExpenditure'
            | 'yearlyExpenditure'
            | 'mortgageAPRC'
            | 'mortgageRepayment' = null,
        public operation: 'to' | 'add' | 'subtract' = null,
        public value: number = null
    ) {
        super();
    }

    static create(model: StrategyEvent): StrategyEvent {
        if (model == null) {
            return new StrategyEvent();
        }
        return new StrategyEvent(
            model.taxpayerIdx,
            model.afterMonths,
            model.quantity,
            model.operation,
            model.value
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            taxpayerIdx: [this.taxpayerIdx],
            afterMonths: [
                this.afterMonths,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
            quantity: [this.quantity, [Validators.required]],
            operation: [this.operation, [Validators.required]],
            value: [
                this.value,
                [Validators.required, RequiredNumber, Validators.min(0)],
            ],
        });
    }

    construct(): boolean {
        try {
            this.setAfterMonths(this.afterMonths)
                .setTaxpayer(this.taxpayerIdx)
                .setQuantity(this.quantity)
                .setOperation(this.operation)
                .setValue(this.value);
            return true;
        } catch (err) {
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

    setTaxpayer(taxpayerIdx: number): StrategyEvent {
        this.taxpayerIdx = taxpayerIdx;
        return this;
    }

    setQuantity(
        quantity:
            | 'pensionPercentage'
            | 'grossIncome'
            | 'monthlyExpenditure'
            | 'yearlyExpenditure'
            | 'mortgageAPRC'
            | 'mortgageRepayment'
    ): StrategyEvent {
        if (quantity == null) {
            throw new Error('quantity is required');
        }

        if (
            ['pensionPercentage', 'grossIncome'].indexOf(this.quantity) > -1 &&
            this.taxpayerIdx == null
        ) {
            throw new Error(
                "['pensionPercentage', 'grossIncome'] require a valid TaxPayer!"
            );
        }

        this.quantity = quantity;
        return this;
    }

    setOperation(op: 'to' | 'add' | 'subtract'): StrategyEvent {
        if (op == null) {
            throw new Error('operation is required');
        }

        this.operation = op;
        return this;
    }

    setValue(value: number): StrategyEvent {
        if (value == null) {
            throw new Error('value is required');
        }

        this.value = value;
        switch (this.operation) {
            case 'to':
                this._to(value);
                break;
            case 'add':
                this._add(value);
                break;
            case 'subtract':
                this._subtract(value);
                break;
            default:
                throw new Error('Must set operation before value!');
        }
        return this;
    }

    private _to(newValue: number): StrategyEvent {
        this._newValue = newValue;
        this._deltaValue = null;
        return this;
    }

    private _add(addValue: number): StrategyEvent {
        if (
            [
                'grossIncome',
                'mortgageRepayment',
                'monthlyExpenditure',
                'yearlyExpenditure',
            ].indexOf(this.quantity) === -1
        ) {
            throw new Error(
                "Add/Subtract only supported for ['grossIncome', 'mortgageRepayment', 'monthlyExpenditure', 'yearlyExpenditure']"
            );
        }
        this._deltaValue = addValue;
        this._newValue = null;
        return this;
    }

    private _subtract(subtractValue: number): StrategyEvent {
        if (
            [
                'grossIncome',
                'mortgageRepayment',
                'monthlyExpenditure',
                'yearlyExpenditure',
            ].indexOf(this.quantity) === -1
        ) {
            throw new Error(
                "Add/Subtract only supported for ['grossIncome', 'mortgageRepayment', 'monthlyExpenditure', 'yearlyExpenditure']"
            );
        }
        this._deltaValue = -subtractValue;
        this._newValue = null;
        return this;
    }

    activate(formData: FormData): void {
        if (!this.construct()) {
            return;
        }

        let tp = null;
        if (this.taxpayerIdx != null) {
            tp = formData.taxpayers[this.taxpayerIdx];
        }

        switch (this.quantity) {
            case 'pensionPercentage':
                if (tp != null) {
                    if (this._newValue >= 40) {
                        tp.pension.max = true;
                    } else {
                        tp.pension.max = false;
                        tp.pension.percentage = this._newValue;
                    }
                }
                break;
            case 'grossIncome':
                if (tp != null) {
                    tp.income.gross =
                        this._newValue || tp.income.gross + this._deltaValue;
                }
                break;
            case 'monthlyExpenditure':
                switch (this.operation) {
                    case 'add':
                        formData.expenditures.monthlyItems.push(
                            new NamedAmount(
                                null,
                                'New Amount',
                                this._deltaValue
                            )
                        );
                        break;
                    case 'subtract':
                        formData.expenditures.monthlyItems.push(
                            new NamedAmount(
                                null,
                                'New Amount',
                                -this._deltaValue
                            )
                        );
                        break;
                    case 'to':
                    default:
                        throw new Error('What');
                }
                // formData.expenditures.monthly =
                //     this._newValue ||
                //     formData.expenditures.monthly + this._deltaValue;
                break;
            case 'yearlyExpenditure':
                switch (this.operation) {
                    case 'add':
                        formData.expenditures.yearlyItems.push(
                            new NamedAmount(
                                null,
                                'New Amount',
                                this._deltaValue
                            )
                        );
                        break;
                    case 'subtract':
                        formData.expenditures.yearlyItems.push(
                            new NamedAmount(
                                null,
                                'New Amount',
                                -this._deltaValue
                            )
                        );
                        break;
                    case 'to':
                    default:
                        throw new Error('What');
                }
                // formData.expenditures.yearly =
                //     this._newValue ||
                //     formData.expenditures.yearly + this._deltaValue;
                break;
            case 'mortgageAPRC':
                formData.mortgage.aprc = this._newValue;
                break;
            case 'mortgageRepayment':
                formData.mortgage.monthlyRepayments =
                    this._newValue ||
                    formData.mortgage.monthlyRepayments + this._deltaValue;
                break;
            default:
                break;
        }
    }
}
