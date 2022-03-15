import { Pipe, PipeTransform } from '@angular/core';
import { StrategyEventOperation } from 'app/interfaces/v2/strategy/strategy-event-operation';
import { StrategyEventType } from 'app/interfaces/v2/strategy/strategy-event-type';

@Pipe({
    name: 'filterOpsForType',
})
export class FilterOpsForTypePipe implements PipeTransform {
    transform(
        ops: StrategyEventOperation[],
        type: StrategyEventType
    ): StrategyEventOperation[] {
        return ops.filter((op) => this.typeHasOp(type, op));
    }

    typeHasOp(type: StrategyEventType, op: StrategyEventOperation): boolean {
        let allowedOps = [];
        switch (type) {
            case StrategyEventType.MORTGAGE_APRC:
                allowedOps = [StrategyEventOperation.CHANGE];
                break;
            case StrategyEventType.MORTGAGE_REPAYMENT:
                allowedOps = [StrategyEventOperation.CHANGE];
                break;
            case StrategyEventType.EMPLOYMENT_INCOME:
                allowedOps = [StrategyEventOperation.CHANGE];
                break;
            case StrategyEventType.MONTHLY_EXPENDITURE:
                allowedOps = [
                    StrategyEventOperation.ADD,
                    StrategyEventOperation.CHANGE,
                    StrategyEventOperation.REMOVE,
                ];
                break;
            case StrategyEventType.YEARLY_EXPENDITURE:
                allowedOps = [
                    StrategyEventOperation.ADD,
                    StrategyEventOperation.CHANGE,
                    StrategyEventOperation.REMOVE,
                ];
                break;
            default:
                throw new Error(
                    `Haven't accounted for ${type} in filter-ops-for-type.pipe.ts`
                );
        }

        return allowedOps.indexOf(op) > -1;
    }
}
