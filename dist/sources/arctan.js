"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arctan = exports.Eval_arctan = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const bignum_1 = require("./bignum");
const denominator_1 = require("./denominator");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const numerator_1 = require("./numerator");
/* arctan =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse tangent of x.

*/
function Eval_arctan(x) {
    stack_1.push(arctan(eval_1.Eval(defs_1.cadr(x))));
}
exports.Eval_arctan = Eval_arctan;
function arctan(x) {
    if (defs_1.car(x) === defs_1.symbol(defs_1.TAN)) {
        return defs_1.cadr(x);
    }
    if (defs_1.isdouble(x)) {
        return bignum_1.double(Math.atan(x.d));
    }
    if (is_1.isZeroAtomOrTensor(x)) {
        return defs_1.Constants.zero;
    }
    if (is_1.isnegative(x)) {
        return multiply_1.negate(arctan(multiply_1.negate(x)));
    }
    // arctan(sin(a) / cos(a)) ?
    if (find_1.Find(x, defs_1.symbol(defs_1.SIN)) && find_1.Find(x, defs_1.symbol(defs_1.COS))) {
        const p2 = numerator_1.numerator(x);
        const p3 = denominator_1.denominator(x);
        if (defs_1.car(p2) === defs_1.symbol(defs_1.SIN) &&
            defs_1.car(p3) === defs_1.symbol(defs_1.COS) &&
            misc_1.equal(defs_1.cadr(p2), defs_1.cadr(p3))) {
            return defs_1.cadr(p2);
        }
    }
    // arctan(1/sqrt(3)) -> pi/6
    // second if catches the other way of saying it, sqrt(3)/3
    if ((defs_1.ispower(x) && is_1.equaln(defs_1.cadr(x), 3) && is_1.equalq(defs_1.caddr(x), -1, 2)) ||
        (defs_1.ismultiply(x) &&
            is_1.equalq(defs_1.car(defs_1.cdr(x)), 1, 3) &&
            defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(x)))) === defs_1.symbol(defs_1.POWER) &&
            is_1.equaln(defs_1.car(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x))))), 3) &&
            is_1.equalq(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x)))))), 1, 2))) {
        return multiply_1.multiply(bignum_1.rational(1, 6), defs_1.Constants.Pi());
    }
    // arctan(1) -> pi/4
    if (is_1.equaln(x, 1)) {
        return multiply_1.multiply(bignum_1.rational(1, 4), defs_1.Constants.Pi());
    }
    // arctan(sqrt(3)) -> pi/3
    if (defs_1.ispower(x) && is_1.equaln(defs_1.cadr(x), 3) && is_1.equalq(defs_1.caddr(x), 1, 2)) {
        return multiply_1.multiply(bignum_1.rational(1, 3), defs_1.Constants.Pi());
    }
    return list_1.makeList(defs_1.symbol(defs_1.ARCTAN), x);
}
exports.arctan = arctan;
