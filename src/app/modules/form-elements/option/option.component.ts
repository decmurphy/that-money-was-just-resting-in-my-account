import { ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { UtilityService } from '../../../services/utility.service';

@Component({
    selector: 'fc-option',
    templateUrl: './option.component.html',
    styleUrls: ['./option.component.scss']
})
export class OptionComponent implements OnInit {

    id: string;
    name: string;

    @ViewChild("label") label: ElementRef;
    @ViewChild("input") input: ElementRef;

    @Input() value: any;
    @Input() multiple: boolean = false;
    @Input() checked: boolean = false;
    @Input() disabled: boolean = false;
    @Output() click: EventEmitter<any> = new EventEmitter();

    constructor(
        private cd: ChangeDetectorRef,
        private utils: UtilityService
    ) { }

    ngOnInit(): void {
        this.id = this.utils.newID("opt");
    }

    selectionChange() {
        this.click.emit(this.value);
    }

    detectChanges() {
        this.cd.detectChanges();
    }

    getLabelContent(): string {
        if (this.label) {
            return this.label.nativeElement.innerHTML;
        }
        else {
            return "";
        }
    }

    getInput(): ElementRef {
        return this.input;
    }

}
