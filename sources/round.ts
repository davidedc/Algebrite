import {
  cadr,
  Double,
  isdouble,
  isNumericAtom,
  ROUND,
  symbol,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { double, integer } from './bignum';
import { Eval } from './eval';
import { yyfloat } from './float';
import { isinteger } from './is';
import { makeList } from './list';

export function Eval_round(p1: U) {
  push(cadr(p1));
  Eval();
  push(yround(pop()));
}

function yround(p1: U): U {
  return yyround(p1);
}

function yyround(p1: U) {
  if (!isNumericAtom(p1)) {
    return makeList(symbol(ROUND), p1);
  }

  if (isdouble(p1)) {
    return double(Math.round(p1.d));
  }

  if (isinteger(p1)) {
    return p1;
  }

  p1 = yyfloat(p1) as Double;
  return integer(Math.round(p1.d));
}
