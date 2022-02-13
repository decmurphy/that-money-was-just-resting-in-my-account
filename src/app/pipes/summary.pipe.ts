import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TaxPayer } from 'app/interfaces/v1/tax-payer';
import { StrategyEvent } from '../interfaces/v1/strategy-event';

@Pipe({
    name: 'summary',
})
export class SummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(ev: StrategyEvent, taxpayer: TaxPayer): string {
        if (ev.quantity == null) {
            return '';
        }

        let summary =
            `After ${Math.floor(ev.afterMonths / 12)}y, ` +
            (ev.afterMonths % 12 === 0 ? `` : `${ev.afterMonths % 12}m, `);

        const formattedQuantity = this.formatQuantity(ev.quantity);
        let formattedValue;
        if (ev.quantity === 'pensionPercentage') {
            formattedValue = ev.value >= 40 ? `Max` : `${ev.value}%`;
        } else {
            formattedValue = `${this.currencyPipe.transform(
                ev.value,
                'EUR',
                'symbol',
                '1.0-0'
            )}`;
        }

        if (['pensionPercentage', 'grossIncome'].indexOf(ev.quantity) > -1) {
            if (taxpayer != null) {
                switch (ev.operation) {
                    case 'add':
                        summary += `${taxpayer.name} increases ${formattedQuantity} by ${formattedValue}`;
                        break;
                    case 'subtract':
                        summary += `${taxpayer.name} decreases ${formattedQuantity} by ${formattedValue}`;
                        break;
                    case 'to':
                        summary += `${taxpayer.name} changes ${formattedQuantity} to ${formattedValue}`;
                        break;
                }
            } else {
                return '';
            }
        } else {
            switch (ev.operation) {
                case 'add':
                    summary += `increase ${formattedQuantity} by ${formattedValue}`;
                    break;
                case 'subtract':
                    summary += `decrease ${formattedQuantity} by ${formattedValue}`;
                    break;
                case 'to':
                    summary += `change ${formattedQuantity} to ${formattedValue}`;
                    break;
            }
        }

        return summary;
    }

    formatQuantity(
        quantity:
            | 'pensionPercentage'
            | 'grossIncome'
            | 'monthlyExpenditure'
            | 'yearlyExpenditure'
            | 'mortgageAPRC'
            | 'mortgageRepayment'
    ): string {
        switch (quantity) {
            case 'pensionPercentage':
                return 'pension contributions';
            case 'grossIncome':
                return 'gross income';
            case 'monthlyExpenditure':
                return 'monthly exp.';
            case 'yearlyExpenditure':
                return 'yearly exp.';
            case 'mortgageAPRC':
                return 'APRC %';
            case 'mortgageRepayment':
                return 'repayments';
        }
    }
}
