import { alloc_tensor } from '../runtime/alloc';
import {
  breakpoint,
  Constants,
  DERIVATIVE,
  istensor,
  MAXDIM,
  NIL,
  POWER,
  Sign,
  symbol,
  Sym,
  Tensor,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { push } from '../runtime/stack';
import { equal, lessp } from '../sources/misc';
import { add } from './add';
import { nativeInt } from './bignum';
import { derivative } from './derivative';
import { Eval } from './eval';
import { inner } from './inner';
import { inv } from './inv';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { multiply } from './multiply';

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
export function Eval_tensor(a: Tensor) {
  //U **a, **b
  //---------------------------------------------------------------------
  //
  //  create a new tensor for the result
  //
  //---------------------------------------------------------------------
  check_tensor_dimensions(a);

  const { nelem, ndim } = a.tensor;
  const b = alloc_tensor(nelem);
  b.tensor.ndim = ndim;
  b.tensor.dim = Array.from(a.tensor.dim);

  //---------------------------------------------------------------------
  //
  //  b = Eval(a)
  //
  //---------------------------------------------------------------------

  check_tensor_dimensions(b);

  b.tensor.elem = a.tensor.elem.map((el) => Eval(el));

  check_tensor_dimensions(a);
  check_tensor_dimensions(b);

  push(promote_tensor(b));
}

//-----------------------------------------------------------------------------
//
//  Add tensors
//
//  Input:    Operands on stack
//
//  Output:    Result on stack
//
//-----------------------------------------------------------------------------
export function tensor_plus_tensor(p1: Tensor, p2: Tensor): U {
  // are the dimension lists equal?
  if (p1.tensor.ndim !== p2.tensor.ndim) {
    return symbol(NIL);
  }

  if (p1.tensor.dim.some((n, i) => n !== p2.tensor.dim[i])) {
    return symbol(NIL);
  }

  // create a new tensor for the result
  const { nelem, ndim } = p1.tensor;
  const p3 = alloc_tensor(nelem);
  p3.tensor.ndim = ndim;
  p3.tensor.dim = Array.from(p1.tensor.dim);

  // c = a + b
  const a = p1.tensor.elem;
  const b = p2.tensor.elem;
  const c = p3.tensor.elem;

  for (let i = 0; i < nelem; i++) {
    c[i] = add(a[i], b[i]);
  }

  return p3;
}

//-----------------------------------------------------------------------------
//
//  careful not to reorder factors
//
//-----------------------------------------------------------------------------
export function tensor_times_scalar(a: Tensor, p2: U): U {
  const { ndim, nelem } = a.tensor;

  const b: U = alloc_tensor(nelem);
  b.tensor.ndim = ndim;
  b.tensor.dim = Array.from(a.tensor.dim);
  b.tensor.elem = a.tensor.elem.map((a_i) => multiply(a_i, p2));
  return b;
}

export function scalar_times_tensor(p1: U, a: Tensor): U {
  const { ndim, nelem } = a.tensor;

  const b = alloc_tensor(nelem);
  b.tensor.ndim = ndim;
  b.tensor.dim = Array.from(a.tensor.dim);
  b.tensor.elem = a.tensor.elem.map((a_i) => multiply(p1, a_i));
  return b;
}

export function check_tensor_dimensions(p: Tensor) {
  if (p.tensor.nelem !== p.tensor.elem.length) {
    console.log('something wrong in tensor dimensions');
    return breakpoint;
  }
}

export function is_square_matrix(
  p: U
): p is Tensor & { ndim: 2; square: true } {
  return (
    istensor(p) && p.tensor.ndim === 2 && p.tensor.dim[0] === p.tensor.dim[1]
  );
}

//-----------------------------------------------------------------------------
//
//  gradient of tensor
//
//-----------------------------------------------------------------------------
export function d_tensor_tensor(p1: Tensor, p2: Tensor): U {
  //U **a, **b, **c
  const { ndim, nelem } = p1.tensor;

  if (ndim + 1 >= MAXDIM) {
    return makeList(symbol(DERIVATIVE), p1, p2);
  }

  const p3 = alloc_tensor(nelem * p2.tensor.nelem);
  p3.tensor.ndim = ndim + 1;
  p3.tensor.dim = [...p1.tensor.dim, p2.tensor.dim[0]];

  const a = p1.tensor.elem;
  const b = p2.tensor.elem;
  const c = p3.tensor.elem;

  for (let i = 0; i < nelem; i++) {
    for (let j = 0; j < p2.tensor.nelem; j++) {
      c[i * p2.tensor.nelem + j] = derivative(a[i], b[j]);
    }
  }

  return p3;
}

//-----------------------------------------------------------------------------
//
//  gradient of scalar
//
//-----------------------------------------------------------------------------
export function d_scalar_tensor(p1: U, p2: Tensor): U {
  const p3 = alloc_tensor(p2.tensor.nelem);
  p3.tensor.ndim = 1;
  p3.tensor.dim[0] = p2.tensor.dim[0];
  p3.tensor.elem = p2.tensor.elem.map((a_i) => derivative(p1, a_i));
  return p3;
}

//-----------------------------------------------------------------------------
//
//  Derivative of tensor
//
//-----------------------------------------------------------------------------
export function d_tensor_scalar(p1: Tensor, p2: U): U {
  const p3 = alloc_tensor(p1.tensor.nelem);
  p3.tensor.ndim = p1.tensor.ndim;
  p3.tensor.dim = [...p1.tensor.dim];
  p3.tensor.elem = p1.tensor.elem.map((a_i) => derivative(a_i, p2));
  return p3;
}

export function compare_tensors(p1: Tensor, p2: Tensor): Sign {
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
    if (equal(p1.tensor.elem[i], p2.tensor.elem[i])) {
      continue;
    }
    if (lessp(p1.tensor.elem[i], p2.tensor.elem[i])) {
      return -1;
    } else {
      return 1;
    }
  }

  return 0;
}

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
export function power_tensor(p1: Tensor, p2: U): Tensor {
  // first and last dims must be equal
  let k = p1.tensor.ndim - 1;

  if (p1.tensor.dim[0] !== p1.tensor.dim[k]) {
    return makeList(symbol(POWER), p1, p2) as Tensor;
  }

  let n = nativeInt(p2);

  if (isNaN(n)) {
    return makeList(symbol(POWER), p1, p2) as Tensor;
  }

  if (n === 0) {
    if (p1.tensor.ndim !== 2) {
      stop('power(tensor,0) with tensor rank not equal to 2');
    }
    n = p1.tensor.dim[0];
    p1 = alloc_tensor(n * n);
    p1.tensor.ndim = 2;
    p1.tensor.dim[0] = n;
    p1.tensor.dim[1] = n;
    for (let i = 0; i < n; i++) {
      p1.tensor.elem[n * i + i] = Constants.one;
    }

    check_tensor_dimensions(p1);

    return p1;
  }

  let p3: Tensor | Sym = p1;
  if (n < 0) {
    n = -n;
    p3 = inv(p3);
  }

  let prev: U = p3;
  for (let i = 1; i < n; i++) {
    prev = inner(prev, p3);
    if (isZeroAtomOrTensor(prev)) {
      break;
    }
  }
  return prev as Tensor;
}

export function copy_tensor(p1: Tensor): Tensor {
  let p2 = alloc_tensor(p1.tensor.nelem);

  p2.tensor.ndim = p1.tensor.ndim;
  p2.tensor.dim = [...p1.tensor.dim];
  p2.tensor.elem = [...p1.tensor.elem];

  check_tensor_dimensions(p1);
  check_tensor_dimensions(p2);

  return p2;
}

// Tensors with elements that are also tensors get promoted to a higher rank.
function promote_tensor(p1: U): U {
  if (!istensor(p1)) {
    return p1;
  }

  let p2 = p1.tensor.elem[0];

  if (p1.tensor.elem.some((elem) => !compatible(p2, elem))) {
    stop('Cannot promote tensor due to inconsistent tensor components.');
  }

  if (!istensor(p2)) {
    return p1;
  }

  const ndim = p1.tensor.ndim + p2.tensor.ndim;
  if (ndim > MAXDIM) {
    stop('tensor rank > ' + MAXDIM);
  }

  const nelem = p1.tensor.nelem * p2.tensor.nelem;
  const p3 = alloc_tensor(nelem);
  p3.tensor.ndim = ndim;
  p3.tensor.dim = [...p1.tensor.dim, ...p2.tensor.dim];
  p3.tensor.elem = [].concat(
    ...p1.tensor.elem.map((el: Tensor) => el.tensor.elem)
  );

  check_tensor_dimensions(p2);
  check_tensor_dimensions(p3);

  return p3;
}

function compatible(p: U, q: U): boolean {
  if (!istensor(p) && !istensor(q)) {
    return true;
  }

  if (!istensor(p) || !istensor(q)) {
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
