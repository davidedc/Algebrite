import {
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  DEBUG,
  defs,
  isadd,
  iscons,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational,
  MULTIPLY,
  symbol,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { equal, length, lessp } from '../sources/misc';
import { subtract } from './add';
import { gcd_numbers } from './bignum';
import { Eval } from './eval';
import { factorpoly } from './factorpoly';
import { isnegativenumber, isunivarpolyfactoredorexpandedform } from './is';
import { makeList } from './list';
import { divide, multiply } from './multiply';
import { power } from './power';

// Greatest common denominator
export function Eval_gcd(p1: U) {
  p1 = cdr(p1);
  push(car(p1));
  Eval();

  if (iscons(p1)) {
    p1.tail().forEach((p) => {
      push(p);
      Eval();
      const arg2 = pop();
      const arg1 = pop();
      push(gcd(arg1, arg2));
    });
  }
}

export function gcd(p1: U, p2: U): U {
  const prev_expanding = defs.expanding;
  const result = gcd_main(p1, p2);
  defs.expanding = prev_expanding;
  return result;
}

function gcd_main(p1: U, p2: U): U {
  let polyVar: U | false;
  defs.expanding = true;

  if (equal(p1, p2)) {
    return p1;
  }

  if (isrational(p1) && isrational(p2)) {
    return gcd_numbers(p1, p2);
  }

  if (isadd(p1) && isadd(p2)) {
    return gcd_expr_expr(p1, p2);
  }

  if (isadd(p1)) {
    p1 = gcd_expr(p1);
  }

  if (isadd(p2)) {
    p2 = gcd_expr(p2);
  }

  if (ismultiply(p1) && ismultiply(p2)) {
    return gcd_term_term(p1, p2);
  }

  if (ismultiply(p1)) {
    return gcd_term_factor(p1, p2);
  }

  if (ismultiply(p2)) {
    return gcd_factor_term(p1, p2);
  }


  return gcd_powers_with_same_base(p1, p2);
}

function gcd_powers_with_same_base(base1: U, base2: U): U {
  let exponent1: U, exponent2: U, p6: U;
  if (ispower(base1)) {
    exponent1 = caddr(base1); // exponent
    base1 = cadr(base1); // base
  } else {
    exponent1 = Constants.one;
  }

  if (ispower(base2)) {
    exponent2 = caddr(base2); // exponent
    base2 = cadr(base2); // base
  } else {
    exponent2 = Constants.one;
  }

  if (!equal(base1, base2)) {
    return Constants.one;
  }

  // are both exponents numerical?
  if (isNumericAtom(exponent1) && isNumericAtom(exponent2)) {
    const exponent = lessp(exponent1, exponent2) ? exponent1 : exponent2;
    return power(base1, exponent);
  }

  // are the exponents multiples of eah other?
  let p5 = divide(exponent1, exponent2);

  if (isNumericAtom(p5)) {
    // choose the smallest exponent
    p5 = ismultiply(exponent1) && isNumericAtom(cadr(exponent1)) ? cadr(exponent1) : Constants.one;
    p6 = ismultiply(exponent2) && isNumericAtom(cadr(exponent2)) ? cadr(exponent2) : Constants.one;
    const exponent = lessp(p5, p6) ? exponent1 : exponent2;
    return power(base1, exponent);
  }

  p5 = subtract(exponent1, exponent2);

  if (!isNumericAtom(p5)) {
    return Constants.one;
  }

  // can't be equal because of test near beginning
  const exponent = isnegativenumber(p5) ? exponent1 : exponent2;
  return power(base1, exponent);
}

// in this case gcd is used as a composite function, i.e. gcd(gcd(gcd...
function gcd_expr_expr(p1: U, p2: U): U {
  let p3: U, p4: U, p5: U, p6: U;
  if (length(p1) !== length(p2)) {
    return Constants.one;
  }

  p3 = iscons(p1) ? p1.tail().reduce(gcd) : car(cdr(p1));

  p4 = iscons(p2) ? p2.tail().reduce(gcd) : car(cdr(p2));

  p5 = divide(p1, p3);
  p6 = divide(p2, p4);

  if (equal(p5, p6)) {
    return multiply(p5, gcd(p3, p4));
  }

  return Constants.one;
}

function gcd_expr(p: U): U {
  return iscons(p) ? p.tail().reduce(gcd) : car(cdr(p));
}

function gcd_term_term(p1: U, p2:U): U {
  if (!iscons(p1) || !iscons(p2)) {
    return Constants.one;
  }
  return p1.tail().reduce((a: U, b: U) => {
    return p2.tail().reduce((x: U, y: U) => multiply(x, gcd(b, y)), a);
  }, Constants.one);
}

function gcd_term_factor(p1: U, p2: U): U {
  return iscons(p1)
    ? p1.tail().reduce((a: U, b: U) => multiply(a, gcd(b, p2)), Constants.one)
    : Constants.one;
}

function gcd_factor_term(p1: U, p2: U): U {
  return iscons(p2)
    ? p2.tail().reduce((a: U, b: U) => multiply(a, gcd(p1, b)), Constants.one)
    : Constants.one;
}
