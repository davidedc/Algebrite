"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.negate_noexpand = exports.negate = exports.reciprocate = exports.inverse = exports.divide = exports.multiply_all_noexpand = exports.multiply_all = exports.multiply_noexpand = exports.multiply = exports.Eval_multiply = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const power_1 = require("./power");
const tensor_1 = require("./tensor");
const otherCFunctions_1 = require("../runtime/otherCFunctions");
// Symbolic multiplication
// multiplication is commutative, so it can't be used
// e.g. on two matrices.
// But it can be used, say, on a scalar and a matrix.,
// so the output of a multiplication is not
// always a scalar.
//extern void append(void)
//static void parse_p1(void)
//static void parse_p2(void)
//static void __normalize_radical_factors(int)
function Eval_multiply(p1) {
    let temp = eval_1.Eval(defs_1.cadr(p1));
    p1 = defs_1.cddr(p1);
    if (defs_1.iscons(p1)) {
        temp = [...p1].reduce((acc, p) => multiply(acc, eval_1.Eval(p)), temp);
    }
    stack_1.push(temp);
}
exports.Eval_multiply = Eval_multiply;
// this one doesn't eval the factors,
// so you pass i*(-1)^(1/2), it wouldnt't
// give -1, because i is not evalled
function multiply(arg1, arg2) {
    if (defs_1.defs.esc_flag) {
        run_1.stop('escape key stop');
    }
    if (defs_1.isNumericAtom(arg1) && defs_1.isNumericAtom(arg2)) {
        return bignum_1.multiply_numbers(arg1, arg2);
    }
    return yymultiply(arg1, arg2);
}
exports.multiply = multiply;
function yymultiply(p1, p2) {
    const h = defs_1.defs.tos;
    // is either operand zero?
    if (is_1.isZeroAtom(p1) || is_1.isZeroAtom(p2)) {
        return defs_1.Constants.Zero();
    }
    // is either operand a sum?
    //console.log("yymultiply: expanding: " + expanding)
    if (defs_1.defs.expanding && defs_1.isadd(p1)) {
        return p1
            .tail()
            .reduce((a, b) => add_1.add(a, multiply(b, p2)), defs_1.Constants.Zero());
    }
    if (defs_1.defs.expanding && defs_1.isadd(p2)) {
        return p2
            .tail()
            .reduce((a, b) => add_1.add(a, multiply(p1, b)), defs_1.Constants.Zero());
    }
    // scalar times tensor?
    if (!defs_1.istensor(p1) && defs_1.istensor(p2)) {
        return tensor_1.scalar_times_tensor(p1, p2);
    }
    // tensor times scalar?
    if (defs_1.istensor(p1) && !defs_1.istensor(p2)) {
        return tensor_1.tensor_times_scalar(p1, p2);
    }
    // adjust operands
    p1 = defs_1.ismultiply(p1) ? defs_1.cdr(p1) : list_1.makeList(p1);
    p2 = defs_1.ismultiply(p2) ? defs_1.cdr(p2) : list_1.makeList(p2);
    // handle numerical coefficients
    if (defs_1.isNumericAtom(defs_1.car(p1)) && defs_1.isNumericAtom(defs_1.car(p2))) {
        const arg1 = defs_1.car(p1);
        const arg2 = defs_1.car(p2);
        stack_1.push(bignum_1.multiply_numbers(arg1, arg2));
        p1 = defs_1.cdr(p1);
        p2 = defs_1.cdr(p2);
    }
    else if (defs_1.isNumericAtom(defs_1.car(p1))) {
        stack_1.push(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
    }
    else if (defs_1.isNumericAtom(defs_1.car(p2))) {
        stack_1.push(defs_1.car(p2));
        p2 = defs_1.cdr(p2);
    }
    else {
        stack_1.push(defs_1.Constants.One());
    }
    let [p3, p5] = parse_p1(p1);
    let [p4, p6] = parse_p2(p2);
    while (defs_1.iscons(p1) && defs_1.iscons(p2)) {
        if (defs_1.caar(p1) === defs_1.symbol(defs_1.OPERATOR) && defs_1.caar(p2) === defs_1.symbol(defs_1.OPERATOR)) {
            stack_1.push(new defs_1.Cons(defs_1.symbol(defs_1.OPERATOR), otherCFunctions_1.append(defs_1.cdar(p1), defs_1.cdar(p2))));
            p1 = defs_1.cdr(p1);
            p2 = defs_1.cdr(p2);
            [p3, p5] = parse_p1(p1);
            [p4, p6] = parse_p2(p2);
            continue;
        }
        switch (misc_1.cmp_expr(p3, p4)) {
            case -1:
                stack_1.push(defs_1.car(p1));
                p1 = defs_1.cdr(p1);
                [p3, p5] = parse_p1(p1);
                break;
            case 1:
                stack_1.push(defs_1.car(p2));
                p2 = defs_1.cdr(p2);
                [p4, p6] = parse_p2(p2);
                break;
            case 0:
                combine_factors(h, p4, p5, p6);
                p1 = defs_1.cdr(p1);
                p2 = defs_1.cdr(p2);
                [p3, p5] = parse_p1(p1);
                [p4, p6] = parse_p2(p2);
                break;
            default:
                run_1.stop('internal error 2');
        }
    }
    // push remaining factors, if any
    const remaining = [];
    if (defs_1.iscons(p1)) {
        remaining.push(...p1);
    }
    if (defs_1.iscons(p2)) {
        remaining.push(...p2);
    }
    stack_1.push_all(remaining);
    // normalize radical factors
    // example: 2*2(-1/2) -> 2^(1/2)
    // must be done after merge because merge may produce radical
    // example: 2^(1/2-a)*2^a -> 2^(1/2)
    __normalize_radical_factors(h);
    // this hack should not be necessary, unless power returns a multiply
    //for (i = h; i < tos; i++) {
    //  if (car(stack[i]) == symbol(MULTIPLY)) {
    //    multiply_all(tos - h)
    //    return
    //  }
    //}
    if (defs_1.defs.expanding) {
        for (let i = h; i < defs_1.defs.tos; i++) {
            if (defs_1.isadd(defs_1.defs.stack[i])) {
                const arr = stack_1.pop_n_items(defs_1.defs.tos - h);
                return multiply_all(arr);
            }
        }
    }
    // n is the number of result factors on the stack
    const n = defs_1.defs.tos - h;
    if (n === 1) {
        return stack_1.pop();
    }
    // discard integer 1
    if (defs_1.isrational(defs_1.defs.stack[h]) && is_1.equaln(defs_1.defs.stack[h], 1)) {
        if (n === 2) {
            const p7 = stack_1.pop();
            stack_1.pop();
            return p7;
        }
        else {
            defs_1.defs.stack[h] = defs_1.symbol(defs_1.MULTIPLY);
            list_1.list(n);
            return stack_1.pop();
        }
    }
    list_1.list(n);
    const p7 = stack_1.pop();
    return new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), p7);
}
// Decompose a factor into base and power.
//
// input:  car(p1)    factor
//
// output:  p3    factor's base
//          p5    factor's power (possibly 1)
function parse_p1(p1) {
    let p3 = defs_1.car(p1);
    let p5 = defs_1.Constants.One();
    if (defs_1.ispower(p3)) {
        p5 = defs_1.caddr(p3);
        p3 = defs_1.cadr(p3);
    }
    return [p3, p5];
}
// Decompose a factor into base and power.
//
// input:  car(p2)    factor
//
// output:  p4    factor's base
//          p6    factor's power (possibly 1)
function parse_p2(p2) {
    let p4 = defs_1.car(p2);
    let p6 = defs_1.Constants.One();
    if (defs_1.ispower(p4)) {
        p6 = defs_1.caddr(p4);
        p4 = defs_1.cadr(p4);
    }
    return [p4, p6];
}
// h an integer
function combine_factors(h, p4, p5, p6) {
    let p7 = power_1.power(p4, add_1.add(p5, p6));
    if (defs_1.isNumericAtom(p7)) {
        defs_1.defs.stack[h] = bignum_1.multiply_numbers(defs_1.defs.stack[h], p7);
    }
    else if (defs_1.ismultiply(p7)) {
        // power can return number * factor (i.e. -1 * i)
        if (defs_1.isNumericAtom(defs_1.cadr(p7)) && defs_1.cdddr(p7) === defs_1.symbol(defs_1.NIL)) {
            const arg1 = defs_1.defs.stack[h];
            const arg2 = defs_1.cadr(p7);
            defs_1.defs.stack[h] = bignum_1.multiply_numbers(arg1, arg2);
            stack_1.push(defs_1.caddr(p7));
        }
        else {
            stack_1.push(p7);
        }
    }
    else {
        stack_1.push(p7);
    }
}
const gp = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, -6, -7, -8, -3, -4, -5, 13, 14, 15, -16, 9, 10, 11, -12],
    [0, 0, 6, -1, -11, 10, -2, -15, 14, 12, -5, 4, -9, 16, -8, 7, -13],
    [0, 0, 7, 11, -1, -9, 15, -2, -13, 5, 12, -3, -10, 8, 16, -6, -14],
    [0, 0, 8, -10, 9, -1, -14, 13, -2, -4, 3, 12, -11, -7, 6, 16, -15],
    [0, 0, 3, 2, 15, -14, 1, 11, -10, 16, -8, 7, 13, 12, -5, 4, 9],
    [0, 0, 4, -15, 2, 13, -11, 1, 9, 8, 16, -6, 14, 5, 12, -3, 10],
    [0, 0, 5, 14, -13, 2, 10, -9, 1, -7, 6, 16, 15, -4, 3, 12, 11],
    [0, 0, 13, 12, -5, 4, 16, -8, 7, -1, -11, 10, -3, -2, -15, 14, -6],
    [0, 0, 14, 5, 12, -3, 8, 16, -6, 11, -1, -9, -4, 15, -2, -13, -7],
    [0, 0, 15, -4, 3, 12, -7, 6, 16, -10, 9, -1, -5, -14, 13, -2, -8],
    [0, 0, 16, -9, -10, -11, -13, -14, -15, -3, -4, -5, 1, -6, -7, -8, 2],
    [0, 0, 9, -16, 8, -7, -12, 5, -4, -2, -15, 14, 6, -1, -11, 10, 3],
    [0, 0, 10, -8, -16, 6, -5, -12, 3, 15, -2, -13, 7, 11, -1, -9, 4],
    [0, 0, 11, 7, -6, -16, 4, -3, -12, -14, 13, -2, 8, -10, 9, -1, 5],
    [0, 0, 12, 13, 14, 15, 9, 10, 11, -6, -7, -8, -2, -3, -4, -5, -1],
];
// this is useful for example when you are just adding/removing
// factors from an already factored quantity.
// e.g. if you factored x^2 + 3x + 2 into (x+1)(x+2)
// and you want to divide by (x+1) , i.e. you multiply by (x-1)^-1,
// then there is no need to expand.
function multiply_noexpand(arg1, arg2) {
    return defs_1.noexpand(multiply, arg1, arg2);
}
exports.multiply_noexpand = multiply_noexpand;
// multiply n factors on stack
// n an integer
function multiply_all(n) {
    if (n.length === 1) {
        return n[0];
    }
    if (n.length === 0) {
        return defs_1.Constants.One();
    }
    let temp = n[0];
    for (let i = 1; i < n.length; i++) {
        temp = multiply(temp, n[i]);
    }
    return temp;
}
exports.multiply_all = multiply_all;
// n an integer
function multiply_all_noexpand(arr) {
    return defs_1.noexpand(multiply_all, arr);
}
exports.multiply_all_noexpand = multiply_all_noexpand;
//-----------------------------------------------------------------------------
//
//  Symbolic division, or numeric division if doubles are found.
//
//  Input:    Dividend and divisor on stack
//
//  Output:    Quotient on stack
//
//-----------------------------------------------------------------------------
function divide(p1, p2) {
    if (defs_1.isNumericAtom(p1) && defs_1.isNumericAtom(p2)) {
        return bignum_1.divide_numbers(p1, p2);
    }
    else {
        return multiply(p1, inverse(p2));
    }
}
exports.divide = divide;
// this is different from inverse of a matrix (inv)!
function inverse(p1) {
    if (defs_1.isNumericAtom(p1)) {
        return bignum_1.invert_number(p1);
    }
    else {
        return power_1.power(p1, defs_1.Constants.negOne);
    }
}
exports.inverse = inverse;
function reciprocate(p1) {
    return inverse(p1);
}
exports.reciprocate = reciprocate;
function negate(p1) {
    if (defs_1.isNumericAtom(p1)) {
        return bignum_1.negate_number(p1);
    }
    else {
        return multiply(p1, defs_1.Constants.NegOne());
    }
}
exports.negate = negate;
function negate_noexpand(p1) {
    return defs_1.noexpand(negate, p1);
}
exports.negate_noexpand = negate_noexpand;
//-----------------------------------------------------------------------------
//
//  Normalize radical factors
//
//  Input:    stack[h]  Coefficient factor, possibly 1
//
//      stack[h + 1]  Second factor
//
//      stack[tos - 1]  Last factor
//
//  Output:    Reduced coefficent and normalized radicals (maybe)
//
//  Example:  2*2^(-1/2) -> 2^(1/2)
//
//  (power number number) is guaranteed to have the following properties:
//
//  1. Base is an integer
//
//  2. Absolute value of exponent < 1
//
//  These properties are assured by the power function.
//
//-----------------------------------------------------------------------------
// h is an int
function __normalize_radical_factors(h) {
    let i = 0;
    // if coeff is 1 or floating then don't bother
    if (is_1.isplusone(defs_1.defs.stack[h]) ||
        is_1.isminusone(defs_1.defs.stack[h]) ||
        defs_1.isdouble(defs_1.defs.stack[h])) {
        return;
    }
    // if no radicals then don't bother
    for (i = h + 1; i < defs_1.defs.tos; i++) {
        if (__is_radical_number(defs_1.defs.stack[i])) {
            break;
        }
    }
    if (i === defs_1.defs.tos) {
        return;
    }
    // numerator
    let A = bignum_1.mp_numerator(defs_1.defs.stack[h]);
    //console.log("__normalize_radical_factors numerator: " + stack[tos-1])
    for (let i = h + 1; i < defs_1.defs.tos; i++) {
        if (is_1.isplusone(A) || is_1.isminusone(A)) {
            break;
        }
        if (!__is_radical_number(defs_1.defs.stack[i])) {
            continue;
        }
        const BASE = defs_1.cadr(defs_1.defs.stack[i]);
        const EXPO = defs_1.caddr(defs_1.defs.stack[i]);
        // exponent must be negative
        if (!is_1.isnegativenumber(EXPO)) {
            continue;
        }
        // numerator divisible by base?
        const TMP = divide(A, BASE);
        if (!is_1.isinteger(TMP)) {
            continue;
        }
        // reduce numerator
        A = TMP;
        // invert radical
        defs_1.defs.stack[i] = list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, add_1.add(defs_1.Constants.One(), EXPO));
    }
    // denominator
    let B = bignum_1.mp_denominator(defs_1.defs.stack[h]);
    //console.log("__normalize_radical_factors denominator: " + stack[tos-1])
    for (let i = h + 1; i < defs_1.defs.tos; i++) {
        if (is_1.isplusone(B)) {
            break;
        }
        if (!__is_radical_number(defs_1.defs.stack[i])) {
            continue;
        }
        const BASE = defs_1.cadr(defs_1.defs.stack[i]);
        const EXPO = defs_1.caddr(defs_1.defs.stack[i]);
        // exponent must be positive
        if (is_1.isnegativenumber(EXPO)) {
            continue;
        }
        // denominator divisible by BASE?
        const TMP = divide(B, BASE);
        if (!is_1.isinteger(TMP)) {
            continue;
        }
        //console.log("__new radical TMP: " + TMP.toString())
        //console.log("__new radical top stack: " + stack[tos-1])
        // reduce denominator
        B = TMP;
        //console.log("__new radical BASE: " + BASE.toString())
        //console.log("__new radical EXPO: " + EXPO.toString())
        const subtracted = add_1.subtract(EXPO, defs_1.Constants.one);
        if (defs_1.dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication) {
            if (is_1.isinteger(BASE) &&
                !is_1.isinteger(subtracted) &&
                is_1.isnegativenumber(subtracted)) {
                // bail out,
                // we want to avoid going ahead with the subtraction of
                // the exponents, because that would turn a perfectly good
                // integer exponent in the denominator into a fractional one
                // i.e. a radical.
                // Note that this only prevents new radicals ending up
                // in the denominator, it doesn't fix existing ones.
                A = divide(A, BASE);
                break;
            }
        }
        //console.log("__new radical exponent: " + stack[tos-1])
        // invert radical
        defs_1.defs.stack[i] = list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, subtracted);
    }
    // reconstitute the coefficient
    defs_1.defs.stack[h] = divide(A, B);
}
// don't include i
function __is_radical_number(p) {
    // don't use i
    return (defs_1.ispower(p) &&
        defs_1.isNumericAtom(defs_1.cadr(p)) &&
        is_1.isfraction(defs_1.caddr(p)) &&
        !is_1.isminusone(defs_1.cadr(p)));
}
//-----------------------------------------------------------------------------
//
//  > a*hilbert(2)
//  ((a,1/2*a),(1/2*a,1/3*a))
//
//  Note that "a" is presumed to be a scalar. Is this correct?
//
//  Yes, because "*" has no meaning if "a" is a tensor.
//  To multiply tensors, "dot" or "outer" should be used.
//
//  > dot(a,hilbert(2))
//  dot(a,((1,1/2),(1/2,1/3)))
//
//  In this case "a" could be a scalar or tensor so the result is not
//  expanded.
//
//-----------------------------------------------------------------------------
