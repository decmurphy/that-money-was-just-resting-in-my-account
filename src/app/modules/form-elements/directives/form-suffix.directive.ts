import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[formSuffix]',
})
export class FormSuffixDirective {
    constructor(private _element: ElementRef) {}

    get element(): ElementRef {
        return this._element;
    }
}
