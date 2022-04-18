import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormData } from '../form-data';
import { StrategyEvent } from './strategy-event';
import { FormWithErrors } from '../../forms/form-with-errors';

export class Strategy extends FormWithErrors {
    constructor(public events: StrategyEvent[] = []) {
        super();
    }

    static create(model: Strategy): Strategy {
        if (model == null) {
            return new Strategy();
        }
        return new Strategy(model.events.map((ev) => StrategyEvent.create(ev)));
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            events: new FormArray(
                this.events.map((ev) => ev.toFormGroup(formBuilder))
            ),
        });
    }

    addEvent(event: StrategyEvent): void {
        this.events.push(event);
        this.events.sort((a, b) => a.afterMonths - b.afterMonths);
    }

    apply(formData: FormData, monthIdx: number): void {
        this.events
            .filter((ev) => ev.afterMonths + 1 === monthIdx)
            .forEach((ev) => ev.activate(formData));
    }
}
