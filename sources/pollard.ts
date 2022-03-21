import bigInt from 'big-integer';
import {Constants, defs, MEQUAL, MULTIPLY, Num, POWER, primetab, U,} from '../runtime/defs';
import {mcmp} from '../runtime/mcmp';
import {stop} from '../runtime/run';
import {symbol} from '../runtime/symbol';
import {mint, setSignTo} from './bignum';
import {equaln} from './is';
import { makeList } from './list';
import {madd, msub} from './madd';
import {mgcd} from './mgcd';
import {mdiv, mdivrem, mmod, mmul} from './mmul';
import {mprime} from './mprime';

// Factor using the Pollard rho method

let n_factor_number = bigInt(0);

export function factor_number(p1: Num): U {
  // 0 or 1?
  if (equaln(p1, 0) || equaln(p1, 1) || equaln(p1, -1)) {
    return p1;
  }
  n_factor_number = p1.q.a;

  const factors = factor_a();
  if (factors.length == 1) {
    return factors[0];
  }
  return makeList(symbol(MULTIPLY), ...factors);
}

// factor using table look-up, then switch to rho method if necessary
// From TAOCP Vol. 2 by Knuth, p. 380 (Algorithm A)
function factor_a(): U[] {
  const result: U[] = [];

  if (n_factor_number.isNegative()) {
    n_factor_number = setSignTo(n_factor_number, 1);
    result.push(Constants.negOne);
  }

  for (let k = 0; k < 10000; k++) {
    result.push(...try_kth_prime(k));
    // if n_factor_number is 1 then we're done
    if (n_factor_number.compare(1) === 0) {
      return result;
    }
  }

  result.push(...factor_b());
  return result;
}

function try_kth_prime(k: number): U[] {
  const result: U[] = [];
  let q: bigInt.BigInteger;

  const d = mint(primetab[k]);

  let count = 0;
  while (true) {
    // if n_factor_number is 1 then we're done
    if (n_factor_number.compare(1) === 0) {
      if (count) {
        result.push(_factor(d, count));
      }
      return result;
    }

    let r: bigInt.BigInteger;
    [q, r] = Array.from(mdivrem(n_factor_number, d));

    // continue looping while remainder is zero
    if (r.isZero()) {
      count++;
      n_factor_number = q;
    } else {
      break;
    }
  }

  if (count) {
    result.push(_factor(d, count));
  }

  // q = n_factor_number/d, hence if q < d then
  // n_factor_number < d^2 so n_factor_number is prime
  if (mcmp(q, d) === -1) {
    result.push(_factor(n_factor_number, 1));
    n_factor_number = mint(1);
  }
  return result;
}

// From TAOCP Vol. 2 by Knuth, p. 385 (Algorithm B)
function factor_b(): U[] {
  const result: U[] = [];
  const bigint_one = mint(1);
  let x = mint(5);
  let xprime = mint(2);

  let k = 1;
  let l = 1;

  while (true) {
    if (mprime(n_factor_number)) {
      result.push(_factor(n_factor_number, 1));
      return result;
    }

    while (true) {
      if (defs.esc_flag) {
        stop('esc');
      }

      // g = gcd(x' - x, n_factor_number)
      let t = msub(xprime, x);
      t = setSignTo(t, 1);
      const g = mgcd(t, n_factor_number);

      if (MEQUAL(g, 1)) {
        if (--k === 0) {
          xprime = x;
          l *= 2;
          k = l;
        }

        // x = (x ^ 2 + 1) mod n_factor_number
        t = mmul(x, x);
        x = madd(t, bigint_one);
        t = mmod(x, n_factor_number);
        x = t;

        continue;
      }

      result.push(_factor(g, 1));

      if (mcmp(g, n_factor_number) === 0) {
        return result;
      }

      // n_factor_number = n_factor_number / g
      t = mdiv(n_factor_number, g);
      n_factor_number = t;

      // x = x mod n_factor_number
      t = mmod(x, n_factor_number);
      x = t;

      // xprime = xprime mod n_factor_number
      t = mmod(xprime, n_factor_number);
      xprime = t;

      break;
    }
  }
}

function _factor(d: bigInt.BigInteger, count: number): U {
  let factor: U = new Num(d);
  if (count > 1) {
    factor = makeList(symbol(POWER), factor, new Num(mint(count)));
  }
  return factor;
}
