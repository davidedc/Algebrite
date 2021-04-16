import {
  cadddr,
  caddr,
  cadr,
  Constants,
  NIL,
  symbol,
  SYMBOL_X,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { add, subtract } from './add';
import { integer } from './bignum';
import { coeff } from './coeff';
import { Eval } from './eval';
import { divide, multiply } from './multiply';
import { power } from './power';

// Divide polynomials
export function Eval_quotient(p1: U) {
  push(cadr(p1)); // 1st arg, p(x)
  Eval();
  const DIVIDEND = pop();

  push(caddr(p1)); // 2nd arg, q(x)
  Eval();
  const DIVISOR = pop();

  push(cadddr(p1)); // 3rd arg, x
  Eval();
  p1 = pop(); // default x
  if (p1 === symbol(NIL)) {
    p1 = symbol(SYMBOL_X);
  }
  const X = p1;

  push(divpoly(DIVIDEND, DIVISOR, X));
}

//-----------------------------------------------------------------------------
//
//  Divide polynomials
//
//  Input:    Dividend
//            Divisor
//            x
//
//  Output:    Quotient
//
//-----------------------------------------------------------------------------
export function divpoly(DIVIDEND: U, DIVISOR: U, X: U): U {
  const dividendCs = coeff(DIVIDEND, X);
  let m = dividendCs.length - 1; // m is dividend's power

  const divisorCs = coeff(DIVISOR, X);
  const n = divisorCs.length - 1; // n is divisor's power

  let x = m - n;

  let QUOTIENT: U = Constants.zero;
  while (x >= 0) {
    const Q = divide(dividendCs[m], divisorCs[n]);

    for (let i = 0; i <= n; i++) {
      dividendCs[x + i] = subtract(
        dividendCs[x + i],
        multiply(divisorCs[i], Q)
      );
    }

    QUOTIENT = add(QUOTIENT, multiply(Q, power(X, integer(x))));

    m--;
    x--;
  }

  return QUOTIENT;
}
