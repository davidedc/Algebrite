import { alloc_tensor } from '../runtime/alloc';
import {
  caddr,
  cadr,
  Constants,
  defs,
  isadd,
  ismultiply,
  ispower,
  istensor,
  NIL,
  symbol,
  Tensor,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { pop, push, top } from '../runtime/stack';
import { equal } from '../sources/misc';
import { add, subtract } from './add';
import { integer, nativeInt } from './bignum';
import { degree } from './degree';
import { denominator } from './denominator';
import { Eval } from './eval';
import { factorpoly } from './factorpoly';
import { factors } from './factors';
import { filter } from './filter';
import { guess } from './guess';
import { inner } from './inner';
import { inv } from './inv';
import { isone, ispolyexpandedform, isZeroAtomOrTensor } from './is';
import { divide, multiply, multiply_all, reciprocate } from './multiply';
import { numerator } from './numerator';
import { power } from './power';
import { divpoly } from './quotient';
import { copy_tensor } from './tensor';

// Partial fraction expansion
//
// Example
//
//      expand(1/(x^3+x^2),x)
//
//        1      1       1
//      ---- - --- + -------
//        2     x     x + 1
//       x
export function Eval_expand(p1: U) {
  // 1st arg
  push(cadr(p1));
  Eval();

  // 2nd arg
  push(caddr(p1));
  Eval();

  const p2 = pop();
  const X = p2 === symbol(NIL) ? guess(top()) : p2;
  const F = pop();
  push(expand(F, X));
}

//define A p2
//define B p3
//define C p4
//define F p5
//define P p6
//define Q p7
//define T p8
//define X p9

function expand(F: U, X: U): U {
  if (istensor(F)) {
    return expand_tensor(F, X);
  }

  // if sum of terms then sum over the expansion of each term
  if (isadd(F)) {
    return F.tail().reduce(
      (a: U, b: U) => add(a, expand(b, X)),
      Constants.zero
    );
  }

  // B = numerator
  let B = numerator(F);

  // A = denominator
  let A = denominator(F);

  [A, B] = remove_negative_exponents(A, B, X);

  // if the denominator is one then always bail out
  // also bail out if the denominator is not one but
  // it's not anything recognizable as a polynomial.
  if (isone(B) || isone(A)) {
    if (!ispolyexpandedform(A, X) || isone(A)) {
      return F;
    }
  }

  // Q = quotient
  const Q = divpoly(B, A, X);

  // remainder B = B - A * Q
  B = subtract(B, multiply(A, Q));

  // if the remainder is zero then we're done
  if (isZeroAtomOrTensor(B)) {
    return Q;
  }

  // A = factor(A)
  //console.log("expand - to be factored: " + p2)
  A = factorpoly(A, X);
  //console.log("expand - factored to: " + p2)

  let C = expand_get_C(A, X);
  B = expand_get_B(B, C, X);
  A = expand_get_A(A, C, X);

  let result: U;
  if (istensor(C)) {
    const prev_expanding = defs.expanding;
    defs.expanding = true;
    const inverse = inv(C);
    defs.expanding = prev_expanding;
    result = inner(inner(inverse, B), A);
  } else {
    const prev_expanding = defs.expanding;
    defs.expanding = true;
    const arg1 = divide(B, C);
    defs.expanding = prev_expanding;
    result = multiply(arg1, A);
  }
  return add(result, Q);
}

function expand_tensor(p5: Tensor, p9: U): U {
  p5 = copy_tensor(p5);
  p5.tensor.elem = p5.tensor.elem.map((el) => {
    return expand(el, p9);
  });
  return p5;
}

function remove_negative_exponents(p2: U, p3: U, p9: U): [U, U] {
  const arr = [...factors(p2), ...factors(p3)];
  // find the smallest exponent
  let j = 0;
  for (let i = 0; i < arr.length; i++) {
    const p1 = arr[i];
    if (!ispower(p1)) {
      continue;
    }
    if (cadr(p1) !== p9) {
      continue;
    }
    const k = nativeInt(caddr(p1));
    if (isNaN(k)) {
      continue;
    }
    if (k < j) {
      j = k;
    }
  }

  if (j === 0) {
    return [p2, p3];
  }

  // A = A / X^j
  p2 = multiply(p2, power(p9, integer(-j)));

  // B = B / X^j
  p3 = multiply(p3, power(p9, integer(-j)));

  return [p2, p3];
}

// Returns the expansion coefficient matrix C.
//
// Example:
//
//       B         1
//      --- = -----------
//       A      2
//             x (x + 1)
//
// We have
//
//       B     Y1     Y2      Y3
//      --- = ---- + ---- + -------
//       A      2     x      x + 1
//             x
//
// Our task is to solve for the unknowns Y1, Y2, and Y3.
//
// Multiplying both sides by A yields
//
//           AY1     AY2      AY3
//      B = ----- + ----- + -------
//            2      x       x + 1
//           x
//
// Let
//
//            A               A                 A
//      W1 = ----       W2 = ---        W3 = -------
//             2              x               x + 1
//            x
//
// Then the coefficient matrix C is
//
//              coeff(W1,x,0)   coeff(W2,x,0)   coeff(W3,x,0)
//
//       C =    coeff(W1,x,1)   coeff(W2,x,1)   coeff(W3,x,1)
//
//              coeff(W1,x,2)   coeff(W2,x,2)   coeff(W3,x,2)
//
// It follows that
//
//       coeff(B,x,0)     Y1
//
//       coeff(B,x,1) = C Y2
//
//       coeff(B,x,2) =   Y3
//
// Hence
//
//       Y1       coeff(B,x,0)
//             -1
//       Y2 = C   coeff(B,x,1)
//
//       Y3       coeff(B,x,2)
function expand_get_C(p2: U, p9: U): U {
  const stack: U[] = [];
  if (ismultiply(p2)) {
    p2.tail().forEach((p5) => stack.push(...expand_get_CF(p2, p5, p9)));
  } else {
    stack.push(...expand_get_CF(p2, p2, p9));
  }
  const n = stack.length;
  if (n === 1) {
    return stack[0];
  }
  const p4 = alloc_tensor(n * n);
  p4.tensor.ndim = 2;
  p4.tensor.dim[0] = n;
  p4.tensor.dim[1] = n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const arg2 = power(p9, integer(i));
      const prev_expanding = defs.expanding;
      defs.expanding = true;
      const divided = divide(stack[j], arg2);
      defs.expanding = prev_expanding;
      p4.tensor.elem[n * i + j] = filter(divided, p9);
    }
  }
  return p4;
}

// The following table shows the push order for simple roots, repeated roots,
// and inrreducible factors.
//
//  Factor F        Push 1st        Push 2nd         Push 3rd      Push 4th
//
//
//                   A
//  x               ---
//                   x
//
//
//   2               A               A
//  x               ----            ---
//                    2              x
//                   x
//
//
//                     A
//  x + 1           -------
//                   x + 1
//
//
//         2            A              A
//  (x + 1)         ----------      -------
//                          2        x + 1
//                   (x + 1)
//
//
//   2                   A               Ax
//  x  + x + 1      ------------    ------------
//                    2               2
//                   x  + x + 1      x  + x + 1
//
//
//    2         2          A              Ax              A             Ax
//  (x  + x + 1)    --------------- ---------------  ------------  ------------
//                     2         2     2         2     2             2
//                   (x  + x + 1)    (x  + x + 1)     x  + x + 1    x  + x + 1
//
//
// For T = A/F and F = P^N we have
//
//
//      Factor F          Push 1st    Push 2nd    Push 3rd    Push 4th
//
//      x                 T
//
//       2
//      x                 T           TP
//
//
//      x + 1             T
//
//             2
//      (x + 1)           T           TP
//
//       2
//      x  + x + 1        T           TX
//
//        2         2
//      (x  + x + 1)      T           TX          TP          TPX
//
//
// Hence we want to push in the order
//
//      T * (P ^ i) * (X ^ j)
//
// for all i, j such that
//
//      i = 0, 1, ..., N - 1
//
//      j = 0, 1, ..., deg(P) - 1
//
// where index j runs first.
function expand_get_CF(p2: U, p5: U, p9: U): U[] {
  let p6: U;
  let n = 0;

  if (!Find(p5, p9)) {
    return [];
  }
  let prev_expanding = defs.expanding;
  defs.expanding = true;
  const p8 = trivial_divide(p2, p5);
  defs.expanding = prev_expanding;
  if (ispower(p5)) {
    n = nativeInt(caddr(p5));
    p6 = cadr(p5);
  } else {
    n = 1;
    p6 = p5;
  }
  const stack: U[] = [];
  const d = nativeInt(degree(p6, p9));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      let arg2 = power(p6, integer(i));
      prev_expanding = defs.expanding;
      defs.expanding = true;
      let arg1 = multiply(p8, arg2);
      defs.expanding = prev_expanding;
      arg2 = power(p9, integer(j));
      prev_expanding = defs.expanding;
      defs.expanding = true;
      stack.push(multiply(arg1, arg2));
      defs.expanding = prev_expanding;
    }
  }

  return stack;
}

// Returns T = A/F where F is a factor of A.
function trivial_divide(p2: U, p5: U): U {
  let result: U = Constants.one;
  if (ismultiply(p2)) {
    const arr: U[] = [];
    p2.tail().forEach((p0) => {
      if (!equal(p0, p5)) {
        push(p0);
        Eval(); // force expansion of (x+1)^2, f.e.
        arr.push(pop());
      }
    });
    result = multiply_all(arr);
  }
  return result;
}

// Returns the expansion coefficient vector B.
function expand_get_B(p3: U, p4: U, p9: U): U {
  if (!istensor(p4)) {
    return p3;
  }
  const n = p4.tensor.dim[0];
  const p8 = alloc_tensor(n);
  p8.tensor.ndim = 1;
  p8.tensor.dim[0] = n;
  for (let i = 0; i < n; i++) {
    const arg2 = power(p9, integer(i));
    const prev_expanding = defs.expanding;
    defs.expanding = true;
    const divided = divide(p3, arg2);
    defs.expanding = prev_expanding;
    p8.tensor.elem[i] = filter(divided, p9);
  }
  return p8;
}

// Returns the expansion fractions in A.
function expand_get_A(p2: U, p4: U, p9: U): U {
  if (!istensor(p4)) {
    return reciprocate(p2);
  }
  let elements: U[] = [];
  if (ismultiply(p2)) {
    p2.tail().forEach((p5) => {
      elements.push(...expand_get_AF(p5, p9));
    });
  } else {
    elements = expand_get_AF(p2, p9);
  }
  const n = elements.length;
  const p8 = alloc_tensor(n);
  p8.tensor.ndim = 1;
  p8.tensor.dim[0] = n;
  p8.tensor.elem = elements;
  return p8;
}

function expand_get_AF(p5: U, p9: U): U[] {
  let n = 1;
  if (!Find(p5, p9)) {
    return [];
  }
  if (ispower(p5)) {
    n = nativeInt(caddr(p5));
    p5 = cadr(p5);
  }
  const results: U[] = [];
  const d = nativeInt(degree(p5, p9));
  for (let i = n; i > 0; i--) {
    for (let j = 0; j < d; j++) {
      results.push(
        multiply(reciprocate(power(p5, integer(i))), power(p9, integer(j)))
      );
    }
  }
  return results;
}
