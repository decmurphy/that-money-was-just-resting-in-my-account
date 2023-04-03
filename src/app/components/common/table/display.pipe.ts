import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { MonthData } from 'app/interfaces/v2/month-data';

@Pipe({
    name: 'display',
})
export class DisplayPipe implements PipeTransform {
    constructor(private currency: CurrencyPipe) {}
    transform(element: MonthData, col: string): string {
        switch (col) {
            case 'year':
                return '' + Math.floor(element.month / 12);
            case 'month':
                return '' + (1 + (element.month % 12));
            case 'payment':
                return this.currency.transform(
                    element.payment,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            case 'incrementalInterest':
                return this.currency.transform(
                    element.incrementalInterest,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            case 'cumulativeInterest':
                return this.currency.transform(
                    element.cumulativeInterest,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            case 'remaining':
                return this.currency.transform(
                    element.remaining,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            default:
                return '';
        }
    }
}
