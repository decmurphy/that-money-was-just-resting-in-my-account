import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[formPrefix]'
})
export class FormPrefixDirective {

    constructor(
        private _element: ElementRef
    ) { }

    get element(): ElementRef {
        return this._element;
    }

}
