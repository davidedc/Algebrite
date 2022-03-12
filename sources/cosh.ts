import {
  ARCCOSH,
  cadr,
  car,
  Constants,
  COSH,
  isdouble,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { double } from './bignum';
import { Eval } from './eval';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import {symbol} from "../runtime/symbol";

/* cosh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the hyperbolic cosine of x

```
            exp(x) + exp(-x)
  cosh(x) = ----------------
                   2
```

*/
export function Eval_cosh(p1: U) {
  const result = ycosh(Eval(cadr(p1)));
  push(result);
}

export function ycosh(p1: U): U {
  if (car(p1) === symbol(ARCCOSH)) {
    return cadr(p1);
  }
  if (isdouble(p1)) {
    let d = Math.cosh(p1.d);
    if (Math.abs(d) < 1e-10) {
      d = 0.0;
    }
    return double(d);
  }
  if (isZeroAtomOrTensor(p1)) {
    return Constants.one;
  }
  return makeList(symbol(COSH), p1);
}
