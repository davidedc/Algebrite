import {
  cadr,
  Constants,
  FLOOR,
  isdouble,
  isNumericAtom,
  Num,
  U
} from '../runtime/defs';
import { symbol } from "../runtime/symbol";
import { add } from './add';
import { double } from './bignum';
import { Eval } from './eval';
import { isinteger, isnegativenumber } from './is';
import { makeList } from './list';
import { mdiv } from './mmul';

export function Eval_floor(p1: U) {
  return yfloor(Eval(cadr(p1)));
}

function yfloor(p1: U): U {
  return yyfloor(p1);
}

function yyfloor(p1: U): U {
  if (!isNumericAtom(p1)) {
    return makeList(symbol(FLOOR), p1);
  }

  if (isdouble(p1)) {
    return double(Math.floor(p1.d));
  }

  if (isinteger(p1)) {
    return p1;
  }

  let p3: U = new Num(mdiv(p1.q.a, p1.q.b));

  if (isnegativenumber(p1)) {
    p3 = add(p3, Constants.negOne);
  }
  return p3;
}
