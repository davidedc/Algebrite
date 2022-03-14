import {
  ADD,
  car,
  cdr,
  Cons,
  Constants,
  DEBUG,
  Double,
  isadd,
  ismultiply,
  isNumericAtom,
  istensor,
  MULTIPLY,
  NIL,
  Num,
  Sign,
  U
} from '../runtime/defs';
import { check_esc_flag } from '../runtime/run';
import { symbol } from "../runtime/symbol";
import { add_numbers } from './bignum';
import { Eval } from './eval';
import { isZeroAtom, isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { cmp_expr, equal } from './misc';
import { multiply, negate } from './multiply';
import { print_list } from './print';
import { tensor_plus_tensor } from './tensor';

/*
 Symbolic addition

  Terms in a sum are combined if they are identical modulo rational
  coefficients.

  For example, A + 2A becomes 3A.

  However, the sum A + sqrt(2) A is not modified.

  Combining terms can lead to second-order effects.

  For example, consider the case of

    1/sqrt(2) A + 3/sqrt(2) A + sqrt(2) A

  The first two terms are combined to yield 2 sqrt(2) A.

  This result can now be combined with the third term to yield

    3 sqrt(2) A
*/

let flag = 0;

export function Eval_add(p1: Cons) {
  const terms: U[] = [];
  p1 = cdr(p1) as Cons;
  for (const t of p1) {
    const p2 = Eval(t);
    push_terms(terms, p2);
  }
  return add_terms(terms);
}

// Add terms, returns one expression.
function add_terms(terms: U[]): U {
  // ensure no infinite loop, use "for"
  if (DEBUG) {
    for (const term of terms) {
      console.log(print_list(term));
    }
  }

  for (let i = 0; i < 10; i++) {
    if (terms.length < 2) {
      break;
    }

    flag = 0;
    terms.sort(cmp_terms);

    if (flag === 0) {
      break;
    }

    combine_terms(terms);
  }

  switch (terms.length) {
    case 0:
      return Constants.Zero();
    case 1:
      return terms[0];
    default:
      terms.unshift(symbol(ADD));
      return makeList(...terms);
  }
}

let cmp_terms_count = 0;

// Compare terms for order.
function cmp_terms(p1: U, p2: U): Sign {
  cmp_terms_count++;
  //if cmp_terms_count == 52
  //  breakpoint

  // numbers can be combined

  if (isNumericAtom(p1) && isNumericAtom(p2)) {
    flag = 1;
    //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 0"
    return 0;
  }

  // congruent tensors can be combined

  if (istensor(p1) && istensor(p2)) {
    if (p1.tensor.ndim < p2.tensor.ndim) {
      //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns -1"
      return -1;
    }
    if (p1.tensor.ndim > p2.tensor.ndim) {
      //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 1"
      return 1;
    }
    for (let i = 0; i < p1.tensor.ndim; i++) {
      if (p1.tensor.dim[i] < p2.tensor.dim[i]) {
        //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns -1"
        return -1;
      }
      if (p1.tensor.dim[i] > p2.tensor.dim[i]) {
        //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 1"
        return 1;
      }
    }
    flag = 1;
    //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 0"
    return 0;
  }

  if (ismultiply(p1)) {
    p1 = cdr(p1);
    if (isNumericAtom(car(p1))) {
      p1 = cdr(p1);
      if (cdr(p1) === symbol(NIL)) {
        p1 = car(p1);
      }
    }
  }

  if (ismultiply(p2)) {
    p2 = cdr(p2);
    if (isNumericAtom(car(p2))) {
      p2 = cdr(p2);
      if (cdr(p2) === symbol(NIL)) {
        p2 = car(p2);
      }
    }
  }

  const t = cmp_expr(p1, p2);

  if (t === 0) {
    flag = 1;
  }

  //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns " + t
  return t;
}

/*
 Compare adjacent terms in terms[] and combine if possible.
*/
function combine_terms(terms: U[]) {
  // I had to turn the coffeescript for loop into
  // a more mundane while loop because the i
  // variable was changed from within the body,
  // which is something that is not supposed to
  // happen in the coffeescript 'vector' form.
  // Also this means I had to add a 'i++' jus before
  // the end of the body and before the "continue"s
  let i = 0;
  while (i < terms.length - 1) {
    check_esc_flag();
    let p1: U, p2: U;
    let p3 = terms[i];
    let p4 = terms[i + 1];

    if (istensor(p3) && istensor(p4)) {
      p1 = tensor_plus_tensor(p3, p4);
      if (p1 !== symbol(NIL)) {
        terms.splice(i, 2, p1);
        i--;
      }

      i++;
      continue;
    }

    if (istensor(p3) || istensor(p4)) {
      i++;
      continue;
    }

    if (isNumericAtom(p3) && isNumericAtom(p4)) {
      p1 = add_numbers(p3, p4);
      if (isZeroAtomOrTensor(p1)) {
        terms.splice(i, 2);
      } else {
        terms.splice(i, 2, p1);
      }
      i--;

      i++;
      continue;
    }

    if (isNumericAtom(p3) || isNumericAtom(p4)) {
      i++;
      continue;
    }

    p1 = Constants.One();
    p2 = Constants.One();

    let t = 0;

    if (ismultiply(p3)) {
      p3 = cdr(p3);
      t = 1; // p3 is now denormal
      if (isNumericAtom(car(p3))) {
        p1 = car(p3);
        p3 = cdr(p3);
        if (cdr(p3) === symbol(NIL)) {
          p3 = car(p3);
          t = 0;
        }
      }
    }

    if (ismultiply(p4)) {
      p4 = cdr(p4);
      if (isNumericAtom(car(p4))) {
        p2 = car(p4);
        p4 = cdr(p4);
        if (cdr(p4) === symbol(NIL)) {
          p4 = car(p4);
        }
      }
    }

    if (!equal(p3, p4)) {
      i++;
      continue;
    }

    p1 = add_numbers(p1 as Num | Double, p2 as Num | Double);

    if (isZeroAtomOrTensor(p1)) {
      terms.splice(i, 2);
      i--;

      i++;
      continue;
    }

    const arg2 = t ? new Cons(symbol(MULTIPLY), p3) : p3;

    terms.splice(i, 2, multiply(p1, arg2));
    i--;

    // this i++ is to match the while
    i++;
  }
}

function push_terms(array: U[], p: U) {
  if (isadd(p)) {
    array.push(...p.tail());
  } else if (!isZeroAtom(p)) {
    // omit zeroes
    array.push(p);
  }
}

// add two expressions
export function add(p1: U, p2: U): U {
  const terms: U[] = [];
  push_terms(terms, p1);
  push_terms(terms, p2);
  return add_terms(terms);
}

export function add_all(terms: U[]): U {
  const flattened: U[] = [];
  for (const t of terms) {
    push_terms(flattened, t);
  }
  return add_terms(flattened);
}

export function subtract(p1: U, p2: U): U {
  return add(p1, negate(p2));
}
