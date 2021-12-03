import {
  Constants,
  DET,
  isNumericAtom,
  Sign,
  symbol,
  Tensor,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { equal } from '../sources/misc';
import { add } from './add';
import { integer } from './bignum';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { is_square_matrix } from './tensor';

/* det =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Returns the determinant of matrix m.
Uses Gaussian elimination for numerical matrices.

Example:

  det(((1,2),(3,4)))
  > -2

*/
export function det(p1: Tensor): U {
  if (!is_square_matrix(p1)) {
    return makeList(symbol(DET), p1);
  }

  const a = p1.tensor.elem;
  const isNumeric = a.every((element) => isNumericAtom(element));
  if (isNumeric) {
    return yydetg(p1);
  } else {
    return determinant(a, p1.tensor.dim[0]);
  }
}

// determinant of n * n matrix elements on the stack
export function determinant(elements: readonly U[], n: number): U {
  let q = 0;
  const a: number[] = [];
  //int *a, *c, *d

  //a = (int *) malloc(3 * n * sizeof (int))

  //if (a == NULL)
  //  out_of_memory()

  for (let i = 0; i < n; i++) {
    a[i] = i;
    a[i + n] = 0;
    a[i + n + n] = 1;
  }

  let sign_: Sign = 1;

  let outerTemp: U = Constants.zero;
  while (true) {
    let temp: U = integer(sign_);
    for (let i = 0; i < n; i++) {
      const k = n * a[i] + i;
      temp = multiply(temp, elements[k]); // FIXME -- problem here
    }

    outerTemp = add(outerTemp, temp);

    // next permutation (Knuth's algorithm P)
    let j = n - 1;
    let s = 0;

    let breakFromOutherWhile = false;
    while (true) {
      q = a[n + j] + a[n + n + j];
      if (q < 0) {
        a[n + n + j] = -a[n + n + j];
        j--;
        continue;
      }
      if (q === j + 1) {
        if (j === 0) {
          breakFromOutherWhile = true;
          break;
        }
        s++;
        a[n + n + j] = -a[n + n + j];
        j--;
        continue;
      }
      break;
    }

    if (breakFromOutherWhile) {
      break;
    }

    const t = a[j - a[n + j] + s];
    a[j - a[n + j] + s] = a[j - q + s];
    a[j - q + s] = t;
    a[n + j] = q;

    sign_ = sign_ === 1 ? -1 : 1;
  }

  return outerTemp;
}

//-----------------------------------------------------------------------------
//
//  Input:    Matrix on stack
//
//  Output:    Determinant on stack
//
//  Note:
//
//  Uses Gaussian elimination which is faster for numerical matrices.
//
//  Gaussian Elimination works by walking down the diagonal and clearing
//  out the columns below it.
//
//-----------------------------------------------------------------------------
function detg() {
  const p1 = pop() as Tensor;
  if (!is_square_matrix(p1)) {
    push(makeList(symbol(DET), p1));
    return;
  }

  push(yydetg(p1));
}

function yydetg(p1: Tensor): U {
  const n = p1.tensor.dim[0];
  const elements = [...p1.tensor.elem];
  const decomp = lu_decomp(elements, n);
  return decomp;
}

function getM(arr: U[], n: number, i: number, j: number): U {
  return arr[n * i + j];
}

function setM(arr: U[], n: number, i: number, j: number, value: U) {
  arr[n * i + j] = value;
}

//-----------------------------------------------------------------------------
//
//  Input:    n * n matrix elements
//
//  Output:    upper diagonal matrix
//
//-----------------------------------------------------------------------------
function lu_decomp(elements: U[], n: number): U {
  let p1: U = Constants.one;

  for (let d = 0; d < n - 1; d++) {
    if (equal(getM(elements, n, d, d), Constants.zero)) {
      let i = 0;
      for (i = d + 1; i < n; i++) {
        if (!equal(getM(elements, n, i, d), Constants.zero)) {
          break;
        }
      }

      if (i === n) {
        p1 = Constants.zero;
        break;
      }

      // exchange rows
      for (let j = d; j < n; j++) {
        let p2 = getM(elements, n, d, j);
        setM(elements, n, d, j, getM(elements, n, i, j));
        setM(elements, n, i, j, p2);
      }

      // negate det
      p1 = negate(p1);
    }

    // update det
    p1 = multiply(p1, getM(elements, n, d, d));

    // update lower diagonal matrix
    for (let i = d + 1; i < n; i++) {
      const p2 = negate(
        divide(getM(elements, n, i, d), getM(elements, n, d, d))
      );

      // update one row
      setM(elements, n, i, d, Constants.zero); // clear column below pivot d

      for (let j = d + 1; j < n; j++) {
        const added = add(
          multiply(getM(elements, n, d, j), p2),
          getM(elements, n, i, j)
        );
        setM(elements, n, i, j, added);
      }
    }
  }

  // last diagonal element
  return multiply(p1, getM(elements, n, n - 1, n - 1));
}
