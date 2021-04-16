import { equal } from '../sources/misc';
import { car, cdr, iscons, istensor, Sym, U } from './defs';
export function count(p: U) {
  let n: number;
  if (iscons(p)) {
    n = 0;
    while (iscons(p)) {
      n += count(car(p)) + 1;
      p = cdr(p);
    }
  } else {
    n = 1;
  }
  return n;
}

// this probably works out to be
// more general than just counting symbols, it can
// probably count instances of anything you pass as
// first argument but didn't try it.
export function countOccurrencesOfSymbol(needle: Sym, p: U) {
  let n = 0;
  if (iscons(p)) {
    while (iscons(p)) {
      n += countOccurrencesOfSymbol(needle, car(p));
      p = cdr(p);
    }
  } else {
    if (equal(needle, p)) {
      n = 1;
    }
  }
  return n;
}

// returns the total number of elements
// in an expression
export function countsize(p: U) {
  let n = 0;

  if (istensor(p)) {
    for (let i = 0; i < p.tensor.nelem; i++) {
      n += count(p.tensor.elem[i]);
    }
  } else if (iscons(p)) {
    while (iscons(p)) {
      n += count(car(p)) + 1;
      p = cdr(p);
    }
  } else {
    n = 1;
  }

  return n;
}
