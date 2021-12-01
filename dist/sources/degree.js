"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degree = exports.Eval_degree = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const eval_1 = require("./eval");
const guess_1 = require("./guess");
const is_1 = require("./is");
/* deg =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p,x

General description
-------------------
Returns the degree of polynomial p(x).

*/
function Eval_degree(p1) {
    p1 = eval_1.Eval(defs_1.caddr(p1));
    const top = eval_1.Eval(defs_1.cadr(p1));
    const variable = p1 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(top) : p1;
    stack_1.push(degree(top, variable));
}
exports.Eval_degree = Eval_degree;
//-----------------------------------------------------------------------------
//
//  Find the degree of a polynomial
//
//  Input:    POLY    p(x)
//            X       x
//
//  Output:    Result
//
//  Note: Finds the largest numerical power of x. Does not check for
//  weirdness in p(x).
//
//-----------------------------------------------------------------------------
function degree(POLY, X) {
    return yydegree(POLY, X, defs_1.Constants.zero);
}
exports.degree = degree;
function yydegree(POLY, X, DEGREE) {
    if (misc_1.equal(POLY, X)) {
        if (is_1.isZeroAtomOrTensor(DEGREE)) {
            DEGREE = defs_1.Constants.one;
        }
    }
    else if (defs_1.ispower(POLY)) {
        if (misc_1.equal(defs_1.cadr(POLY), X) &&
            defs_1.isNumericAtom(defs_1.caddr(POLY)) &&
            misc_1.lessp(DEGREE, defs_1.caddr(POLY))) {
            DEGREE = defs_1.caddr(POLY);
        }
    }
    else if (defs_1.iscons(POLY)) {
        DEGREE = POLY.tail().reduce((a, b) => yydegree(b, X, a), DEGREE);
    }
    return DEGREE;
}
