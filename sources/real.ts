import { cadr, U } from '../runtime/defs';
import { push } from '../runtime/stack';
import { add } from './add';
import { integer } from './bignum';
import { conjugate } from './conj';
import { Eval } from './eval';
import { divide } from './multiply';
import { rect } from './rect';

/*
 Returns the real part of complex z

  z    real(z)
  -    -------

  a + i b    a

  exp(i a)  cos(a)
*/
export function Eval_real(p1: U) {
  const result = real(Eval(cadr(p1)));
  push(result);
}

export function real(p: U): U {
  const p1 = rect(p);
  return divide(add(p1, conjugate(p1)), integer(2));
}
