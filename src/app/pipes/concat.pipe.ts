import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'concat',
})
export class ConcatPipe implements PipeTransform {
    transform(arr1: any[], arr2: any[]): any[] {
        return arr1.concat(arr2);
    }
}
