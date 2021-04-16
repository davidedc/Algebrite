import { cadr, Constants, U } from '../runtime/defs';
import { Find } from '../runtime/find';
import { pop, push } from '../runtime/stack';
import { clockform } from './clock';
import { Eval } from './eval';
import { negate } from './multiply';
import { polar } from './polar';
import { subst } from './subst';

/* conj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
z

General description
-------------------
Returns the complex conjugate of z.

*/
export function Eval_conj(p1: U) {
  push(cadr(p1));
  Eval();
  p1 = pop();
  if (!Find(p1, Constants.imaginaryunit)) {
    // example: (-1)^(1/3)
    push(clockform(conjugate(polar(p1))));
  } else {
    push(conjugate(p1));
  }
}

// careful is you pass this one an expression with
// i (instead of (-1)^(1/2)) then this doesn't work!
export function conjugate(p1: U): U {
  push(subst(p1, Constants.imaginaryunit, negate(Constants.imaginaryunit)));
  Eval();
  return pop();
}
