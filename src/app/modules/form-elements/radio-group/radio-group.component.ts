import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UtilityService } from '../../../services/utility.service';

import { RadioButtonComponent } from '../radio-button/radio-button.component';

@Component({
    selector: 'fc-radio-group',
    templateUrl: './radio-group.component.html',
    styleUrls: ['./radio-group.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        multi: true,
        useExisting: RadioGroupComponent
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioGroupComponent implements OnInit, AfterContentInit, OnChanges, ControlValueAccessor {

    @ContentChildren(RadioButtonComponent) radioButtons: QueryList<RadioButtonComponent>;

    name: string;

    @Input() value: string | number;
    @Input() disabled: boolean = false;
    @Output() radioGroupChange: EventEmitter<string | number> = new EventEmitter();

    touched = false;
    onChange = (value: string | number) => {};
    onTouched = () => {};

    constructor(
        private cd: ChangeDetectorRef,
        private utils: UtilityService
    ) {
    }

    ngOnInit(): void {
        this.name = this.utils.newID("rgrp");
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['disabled'] && changes['disabled'].currentValue !== changes['disabled'].previousValue) {
            this.setDisabledState(changes['disabled'].currentValue);
        }
        if (changes['value'] && changes['value'].currentValue !== changes['value'].previousValue) {
            this.writeValue(changes['value'].currentValue);
        }
    }

    ngAfterContentInit() {

        this.radioButtons.forEach(radioButton => {
            radioButton.name = this.name;
            radioButton.disabled = this.disabled;
            if (this.value) {
                radioButton.checked = this.value === radioButton.value;
            }
            radioButton.selectionChange = this.selectionChange.bind(this);
            radioButton.detectChanges();
        });

    }

    selectionChange(event: any): void {

        this.markAsTouched();

        this.value = event.target.value;
        this.onChange(this.value);

        this.radioGroupChange.emit(this.value);

        this.cd.detectChanges();

    }

    writeValue(value: string | number): void {
        this.value = value;
        if (this.radioButtons) {
            this.radioButtons.forEach(radioButton => {
                radioButton.checked = this.value === radioButton.value;
                radioButton.detectChanges();
            });
        }
    }

    registerOnChange(onChange: (value: string | number) => {}): void {
        this.onChange = onChange;
    }

    registerOnTouched(onTouched: () => {}): void {
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
        if (this.radioButtons) {
            this.radioButtons.forEach(radioButton => {
                radioButton.disabled = this.disabled;
                radioButton.detectChanges();
            });
        }
    }

}
