import { alloc_tensor } from '../runtime/alloc';
import {
  cadddr,
  caddr,
  cadr,
  car,
  cddr,
  cdr,
  Constants,
  defs,
  isadd,
  iscons,
  isidentitymatrix,
  isinnerordot,
  ismultiply,
  isNumericAtom,
  istensor,
  istranspose,
  MAXDIM,
  NIL,
  SYMBOL_IDENTITY_MATRIX,
  TRANSPOSE,
  U
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { symbol } from "../runtime/symbol";
import { equal } from '../sources/misc';
import { add } from './add';
import { integer, nativeInt } from './bignum';
import { Eval } from './eval';
import { inner } from './inner';
import { isplusone, isplustwo, isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { multiply } from './multiply';

// Transpose tensor indices
export function Eval_transpose(p1: U) {
  const arg1 = Eval(cadr(p1));
  let arg2: U = Constants.one;
  let arg3: U = integer(2);
  if (cddr(p1) !== symbol(NIL)) {
    arg2 = Eval(caddr(p1));
    arg3 = Eval(cadddr(p1));
  }

  return transpose(arg1, arg2, arg3);
}

// by default p3 is 2 and p2 is 1
// p3: index to be transposed
// p2: other index to be transposed
// p1: what needs to be transposed
export function transpose(p1: U, p2: U, p3: U): U {
  let t = 0;
  const ai: number[] = Array(MAXDIM).fill(0);
  const an: number[] = Array(MAXDIM).fill(0);

  // a transposition just goes away when applied to a scalar
  if (isNumericAtom(p1)) {
    return p1;
  }

  // transposition goes away for identity matrix
  if ((isplusone(p2) && isplustwo(p3)) || (isplusone(p3) && isplustwo(p2))) {
    if (isidentitymatrix(p1)) {
      return p1;
    }
  }

  // a transposition just goes away when applied to another transposition with
  // the same columns to be switched
  if (istranspose(p1)) {
    const innerTranspSwitch1 = car(cdr(cdr(p1)));
    const innerTranspSwitch2 = car(cdr(cdr(cdr(p1))));

    if (
      (equal(innerTranspSwitch1, p3) && equal(innerTranspSwitch2, p2)) ||
      (equal(innerTranspSwitch2, p3) && equal(innerTranspSwitch1, p2)) ||
      (equal(innerTranspSwitch1, symbol(NIL)) &&
        equal(innerTranspSwitch2, symbol(NIL)) &&
        ((isplusone(p3) && isplustwo(p2)) || (isplusone(p2) && isplustwo(p3))))
    ) {
      return car(cdr(p1));
    }
  }

  // if operand is a sum then distribute (if we are in expanding mode)
  if (defs.expanding && isadd(p1)) {
    // add the dimensions to switch but only if they are not the default ones.
    return p1
      .tail()
      .reduce((a: U, b: U) => add(a, transpose(b, p2, p3)), Constants.zero);
  }

  // if operand is a multiplication then distribute (if we are in expanding mode)
  if (defs.expanding && ismultiply(p1)) {
    // add the dimensions to switch but only if they are not the default ones.
    return p1
      .tail()
      .reduce((a: U, b: U) => multiply(a, transpose(b, p2, p3)), Constants.one);
  }

  // distribute the transpose of a dot if in expanding mode
  // note that the distribution happens in reverse as per tranpose rules.
  // The dot operator is not commutative, so, it matters.
  if (defs.expanding && isinnerordot(p1)) {
    const accumulator: U[][] = [];
    if (iscons(p1)) {
      accumulator.push(...p1.tail().map((p) => [p, p2, p3]));
    }

    accumulator.reverse();
    return accumulator.reduce(
      (acc: U, p: U[]): U => inner(acc, transpose(p[0], p[1], p[2])),
      symbol(SYMBOL_IDENTITY_MATRIX)
    );
  }

  if (!istensor(p1)) {
    if (!isZeroAtomOrTensor(p1)) {
      //stop("transpose: tensor expected, 1st arg is not a tensor")
      // remove the default "dimensions to be switched"
      // parameters
      if (
        (!isplusone(p2) || !isplustwo(p3)) &&
        (!isplusone(p3) || !isplustwo(p2))
      ) {
        return makeList(symbol(TRANSPOSE), p1, p2, p3);
      }
      return makeList(symbol(TRANSPOSE), p1);
    }
    return Constants.zero;
  }

  const { ndim, nelem } = p1.tensor;

  // is it a vector?
  // so here it's something curious - note how vectors are
  // not really special two-dimensional matrices, but rather
  // 1-dimension objects (like tensors can be). So since
  // they have one dimension, transposition has no effect.
  // (as opposed as if they were special two-dimensional
  // matrices)
  // see also Ran Pan, Tensor Transpose and Its Properties. CoRR abs/1411.1503 (2014)
  if (ndim === 1) {
    return p1;
  }

  let l = nativeInt(p2);
  let m = nativeInt(p3);

  if (l < 1 || l > ndim || m < 1 || m > ndim) {
    stop('transpose: index out of range');
  }

  l--;
  m--;

  p2 = alloc_tensor(nelem);

  p2.tensor.ndim = ndim;
  p2.tensor.dim = [...p1.tensor.dim];

  p2.tensor.dim[l] = p1.tensor.dim[m];
  p2.tensor.dim[m] = p1.tensor.dim[l];

  const a = p1.tensor.elem;
  const b = p2.tensor.elem;

  // init tensor index
  for (let i = 0; i < ndim; i++) {
    ai[i] = 0;
    an[i] = p1.tensor.dim[i];
  }

  // copy components from a to b
  for (let i = 0; i < nelem; i++) {
    t = ai[l];
    ai[l] = ai[m];
    ai[m] = t;
    t = an[l];
    an[l] = an[m];
    an[m] = t;

    // convert tensor index to linear index k
    let k = 0;
    for (let j = 0; j < ndim; j++) {
      k = k * an[j] + ai[j];
    }

    // swap indices back
    t = ai[l];
    ai[l] = ai[m];
    ai[m] = t;
    t = an[l];
    an[l] = an[m];
    an[m] = t;

    // copy one element
    b[k] = a[i];

    // increment tensor index
    // Suppose the tensor dimensions are 2 and 3.
    // Then the tensor index ai increments as follows:
    // 00 -> 01
    // 01 -> 02
    // 02 -> 10
    // 10 -> 11
    // 11 -> 12
    // 12 -> 00

    for (let j = ndim - 1; j >= 0; j--) {
      if (++ai[j] < an[j]) {
        break;
      }
      ai[j] = 0;
    }
  }

  return p2;
}
