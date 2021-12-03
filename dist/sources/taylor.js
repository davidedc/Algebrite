"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_taylor = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const derivative_1 = require("./derivative");
const eval_1 = require("./eval");
const factorial_1 = require("./factorial");
const guess_1 = require("./guess");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const subst_1 = require("./subst");
/*
Taylor expansion of a function

  push(F)
  push(X)
  push(N)
  push(A)
  taylor()
*/
function Eval_taylor(p1) {
    // 1st arg
    p1 = defs_1.cdr(p1);
    const F = eval_1.Eval(defs_1.car(p1));
    // 2nd arg
    p1 = defs_1.cdr(p1);
    let p2 = eval_1.Eval(defs_1.car(p1));
    const X = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(stack_1.top()) : p2; // TODO: should this be `top()`?
    // 3rd arg
    p1 = defs_1.cdr(p1);
    p2 = eval_1.Eval(defs_1.car(p1));
    const N = p2 === defs_1.symbol(defs_1.NIL) ? bignum_1.integer(24) : p2; // 24: default number of terms
    // 4th arg
    p1 = defs_1.cdr(p1);
    p2 = eval_1.Eval(defs_1.car(p1));
    const A = p2 === defs_1.symbol(defs_1.NIL) ? defs_1.Constants.zero : p2; // 0: default expansion point
    stack_1.push(taylor(F, X, N, A));
}
exports.Eval_taylor = Eval_taylor;
function taylor(F, X, N, A) {
    const k = bignum_1.nativeInt(N);
    if (isNaN(k)) {
        return list_1.makeList(defs_1.symbol(defs_1.TAYLOR), F, X, N, A);
    }
    let p5 = defs_1.Constants.one;
    let temp = eval_1.Eval(subst_1.subst(F, X, A)); // F: f(a)
    for (let i = 1; i <= k; i++) {
        F = derivative_1.derivative(F, X); // F: f = f'
        if (is_1.isZeroAtomOrTensor(F)) {
            break;
        }
        // c = c * (x - a)
        p5 = multiply_1.multiply(p5, add_1.subtract(X, A));
        const arg1a = eval_1.Eval(subst_1.subst(F, X, A)); // F: f(a)
        temp = add_1.add(temp, multiply_1.divide(multiply_1.multiply(arg1a, p5), factorial_1.factorial(bignum_1.integer(i))));
    }
    return temp;
}
