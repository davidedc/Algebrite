import { caddr, cadr, Constants, isNumericAtom, U } from '../runtime/defs';
import { lessp } from '../sources/misc';
import { subtract } from './add';
import { Eval } from './eval';
import { factorial } from './factorial';
import { divide } from './multiply';

/* choose =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
n,k

General description
-------------------

Returns the number of combinations of n items taken k at a time.

For example, the number of five card hands is choose(52,5)

```
                          n!
      choose(n,k) = -------------
                     k! (n - k)!
```
*/
export function Eval_choose(p1: U) {
  const N = Eval(cadr(p1));
  const K = Eval(caddr(p1));
  return choose(N, K);
}

function choose(N: U, K: U): U {
  if (!choose_check_args(N, K)) {
    return Constants.zero;
  }
  return divide(divide(factorial(N), factorial(K)), factorial(subtract(N, K)));
}

// Result vanishes for k < 0 or k > n. (A=B, p. 19)
function choose_check_args(N: U, K: U): boolean {
  if (isNumericAtom(N) && lessp(N, Constants.zero)) {
    return false;
  } else if (isNumericAtom(K) && lessp(K, Constants.zero)) {
    return false;
  } else if (isNumericAtom(N) && isNumericAtom(K) && lessp(N, K)) {
    return false;
  } else {
    return true;
  }
}
