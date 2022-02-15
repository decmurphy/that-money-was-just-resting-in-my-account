import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sum',
})
export class SumPipe implements PipeTransform {
    transform(items: any[], field?: string): number {
        return items
            .map((item) => +item[field])
            .reduce((acc, cur) => acc + cur, 0.0);
    }
}
