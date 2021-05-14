import { equal } from '../sources/misc';
import { car, cdr, iscons, istensor, Sym, U } from './defs';

const sum = (arr: number[]): number =>
  arr.reduce((a: number, b: number) => a + b, 0);

export function count(p: U) {
  let n: number;
  if (iscons(p)) {
    const items = [...p];
    n = sum(items.map(count)) + items.length;
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
    n = sum([...p].map((el) => countOccurrencesOfSymbol(needle, el)));
  } else if (equal(needle, p)) {
    n = 1;
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
    const items = [...p];
    n = sum(items.map(count)) + items.length;
  } else {
    n = 1;
  }

  return n;
}
