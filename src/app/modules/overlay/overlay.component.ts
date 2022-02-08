import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'fc-overlay',
    templateUrl: './overlay.component.html',
    styleUrls: ['./overlay.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverlayComponent implements OnInit {

    @Input() active: boolean = true;
    @Input() visible: boolean = true;

    @Output() _click: EventEmitter<any> = new EventEmitter();
    @Output() _swipeLeft: EventEmitter<any> = new EventEmitter();
    @Output() _swipeRight: EventEmitter<any> = new EventEmitter();

    constructor() { }

    ngOnInit(): void {
    }

    click(event): void {
        this._click.emit(event);
    }

    swipeLeft(event): void {
        this._swipeLeft.emit(event);
    }

    swipeRight(event): void {
        this._swipeRight.emit(event);
    }

}
