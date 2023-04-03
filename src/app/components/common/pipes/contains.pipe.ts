import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'contains',
})
export class ContainsPipe implements PipeTransform {
    transform(arr: any[], value: any): boolean {
        return arr.map((el) => el.id).indexOf(value.id) > -1;
    }
}
