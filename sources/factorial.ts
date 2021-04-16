import {
  caddr,
  cadr,
  Constants,
  defs,
  FACTORIAL,
  isadd,
  iscons,
  isfactorial,
  ismultiply,
  ispower,
  NIL,
  symbol,
  U,
  noexpand,
} from '../runtime/defs';
import { moveTos, pop, push } from '../runtime/stack';
import { yyexpand } from '../sources/misc';
import { add, subtract } from './add';
import { integer, bignum_factorial, nativeInt } from './bignum';
import { makeList } from './list';
import { multiply } from './multiply';
import { power } from './power';

export function factorial(p1: U): U {
  const n = nativeInt(p1);
  if (n < 0 || isNaN(n)) {
    return makeList(symbol(FACTORIAL), p1);
  }
  return bignum_factorial(n);
}

// simplification rules for factorials (m < n)
//
//  (e + 1) * factorial(e)  ->  factorial(e + 1)
//
//  factorial(e) / e  ->  factorial(e - 1)
//
//  e / factorial(e)  ->  1 / factorial(e - 1)
//
//  factorial(e + n)
//  ----------------  ->  (e + m + 1)(e + m + 2)...(e + n)
//  factorial(e + m)
//
//  factorial(e + m)                               1
//  ----------------  ->  --------------------------------
//  factorial(e + n)    (e + m + 1)(e + m + 2)...(e + n)

// this function is not actually used, but
// all these simplifications
// do happen automatically via simplify
function simplifyfactorials() {
  noexpand(simplifyfactorials_);
}

function simplifyfactorials_() {
  let p1 = pop();

  if (isadd(p1)) {
    const temp = p1
      .tail()
      .map((el) => {
        push(el);
        simplifyfactorials();
        return pop();
      })
      .reduce(add, Constants.zero);
    push(temp);
    return;
  }

  if (ismultiply(p1)) {
    sfac_product(p1);
    return;
  }

  push(p1);
}

function sfac_product(p1: U) {
  const s = defs.tos;

  let n = 0;
  if (iscons(p1)) {
    p1.tail().forEach((p) => {
      push(p);
      n++;
    });
  }

  for (let i = 0; i < n - 1; i++) {
    if (defs.stack[s + i] === symbol(NIL)) {
      continue;
    }
    for (let j = i + 1; j < n; j++) {
      if (defs.stack[s + j] === symbol(NIL)) {
        continue;
      }
      sfac_product_f(s, i, j);
    }
  }

  push(Constants.one);

  for (let i = 0; i < n; i++) {
    if (defs.stack[s + i] === symbol(NIL)) {
      continue;
    }
    const arg1 = pop();
    push(multiply(arg1, defs.stack[s + i]));
  }

  p1 = pop();

  moveTos(defs.tos - n);

  push(p1);
}

function sfac_product_f(s: number, a: number, b: number) {
  let p3: U, p4: U;

  let p1 = defs.stack[s + a];
  let p2 = defs.stack[s + b];

  if (ispower(p1)) {
    p3 = caddr(p1);
    p1 = cadr(p1);
  } else {
    p3 = Constants.one;
  }

  if (ispower(p2)) {
    p4 = caddr(p2);
    p2 = cadr(p2);
  } else {
    p4 = Constants.one;
  }

  if (isfactorial(p1) && isfactorial(p2)) {
    let n = nativeInt(yyexpand(add(p3, p4)));
    if (n !== 0) {
      return;
    }

    // Find the difference between the two factorial args.
    // For example, the difference between (a + 2)! and a! is 2.
    n = nativeInt(yyexpand(subtract(cadr(p1), cadr(p2)))); // to simplify
    if (n === 0 || isNaN(n)) {
      return;
    }
    if (n < 0) {
      n = -n;
      const temp1 = p1;
      p1 = p2;
      p2 = temp1;

      const temp2 = p3;
      p3 = p4;
      p4 = temp2;
    }

    let temp3: U = Constants.one;
    for (let i = 1; i <= n; i++) {
      temp3 = multiply(temp3, power(add(cadr(p2), integer(i)), p3));
    }
    defs.stack[s + a] = temp3;
    defs.stack[s + b] = symbol(NIL);
  }
}
