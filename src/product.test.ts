import product from './product';

describe('product', () => {
  it('returns the product of two numbers', () => {
    expect(product(1, 2)).toBe(2);
  });
  it('returns the product of many numbers', () => {
    expect(product(1, 2, 3)).toBe(6);
  });
  it('returns zero', () => {
    expect(product(1, 2, 3, 0)).toBe(0);
  });
  it('handles itself', () => {
    expect(product(3, 3)).toBe(9);
  });
});
