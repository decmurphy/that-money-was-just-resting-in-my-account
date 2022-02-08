import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[formError]'
})
export class FormErrorDirective {

    constructor(
        private _element: ElementRef
    ) { }

    get element(): ElementRef {
        return this._element;
    }

}
