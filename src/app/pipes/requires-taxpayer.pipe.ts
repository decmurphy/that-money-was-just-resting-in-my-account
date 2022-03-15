import { Pipe, PipeTransform } from '@angular/core';
import { StrategyEventType } from 'app/interfaces/v2/strategy/strategy-event-type';

@Pipe({
    name: 'requiresTaxpayer',
})
export class RequiresTaxpayerPipe implements PipeTransform {
    transform(type: StrategyEventType): boolean {
        switch (type) {
            case StrategyEventType.EMPLOYMENT_INCOME:
                return true;
            case StrategyEventType.MONTHLY_EXPENDITURE:
            case StrategyEventType.YEARLY_EXPENDITURE:
            case StrategyEventType.MORTGAGE_APRC:
            case StrategyEventType.MORTGAGE_REPAYMENT:
                return false;
            default:
                throw new Error(
                    `Haven't accounted for ${type} in requires-taxpayer.pipe yet!`
                );
        }
    }
}
