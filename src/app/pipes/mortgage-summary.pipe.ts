import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Mortgage } from 'app/interfaces/v2/mortgage';

@Pipe({
    name: 'mortgageSummary',
})
export class MortgageSummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(mortgage: Mortgage, part: 1 | 2 | 3): string {
        switch (part) {
            case 1:
                return `${this.currencyPipe.transform(
                    mortgage.amount,
                    'EUR',
                    'symbol',
                    '1.0-0'
                )}`;
            case 2:
                return `APRC: ${mortgage.aprc}%`;
            case 3:
                return `Monthly Repayments: ${this.currencyPipe.transform(
                    mortgage.monthlyRepayments,
                    'EUR',
                    'symbol',
                    '1.0-0'
                )}`;
        }
    }
}
