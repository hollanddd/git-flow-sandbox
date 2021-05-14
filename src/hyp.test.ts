import hyp from './hyp';

describe('hyp', () => {
  it('returns the hypotenuse given two sides of a right-angled triangle', () => {
    expect(hyp(3, 4)).toBe(5);
  });
});
