import { cadr, Constants, evalPolar, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { exponential } from '../sources/misc';
import { abs } from './abs';
import { arg } from './arg';
import { Eval } from './eval';
import { multiply } from './multiply';

/*
Convert complex z to polar form

  Input:    p1  z
  Output:    Result

  polar(z) = abs(z) * exp(i * arg(z))
*/
export function Eval_polar(p1: U) {
  push(cadr(p1));
  Eval();
  push(polar(pop()));
}

export function polar(p1: U): U {
  // there are points where we turn polar
  // representations into rect, we set a "stack flag"
  // here to avoid that, so we don't undo the
  // work that we are trying to do.
  return evalPolar(() => {
    return multiply(
      abs(p1),
      exponential(multiply(Constants.imaginaryunit, arg(p1)))
    );
  });
}
