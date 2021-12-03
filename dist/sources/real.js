"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.real = exports.Eval_real = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const conj_1 = require("./conj");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
const rect_1 = require("./rect");
/*
 Returns the real part of complex z

  z    real(z)
  -    -------

  a + i b    a

  exp(i a)  cos(a)
*/
function Eval_real(p1) {
    const result = real(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_real = Eval_real;
function real(p) {
    const p1 = rect_1.rect(p);
    return multiply_1.divide(add_1.add(p1, conj_1.conjugate(p1)), bignum_1.integer(2));
}
exports.real = real;
