import { Pipe, PipeTransform } from '@angular/core';
import { NamedAmount } from 'app/interfaces/v1/named-amount';

@Pipe({
    name: 'sum',
})
export class SumPipe implements PipeTransform {
    transform(items: NamedAmount[]): number {
        return items
            .map((item) => item.amount)
            .reduce((acc, cur) => acc + cur, 0.0);
    }
}
