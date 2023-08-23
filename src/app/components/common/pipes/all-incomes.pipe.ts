import { Pipe, PipeTransform } from '@angular/core';
import { Income, TaxPayer } from 'app/interfaces/v3/people/people';

@Pipe({
    name: 'allIncomes',
})
export class AllIncomesPipe implements PipeTransform {
    transform(tps: TaxPayer[]): Income[] {
        return tps.map((tp) => tp.getAllIncomes()).flat();
    }
}
