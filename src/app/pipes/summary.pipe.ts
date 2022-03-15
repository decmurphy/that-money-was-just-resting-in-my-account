import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { StrategyEventOperation } from 'app/interfaces/v2/strategy/strategy-event-operation';
import { StrategyEventType } from 'app/interfaces/v2/strategy/strategy-event-type';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { StrategyEvent } from '../interfaces/v2/strategy/strategy-event';

@Pipe({
    name: 'summary',
})
export class SummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(ev: StrategyEvent, tps: TaxPayer[]): string {
        let summary = ``;

        if (ev.afterMonths) {
            const years = Math.floor(ev.afterMonths / 12);
            const months = ev.afterMonths - years * 12;
            const totalTime = `${years}y` + (months > 0 ? ` ${months}m` : ``);

            summary = `After ${totalTime}, `;
        }

        let tp: TaxPayer = null;
        if (ev.taxpayerId != null) {
            tp = tps.find((tp) => tp.id === ev.taxpayerId);
        }

        if (ev.type) {
            switch (ev.type) {
                case StrategyEventType.MORTGAGE_REPAYMENT:
                    summary += `change mortgage repayments to ${this.currencyPipe.transform(
                        ev.value,
                        'EUR',
                        'symbol',
                        '1.0-0'
                    )}`;
                    break;
                case StrategyEventType.MORTGAGE_APRC:
                    summary += `change APRC to ${ev.value}%`;
                    break;
                case StrategyEventType.EMPLOYMENT_INCOME:
                    summary += `change ${
                        tp.details.name
                    }'s salary to ${this.currencyPipe.transform(
                        ev.value,
                        'EUR',
                        'symbol',
                        '1.0-0'
                    )}`;
                    break;
                case StrategyEventType.MONTHLY_EXPENDITURE:
                case StrategyEventType.YEARLY_EXPENDITURE:
                    if (ev.namedAmount) {
                        let amount = `${this.currencyPipe.transform(
                            ev.namedAmount.amount,
                            'EUR',
                            'symbol',
                            '1.0-0'
                        )}`;
                        const period =
                            ev.type === StrategyEventType.MONTHLY_EXPENDITURE
                                ? 'mth'
                                : 'yr';
                        switch (ev.operation) {
                            case StrategyEventOperation.ADD:
                                summary += `start paying ${ev.namedAmount.name} (${amount}/${period})`;
                                break;
                            case StrategyEventOperation.REMOVE:
                                summary += `stop paying ${ev.namedAmount.name} (${amount}/${period})`;
                                break;
                            case StrategyEventOperation.CHANGE:
                                amount = `${this.currencyPipe.transform(
                                    ev.value,
                                    'EUR',
                                    'symbol',
                                    '1.0-0'
                                )}`;
                                summary += `change ${ev.namedAmount.name} to ${amount}/${period}`;
                                break;
                        }
                    }
                    break;
                default:
                    throw new Error(
                        `Haven't accounted for ${ev.type} in summary.pipe.ts`
                    );
            }
        }

        return summary;
        //     if (ev.quantity == null) {
        //         return '';
        //     }

        //     let summary =
        //         `After ${Math.floor(ev.afterMonths / 12)}y, ` +
        //         (ev.afterMonths % 12 === 0 ? `` : `${ev.afterMonths % 12}m, `);

        //     const formattedQuantity = this.formatQuantity(ev.quantity);
        //     let formattedValue;
        //     if (ev.quantity === 'pensionPercentage') {
        //         formattedValue = ev.value >= 40 ? `Max` : `${ev.value}%`;
        //     } else {
        //         formattedValue = `${this.currencyPipe.transform(
        //             ev.value,
        //             'EUR',
        //             'symbol',
        //             '1.0-0'
        //         )}`;
        //     }

        //     if (['pensionPercentage', 'grossIncome'].indexOf(ev.quantity) > -1) {
        //         // if (taxpayer != null) {
        //         switch (ev.operation) {
        //             case 'add':
        //                 summary += `${ev.taxpayerId} increases ${formattedQuantity} by ${formattedValue}`;
        //                 break;
        //             case 'subtract':
        //                 summary += `${ev.taxpayerId} decreases ${formattedQuantity} by ${formattedValue}`;
        //                 break;
        //             case 'to':
        //                 summary += `${ev.taxpayerId} changes ${formattedQuantity} to ${formattedValue}`;
        //                 break;
        //         }
        //         // } else {
        //         //     return '';
        //         // }
        //     } else {
        //         switch (ev.operation) {
        //             case 'add':
        //                 summary += `increase ${formattedQuantity} by ${formattedValue}`;
        //                 break;
        //             case 'subtract':
        //                 summary += `decrease ${formattedQuantity} by ${formattedValue}`;
        //                 break;
        //             case 'to':
        //                 summary += `change ${formattedQuantity} to ${formattedValue}`;
        //                 break;
        //         }
        //     }

        //     return summary;
        // }

        // formatQuantity(
        //     quantity:
        //         | 'pensionPercentage'
        //         | 'grossIncome'
        //         | 'monthlyExpenditure'
        //         | 'yearlyExpenditure'
        //         | 'mortgageAPRC'
        //         | 'mortgageRepayment'
        // ): string {
        //     switch (quantity) {
        //         case 'pensionPercentage':
        //             return 'pension contributions';
        //         case 'grossIncome':
        //             return 'gross income';
        //         case 'monthlyExpenditure':
        //             return 'monthly exp.';
        //         case 'yearlyExpenditure':
        //             return 'yearly exp.';
        //         case 'mortgageAPRC':
        //             return 'APRC %';
        //         case 'mortgageRepayment':
        //             return 'repayments';
        //     }
    }
}
