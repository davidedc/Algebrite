import { cadr, Constants, ERF, isdouble, symbol, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { double } from './bignum';
import { erfc } from './erfc';
import { Eval } from './eval';
import { isnegativeterm, isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { negate } from './multiply';

/* erf =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Authors
-------
philippe.billet@noos.fr

Parameters
----------
x

General description
-------------------
Error function erf(x).
erf(-x)=erf(x)

*/
export function Eval_erf(p1: U) {
  push(cadr(p1));
  Eval();
  push(yerf(pop()));
}

function yerf(p1: U): U {
  return yyerf(p1);
}

function yyerf(p1: U): U {
  if (isdouble(p1)) {
    return double(1.0 - erfc(p1.d));
  }

  if (isZeroAtomOrTensor(p1)) {
    return Constants.zero;
  }

  if (isnegativeterm(p1)) {
    return negate(makeList(symbol(ERF), negate(p1)));
  }

  return makeList(symbol(ERF), p1);
}
