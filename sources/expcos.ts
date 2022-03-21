import { cadr, Constants, U } from '../runtime/defs';
import { exponential } from '../sources/misc';
import { add } from './add';
import { rational } from './bignum';
import { Eval } from './eval';
import { multiply, negate } from './multiply';

// Do the exponential cosine function.
export function Eval_expcos(p1: U) {
  return expcos(Eval(cadr(p1)));
}

export function expcos(p1: U): U {
  return add(
    multiply(
      exponential(multiply(Constants.imaginaryunit, p1)),
      rational(1, 2)
    ),
    multiply(
      exponential(multiply(negate(Constants.imaginaryunit), p1)),
      rational(1, 2)
    )
  );
}
