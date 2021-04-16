import { cadr, car, cddr, cdr, iscons, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';
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
  push(cadr(p1));
  Eval();
  let F = pop();

  p1 = cddr(p1);

  // defint can handle multiple
  // integrals, so we loop over the
  // multiple integrals here
  while (iscons(p1)) {
    push(car(p1));
    p1 = cdr(p1);
    Eval();
    const X = pop();

    push(car(p1));
    p1 = cdr(p1);
    Eval();
    const A = pop();

    push(car(p1));
    p1 = cdr(p1);
    Eval();
    const B = pop();

    // obtain the primitive of F against the
    // specified variable X
    // note that the primitive changes over
    // the calculation of the multiple
    // integrals.
    F = integral(F, X); // contains the antiderivative of F

    // evaluate the integral in A
    push(subst(F, X, B));
    Eval();

    // evaluate the integral in B
    push(subst(F, X, A));
    Eval();

    // integral between B and A is the
    // subtraction. Note that this could
    // be a number but also a function.
    // and we might have to integrate this
    // number/function again doing the while
    // loop again if this is a multiple
    // integral.
    const arg2 = pop();
    const arg1 = pop();
    F = subtract(arg1, arg2);
  }

  push(F);
}
