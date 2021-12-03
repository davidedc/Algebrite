"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_arcsinh = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
/* arcsinh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse hyperbolic sine of x.

*/
function Eval_arcsinh(x) {
    stack_1.push(arcsinh(eval_1.Eval(defs_1.cadr(x))));
}
exports.Eval_arcsinh = Eval_arcsinh;
function arcsinh(x) {
    if (defs_1.car(x) === defs_1.symbol(defs_1.SINH)) {
        return defs_1.cadr(x);
    }
    if (defs_1.isdouble(x)) {
        let { d } = x;
        d = Math.log(d + Math.sqrt(d * d + 1.0));
        return bignum_1.double(d);
    }
    if (is_1.isZeroAtomOrTensor(x)) {
        return defs_1.Constants.zero;
    }
    return list_1.makeList(defs_1.symbol(defs_1.ARCSINH), x);
}
