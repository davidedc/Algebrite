import {
  ARCCOS,
  cadr,
  car,
  cdr,
  Constants,
  COS,
  defs,
  isdouble,
  ismultiply,
  isrational,
  PI,
  POWER,
  U
} from '../runtime/defs';
import { symbol } from "../runtime/symbol";
import { double, integer, nativeInt, rational } from './bignum';
import { Eval } from './eval';
import {
  equaln,
  equalq,
  isminusoneoversqrttwo,
  isMinusSqrtThreeOverTwo,
  isoneoversqrttwo,
  isSqrtThreeOverTwo
} from './is';
import { makeList } from './list';
import { multiply } from './multiply';

/* arccos =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse cosine of x.

*/
export function Eval_arccos(x: U) {
  return arccos(Eval(cadr(x)));
}

function arccos(x: U): U {
  if (car(x) === symbol(COS)) {
    return cadr(x);
  }

  if (isdouble(x)) {
    return double(Math.acos(x.d));
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
    return defs.evaluatingAsFloats
      ? double(Math.PI / 4.0)
      : multiply(rational(1, 4), symbol(PI));
  }

  // if x == -1/sqrt(2) then return 3/4*pi (135 degrees)
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
      ? double((Math.PI * 3.0) / 4.0)
      : multiply(rational(3, 4), symbol(PI));
  }

  // if x == sqrt(3)/2 then return 1/6*pi (30 degrees)
  if (isSqrtThreeOverTwo(x)) {
    return defs.evaluatingAsFloats
      ? double(Math.PI / 6.0)
      : multiply(rational(1, 6), symbol(PI));
  }

  // if x == -sqrt(3)/2 then return 5/6*pi (150 degrees)
  if (isMinusSqrtThreeOverTwo(x)) {
    return defs.evaluatingAsFloats
      ? double((5.0 * Math.PI) / 6.0)
      : multiply(rational(5, 6), symbol(PI));
  }

  if (!isrational(x)) {
    return makeList(symbol(ARCCOS), x);
  }

  const n = nativeInt(multiply(x, integer(2)));
  switch (n) {
    case -2:
      return Constants.Pi();
    case -1:
      return defs.evaluatingAsFloats
        ? double((Math.PI * 2.0) / 3.0)
        : multiply(rational(2, 3), symbol(PI));
    case 0:
      return defs.evaluatingAsFloats
        ? double(Math.PI / 2.0)
        : multiply(rational(1, 2), symbol(PI));
    case 1:
      return defs.evaluatingAsFloats
        ? double(Math.PI / 3.0)
        : multiply(rational(1, 3), symbol(PI));
    case 2:
      return Constants.Zero();
    default:
      return makeList(symbol(ARCCOS), x);
  }
}
