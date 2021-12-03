"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_erf = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const erfc_1 = require("./erfc");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
/* erf =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Authors
-------
philippe.billet@noos.fr

Parameters
----------
x

General description
-------------------
Error function erf(x).
erf(-x)=erf(x)

*/
function Eval_erf(p1) {
    const result = yerf(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_erf = Eval_erf;
function yerf(p1) {
    if (defs_1.isdouble(p1)) {
        return bignum_1.double(1.0 - erfc_1.erfc(p1.d));
    }
    if (is_1.isZeroAtomOrTensor(p1)) {
        return defs_1.Constants.zero;
    }
    if (is_1.isnegativeterm(p1)) {
        return multiply_1.negate(list_1.makeList(defs_1.symbol(defs_1.ERF), multiply_1.negate(p1)));
    }
    return list_1.makeList(defs_1.symbol(defs_1.ERF), p1);
}
