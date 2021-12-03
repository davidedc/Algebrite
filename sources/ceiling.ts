import {
  cadr,
  CEILING,
  Constants,
  isdouble,
  isNumericAtom,
  Num,
  symbol,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { add } from './add';
import { double } from './bignum';
import { Eval } from './eval';
import { isinteger, isnegativenumber } from './is';
import { makeList } from './list';
import { mdiv } from './mmul';

/* ceiling =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Returns the smallest integer not less than x.

*/
export function Eval_ceiling(p1: U) {
  const result = ceiling(Eval(cadr(p1)));
  push(result);
}

function ceiling(p1: U): U {
  return yyceiling(p1);
}

function yyceiling(p1: U): U {
  if (!isNumericAtom(p1)) {
    return makeList(symbol(CEILING), p1);
  }

  if (isdouble(p1)) {
    return double(Math.ceil(p1.d));
  }

  if (isinteger(p1)) {
    return p1;
  }

  let result: U = new Num(mdiv(p1.q.a, p1.q.b));
  if (!isnegativenumber(p1)) {
    result = add(result, Constants.one);
  }
  return result;
}
