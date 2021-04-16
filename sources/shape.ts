import { alloc_tensor } from '../runtime/alloc';
import { cadr, Constants, istensor, MAXDIM, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { push_integer } from './bignum';
import { Eval } from './eval';
import { isZeroAtomOrTensor } from './is';

// shape of tensor
export function Eval_shape(p1: U) {
  push(cadr(p1));
  Eval();
  shape();
}

function shape() {
  const ai: number[] = [];
  const an: number[] = [];
  for (let i = 0; i < MAXDIM; i++) {
    ai[i] = 0;
    an[i] = 0;
  }

  const p1 = pop();

  if (!istensor(p1)) {
    if (!isZeroAtomOrTensor(p1)) {
      stop('transpose: tensor expected, 1st arg is not a tensor');
    }
    push(Constants.zero);
    return;
  }

  let { ndim } = p1.tensor;

  const p2 = alloc_tensor(ndim);

  p2.tensor.ndim = 1;
  p2.tensor.dim[0] = ndim;

  for (let i = 0; i < ndim; i++) {
    push_integer(p1.tensor.dim[i]);
    p2.tensor.elem[i] = pop();
  }

  push(p2);
}
