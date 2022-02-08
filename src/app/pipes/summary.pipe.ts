import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { FormData } from '../interfaces/form-data';
import { StrategyEvent } from '../interfaces/strategy-event';

@Pipe({
    name: 'summary'
})
export class SummaryPipe implements PipeTransform {

    constructor(
        private currencyPipe: CurrencyPipe
    ) {
    }

    transform(ev: StrategyEvent, formData: FormData): string {

        if (ev.quantity == null) {
            return ''
        }

        let summary = `After ${Math.floor(ev.afterMonths/12)}y, ` + (ev.afterMonths % 12 === 0 ? `` : `${ev.afterMonths % 12}m, `);

        let formattedQuantity = this.formatQuantity(ev.quantity);
        let formattedValue;
        if (ev.quantity === 'pensionPercentage') {
            formattedValue = ev.value >= 40 ? `Max` : `${ev.value}%`;
        }
        else {
            formattedValue = `${this.currencyPipe.transform(ev.value, 'EUR', 'symbol', '1.0-0')}`
        }

        if (['pensionPercentage', 'grossIncome'].indexOf(ev.quantity) > -1) {

            if (ev.taxpayer != null) {

                const tp = ev.taxpayer === '0' ? formData.tp1 : formData.tp2;

                switch(ev.operation) {
                    case "add":
                        summary += `${tp.name} increases ${formattedQuantity} by ${formattedValue}`;
                        break;
                    case "subtract":
                        summary += `${tp.name} decreases ${formattedQuantity} by ${formattedValue}`;
                        break;
                    case "to":
                        summary += `${tp.name} changes ${formattedQuantity} to ${formattedValue}`;
                        break;
                }
            }
            else {
                return '';
            }

        }
        else {

            switch(ev.operation) {
                case "add":
                    summary += `increase ${formattedQuantity} by ${formattedValue}`;
                    break;
                case "subtract":
                    summary += `decrease ${formattedQuantity} by ${formattedValue}`;
                    break;
                case "to":
                    summary += `change ${formattedQuantity} to ${formattedValue}`;
                    break;
            }

        }

        return summary;

    }

    formatQuantity(quantity: 'pensionPercentage'|'grossIncome'|'monthlyExpenditure'|'yearlyExpenditure'|'mortgageAPRC'|'mortgageRepayment'): string {

        switch (quantity) {
            case 'pensionPercentage': return "pension contributions";
            case 'grossIncome': return "gross income";
            case 'monthlyExpenditure': return "monthly exp.";
            case 'yearlyExpenditure': return "yearly exp.";
            case 'mortgageAPRC': return "APRC %";
            case 'mortgageRepayment': return "repayments";
        }
    }

}
