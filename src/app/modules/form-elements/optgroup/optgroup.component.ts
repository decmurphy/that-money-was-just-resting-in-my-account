import { Component, ContentChildren, Input, OnInit, QueryList } from '@angular/core';

import { OptionComponent } from '../option/option.component';

@Component({
    selector: 'fc-optgroup',
    templateUrl: './optgroup.component.html',
    styleUrls: ['./optgroup.component.scss']
})
export class OptgroupComponent implements OnInit {

    @ContentChildren(OptionComponent) options: QueryList<OptionComponent>;

    @Input() label: string;

    constructor() { }

    ngOnInit(): void {
    }

}
