import {
  caddr,
  cadr,
  car,
  cdddr,
  cdr,
  Constants,
  iscons,
  ismultiply,
  MAXPRIMETAB,
  NIL,
  Num,
  primetab,
  symbol,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push, top } from '../runtime/stack';
import { integer } from './bignum';
import { Eval } from './eval';
import { factorpoly } from './factorpoly';
import { guess } from './guess';
import { isinteger } from './is';
import { multiply_all_noexpand } from './multiply';
import { factor_number } from './pollard';

// factor a polynomial or integer
export function Eval_factor(p1: U) {
  push(cadr(p1));
  Eval();

  push(caddr(p1));
  Eval();
  const p2 = pop();
  const variable = p2 === symbol(NIL) ? guess(top()) : p2;
  const arg1 = pop();
  let temp = factor(arg1, variable);

  // more factoring?
  p1 = cdddr(p1);

  while (iscons(p1)) {
    push(car(p1));
    Eval();
    const arg2 = pop();
    temp = factor_again(temp, arg2);
    p1 = cdr(p1);
  }
  push(temp);
}

function factor_again(p1: U, p2: U): U {
  if (ismultiply(p1)) {
    const arr: U[] = [];
    p1.tail().forEach((el) => factor_term(arr, el, p2));
    return multiply_all_noexpand(arr);
  }

  const arr: U[] = [];
  factor_term(arr, p1, p2);
  return arr[0];
}

function factor_term(arr: U[], arg1: U, arg2: U): void {
  const p1 = factorpoly(arg1, arg2);
  if (ismultiply(p1)) {
    arr.push(...p1.tail());
    return;
  }

  arr.push(p1);
}

export function factor(p1: U, p2: U): U {
  if (isinteger(p1)) {
    return factor_number(p1); // see pollard.cpp
  }

  return factorpoly(p1, p2);
}

// for factoring small integers (2^32 or less)
export function factor_small_number(n: number): Num[] {
  if (isNaN(n)) {
    stop('number too big to factor');
  }
  const arr: Num[] = [];
  if (n < 0) {
    n = -n;
  }

  for (let i = 0; i < MAXPRIMETAB; i++) {
    const d = primetab[i];

    if (d > n / d) {
      break;
    }

    let expo = 0;

    while (n % d === 0) {
      n /= d;
      expo++;
    }

    if (expo) {
      arr.push(integer(d));
      arr.push(integer(expo));
    }
  }

  if (n > 1) {
    arr.push(integer(n));
    arr.push(Constants.one);
  }
  return arr;
}
