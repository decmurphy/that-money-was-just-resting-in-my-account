import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
} from '@angular/forms';
import { FormErrorProvider } from '../forms/form-error-provider';
import { Formable } from 'app/interfaces/forms/formable';
import { FormData } from './form-data';
import { StrategyEvent } from './strategy-event';

export class Strategy implements Formable {
    private formErrorProvider: FormErrorProvider = new FormErrorProvider();

    private _currentMonth: number;

    constructor(public events: StrategyEvent[] = []) {}

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

    getError(control: AbstractControl): string {
        return this.formErrorProvider.getError(control);
    }

    addEvent(event: StrategyEvent): void {
        this.events.push(event);
        this.events.sort((a, b) => a.afterMonths - b.afterMonths);
    }

    setMonth(month: number): void {
        this._currentMonth = month;
    }

    apply(formData: FormData): void {
        this.events
            .filter((ev) => ev.afterMonths === this._currentMonth)
            .forEach((ev) => ev.activate(formData));
    }
}
