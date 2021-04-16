import { Constants, MZERO, Num } from '../runtime/defs';
import { makeSignSameAs } from './bignum';
import { mgcd } from './mgcd';
import { mdiv, mmul } from './mmul';

//  Multiply rational numbers
//
//  Input:    p1    multiplicand
//            p2    multiplier
//
//  Output:    product
export function qmul(p1: Num, p2: Num): Num {
  // zero?
  if (MZERO(p1.q.a) || MZERO(p2.q.a)) {
    return Constants.zero;
  }

  const aa = mmul(p1.q.a, p2.q.a);
  const bb = mmul(p1.q.b, p2.q.b);

  let c = mgcd(aa, bb);
  c = makeSignSameAs(c, bb);

  return new Num(mdiv(aa, c), mdiv(bb, c));
}
