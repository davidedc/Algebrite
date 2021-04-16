import { caddr, cadr, Constants, isNumericAtom, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { lessp } from '../sources/misc';
import { subtract } from './add';
import { Eval } from './eval';
import { factorial } from './factorial';
import { divide } from './multiply';

//  Binomial coefficient
//
//  Input:    tos-2    n
//
//      tos-1    k
//
//  Output:    Binomial coefficient on stack
//
//  binomial(n, k) = n! / k! / (n - k)!
//
//  The binomial coefficient vanishes for k < 0 or k > n. (A=B, p. 19)

export function Eval_binomial(p1: U) {
  push(cadr(p1));
  Eval();
  push(caddr(p1));
  Eval();
  const K = pop();
  const N = pop();
  push(binomial(N, K));
}

function binomial(N: U, K: U): U {
  return ybinomial(N, K);
}

function ybinomial(N: U, K: U): U {
  if (!BINOM_check_args(N, K)) {
    return Constants.zero;
  }

  return divide(divide(factorial(N), factorial(K)), factorial(subtract(N, K)));
}

function BINOM_check_args(N: U, K: U): boolean {
  if (isNumericAtom(N) && lessp(N, Constants.zero)) {
    return false;
  } else if (isNumericAtom(K) && lessp(K, Constants.zero)) {
    return false;
  } else if (isNumericAtom(N) && isNumericAtom(K) && lessp(N, K)) {
    return false;
  } else {
    return true;
  }
}
