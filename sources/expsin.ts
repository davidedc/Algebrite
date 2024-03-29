import { cadr, Constants, U } from '../runtime/defs';
import { exponential } from '../sources/misc';
import { subtract } from './add';
import { rational } from './bignum';
import { Eval } from './eval';
import { divide, multiply, negate } from './multiply';

// Do the exponential sine function.
export function Eval_expsin(p1: U) {
  return expsin(Eval(cadr(p1)));
}

export function expsin(p1: U): U {
  return subtract(
    multiply(
      divide(
        exponential(multiply(Constants.imaginaryunit, p1)),
        Constants.imaginaryunit
      ),
      rational(1, 2)
    ),
    multiply(
      divide(
        exponential(multiply(negate(Constants.imaginaryunit), p1)),
        Constants.imaginaryunit
      ),
      rational(1, 2)
    )
  );
}
