import {
  cadddr,
  caddr,
  cadr,
  Constants,
  doexpand,
  NIL,
  SYMBOL_X,
  U
} from '../runtime/defs';
import { symbol } from "../runtime/symbol";
import { equal } from '../sources/misc';
import { subtract } from './add';
import { Eval } from './eval';
import { filter } from './filter';
import { divide } from './multiply';
import { power } from './power';
import { subst } from './subst';

/* coeff =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p,x,n

General description
-------------------
Returns the coefficient of x^n in polynomial p. The x argument can be omitted for polynomials in x.

*/
export function Eval_coeff(p1: U) {
  let N = Eval(cadddr(p1));
  let X = Eval(caddr(p1));
  const P = Eval(cadr(p1));

  if (N === symbol(NIL)) {
    // only 2 args?
    N = X;
    X = symbol(SYMBOL_X);
  }

  // divide p by x^n, keep the constant part
  return filter(divide(P, power(X, N)), X);
}

//-----------------------------------------------------------------------------
//
//  Get polynomial coefficients
//
//  Input:  p(x) (the polynomial)
//
//          x (the variable)
//
//  Output:    Returns the array of coefficients:
//
//      [Coefficient of x^0, ..., Coefficient of x^(n-1)]
//
//-----------------------------------------------------------------------------

export function coeff(p: U, x: U): U[] {
  const coefficients = [];

  while (true) {
    const c = Eval(subst(p, x, Constants.zero));
    coefficients.push(c);

    p = subtract(p, c);

    if (equal(p, Constants.zero)) {
      return coefficients;
    }

    p = doexpand(divide, p, x);
  }
}
