import cube from './cube';

describe('cube', () => {
  it('returns the cube of a number', () => {
    expect(cube(1)).toBe(1);
    expect(cube(2)).toBe(8);
    expect(cube(3)).toBe(27);
  });
});
