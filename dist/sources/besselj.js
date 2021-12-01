"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.besselj = exports.Eval_besselj = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const cos_1 = require("./cos");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const sin_1 = require("./sin");
const otherCFunctions_1 = require("../runtime/otherCFunctions");
/* besselj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x,n

General description
-------------------

Returns a solution to the Bessel differential equation (Bessel function of first kind).

Recurrence relation:

  besselj(x,n) = (2/x) (n-1) besselj(x,n-1) - besselj(x,n-2)

  besselj(x,1/2) = sqrt(2/pi/x) sin(x)

  besselj(x,-1/2) = sqrt(2/pi/x) cos(x)

For negative n, reorder the recurrence relation as:

  besselj(x,n-2) = (2/x) (n-1) besselj(x,n-1) - besselj(x,n)

Substitute n+2 for n to obtain

  besselj(x,n) = (2/x) (n+1) besselj(x,n+1) - besselj(x,n+2)

Examples:

  besselj(x,3/2) = (1/x) besselj(x,1/2) - besselj(x,-1/2)

  besselj(x,-3/2) = -(1/x) besselj(x,-1/2) - besselj(x,1/2)

*/
function Eval_besselj(p1) {
    const result = besselj(eval_1.Eval(defs_1.cadr(p1)), eval_1.Eval(defs_1.caddr(p1)));
    stack_1.push(result);
}
exports.Eval_besselj = Eval_besselj;
function besselj(p1, p2) {
    return yybesselj(p1, p2);
}
exports.besselj = besselj;
function yybesselj(X, N) {
    const n = bignum_1.nativeInt(N);
    // numerical result
    if (defs_1.isdouble(X) && !isNaN(n)) {
        const d = otherCFunctions_1.jn(n, X.d);
        return bignum_1.double(d);
    }
    // bessej(0,0) = 1
    if (is_1.isZeroAtomOrTensor(X) && is_1.isZeroAtomOrTensor(N)) {
        return defs_1.Constants.one;
    }
    // besselj(0,n) = 0
    if (is_1.isZeroAtomOrTensor(X) && !isNaN(n)) {
        return defs_1.Constants.zero;
    }
    // half arguments
    if (N.k === defs_1.NUM && defs_1.MEQUAL(N.q.b, 2)) {
        // n = 1/2
        if (defs_1.MEQUAL(N.q.a, 1)) {
            const twoOverPi = defs_1.defs.evaluatingAsFloats
                ? bignum_1.double(2.0 / Math.PI)
                : multiply_1.divide(bignum_1.integer(2), defs_1.symbol(defs_1.PI));
            return multiply_1.multiply(power_1.power(multiply_1.divide(twoOverPi, X), bignum_1.rational(1, 2)), sin_1.sine(X));
        }
        // n = -1/2
        if (defs_1.MEQUAL(N.q.a, -1)) {
            const twoOverPi = defs_1.defs.evaluatingAsFloats
                ? bignum_1.double(2.0 / Math.PI)
                : multiply_1.divide(bignum_1.integer(2), defs_1.symbol(defs_1.PI));
            return multiply_1.multiply(power_1.power(multiply_1.divide(twoOverPi, X), bignum_1.rational(1, 2)), cos_1.cosine(X));
        }
        // besselj(x,n) = (2/x) (n-sgn(n)) besselj(x,n-sgn(n)) - besselj(x,n-2*sgn(n))
        const SGN = bignum_1.integer(defs_1.MSIGN(N.q.a));
        return add_1.subtract(multiply_1.multiply(multiply_1.multiply(multiply_1.divide(bignum_1.integer(2), X), add_1.subtract(N, SGN)), besselj(X, add_1.subtract(N, SGN))), besselj(X, add_1.subtract(N, multiply_1.multiply(bignum_1.integer(2), SGN))));
    }
    //if 0 # test cases needed
    if (is_1.isnegativeterm(X)) {
        return multiply_1.multiply(multiply_1.multiply(power_1.power(multiply_1.negate(X), N), power_1.power(X, multiply_1.negate(N))), list_1.makeList(defs_1.symbol(defs_1.BESSELJ), multiply_1.negate(X), N));
    }
    if (is_1.isnegativeterm(N)) {
        return multiply_1.multiply(power_1.power(defs_1.Constants.negOne, N), list_1.makeList(defs_1.symbol(defs_1.BESSELJ), X, multiply_1.negate(N)));
    }
    return list_1.makeList(defs_1.symbol(defs_1.BESSELJ), X, N);
}
