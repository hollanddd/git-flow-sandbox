import square from './square';
import sqrt from './sqrt';
import sum from './sum';

function hyp(a: number, b: number): number {
  return sqrt(sum(square(a), square(b)));
}
export { hyp as default };
