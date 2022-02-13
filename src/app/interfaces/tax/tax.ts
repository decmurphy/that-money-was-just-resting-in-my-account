import { TaxBand } from './tax-band';

export class Tax {
    private static _incomeTaxBands = {
        married: {
            assessor: [
                { percentage: 20, from: 0, to: 45800 },
                { percentage: 40, from: 45800, to: Infinity },
            ],
            lower: [
                { percentage: 20, from: 0, to: 27800 },
                { percentage: 40, from: 27800, to: Infinity },
            ],
        },
        single: [
            { percentage: 20, from: 0, to: 36800 },
            { percentage: 40, from: 36800, to: Infinity },
        ],
    };

    private static _uscBands: TaxBand[] = [
        { percentage: 0.5, from: 0, to: 12012 },
        { percentage: 2, from: 12012, to: 21295 },
        { percentage: 4.5, from: 21295, to: 70044 },
        { percentage: 8, from: 70044, to: Infinity },
    ];

    private static _prsiBands: TaxBand[] = [
        { percentage: 4, from: 0, to: Infinity },
    ];

    constructor() {}

    static get incomeTax() {
        return Tax._incomeTaxBands;
    }

    static get uscBands(): TaxBand[] {
        return Tax._uscBands;
    }

    static get prsiBands(): TaxBand[] {
        return Tax._prsiBands;
    }

    /**
     * @description Calculates Tax on entire amount according to bands specified
     * @param amount
     * @param bands
     * @returns
     */
    static getTaxPayable(amount: number, bands: TaxBand[]): number {
        let tax = 0;
        for (const band of bands) {
            if (amount < band.from) {
                // amount below band
            } else if (amount > band.to) {
                // amount above band
                tax += ((band.to - band.from) * band.percentage) / 100.0;
            } else {
                // amount mid-band
                tax += ((amount - band.from) * band.percentage) / 100.0;
            }
        }
        return tax;
    }

    /**
     * @description Calculates Tax on an @param amount of money starting at @param marginalAmount. For example if calculating Income Tax
     * and the @param marginalAmount = 30000 and @param amount = 10000, then 6800 will be taxed at 20% and the remainder at 40%
     * @param amount
     * @param bands
     * @param marginalAmount
     * @returns
     */
    static getMarginalTaxPayable(
        amount: number,
        bands: TaxBand[],
        marginalAmount = 0
    ): number {
        const lower = Tax.getTaxPayable(marginalAmount, bands);
        const higher = Tax.getTaxPayable(marginalAmount + amount, bands);

        return higher - lower;
    }
}
