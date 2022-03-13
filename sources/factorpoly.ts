import { lcm } from './lcm';
import { Constants, DEBUG, defs, issymbol, noexpand, U } from '../runtime/defs';
import { Find } from '../runtime/find';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { equal } from '../sources/misc';
import { add, subtract } from './add';
import { integer, rational } from './bignum';
import { coeff } from './coeff';
import { yycondense } from './condense';
import { conjugate } from './conj';
import { denominator } from './denominator';
import { ydivisors } from './divisors';
import {
  isfloating,
  isnegativeterm,
  ispolyexpandedform,
  isZeroAtomOrTensor,
} from './is';
import {
  divide,
  multiply,
  multiply_noexpand,
  negate,
  negate_noexpand,
  reciprocate,
} from './multiply';
import { power } from './power';
import { print_list } from './print';
import { divpoly } from './quotient';
import { rect } from './rect';

// Factor a polynomial

//define POLY p1
//define X p2
//define Z p3
//define A p4
//define B p5
//define Q p6
//define RESULT p7
//define FACTOR p8

export function factorpoly(POLY: U, X: U): U {
  if (!Find(POLY, X)) {
    return POLY;
  }

  if (!ispolyexpandedform(POLY, X)) {
    return POLY;
  }

  if (!issymbol(X)) {
    return POLY;
  }

  return yyfactorpoly(POLY, X);
}

//-----------------------------------------------------------------------------
//
//  Input:    p1    true polynomial
//            p2    free variable
//
//  Output:    factored polynomial
//
//-----------------------------------------------------------------------------
function yyfactorpoly(p1: U, p2: U): U {
  let p4: U, p5: U, p8: U;
  let prev_expanding: boolean;

  if (isfloating(p1)) {
    stop('floating point numbers in polynomial');
  }

  const polycoeff = coeff(p1, p2);

  let factpoly_expo = polycoeff.length - 1;

  let p7 = rationalize_coefficients(polycoeff);

  // for univariate polynomials we could do factpoly_expo > 1
  let whichRootsAreWeFinding = 'real';
  let remainingPoly: U = null;
  while (factpoly_expo > 0) {
    var foundComplexRoot: boolean, foundRealRoot: boolean;
    if (isZeroAtomOrTensor(polycoeff[0])) {
      p4 = Constants.one;
      p5 = Constants.zero;
    } else {
      //console.log("trying to find a " + whichRootsAreWeFinding + " root")
      if (whichRootsAreWeFinding === 'real') {
        [foundRealRoot, p4, p5] = get_factor_from_real_root(
          polycoeff,
          factpoly_expo,
          p2,
          p4,
          p5
        );
      } else if (whichRootsAreWeFinding === 'complex') {
        [foundComplexRoot, p4] = get_factor_from_complex_root(
          remainingPoly,
          polycoeff,
          factpoly_expo
        );
      }
    }

    if (whichRootsAreWeFinding === 'real') {
      if (foundRealRoot === false) {
        whichRootsAreWeFinding = 'complex';
        continue;
      } else {
        p8 = add(multiply(p4, p2), p5); // A, x, B

        if (DEBUG) {
          console.log(`success\nFACTOR=${p8}`);
        }

        // factor out negative sign (not req'd because p4 > 1)
        //if 0
        /*
        if (isnegativeterm(p4))
          push(p8)
          negate()
          p8 = pop()
          push(p7)
          negate_noexpand()
          p7 = pop()
        */
        //endif

        // p7 is the part of the polynomial that was factored so far,
        // add the newly found factor to it. Note that we are not actually
        // multiplying the polynomials fully, we are just leaving them
        // expressed as (P1)*(P2), we are not expanding the product.
        p7 = multiply_noexpand(p7, p8);

        // ok now on stack we have the coefficients of the
        // remaining part of the polynomial still to factor.
        // Divide it by the newly-found factor so that
        // the stack then contains the coefficients of the
        // polynomial part still left to factor.
        yydivpoly(p4, p5, polycoeff, factpoly_expo);

        while (factpoly_expo && isZeroAtomOrTensor(polycoeff[factpoly_expo])) {
          factpoly_expo--;
        }

        let temp: U = Constants.zero;
        for (let i = 0; i <= factpoly_expo; i++) {
          // p2: the free variable
          temp = add(temp, multiply(polycoeff[i], power(p2, integer(i))));
        }
        remainingPoly = temp;
      }
      //console.log("real branch remainingPoly: " + remainingPoly)
    } else if (whichRootsAreWeFinding === 'complex') {
      if (foundComplexRoot === false) {
        break;
      } else {
        const firstFactor = subtract(p4, p2); // A, x
        //console.log("first factor: " + firstFactor)

        const secondFactor = subtract(conjugate(p4), p2); // p4: A, p2: x
        //console.log("second factor: " + secondFactor)

        p8 = multiply(firstFactor, secondFactor);

        //if (factpoly_expo > 0 && isnegativeterm(polycoeff[factpoly_expo]))
        //  negate()
        //  negate_noexpand()

        if (DEBUG) {
          console.log(`success\nFACTOR=${p8}`);
        }

        // factor out negative sign (not req'd because p4 > 1)
        //if 0
        /*
        if (isnegativeterm(p4))
          push(p8)
          negate()
          p8 = pop()
          push(p7)
          negate_noexpand()
          p7 = pop()
        */
        //endif

        // p7 is the part of the polynomial that was factored so far,
        // add the newly found factor to it. Note that we are not actually
        // multiplying the polynomials fully, we are just leaving them
        // expressed as (P1)*(P2), we are not expanding the product.

        const previousFactorisation = p7;

        //console.log("previousFactorisation: " + previousFactorisation)

        p7 = multiply_noexpand(p7, p8);

        //console.log("new prospective factorisation: " + p7)

        // build the polynomial of the unfactored part
        //console.log("build the polynomial of the unfactored part factpoly_expo: " + factpoly_expo)

        if (remainingPoly == null) {
          let temp: U = Constants.zero;
          for (let i = 0; i <= factpoly_expo; i++) {
            // p2: the free variable
            temp = add(temp, multiply(polycoeff[i], power(p2, integer(i))));
          }
          remainingPoly = temp;
        }
        //console.log("original polynomial (dividend): " + remainingPoly)

        //push(dividend)
        //degree()
        //startingDegree = pop()

        //console.log("dividing " + stack[tos-1].toString() + " by " + p8)
        const X = p2;
        const divisor = p8;
        const dividend = remainingPoly;
        remainingPoly = divpoly(dividend, divisor, X);

        const checkingTheDivision = multiply(remainingPoly, p8);

        if (!equal(checkingTheDivision, dividend)) {
          //push(dividend)
          //gcd_sum()
          //console.log("gcd top of stack: " + stack[tos-1].toString())

          if (DEBUG) {
            console.log(
              "we found a polynomial based on complex root and its conj but it doesn't divide the poly, quitting"
            );
            console.log(
              `so just returning previousFactorisation times dividend: ${previousFactorisation} * ${dividend}`
            );
          }
          push(previousFactorisation);

          const arg2 = noexpand(yycondense, dividend);

          const arg1 = pop();
          return multiply_noexpand(arg1, arg2);
        }

        //console.log("result: (still to be factored) " + remainingPoly)

        //push(remainingPoly)
        //degree()
        //remainingDegree = pop()

        /*
        if compare_numbers(startingDegree, remainingDegree)
          * ok even if we found a complex root that
          * together with the conjugate generates a poly in Z,
          * that doesn't mean that the division would end up in Z.
          * Example: 1+x^2+x^4+x^6 has +i and -i as one of its roots
          * so a factor is 1+x^2 ( = (x+i)*(x-i))
          * BUT 
        */
        for (let i = 0; i <= factpoly_expo; i++) {
          polycoeff.pop();
        }

        polycoeff.push(...coeff(remainingPoly, p2));

        factpoly_expo -= 2;
      }
    }
  }
  //console.log("factpoly_expo: " + factpoly_expo)

  // build the remaining unfactored part of the polynomial

  let temp: U = Constants.zero;
  for (let i = 0; i <= factpoly_expo; i++) {
    // p2: the free variable
    temp = add(temp, multiply(polycoeff[i], power(p2, integer(i))));
  }
  p1 = temp;

  if (DEBUG) {
    console.log(`POLY=${p1}`);
  }

  p1 = noexpand(yycondense, p1);

  //console.log("new poly with extracted common factor: " + p1)
  //breakpoint

  // factor out negative sign

  if (factpoly_expo > 0 && isnegativeterm(polycoeff[factpoly_expo])) {
    //prev_expanding = expanding
    //expanding = 1
    //expanding = prev_expanding
    p1 = negate(p1);
    p7 = negate_noexpand(p7);
  }

  p7 = multiply_noexpand(p7, p1);

  if (DEBUG) {
    console.log(`RESULT=${p7}`);
  }

  return p7;
}

function rationalize_coefficients(coefficients: U[]): U {
  // LCM of all polynomial coefficients
  let p7: U = Constants.one;
  for (const coeff of coefficients) {
    p7 = lcm(denominator(coeff), p7);
  }

  // multiply each coefficient by RESULT
  for (let i = 0; i < coefficients.length; i++) {
    coefficients[i] = multiply(p7, coefficients[i]);
  }

  // reciprocate RESULT
  p7 = reciprocate(p7);
  if (DEBUG) {
    console.log('rationalize_coefficients result');
  }
  return p7;
}
//console.log print_list(p7)

function get_factor_from_real_root(
  polycoeff: U[],
  factpoly_expo: number,
  p2: U,
  p4: U,
  p5: U
): [boolean, U, U] {
  let p1: U, p3: U, p6: U;

  if (DEBUG) {
    let temp: U = Constants.zero;
    for (let i = 0; i <= factpoly_expo; i++) {
      temp = add(temp, multiply(polycoeff[i], power(p2, integer(i))));
    }
    p1 = temp;
    console.log(`POLY=${p1}`);
  }

  const an = ydivisors(polycoeff[factpoly_expo]);

  const a0 = ydivisors(polycoeff[0]);

  if (DEBUG) {
    console.log('divisors of base term');
    for (let i = 0; i < a0.length; i++) {
      console.log(`, ${a0[i]}`);
    }
    console.log('divisors of leading term');
    for (let i = 0; i < an.length; i++) {
      console.log(`, ${an[i]}`);
    }
  }

  // try roots
  for (let rootsTries_i = 0; rootsTries_i < an.length; rootsTries_i++) {
    for (let rootsTries_j = 0; rootsTries_j < a0.length; rootsTries_j++) {
      //if DEBUG then console.log "nan: " + nan + " na0: " + na0 + " i: " + rootsTries_i + " j: " + rootsTries_j
      p4 = an[rootsTries_i];
      p5 = a0[rootsTries_j];

      p3 = negate(divide(p5, p4));

      p6 = Evalpoly(p3, polycoeff, factpoly_expo);

      if (DEBUG) {
        console.log(
          `try A=${p4}\n, B=${p5}\n, root ${p2}\n=-B/A=${p3}\n, POLY(${p3}\n)=${p6}`
        );
      }

      if (isZeroAtomOrTensor(p6)) {
        if (DEBUG) {
          console.log('get_factor_from_real_root returning true');
        }
        return [true, p4, p5];
      }

      p5 = negate(p5);

      p3 = negate(p3);

      p6 = Evalpoly(p3, polycoeff, factpoly_expo);

      if (DEBUG) {
        console.log(
          `try A=${p4}\n, B=${p5}\n, root ${p2}\n=-B/A=${p3}\n, POLY(${p3}\n)=${p6}`
        );
      }

      if (isZeroAtomOrTensor(p6)) {
        if (DEBUG) {
          console.log('get_factor_from_real_root returning true');
        }
        return [true, p4, p5];
      }
    }
  }

  if (DEBUG) {
    console.log('get_factor_from_real_root returning false');
  }
  return [false, p4, p5];
}

function get_factor_from_complex_root(
  remainingPoly: U,
  polycoeff: U[],
  factpoly_expo: number
): [boolean, U] {
  let p1: U, p4: U, p3: U, p6: U;

  if (factpoly_expo <= 2) {
    if (DEBUG) {
      console.log(
        'no more factoring via complex roots to be found in polynomial of degree <= 2'
      );
    }
    return [false, p4];
  }

  p1 = remainingPoly;
  if (DEBUG) {
    console.log(`complex root finding for POLY=${p1}`);
  }

  // trying -1^(2/3) which generates a polynomial in Z
  // generates x^2 + 2x + 1
  p4 = rect(power(Constants.negOne, rational(2, 3)));
  if (DEBUG) {
    console.log(`complex root finding: trying with ${p4}`);
  }
  p3 = p4;
  p6 = Evalpoly(p3, polycoeff, factpoly_expo);
  if (DEBUG) {
    console.log(`complex root finding result: ${p6}`);
  }
  if (isZeroAtomOrTensor(p6)) {
    if (DEBUG) {
      console.log('get_factor_from_complex_root returning true');
    }
    return [true, p4];
  }

  // trying 1^(2/3) which generates a polynomial in Z
  // http://www.wolframalpha.com/input/?i=(1)%5E(2%2F3)
  // generates x^2 - 2x + 1
  p4 = rect(power(Constants.one, rational(2, 3)));
  if (DEBUG) {
    console.log(`complex root finding: trying with ${p4}`);
  }
  p3 = p4;
  p6 = Evalpoly(p3, polycoeff, factpoly_expo);
  if (DEBUG) {
    console.log(`complex root finding result: ${p6}`);
  }
  if (isZeroAtomOrTensor(p6)) {
    if (DEBUG) {
      console.log('get_factor_from_complex_root returning true');
    }
    return [true, p4];
  }

  // trying some simple complex numbers. All of these
  // generate polynomials in Z
  for (let rootsTries_i = -10; rootsTries_i <= 10; rootsTries_i++) {
    for (let rootsTries_j = 1; rootsTries_j <= 5; rootsTries_j++) {
      p4 = rect(
        add(
          integer(rootsTries_i),
          multiply(integer(rootsTries_j), Constants.imaginaryunit)
        )
      );
      //console.log("complex root finding: trying simple complex combination: " + p4)

      const p3 = p4;

      const p6 = Evalpoly(p3, polycoeff, factpoly_expo);

      //console.log("complex root finding result: " + p6)
      if (isZeroAtomOrTensor(p6)) {
        if (DEBUG) {
          console.log(`found complex root: ${p6}`);
        }
        return [true, p4];
      }
    }
  }

  if (DEBUG) {
    console.log('get_factor_from_complex_root returning false');
  }
  return [false, p4];
}

//-----------------------------------------------------------------------------
//
//  Divide a polynomial by Ax+B
//
//  Input:  on stack:  polycoeff  Dividend coefficients
//
//      factpoly_expo    Degree of dividend
//
//      A (p4)    As above
//
//      B (p5)    As above
//
//  Output:   on stack: polycoeff  Contains quotient coefficients
//
//-----------------------------------------------------------------------------
function yydivpoly(p4: U, p5: U, polycoeff: U[], factpoly_expo: number) {
  let p6: U = Constants.zero;
  for (let i = factpoly_expo; i > 0; i--) {
    const divided = divide(polycoeff[i], p4);
    polycoeff[i] = p6;
    p6 = divided;
    polycoeff[i - 1] = subtract(polycoeff[i - 1], multiply(p6, p5));
  }
  polycoeff[0] = p6;
  if (DEBUG) {
    console.log('yydivpoly Q:');
  }
}
//console.log print_list(p6)

function Evalpoly(p3: U, polycoeff: U[], factpoly_expo: number): U {
  let temp: U = Constants.zero;
  for (let i = factpoly_expo; i >= 0; i--) {
    if (DEBUG) {
      console.log('Evalpoly top of stack:');
      console.log(print_list(temp));
    }
    temp = add(multiply(temp, p3), polycoeff[i]);
  }
  return temp;
}
