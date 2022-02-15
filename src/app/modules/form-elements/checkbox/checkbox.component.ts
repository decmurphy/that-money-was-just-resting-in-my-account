import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { UtilityService } from '../../../services/utility.service';

/*
    https://blog.angular-university.io/angular-custom-form-controls/
*/

@Component({
    selector: 'fc-checkbox',
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: CheckboxComponent,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
    id: string;

    @Input() checked = false;
    @Input() disabled = false;
    @Output() toggle: EventEmitter<boolean> = new EventEmitter();

    touched = false;
    onChange = (checked: boolean) => {};
    onTouched = () => {};

    constructor(private cd: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.id = UtilityService.newID('cbx');
    }

    selectionChange(event: any): void {
        this.markAsTouched();

        this.checked = event.target.checked;
        this.onChange(this.checked);

        this.toggle.emit(this.checked);

        this.cd.detectChanges();
    }

    writeValue(checked: boolean): void {
        this.checked = checked;
    }

    registerOnChange(onChange: (checked: boolean) => unknown): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: () => unknown): void {
        this.onTouched = onTouched;
    }

    markAsTouched(): void {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }
}
