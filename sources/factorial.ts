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
import {symbol} from "../runtime/symbol";

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
function simplifyfactorials(p1: U): U {
  return noexpand(simplifyfactorials_, p1);
}

function simplifyfactorials_(p1: U): U {
  if (isadd(p1)) {
    return p1.tail().map(simplifyfactorials).reduce(add, Constants.zero);
  }

  if (ismultiply(p1)) {
    return sfac_product(p1);
  }

  return p1;
}

function sfac_product(p1: U) {
  let terms:U[]=[];
  if (iscons(p1)) {
    terms = p1.tail();
  }

  for (let i = 0; i < terms.length; i++) {
    if (terms[i] === symbol(NIL)) {
      continue;
    }
    for (let j = i + 1; j < terms.length; j++) {
      if (terms[j] === symbol(NIL)) {
        continue;
      }
      sfac_product_f(terms, i, j);
    }
  }

  let result:U = Constants.one;

  for (let i = 0; i < terms.length; i++) {
    if (terms[i] === symbol(NIL)) {
      continue;
    }
    result = multiply(result, terms[i]);
  }

  return result;
}

function sfac_product_f(s: U[], a: number, b: number) {
  let p3: U, p4: U;

  let p1 = s[a];
  let p2 = s[b];

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
    s[a] = temp3;
    s[b] = symbol(NIL);
  }
}
