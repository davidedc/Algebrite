"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_arctanh = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
/* arctanh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse hyperbolic tangent of x.

*/
function Eval_arctanh(x) {
    stack_1.push(arctanh(eval_1.Eval(defs_1.cadr(x))));
}
exports.Eval_arctanh = Eval_arctanh;
function arctanh(x) {
    if (defs_1.car(x) === defs_1.symbol(defs_1.TANH)) {
        return defs_1.cadr(x);
    }
    if (defs_1.isdouble(x)) {
        let { d } = x;
        if (d < -1.0 || d > 1.0) {
            run_1.stop('arctanh function argument is not in the interval [-1,1]');
        }
        d = Math.log((1.0 + d) / (1.0 - d)) / 2.0;
        return bignum_1.double(d);
    }
    if (is_1.isZeroAtomOrTensor(x)) {
        return defs_1.Constants.zero;
    }
    return list_1.makeList(defs_1.symbol(defs_1.ARCTANH), x);
}
