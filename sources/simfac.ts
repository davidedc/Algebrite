import {
  caadr,
  cadadr,
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  FACTORIAL,
  isadd,
  isfactorial,
  ismultiply,
  ispower,
  NIL,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { equal } from '../sources/misc';
import { add, add_all, subtract } from './add';
import { Eval } from './eval';
import { factorial } from './factorial';
import { equaln, isminusone, isplusone } from './is';
import { multiply_all_noexpand, reciprocate } from './multiply';
import {symbol} from "../runtime/symbol";

/*
 Simplify factorials

The following script

  F(n,k) = k binomial(n,k)
  (F(n,k) + F(n,k-1)) / F(n+1,k)

generates

       k! n!             n! (1 - k + n)!              k! n!
 -------------------- + -------------------- - ----------------------
 (-1 + k)! (1 + n)!     (1 + n)! (-k + n)!     k (-1 + k)! (1 + n)!

Simplify each term to get

    k       1 - k + n       1
 ------- + ----------- - -------
  1 + n       1 + n       1 + n

Then simplify the sum to get

    n
 -------
  1 + n

*/
// simplify factorials term-by-term
function Eval_simfac(p1: U) {
  const result = simfac(Eval(cadr(p1)));
  push(result);
}

//if 1
export function simfac(p1: U): U {
  if (isadd(p1)) {
    const terms = p1.tail().map(simfac_term);
    return add_all(terms);
  }
  return simfac_term(p1);
}

//else
/*
void
simfac(void)
{
  int h
  save()
  p1 = pop()
  if (car(p1) == symbol(ADD)) {
    h = tos
    p1 = cdr(p1)
    while (p1 != symbol(NIL)) {
      push(car(p1))
      simfac_term()
      p1 = cdr(p1)
    }
    addk(tos - h)
    p1 = pop()
    if (find(p1, symbol(FACTORIAL))) {
      push(p1)
      if (car(p1) == symbol(ADD)) {
        Condense()
        simfac_term()
      }
    }
  } else {
    push(p1)
    simfac_term()
  }
  restore()
}

*endif
*/
function simfac_term(p1: U): U {
  // if not a product of factors then done
  if (!ismultiply(p1)) {
    return p1;
  }

  // push all factors
  const factors = p1.tail();

  // keep trying until no more to do
  while (yysimfac(factors)) {
    // do nothing
  }

  return multiply_all_noexpand(factors);
}

// try all pairs of factors
function yysimfac(stack: U[]): boolean {
  for (let i = 0; i < stack.length; i++) {
    let p1 = stack[i];
    for (let j = 0; j < stack.length; j++) {
      if (i === j) {
        continue;
      }
      let p2 = stack[j];

      //  n! / n    ->  (n - 1)!
      if (
        isfactorial(p1) &&
        ispower(p2) &&
        isminusone(caddr(p2)) &&
        equal(cadr(p1), cadr(p2))
      ) {
        stack[i] = factorial(subtract(cadr(p1), Constants.one));
        stack[j] = Constants.one;
        return true;
      }

      //  n / n!    ->  1 / (n - 1)!
      if (
        ispower(p2) &&
        isminusone(caddr(p2)) &&
        caadr(p2) === symbol(FACTORIAL) &&
        equal(p1, cadadr(p2))
      ) {
        stack[i] = reciprocate(factorial(add(p1, Constants.negOne)));
        stack[j] = Constants.one;
        return true;
      }

      //  (n + 1) n!  ->  (n + 1)!
      if (isfactorial(p2)) {
        const p3 = subtract(p1, cadr(p2));
        if (isplusone(p3)) {
          stack[i] = factorial(p1);
          stack[j] = Constants.one;
          return true;
        }
      }

      //  1 / ((n + 1) n!)  ->  1 / (n + 1)!
      if (
        ispower(p1) &&
        isminusone(caddr(p1)) &&
        ispower(p2) &&
        isminusone(caddr(p2)) &&
        caadr(p2) === symbol(FACTORIAL)
      ) {
        const p3 = subtract(cadr(p1), cadr(cadr(p2)));
        if (isplusone(p3)) {
          stack[i] = reciprocate(factorial(cadr(p1)));
          stack[j] = Constants.one;
          return true;
        }
      }

      //  (n + 1)! / n!  ->  n + 1

      //  n! / (n + 1)!  ->  1 / (n + 1)
      if (
        isfactorial(p1) &&
        ispower(p2) &&
        isminusone(caddr(p2)) &&
        caadr(p2) === symbol(FACTORIAL)
      ) {
        const p3 = subtract(cadr(p1), cadr(cadr(p2)));
        if (isplusone(p3)) {
          stack[i] = cadr(p1);
          stack[j] = Constants.one;
          return true;
        }
        if (isminusone(p3)) {
          stack[i] = reciprocate(cadr(cadr(p2)));
          stack[j] = Constants.one;
          return true;
        }
        if (equaln(p3, 2)) {
          stack[i] = cadr(p1);
          stack[j] = add(cadr(p1), Constants.negOne);
          return true;
        }
        if (equaln(p3, -2)) {
          stack[i] = reciprocate(cadr(cadr(p2)));
          stack[j] = reciprocate(add(cadr(cadr(p2)), Constants.negOne));
          return true;
        }
      }
    }
  }
  return false;
}
