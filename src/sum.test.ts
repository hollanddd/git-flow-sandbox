import sum from './sum';

describe('sum', () => {
  it('should sum two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
  it('should sum many numbers', () => {
    expect(sum(1, 2, 3)).toBe(6);
  });
});
