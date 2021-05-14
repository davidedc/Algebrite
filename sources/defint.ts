import { cadr, car, cddr, cdr, iscons, U } from '../runtime/defs';
import { push } from '../runtime/stack';
import { subtract } from './add';
import { Eval } from './eval';
import { integral } from './integral';
import { subst } from './subst';

/* defint =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
f,x,a,b[,y,c,d...]

General description
-------------------
Returns the definite integral of f with respect to x evaluated from "a" to b.
The argument list can be extended for multiple integrals (or "iterated
integrals"), for example a double integral (which can represent for
example a volume under a surface), or a triple integral, etc. For
example, defint(f,x,a,b,y,c,d).

*/
export function Eval_defint(p1: U) {
  let F = Eval(cadr(p1));

  p1 = cddr(p1);

  // defint can handle multiple
  // integrals, so we loop over the
  // multiple integrals here
  while (iscons(p1)) {
    const X = Eval(car(p1));
    p1 = cdr(p1);

    const A = Eval(car(p1));
    p1 = cdr(p1);

    const B = Eval(car(p1));
    p1 = cdr(p1);

    // obtain the primitive of F against the
    // specified variable X
    // note that the primitive changes over
    // the calculation of the multiple
    // integrals.
    F = integral(F, X); // contains the antiderivative of F

    // evaluate the integral in A
    const arg1 = Eval(subst(F, X, B));

    // evaluate the integral in B
    const arg2 = Eval(subst(F, X, A));

    // integral between B and A is the
    // subtraction. Note that this could
    // be a number but also a function.
    // and we might have to integrate this
    // number/function again doing the while
    // loop again if this is a multiple
    // integral.
    F = subtract(arg1, arg2);
  }

  push(F);
}
