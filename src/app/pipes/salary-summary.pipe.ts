import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { UtilityService } from 'app/services/utility.service';

@Pipe({
    name: 'salarySummary',
})
export class SalarySummaryPipe implements PipeTransform {
    constructor(private currencyPipe: CurrencyPipe) {}

    transform(tp: TaxPayer): string {
        const incomes = tp.getAllIncomes();
        return `Salary: ${this.currencyPipe.transform(
            UtilityService.sum(incomes.map((i) => i.gross)),
            'EUR',
            'symbol',
            '1.0-0'
        )} gross / ${this.currencyPipe.transform(
            UtilityService.sum(incomes.map((i) => i.net)),
            'EUR',
            'symbol',
            '1.0-0'
        )} net`;
    }
}
