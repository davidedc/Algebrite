import { alloc_tensor } from '../runtime/alloc';
import {
  car,
  cdr,
  Constants,
  defs,
  INV,
  INVG,
  iscons,
  isidentitymatrix,
  isinnerordot,
  isinv,
  isNumericAtomOrTensor,
  Sym,
  Tensor,
  symbol,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { equal } from '../sources/misc';
import { subtract } from './add';
import { adj } from './adj';
import { det } from './det';
import { inner } from './inner';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { divide, multiply } from './multiply';
import { is_square_matrix } from './tensor';

//-----------------------------------------------------------------------------
//
//  Input:    Matrix (must have two dimensions but it can be non-numerical)
//
//  Output:    Inverse
//
//  Example:
//
//  > inv(((1,2),(3,4))
//  ((-2,1),(3/2,-1/2))
//
//  > inv(((a,b),(c,d))
//  ((d / (a d - b c),-b / (a d - b c)),(-c / (a d - b c),a / (a d - b c)))
//
//  Note:
//
//  THIS IS DIFFERENT FROM INVERSE OF AN EXPRESSION (inv)
//   Uses Gaussian elimination for numerical matrices.
//
//-----------------------------------------------------------------------------
export function inv(p1: U): Tensor | Sym {
  // an inv just goes away when applied to another inv
  if (isinv(p1)) {
    return car(cdr(p1)) as Tensor;
  }

  // inverse goes away in case of identity matrix
  if (isidentitymatrix(p1)) {
    return p1;
  }

  // distribute the inverse of a dot if in expanding mode
  // note that the distribution happens in reverse.
  // The dot operator is not commutative, so, it matters.
  if (defs.expanding && isinnerordot(p1)) {
    const accumulator = iscons(p1) ? p1.tail() : [];

    const inverses: U[] = accumulator.map(inv);
    for (let i = inverses.length - 1; i > 0; i--) {
      inverses[i - 1] = inner(inverses[i], inverses[i - 1]);
    }

    return inverses[0] as Tensor;
  }

  if (!is_square_matrix(p1)) {
    return makeList(symbol(INV), p1) as Tensor;
  }

  if (isNumericAtomOrTensor(p1)) {
    return yyinvg(p1);
  }

  const p2 = det(p1);
  if (isZeroAtomOrTensor(p2)) {
    stop('inverse of singular matrix');
  }
  return divide(adj(p1), p2) as Tensor;
}

export function invg(p1: U): Tensor {
  if (!is_square_matrix(p1)) {
    return makeList(symbol(INVG), p1) as Tensor;
  }

  return yyinvg(p1);
}

// inverse using gaussian elimination
function yyinvg(p1: Tensor): Tensor {
  const n = p1.tensor.dim[0];

  // create an identity matrix
  const units: U[] = new Array(n * n);
  units.fill(Constants.zero);
  for (let i = 0; i < n; i++) {
    units[i * n + i] = Constants.one;
  }

  const inverse = INV_decomp(units, p1.tensor.elem, n);

  const result = alloc_tensor(n * n);

  result.tensor.ndim = 2;
  result.tensor.dim[0] = n;
  result.tensor.dim[1] = n;

  result.tensor.elem = inverse;

  return result;
}

//-----------------------------------------------------------------------------
//
//  Input:    n * n unit matrix
//            n * n operand
//
//  Output:    n * n inverse matrix
//
//-----------------------------------------------------------------------------
function INV_decomp(units: U[], elements: U[], n: number): U[] {
  for (let d = 0; d < n; d++) {
    if (equal(elements[n * d + d], Constants.zero)) {
      let i = 0;
      for (i = d + 1; i < n; i++) {
        if (!equal(elements[n * i + d], Constants.zero)) {
          break;
        }
      }

      if (i === n) {
        stop('inverse of singular matrix');
      }

      // exchange rows
      for (let j = 0; j < n; j++) {
        let p2 = elements[n * d + j];
        elements[n * d + j] = elements[n * i + j];
        elements[n * i + j] = p2;

        p2 = units[n * d + j];
        units[n * d + j] = units[n * i + j];
        units[n * i + j] = p2;
      }
    }

    // multiply the pivot row by 1 / pivot
    const p2 = elements[n * d + d];

    for (let j = 0; j < n; j++) {
      if (j > d) {
        elements[n * d + j] = divide(elements[n * d + j], p2);
      }

      units[n * d + j] = divide(units[n * d + j], p2);
    }

    for (let i = 0; i < n; i++) {
      if (i === d) {
        continue;
      }

      // multiplier
      const p2 = elements[n * i + d];

      for (let j = 0; j < n; j++) {
        if (j > d) {
          elements[n * i + j] = subtract(
            elements[n * i + j],
            multiply(elements[n * d + j], p2)
          );
        }
        units[n * i + j] = subtract(
          units[n * i + j],
          multiply(units[n * d + j], p2)
        );
      }
    }
  }
  return units;
}
