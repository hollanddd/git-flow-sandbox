import square from '.';

describe('square', () => {
  it('returns the square of a number', () => {
    expect(square(1)).toBe(1);
    expect(square(2)).toBe(4);
    expect(square(3)).toBe(9);
    expect(square(4)).toBe(16);
  });
});
