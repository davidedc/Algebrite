import {
  ARCTANH,
  cadr,
  car,
  Constants,
  isdouble,
  symbol,
  TANH,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { push } from '../runtime/stack';
import { double } from './bignum';
import { Eval } from './eval';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';

/* arctanh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse hyperbolic tangent of x.

*/
export function Eval_arctanh(x: U) {
  push(arctanh(Eval(cadr(x))));
}

function arctanh(x: U): U {
  if (car(x) === symbol(TANH)) {
    return cadr(x);
  }

  if (isdouble(x)) {
    let { d } = x;
    if (d < -1.0 || d > 1.0) {
      stop('arctanh function argument is not in the interval [-1,1]');
    }
    d = Math.log((1.0 + d) / (1.0 - d)) / 2.0;
    return double(d);
  }

  if (isZeroAtomOrTensor(x)) {
    return Constants.zero;
  }

  return makeList(symbol(ARCTANH), x);
}
