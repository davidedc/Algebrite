"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.divpoly = exports.Eval_quotient = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const coeff_1 = require("./coeff");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
// Divide polynomials
function Eval_quotient(p1) {
    const DIVIDEND = eval_1.Eval(defs_1.cadr(p1)); // 1st arg, p(x)
    const DIVISOR = eval_1.Eval(defs_1.caddr(p1)); // 2nd arg, q(x)
    let X = eval_1.Eval(defs_1.cadddr(p1)); // 3rd arg, x, default x
    if (X === defs_1.symbol(defs_1.NIL)) {
        X = defs_1.symbol(defs_1.SYMBOL_X);
    }
    stack_1.push(divpoly(DIVIDEND, DIVISOR, X));
}
exports.Eval_quotient = Eval_quotient;
//-----------------------------------------------------------------------------
//
//  Divide polynomials
//
//  Input:    Dividend
//            Divisor
//            x
//
//  Output:    Quotient
//
//-----------------------------------------------------------------------------
function divpoly(DIVIDEND, DIVISOR, X) {
    const dividendCs = coeff_1.coeff(DIVIDEND, X);
    let m = dividendCs.length - 1; // m is dividend's power
    const divisorCs = coeff_1.coeff(DIVISOR, X);
    const n = divisorCs.length - 1; // n is divisor's power
    let x = m - n;
    let QUOTIENT = defs_1.Constants.zero;
    while (x >= 0) {
        const Q = multiply_1.divide(dividendCs[m], divisorCs[n]);
        for (let i = 0; i <= n; i++) {
            dividendCs[x + i] = add_1.subtract(dividendCs[x + i], multiply_1.multiply(divisorCs[i], Q));
        }
        QUOTIENT = add_1.add(QUOTIENT, multiply_1.multiply(Q, power_1.power(X, bignum_1.integer(x))));
        m--;
        x--;
    }
    return QUOTIENT;
}
exports.divpoly = divpoly;
