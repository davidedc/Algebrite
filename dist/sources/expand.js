"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_expand = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const degree_1 = require("./degree");
const denominator_1 = require("./denominator");
const eval_1 = require("./eval");
const factorpoly_1 = require("./factorpoly");
const factors_1 = require("./factors");
const filter_1 = require("./filter");
const guess_1 = require("./guess");
const inner_1 = require("./inner");
const inv_1 = require("./inv");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const numerator_1 = require("./numerator");
const power_1 = require("./power");
const quotient_1 = require("./quotient");
const tensor_1 = require("./tensor");
// Partial fraction expansion
//
// Example
//
//      expand(1/(x^3+x^2),x)
//
//        1      1       1
//      ---- - --- + -------
//        2     x     x + 1
//       x
function Eval_expand(p1) {
    const top = eval_1.Eval(defs_1.cadr(p1));
    const p2 = eval_1.Eval(defs_1.caddr(p1));
    const X = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(top) : p2;
    const F = top;
    stack_1.push(expand(F, X));
}
exports.Eval_expand = Eval_expand;
//define A p2
//define B p3
//define C p4
//define F p5
//define P p6
//define Q p7
//define T p8
//define X p9
function expand(F, X) {
    if (defs_1.istensor(F)) {
        return expand_tensor(F, X);
    }
    // if sum of terms then sum over the expansion of each term
    if (defs_1.isadd(F)) {
        return F.tail().reduce((a, b) => add_1.add(a, expand(b, X)), defs_1.Constants.zero);
    }
    let B = numerator_1.numerator(F);
    let A = denominator_1.denominator(F);
    [A, B] = remove_negative_exponents(A, B, X);
    // if the denominator is one then always bail out
    // also bail out if the denominator is not one but
    // it's not anything recognizable as a polynomial.
    if (is_1.isone(B) || is_1.isone(A)) {
        if (!is_1.ispolyexpandedform(A, X) || is_1.isone(A)) {
            return F;
        }
    }
    // Q = quotient
    const Q = quotient_1.divpoly(B, A, X);
    // remainder B = B - A * Q
    B = add_1.subtract(B, multiply_1.multiply(A, Q));
    // if the remainder is zero then we're done
    if (is_1.isZeroAtomOrTensor(B)) {
        return Q;
    }
    // A = factor(A)
    A = factorpoly_1.factorpoly(A, X);
    let C = expand_get_C(A, X);
    B = expand_get_B(B, C, X);
    A = expand_get_A(A, C, X);
    let result;
    if (defs_1.istensor(C)) {
        const inverse = defs_1.doexpand(inv_1.inv, C);
        result = inner_1.inner(inner_1.inner(inverse, B), A);
    }
    else {
        const arg1 = defs_1.doexpand(multiply_1.divide, B, C);
        result = multiply_1.multiply(arg1, A);
    }
    return add_1.add(result, Q);
}
function expand_tensor(p5, p9) {
    p5 = tensor_1.copy_tensor(p5);
    p5.tensor.elem = p5.tensor.elem.map((el) => {
        return expand(el, p9);
    });
    return p5;
}
function remove_negative_exponents(p2, p3, p9) {
    const arr = [...factors_1.factors(p2), ...factors_1.factors(p3)];
    // find the smallest exponent
    let j = 0;
    for (let i = 0; i < arr.length; i++) {
        const p1 = arr[i];
        if (!defs_1.ispower(p1)) {
            continue;
        }
        if (defs_1.cadr(p1) !== p9) {
            continue;
        }
        const k = bignum_1.nativeInt(defs_1.caddr(p1));
        if (isNaN(k)) {
            continue;
        }
        if (k < j) {
            j = k;
        }
    }
    if (j === 0) {
        return [p2, p3];
    }
    // A = A / X^j
    p2 = multiply_1.multiply(p2, power_1.power(p9, bignum_1.integer(-j)));
    // B = B / X^j
    p3 = multiply_1.multiply(p3, power_1.power(p9, bignum_1.integer(-j)));
    return [p2, p3];
}
// Returns the expansion coefficient matrix C.
//
// Example:
//
//       B         1
//      --- = -----------
//       A      2
//             x (x + 1)
//
// We have
//
//       B     Y1     Y2      Y3
//      --- = ---- + ---- + -------
//       A      2     x      x + 1
//             x
//
// Our task is to solve for the unknowns Y1, Y2, and Y3.
//
// Multiplying both sides by A yields
//
//           AY1     AY2      AY3
//      B = ----- + ----- + -------
//            2      x       x + 1
//           x
//
// Let
//
//            A               A                 A
//      W1 = ----       W2 = ---        W3 = -------
//             2              x               x + 1
//            x
//
// Then the coefficient matrix C is
//
//              coeff(W1,x,0)   coeff(W2,x,0)   coeff(W3,x,0)
//
//       C =    coeff(W1,x,1)   coeff(W2,x,1)   coeff(W3,x,1)
//
//              coeff(W1,x,2)   coeff(W2,x,2)   coeff(W3,x,2)
//
// It follows that
//
//       coeff(B,x,0)     Y1
//
//       coeff(B,x,1) = C Y2
//
//       coeff(B,x,2) =   Y3
//
// Hence
//
//       Y1       coeff(B,x,0)
//             -1
//       Y2 = C   coeff(B,x,1)
//
//       Y3       coeff(B,x,2)
function expand_get_C(p2, p9) {
    const stack = [];
    if (defs_1.ismultiply(p2)) {
        p2.tail().forEach((p5) => stack.push(...expand_get_CF(p2, p5, p9)));
    }
    else {
        stack.push(...expand_get_CF(p2, p2, p9));
    }
    const n = stack.length;
    if (n === 1) {
        return stack[0];
    }
    const p4 = alloc_1.alloc_tensor(n * n);
    p4.tensor.ndim = 2;
    p4.tensor.dim[0] = n;
    p4.tensor.dim[1] = n;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const arg2 = power_1.power(p9, bignum_1.integer(i));
            const divided = defs_1.doexpand(multiply_1.divide, stack[j], arg2);
            p4.tensor.elem[n * i + j] = filter_1.filter(divided, p9);
        }
    }
    return p4;
}
// The following table shows the push order for simple roots, repeated roots,
// and inrreducible factors.
//
//  Factor F        Push 1st        Push 2nd         Push 3rd      Push 4th
//
//
//                   A
//  x               ---
//                   x
//
//
//   2               A               A
//  x               ----            ---
//                    2              x
//                   x
//
//
//                     A
//  x + 1           -------
//                   x + 1
//
//
//         2            A              A
//  (x + 1)         ----------      -------
//                          2        x + 1
//                   (x + 1)
//
//
//   2                   A               Ax
//  x  + x + 1      ------------    ------------
//                    2               2
//                   x  + x + 1      x  + x + 1
//
//
//    2         2          A              Ax              A             Ax
//  (x  + x + 1)    --------------- ---------------  ------------  ------------
//                     2         2     2         2     2             2
//                   (x  + x + 1)    (x  + x + 1)     x  + x + 1    x  + x + 1
//
//
// For T = A/F and F = P^N we have
//
//
//      Factor F          Push 1st    Push 2nd    Push 3rd    Push 4th
//
//      x                 T
//
//       2
//      x                 T           TP
//
//
//      x + 1             T
//
//             2
//      (x + 1)           T           TP
//
//       2
//      x  + x + 1        T           TX
//
//        2         2
//      (x  + x + 1)      T           TX          TP          TPX
//
//
// Hence we want to push in the order
//
//      T * (P ^ i) * (X ^ j)
//
// for all i, j such that
//
//      i = 0, 1, ..., N - 1
//
//      j = 0, 1, ..., deg(P) - 1
//
// where index j runs first.
function expand_get_CF(p2, p5, p9) {
    let p6;
    let n = 0;
    if (!find_1.Find(p5, p9)) {
        return [];
    }
    const p8 = defs_1.doexpand(trivial_divide, p2, p5);
    if (defs_1.ispower(p5)) {
        n = bignum_1.nativeInt(defs_1.caddr(p5));
        p6 = defs_1.cadr(p5);
    }
    else {
        n = 1;
        p6 = p5;
    }
    const stack = [];
    const d = bignum_1.nativeInt(degree_1.degree(p6, p9));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < d; j++) {
            let arg2 = power_1.power(p6, bignum_1.integer(i));
            let arg1 = defs_1.doexpand(multiply_1.multiply, p8, arg2);
            arg2 = power_1.power(p9, bignum_1.integer(j));
            const multiplied = defs_1.doexpand(multiply_1.multiply, arg1, arg2);
            stack.push(multiplied);
        }
    }
    return stack;
}
// Returns T = A/F where F is a factor of A.
function trivial_divide(p2, p5) {
    let result = defs_1.Constants.one;
    if (defs_1.ismultiply(p2)) {
        const arr = [];
        p2.tail().forEach((p0) => {
            if (!misc_1.equal(p0, p5)) {
                // force expansion of (x+1)^2, f.e.
                arr.push(eval_1.Eval(p0));
            }
        });
        result = multiply_1.multiply_all(arr);
    }
    return result;
}
// Returns the expansion coefficient vector B.
function expand_get_B(p3, p4, p9) {
    if (!defs_1.istensor(p4)) {
        return p3;
    }
    const n = p4.tensor.dim[0];
    const p8 = alloc_1.alloc_tensor(n);
    p8.tensor.ndim = 1;
    p8.tensor.dim[0] = n;
    for (let i = 0; i < n; i++) {
        const arg2 = power_1.power(p9, bignum_1.integer(i));
        const divided = defs_1.doexpand(multiply_1.divide, p3, arg2);
        p8.tensor.elem[i] = filter_1.filter(divided, p9);
    }
    return p8;
}
// Returns the expansion fractions in A.
function expand_get_A(p2, p4, p9) {
    if (!defs_1.istensor(p4)) {
        return multiply_1.reciprocate(p2);
    }
    let elements = [];
    if (defs_1.ismultiply(p2)) {
        p2.tail().forEach((p5) => {
            elements.push(...expand_get_AF(p5, p9));
        });
    }
    else {
        elements = expand_get_AF(p2, p9);
    }
    const n = elements.length;
    const p8 = alloc_1.alloc_tensor(n);
    p8.tensor.ndim = 1;
    p8.tensor.dim[0] = n;
    p8.tensor.elem = elements;
    return p8;
}
function expand_get_AF(p5, p9) {
    let n = 1;
    if (!find_1.Find(p5, p9)) {
        return [];
    }
    if (defs_1.ispower(p5)) {
        n = bignum_1.nativeInt(defs_1.caddr(p5));
        p5 = defs_1.cadr(p5);
    }
    const results = [];
    const d = bignum_1.nativeInt(degree_1.degree(p5, p9));
    for (let i = n; i > 0; i--) {
        for (let j = 0; j < d; j++) {
            results.push(multiply_1.multiply(multiply_1.reciprocate(power_1.power(p5, bignum_1.integer(i))), power_1.power(p9, bignum_1.integer(j))));
        }
    }
    return results;
}
