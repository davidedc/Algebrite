import { car, cdr, Constants, NIL, symbol, TAYLOR, U } from '../runtime/defs';
import { pop, push, top } from '../runtime/stack';
import { add, subtract } from './add';
import { integer, nativeInt } from './bignum';
import { derivative } from './derivative';
import { Eval } from './eval';
import { factorial } from './factorial';
import { guess } from './guess';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { divide, multiply } from './multiply';
import { subst } from './subst';

/*
Taylor expansion of a function

  push(F)
  push(X)
  push(N)
  push(A)
  taylor()
*/
export function Eval_taylor(p1: U) {
  // 1st arg
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  const F = pop();

  // 2nd arg
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  let p2 = pop();
  const X = p2 === symbol(NIL) ? guess(top()) : p2;

  // 3rd arg
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  p2 = pop();
  const N = p2 === symbol(NIL) ? integer(24) : p2; // 24: default number of terms

  // 4th arg
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  p2 = pop();
  const A = p2 === symbol(NIL) ? Constants.zero : p2; // 0: default expansion point

  push(taylor(F, X, N, A));
}

function taylor(F: U, X: U, N: U, A: U): U {
  const k = nativeInt(N);
  if (isNaN(k)) {
    return makeList(symbol(TAYLOR), F, X, N, A);
  }

  push(subst(F, X, A)); // F: f(a)
  Eval();

  let p5: U = Constants.one;
  let temp = pop();
  for (let i = 1; i <= k; i++) {
    F = derivative(F, X); // F: f = f'

    if (isZeroAtomOrTensor(F)) {
      break;
    }

    // c = c * (x - a)
    p5 = multiply(p5, subtract(X, A));

    push(subst(F, X, A)); // F: f(a)
    Eval();

    const arg1a = pop();
    temp = add(temp, divide(multiply(arg1a, p5), factorial(integer(i))));
  }
  return temp;
}
