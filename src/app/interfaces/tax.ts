import { TaxBand } from "./tax-band";

export class Tax {

    private static _incomeTax = {
        married: {
            assessor: {
                bands: [
                    { percentage: 20, from: 0, to: 45800 },
                    { percentage: 40, from: 45800, to: Infinity }
                ]
            },
            lower: {
                bands: [
                    { percentage: 20, from: 0, to: 27800 },
                    { percentage: 40, from: 27800, to: Infinity }
                ]
            }
        },
        single: {
            bands: [
                { percentage: 20, from: 0, to: 36800 },
                { percentage: 40, from: 36800, to: Infinity }
            ]
        }
    };

    private static _usc: TaxBand[] = [
        { percentage: 0.5, from: 0, to: 12012 },
        { percentage: 2, from: 12012, to: 21295 },
        { percentage: 4.5, from: 21295, to: 70044 },
        { percentage: 8, from: 70044, to: Infinity }
    ];

    private static _prsi: TaxBand[] = [
        { percentage: 4, from: 0, to: Infinity },
    ];

    constructor() {
    }

    static get incomeTax() {
        return Tax._incomeTax;
    }

    static get usc(): TaxBand[] {
        return Tax._usc;
    }

    static get prsi(): TaxBand[] {
        return Tax._prsi;
    }

    static getTaxPayable(amount: number, bands: TaxBand[]): number {

        let tax = 0;
        for (let band of bands) {
            if (amount < band.from) {
                // console.log(`IT: ${band.percentage}% on ${0}...`);
            }
            else if (amount > band.to) {
                // console.log(`IT: ${band.percentage}% on ${(band.to - band.from)}...`);
                tax += (band.to - band.from) * band.percentage / 100.0
            }
            else {
                // console.log(`IT: ${band.percentage}% on ${(amount - band.from)}...`);
                tax += (amount - band.from) * band.percentage / 100.0
            }
        }
        // console.log(`IT: ${tax} - ${taxCredits} = ${tax - taxCredits}`);
        return tax;
    }

}
