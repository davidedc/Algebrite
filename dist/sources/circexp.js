"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_circexp = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const expcos_1 = require("./expcos");
const expsin_1 = require("./expsin");
const multiply_1 = require("./multiply");
const tensor_1 = require("./tensor");
/* circexp =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Returns expression x with circular and hyperbolic functions converted to exponential forms. Sometimes this will simplify an expression.

*/
function Eval_circexp(p1) {
    const result = circexp(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(eval_1.Eval(result));
}
exports.Eval_circexp = Eval_circexp;
function circexp(p1) {
    if (defs_1.car(p1) === defs_1.symbol(defs_1.COS)) {
        return expcos_1.expcos(defs_1.cadr(p1));
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.SIN)) {
        return expsin_1.expsin(defs_1.cadr(p1));
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.TAN)) {
        p1 = defs_1.cadr(p1);
        const p2 = misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1));
        const p3 = misc_1.exponential(multiply_1.negate(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1)));
        return multiply_1.divide(multiply_1.multiply(add_1.subtract(p3, p2), defs_1.Constants.imaginaryunit), add_1.add(p2, p3));
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.COSH)) {
        p1 = defs_1.cadr(p1);
        return multiply_1.multiply(add_1.add(misc_1.exponential(p1), misc_1.exponential(multiply_1.negate(p1))), bignum_1.rational(1, 2));
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.SINH)) {
        p1 = defs_1.cadr(p1);
        return multiply_1.multiply(add_1.subtract(misc_1.exponential(p1), misc_1.exponential(multiply_1.negate(p1))), bignum_1.rational(1, 2));
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.TANH)) {
        p1 = misc_1.exponential(multiply_1.multiply(defs_1.cadr(p1), bignum_1.integer(2)));
        return multiply_1.divide(add_1.subtract(p1, defs_1.Constants.one), add_1.add(p1, defs_1.Constants.one));
    }
    if (defs_1.iscons(p1)) {
        return p1.map(circexp);
    }
    if (p1.k === defs_1.TENSOR) {
        p1 = tensor_1.copy_tensor(p1);
        p1.tensor.elem = p1.tensor.elem.map(circexp);
        return p1;
    }
    return p1;
}
