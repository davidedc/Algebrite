"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_shape = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
// shape of tensor
function Eval_shape(p1) {
    const result = shape(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_shape = Eval_shape;
function shape(p1) {
    if (!defs_1.istensor(p1)) {
        if (!is_1.isZeroAtomOrTensor(p1)) {
            run_1.stop('transpose: tensor expected, 1st arg is not a tensor');
        }
        return defs_1.Constants.zero;
    }
    let { ndim } = p1.tensor;
    const p2 = alloc_1.alloc_tensor(ndim);
    p2.tensor.ndim = 1;
    p2.tensor.dim[0] = ndim;
    for (let i = 0; i < ndim; i++) {
        p2.tensor.elem[i] = bignum_1.integer(p1.tensor.dim[i]);
    }
    return p2;
}
