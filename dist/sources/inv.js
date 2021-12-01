"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invg = exports.inv = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const adj_1 = require("./adj");
const det_1 = require("./det");
const inner_1 = require("./inner");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const tensor_1 = require("./tensor");
//-----------------------------------------------------------------------------
//
//  Input:    Matrix (must have two dimensions but it can be non-numerical)
//
//  Output:    Inverse
//
//  Example:
//
//  > inv(((1,2),(3,4))
//  ((-2,1),(3/2,-1/2))
//
//  > inv(((a,b),(c,d))
//  ((d / (a d - b c),-b / (a d - b c)),(-c / (a d - b c),a / (a d - b c)))
//
//  Note:
//
//  THIS IS DIFFERENT FROM INVERSE OF AN EXPRESSION (inv)
//   Uses Gaussian elimination for numerical matrices.
//
//-----------------------------------------------------------------------------
function inv(p1) {
    // an inv just goes away when applied to another inv
    if (defs_1.isinv(p1)) {
        return defs_1.car(defs_1.cdr(p1));
    }
    // inverse goes away in case of identity matrix
    if (defs_1.isidentitymatrix(p1)) {
        return p1;
    }
    // distribute the inverse of a dot if in expanding mode
    // note that the distribution happens in reverse.
    // The dot operator is not commutative, so, it matters.
    if (defs_1.defs.expanding && defs_1.isinnerordot(p1)) {
        const accumulator = defs_1.iscons(p1) ? p1.tail() : [];
        const inverses = accumulator.map(inv);
        for (let i = inverses.length - 1; i > 0; i--) {
            inverses[i - 1] = inner_1.inner(inverses[i], inverses[i - 1]);
        }
        return inverses[0];
    }
    if (!tensor_1.is_square_matrix(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.INV), p1);
    }
    if (defs_1.isNumericAtomOrTensor(p1)) {
        return yyinvg(p1);
    }
    const p2 = det_1.det(p1);
    if (is_1.isZeroAtomOrTensor(p2)) {
        run_1.stop('inverse of singular matrix');
    }
    return multiply_1.divide(adj_1.adj(p1), p2);
}
exports.inv = inv;
function invg(p1) {
    if (!tensor_1.is_square_matrix(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.INVG), p1);
    }
    return yyinvg(p1);
}
exports.invg = invg;
// inverse using gaussian elimination
function yyinvg(p1) {
    const n = p1.tensor.dim[0];
    // create an identity matrix
    const units = new Array(n * n);
    units.fill(defs_1.Constants.zero);
    for (let i = 0; i < n; i++) {
        units[i * n + i] = defs_1.Constants.one;
    }
    const inverse = INV_decomp(units, p1.tensor.elem, n);
    const result = alloc_1.alloc_tensor(n * n);
    result.tensor.ndim = 2;
    result.tensor.dim[0] = n;
    result.tensor.dim[1] = n;
    result.tensor.elem = inverse;
    return result;
}
//-----------------------------------------------------------------------------
//
//  Input:    n * n unit matrix
//            n * n operand
//
//  Output:    n * n inverse matrix
//
//-----------------------------------------------------------------------------
function INV_decomp(units, elements, n) {
    for (let d = 0; d < n; d++) {
        if (misc_1.equal(elements[n * d + d], defs_1.Constants.zero)) {
            let i = 0;
            for (i = d + 1; i < n; i++) {
                if (!misc_1.equal(elements[n * i + d], defs_1.Constants.zero)) {
                    break;
                }
            }
            if (i === n) {
                run_1.stop('inverse of singular matrix');
            }
            // exchange rows
            for (let j = 0; j < n; j++) {
                let p2 = elements[n * d + j];
                elements[n * d + j] = elements[n * i + j];
                elements[n * i + j] = p2;
                p2 = units[n * d + j];
                units[n * d + j] = units[n * i + j];
                units[n * i + j] = p2;
            }
        }
        // multiply the pivot row by 1 / pivot
        const p2 = elements[n * d + d];
        for (let j = 0; j < n; j++) {
            if (j > d) {
                elements[n * d + j] = multiply_1.divide(elements[n * d + j], p2);
            }
            units[n * d + j] = multiply_1.divide(units[n * d + j], p2);
        }
        for (let i = 0; i < n; i++) {
            if (i === d) {
                continue;
            }
            // multiplier
            const p2 = elements[n * i + d];
            for (let j = 0; j < n; j++) {
                if (j > d) {
                    elements[n * i + j] = add_1.subtract(elements[n * i + j], multiply_1.multiply(elements[n * d + j], p2));
                }
                units[n * i + j] = add_1.subtract(units[n * i + j], multiply_1.multiply(units[n * d + j], p2));
            }
        }
    }
    return units;
}
