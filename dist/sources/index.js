"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.set_component = exports.index_function = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const tensor_1 = require("./tensor");
// n is the total number of things on the stack. The first thing on the stack
// is the object to be indexed, followed by the indices themselves.
// called by Eval_index
function index_function(stack) {
    const s = 0;
    let p1 = stack[s];
    const { ndim } = p1.tensor;
    const m = stack.length - 1;
    if (m > ndim) {
        run_1.stop('too many indices for tensor');
    }
    let k = 0;
    for (let i = 0; i < m; i++) {
        const t = bignum_1.nativeInt(stack[s + i + 1]);
        if (t < 1 || t > p1.tensor.dim[i]) {
            run_1.stop('index out of range');
        }
        k = k * p1.tensor.dim[i] + t - 1;
    }
    if (ndim === m) {
        return p1.tensor.elem[k];
    }
    k = p1.tensor.dim.slice(m).reduce((a, b) => a * b, k);
    const nelem = p1.tensor.dim.slice(m).reduce((a, b) => a * b, 1);
    const p2 = alloc_1.alloc_tensor(nelem);
    p2.tensor.ndim = ndim - m;
    p2.tensor.dim = p1.tensor.dim.slice(m);
    for (let i = 0; i < nelem; i++) {
        p2.tensor.elem[i] = p1.tensor.elem[k + i];
    }
    tensor_1.check_tensor_dimensions(p1);
    tensor_1.check_tensor_dimensions(p2);
    return p2;
}
exports.index_function = index_function;
//-----------------------------------------------------------------------------
//
//  Input:    n    Number of args on stack
//
//      tos-n    Right-hand value
//
//      tos-n+1    Left-hand value
//
//      tos-n+2    First index
//
//      .
//      .
//      .
//
//      tos-1    Last index
//
//  Output:    Result on stack
//
//-----------------------------------------------------------------------------
function set_component(n) {
    if (n < 3) {
        run_1.stop('error in indexed assign');
    }
    const s = defs_1.defs.tos - n;
    const RVALUE = defs_1.defs.stack[s];
    let LVALUE = defs_1.defs.stack[s + 1];
    if (!defs_1.istensor(LVALUE)) {
        run_1.stop('error in indexed assign: assigning to something that is not a tensor');
    }
    const { ndim } = LVALUE.tensor;
    const m = n - 2;
    if (m > ndim) {
        run_1.stop('error in indexed assign');
    }
    let k = 0;
    for (let i = 0; i < m; i++) {
        const t = bignum_1.nativeInt(defs_1.defs.stack[s + i + 2]);
        if (t < 1 || t > LVALUE.tensor.dim[i]) {
            run_1.stop('error in indexed assign\n');
        }
        k = k * LVALUE.tensor.dim[i] + t - 1;
    }
    for (let i = m; i < ndim; i++) {
        k = k * LVALUE.tensor.dim[i] + 0;
    }
    // copy
    const TMP = alloc_1.alloc_tensor(LVALUE.tensor.nelem);
    TMP.tensor.ndim = LVALUE.tensor.ndim;
    TMP.tensor.dim = Array.from(LVALUE.tensor.dim);
    TMP.tensor.elem = Array.from(LVALUE.tensor.elem);
    tensor_1.check_tensor_dimensions(LVALUE);
    tensor_1.check_tensor_dimensions(TMP);
    LVALUE = TMP;
    if (ndim === m) {
        if (defs_1.istensor(RVALUE)) {
            run_1.stop('error in indexed assign');
        }
        LVALUE.tensor.elem[k] = RVALUE;
        tensor_1.check_tensor_dimensions(LVALUE);
        stack_1.moveTos(defs_1.defs.tos - n);
        stack_1.push(LVALUE);
        return;
    }
    // see if the rvalue matches
    if (!defs_1.istensor(RVALUE)) {
        run_1.stop('error in indexed assign');
    }
    if (ndim - m !== RVALUE.tensor.ndim) {
        run_1.stop('error in indexed assign');
    }
    for (let i = 0; i < RVALUE.tensor.ndim; i++) {
        if (LVALUE.tensor.dim[m + i] !== RVALUE.tensor.dim[i]) {
            run_1.stop('error in indexed assign');
        }
    }
    // copy rvalue
    for (let i = 0; i < RVALUE.tensor.nelem; i++) {
        LVALUE.tensor.elem[k + i] = RVALUE.tensor.elem[i];
    }
    tensor_1.check_tensor_dimensions(LVALUE);
    tensor_1.check_tensor_dimensions(RVALUE);
    stack_1.moveTos(defs_1.defs.tos - n);
    stack_1.push(LVALUE);
}
exports.set_component = set_component;
