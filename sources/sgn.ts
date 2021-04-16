import {
  cadr,
  Constants,
  isdouble,
  isrational,
  MSIGN,
  MZERO,
  SGN,
  symbol,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { absval } from './abs';
import { Eval } from './eval';
import { iscomplexnumber, isnegativeterm } from './is';
import { makeList } from './list';
import { mmul } from './mmul';
import { multiply, negate } from './multiply';
import { power } from './power';

//-----------------------------------------------------------------------------
//
//  Author : philippe.billet@noos.fr
//
//  sgn sign function
//
//
//-----------------------------------------------------------------------------
export function Eval_sgn(p1: U) {
  push(cadr(p1));
  Eval();
  push(sgn(pop()));
}

export function sgn(p1: U): U {
  return yysgn(p1);
}

function yysgn(X: U): U {
  if (isdouble(X)) {
    if (X.d > 0) {
      return Constants.one;
    }
    if (X.d === 0) {
      return Constants.one;
    }
    return Constants.negOne;
  }

  if (isrational(X)) {
    if (MSIGN(mmul(X.q.a, X.q.b)) === -1) {
      return Constants.negOne;
    }
    if (MZERO(mmul(X.q.a, X.q.b))) {
      return Constants.zero;
    }
    return Constants.one;
  }

  if (iscomplexnumber(X)) {
    return multiply(power(Constants.negOne, absval(X)), X);
  }

  if (isnegativeterm(X)) {
    return multiply(makeList(symbol(SGN), negate(X)), Constants.negOne);
  }

  /*
  push_integer(2)
  push(X)
  heaviside()
  multiply()
  push(Constants.negOne)
  add()
  */

  return makeList(symbol(SGN), X);
}
