import {
  cadddr,
  caddr,
  cadr,
  Constants,
  issymbol,
  LAGUERRE,
  NIL,
  SECRETX,
  symbol,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { add, subtract } from './add';
import { integer, nativeInt } from './bignum';
import { Eval } from './eval';
import { makeList } from './list';
import { divide, multiply } from './multiply';
import { subst } from './subst';

/*
 Laguerre function

Example

  laguerre(x,3)

Result

     1   3    3   2
  - --- x  + --- x  - 3 x + 1
     6        2

The computation uses the following recurrence relation.

  L(x,0,k) = 1

  L(x,1,k) = -x + k + 1

  n*L(x,n,k) = (2*(n-1)+1-x+k)*L(x,n-1,k) - (n-1+k)*L(x,n-2,k)

In the "for" loop i = n-1 so the recurrence relation becomes

  (i+1)*L(x,n,k) = (2*i+1-x+k)*L(x,n-1,k) - (i+k)*L(x,n-2,k)
*/
export function Eval_laguerre(p1: U) {
  // 1st arg
  const X = Eval(cadr(p1));

  // 2nd arg
  const N = Eval(caddr(p1));

  // 3rd arg
  const p2 = Eval(cadddr(p1));
  const K = p2 === symbol(NIL) ? Constants.zero : p2;

  push(laguerre(X, N, K));
}

function laguerre(X: U, N: U, K: U): U {
  let n = nativeInt(N);
  if (n < 0 || isNaN(n)) {
    return makeList(symbol(LAGUERRE), X, N, K);
  }

  if (issymbol(X)) {
    return laguerre2(n, X, K);
  }

  return Eval(subst(laguerre2(n, symbol(SECRETX), K), symbol(SECRETX), X));
}

function laguerre2(n: number, p1: U, p3: U): U {
  let Y0: U = Constants.zero;
  let Y1: U = Constants.one;

  for (let i = 0; i < n; i++) {
    const result = divide(
      subtract(
        multiply(add(subtract(integer(2 * i + 1), p1), p3), Y1),
        multiply(add(integer(i), p3), Y0)
      ),
      integer(i + 1)
    );
    Y0 = Y1;
    Y1 = result;
  }

  return Y1;
}
