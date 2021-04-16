import {
  cadr,
  car,
  COS,
  COSH,
  Constants,
  iscons,
  SIN,
  SINH,
  symbol,
  TAN,
  TANH,
  TENSOR,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { exponential } from '../sources/misc';
import { add, subtract } from './add';
import { integer, rational } from './bignum';
import { Eval } from './eval';
import { expcos } from './expcos';
import { expsin } from './expsin';
import { divide, multiply, negate } from './multiply';
import { copy_tensor } from './tensor';

/* circexp =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Returns expression x with circular and hyperbolic functions converted to exponential forms. Sometimes this will simplify an expression.

*/
export function Eval_circexp(p1: U) {
  push(cadr(p1));
  Eval();

  push(circexp(pop()));

  // normalize

  Eval();
}

function circexp(p1: U): U {
  if (car(p1) === symbol(COS)) {
    return expcos(cadr(p1));
  }

  if (car(p1) === symbol(SIN)) {
    return expsin(cadr(p1));
  }

  if (car(p1) === symbol(TAN)) {
    p1 = cadr(p1);
    const p2 = exponential(multiply(Constants.imaginaryunit, p1));
    const p3 = exponential(negate(multiply(Constants.imaginaryunit, p1)));

    return divide(
      multiply(subtract(p3, p2), Constants.imaginaryunit),
      add(p2, p3)
    );
  }

  if (car(p1) === symbol(COSH)) {
    p1 = cadr(p1);
    return multiply(
      add(exponential(p1), exponential(negate(p1))),
      rational(1, 2)
    );
  }

  if (car(p1) === symbol(SINH)) {
    p1 = cadr(p1);
    return multiply(
      subtract(exponential(p1), exponential(negate(p1))),
      rational(1, 2)
    );
  }

  if (car(p1) === symbol(TANH)) {
    p1 = exponential(multiply(cadr(p1), integer(2)));
    return divide(subtract(p1, Constants.one), add(p1, Constants.one));
  }

  if (iscons(p1)) {
    return p1.map(circexp);
  }

  if (p1.k === TENSOR) {
    p1 = copy_tensor(p1);
    p1.tensor.elem = p1.tensor.elem.map(circexp);
    return p1;
  }

  return p1;
}
