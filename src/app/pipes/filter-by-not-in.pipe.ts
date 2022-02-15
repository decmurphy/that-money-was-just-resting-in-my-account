import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterByNotIn',
})
export class FilterByNotInPipe implements PipeTransform {
    transform(arr: any[], src: any[]): any[] {
        const srcNames = src.map((el) => el.id);

        // console.log(arr);
        // console.log(src);
        // console.log(arr.filter((el) => srcNames.indexOf(el.id) == -1));

        return arr.filter((el) => srcNames.indexOf(el.id) == -1);
    }
}
