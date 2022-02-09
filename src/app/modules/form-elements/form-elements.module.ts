import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OverlayModule } from '../overlay/overlay.module';

import { CheckboxComponent } from './checkbox/checkbox.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { OptgroupComponent } from './optgroup/optgroup.component';
import { OptionComponent } from './option/option.component';
import { RadioButtonComponent } from './radio-button/radio-button.component';
import { RadioGroupComponent } from './radio-group/radio-group.component';
import { SelectComponent } from './select/select.component';
import { SlideToggleComponent } from './slide-toggle/slide-toggle.component';
import { SliderComponent } from './slider/slider.component';

import { FormInputDirective } from './directives/form-input.directive';
import { FormLabelDirective } from './directives/form-label.directive';
import { FormPrefixDirective } from './directives/form-prefix.directive';
import { FormSuffixDirective } from './directives/form-suffix.directive';
import { FormErrorDirective } from './directives/form-error.directive';

@NgModule({
    declarations: [
        CheckboxComponent,
        FormFieldComponent,
        OptgroupComponent,
        OptionComponent,
        RadioButtonComponent,
        RadioGroupComponent,
        SelectComponent,
        SlideToggleComponent,
        SliderComponent,

        FormInputDirective,
        FormLabelDirective,
        FormPrefixDirective,
        FormSuffixDirective,
        FormErrorDirective,
    ],
    imports: [CommonModule, FormsModule, OverlayModule],
    exports: [
        CheckboxComponent,
        FormFieldComponent,
        OptgroupComponent,
        OptionComponent,
        RadioButtonComponent,
        RadioGroupComponent,
        SelectComponent,
        SlideToggleComponent,
        SliderComponent,

        FormInputDirective,
        FormLabelDirective,
        FormPrefixDirective,
        FormSuffixDirective,
        FormErrorDirective,
    ],
})
export class FormElementsModule {}
