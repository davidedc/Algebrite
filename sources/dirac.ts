import {
  cadr,
  Constants,
  DIRAC,
  isadd,
  isdouble,
  ispower,
  isrational,
  MZERO,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { Eval } from './eval';
import { isnegativeterm } from './is';
import { makeList } from './list';
import { mmul } from './mmul';
import { negate } from './multiply';
import {symbol} from "../runtime/symbol";

//-----------------------------------------------------------------------------
//
//  Author : philippe.billet@noos.fr
//
//  Dirac function dirac(x)
//  dirac(-x)=dirac(x)
//  dirac(b-a)=dirac(a-b)
//-----------------------------------------------------------------------------
export function Eval_dirac(p1: U) {
  const result = dirac(Eval(cadr(p1)));
  push(result);
}

export function dirac(p1: U): U {
  return ydirac(p1);
}

function ydirac(p1: U): U {
  if (isdouble(p1)) {
    if (p1.d === 0) {
      return Constants.one;
    }
    return Constants.zero;
  }

  if (isrational(p1)) {
    if (MZERO(mmul(p1.q.a, p1.q.b))) {
      return Constants.one;
    }
    return Constants.zero;
  }

  if (ispower(p1)) {
    return makeList(symbol(DIRAC), cadr(p1));
  }

  if (isnegativeterm(p1)) {
    return makeList(symbol(DIRAC), negate(p1));
  }

  if (isnegativeterm(p1) || (isadd(p1) && isnegativeterm(cadr(p1)))) {
    p1 = negate(p1);
  }

  return makeList(symbol(DIRAC), p1);
}
