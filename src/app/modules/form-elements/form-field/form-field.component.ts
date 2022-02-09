import { AfterContentInit, Component, ContentChild, OnInit } from '@angular/core';
import { UtilityService } from '../../../services/utility.service';

import { FormErrorDirective } from '../directives/form-error.directive';
import { FormInputDirective } from '../directives/form-input.directive';
import { FormLabelDirective } from '../directives/form-label.directive';
import { FormPrefixDirective } from '../directives/form-prefix.directive';
import { FormSuffixDirective } from '../directives/form-suffix.directive';

@Component({
    selector: 'fc-form-field',
    templateUrl: './form-field.component.html',
    styleUrls: ['./form-field.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush // don't do it cap
})
export class FormFieldComponent implements OnInit, AfterContentInit {
    @ContentChild(FormInputDirective) formInput: FormInputDirective;
    @ContentChild(FormLabelDirective) formLabel: FormLabelDirective;
    @ContentChild(FormErrorDirective) formError: FormErrorDirective;
    @ContentChild(FormPrefixDirective) formPrefix: FormPrefixDirective;
    @ContentChild(FormSuffixDirective) formSuffix: FormSuffixDirective;

    inputId: string;

    constructor(private utils: UtilityService) {}

    ngOnInit(): void {
        this.inputId = this.utils.newID('input');
    }

    ngAfterContentInit(): void {
        if (this.formInput == null) {
            throw new Error('FormField requires a formInput child');
        }

        /*
            We set the label.for to point to this value as well. Should be unique.
        */
        const inputEl = this.formInput.element.nativeElement;
        inputEl.classList += ' peer ';
        inputEl.setAttribute('id', this.inputId);

        /*
            Yo dawg, your input doesn't have a placeholder so we used the formLabel as a placeholder for your placeholder
        */
        if (inputEl.placeholder == null || inputEl.placeholder == '') {
            inputEl.placeholder = this.formLabel.element.nativeElement.innerHTML;
        }
    }
}
