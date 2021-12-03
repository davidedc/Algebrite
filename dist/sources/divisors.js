"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ydivisors = exports.divisors = void 0;
const gcd_1 = require("./gcd");
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const factor_1 = require("./factor");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
//-----------------------------------------------------------------------------
//
//  Generate all divisors of a term
//
//  Input:    Term (factor * factor * ...)
//
//  Output:    Divisors
//
//-----------------------------------------------------------------------------
function divisors(p) {
    const values = ydivisors(p);
    const n = values.length;
    values.sort(misc_1.cmp_expr);
    const p1 = alloc_1.alloc_tensor(n);
    p1.tensor.ndim = 1;
    p1.tensor.dim[0] = n;
    p1.tensor.elem = values;
    return p1;
}
exports.divisors = divisors;
const flatten = (arr) => [].concat(...arr);
function ydivisors(p1) {
    const stack = [];
    // push all of the term's factors
    if (defs_1.isNumericAtom(p1)) {
        stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(p1)));
    }
    else if (defs_1.isadd(p1)) {
        stack.push(...__factor_add(p1));
    }
    else if (defs_1.ismultiply(p1)) {
        p1 = defs_1.cdr(p1);
        if (defs_1.isNumericAtom(defs_1.car(p1))) {
            stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(defs_1.car(p1))));
            p1 = defs_1.cdr(p1);
        }
        if (defs_1.iscons(p1)) {
            const mapped = [...p1].map((p2) => {
                if (defs_1.ispower(p2)) {
                    return [defs_1.cadr(p2), defs_1.caddr(p2)];
                }
                return [p2, defs_1.Constants.one];
            });
            stack.push(...flatten(mapped));
        }
    }
    else if (defs_1.ispower(p1)) {
        stack.push(defs_1.cadr(p1), defs_1.caddr(p1));
    }
    else {
        stack.push(p1, defs_1.Constants.one);
    }
    const k = stack.length;
    // contruct divisors by recursive descent
    stack.push(defs_1.Constants.one);
    gen(stack, 0, k);
    return stack.slice(k);
}
exports.ydivisors = ydivisors;
//-----------------------------------------------------------------------------
//
//  Generate divisors
//
//  Input:    Base-exponent pairs on stack
//
//      h  first pair
//
//      k  just past last pair
//
//  Output:    Divisors on stack
//
//  For example, factor list 2 2 3 1 results in 6 divisors,
//
//    1
//    3
//    2
//    6
//    4
//    12
//
//-----------------------------------------------------------------------------
function gen(stack, h, k) {
    const ACCUM = stack.pop();
    if (h === k) {
        stack.push(ACCUM);
        return;
    }
    const BASE = stack[h + 0];
    const EXPO = stack[h + 1];
    const expo = bignum_1.nativeInt(EXPO);
    if (!isNaN(expo)) {
        for (let i = 0; i <= Math.abs(expo); i++) {
            stack.push(multiply_1.multiply(ACCUM, power_1.power(BASE, bignum_1.integer(misc_1.sign(expo) * i))));
            gen(stack, h + 2, k);
        }
    }
}
//-----------------------------------------------------------------------------
//
//  Factor ADD expression
//
//  Input:    Expression
//
//  Output:    Factors
//
//  Each factor consists of two expressions, the factor itself followed
//  by the exponent.
//
//-----------------------------------------------------------------------------
function __factor_add(p1) {
    // get gcd of all terms
    const temp1 = defs_1.iscons(p1) ? p1.tail().reduce(gcd_1.gcd) : defs_1.car(p1);
    const stack = [];
    // check gcd
    let p2 = temp1;
    if (is_1.isplusone(p2)) {
        stack.push(p1, defs_1.Constants.one);
        return stack;
    }
    // push factored gcd
    if (defs_1.isNumericAtom(p2)) {
        stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(p2)));
    }
    else if (defs_1.ismultiply(p2)) {
        let p3 = defs_1.cdr(p2);
        if (defs_1.isNumericAtom(defs_1.car(p3))) {
            stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(defs_1.car(p3))));
        }
        else {
            stack.push(defs_1.car(p3), defs_1.Constants.one);
        }
        if (defs_1.iscons(p3)) {
            p3.tail().forEach((p) => stack.push(p, defs_1.Constants.one));
        }
    }
    else {
        stack.push(p2, defs_1.Constants.one);
    }
    // divide each term by gcd
    p2 = multiply_1.inverse(p2);
    const temp2 = defs_1.iscons(p1)
        ? p1.tail().reduce((a, b) => add_1.add(a, multiply_1.multiply(p2, b)), defs_1.Constants.zero)
        : defs_1.cdr(p1);
    stack.push(temp2, defs_1.Constants.one);
    return stack;
}
