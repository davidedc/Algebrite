import { cadr, Constants, POWER, symbol, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { abs } from './abs';
import { arg } from './arg';
import { Eval } from './eval';
import { makeList } from './list';
import { divide, multiply } from './multiply';

/*
 Convert complex z to clock form

  Input:    push  z

  Output:    Result on stack

  clock(z) = abs(z) * (-1) ^ (arg(z) / pi)

  For example, clock(exp(i pi/3)) gives the result (-1)^(1/3)
*/

// P.S. I couldn't find independent definition/aknowledgment
// of the naming "clock form" anywhere on the web, seems like a
// naming specific to eigenmath.
// Clock form is another way to express a complex number, and
// it has three advantages
//   1) it's uniform with how for example
//      i is expressed i.e. (-1)^(1/2)
//   2) it's very compact
//   3) it's a straighforward notation for roots of 1 and -1

const DEBUG_CLOCKFORM = false;

export function Eval_clock(p1: U) {
  push(cadr(p1));
  Eval();
  push(clockform(pop()));
}

export function clockform(p1: U): U {
  // pushing the expression (-1)^... but note
  // that we can't use "power", as "power" evaluates
  // clock forms into rectangular form (see "-1 ^ rational"
  // section in power)
  const l = makeList(
    symbol(POWER),
    Constants.negOne,
    divide(arg(p1), Constants.Pi())
  );
  const multiplied = multiply(abs(p1), l);

  if (DEBUG_CLOCKFORM) {
    console.log(`clockform: abs of ${p1} : ${abs(p1)}`);
    console.log(`clockform: arg of ${p1} : ${arg(p1)}`);
    console.log(`clockform: divide : ${divide(arg(p1), Constants.Pi())}`);
    console.log(`clockform: power : ${l}`);
    console.log(`clockform: multiply : ${multiplied}`);
  }
  return multiplied;
}
