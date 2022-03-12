import {
  ARCTANH,
  cadr,
  car,
  Constants,
  isdouble,
  TANH,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { double } from './bignum';
import { Eval } from './eval';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import {symbol} from "../runtime/symbol";

//             exp(2 x) - 1
//  tanh(x) = --------------
//             exp(2 x) + 1
export function Eval_tanh(p1: U) {
  const result = tanh(Eval(cadr(p1)));
  push(result);
}

function tanh(p1: U): U {
  if (car(p1) === symbol(ARCTANH)) {
    return cadr(p1);
  }
  if (isdouble(p1)) {
    let d = Math.tanh(p1.d);
    if (Math.abs(d) < 1e-10) {
      d = 0.0;
    }
    return double(d);
  }
  if (isZeroAtomOrTensor(p1)) {
    return Constants.zero;
  }
  return makeList(symbol(TANH), p1);
}
