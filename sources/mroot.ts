import bigInt from 'big-integer';
import { mcmp } from '../runtime/mcmp';
import { stop } from '../runtime/run';
import { mint } from './bignum';
import { mpow } from './mpow';

//-----------------------------------------------------------------------------
//
//  Bignum root
//
//  Returns null pointer if not perfect root.
//
//  The sign of the radicand is ignored.
//
//-----------------------------------------------------------------------------
export function mroot(n: bigInt.BigInteger, index: number) {
  n = n.abs();

  if (index === 0) {
    stop('root index is zero');
  }

  // count number of bits
  let k = 0;
  while (n.shiftRight(k).toJSNumber() > 0) {
    k++;
  }

  if (k === 0) {
    return mint(0);
  }

  // initial guess
  k = Math.floor((k - 1) / index);

  const j = Math.floor(k / 32 + 1);
  let x = bigInt(j);

  for (let i = 0; i < j; i++) {
    // zero-out the ith bit
    x = x.and(bigInt(1).shiftLeft(i).not());
  }

  while (k >= 0) {
    // set the kth bit
    x = x.or(bigInt(1).shiftLeft(k));

    const y = mpow(x, index);
    switch (mcmp(y, n)) {
      case 0:
        return x;
      case 1:
        //mp_clr_bit(x, k)
        // clear the kth bit
        x = x.and(bigInt(1).shiftLeft(k).not());
        break;
    }
    k--;
  }

  return 0;
}

//if SELFTEST
