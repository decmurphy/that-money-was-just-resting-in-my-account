import { SalarySummaryPipe } from './salary-summary.pipe';

describe('SalarySummaryPipe', () => {
    it('create an instance', () => {
        const pipe = new SalarySummaryPipe();
        expect(pipe).toBeTruthy();
    });
});
