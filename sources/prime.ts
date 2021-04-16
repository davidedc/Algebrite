import { cadr, MAXPRIMETAB, primetab, U } from '../runtime/defs';
import { stop } from '../runtime/run';
import { push, pop } from '../runtime/stack';
import { integer, nativeInt } from './bignum';
import { Eval } from './eval';

//-----------------------------------------------------------------------------
//
//  Look up the nth prime
//
//  Input:    n (0 < n < 10001)
//
//  Output:    nth prime
//
//-----------------------------------------------------------------------------
export function Eval_prime(p1: U) {
  push(cadr(p1));
  Eval();
  push(prime(pop()));
}

function prime(p1: U) {
  let n = nativeInt(p1);
  if (n < 1 || n > MAXPRIMETAB) {
    stop('prime: Argument out of range.');
  }
  n = primetab[n - 1];
  return integer(n);
}
