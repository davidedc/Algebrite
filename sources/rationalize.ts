import { gcd } from './gcd';
import {
  caddr,
  cadr,
  Constants,
  defs,
  isadd,
  iscons,
  ismultiply,
  ispower,
  istensor,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { add } from './add';
import { Condense } from './condense';
import { Eval } from './eval';
import { isnegativenumber } from './is';
import { divide, inverse, multiply } from './multiply';
import { check_tensor_dimensions } from './tensor';

export function Eval_rationalize(p1: U) {
  push(cadr(p1));
  Eval();
  push(rationalize(pop()));
}

export function rationalize(p: U): U {
  const prev_expanding = defs.expanding;
  const result = yyrationalize(p);
  defs.expanding = prev_expanding;
  return result;
}

function yyrationalize(arg: U): U {
  if (istensor(arg)) {
    return __rationalize_tensor(arg);
  }

  defs.expanding = false;

  if (!isadd(arg)) {
    return arg;
  }

  // get common denominator
  push(Constants.one);
  const commonDenominator = multiply_denominators(arg);

  // multiply each term by common denominator
  let temp: U = Constants.zero;
  if (iscons(arg)) {
    temp = arg
      .tail()
      .reduce(
        (a: U, eachTerm: U) => add(a, multiply(commonDenominator, eachTerm)),
        temp
      );
  }
  // collect common factors
  // divide by common denominator
  return divide(Condense(temp), commonDenominator);
}

function multiply_denominators(p: U): U {
  if (isadd(p)) {
    p.tail().forEach((el) => {
      push(multiply_denominators_term(el));
    });
    return pop();
  }
  return multiply_denominators_term(p);
}

function multiply_denominators_term(p: U): U {
  if (ismultiply(p)) {
    p.tail().forEach((el) => {
      push(multiply_denominators_factor(el));
    });
    return pop();
  }

  return multiply_denominators_factor(p);
}

function multiply_denominators_factor(p: U): U {
  const arg1 = pop();
  if (!ispower(p)) {
    return arg1;
  }

  const arg2 = p;

  p = caddr(p);

  // like x^(-2) ?
  if (isnegativenumber(p)) {
    return __lcm(arg1, inverse(arg2));
  }

  // like x^(-a) ?
  if (ismultiply(p) && isnegativenumber(cadr(p))) {
    return __lcm(arg1, inverse(arg2));
  }

  // no match
  return arg1;
}

function __rationalize_tensor(p1: U): U {
  push(p1);
  Eval(); // makes a copy
  p1 = pop();

  if (!istensor(p1)) {
    // might be zero
    return p1;
  }

  p1.tensor.elem = p1.tensor.elem.map(rationalize);
  check_tensor_dimensions(p1);
  return p1;
}

function __lcm(p1: U, p2: U): U {
  return divide(multiply(p1, p2), gcd(p1, p2));
}
