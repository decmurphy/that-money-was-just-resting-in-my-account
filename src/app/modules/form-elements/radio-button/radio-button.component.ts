import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { UtilityService } from '../../../services/utility.service';

@Component({
    selector: 'fc-radio-button',
    templateUrl: './radio-button.component.html',
    styleUrls: ['./radio-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioButtonComponent implements OnInit {

    id: string;
    name: string;
    disabled: boolean = false;

    selectionChange = (event: any) => { }

    @Input() value: string | number;
    @Input() checked: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        private utils: UtilityService
    ) {
     }

    ngOnInit(): void {
        this.id = this.utils.newID("rbtn");
    }

    detectChanges() {
        this.cd.detectChanges();
    }

}
