"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denominator = exports.Eval_denominator = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const rationalize_1 = require("./rationalize");
/* denominator =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the denominator of expression x.

*/
function Eval_denominator(p1) {
    const result = denominator(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_denominator = Eval_denominator;
function denominator(p1) {
    //console.trace "denominator of: " + p1
    if (defs_1.isadd(p1)) {
        p1 = rationalize_1.rationalize(p1);
    }
    if (defs_1.ismultiply(p1) && !is_1.isplusone(defs_1.car(defs_1.cdr(p1)))) {
        return multiply_1.multiply_all(p1.tail().map(denominator));
    }
    if (defs_1.isrational(p1)) {
        return bignum_1.mp_denominator(p1);
    }
    if (defs_1.ispower(p1) && is_1.isnegativeterm(defs_1.caddr(p1))) {
        return multiply_1.reciprocate(p1);
    }
    return defs_1.Constants.one;
}
exports.denominator = denominator;
