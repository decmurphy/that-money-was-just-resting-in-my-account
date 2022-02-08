import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TaxPayer } from '../interfaces/tax-payer';

@Pipe({
  name: 'combinedIncome'
})
export class CombinedIncomePipe implements PipeTransform {

    constructor(
        private currencyPipe: CurrencyPipe
    ) {
    }

    transform(tp: TaxPayer, formData: FormData): string {
        // const name = formData[ev.taxpayer];

        const name = `${tp.name}`;
        const salary = `Salary: ${this.currencyPipe.transform(tp.income.gross, 'EUR', 'symbol', '1.0-0')} gross / ${this.currencyPipe.transform(tp.income.net, 'EUR', 'symbol', '1.0-0')} net`;


        const pension = `Pension: ${tp.pension.max ? 'Max' : tp.pension.percentage+'%'} / ${this.currencyPipe.transform(tp.pension.amount, 'EUR', 'symbol', '1.0-0')}`;

        return [name, salary, pension].join('\n');
    }

}
