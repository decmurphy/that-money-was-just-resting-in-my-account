import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TrackByFunction,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { Subscription, takeUntil, tap } from 'rxjs';

import { SubscriptionHandler } from 'app/interfaces/misc/subscription-handler';
import { DataService } from 'app/services/data.service';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { Pension } from 'app/interfaces/v2/pension';
import { Income } from 'app/interfaces/v2/income';
import { BenefitInKind } from 'app/interfaces/v2/benefit-in-kind';
import { TaxCredit } from 'app/interfaces/v2/tax-credit';

@Component({
    selector: 'fc-taxpayer',
    templateUrl: './taxpayer.component.html',
    styleUrls: ['./taxpayer.component.css'],
})
export class TaxpayerComponent extends SubscriptionHandler implements OnInit {
    @Input() taxpayerIdx: number;
    @Output() onDelete: EventEmitter<number> = new EventEmitter();

    editing = false;
    form: FormGroup;
    formValueChangesSub: Subscription;

    taxpayers: TaxPayer[];
    data: TaxPayer;

    math = Math;

    pensionSuggestions = [
        Pension.contributory(null, null),
        Pension.nonContributory(null),
        Pension.prsa(),
        Pension.rac(),
        Pension.taxExemptPension(),
        // Pension.custom(),
    ];

    ancillarySuggestions = [
        Income.annualBonus(),
        Income.overtime(),
        // AncillaryIncome.custom(),
    ];

    incomeSuggestions = [
        Income.rentARoom(),
        Income.artistExemption(),
        Income.woodlandsExemption(),
        Income.custom(),
    ];

    bikSuggestions = [
        BenefitInKind.healthInsurance(),
        // BenefitInKind.custom(),
    ];

    taxCreditSuggestions = [
        TaxCredit.paye(),
        TaxCredit.personalTaxCredit(),
        TaxCredit.medicalInsurance(),
        // TaxCredit.custom(),
    ];

    constructor(private fb: FormBuilder, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.dataService
            .getData()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
                this.taxpayers = data.taxpayers;
                this.data = data.taxpayers[this.taxpayerIdx];
                if (this.data != null) {
                    this.resetForm();
                }
            });
    }

    resetForm(): void {
        this.data = TaxPayer.create(this.data);
        this.form = this.data.toFormGroup(this.fb);
        this.form.updateValueAndValidity();
        this.form.markAllAsTouched();

        if (this.formValueChangesSub != null) {
            this.formValueChangesSub.unsubscribe();
        }

        this.formValueChangesSub = this.form.valueChanges
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((fv) => this.dataService.setTaxpayer(this.taxpayerIdx, fv))
            )
            .subscribe((fv) => {
                // console.log(fv);
            });
    }

    submit() {
        console.log(this.form.getRawValue());
    }

    delete() {
        this.onDelete.emit(this.taxpayerIdx);
    }

    addPension(pension: Pension) {
        this.data.employment.pension = pension;
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    removePension() {
        this.data.employment.pension = null;
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    addAncillary(ancillary: Income) {
        const idx = this.data.employment.ancillary.indexOf(ancillary);
        if (idx == -1) {
            this.data.employment.ancillary.push(ancillary);
        }
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    removeAncillary(ancillary: Income) {
        const idx = this.data.employment.ancillary.indexOf(ancillary);
        if (idx > -1) {
            this.data.employment.ancillary.splice(idx, 1);
        }
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    addIncome(inc: Income) {
        const idx = this.data.otherIncomes.indexOf(inc);
        if (idx == -1) {
            this.data.otherIncomes.push(inc);
        }
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    removeIncome(inc: Income) {
        const idx = this.data.otherIncomes.indexOf(inc);
        if (idx > -1) {
            this.data.otherIncomes.splice(idx, 1);
        }
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    addBIK(bik: BenefitInKind) {
        const idx = this.data.employment.benefitInKind.indexOf(bik);
        if (idx == -1) {
            this.data.employment.benefitInKind.push(bik);
        }
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    removeBIK(bik: BenefitInKind) {
        const idx = this.data.employment.benefitInKind.indexOf(bik);
        if (idx > -1) {
            this.data.employment.benefitInKind.splice(idx, 1);
        }
        this.dataService.setTaxpayer(this.taxpayerIdx, this.data);
    }

    get details(): FormGroup {
        return this.form.get('details') as FormGroup;
    }

    get employment(): FormGroup {
        return this.form.get('employment') as FormGroup;
    }

    get income(): FormGroup {
        return this.employment.get('income') as FormGroup;
    }

    get benefitInKind(): FormArray {
        return this.employment.get('benefitInKind') as FormArray;
    }

    get otherIncomes(): FormArray {
        return this.form.get('otherIncomes') as FormArray;
    }

    get pension(): FormGroup {
        return this.employment.get('pension') as FormGroup;
    }

    get ancillary(): FormArray {
        return this.employment.get('ancillary') as FormArray;
    }

    trackIncome: TrackByFunction<Income> = (index: number, item: Income) =>
        item.id;

    trackPension: TrackByFunction<Pension> = (index: number, item: Pension) =>
        item.id;

    trackBenefitInKind: TrackByFunction<BenefitInKind> = (
        index: number,
        item: BenefitInKind
    ) => item.id;

    trackTaxPayer: TrackByFunction<TaxPayer> = (
        index: number,
        item: TaxPayer
    ) => item.id;

    trackTaxCredit: TrackByFunction<TaxCredit> = (
        index: number,
        item: TaxCredit
    ) => item.id;
}
