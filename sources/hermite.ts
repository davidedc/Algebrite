import {
  Constants,
  HERMITE,
  issymbol,
  SECRETX,
  symbol,
  U,
} from '../runtime/defs';
import { subtract } from './add';
import { integer, nativeInt } from './bignum';
import { Eval } from './eval';
import { makeList } from './list';
import { multiply } from './multiply';
import { subst } from './subst';

//-----------------------------------------------------------------------------
//
//  Hermite polynomial
//
//  Input:    p1    x  (can be a symbol or expr)
//            p2    n
//
//  Output:    Result
//
//-----------------------------------------------------------------------------
export function hermite(p1: U, p2: U): U {
  return yyhermite(p1, p2);
}

// uses the recurrence relation H(x,n+1)=2*x*H(x,n)-2*n*H(x,n-1)
function yyhermite(X: U, N: U): U {
  const n = nativeInt(N);
  if (n < 0 || isNaN(n)) {
    return makeList(symbol(HERMITE), X, N);
  }

  if (issymbol(X)) {
    return yyhermite2(n, X);
  }

  return Eval(subst(yyhermite2(n, symbol(SECRETX)), symbol(SECRETX), X));
}

function yyhermite2(n: number, p1: U) {
  let Y1: U = Constants.zero;
  let temp: U = Constants.one;
  for (let i = 0; i < n; i++) {
    const Y0: U = Y1;
    Y1 = temp;
    temp = multiply(
      subtract(multiply(p1, Y1), multiply(integer(i), Y0)),
      integer(2)
    );
  }
  return temp;
}
