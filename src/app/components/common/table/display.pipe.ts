import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Snapshot } from 'app/interfaces/v3/snapshot';

@Pipe({
    name: 'display',
})
export class DisplayPipe implements PipeTransform {
    constructor(private currency: CurrencyPipe) { }
    transform(element: Snapshot, col: string): string {
        switch (col) {
            case 'year':
                return new Date(element.timestamp).getFullYear() + "";
            case 'month':
                return new Date(element.timestamp).getMonth() + 1 + "";
            case 'payment':
                return this.currency.transform(
                    element.payment,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            case 'incrementalInterest':
                return this.currency.transform(
                    element.interestDelta,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            case 'cumulativeInterest':
                return this.currency.transform(
                    element.interestPaid,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            case 'remaining':
                return this.currency.transform(
                    element.principal,
                    'EUR',
                    'symbol',
                    '1.0-0'
                );
            default:
                return '';
        }
    }
}
