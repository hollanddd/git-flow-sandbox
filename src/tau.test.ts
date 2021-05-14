import tau from './tau';

describe('tau', () => {
  it('returns the tau constant', () => {
    expect(tau()).toBe(6.283185307179586);
  });
});
