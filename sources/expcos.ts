import { cadr, Constants, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { exponential } from '../sources/misc';
import { add } from './add';
import { rational } from './bignum';
import { Eval } from './eval';
import { multiply, negate } from './multiply';

// Do the exponential cosine function.
export function Eval_expcos(p1: U) {
  push(cadr(p1));
  Eval();
  push(expcos(pop()));
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
