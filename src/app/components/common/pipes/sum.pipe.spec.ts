import { SumPipe } from './sum.pipe';

describe('SumPipe', () => {
  it('create an instance', () => {
    const pipe = new SumPipe();
    expect(pipe).toBeTruthy();
  });
});
