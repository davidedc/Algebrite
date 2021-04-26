import { gcd } from './gcd';
import { car, cdr, defs, iscons, U } from '../runtime/defs';
import { push } from '../runtime/stack';
import { Eval } from './eval';
import { divide, inverse } from './multiply';

// Find the least common multiple of two expressions.
export function Eval_lcm(p1: U) {
  p1 = cdr(p1);
  let temp = Eval(car(p1));
  if (iscons(p1)) {
    temp = p1.tail().reduce((a: U, b: U) => {
      return lcm(a, Eval(b));
    }, temp);
  }
  push(temp);
}

export function lcm(p1: U, p2: U): U {
  const prev_expanding = defs.expanding;
  defs.expanding = true;
  const result = yylcm(p1, p2);
  defs.expanding = prev_expanding;
  return result;
}

function yylcm(p1: U, p2: U): U {
  return inverse(divide(divide(gcd(p1, p2), p1), p2));
}
