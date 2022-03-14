import {
  caddr,
  cadr,
  car,
  cdr,
  Constants, defs,
  doexpand,
  isadd,
  iscons,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational, MULTIPLY, U
} from '../runtime/defs';
import { symbol } from '../runtime/symbol';
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
// can also be run on polynomials, however
// it works only on the integers and it works
// by factoring the polynomials (not Euclidean algorithm)
export function Eval_gcd(p1: U) {
  p1 = cdr(p1);
  let result = Eval(car(p1));

  if (iscons(p1)) {
    result = p1.tail().reduce((acc: U, p: U) => gcd(acc, Eval(p)), result);
  }
  return result;
}

export function gcd(p1: U, p2: U): U {
  return doexpand(gcd_main, p1, p2);
}

function gcd_main(p1: U, p2: U): U {
  let polyVar: U | false;

  if (equal(p1, p2)) {
    return p1;
  }

  if (isrational(p1) && isrational(p2)) {
    return gcd_numbers(p1, p2);
  }

  if (polyVar = areunivarpolysfactoredorexpandedform(p1, p2)) {
    return gcd_polys(p1, p2, polyVar)
  }

  if (isadd(p1) && isadd(p2)) {
    return gcd_sum_sum(p1, p2);
  }

  if (isadd(p1)) {
    p1 = gcd_sum(p1);
  }

  if (isadd(p2)) {
    p2 = gcd_sum(p2);
  }

  if (ismultiply(p1)) {
    return gcd_sum_product(p1, p2);
  }

  if (ismultiply(p2)) {
    return gcd_product_sum(p1, p2);
  }

  if (ismultiply(p1) && ismultiply(p2)) {
    return gcd_product_product(p1, p2);
  }

  return gcd_powers_with_same_base(p1, p2);
}

// TODO this should probably be in "is"?
export function areunivarpolysfactoredorexpandedform(p1:U, p2:U):U {
 let polyVar: U|false;
  if (polyVar = isunivarpolyfactoredorexpandedform(p1)){
    if (isunivarpolyfactoredorexpandedform(p2, polyVar)){
      return polyVar;
    }
  }
}

function gcd_polys (p1:U, p2:U, polyVar:U) {
  p1 = factorpoly(p1, polyVar);
  p2 = factorpoly(p2, polyVar);

  if (ismultiply(p1)  || ismultiply(p2)) {
    if (!ismultiply(p1)) {
      p1 = makeList(
          symbol(MULTIPLY),
          p1,
          Constants.one
      );
    }
    if (!ismultiply(p2)) {
      p2 = makeList(
          symbol(MULTIPLY),
          p2,
          Constants.one
      );
    }
  }
  if (ismultiply(p1) && ismultiply(p2)) {
    return gcd_product_product(p1,p2);
  }
  return gcd_powers_with_same_base(p1, p2);
}

function gcd_product_product(p1:U, p2:U) {

  let p3: U = cdr(p1)
  let p4: U = cdr(p2)
  if (iscons(p3)) {
    return [...p3].reduce(
        (acc: U, pOuter: U) => {
              if (iscons(p4)) {
                return multiply(acc, [...p4].reduce(
                    (innerAcc: U, pInner: U) =>
                        multiply(innerAcc, gcd(pOuter, pInner))
                    , Constants.one
                ));
              }
        }
        , Constants.one
    );
  }

  // another, (maybe more readable?) version:

  /*
  let totalProduct:U = Constants.one;
  let p3 = cdr(p1)
  while (iscons(p3)) {

    let p4: U = cdr(p2)

    if (iscons(p4)) {
      totalProduct = [...p4].reduce(
          ((acc: U, p: U) =>
              multiply(gcd(car(p3), p), acc))
          , totalProduct
      );
    }

    p3 = cdr(p3);
  }

  return totalProduct;
  */


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
    p5 =
      ismultiply(exponent1) && isNumericAtom(cadr(exponent1))
        ? cadr(exponent1)
        : Constants.one;
    p6 =
      ismultiply(exponent2) && isNumericAtom(cadr(exponent2))
        ? cadr(exponent2)
        : Constants.one;
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
function gcd_sum_sum(p1: U, p2: U): U {
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

function gcd_sum(p: U): U {
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

function gcd_sum_product(p1: U, p2: U): U {
  return iscons(p1)
    ? p1.tail().reduce((a: U, b: U) => multiply(a, gcd(b, p2)), Constants.one)
    : Constants.one;
}

function gcd_product_sum(p1: U, p2: U): U {
  return iscons(p2)
    ? p2.tail().reduce((a: U, b: U) => multiply(a, gcd(p1, b)), Constants.one)
    : Constants.one;
}
