import { Pipe, PipeTransform } from '@angular/core';
import { Income } from 'app/interfaces/v2/income';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';

@Pipe({
    name: 'allIncomes',
})
export class AllIncomesPipe implements PipeTransform {
    transform(tps: TaxPayer[]): Income[] {
        return tps.map((tp) => tp.getAllIncomes()).flat();
    }
}
