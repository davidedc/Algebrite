"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy_tensor = exports.power_tensor = exports.compare_tensors = exports.d_tensor_scalar = exports.d_scalar_tensor = exports.d_tensor_tensor = exports.is_square_matrix = exports.check_tensor_dimensions = exports.scalar_times_tensor = exports.tensor_times_scalar = exports.tensor_plus_tensor = exports.Eval_tensor = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const derivative_1 = require("./derivative");
const eval_1 = require("./eval");
const inner_1 = require("./inner");
const inv_1 = require("./inv");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
//(docs are generated from top-level comments, keep an eye on the formatting!)
/* tensor =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

General description
-------------------
Tensors are a strange in-between of matrices and "computer"
rectangular data structures.

Tensors, unlike matrices, and like rectangular data structures,
can have an arbitrary number of dimensions (rank), although a tensor with
rank zero is just a scalar.

Tensors, like matrices and unlike many computer rectangular data structures,
must be "contiguous" i.e. have no empty spaces within its size, and "uniform",
i.e. each element must have the same shape and hence the same rank.

Also tensors have necessarily to make a distinction between row vectors,
column vectors (which have a rank of 2) and uni-dimensional vectors (rank 1).
They look very similar but they are fundamentally different.

Tensors are 1-indexed, as per general math notation, and like Fortran,
Lua, Mathematica, SASL, MATLAB, Julia, Erlang and APL.

Tensors with elements that are also tensors get promoted to a higher rank
, this is so we can represent and get the rank of a matrix correctly.
Example:
Start with a tensor of rank 1 with 2 elements (i.e. shape: 2)
if you put in both its elements another 2 tensors
of rank 1 with 2 elements (i.e. shape: 2)
then the result is a tensor of rank 2 with shape 2,2
i.e. the dimension of a tensor at all times must be
the number of nested tensors in it.
Also, all tensors must be "uniform" i.e. they must be accessed
uniformly, which means that all existing elements of a tensor
must be contiguous and have the same shape.
Implication of it all is that you can't put arbitrary
tensors inside tensors (like you would do to represent block matrices)
Rather, all tensors inside tensors must have same shape (and hence, rank)

Limitations
-----------
n.a.

Implementation info
-------------------
Tensors are implemented...

*/
// Called from the "eval" module to evaluate tensor elements.
function Eval_tensor(a) {
    //U **a, **b
    //---------------------------------------------------------------------
    //
    //  create a new tensor for the result
    //
    //---------------------------------------------------------------------
    check_tensor_dimensions(a);
    const { nelem, ndim } = a.tensor;
    const b = alloc_1.alloc_tensor(nelem);
    b.tensor.ndim = ndim;
    b.tensor.dim = Array.from(a.tensor.dim);
    //---------------------------------------------------------------------
    //
    //  b = Eval(a)
    //
    //---------------------------------------------------------------------
    check_tensor_dimensions(b);
    b.tensor.elem = a.tensor.elem.map((el) => eval_1.Eval(el));
    check_tensor_dimensions(a);
    check_tensor_dimensions(b);
    stack_1.push(promote_tensor(b));
}
exports.Eval_tensor = Eval_tensor;
//-----------------------------------------------------------------------------
//
//  Add tensors
//
//  Input:    Operands on stack
//
//  Output:    Result on stack
//
//-----------------------------------------------------------------------------
function tensor_plus_tensor(p1, p2) {
    // are the dimension lists equal?
    if (p1.tensor.ndim !== p2.tensor.ndim) {
        return defs_1.symbol(defs_1.NIL);
    }
    if (p1.tensor.dim.some((n, i) => n !== p2.tensor.dim[i])) {
        return defs_1.symbol(defs_1.NIL);
    }
    // create a new tensor for the result
    const { nelem, ndim } = p1.tensor;
    const p3 = alloc_1.alloc_tensor(nelem);
    p3.tensor.ndim = ndim;
    p3.tensor.dim = Array.from(p1.tensor.dim);
    // c = a + b
    const a = p1.tensor.elem;
    const b = p2.tensor.elem;
    const c = p3.tensor.elem;
    for (let i = 0; i < nelem; i++) {
        c[i] = add_1.add(a[i], b[i]);
    }
    return p3;
}
exports.tensor_plus_tensor = tensor_plus_tensor;
//-----------------------------------------------------------------------------
//
//  careful not to reorder factors
//
//-----------------------------------------------------------------------------
function tensor_times_scalar(a, p2) {
    const { ndim, nelem } = a.tensor;
    const b = alloc_1.alloc_tensor(nelem);
    b.tensor.ndim = ndim;
    b.tensor.dim = Array.from(a.tensor.dim);
    b.tensor.elem = a.tensor.elem.map((a_i) => multiply_1.multiply(a_i, p2));
    return b;
}
exports.tensor_times_scalar = tensor_times_scalar;
function scalar_times_tensor(p1, a) {
    const { ndim, nelem } = a.tensor;
    const b = alloc_1.alloc_tensor(nelem);
    b.tensor.ndim = ndim;
    b.tensor.dim = Array.from(a.tensor.dim);
    b.tensor.elem = a.tensor.elem.map((a_i) => multiply_1.multiply(p1, a_i));
    return b;
}
exports.scalar_times_tensor = scalar_times_tensor;
function check_tensor_dimensions(p) {
    if (p.tensor.nelem !== p.tensor.elem.length) {
        console.log('something wrong in tensor dimensions');
        return defs_1.breakpoint;
    }
}
exports.check_tensor_dimensions = check_tensor_dimensions;
function is_square_matrix(p) {
    return (defs_1.istensor(p) && p.tensor.ndim === 2 && p.tensor.dim[0] === p.tensor.dim[1]);
}
exports.is_square_matrix = is_square_matrix;
//-----------------------------------------------------------------------------
//
//  gradient of tensor
//
//-----------------------------------------------------------------------------
function d_tensor_tensor(p1, p2) {
    //U **a, **b, **c
    const { ndim, nelem } = p1.tensor;
    if (ndim + 1 >= defs_1.MAXDIM) {
        return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), p1, p2);
    }
    const p3 = alloc_1.alloc_tensor(nelem * p2.tensor.nelem);
    p3.tensor.ndim = ndim + 1;
    p3.tensor.dim = [...p1.tensor.dim, p2.tensor.dim[0]];
    const a = p1.tensor.elem;
    const b = p2.tensor.elem;
    const c = p3.tensor.elem;
    for (let i = 0; i < nelem; i++) {
        for (let j = 0; j < p2.tensor.nelem; j++) {
            c[i * p2.tensor.nelem + j] = derivative_1.derivative(a[i], b[j]);
        }
    }
    return p3;
}
exports.d_tensor_tensor = d_tensor_tensor;
//-----------------------------------------------------------------------------
//
//  gradient of scalar
//
//-----------------------------------------------------------------------------
function d_scalar_tensor(p1, p2) {
    const p3 = alloc_1.alloc_tensor(p2.tensor.nelem);
    p3.tensor.ndim = 1;
    p3.tensor.dim[0] = p2.tensor.dim[0];
    p3.tensor.elem = p2.tensor.elem.map((a_i) => derivative_1.derivative(p1, a_i));
    return p3;
}
exports.d_scalar_tensor = d_scalar_tensor;
//-----------------------------------------------------------------------------
//
//  Derivative of tensor
//
//-----------------------------------------------------------------------------
function d_tensor_scalar(p1, p2) {
    const p3 = alloc_1.alloc_tensor(p1.tensor.nelem);
    p3.tensor.ndim = p1.tensor.ndim;
    p3.tensor.dim = [...p1.tensor.dim];
    p3.tensor.elem = p1.tensor.elem.map((a_i) => derivative_1.derivative(a_i, p2));
    return p3;
}
exports.d_tensor_scalar = d_tensor_scalar;
function compare_tensors(p1, p2) {
    if (p1.tensor.ndim < p2.tensor.ndim) {
        return -1;
    }
    if (p1.tensor.ndim > p2.tensor.ndim) {
        return 1;
    }
    for (let i = 0; i < p1.tensor.ndim; i++) {
        if (p1.tensor.dim[i] < p2.tensor.dim[i]) {
            return -1;
        }
        if (p1.tensor.dim[i] > p2.tensor.dim[i]) {
            return 1;
        }
    }
    for (let i = 0; i < p1.tensor.nelem; i++) {
        if (misc_1.equal(p1.tensor.elem[i], p2.tensor.elem[i])) {
            continue;
        }
        if (misc_1.lessp(p1.tensor.elem[i], p2.tensor.elem[i])) {
            return -1;
        }
        else {
            return 1;
        }
    }
    return 0;
}
exports.compare_tensors = compare_tensors;
//-----------------------------------------------------------------------------
//
//  Raise a tensor to a power
//
//  Input:    p1  tensor
//            p2  exponent
//
//  Output:    Result
//
//-----------------------------------------------------------------------------
function power_tensor(p1, p2) {
    // first and last dims must be equal
    let k = p1.tensor.ndim - 1;
    if (p1.tensor.dim[0] !== p1.tensor.dim[k]) {
        return list_1.makeList(defs_1.symbol(defs_1.POWER), p1, p2);
    }
    let n = bignum_1.nativeInt(p2);
    if (isNaN(n)) {
        return list_1.makeList(defs_1.symbol(defs_1.POWER), p1, p2);
    }
    if (n === 0) {
        if (p1.tensor.ndim !== 2) {
            run_1.stop('power(tensor,0) with tensor rank not equal to 2');
        }
        n = p1.tensor.dim[0];
        p1 = alloc_1.alloc_tensor(n * n);
        p1.tensor.ndim = 2;
        p1.tensor.dim[0] = n;
        p1.tensor.dim[1] = n;
        for (let i = 0; i < n; i++) {
            p1.tensor.elem[n * i + i] = defs_1.Constants.one;
        }
        check_tensor_dimensions(p1);
        return p1;
    }
    let p3 = p1;
    if (n < 0) {
        n = -n;
        p3 = inv_1.inv(p3);
    }
    let prev = p3;
    for (let i = 1; i < n; i++) {
        prev = inner_1.inner(prev, p3);
        if (is_1.isZeroAtomOrTensor(prev)) {
            break;
        }
    }
    return prev;
}
exports.power_tensor = power_tensor;
function copy_tensor(p1) {
    let p2 = alloc_1.alloc_tensor(p1.tensor.nelem);
    p2.tensor.ndim = p1.tensor.ndim;
    p2.tensor.dim = [...p1.tensor.dim];
    p2.tensor.elem = [...p1.tensor.elem];
    check_tensor_dimensions(p1);
    check_tensor_dimensions(p2);
    return p2;
}
exports.copy_tensor = copy_tensor;
// Tensors with elements that are also tensors get promoted to a higher rank.
function promote_tensor(p1) {
    if (!defs_1.istensor(p1)) {
        return p1;
    }
    let p2 = p1.tensor.elem[0];
    if (p1.tensor.elem.some((elem) => !compatible(p2, elem))) {
        run_1.stop('Cannot promote tensor due to inconsistent tensor components.');
    }
    if (!defs_1.istensor(p2)) {
        return p1;
    }
    const ndim = p1.tensor.ndim + p2.tensor.ndim;
    if (ndim > defs_1.MAXDIM) {
        run_1.stop('tensor rank > ' + defs_1.MAXDIM);
    }
    const nelem = p1.tensor.nelem * p2.tensor.nelem;
    const p3 = alloc_1.alloc_tensor(nelem);
    p3.tensor.ndim = ndim;
    p3.tensor.dim = [...p1.tensor.dim, ...p2.tensor.dim];
    p3.tensor.elem = [].concat(...p1.tensor.elem.map((el) => el.tensor.elem));
    check_tensor_dimensions(p2);
    check_tensor_dimensions(p3);
    return p3;
}
function compatible(p, q) {
    if (!defs_1.istensor(p) && !defs_1.istensor(q)) {
        return true;
    }
    if (!defs_1.istensor(p) || !defs_1.istensor(q)) {
        return false;
    }
    if (p.tensor.ndim !== q.tensor.ndim) {
        return false;
    }
    for (let i = 0; i < p.tensor.ndim; i++) {
        if (p.tensor.dim[i] !== q.tensor.dim[i]) {
            return false;
        }
    }
    return true;
}
