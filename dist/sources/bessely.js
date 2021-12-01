"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bessely = exports.Eval_bessely = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const otherCFunctions_1 = require("../runtime/otherCFunctions");
/* bessely =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x,n

General description
-------------------

Bessel function of second kind.

*/
function Eval_bessely(p1) {
    const result = bessely(eval_1.Eval(defs_1.cadr(p1)), eval_1.Eval(defs_1.caddr(p1)));
    stack_1.push(result);
}
exports.Eval_bessely = Eval_bessely;
function bessely(p1, p2) {
    return yybessely(p1, p2);
}
exports.bessely = bessely;
function yybessely(X, N) {
    const n = bignum_1.nativeInt(N);
    if (defs_1.isdouble(X) && !isNaN(n)) {
        const d = otherCFunctions_1.yn(n, X.d);
        return bignum_1.double(d);
    }
    if (is_1.isnegativeterm(N)) {
        return multiply_1.multiply(power_1.power(defs_1.Constants.negOne, N), list_1.makeList(defs_1.symbol(defs_1.BESSELY), X, multiply_1.negate(N)));
    }
    return list_1.makeList(defs_1.symbol(defs_1.BESSELY), X, N);
}
