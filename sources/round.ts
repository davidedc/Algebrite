import {
  cadr,
  Double,
  isdouble,
  isNumericAtom,
  ROUND,
  symbol,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { double, integer } from './bignum';
import { Eval } from './eval';
import { yyfloat } from './float';
import { isinteger } from './is';
import { makeList } from './list';

export function Eval_round(p1: U) {
  const result = yround(Eval(cadr(p1)));
  push(result);
}

function yround(p1: U): U {
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
