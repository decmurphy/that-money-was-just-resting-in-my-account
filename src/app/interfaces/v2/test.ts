import { BenefitInKind } from './benefit-in-kind';
import { Employment } from './employment';
import { Income } from './income';
import { MaritalStatus } from './marital-status';
import { Pension } from './pension';
import { PersonalDetails } from './personal-details';
import { TaxPayer } from './tax-payer';

export class Test {
    constructor() {}

    static run(): void {
        const tp = new TaxPayer(
            new PersonalDetails(
                'Declan',
                1990,
                new MaritalStatus(false, '0', true)
            ),
            new Employment(
                true,
                Income.paye(100000),
                Pension.contributory(5, 8),
                [BenefitInKind.healthInsurance(12000)]
            ),
            [Income.rentARoom(15000)]
        );

        tp.calculateTaxAndPension(2022);
    }
}
