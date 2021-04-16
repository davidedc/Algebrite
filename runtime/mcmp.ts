import bigInt from 'big-integer';
import { Sign } from './defs';
// Bignum compare
//  returns
//  -1    a < b
//  0    a = b
//  1    a > b
export function mcmp(a: bigInt.BigInteger, b: bigInt.BigInteger): Sign {
  return a.compare(b) as Sign;
}

// a is a bigint, n is a normal int
function mcmpint(a, n): Sign {
  const b = bigInt(n);
  const t = mcmp(a, b);
  return t;
}
