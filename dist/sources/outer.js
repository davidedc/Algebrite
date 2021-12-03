"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_outer = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
const tensor_1 = require("./tensor");
// Outer product of tensors
function Eval_outer(p1) {
    p1 = defs_1.cdr(p1);
    let temp = eval_1.Eval(defs_1.car(p1));
    const result = defs_1.iscons(p1)
        ? p1.tail().reduce((acc, p) => outer(acc, eval_1.Eval(p)), temp)
        : temp;
    stack_1.push(result);
}
exports.Eval_outer = Eval_outer;
function outer(p1, p2) {
    if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
        return yyouter(p1, p2);
    }
    if (defs_1.istensor(p1)) {
        return tensor_1.tensor_times_scalar(p1, p2);
    }
    if (defs_1.istensor(p2)) {
        return tensor_1.scalar_times_tensor(p1, p2);
    }
    return multiply_1.multiply(p1, p2);
}
function yyouter(p1, p2) {
    const ndim = p1.tensor.ndim + p2.tensor.ndim;
    if (ndim > defs_1.MAXDIM) {
        run_1.stop('outer: rank of result exceeds maximum');
    }
    const nelem = p1.tensor.nelem * p2.tensor.nelem;
    const p3 = alloc_1.alloc_tensor(nelem);
    p3.tensor.ndim = ndim;
    p3.tensor.dim = [...p1.tensor.dim, ...p2.tensor.dim];
    let k = 0;
    for (let i = 0; i < p1.tensor.nelem; i++) {
        for (let j = 0; j < p2.tensor.nelem; j++) {
            p3.tensor.elem[k++] = multiply_1.multiply(p1.tensor.elem[i], p2.tensor.elem[j]);
        }
    }
    return p3;
}
