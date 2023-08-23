import { UtilityService } from "app/services/utility.service";
import { FormWithErrors } from "../forms/form-with-errors";
import { NamedAmount } from "./named-amount";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";

export class Expenditures extends FormWithErrors {

    public expenditureSeries: Map<number, number> = new Map();

    constructor(
        private _id: string = null,
        public monthlyItems: NamedAmount[] = [],
        public yearlyItems: NamedAmount[] = [],
        public onceOffItems: NamedAmount[] = [],
        public addedItems: NamedAmount[] = [],
    ) {
        super();
        this._id = this._id || UtilityService.newID('exp');
        this.reset();
    }

    get id(): string {
        return this._id;
    }

    reset() {
        this.expenditureSeries = new Map();
    }

    evaluate(snapshotDate: Date): void {

        const monthlyExpenditures = this.monthlyItems.map((item) => item.amount).reduce((acc, cur) => acc + cur, 0.0);
        const yearlyExpenditures = this.yearlyItems.map((item) => item.amount).reduce((acc, cur) => acc + cur, 0.0);

        const onceOffItems = this.onceOffItems.map((item) => item.amount).reduce((acc, cur) => acc + cur, 0.0);
        this.onceOffItems = [];

        this.expenditureSeries.set(snapshotDate.getTime(), monthlyExpenditures + onceOffItems + (yearlyExpenditures / 12.0));

    }

    static create(model: Expenditures): Expenditures {
        if (model == null) {
            return new Expenditures();
        }
        return new Expenditures(
            model._id,
            model.monthlyItems.map((item) => NamedAmount.create(item)),
            model.yearlyItems.map((item) => NamedAmount.create(item)),
            model.onceOffItems.map((item) => NamedAmount.create(item)),
            (model.addedItems || []).map((item) => NamedAmount.create(item)),
        );
    }

    toFormGroup(formBuilder: FormBuilder): FormGroup {
        return formBuilder.group({
            _id: [this._id],
            monthlyItems: new FormArray(
                this.monthlyItems.map((item) => item.toFormGroup(formBuilder))
            ),
            yearlyItems: new FormArray(
                this.yearlyItems.map((item) => item.toFormGroup(formBuilder))
            ),
            onceOffItems: new FormArray(
                this.onceOffItems.map((item) => item.toFormGroup(formBuilder))
            ),
            addedItems: new FormArray(
                this.addedItems.map((item) => item.toFormGroup(formBuilder))
            ),
        });
    }

}
