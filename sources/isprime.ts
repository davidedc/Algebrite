import { cadr, Constants, U } from '../runtime/defs';
import { push } from '../runtime/stack';
import { Eval } from './eval';
import { isnonnegativeinteger } from './is';
import { mprime } from './mprime';

export function Eval_isprime(p1: U) {
  const result = isprime(Eval(cadr(p1)));
  push(result);
}

function isprime(p1: U): U {
  if (isnonnegativeinteger(p1) && mprime(p1.q.a)) {
    return Constants.one;
  }
  return Constants.zero;
}
