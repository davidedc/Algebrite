import { caddr, cadr, NIL, symbol, U } from '../runtime/defs';
import { pop, push, top } from '../runtime/stack';
import { degree } from './degree';
import { Eval } from './eval';
import { filter } from './filter';
import { guess } from './guess';
import { divide } from './multiply';
import { power } from './power';

/*
 Return the leading coefficient of a polynomial.

Example

  leading(5x^2+x+1,x)

Result

  5

The result is undefined if P is not a polynomial.
*/
export function Eval_leading(p1: U) {
  push(cadr(p1));
  Eval();
  push(caddr(p1));
  Eval();
  p1 = pop();
  const X = p1 === symbol(NIL) ? guess(top()) : p1;
  const P = pop();
  push(leading(P, X));
}

function leading(P: U, X: U) {
  // N = degree of P
  const N = degree(P, X);

  // divide through by X ^ N, remove terms that depend on X
  return filter(divide(P, power(X, N)), X);
}
