import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { FormWithErrors } from 'app/interfaces/forms/form-with-errors';
import { UtilityService } from 'app/services/utility.service';

import 'app/interfaces/extensions/date.extensions';
import { Event } from './events/events';

export class Strategy extends FormWithErrors {

    constructor(
        private _id: string = null,
        public startDate: Date,
        public endDate: Date,
        public events: Event[]
    ) {
        super();
        this._id = this._id || UtilityService.newID('strategy');
    }

    findEvents(snapshotDate: Date): Event[] {
        return this.events.filter(ev => new Date(ev.startDate).equals(snapshotDate));
    }

    static create(fd: Strategy): Strategy {
        if (fd == null) {
            return null;
        }
        return new Strategy(
            fd._id,
            new Date(fd.startDate),
            new Date(fd.endDate),
            fd.events.map(it => Event.create(it))
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            startDate: this.startDate,
            endDate: this.endDate,
            events: new FormArray(
                this.events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map((item) => item.toFormGroup(formBuilder))
            ),
        });
    }

}
