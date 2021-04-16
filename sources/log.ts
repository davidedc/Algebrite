import {
  caddr,
  cadr,
  Constants,
  E,
  isdouble,
  ismultiply,
  ispower,
  LOG,
  symbol,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { add, subtract } from './add';
import { double } from './bignum';
import { denominator } from './denominator';
import { Eval } from './eval';
import { equaln, isfraction, isnegativenumber } from './is';
import { makeList } from './list';
import { multiply, negate } from './multiply';
import { numerator } from './numerator';

// Natural logarithm.
//
// Note that we use the mathematics / Javascript / Mathematica
// convention that "log" is indeed the natural logarithm.
//
// In engineering, biology, astronomy, "log" can stand instead
// for the "common" logarithm i.e. base 10. Also note that Google
// calculations use log for the common logarithm.
export function Eval_log(p1: U) {
  push(cadr(p1));
  Eval();
  push(logarithm(pop()));
}

export function logarithm(p1: U): U {
  return yylog(p1);
}

function yylog(p1: U): U {
  if (p1 === symbol(E)) {
    return Constants.one;
  }

  if (equaln(p1, 1)) {
    return Constants.zero;
  }

  if (isnegativenumber(p1)) {
    return add(
      logarithm(negate(p1)),
      multiply(Constants.imaginaryunit, Constants.Pi())
    );
  }

  if (isdouble(p1)) {
    return double(Math.log(p1.d));
  }

  // rational number and not an integer?
  if (isfraction(p1)) {
    return subtract(logarithm(numerator(p1)), logarithm(denominator(p1)));
  }

  // log(a ^ b) --> b log(a)
  if (ispower(p1)) {
    return multiply(caddr(p1), logarithm(cadr(p1)));
  }

  // log(a * b) --> log(a) + log(b)
  if (ismultiply(p1)) {
    return p1.tail().map(logarithm).reduce(add, Constants.zero);
  }

  return makeList(symbol(LOG), p1);
}
