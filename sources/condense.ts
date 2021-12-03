import { gcd } from './gcd';
import { cadr, Constants, isadd, U, noexpand } from '../runtime/defs';
import { push } from '../runtime/stack';
import { yyexpand } from '../sources/misc';
import { add } from './add';
import { Eval } from './eval';
import { divide, inverse, multiply_noexpand } from './multiply';

// Condense an expression by factoring common terms.

export function Eval_condense(p1: U) {
  const result = Condense(Eval(cadr(p1)));
  push(result);
}

export function Condense(p1: U): U {
  return noexpand(yycondense, p1);
}

export function yycondense(p1: U): U {
  //expanding = 0
  if (!isadd(p1)) {
    return p1;
  }

  // get gcd of all terms
  const termsGCD = p1.tail().reduce(gcd);

  //console.log "condense: this is the gcd of all the terms: " + stack[tos - 1]

  // divide each term by gcd
  const p2 = inverse(termsGCD);
  const temp2 = p1
    .tail()
    .reduce((a: U, b: U) => add(a, multiply_noexpand(p2, b)), Constants.zero);

  // We multiplied above w/o expanding so some factors cancelled.

  // Now we expand which normalizes the result and, in some cases,
  // simplifies it too (see test case H).

  const arg1 = yyexpand(temp2);

  // multiply result by gcd
  return divide(arg1, p2);
}
