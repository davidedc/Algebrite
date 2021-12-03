import { alloc_tensor } from '../runtime/alloc';
import { cadr, Constants, istensor, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { push } from '../runtime/stack';
import { integer } from './bignum';
import { Eval } from './eval';
import { isZeroAtomOrTensor } from './is';

// shape of tensor
export function Eval_shape(p1: U) {
  const result = shape(Eval(cadr(p1)));
  push(result);
}

function shape(p1: U): U {
  if (!istensor(p1)) {
    if (!isZeroAtomOrTensor(p1)) {
      stop('transpose: tensor expected, 1st arg is not a tensor');
    }
    return Constants.zero;
  }

  let { ndim } = p1.tensor;

  const p2 = alloc_tensor(ndim);
  p2.tensor.ndim = 1;
  p2.tensor.dim[0] = ndim;

  for (let i = 0; i < ndim; i++) {
    p2.tensor.elem[i] = integer(p1.tensor.dim[i]);
  }

  return p2;
}
