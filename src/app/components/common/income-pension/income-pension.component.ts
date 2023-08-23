import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { TaxPayer } from 'app/interfaces/v3/people/people';

@Component({
    selector: 'fc-income-pension',
    templateUrl: './income-pension.component.html',
    styleUrls: ['./income-pension.component.css'],
})
export class IncomePensionComponent
    extends SubscriptionHandler
    implements OnInit {
    taxpayers: TaxPayer[];
    showInfo = false;

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.taxpayers = data.taxpayers;
            });
    }

    addTaxpayer() {
        this.dataService.addTaxpayer();
    }

    removeTaxpayer(idx: number): void {
        this.dataService.removeTaxpayer(idx);
    }

    toggleInfo() {
        this.showInfo = !this.showInfo;
    }
}
