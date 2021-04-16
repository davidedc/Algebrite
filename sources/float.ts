import { countOccurrencesOfSymbol } from '../runtime/count';
import {
  ADD,
  cadr,
  Constants,
  DEBUG,
  E,
  evalFloats,
  iscons,
  isrational,
  istensor,
  MULTIPLY,
  PI,
  POWER,
  symbol,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { bignum_float, double } from './bignum';
import { Eval } from './eval';
import { makeList } from './list';
import { copy_tensor } from './tensor';

export function Eval_float(p1: U) {
  evalFloats(() => {
    push(cadr(p1));
    Eval();
    push(yyfloat(pop()));
    Eval(); // normalize
  });
}

function checkFloatHasWorkedOutCompletely(nodeToCheck) {
  const numberOfPowers = countOccurrencesOfSymbol(symbol(POWER), nodeToCheck);
  const numberOfPIs = countOccurrencesOfSymbol(symbol(PI), nodeToCheck);
  const numberOfEs = countOccurrencesOfSymbol(symbol(E), nodeToCheck);
  const numberOfMults = countOccurrencesOfSymbol(symbol(MULTIPLY), nodeToCheck);
  const numberOfSums = countOccurrencesOfSymbol(symbol(ADD), nodeToCheck);
  if (DEBUG) {
    console.log(`     ... numberOfPowers: ${numberOfPowers}`);
    console.log(`     ... numberOfPIs: ${numberOfPIs}`);
    console.log(`     ... numberOfEs: ${numberOfEs}`);
    console.log(`     ... numberOfMults: ${numberOfMults}`);
    console.log(`     ... numberOfSums: ${numberOfSums}`);
  }
  if (
    numberOfPowers > 1 ||
    numberOfPIs > 0 ||
    numberOfEs > 0 ||
    numberOfMults > 1 ||
    numberOfSums > 1
  ) {
    return stop('float: some unevalued parts in ' + nodeToCheck);
  }
}

export function zzfloat(p1: U): U {
  push(p1);
  evalFloats(() => {
    //p1 = pop()
    //push(cadr(p1))
    //push(p1)
    Eval();
    push(yyfloat(pop()));
    Eval(); // normalize
  });
  return pop();
}
// zzfloat doesn't necessarily result in a double
// , for example if there are variables. But
// in many of the tests there should be indeed
// a float, this line comes handy to highlight
// when that doesn't happen for those tests.
//checkFloatHasWorkedOutCompletely(stack[tos-1])

export function yyfloat(p1: U): U {
  return evalFloats(yyfloat_, p1);
}

function yyfloat_(p1: U): U {
  if (iscons(p1)) {
    return makeList(...p1.map(yyfloat_));
  }
  if (istensor(p1)) {
    p1 = copy_tensor(p1);
    p1.tensor.elem = p1.tensor.elem.map(yyfloat_);
    return p1;
  }
  if (isrational(p1)) {
    return bignum_float(p1);
  }
  if (p1 === symbol(PI)) {
    return Constants.piAsDouble;
  }
  if (p1 === symbol(E)) {
    return double(Math.E);
  }
  return p1;
}
