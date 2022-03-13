import {
  caar,
  caddr,
  cadr,
  car,
  cdar,
  cdddr,
  cddr,
  cdr,
  Cons,
  Constants,
  defs,
  dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication,
  Double,
  isadd,
  iscons,
  isdouble,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational,
  istensor,
  MULTIPLY,
  NIL,
  noexpand,
  Num,
  OPERATOR,
  POWER,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { symbol } from '../runtime/symbol';
import { cmp_expr } from '../sources/misc';
import { add, subtract } from './add';
import {
  divide_numbers,
  invert_number,
  mp_denominator,
  mp_numerator,
  multiply_numbers,
  negate_number,
} from './bignum';
import { Eval } from './eval';
import {
  equaln,
  isfraction,
  isinteger,
  isminusone,
  isnegativenumber,
  isplusone,
  isZeroAtom,
} from './is';
import { list, makeList } from './list';
import { power } from './power';
import { scalar_times_tensor, tensor_times_scalar } from './tensor';
import { append } from '../runtime/otherCFunctions';

// Symbolic multiplication

// multiplication is commutative, so it can't be used
// e.g. on two matrices.
// But it can be used, say, on a scalar and a matrix.,
// so the output of a multiplication is not
// always a scalar.

//extern void append(void)
//static void parse_p1(void)
//static void parse_p2(void)
//static void __normalize_radical_factors(int)
export function Eval_multiply(p1: U) {
  let temp = Eval(cadr(p1));
  p1 = cddr(p1);
  if (iscons(p1)) {
    temp = [...p1].reduce((acc: U, p: U) => multiply(acc, Eval(p)), temp);
  }
  push(temp);
}

// this one doesn't eval the factors,
// so you pass i*(-1)^(1/2), it wouldnt't
// give -1, because i is not evalled
export function multiply(arg1: U, arg2: U): U {
  if (defs.esc_flag) {
    stop('escape key stop');
  }
  if (isNumericAtom(arg1) && isNumericAtom(arg2)) {
    return multiply_numbers(arg1, arg2);
  }
  return yymultiply(arg1, arg2);
}

function yymultiply(p1: U, p2: U): U {
  // is either operand zero?
  if (isZeroAtom(p1) || isZeroAtom(p2)) {
    return Constants.Zero();
  }

  // is either operand a sum?
  //console.log("yymultiply: expanding: " + expanding)
  if (defs.expanding && isadd(p1)) {
    return p1
      .tail()
      .reduce((a: U, b: U) => add(a, multiply(b, p2)), Constants.Zero());
  }

  if (defs.expanding && isadd(p2)) {
    return p2
      .tail()
      .reduce((a: U, b: U) => add(a, multiply(p1, b)), Constants.Zero());
  }

  // scalar times tensor?
  if (!istensor(p1) && istensor(p2)) {
    return scalar_times_tensor(p1, p2);
  }

  // tensor times scalar?
  if (istensor(p1) && !istensor(p2)) {
    return tensor_times_scalar(p1, p2);
  }

  // adjust operands
  p1 = ismultiply(p1) ? cdr(p1) : makeList(p1);

  p2 = ismultiply(p2) ? cdr(p2) : makeList(p2);

  const factors:U[] = [];

  // handle numerical coefficients
  if (isNumericAtom(car(p1)) && isNumericAtom(car(p2))) {
    const arg1 = car(p1) as Num | Double;
    const arg2 = car(p2) as Num | Double;
    factors.push(multiply_numbers(arg1, arg2));
    p1 = cdr(p1);
    p2 = cdr(p2);
  } else if (isNumericAtom(car(p1))) {
    factors.push(car(p1));
    p1 = cdr(p1);
  } else if (isNumericAtom(car(p2))) {
    factors.push(car(p2));
    p2 = cdr(p2);
  } else {
    factors.push(Constants.One());
  }

  let [p3, p5] = parse_p1(p1);
  let [p4, p6] = parse_p2(p2);

  while (iscons(p1) && iscons(p2)) {
    if (caar(p1) === symbol(OPERATOR) && caar(p2) === symbol(OPERATOR)) {
      factors.push(new Cons(symbol(OPERATOR), append(cdar(p1), cdar(p2))));
      p1 = cdr(p1);
      p2 = cdr(p2);
      [p3, p5] = parse_p1(p1);
      [p4, p6] = parse_p2(p2);
      continue;
    }

    switch (cmp_expr(p3, p4)) {
      case -1:
        factors.push(car(p1));
        p1 = cdr(p1);
        [p3, p5] = parse_p1(p1);
        break;
      case 1:
        factors.push(car(p2));
        p2 = cdr(p2);
        [p4, p6] = parse_p2(p2);
        break;
      case 0:
        combine_factors(factors, p4, p5, p6);
        p1 = cdr(p1);
        p2 = cdr(p2);
        [p3, p5] = parse_p1(p1);
        [p4, p6] = parse_p2(p2);
        break;
      default:
        stop('internal error 2');
    }
  }

  // push remaining factors, if any
  if (iscons(p1)) {
    factors.push(...p1);
  }
  if (iscons(p2)) {
    factors.push(...p2);
  }

  // normalize radical factors
  // example: 2*2(-1/2) -> 2^(1/2)
  // must be done after merge because merge may produce radical
  // example: 2^(1/2-a)*2^a -> 2^(1/2)
  __normalize_radical_factors(factors);

  // this hack should not be necessary, unless power returns a multiply
  //for (i = h; i < tos; i++) {
  //  if (car(stack[i]) == symbol(MULTIPLY)) {
  //    multiply_all(tos - h)
  //    return
  //  }
  //}
  if (defs.expanding) {
    for (let i = 0; i < factors.length; i++) {
      if (isadd(factors[i])) {
        return multiply_all(factors);
      }
    }
  }

  // n is the number of result factors on the stack
  const n = factors.length;
  if (n === 1) {
    return factors.pop();
  }

  // discard integer 1
  if (isrational(factors[0]) && equaln(factors[0], 1)) {
    if (n === 2) {
      const p7 = factors.pop();
      return p7;
    } else {
      factors[0] = symbol(MULTIPLY);
      return makeList(...factors);
    }
  }

  return new Cons(symbol(MULTIPLY), makeList(...factors));
}

// Decompose a factor into base and power.
//
// input:  car(p1)    factor
//
// output:  p3    factor's base
//          p5    factor's power (possibly 1)
function parse_p1(p1: U): [U, U] {
  let p3 = car(p1);
  let p5: U = Constants.One();
  if (ispower(p3)) {
    p5 = caddr(p3);
    p3 = cadr(p3);
  }
  return [p3, p5];
}

// Decompose a factor into base and power.
//
// input:  car(p2)    factor
//
// output:  p4    factor's base
//          p6    factor's power (possibly 1)
function parse_p2(p2: U): [U, U] {
  let p4 = car(p2);
  let p6: U = Constants.One();
  if (ispower(p4)) {
    p6 = caddr(p4);
    p4 = cadr(p4);
  }
  return [p4, p6];
}

// h an integer
function combine_factors(factors: U[], p4: U, p5: U, p6: U) {
  let p7 = power(p4, add(p5, p6));
  if (isNumericAtom(p7)) {
    factors[0] = multiply_numbers(factors[0] as Num | Double, p7);
  } else if (ismultiply(p7)) {
    // power can return number * factor (i.e. -1 * i)
    if (isNumericAtom(cadr(p7)) && cdddr(p7) === symbol(NIL)) {
      const arg1 = factors[0] as Num | Double;
      const arg2 = cadr(p7) as Num | Double;
      factors[0] = multiply_numbers(arg1, arg2);
      factors.push(caddr(p7));
    } else {
      factors.push(p7);
    }
  } else {
    factors.push(p7);
  }
}

const gp = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, -6, -7, -8, -3, -4, -5, 13, 14, 15, -16, 9, 10, 11, -12],
  [0, 0, 6, -1, -11, 10, -2, -15, 14, 12, -5, 4, -9, 16, -8, 7, -13],
  [0, 0, 7, 11, -1, -9, 15, -2, -13, 5, 12, -3, -10, 8, 16, -6, -14],
  [0, 0, 8, -10, 9, -1, -14, 13, -2, -4, 3, 12, -11, -7, 6, 16, -15],
  [0, 0, 3, 2, 15, -14, 1, 11, -10, 16, -8, 7, 13, 12, -5, 4, 9],
  [0, 0, 4, -15, 2, 13, -11, 1, 9, 8, 16, -6, 14, 5, 12, -3, 10],
  [0, 0, 5, 14, -13, 2, 10, -9, 1, -7, 6, 16, 15, -4, 3, 12, 11],
  [0, 0, 13, 12, -5, 4, 16, -8, 7, -1, -11, 10, -3, -2, -15, 14, -6],
  [0, 0, 14, 5, 12, -3, 8, 16, -6, 11, -1, -9, -4, 15, -2, -13, -7],
  [0, 0, 15, -4, 3, 12, -7, 6, 16, -10, 9, -1, -5, -14, 13, -2, -8],
  [0, 0, 16, -9, -10, -11, -13, -14, -15, -3, -4, -5, 1, -6, -7, -8, 2],
  [0, 0, 9, -16, 8, -7, -12, 5, -4, -2, -15, 14, 6, -1, -11, 10, 3],
  [0, 0, 10, -8, -16, 6, -5, -12, 3, 15, -2, -13, 7, 11, -1, -9, 4],
  [0, 0, 11, 7, -6, -16, 4, -3, -12, -14, 13, -2, 8, -10, 9, -1, 5],
  [0, 0, 12, 13, 14, 15, 9, 10, 11, -6, -7, -8, -2, -3, -4, -5, -1],
];

// this is useful for example when you are just adding/removing
// factors from an already factored quantity.
// e.g. if you factored x^2 + 3x + 2 into (x+1)(x+2)
// and you want to divide by (x+1) , i.e. you multiply by (x-1)^-1,
// then there is no need to expand.
export function multiply_noexpand(arg1: U, arg2: U): U {
  return noexpand(multiply, arg1, arg2);
}

// multiply n factors on stack
// n an integer
export function multiply_all(n: U[]): U {
  if (n.length === 1) {
    return n[0];
  }
  if (n.length === 0) {
    return Constants.One();
  }
  let temp = n[0];
  for (let i = 1; i < n.length; i++) {
    temp = multiply(temp, n[i]);
  }
  return temp;
}

// n an integer
export function multiply_all_noexpand(arr: U[]): U {
  return noexpand(multiply_all, arr);
}

//-----------------------------------------------------------------------------
//
//  Symbolic division, or numeric division if doubles are found.
//
//  Input:    Dividend and divisor on stack
//
//  Output:    Quotient on stack
//
//-----------------------------------------------------------------------------
export function divide(p1: U, p2: U): U {
  if (isNumericAtom(p1) && isNumericAtom(p2)) {
    return divide_numbers(p1, p2);
  } else {
    return multiply(p1, inverse(p2));
  }
}

// this is different from inverse of a matrix (inv)!
export function inverse(p1: U): U {
  if (isNumericAtom(p1)) {
    return invert_number(p1);
  } else {
    return power(p1, Constants.negOne);
  }
}

export function reciprocate(p1: U): U {
  return inverse(p1);
}

export function negate(p1: U): U {
  if (isNumericAtom(p1)) {
    return negate_number(p1);
  } else {
    return multiply(p1, Constants.NegOne());
  }
}

export function negate_noexpand(p1: U): U {
  return noexpand(negate, p1);
}

//-----------------------------------------------------------------------------
//
//  Normalize radical factors
//
//  Input:    stack[h]  Coefficient factor, possibly 1
//
//      stack[h + 1]  Second factor
//
//      stack[tos - 1]  Last factor
//
//  Output:    Reduced coefficent and normalized radicals (maybe)
//
//  Example:  2*2^(-1/2) -> 2^(1/2)
//
//  (power number number) is guaranteed to have the following properties:
//
//  1. Base is an integer
//
//  2. Absolute value of exponent < 1
//
//  These properties are assured by the power function.
//
//-----------------------------------------------------------------------------

function __normalize_radical_factors(factors:U[]) {
  let i = 0;
  // if coeff is 1 or floating then don't bother
  if (
    isplusone(factors[0]) ||
    isminusone(factors[0]) ||
    isdouble(factors[0])
  ) {
    return;
  }

  // if no radicals then don't bother
  for (i = 1; i < factors.length; i++) {
    if (__is_radical_number(factors[i])) {
      break;
    }
  }

  if (i === factors.length) {
    return;
  }

  // numerator
  let A: U = mp_numerator(factors[0]);
  //console.log("__normalize_radical_factors numerator: " + stack[tos-1])

  for (let i = 1; i < factors.length; i++) {
    if (isplusone(A) || isminusone(A)) {
      break;
    }

    if (!__is_radical_number(factors[i])) {
      continue;
    }

    const BASE = cadr(factors[i]);
    const EXPO = caddr(factors[i]);

    // exponent must be negative
    if (!isnegativenumber(EXPO)) {
      continue;
    }

    // numerator divisible by base?
    const TMP = divide(A, BASE);

    if (!isinteger(TMP)) {
      continue;
    }

    // reduce numerator
    A = TMP;

    // invert radical
    factors[i] = makeList(symbol(POWER), BASE, add(Constants.One(), EXPO));
  }

  // denominator
  let B: U = mp_denominator(factors[0]);
  //console.log("__normalize_radical_factors denominator: " + stack[tos-1])

  for (let i = 1; i < factors.length; i++) {
    if (isplusone(B)) {
      break;
    }

    if (!__is_radical_number(factors[i])) {
      continue;
    }

    const BASE = cadr(factors[i]);
    const EXPO = caddr(factors[i]);

    // exponent must be positive
    if (isnegativenumber(EXPO)) {
      continue;
    }

    // denominator divisible by BASE?
    const TMP = divide(B, BASE);

    if (!isinteger(TMP)) {
      continue;
    }
    //console.log("__new radical TMP: " + TMP.toString())
    //console.log("__new radical top stack: " + stack[tos-1])

    // reduce denominator
    B = TMP;

    //console.log("__new radical BASE: " + BASE.toString())
    //console.log("__new radical EXPO: " + EXPO.toString())
    const subtracted = subtract(EXPO, Constants.one);

    if (dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication) {
      if (
        isinteger(BASE) &&
        !isinteger(subtracted) &&
        isnegativenumber(subtracted)
      ) {
        // bail out,
        // we want to avoid going ahead with the subtraction of
        // the exponents, because that would turn a perfectly good
        // integer exponent in the denominator into a fractional one
        // i.e. a radical.
        // Note that this only prevents new radicals ending up
        // in the denominator, it doesn't fix existing ones.

        A = divide(A, BASE);
        break;
      }
    }
    //console.log("__new radical exponent: " + stack[tos-1])

    // invert radical
    factors[i] = makeList(symbol(POWER), BASE, subtracted);
  }

  // reconstitute the coefficient
  factors[0] = divide(A, B);
}

// don't include i
function __is_radical_number(p: U): boolean {
  // don't use i
  return (
    ispower(p) &&
    isNumericAtom(cadr(p)) &&
    isfraction(caddr(p)) &&
    !isminusone(cadr(p))
  );
}

//-----------------------------------------------------------------------------
//
//  > a*hilbert(2)
//  ((a,1/2*a),(1/2*a,1/3*a))
//
//  Note that "a" is presumed to be a scalar. Is this correct?
//
//  Yes, because "*" has no meaning if "a" is a tensor.
//  To multiply tensors, "dot" or "outer" should be used.
//
//  > dot(a,hilbert(2))
//  dot(a,((1,1/2),(1/2,1/3)))
//
//  In this case "a" could be a scalar or tensor so the result is not
//  expanded.
//
//-----------------------------------------------------------------------------
