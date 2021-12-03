import { gcd } from './gcd';
import { alloc_tensor } from '../runtime/alloc';
import {
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  isadd,
  iscons,
  ismultiply,
  ispower,
  isNumericAtom,
  U,
} from '../runtime/defs';
import { cmp_expr, sign } from '../sources/misc';
import { add } from './add';
import { integer, nativeInt } from './bignum';
import { factor_small_number } from './factor';
import { isplusone } from './is';
import { inverse, multiply } from './multiply';
import { power } from './power';

//-----------------------------------------------------------------------------
//
//  Generate all divisors of a term
//
//  Input:    Term (factor * factor * ...)
//
//  Output:    Divisors
//
//-----------------------------------------------------------------------------
export function divisors(p: U): U {
  const values = ydivisors(p);
  const n = values.length;
  values.sort(cmp_expr);

  const p1: U = alloc_tensor(n);
  p1.tensor.ndim = 1;
  p1.tensor.dim[0] = n;
  p1.tensor.elem = values;
  return p1;
}

const flatten = (arr: U[][]): U[] => [].concat(...arr);

export function ydivisors(p1: U) {
  const stack: U[] = [];
  // push all of the term's factors
  if (isNumericAtom(p1)) {
    stack.push(...factor_small_number(nativeInt(p1)));
  } else if (isadd(p1)) {
    stack.push(...__factor_add(p1));
  } else if (ismultiply(p1)) {
    p1 = cdr(p1);
    if (isNumericAtom(car(p1))) {
      stack.push(...factor_small_number(nativeInt(car(p1))));
      p1 = cdr(p1);
    }
    if (iscons(p1)) {
      const mapped = [...p1].map((p2) => {
        if (ispower(p2)) {
          return [cadr(p2), caddr(p2)];
        }
        return [p2, Constants.one];
      });
      stack.push(...flatten(mapped));
    }
  } else if (ispower(p1)) {
    stack.push(cadr(p1), caddr(p1));
  } else {
    stack.push(p1, Constants.one);
  }

  const k = stack.length;

  // contruct divisors by recursive descent
  stack.push(Constants.one);
  gen(stack, 0, k);

  return stack.slice(k);
}

//-----------------------------------------------------------------------------
//
//  Generate divisors
//
//  Input:    Base-exponent pairs on stack
//
//      h  first pair
//
//      k  just past last pair
//
//  Output:    Divisors on stack
//
//  For example, factor list 2 2 3 1 results in 6 divisors,
//
//    1
//    3
//    2
//    6
//    4
//    12
//
//-----------------------------------------------------------------------------
function gen(stack: U[], h: number, k: number): void {
  const ACCUM: U = stack.pop();

  if (h === k) {
    stack.push(ACCUM);
    return;
  }

  const BASE: U = stack[h + 0];
  const EXPO: U = stack[h + 1];

  const expo = nativeInt(EXPO);
  if (!isNaN(expo)) {
    for (let i = 0; i <= Math.abs(expo); i++) {
      stack.push(multiply(ACCUM, power(BASE, integer(sign(expo) * i))));
      gen(stack, h + 2, k);
    }
  }
}

//-----------------------------------------------------------------------------
//
//  Factor ADD expression
//
//  Input:    Expression
//
//  Output:    Factors
//
//  Each factor consists of two expressions, the factor itself followed
//  by the exponent.
//
//-----------------------------------------------------------------------------
function __factor_add(p1: U): U[] {
  // get gcd of all terms
  const temp1 = iscons(p1) ? p1.tail().reduce(gcd) : car(p1);

  const stack: U[] = [];
  // check gcd
  let p2 = temp1;
  if (isplusone(p2)) {
    stack.push(p1, Constants.one);
    return stack;
  }

  // push factored gcd
  if (isNumericAtom(p2)) {
    stack.push(...factor_small_number(nativeInt(p2)));
  } else if (ismultiply(p2)) {
    let p3 = cdr(p2);
    if (isNumericAtom(car(p3))) {
      stack.push(...factor_small_number(nativeInt(car(p3))));
    } else {
      stack.push(car(p3), Constants.one);
    }
    if (iscons(p3)) {
      p3.tail().forEach((p) => stack.push(p, Constants.one));
    }
  } else {
    stack.push(p2, Constants.one);
  }

  // divide each term by gcd
  p2 = inverse(p2);
  const temp2 = iscons(p1)
    ? p1.tail().reduce((a: U, b: U) => add(a, multiply(p2, b)), Constants.zero)
    : cdr(p1);

  stack.push(temp2, Constants.one);
  return stack;
}
