import { alloc_tensor } from '../runtime/alloc';
import {
  car,
  cdr,
  iscons,
  istensor,
  NIL,
  U,
  Cons,
} from '../runtime/defs';
import { equal } from '../sources/misc';
import { check_tensor_dimensions } from './tensor';
import {symbol} from "../runtime/symbol";

/*
  Substitute new expr for old expr in expr.

  Input:  expr     expr
          oldExpr  old expr
          newExpr  new expr

  Output:  Result
*/
export function subst(expr: U, oldExpr: U, newExpr: U): U {
  if (oldExpr === symbol(NIL) || newExpr === symbol(NIL)) {
    return expr;
  }
  if (istensor(expr)) {
    const p4 = alloc_tensor(expr.tensor.nelem);
    p4.tensor.ndim = expr.tensor.ndim;
    p4.tensor.dim = Array.from(expr.tensor.dim);
    p4.tensor.elem = expr.tensor.elem.map((el) => {
      const result = subst(el, oldExpr, newExpr);
      check_tensor_dimensions(p4);
      return result;
    });
    return p4;
  }
  if (equal(expr, oldExpr)) {
    return newExpr;
  }
  if (iscons(expr)) {
    return new Cons(
      subst(car(expr), oldExpr, newExpr),
      subst(cdr(expr), oldExpr, newExpr)
    );
  }

  return expr;
}
