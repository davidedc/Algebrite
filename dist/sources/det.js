"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinant = exports.det = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const tensor_1 = require("./tensor");
/* det =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Returns the determinant of matrix m.
Uses Gaussian elimination for numerical matrices.

Example:

  det(((1,2),(3,4)))
  > -2

*/
function det(p1) {
    if (!tensor_1.is_square_matrix(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.DET), p1);
    }
    const a = p1.tensor.elem;
    const isNumeric = a.every((element) => defs_1.isNumericAtom(element));
    if (isNumeric) {
        return yydetg(p1);
    }
    else {
        return determinant(a, p1.tensor.dim[0]);
    }
}
exports.det = det;
// determinant of n * n matrix elements on the stack
function determinant(elements, n) {
    let q = 0;
    const a = [];
    //int *a, *c, *d
    //a = (int *) malloc(3 * n * sizeof (int))
    //if (a == NULL)
    //  out_of_memory()
    for (let i = 0; i < n; i++) {
        a[i] = i;
        a[i + n] = 0;
        a[i + n + n] = 1;
    }
    let sign_ = 1;
    let outerTemp = defs_1.Constants.zero;
    while (true) {
        let temp = bignum_1.integer(sign_);
        for (let i = 0; i < n; i++) {
            const k = n * a[i] + i;
            temp = multiply_1.multiply(temp, elements[k]); // FIXME -- problem here
        }
        outerTemp = add_1.add(outerTemp, temp);
        // next permutation (Knuth's algorithm P)
        let j = n - 1;
        let s = 0;
        let breakFromOutherWhile = false;
        while (true) {
            q = a[n + j] + a[n + n + j];
            if (q < 0) {
                a[n + n + j] = -a[n + n + j];
                j--;
                continue;
            }
            if (q === j + 1) {
                if (j === 0) {
                    breakFromOutherWhile = true;
                    break;
                }
                s++;
                a[n + n + j] = -a[n + n + j];
                j--;
                continue;
            }
            break;
        }
        if (breakFromOutherWhile) {
            break;
        }
        const t = a[j - a[n + j] + s];
        a[j - a[n + j] + s] = a[j - q + s];
        a[j - q + s] = t;
        a[n + j] = q;
        sign_ = sign_ === 1 ? -1 : 1;
    }
    return outerTemp;
}
exports.determinant = determinant;
//-----------------------------------------------------------------------------
//
//  Input:    Matrix on stack
//
//  Output:    Determinant on stack
//
//  Note:
//
//  Uses Gaussian elimination which is faster for numerical matrices.
//
//  Gaussian Elimination works by walking down the diagonal and clearing
//  out the columns below it.
//
//-----------------------------------------------------------------------------
function detg() {
    const p1 = stack_1.pop();
    if (!tensor_1.is_square_matrix(p1)) {
        stack_1.push(list_1.makeList(defs_1.symbol(defs_1.DET), p1));
        return;
    }
    stack_1.push(yydetg(p1));
}
function yydetg(p1) {
    const n = p1.tensor.dim[0];
    const elements = [...p1.tensor.elem];
    const decomp = lu_decomp(elements, n);
    return decomp;
}
function getM(arr, n, i, j) {
    return arr[n * i + j];
}
function setM(arr, n, i, j, value) {
    arr[n * i + j] = value;
}
//-----------------------------------------------------------------------------
//
//  Input:    n * n matrix elements
//
//  Output:    upper diagonal matrix
//
//-----------------------------------------------------------------------------
function lu_decomp(elements, n) {
    let p1 = defs_1.Constants.one;
    for (let d = 0; d < n - 1; d++) {
        if (misc_1.equal(getM(elements, n, d, d), defs_1.Constants.zero)) {
            let i = 0;
            for (i = d + 1; i < n; i++) {
                if (!misc_1.equal(getM(elements, n, i, d), defs_1.Constants.zero)) {
                    break;
                }
            }
            if (i === n) {
                p1 = defs_1.Constants.zero;
                break;
            }
            // exchange rows
            for (let j = d; j < n; j++) {
                let p2 = getM(elements, n, d, j);
                setM(elements, n, d, j, getM(elements, n, i, j));
                setM(elements, n, i, j, p2);
            }
            // negate det
            p1 = multiply_1.negate(p1);
        }
        // update det
        p1 = multiply_1.multiply(p1, getM(elements, n, d, d));
        // update lower diagonal matrix
        for (let i = d + 1; i < n; i++) {
            const p2 = multiply_1.negate(multiply_1.divide(getM(elements, n, i, d), getM(elements, n, d, d)));
            // update one row
            setM(elements, n, i, d, defs_1.Constants.zero); // clear column below pivot d
            for (let j = d + 1; j < n; j++) {
                const added = add_1.add(multiply_1.multiply(getM(elements, n, d, j), p2), getM(elements, n, i, j));
                setM(elements, n, i, j, added);
            }
        }
    }
    // last diagonal element
    return multiply_1.multiply(p1, getM(elements, n, n - 1, n - 1));
}
