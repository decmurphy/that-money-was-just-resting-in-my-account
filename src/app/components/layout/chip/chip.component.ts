import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

@Component({
    selector: 'fc-chip',
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent implements OnInit {
    editing = false;

    @Input() title: string;
    @Input() active = false;
    @Input() editable = false;
    @Output() onAdd: EventEmitter<void> = new EventEmitter();
    @Output() onDelete: EventEmitter<void> = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    mainAction() {
        if (this.active) {
            this.onDelete.emit();
        } else {
            this.onAdd.emit();
        }
    }

    /*
        
    */
    chipClick() {
        if (!this.active) {
            this.onAdd.emit();
        } else if (this.editable) {
            this.edit();
        }
    }

    edit() {
        this.editing = !this.editing;
    }
}
