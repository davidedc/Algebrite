import { alloc_tensor } from '../runtime/alloc';
import { Constants, iscons, MAXDIM, U } from '../runtime/defs';
import { push } from '../runtime/stack';
import { pop_integer } from './bignum';
import { Eval } from './eval';

export function Eval_zero(p1: U) {
  const k: number[] = [];
  for (let i = 0; i < MAXDIM; i++) {
    k[i] = 0;
  }

  let m = 1;
  let n = 0;
  if (iscons(p1)) {
    for (const el of p1.tail()) {
      push(el);
      Eval();
      let i = pop_integer();
      if (i < 1 || isNaN(i)) {
        // if the input is nonsensical just return 0
        push(Constants.zero);
        return;
      }
      m *= i;
      k[n++] = i;
    }
  }

  if (n === 0) {
    push(Constants.zero);
    return;
  }
  p1 = alloc_tensor(m);
  p1.tensor.ndim = n;
  for (let i = 0; i < n; i++) {
    p1.tensor.dim[i] = k[i];
  }
  push(p1);
}
