"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_defint = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const eval_1 = require("./eval");
const integral_1 = require("./integral");
const subst_1 = require("./subst");
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
function Eval_defint(p1) {
    let F = eval_1.Eval(defs_1.cadr(p1));
    p1 = defs_1.cddr(p1);
    // defint can handle multiple
    // integrals, so we loop over the
    // multiple integrals here
    while (defs_1.iscons(p1)) {
        const X = eval_1.Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        const A = eval_1.Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        const B = eval_1.Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        // obtain the primitive of F against the
        // specified variable X
        // note that the primitive changes over
        // the calculation of the multiple
        // integrals.
        F = integral_1.integral(F, X); // contains the antiderivative of F
        // evaluate the integral in A
        const arg1 = eval_1.Eval(subst_1.subst(F, X, B));
        // evaluate the integral in B
        const arg2 = eval_1.Eval(subst_1.subst(F, X, A));
        // integral between B and A is the
        // subtraction. Note that this could
        // be a number but also a function.
        // and we might have to integrate this
        // number/function again doing the while
        // loop again if this is a multiple
        // integral.
        F = add_1.subtract(arg1, arg2);
    }
    stack_1.push(F);
}
exports.Eval_defint = Eval_defint;
