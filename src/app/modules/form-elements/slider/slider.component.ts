import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { UtilityService } from '../../../services/utility.service';

@Component({
    selector: 'fc-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SliderComponent,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent implements OnInit {
    id: string;

    @Input() min: number;
    @Input() max: number;
    @Input() step: number;

    @Input() value: number;
    @Input() disabled = false;
    @Output() sliderChange: EventEmitter<number> = new EventEmitter();
    @Output() sliderInput: EventEmitter<number> = new EventEmitter();

    touched = false;
    onChange = (value: number) => {};
    onTouched = () => {};

    constructor(private cd: ChangeDetectorRef, private utils: UtilityService) {}

    ngOnInit(): void {
        this.id = this.utils.newID('sldr');
    }

    onSliderChange(event: any): void {
        this.markAsTouched();

        this.value = event.target.valueAsNumber;
        this.onChange(this.value);

        this.sliderChange.emit(this.value);

        this.cd.detectChanges();
    }

    onSliderInput(event: any): void {
        this.markAsTouched();

        this.value = event.target.valueAsNumber;
        this.onChange(this.value);

        this.sliderInput.emit(this.value);

        this.cd.detectChanges();
    }

    writeValue(value: number): void {
        this.value = value;
    }

    registerOnChange(onChange: (value: number) => unknown): void {
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
