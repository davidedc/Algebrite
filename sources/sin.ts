import {
  ARCSIN,
  ARCTAN,
  cadr,
  car,
  cdr,
  Constants,
  isadd,
  iscons,
  isdouble,
  SIN,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { add, subtract } from './add';
import { double, integer, rational, nativeInt } from './bignum';
import { cosine } from './cos';
import { Eval } from './eval';
import { isnegative, isnpi } from './is';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { power } from './power';
import {symbol} from "../runtime/symbol";

// Sine function of numerical and symbolic arguments
export function Eval_sin(p1: U) {
  const result = sine(Eval(cadr(p1)));
  push(result);
}

export function sine(p1: U): U {
  if (isadd(p1)) {
    // sin of a sum can be further decomposed into
    //sin(alpha+beta) = sin(alpha)*cos(beta)+sin(beta)*cos(alpha)
    return sine_of_angle_sum(p1);
  }
  return sine_of_angle(p1);
}
//console.log "sine end ---- "

// Use angle sum formula for special angles.

// decompose sum sin(alpha+beta) into
// sin(alpha)*cos(beta)+sin(beta)*cos(alpha)
function sine_of_angle_sum(p1: U): U {
  let p2 = cdr(p1);
  while (iscons(p2)) {
    const B = car(p2);
    if (isnpi(B)) {
      const A = subtract(p1, B);
      return add(multiply(sine(A), cosine(B)), multiply(cosine(A), sine(B)));
    }
    p2 = cdr(p2);
  }
  return sine_of_angle(p1);
}

function sine_of_angle(p1: U): U {
  if (car(p1) === symbol(ARCSIN)) {
    return cadr(p1);
  }

  if (isdouble(p1)) {
    let d = Math.sin(p1.d);
    if (Math.abs(d) < 1e-10) {
      d = 0.0;
    }
    return double(d);
  }

  // sine function is antisymmetric, sin(-x) = -sin(x)
  if (isnegative(p1)) {
    return negate(sine(negate(p1)));
  }

  // sin(arctan(x)) = x / sqrt(1 + x^2)

  // see p. 173 of the CRC Handbook of Mathematical Sciences
  if (car(p1) === symbol(ARCTAN)) {
    return multiply(
      cadr(p1),
      power(add(Constants.one, power(cadr(p1), integer(2))), rational(-1, 2))
    );
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
    return makeList(symbol(SIN), p1);
  }

  // values of some famous angles. Many more here:
  // https://en.wikipedia.org/wiki/Trigonometric_constants_expressed_in_real_radicals
  switch (n % 360) {
    case 0:
    case 180:
      return Constants.zero;
    case 30:
    case 150:
      return rational(1, 2);
    case 210:
    case 330:
      return rational(-1, 2);
    case 45:
    case 135:
      return multiply(rational(1, 2), power(integer(2), rational(1, 2)));
    case 225:
    case 315:
      return multiply(rational(-1, 2), power(integer(2), rational(1, 2)));
    case 60:
    case 120:
      return multiply(rational(1, 2), power(integer(3), rational(1, 2)));
    case 240:
    case 300:
      return multiply(rational(-1, 2), power(integer(3), rational(1, 2)));
    case 90:
      return Constants.one;
    case 270:
      return Constants.negOne;
    default:
      return makeList(symbol(SIN), p1);
  }
}
