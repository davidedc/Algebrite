"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transpose = exports.Eval_transpose = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const inner_1 = require("./inner");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
// Transpose tensor indices
function Eval_transpose(p1) {
    const arg1 = eval_1.Eval(defs_1.cadr(p1));
    let arg2 = defs_1.Constants.one;
    let arg3 = bignum_1.integer(2);
    if (defs_1.cddr(p1) !== defs_1.symbol(defs_1.NIL)) {
        arg2 = eval_1.Eval(defs_1.caddr(p1));
        arg3 = eval_1.Eval(defs_1.cadddr(p1));
    }
    stack_1.push(transpose(arg1, arg2, arg3));
}
exports.Eval_transpose = Eval_transpose;
// by default p3 is 2 and p2 is 1
// p3: index to be transposed
// p2: other index to be transposed
// p1: what needs to be transposed
function transpose(p1, p2, p3) {
    let t = 0;
    const ai = Array(defs_1.MAXDIM).fill(0);
    const an = Array(defs_1.MAXDIM).fill(0);
    // a transposition just goes away when applied to a scalar
    if (defs_1.isNumericAtom(p1)) {
        return p1;
    }
    // transposition goes away for identity matrix
    if ((is_1.isplusone(p2) && is_1.isplustwo(p3)) || (is_1.isplusone(p3) && is_1.isplustwo(p2))) {
        if (defs_1.isidentitymatrix(p1)) {
            return p1;
        }
    }
    // a transposition just goes away when applied to another transposition with
    // the same columns to be switched
    if (defs_1.istranspose(p1)) {
        const innerTranspSwitch1 = defs_1.car(defs_1.cdr(defs_1.cdr(p1)));
        const innerTranspSwitch2 = defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.cdr(p1))));
        if ((misc_1.equal(innerTranspSwitch1, p3) && misc_1.equal(innerTranspSwitch2, p2)) ||
            (misc_1.equal(innerTranspSwitch2, p3) && misc_1.equal(innerTranspSwitch1, p2)) ||
            (misc_1.equal(innerTranspSwitch1, defs_1.symbol(defs_1.NIL)) &&
                misc_1.equal(innerTranspSwitch2, defs_1.symbol(defs_1.NIL)) &&
                ((is_1.isplusone(p3) && is_1.isplustwo(p2)) || (is_1.isplusone(p2) && is_1.isplustwo(p3))))) {
            return defs_1.car(defs_1.cdr(p1));
        }
    }
    // if operand is a sum then distribute (if we are in expanding mode)
    if (defs_1.defs.expanding && defs_1.isadd(p1)) {
        // add the dimensions to switch but only if they are not the default ones.
        return p1
            .tail()
            .reduce((a, b) => add_1.add(a, transpose(b, p2, p3)), defs_1.Constants.zero);
    }
    // if operand is a multiplication then distribute (if we are in expanding mode)
    if (defs_1.defs.expanding && defs_1.ismultiply(p1)) {
        // add the dimensions to switch but only if they are not the default ones.
        return p1
            .tail()
            .reduce((a, b) => multiply_1.multiply(a, transpose(b, p2, p3)), defs_1.Constants.one);
    }
    // distribute the transpose of a dot if in expanding mode
    // note that the distribution happens in reverse as per tranpose rules.
    // The dot operator is not commutative, so, it matters.
    if (defs_1.defs.expanding && defs_1.isinnerordot(p1)) {
        const accumulator = [];
        if (defs_1.iscons(p1)) {
            accumulator.push(...p1.tail().map((p) => [p, p2, p3]));
        }
        accumulator.reverse();
        return accumulator.reduce((acc, p) => inner_1.inner(acc, transpose(p[0], p[1], p[2])), defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX));
    }
    if (!defs_1.istensor(p1)) {
        if (!is_1.isZeroAtomOrTensor(p1)) {
            //stop("transpose: tensor expected, 1st arg is not a tensor")
            // remove the default "dimensions to be switched"
            // parameters
            if ((!is_1.isplusone(p2) || !is_1.isplustwo(p3)) &&
                (!is_1.isplusone(p3) || !is_1.isplustwo(p2))) {
                return list_1.makeList(defs_1.symbol(defs_1.TRANSPOSE), p1, p2, p3);
            }
            return list_1.makeList(defs_1.symbol(defs_1.TRANSPOSE), p1);
        }
        return defs_1.Constants.zero;
    }
    const { ndim, nelem } = p1.tensor;
    // is it a vector?
    // so here it's something curious - note how vectors are
    // not really special two-dimensional matrices, but rather
    // 1-dimension objects (like tensors can be). So since
    // they have one dimension, transposition has no effect.
    // (as opposed as if they were special two-dimensional
    // matrices)
    // see also Ran Pan, Tensor Transpose and Its Properties. CoRR abs/1411.1503 (2014)
    if (ndim === 1) {
        return p1;
    }
    let l = bignum_1.nativeInt(p2);
    let m = bignum_1.nativeInt(p3);
    if (l < 1 || l > ndim || m < 1 || m > ndim) {
        run_1.stop('transpose: index out of range');
    }
    l--;
    m--;
    p2 = alloc_1.alloc_tensor(nelem);
    p2.tensor.ndim = ndim;
    p2.tensor.dim = [...p1.tensor.dim];
    p2.tensor.dim[l] = p1.tensor.dim[m];
    p2.tensor.dim[m] = p1.tensor.dim[l];
    const a = p1.tensor.elem;
    const b = p2.tensor.elem;
    // init tensor index
    for (let i = 0; i < ndim; i++) {
        ai[i] = 0;
        an[i] = p1.tensor.dim[i];
    }
    // copy components from a to b
    for (let i = 0; i < nelem; i++) {
        t = ai[l];
        ai[l] = ai[m];
        ai[m] = t;
        t = an[l];
        an[l] = an[m];
        an[m] = t;
        // convert tensor index to linear index k
        let k = 0;
        for (let j = 0; j < ndim; j++) {
            k = k * an[j] + ai[j];
        }
        // swap indices back
        t = ai[l];
        ai[l] = ai[m];
        ai[m] = t;
        t = an[l];
        an[l] = an[m];
        an[m] = t;
        // copy one element
        b[k] = a[i];
        // increment tensor index
        // Suppose the tensor dimensions are 2 and 3.
        // Then the tensor index ai increments as follows:
        // 00 -> 01
        // 01 -> 02
        // 02 -> 10
        // 10 -> 11
        // 11 -> 12
        // 12 -> 00
        for (let j = ndim - 1; j >= 0; j--) {
            if (++ai[j] < an[j]) {
                break;
            }
            ai[j] = 0;
        }
    }
    return p2;
}
exports.transpose = transpose;
