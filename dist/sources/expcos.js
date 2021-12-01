"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expcos = exports.Eval_expcos = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
// Do the exponential cosine function.
function Eval_expcos(p1) {
    const result = expcos(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_expcos = Eval_expcos;
function expcos(p1) {
    return add_1.add(multiply_1.multiply(misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1)), bignum_1.rational(1, 2)), multiply_1.multiply(misc_1.exponential(multiply_1.multiply(multiply_1.negate(defs_1.Constants.imaginaryunit), p1)), bignum_1.rational(1, 2)));
}
exports.expcos = expcos;
