import {
  ARCCOS,
  ARCTAN,
  cadr,
  car,
  Constants,
  COS,
  isadd,
  iscons,
  isdouble,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { add, subtract } from './add';
import { double, integer, rational, nativeInt } from './bignum';
import { Eval } from './eval';
import { isnegative, isnpi } from './is';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { power } from './power';
import { sine } from './sin';
import {symbol} from "../runtime/symbol";

/* cos =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the cosine of x.

*/
export function Eval_cos(p1: U) {
  const result = cosine(Eval(cadr(p1)));
  push(result);
}

export function cosine(p1: U): U {
  if (isadd(p1)) {
    return cosine_of_angle_sum(p1);
  }
  return cosine_of_angle(p1);
}

// Use angle sum formula for special angles.
function cosine_of_angle_sum(p1: U): U {
  if (iscons(p1)) {
    for (const B of p1.tail()) {
      if (isnpi(B)) {
        const A = subtract(p1, B);
        return subtract(
          multiply(cosine(A), cosine(B)),
          multiply(sine(A), sine(B))
        );
      }
    }
  }
  return cosine_of_angle(p1);
}

function cosine_of_angle(p1: U): U {
  if (car(p1) === symbol(ARCCOS)) {
    return cadr(p1);
  }

  if (isdouble(p1)) {
    let d = Math.cos(p1.d);
    if (Math.abs(d) < 1e-10) {
      d = 0.0;
    }
    return double(d);
  }

  // cosine function is symmetric, cos(-x) = cos(x)

  if (isnegative(p1)) {
    p1 = negate(p1);
  }

  // cos(arctan(x)) = 1 / sqrt(1 + x^2)

  // see p. 173 of the CRC Handbook of Mathematical Sciences

  if (car(p1) === symbol(ARCTAN)) {
    const base = add(Constants.one, power(cadr(p1), integer(2)));
    return power(base, rational(-1, 2));
  }

  // multiply by 180/pi to go from radians to degrees.
  // we go from radians to degrees because it's much
  // easier to calculate symbolic results of most (not all) "classic"
  // angles (e.g. 30,45,60...) if we calculate the degrees
  // and the we do a switch on that.
  // Alternatively, we could look at the fraction of pi
  // (e.g. 60 degrees is 1/3 pi) but that's more
  // convoluted as we'd need to look at both numerator and
  // denominator.

  const n = nativeInt(divide(multiply(p1, integer(180)), Constants.Pi()));

  // most "good" (i.e. compact) trigonometric results
  // happen for a round number of degrees. There are some exceptions
  // though, e.g. 22.5 degrees, which we don't capture here.
  if (n < 0 || isNaN(n)) {
    return makeList(symbol(COS), p1);
  }

  switch (n % 360) {
    case 90:
    case 270:
      return Constants.zero;
    case 60:
    case 300:
      return rational(1, 2);
    case 120:
    case 240:
      return rational(-1, 2);
    case 45:
    case 315:
      return multiply(rational(1, 2), power(integer(2), rational(1, 2)));
    case 135:
    case 225:
      return multiply(rational(-1, 2), power(integer(2), rational(1, 2)));
    case 30:
    case 330:
      return multiply(rational(1, 2), power(integer(3), rational(1, 2)));
    case 150:
    case 210:
      return multiply(rational(-1, 2), power(integer(3), rational(1, 2)));
    case 0:
      return Constants.one;
    case 180:
      return Constants.negOne;
    default:
      return makeList(symbol(COS), p1);
  }
}
