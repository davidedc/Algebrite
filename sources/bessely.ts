import {
  BESSELY,
  caddr,
  cadr,
  Constants,
  isdouble,
  symbol,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { double, nativeInt } from './bignum';
import { Eval } from './eval';
import { isnegativeterm } from './is';
import { makeList } from './list';
import { multiply, negate } from './multiply';
import { power } from './power';
import { yn } from '../runtime/otherCFunctions';

/* bessely =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x,n

General description
-------------------

Bessel function of second kind.

*/
export function Eval_bessely(p1: U) {
  const result = bessely(Eval(cadr(p1)), Eval(caddr(p1)));
  push(result);
}

export function bessely(p1: U, p2: U): U {
  return yybessely(p1, p2);
}

function yybessely(X: U, N: U): U {
  const n = nativeInt(N);

  if (isdouble(X) && !isNaN(n)) {
    const d = yn(n, X.d);
    return double(d);
  }

  if (isnegativeterm(N)) {
    return multiply(
      power(Constants.negOne, N),
      makeList(symbol(BESSELY), X, negate(N))
    );
  }

  return makeList(symbol(BESSELY), X, N);
}
