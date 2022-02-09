import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[formInput]',
})
export class FormInputDirective {
    constructor(private _element: ElementRef) {}

    get element(): ElementRef {
        return this._element;
    }
}
