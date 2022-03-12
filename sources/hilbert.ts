import { HILBERT, U } from '../runtime/defs';
import { zero_matrix } from '../sources/misc';
import { integer, nativeInt } from './bignum';
import { makeList } from './list';
import { inverse } from './multiply';
import {symbol} from "../runtime/symbol";

//-----------------------------------------------------------------------------
//
//  Create a Hilbert matrix
//
//  Input:    Dimension
//
//  Output:    Hilbert matrix
//
//  Example:
//
//  > hilbert(5)
//  ((1,1/2,1/3,1/4),(1/2,1/3,1/4,1/5),(1/3,1/4,1/5,1/6),(1/4,1/5,1/6,1/7))
//
//-----------------------------------------------------------------------------
//define AELEM(i, j) A->u.tensor->elem[i * n + j]
export function hilbert(N: U): U {
  const n = nativeInt(N);
  if (n < 2) {
    return makeList(symbol(HILBERT), N);
  }
  const A: U = zero_matrix(n, n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      A.tensor.elem[i * n + j] = inverse(integer(i + j + 1));
    }
  }
  return A;
}
