import {
    AfterContentInit,
    Attribute,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable, interval, map, shareReplay, takeUntil } from 'rxjs';

import { SubscriptionHandler } from '../../../interfaces/subscription-handler';
import { UtilityService } from '../../../services/utility.service';
import { OptgroupComponent } from '../optgroup/optgroup.component';
import { OptionComponent } from '../option/option.component';

@Component({
    selector: 'fc-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: SelectComponent,
        },
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends SubscriptionHandler implements OnInit, AfterContentInit, ControlValueAccessor {
    id: string;
    containerTransform = 0;
    optionsContainerScroll = 0;
    optionsHidden = true;
    chosenOptionLabel: string;
    selectButtonPos$: Observable<any>;

    @ViewChild('selectButton') selectButton: ElementRef;
    @ViewChild('optionsContainer') optionsContainer: ElementRef;

    @ContentChildren(OptionComponent) options: QueryList<OptionComponent>;
    @ContentChildren(OptgroupComponent) optGroups: QueryList<OptgroupComponent>;

    @Input() value: any;
    @Input() disabled = false;
    @Output() selectionChange: EventEmitter<any> = new EventEmitter();

    touched = false;
    onChange = (value: any) => {};
    onTouched = () => {};

    constructor(
        @Optional() @Attribute('multiple') public multiple: any,
        private cd: ChangeDetectorRef,
        private utils: UtilityService
    ) {
        super();
        this.multiple = this.multiple === '' ? true : false;
    }

    ngOnInit(): void {
        this.id = this.utils.newID('slct');
    }

    ngAfterContentInit(): void {
        this.selectButtonPos$ = interval(15).pipe(
            map(() => this.selectButton.nativeElement.getBoundingClientRect()),
            shareReplay()
        );

        if (this.options.length > 0 && this.optGroups.length > 0) {
            throw new Error('Can pass either fc-option[] or fc-optgroup[] to fc-select - but not both');
        }
        if (this.options.length == 0 && this.optGroups.length == 0) {
            throw new Error('Must pass one of fc-option[] or fc-optgroup[] to fc-select');
        }

        this.initialiseOptionStates();
        this.updateCheckedStates();
        this.updateLabel();
        this.updateContainerTransform();
    }

    selectionChanged(value: any): void {
        this.markAsTouched();

        if (this.multiple) {
            const idx = this.value.indexOf(value);
            if (idx > -1) {
                // remove it
                this.value.splice(idx, 1);
                this.value = this.value.slice();
            } else {
                // add it
                this.value.push(value);
                this.value = this.value.slice();
            }
        } else {
            this.value = value;
        }

        this.updateLabel();
        this.updateContainerTransform();

        this.onChange(this.value);
        this.selectionChange.emit(this.value);

        this.cd.detectChanges();
    }

    writeValue(value: string): void {
        this.value = value;
        this.updateCheckedStates();
    }

    registerOnChange(onChange: (value: any) => unknown): void {
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

    onOptionClick(optionValue: any): void {
        this.selectionChanged(optionValue);
        if (!this.multiple) {
            this.closeOptions();
        }
        this.cd.detectChanges();
    }

    openOptions() {
        this.optionsHidden = false;
        this.cd.detectChanges();
        this.optionsContainer.nativeElement.scrollTop = this.optionsContainerScroll;
        this.cd.detectChanges();
        this.focusSelectedOrFirst();
    }

    closeOptions() {
        this.optionsHidden = true;
        this.selectButton.nativeElement.focus();
    }

    getAllOptions(): OptionComponent[] {
        if (this.options == null) {
            return [];
        }
        return this.options.length > 0
            ? this.options.toArray()
            : this.optGroups.map((grp) => grp.options.toArray()).flat();
    }

    optIsSelected(option: OptionComponent) {
        if (this.multiple) {
            return this.value != null && this.value.indexOf(option.value) > -1;
        } else {
            return this.value != null && this.value === option.value;
        }
    }

    initialiseOptionStates(): void {
        this.getAllOptions().forEach((opt) => {
            opt.multiple = this.multiple;
            opt.click.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => this.onOptionClick(val));
            opt.detectChanges();
        });
    }

    updateCheckedStates(): void {
        this.getAllOptions().forEach((option) => {
            option.checked = this.optIsSelected(option);
            option.detectChanges();
        });
    }

    updateLabel(): void {
        if (this.value) {
            const allOptions = this.getAllOptions();
            const chosenOptions = allOptions.filter((opt) => this.optIsSelected(opt));
            if (chosenOptions) {
                this.chosenOptionLabel = chosenOptions.map((co) => co.getLabelContent().trim()).join(', ');
            }
        }
    }

    updateContainerTransform(): void {
        if (this.value) {
            const allOptions = this.getAllOptions();
            const chosenOptions = allOptions.filter((opt) => this.optIsSelected(opt));
            const indexOfChosenOption = allOptions.indexOf(chosenOptions[0]);

            /*
                If we're doing optionGroups, then we also need to take into account the size of the group label
                Luckily it's the same height as the options themselves, so we just add +1 to index for each group
            */
            let indexOfChosenGroup = -1;
            if (this.optGroups.length > 0) {
                const groupOfChosenOption = this.optGroups.find(
                    (grp) => grp.options.toArray().indexOf(chosenOptions[0]) > -1
                );
                indexOfChosenGroup = this.optGroups.toArray().indexOf(groupOfChosenOption);
            }

            if (indexOfChosenOption > -1) {
                this.containerTransform = -48 * (indexOfChosenOption + indexOfChosenGroup + 1);
                /*
                    Entire container is 264px high
                    If we're trying to transform by more than half of that, stop at half and start scrolling inside the box the rest of the way
                */
                if (this.containerTransform < -132) {
                    const excess = -132 - this.containerTransform;
                    this.containerTransform = -132;
                    this.optionsContainerScroll = excess;
                } else {
                    this.optionsContainerScroll = 0;
                }
            }
        }
    }

    focusSelectedOrFirst(): void {
        const allOptions = this.getAllOptions();
        const chosenOptions = this.value ? allOptions.filter((opt) => this.optIsSelected(opt)) : allOptions;
        if (chosenOptions?.length > 0) {
            chosenOptions[0].getInput().nativeElement.focus();
        }
    }
}
