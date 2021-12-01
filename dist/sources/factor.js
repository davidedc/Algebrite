"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factor_small_number = exports.factor = exports.Eval_factor = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const factorpoly_1 = require("./factorpoly");
const guess_1 = require("./guess");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const pollard_1 = require("./pollard");
// factor a polynomial or integer
function Eval_factor(p1) {
    const top = eval_1.Eval(defs_1.cadr(p1));
    const p2 = eval_1.Eval(defs_1.caddr(p1));
    const variable = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(top) : p2;
    let temp = factor(top, variable);
    // more factoring?
    p1 = defs_1.cdddr(p1);
    if (defs_1.iscons(p1)) {
        temp = [...p1].reduce((acc, p) => factor_again(acc, eval_1.Eval(p)), temp);
    }
    stack_1.push(temp);
}
exports.Eval_factor = Eval_factor;
function factor_again(p1, p2) {
    if (defs_1.ismultiply(p1)) {
        const arr = [];
        p1.tail().forEach((el) => factor_term(arr, el, p2));
        return multiply_1.multiply_all_noexpand(arr);
    }
    const arr = [];
    factor_term(arr, p1, p2);
    return arr[0];
}
function factor_term(arr, arg1, arg2) {
    const p1 = factorpoly_1.factorpoly(arg1, arg2);
    if (defs_1.ismultiply(p1)) {
        arr.push(...p1.tail());
        return;
    }
    arr.push(p1);
}
function factor(p1, p2) {
    if (is_1.isinteger(p1)) {
        return pollard_1.factor_number(p1); // see pollard.cpp
    }
    return factorpoly_1.factorpoly(p1, p2);
}
exports.factor = factor;
// for factoring small integers (2^32 or less)
function factor_small_number(n) {
    if (isNaN(n)) {
        run_1.stop('number too big to factor');
    }
    const arr = [];
    if (n < 0) {
        n = -n;
    }
    for (let i = 0; i < defs_1.MAXPRIMETAB; i++) {
        const d = defs_1.primetab[i];
        if (d > n / d) {
            break;
        }
        let expo = 0;
        while (n % d === 0) {
            n /= d;
            expo++;
        }
        if (expo) {
            arr.push(bignum_1.integer(d));
            arr.push(bignum_1.integer(expo));
        }
    }
    if (n > 1) {
        arr.push(bignum_1.integer(n));
        arr.push(defs_1.Constants.one);
    }
    return arr;
}
exports.factor_small_number = factor_small_number;
