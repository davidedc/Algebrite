"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conjugate = exports.Eval_conj = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const clock_1 = require("./clock");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
const polar_1 = require("./polar");
const subst_1 = require("./subst");
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
function Eval_conj(p1) {
    p1 = eval_1.Eval(defs_1.cadr(p1));
    if (!find_1.Find(p1, defs_1.Constants.imaginaryunit)) {
        // example: (-1)^(1/3)
        stack_1.push(clock_1.clockform(conjugate(polar_1.polar(p1))));
    }
    else {
        stack_1.push(conjugate(p1));
    }
}
exports.Eval_conj = Eval_conj;
// careful is you pass this one an expression with
// i (instead of (-1)^(1/2)) then this doesn't work!
function conjugate(p1) {
    return eval_1.Eval(subst_1.subst(p1, defs_1.Constants.imaginaryunit, multiply_1.negate(defs_1.Constants.imaginaryunit)));
}
exports.conjugate = conjugate;
