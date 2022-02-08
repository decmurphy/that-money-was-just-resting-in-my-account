import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { UtilityService } from '../../../services/utility.service';

@Component({
    selector: 'fc-slide-toggle',
    templateUrl: './slide-toggle.component.html',
    styleUrls: ['./slide-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideToggleComponent implements OnInit {

    @Input() checked: boolean = false;
    @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();

    // can have multiple slide-toggles in one page, so need to make sure they all have different id/name/for attributes so they don't clash and interact with each other. UUID is surely overkill, but that's how i like it
    id: string;

    constructor(
        private cd: ChangeDetectorRef,
        private utils: UtilityService
    ) {
    }

    ngOnInit(): void {
        this.id = this.utils.newID("tgl");
    }

    change($event) {
        this.checked = $event.target.checked;
        this.toggle.emit(this.checked);
        this.cd.detectChanges();
    }

}
