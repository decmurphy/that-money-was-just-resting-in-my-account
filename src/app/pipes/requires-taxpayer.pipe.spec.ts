import { RequiresTaxpayerPipe } from './requires-taxpayer.pipe';

describe('RequiresTaxpayerPipe', () => {
  it('create an instance', () => {
    const pipe = new RequiresTaxpayerPipe();
    expect(pipe).toBeTruthy();
  });
});
