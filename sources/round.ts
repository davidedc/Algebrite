import {
  cadr,
  Double,
  isdouble,
  isNumericAtom,
  ROUND,
  U
} from '../runtime/defs';
import { symbol } from "../runtime/symbol";
import { double, integer } from './bignum';
import { Eval } from './eval';
import { yyfloat } from './float';
import { isinteger } from './is';
import { makeList } from './list';

export function Eval_round(p1: U) {
  return yround(Eval(cadr(p1)));
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
