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
  U
} from '../runtime/defs';
import { push } from '../runtime/stack';
import { add } from './add';
import { Condense } from './condense';
import { Eval } from './eval';
import { gcd } from './gcd';
import { isnegativenumber } from './is';
import { divide, inverse, multiply } from './multiply';
import { check_tensor_dimensions } from './tensor';

export function Eval_rationalize(p1: U) {
  return rationalize(Eval(cadr(p1)));
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
  const commonDenominator = multiply_denominators(arg);

  // multiply each term by common denominator
  let temp: U = Constants.zero;
  if (iscons(arg)) {
    temp = arg
      .tail()
      .reduce(
        (acc: U, term: U) => add(acc, multiply(commonDenominator, term)),
        temp
      );
  }
  // collect common factors
  // divide by common denominator
  return divide(Condense(temp), commonDenominator);
}

function multiply_denominators(p: U): U {
  if (isadd(p)) {
    return p
      .tail()
      .reduce(
        (acc: U, el: U) => multiply_denominators_term(el, acc),
        Constants.one
      );
  }
  return multiply_denominators_term(p, Constants.one);
}

function multiply_denominators_term(p: U, p2: U): U {
  if (ismultiply(p)) {
    return p
      .tail()
      .reduce((acc, el) => multiply_denominators_factor(el, acc), p2);
  }

  return multiply_denominators_factor(p, p2);
}

function multiply_denominators_factor(p: U, p2: U): U {
  if (!ispower(p)) {
    return p2;
  }

  const arg2 = p;

  p = caddr(p);

  // like x^(-2) ?
  if (isnegativenumber(p)) {
    return __lcm(p2, inverse(arg2));
  }

  // like x^(-a) ?
  if (ismultiply(p) && isnegativenumber(cadr(p))) {
    return __lcm(p2, inverse(arg2));
  }

  // no match
  return p2;
}

function __rationalize_tensor(p1: U): U {
  p1 = Eval(p1);  // makes a copy

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
