import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'indexOf',
})
export class IndexOfPipe implements PipeTransform {
    transform(arr: any[], value: any): number {
        return arr.map((el) => el.id).indexOf(value.id);
    }
}
