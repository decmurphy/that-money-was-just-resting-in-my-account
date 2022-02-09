import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[formLabel]',
})
export class FormLabelDirective {
    constructor(private _element: ElementRef) {}

    get element(): ElementRef {
        return this._element;
    }
}
