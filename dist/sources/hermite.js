"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hermite = void 0;
const defs_1 = require("../runtime/defs");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const subst_1 = require("./subst");
//-----------------------------------------------------------------------------
//
//  Hermite polynomial
//
//  Input:    p1    x  (can be a symbol or expr)
//            p2    n
//
//  Output:    Result
//
//-----------------------------------------------------------------------------
function hermite(p1, p2) {
    return yyhermite(p1, p2);
}
exports.hermite = hermite;
// uses the recurrence relation H(x,n+1)=2*x*H(x,n)-2*n*H(x,n-1)
function yyhermite(X, N) {
    const n = bignum_1.nativeInt(N);
    if (n < 0 || isNaN(n)) {
        return list_1.makeList(defs_1.symbol(defs_1.HERMITE), X, N);
    }
    if (defs_1.issymbol(X)) {
        return yyhermite2(n, X);
    }
    return eval_1.Eval(subst_1.subst(yyhermite2(n, defs_1.symbol(defs_1.SECRETX)), defs_1.symbol(defs_1.SECRETX), X));
}
function yyhermite2(n, p1) {
    let Y1 = defs_1.Constants.zero;
    let temp = defs_1.Constants.one;
    for (let i = 0; i < n; i++) {
        const Y0 = Y1;
        Y1 = temp;
        temp = multiply_1.multiply(add_1.subtract(multiply_1.multiply(p1, Y1), multiply_1.multiply(bignum_1.integer(i), Y0)), bignum_1.integer(2));
    }
    return temp;
}
