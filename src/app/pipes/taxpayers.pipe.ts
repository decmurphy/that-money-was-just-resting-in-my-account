import { Pipe, PipeTransform } from '@angular/core';
import { FormData } from 'app/interfaces/form-data';

@Pipe({
  name: 'taxpayers'
})
export class TaxpayersPipe implements PipeTransform {

  transform(data: FormData): {id: string; name: string; }[] {
    if (data.tp2) {
      return [{ id: '0', name: data.tp1.name }, { id: '1', name: data.tp2.name }];
    }
    else {
      return [{ id: '0', name: data.tp1.name }];
    }
  }

}
