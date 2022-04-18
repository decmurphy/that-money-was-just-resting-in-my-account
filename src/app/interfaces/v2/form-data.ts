import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Expenditures } from 'app/interfaces/v2/expenditures';
import { MaritalStatus } from 'app/interfaces/v2/marital-status';
import { Mortgage } from 'app/interfaces/v2/mortgage';
import { Strategy } from 'app/interfaces/v2/strategy/strategy';
import { TaxPayer } from 'app/interfaces/v2/tax-payer';
import { FormWithErrors } from '../forms/form-with-errors';
import { BenefitInKind } from './benefit-in-kind';
import { Employment } from './employment';
import { Income } from './income';
import { NamedAmount } from './named-amount';
import { Pension } from './pension';
import { PersonalDetails } from './personal-details';
import { StrategyEvent } from './strategy/strategy-event';
import { StrategyEventOperation } from './strategy/strategy-event-operation';
import { StrategyEventType } from './strategy/strategy-event-type';

export class FormData extends FormWithErrors {
    constructor(
        public taxpayers: TaxPayer[] = [new TaxPayer()],
        public maritalStatus: MaritalStatus = new MaritalStatus(),
        public expenditures: Expenditures = new Expenditures(),
        public mortgage: Mortgage = new Mortgage(),
        public strategy: Strategy = new Strategy()
    ) {
        super();
    }

    static create(fd: FormData): FormData {
        if (fd == null) {
            return null;
        }
        return new FormData(
            fd.taxpayers.map((tp) => TaxPayer.create(tp)),
            MaritalStatus.create(fd.maritalStatus),
            Expenditures.create(fd.expenditures),
            Mortgage.create(fd.mortgage),
            Strategy.create(fd.strategy)
        );
    }

    static sampleData(): FormData {
        const taxpayers = [
            new TaxPayer(
                null,
                new PersonalDetails(
                    'Alex',
                    1990,
                    new MaritalStatus(false, '0', true)
                ),
                new Employment(
                    null,
                    true,
                    Income.paye(50000),
                    Pension.occupational(5, 0, true, 2),
                    [],
                    [BenefitInKind.healthInsurance(1500)]
                ),
                []
            ),
            new TaxPayer(
                null,
                new PersonalDetails(
                    'Jamie',
                    1990,
                    new MaritalStatus(false, '0', false)
                ),
                new Employment(
                    null,
                    true,
                    Income.paye(35000),
                    Pension.prsa(8, 0, true, 2),
                    [Income.annualBonus(3000)],
                    []
                ),
                [Income.rentARoom(5000)]
            ),
        ];

        const rent = new NamedAmount(null, 'Rent', 2000);

        return new FormData(
            taxpayers,
            taxpayers[0].details.maritalStatus,
            new Expenditures(
                null,
                [
                    new NamedAmount(null, 'Groceries', 600),
                    new NamedAmount(null, 'Petrol', 300),
                    new NamedAmount(null, 'Leap Card', 200),
                    new NamedAmount(null, 'Car Insurance', 100),
                    new NamedAmount(null, 'Bills', 200),
                    new NamedAmount(null, 'Going Out', 500),
                    new NamedAmount(null, 'Vet', 50),
                    rent,
                ],
                [
                    new NamedAmount(null, 'Car Tax', 100),
                    new NamedAmount(null, 'Accountant', 400),
                ]
            ),
            new Mortgage(24, 40000, 400000, 2.8, 2500),
            new Strategy([
                new StrategyEvent(
                    taxpayers[1].id,
                    12,
                    StrategyEventType.EMPLOYMENT_INCOME,
                    StrategyEventOperation.CHANGE,
                    50000
                ),
                new StrategyEvent(
                    null,
                    24,
                    StrategyEventType.MONTHLY_EXPENDITURE,
                    StrategyEventOperation.REMOVE,
                    null,
                    rent
                ),
                new StrategyEvent(
                    taxpayers[0].id,
                    48,
                    StrategyEventType.EMPLOYMENT_INCOME,
                    StrategyEventOperation.CHANGE,
                    75000
                ),
                new StrategyEvent(
                    null,
                    54,
                    StrategyEventType.MONTHLY_EXPENDITURE,
                    StrategyEventOperation.ADD,
                    null,
                    new NamedAmount(null, 'Baby!', 2000)
                ),
                new StrategyEvent(
                    taxpayers[1].id,
                    72,
                    StrategyEventType.EMPLOYMENT_INCOME,
                    StrategyEventOperation.CHANGE,
                    80000
                ),
                new StrategyEvent(
                    null,
                    72,
                    StrategyEventType.MORTGAGE_REPAYMENT,
                    StrategyEventOperation.CHANGE,
                    3000
                ),
            ])
        );
    }

    toFormGroup(fb: FormBuilder): FormGroup {
        return fb.group({
            taxpayers: new FormArray(
                this.taxpayers.map((tp) => tp.toFormGroup(fb))
            ),
            maritalStatus: this.maritalStatus.toFormGroup(fb),
            expenditures: this.expenditures.toFormGroup(fb),
            mortgage: this.mortgage.toFormGroup(fb),
            strategy: this.strategy.toFormGroup(fb),
        });
    }
}
