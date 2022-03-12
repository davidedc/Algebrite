import {
  ARCSIN,
  cadr,
  car,
  cdr,
  Constants,
  defs,
  isdouble,
  ismultiply,
  isrational,
  PI,
  POWER,
  SIN,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { double, integer, rational, nativeInt } from './bignum';
import { Eval } from './eval';
import {
  equaln,
  equalq,
  isminusoneoversqrttwo,
  isMinusSqrtThreeOverTwo,
  isoneoversqrttwo,
  isSqrtThreeOverTwo,
} from './is';
import { makeList } from './list';
import { multiply } from './multiply';
import {symbol} from "../runtime/symbol";

/* arcsin =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse sine of x.

*/
export function Eval_arcsin(x: U) {
  push(arcsin(Eval(cadr(x))));
}

function arcsin(x: U): U {
  if (car(x) === symbol(SIN)) {
    return cadr(x);
  }

  if (isdouble(x)) {
    return double(Math.asin(x.d));
  }

  // if x == 1/sqrt(2) then return 1/4*pi (45 degrees)
  // second if catches the other way of saying it, sqrt(2)/2
  if (
    isoneoversqrttwo(x) ||
    (ismultiply(x) &&
      equalq(car(cdr(x)), 1, 2) &&
      car(car(cdr(cdr(x)))) === symbol(POWER) &&
      equaln(car(cdr(car(cdr(cdr(x))))), 2) &&
      equalq(car(cdr(cdr(car(cdr(cdr(x)))))), 1, 2))
  ) {
    return multiply(rational(1, 4), symbol(PI));
  }

  // if x == -1/sqrt(2) then return -1/4*pi (-45 degrees)
  // second if catches the other way of saying it, -sqrt(2)/2
  if (
    isminusoneoversqrttwo(x) ||
    (ismultiply(x) &&
      equalq(car(cdr(x)), -1, 2) &&
      car(car(cdr(cdr(x)))) === symbol(POWER) &&
      equaln(car(cdr(car(cdr(cdr(x))))), 2) &&
      equalq(car(cdr(cdr(car(cdr(cdr(x)))))), 1, 2))
  ) {
    return defs.evaluatingAsFloats
      ? double(-Math.PI / 4.0)
      : multiply(rational(-1, 4), symbol(PI));
  }

  // if x == sqrt(3)/2 then return 1/3*pi (60 degrees)
  if (isSqrtThreeOverTwo(x)) {
    return defs.evaluatingAsFloats
      ? double(Math.PI / 3.0)
      : multiply(rational(1, 3), symbol(PI));
  }

  // if x == -sqrt(3)/2 then return -1/3*pi (-60 degrees)
  if (isMinusSqrtThreeOverTwo(x)) {
    return defs.evaluatingAsFloats
      ? double(-Math.PI / 3.0)
      : multiply(rational(-1, 3), symbol(PI));
  }

  if (!isrational(x)) {
    return makeList(symbol(ARCSIN), x);
  }

  const n = nativeInt(multiply(x, integer(2)));
  switch (n) {
    case -2:
      return defs.evaluatingAsFloats
        ? double(-Math.PI / 2.0)
        : multiply(rational(-1, 2), symbol(PI));
    case -1:
      return defs.evaluatingAsFloats
        ? double(-Math.PI / 6.0)
        : multiply(rational(-1, 6), symbol(PI));
    case 0:
      return Constants.Zero();
    case 1:
      return defs.evaluatingAsFloats
        ? double(Math.PI / 6.0)
        : multiply(rational(1, 6), symbol(PI));
    case 2:
      return defs.evaluatingAsFloats
        ? double(Math.PI / 2.0)
        : multiply(rational(1, 2), symbol(PI));
    default:
      return makeList(symbol(ARCSIN), x);
  }
}
