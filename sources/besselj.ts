import {
  BESSELJ,
  caddr,
  cadr,
  Constants,
  defs,
  isdouble,
  MEQUAL,
  MSIGN,
  NUM,
  PI,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { subtract } from './add';
import { double, integer, rational, nativeInt } from './bignum';
import { cosine } from './cos';
import { Eval } from './eval';
import { isnegativeterm, isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { power } from './power';
import { sine } from './sin';
import { jn } from '../runtime/otherCFunctions';
import {symbol} from "../runtime/symbol";

/* besselj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x,n

General description
-------------------

Returns a solution to the Bessel differential equation (Bessel function of first kind).

Recurrence relation:

  besselj(x,n) = (2/x) (n-1) besselj(x,n-1) - besselj(x,n-2)

  besselj(x,1/2) = sqrt(2/pi/x) sin(x)

  besselj(x,-1/2) = sqrt(2/pi/x) cos(x)

For negative n, reorder the recurrence relation as:

  besselj(x,n-2) = (2/x) (n-1) besselj(x,n-1) - besselj(x,n)

Substitute n+2 for n to obtain

  besselj(x,n) = (2/x) (n+1) besselj(x,n+1) - besselj(x,n+2)

Examples:

  besselj(x,3/2) = (1/x) besselj(x,1/2) - besselj(x,-1/2)

  besselj(x,-3/2) = -(1/x) besselj(x,-1/2) - besselj(x,1/2)

*/
export function Eval_besselj(p1: U) {
  const result = besselj(Eval(cadr(p1)), Eval(caddr(p1)));
  push(result);
}

export function besselj(p1: U, p2: U): U {
  return yybesselj(p1, p2);
}

function yybesselj(X: U, N: U): U {
  const n = nativeInt(N);

  // numerical result
  if (isdouble(X) && !isNaN(n)) {
    const d = jn(n, X.d);
    return double(d);
  }

  // bessej(0,0) = 1
  if (isZeroAtomOrTensor(X) && isZeroAtomOrTensor(N)) {
    return Constants.one;
  }

  // besselj(0,n) = 0
  if (isZeroAtomOrTensor(X) && !isNaN(n)) {
    return Constants.zero;
  }

  // half arguments
  if (N.k === NUM && MEQUAL(N.q.b, 2)) {
    // n = 1/2
    if (MEQUAL(N.q.a, 1)) {
      const twoOverPi = defs.evaluatingAsFloats
        ? double(2.0 / Math.PI)
        : divide(integer(2), symbol(PI));
      return multiply(power(divide(twoOverPi, X), rational(1, 2)), sine(X));
    }

    // n = -1/2
    if (MEQUAL(N.q.a, -1)) {
      const twoOverPi = defs.evaluatingAsFloats
        ? double(2.0 / Math.PI)
        : divide(integer(2), symbol(PI));
      return multiply(power(divide(twoOverPi, X), rational(1, 2)), cosine(X));
    }

    // besselj(x,n) = (2/x) (n-sgn(n)) besselj(x,n-sgn(n)) - besselj(x,n-2*sgn(n))
    const SGN = integer(MSIGN(N.q.a));

    return subtract(
      multiply(
        multiply(divide(integer(2), X), subtract(N, SGN)),
        besselj(X, subtract(N, SGN))
      ),
      besselj(X, subtract(N, multiply(integer(2), SGN)))
    );
  }

  //if 0 # test cases needed
  if (isnegativeterm(X)) {
    return multiply(
      multiply(power(negate(X), N), power(X, negate(N))),
      makeList(symbol(BESSELJ), negate(X), N)
    );
  }

  if (isnegativeterm(N)) {
    return multiply(
      power(Constants.negOne, N),
      makeList(symbol(BESSELJ), X, negate(N))
    );
  }

  return makeList(symbol(BESSELJ), X, N);
}
