"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hilbert = void 0;
const defs_1 = require("../runtime/defs");
const misc_1 = require("../sources/misc");
const bignum_1 = require("./bignum");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
//-----------------------------------------------------------------------------
//
//  Create a Hilbert matrix
//
//  Input:    Dimension
//
//  Output:    Hilbert matrix
//
//  Example:
//
//  > hilbert(5)
//  ((1,1/2,1/3,1/4),(1/2,1/3,1/4,1/5),(1/3,1/4,1/5,1/6),(1/4,1/5,1/6,1/7))
//
//-----------------------------------------------------------------------------
//define AELEM(i, j) A->u.tensor->elem[i * n + j]
function hilbert(N) {
    const n = bignum_1.nativeInt(N);
    if (n < 2) {
        return list_1.makeList(defs_1.symbol(defs_1.HILBERT), N);
    }
    const A = misc_1.zero_matrix(n, n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            A.tensor.elem[i * n + j] = multiply_1.inverse(bignum_1.integer(i + j + 1));
        }
    }
    return A;
}
exports.hilbert = hilbert;
