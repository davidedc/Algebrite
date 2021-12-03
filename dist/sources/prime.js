"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_prime = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
//-----------------------------------------------------------------------------
//
//  Look up the nth prime
//
//  Input:    n (0 < n < 10001)
//
//  Output:    nth prime
//
//-----------------------------------------------------------------------------
function Eval_prime(p1) {
    const result = prime(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_prime = Eval_prime;
function prime(p1) {
    let n = bignum_1.nativeInt(p1);
    if (n < 1 || n > defs_1.MAXPRIMETAB) {
        run_1.stop('prime: Argument out of range.');
    }
    n = defs_1.primetab[n - 1];
    return bignum_1.integer(n);
}
