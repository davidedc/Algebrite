import { alloc_tensor } from '../runtime/alloc';
import { cadr, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { push } from '../runtime/stack';
import { cofactor } from './cofactor';
import { Eval } from './eval';
import { is_square_matrix } from './tensor';

/* adj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Returns the adjunct of matrix m. The inverse of m is equal to adj(m) divided by det(m).

*/
export function Eval_adj(p1: U) {
  const result = adj(Eval(cadr(p1)));
  push(result);
}

export function adj(p1: U): U {
  if (!is_square_matrix(p1)) {
    stop('adj: square matrix expected');
  }

  const n = p1.tensor.dim[0];

  const p2 = alloc_tensor(n * n);

  p2.tensor.ndim = 2;
  p2.tensor.dim[0] = n;
  p2.tensor.dim[1] = n;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      p2.tensor.elem[n * j + i] = cofactor(p1, n, i, j);
    }
  } // transpose

  return p2;
}
