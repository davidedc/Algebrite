"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imag = exports.Eval_imag = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const conj_1 = require("./conj");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
const rect_1 = require("./rect");
/*
 Returns the coefficient of the imaginary part of complex z

  z    imag(z)
  -    -------

  a + i b    b

  exp(i a)  sin(a)
*/
const DEBUG_IMAG = false;
function Eval_imag(p1) {
    const result = imag(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_imag = Eval_imag;
function imag(p) {
    const p1 = rect_1.rect(p);
    const conj = conj_1.conjugate(p1);
    const arg1 = multiply_1.divide(add_1.subtract(p1, conj), bignum_1.integer(2));
    const result = multiply_1.divide(arg1, defs_1.Constants.imaginaryunit);
    if (DEBUG_IMAG) {
        console.log(`IMAGE of ${p1}`);
        console.log(` image: conjugate result: ${conj}`);
        console.log(` image: 1st divide result: ${arg1}`);
        console.log(` image: 2nd divide result: ${result}`);
    }
    return result;
}
exports.imag = imag;
