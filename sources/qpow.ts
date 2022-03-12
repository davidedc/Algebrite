import bigInt from 'big-integer';
import { Constants, Num, POWER, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { add, subtract } from './add';
import {
  integer,
  bignum_truncate,
  isSmall,
  makePositive,
  makeSignSameAs,
  mp_denominator,
  mp_numerator,
  nativeInt,
} from './bignum';
import {
  isinteger,
  isminusone,
  isnegativenumber,
  isoneovertwo,
  isplusone,
  isZeroAtomOrTensor,
} from './is';
import { makeList } from './list';
import { mpow } from './mpow';
import { mroot } from './mroot';
import { multiply, negate } from './multiply';
import { quickfactor } from './quickfactor';
import {symbol} from "../runtime/symbol";

// Rational power function
export function qpow(base: Num, expo: Num): U {
  return qpowf(base, expo);
}

function qpowf(BASE: Num, EXPO: Num): U {
  //unsigned int a, b, *t, *x, *y

  // if base is 1 or exponent is 0 then return 1
  if (isplusone(BASE) || isZeroAtomOrTensor(EXPO)) {
    return Constants.one;
  }

  // if (-1)^(1/2) -> leave it as is
  if (isminusone(BASE) && isoneovertwo(EXPO)) {
    return Constants.imaginaryunit;
  }

  // if base is zero then return 0
  if (isZeroAtomOrTensor(BASE)) {
    if (isnegativenumber(EXPO)) {
      stop('divide by zero');
    }
    return Constants.zero;
  }

  // if exponent is 1 then return base
  if (isplusone(EXPO)) {
    return BASE;
  }

  let expo = 0;
  let x: bigInt.BigInteger | 0;
  let y: bigInt.BigInteger;
  // if exponent is integer then power
  if (isinteger(EXPO)) {
    expo = nativeInt(EXPO);
    if (isNaN(expo)) {
      // expo greater than 32 bits
      return makeList(symbol(POWER), BASE, EXPO);
    }

    x = mpow(BASE.q.a, Math.abs(expo));
    y = mpow(BASE.q.b, Math.abs(expo));
    if (expo < 0) {
      const t = x;
      x = y;
      y = t;
      x = makeSignSameAs(x, y);
      y = makePositive(y);
    }

    return new Num(x, y);
  }

  // from here on out the exponent is NOT an integer

  // if base is -1 then normalize polar angle
  if (isminusone(BASE)) {
    return normalize_angle(EXPO);
  }

  // if base is negative then (-N)^M -> N^M * (-1)^M
  if (isnegativenumber(BASE)) {
    return multiply(
      qpow(negate(BASE) as Num, EXPO),
      qpow(Constants.negOne, EXPO)
    );
  }

  // if BASE is not an integer then power numerator and denominator
  if (!isinteger(BASE)) {
    return multiply(
      qpow(mp_numerator(BASE), EXPO),
      qpow(mp_denominator(BASE), negate(EXPO) as Num)
    );
  }

  // At this point BASE is a positive integer.

  // If BASE is small then factor it.
  if (is_small_integer(BASE)) {
    return quickfactor(BASE, EXPO);
  }

  // At this point BASE is a positive integer and EXPO is not an integer.
  if (!isSmall(EXPO.q.a) || !isSmall(EXPO.q.b)) {
    return makeList(symbol(POWER), BASE, EXPO);
  }

  const { a, b } = EXPO.q;

  x = mroot(BASE.q.a, b.toJSNumber());

  if (x === 0) {
    return makeList(symbol(POWER), BASE, EXPO);
  }

  y = mpow(x, a);

  return EXPO.q.a.isNegative() ? new Num(bigInt.one, y) : new Num(y);
}

//-----------------------------------------------------------------------------
//
//  Normalize the angle of unit imaginary, i.e. (-1) ^ N
//
//  Input:    N on stack (must be rational, not float)
//
//  Output:    Result on stack
//
//  Note:
//
//  n = q * d + r
//
//  Example:
//            n  d  q  r
//
//  (-1)^(8/3)  ->   (-1)^(2/3)  8  3  2  2
//  (-1)^(7/3)  ->   (-1)^(1/3)  7  3  2  1
//  (-1)^(5/3)  ->  -(-1)^(2/3)  5  3  1  2
//  (-1)^(4/3)  ->  -(-1)^(1/3)  4  3  1  1
//  (-1)^(2/3)  ->   (-1)^(2/3)  2  3  0  2
//  (-1)^(1/3)  ->   (-1)^(1/3)  1  3  0  1
//
//  (-1)^(-1/3)  ->  -(-1)^(2/3)  -1  3  -1  2
//  (-1)^(-2/3)  ->  -(-1)^(1/3)  -2  3  -1  1
//  (-1)^(-4/3)  ->   (-1)^(2/3)  -4  3  -2  2
//  (-1)^(-5/3)  ->   (-1)^(1/3)  -5  3  -2  1
//  (-1)^(-7/3)  ->  -(-1)^(2/3)  -7  3  -3  2
//  (-1)^(-8/3)  ->  -(-1)^(1/3)  -8  3  -3  1
//
//-----------------------------------------------------------------------------
function normalize_angle(A: Num): U {
  // integer exponent?
  if (isinteger(A)) {
    if (A.q.a.isOdd()) {
      return Constants.negOne; // odd exponent
    } else {
      return Constants.one; // even exponent
    }
  }

  // floor
  let Q = bignum_truncate(A);
  if (isnegativenumber(A)) {
    Q = add(Q, Constants.negOne) as Num;
  }

  // remainder (always positive)
  let R = subtract(A, Q);

  // remainder becomes new angle
  let result = makeList(symbol(POWER), Constants.negOne, R);

  // negate if quotient is odd
  if (Q.q.a.isOdd()) {
    result = negate(result);
  }
  return result;
}

function is_small_integer(p: Num): boolean {
  return isSmall(p.q.a);
}
