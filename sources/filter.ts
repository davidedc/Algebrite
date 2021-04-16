import { alloc_tensor } from '../runtime/alloc';
import {
  car,
  cdr,
  Constants,
  isadd,
  iscons,
  istensor,
  Tensor,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { pop, push } from '../runtime/stack';
import { add } from './add';
import { Eval } from './eval';

/*
Remove terms that involve a given symbol or expression. For example...

  filter(x^2 + x + 1, x)    =>  1

  filter(x^2 + x + 1, x^2)  =>  x + 1
*/
export function Eval_filter(p1: U) {
  p1 = cdr(p1);
  push(car(p1));
  Eval();

  if (iscons(p1)) {
    p1.tail().forEach((p) => {
      push(p);
      Eval();
      const arg2 = pop();
      const arg1 = pop();
      push(filter(arg1, arg2));
    });
  }
}

/*
 For example...

  push(F)
  push(X)
  filter()
  F = pop()
*/
export function filter(p1: U, p2: U): U {
  return filter_main(p1, p2);
}

function filter_main(p1: U, p2: U): U {
  if (isadd(p1)) {
    return filter_sum(p1, p2);
  }

  if (istensor(p1)) {
    return filter_tensor(p1, p2);
  }

  if (Find(p1, p2)) {
    return Constants.zero;
  }

  return p1;
}

function filter_sum(p1: U, p2: U) {
  return iscons(p1)
    ? p1.tail().reduce((a: U, b: U) => add(a, filter(b, p2)), Constants.zero)
    : Constants.zero;
}

function filter_tensor(p1: Tensor, p2: U): U {
  const n = p1.tensor.nelem;
  const p3 = alloc_tensor(n);
  p3.tensor.ndim = p1.tensor.ndim;
  p3.tensor.dim = Array.from(p1.tensor.dim);
  p3.tensor.elem = p1.tensor.elem.map((el) => filter(el, p2));
  return p3;
}
