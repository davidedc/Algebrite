import { Num, POWER, U } from '../runtime/defs';
import { subtract } from './add';
import { bignum_power_number, bignum_truncate, nativeInt } from './bignum';
import { factor_small_number } from './factor';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { multiply, multiply_all } from './multiply';
import {symbol} from "../runtime/symbol";

//-----------------------------------------------------------------------------
//
//  Factor small numerical powers
//
//  Input:    BASE        Base (positive integer < 2^31 - 1)
//            EXPONENT    Exponent
//
//  Output:    Expr
//
//-----------------------------------------------------------------------------
export function quickfactor(BASE: Num, EXPO: Num): U {
  const arr: U[] = factor_small_number(nativeInt(BASE));
  const n = arr.length;

  for (let i = 0; i < n; i += 2) {
    arr.push(...quickpower(arr[i] as Num, multiply(arr[i + 1], EXPO) as Num)); // factored base, factored exponent * EXPO
  }

  // arr0 has n results from factor_number_raw()
  // on top of that are all the expressions from quickpower()
  // multiply the quickpower() results
  return multiply_all(arr.slice(n));
}

// BASE is a prime number so power is simpler
export function quickpower(BASE: Num, EXPO: Num): [U] | [U, U] {
  const p3 = bignum_truncate(EXPO);
  const p4 = subtract(EXPO, p3);

  let fractionalPart: U | undefined;
  // fractional part of EXPO
  if (!isZeroAtomOrTensor(p4)) {
    fractionalPart = makeList(symbol(POWER), BASE, p4);
  }

  const expo = nativeInt(p3);
  if (isNaN(expo)) {
    const result = makeList(symbol(POWER), BASE, p3);
    return fractionalPart ? [fractionalPart, result] : [result];
  }

  if (expo === 0) {
    return [fractionalPart];
  }

  const result = bignum_power_number(BASE, expo);
  return fractionalPart ? [fractionalPart, result] : [result];
}

//if SELFTEST
