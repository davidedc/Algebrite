"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_laguerre = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const subst_1 = require("./subst");
/*
 Laguerre function

Example

  laguerre(x,3)

Result

     1   3    3   2
  - --- x  + --- x  - 3 x + 1
     6        2

The computation uses the following recurrence relation.

  L(x,0,k) = 1

  L(x,1,k) = -x + k + 1

  n*L(x,n,k) = (2*(n-1)+1-x+k)*L(x,n-1,k) - (n-1+k)*L(x,n-2,k)

In the "for" loop i = n-1 so the recurrence relation becomes

  (i+1)*L(x,n,k) = (2*i+1-x+k)*L(x,n-1,k) - (i+k)*L(x,n-2,k)
*/
function Eval_laguerre(p1) {
    const X = eval_1.Eval(defs_1.cadr(p1));
    const N = eval_1.Eval(defs_1.caddr(p1));
    const p2 = eval_1.Eval(defs_1.cadddr(p1));
    const K = p2 === defs_1.symbol(defs_1.NIL) ? defs_1.Constants.zero : p2;
    stack_1.push(laguerre(X, N, K));
}
exports.Eval_laguerre = Eval_laguerre;
function laguerre(X, N, K) {
    let n = bignum_1.nativeInt(N);
    if (n < 0 || isNaN(n)) {
        return list_1.makeList(defs_1.symbol(defs_1.LAGUERRE), X, N, K);
    }
    if (defs_1.issymbol(X)) {
        return laguerre2(n, X, K);
    }
    return eval_1.Eval(subst_1.subst(laguerre2(n, defs_1.symbol(defs_1.SECRETX), K), defs_1.symbol(defs_1.SECRETX), X));
}
function laguerre2(n, p1, p3) {
    let Y0 = defs_1.Constants.zero;
    let Y1 = defs_1.Constants.one;
    for (let i = 0; i < n; i++) {
        const result = multiply_1.divide(add_1.subtract(multiply_1.multiply(add_1.add(add_1.subtract(bignum_1.integer(2 * i + 1), p1), p3), Y1), multiply_1.multiply(add_1.add(bignum_1.integer(i), p3), Y0)), bignum_1.integer(i + 1));
        Y0 = Y1;
        Y1 = result;
    }
    return Y1;
}
