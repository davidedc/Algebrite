import { alloc_tensor } from '../runtime/alloc';
import { car, cdr, iscons, istensor, MAXDIM, Tensor, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { Eval } from './eval';
import { multiply } from './multiply';
import { scalar_times_tensor, tensor_times_scalar } from './tensor';

// Outer product of tensors
export function Eval_outer(p1: U) {
  p1 = cdr(p1);
  let temp = Eval(car(p1));

  const result = iscons(p1)
    ? p1.tail().reduce((acc: U, p: U) => outer(acc, Eval(p)), temp)
    : temp;
  return result;
}

function outer(p1: U, p2: U): U {
  if (istensor(p1) && istensor(p2)) {
    return yyouter(p1, p2);
  }
  if (istensor(p1)) {
    return tensor_times_scalar(p1, p2);
  }
  if (istensor(p2)) {
    return scalar_times_tensor(p1, p2);
  }
  return multiply(p1, p2);
}

function yyouter(p1: Tensor, p2: Tensor): U {
  const ndim = p1.tensor.ndim + p2.tensor.ndim;
  if (ndim > MAXDIM) {
    stop('outer: rank of result exceeds maximum');
  }

  const nelem = p1.tensor.nelem * p2.tensor.nelem;
  const p3 = alloc_tensor(nelem);
  p3.tensor.ndim = ndim;
  p3.tensor.dim = [...p1.tensor.dim, ...p2.tensor.dim];

  let k = 0;
  for (let i = 0; i < p1.tensor.nelem; i++) {
    for (let j = 0; j < p2.tensor.nelem; j++) {
      p3.tensor.elem[k++] = multiply(p1.tensor.elem[i], p2.tensor.elem[j]);
    }
  }

  return p3;
}
