import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { AddAnnualExpenditure, AddMonthlyExpenditure, AddOnceOffExpenditure, ChangeExpenditure, ChangeInterestRate, ChangeMonthlyRepayment, ChangeSalary, Event, Noop, PayOffLumpSum, RemoveExpenditure, StrategyEventType } from 'app/interfaces/v3/events/events';

@Pipe({
    name: 'summary',
})
export class SummaryPipe implements PipeTransform {

    constructor(private currencyPipe: CurrencyPipe) { }

    transform(ev: Event): string {
        let summary = ``;

        if (ev.startDate) {
            const date = new Date(ev.startDate).toStartOfMonth();
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'short' });

            summary = `In ${month} ${year}, `;
        }
        else {
            return summary;
        }

        if (ev.type) {
            let subtype, amount, verb;
            switch (ev.type) {
                case StrategyEventType.NOOP:
                    subtype = ev as Noop;
                    summary += `???`;
                    break;
                case StrategyEventType.MORTGAGE_REPAYMENT:
                    subtype = ev as ChangeMonthlyRepayment;
                    if (subtype.newMonthlyRepayment) {
                        summary += `change mortgage repayments to ${this.currencyPipe.transform(
                            subtype.newMonthlyRepayment,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                    } else {
                        summary += `change mortgage repayments.`;
                    }
                    break;
                case StrategyEventType.MORTGAGE_APRC:
                    subtype = ev as ChangeInterestRate;
                    if (subtype.newRate) {
                        summary += `change interest rate to ${subtype.newRate}%`;
                    } else {
                        summary += `change interest rate.`;
                    }
                    break;
                case StrategyEventType.MORTGAGE_LUMP_SUM:
                    subtype = ev as PayOffLumpSum;
                    if (subtype.amount) {
                        amount = `${this.currencyPipe.transform(
                            subtype.amount,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                        summary += `pay ${amount} off mortgage principal.`;
                    }
                    else {
                        summary += `pay lump sum off mortgage principal.`;
                    }
                    break;
                case StrategyEventType.EMPLOYMENT_INCOME:
                    subtype = ev as ChangeSalary;
                    if (subtype.jobName && subtype.newSalary) {
                        summary += `raise ${subtype.jobName} to ${this.currencyPipe.transform(
                            subtype.newSalary,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}.`;
                    } else {
                        summary += `get a raise!`;
                    }
                    break;
                case StrategyEventType.MONTHLY_EXPENDITURE:
                    subtype = ev as AddMonthlyExpenditure;
                    if (subtype.expenditure.amount && subtype.expenditure.name) {
                        amount = `${this.currencyPipe.transform(
                            subtype.expenditure.amount,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                        summary += `start paying ${subtype.expenditure.name} (${amount}/m).`;
                    } else {
                        summary += `start paying additional monthly items.`;
                    }
                    break;
                case StrategyEventType.YEARLY_EXPENDITURE:
                    subtype = ev as AddAnnualExpenditure;
                    if (subtype.expenditure.amount && subtype.expenditure.name) {
                        amount = `${this.currencyPipe.transform(
                            subtype.expenditure.amount,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                        summary += `start paying ${subtype.expenditure.name} (${amount}/yr).`;
                    } else {
                        summary += `start paying additional annual items.`;
                    }
                    break;
                case StrategyEventType.ONCE_OFF_EXPENDITURE:
                    subtype = ev as AddOnceOffExpenditure;
                    if (subtype.expenditure.amount && subtype.expenditure.name) {
                        amount = `${this.currencyPipe.transform(
                            Math.abs(subtype.expenditure.amount),
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                        verb = subtype.expenditure.amount > 0 ? 'pay' : 'receive';
                        summary += `${verb} ${subtype.expenditure.name} (${amount}).`;
                    } else {
                        summary += `pay an additional once-off item.`;
                    }
                    break;
                case StrategyEventType.REMOVE_EXPENDITURE:
                    subtype = ev as RemoveExpenditure;
                    if (subtype.expenditureName) {
                        summary += `stop paying ${subtype.expenditureName}.`;
                    } else {
                        summary += `decrease expenditures.`;
                    }
                    break;
                case StrategyEventType.CHANGE_EXPENDITURE:
                    subtype = ev as ChangeExpenditure;
                    if (subtype.newValue && subtype.expenditureName) {
                        amount = `${this.currencyPipe.transform(
                            subtype.newValue,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                        summary += `change ${subtype.expenditureName} to ${amount}.`;
                    } else {
                        summary += `change some expenditure value.`;
                    }
                    break;
                default:
                    throw new Error(
                        `Haven't accounted for ${ev.type} in summary.pipe.ts`
                    );
            }
        }

        return summary;
    }
}
