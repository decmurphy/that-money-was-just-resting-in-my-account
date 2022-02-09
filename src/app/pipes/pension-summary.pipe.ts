import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TaxPayer } from '../interfaces/tax-payer';

@Pipe({
    name: 'pensionSummary',
})
export class PensionSummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(tp: TaxPayer): string {
        return `Pension: ${tp.pension.max ? 'Max' : tp.pension.percentage + '%'} / ${this.currencyPipe.transform(
            tp.pension.amount,
            'EUR',
            'symbol',
            '1.0-0'
        )}`;
    }
}
