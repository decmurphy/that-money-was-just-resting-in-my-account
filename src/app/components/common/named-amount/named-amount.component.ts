import { Component, Input, OnInit } from '@angular/core';
import { NamedAmount } from 'app/interfaces/v3/named-amount';

@Component({
    selector: 'fc-named-amount',
    templateUrl: './named-amount.component.html',
    styleUrls: ['./named-amount.component.css'],
})
export class NamedAmountComponent implements OnInit {
    @Input() item: NamedAmount;
    constructor() { }

    ngOnInit(): void { }
}
