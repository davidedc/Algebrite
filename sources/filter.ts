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
  let result = Eval(car(p1));

  if (iscons(p1)) {
    result = p1.tail().reduce((acc: U, p: U) => filter(acc, Eval(p)), result);
  }
  push(result);
}

export function filter(F: U, X: U): U {
  return filter_main(F, X);
}

function filter_main(F: U, X: U): U {
  if (isadd(F)) {
    return filter_sum(F, X);
  }

  if (istensor(F)) {
    return filter_tensor(F, X);
  }

  if (Find(F, X)) {
    return Constants.zero;
  }

  return F;
}

function filter_sum(F: U, X: U) {
  return iscons(F)
    ? F.tail().reduce((a: U, b: U) => add(a, filter(b, X)), Constants.zero)
    : Constants.zero;
}

function filter_tensor(F: Tensor, X: U): U {
  const n = F.tensor.nelem;
  const p3 = alloc_tensor(n);
  p3.tensor.ndim = F.tensor.ndim;
  p3.tensor.dim = Array.from(F.tensor.dim);
  p3.tensor.elem = F.tensor.elem.map((el) => filter(el, X));
  return p3;
}
