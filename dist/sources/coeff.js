"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coeff = exports.Eval_coeff = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const eval_1 = require("./eval");
const filter_1 = require("./filter");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const subst_1 = require("./subst");
/* coeff =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p,x,n

General description
-------------------
Returns the coefficient of x^n in polynomial p. The x argument can be omitted for polynomials in x.

*/
function Eval_coeff(p1) {
    let N = eval_1.Eval(defs_1.cadddr(p1));
    let X = eval_1.Eval(defs_1.caddr(p1));
    const P = eval_1.Eval(defs_1.cadr(p1));
    if (N === defs_1.symbol(defs_1.NIL)) {
        // only 2 args?
        N = X;
        X = defs_1.symbol(defs_1.SYMBOL_X);
    }
    // divide p by x^n, keep the constant part
    stack_1.push(filter_1.filter(multiply_1.divide(P, power_1.power(X, N)), X));
}
exports.Eval_coeff = Eval_coeff;
//-----------------------------------------------------------------------------
//
//  Get polynomial coefficients
//
//  Input:  p(x) (the polynomial)
//
//          x (the variable)
//
//  Output:    Returns the array of coefficients:
//
//      [Coefficient of x^0, ..., Coefficient of x^(n-1)]
//
//-----------------------------------------------------------------------------
function coeff(p, x) {
    const coefficients = [];
    while (true) {
        const c = eval_1.Eval(subst_1.subst(p, x, defs_1.Constants.zero));
        coefficients.push(c);
        p = add_1.subtract(p, c);
        if (misc_1.equal(p, defs_1.Constants.zero)) {
            return coefficients;
        }
        p = defs_1.doexpand(multiply_1.divide, p, x);
    }
}
exports.coeff = coeff;
