import { alloc_tensor } from '../runtime/alloc';
import { Constants, iscons, MAXDIM, U } from '../runtime/defs';
import { evaluate_integer } from './eval';

export function Eval_zero(p1: U) {
  const k: number[] = Array(MAXDIM).fill(0);

  let m = 1;
  let n = 0;
  if (iscons(p1)) {
    for (const el of p1.tail()) {
      const i = evaluate_integer(el);
      if (i < 1 || isNaN(i)) {
        // if the input is nonsensical just return 0
        return Constants.zero;
      }
      m *= i;
      k[n++] = i;
    }
  }

  if (n === 0) {
    return Constants.zero;
  }
  p1 = alloc_tensor(m);
  p1.tensor.ndim = n;
  for (let i = 0; i < n; i++) {
    p1.tensor.dim[i] = k[i];
  }
  return p1;
}
