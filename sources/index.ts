import { alloc_tensor } from '../runtime/alloc';
import { istensor, Tensor, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { nativeInt } from './bignum';
import { check_tensor_dimensions } from './tensor';

// n is the total number of things on the stack. The first thing on the stack
// is the object to be indexed, followed by the indices themselves.

// called by Eval_index
export function index_function(p1: Tensor, indices:U[]):U {
  const { ndim } = p1.tensor;

  const m = indices.length;

  if (m > ndim) {
    stop('too many indices for tensor');
  }

  let k = 0;

  for (let i = 0; i < m; i++) {
    const t = nativeInt(indices[i]);
    if (t < 1 || t > p1.tensor.dim[i]) {
      stop('index out of range');
    }
    k = k * p1.tensor.dim[i] + t - 1;
  }

  if (ndim === m) {
    return p1.tensor.elem[k];
  }

  k = p1.tensor.dim.slice(m).reduce((a, b) => a * b, k);
  const nelem = p1.tensor.dim.slice(m).reduce((a, b) => a * b, 1);

  const p2: U = alloc_tensor(nelem);

  p2.tensor.ndim = ndim - m;

  p2.tensor.dim = p1.tensor.dim.slice(m);

  for (let i = 0; i < nelem; i++) {
    p2.tensor.elem[i] = p1.tensor.elem[k + i];
  }

  check_tensor_dimensions(p1);
  check_tensor_dimensions(p2);

  return p2;
}


export function set_component(RVALUE:U, ...args:U[]):U {
  if (args.length < 2) {
    stop('error in indexed assign');
  }
  let[LVALUE, ...indices] = args;

  if (!istensor(LVALUE)) {
    stop(
      'error in indexed assign: assigning to something that is not a tensor'
    );
  }

  const { ndim } = LVALUE.tensor;

  const m = indices.length;

  if (m > ndim) {
    stop('error in indexed assign');
  }

  let k = 0;
  for (let i = 0; i < m; i++) {
    const t = nativeInt(indices[i]);
    if (t < 1 || t > LVALUE.tensor.dim[i]) {
      stop('error in indexed assign\n');
    }
    k = k * LVALUE.tensor.dim[i] + t - 1;
  }

  for (let i = m; i < ndim; i++) {
    k = k * LVALUE.tensor.dim[i] + 0;
  }

  // copy
  const TMP = alloc_tensor(LVALUE.tensor.nelem);
  TMP.tensor.ndim = LVALUE.tensor.ndim;
  TMP.tensor.dim = Array.from(LVALUE.tensor.dim);
  TMP.tensor.elem = Array.from(LVALUE.tensor.elem);

  check_tensor_dimensions(LVALUE);
  check_tensor_dimensions(TMP);

  LVALUE = TMP;

  if (ndim === m) {
    if (istensor(RVALUE)) {
      stop('error in indexed assign');
    }
    LVALUE.tensor.elem[k] = RVALUE;

    check_tensor_dimensions(LVALUE);

    return LVALUE;
  }

  // see if the rvalue matches
  if (!istensor(RVALUE)) {
    stop('error in indexed assign');
  }

  if (ndim - m !== RVALUE.tensor.ndim) {
    stop('error in indexed assign');
  }

  for (let i = 0; i < RVALUE.tensor.ndim; i++) {
    if (LVALUE.tensor.dim[m + i] !== RVALUE.tensor.dim[i]) {
      stop('error in indexed assign');
    }
  }

  // copy rvalue
  for (let i = 0; i < RVALUE.tensor.nelem; i++) {
    LVALUE.tensor.elem[k + i] = RVALUE.tensor.elem[i];
  }

  check_tensor_dimensions(LVALUE);
  check_tensor_dimensions(RVALUE);

  return LVALUE;
}
