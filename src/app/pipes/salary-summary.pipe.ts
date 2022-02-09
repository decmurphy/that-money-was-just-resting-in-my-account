import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TaxPayer } from '../interfaces/tax-payer';

@Pipe({
    name: 'salarySummary',
})
export class SalarySummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(tp: TaxPayer): string {
        return `Salary: ${this.currencyPipe.transform(
            tp.income.gross,
            'EUR',
            'symbol',
            '1.0-0'
        )} gross / ${this.currencyPipe.transform(tp.income.net, 'EUR', 'symbol', '1.0-0')} net`;
    }
}
