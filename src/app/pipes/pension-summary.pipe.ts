import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Pension } from 'app/interfaces/v2/pension';

@Pipe({
    name: 'pensionSummary',
})
export class PensionSummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(pension: Pension): string {
        if (pension == null) {
            return ``;
        }
        return `Pension: ${
            pension.employerContribPercent +
            pension.personalContribPercent +
            '%'
        } / ${this.currencyPipe.transform(
            pension.summary.amount,
            'EUR',
            'symbol',
            '1.0-0'
        )}`;
    }
}
