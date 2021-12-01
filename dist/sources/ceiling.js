"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_ceiling = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const mmul_1 = require("./mmul");
/* ceiling =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Returns the smallest integer not less than x.

*/
function Eval_ceiling(p1) {
    const result = ceiling(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_ceiling = Eval_ceiling;
function ceiling(p1) {
    return yyceiling(p1);
}
function yyceiling(p1) {
    if (!defs_1.isNumericAtom(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.CEILING), p1);
    }
    if (defs_1.isdouble(p1)) {
        return bignum_1.double(Math.ceil(p1.d));
    }
    if (is_1.isinteger(p1)) {
        return p1;
    }
    let result = new defs_1.Num(mmul_1.mdiv(p1.q.a, p1.q.b));
    if (!is_1.isnegativenumber(p1)) {
        result = add_1.add(result, defs_1.Constants.one);
    }
    return result;
}
