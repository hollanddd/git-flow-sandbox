import cubert from './cbrt';

describe('sqrt', () => {
  it('returns the square root of the given number', () => {
    expect(cubert(27)).toBe(3);
  });
});
