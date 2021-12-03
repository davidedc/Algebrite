"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_legendre = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const cos_1 = require("./cos");
const derivative_1 = require("./derivative");
const eval_1 = require("./eval");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const sin_1 = require("./sin");
const subst_1 = require("./subst");
/*
 Legendre function

Example

  legendre(x,3,0)

Result

   5   3    3
  --- x  - --- x
   2        2

The computation uses the following recurrence relation.

  P(x,0) = 1

  P(x,1) = x

  n*P(x,n) = (2*(n-1)+1)*x*P(x,n-1) - (n-1)*P(x,n-2)

In the "for" loop we have i = n-1 so the recurrence relation becomes

  (i+1)*P(x,n) = (2*i+1)*x*P(x,n-1) - i*P(x,n-2)

For m > 0

  P(x,n,m) = (-1)^m * (1-x^2)^(m/2) * d^m/dx^m P(x,n)
*/
function Eval_legendre(p1) {
    const X = eval_1.Eval(defs_1.cadr(p1));
    const N = eval_1.Eval(defs_1.caddr(p1));
    const p2 = eval_1.Eval(defs_1.cadddr(p1));
    const M = p2 === defs_1.symbol(defs_1.NIL) ? defs_1.Constants.zero : p2;
    stack_1.push(legendre(X, N, M));
}
exports.Eval_legendre = Eval_legendre;
function legendre(X, N, M) {
    return __legendre(X, N, M);
}
function __legendre(X, N, M) {
    let n = bignum_1.nativeInt(N);
    let m = bignum_1.nativeInt(M);
    if (n < 0 || isNaN(n) || m < 0 || isNaN(m)) {
        return list_1.makeList(defs_1.symbol(defs_1.LEGENDRE), X, N, M);
    }
    let result;
    if (defs_1.issymbol(X)) {
        result = __legendre2(n, m, X);
    }
    else {
        const expr = __legendre2(n, m, defs_1.symbol(defs_1.SECRETX));
        result = eval_1.Eval(subst_1.subst(expr, defs_1.symbol(defs_1.SECRETX), X));
    }
    result = __legendre3(result, m, X) || result;
    return result;
}
function __legendre2(n, m, X) {
    let Y0 = defs_1.Constants.zero;
    let Y1 = defs_1.Constants.one;
    //  i=1  Y0 = 0
    //    Y1 = 1
    //    ((2*i+1)*x*Y1 - i*Y0) / i = x
    //
    //  i=2  Y0 = 1
    //    Y1 = x
    //    ((2*i+1)*x*Y1 - i*Y0) / i = -1/2 + 3/2*x^2
    //
    //  i=3  Y0 = x
    //    Y1 = -1/2 + 3/2*x^2
    //    ((2*i+1)*x*Y1 - i*Y0) / i = -3/2*x + 5/2*x^3
    for (let i = 0; i < n; i++) {
        const divided = multiply_1.divide(add_1.subtract(multiply_1.multiply(multiply_1.multiply(bignum_1.integer(2 * i + 1), X), Y1), multiply_1.multiply(bignum_1.integer(i), Y0)), bignum_1.integer(i + 1));
        Y0 = Y1;
        Y1 = divided;
    }
    for (let i = 0; i < m; i++) {
        Y1 = derivative_1.derivative(Y1, X);
    }
    return Y1;
}
// moveTos tos * (-1)^m * (1-x^2)^(m/2)
function __legendre3(p1, m, X) {
    if (m === 0) {
        return;
    }
    let base = add_1.subtract(defs_1.Constants.one, misc_1.square(X));
    if (defs_1.car(X) === defs_1.symbol(defs_1.COS)) {
        base = misc_1.square(sin_1.sine(defs_1.cadr(X)));
    }
    else if (defs_1.car(X) === defs_1.symbol(defs_1.SIN)) {
        base = misc_1.square(cos_1.cosine(defs_1.cadr(X)));
    }
    let result = multiply_1.multiply(p1, power_1.power(base, multiply_1.multiply(bignum_1.integer(m), bignum_1.rational(1, 2))));
    if (m % 2) {
        result = multiply_1.negate(result);
    }
    return result;
}
