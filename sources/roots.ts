import { alloc_tensor } from '../runtime/alloc';
import {
  caddr,
  cadr,
  car,
  Constants,
  DEBUG,
  defs,
  ismultiply,
  ispower,
  NIL,
  SECRETX,
  SETQ,
  symbol,
  Tensor,
  TESTEQ,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { moveTos, pop, push, push_all, top } from '../runtime/stack';
import { sort_stack } from '../sources/misc';
import { absValFloat } from './abs';
import { add, add_all, subtract } from './add';
import { integer, rational } from './bignum';
import { coeff } from './coeff';
import { Eval } from './eval';
import { factorpoly } from './factorpoly';
import { guess } from './guess';
import {
  iscomplexnumber,
  ispolyexpandedform,
  isposint,
  isZeroAtomOrTensor,
} from './is';
import { divide, multiply, negate } from './multiply';
import { power } from './power';
import { simplify } from './simplify';

//define POLY p1
//define X p2
//define A p3
//define B p4
//define C p5
//define Y p6

let show_power_debug = false;
let performing_roots = false;

export function Eval_roots(p1: U) {
  let p2: U;
  // A == B -> A - B

  p2 = cadr(p1);

  if (car(p2) === symbol(SETQ) || car(p2) === symbol(TESTEQ)) {
    push(cadr(p2));
    Eval();
    push(caddr(p2));
    Eval();
    const arg2 = pop();
    const arg1 = pop();
    push(subtract(arg1, arg2));
  } else {
    push(p2);
    Eval();
    p2 = pop();
    if (car(p2) === symbol(SETQ) || car(p2) === symbol(TESTEQ)) {
      push(cadr(p2));
      Eval();
      push(caddr(p2));
      Eval();
      const arg2 = pop();
      const arg1 = pop();
      push(subtract(arg1, arg2));
    } else {
      push(p2);
    }
  }

  // 2nd arg, x

  push(caddr(p1));
  Eval();
  p2 = pop();

  p2 = p2 === symbol(NIL) ? guess(top()) : p2;
  p1 = pop();

  if (!ispolyexpandedform(p1, p2)) {
    stop('roots: 1st argument is not a polynomial');
  }

  push(p1);
  push(p2);

  roots();
}

function hasImaginaryCoeff(k: U[]) {
  //polycoeff = tos

  let imaginaryCoefficients = false;
  for (const c of k) {
    //console.log "hasImaginaryCoeff - coeff.:" + c.toString()
    if (iscomplexnumber(c)) {
      imaginaryCoefficients = true;
      break;
    }
  }
  return imaginaryCoefficients;
}

function isSimpleRoot(k: U[]) {
  //polycoeff = tos

  //tos-n    Coefficient of x^0
  //tos-1    Coefficient of x^(n-1)

  let isSimpleRootPolynomial = false;
  if (k.length > 2) {
    isSimpleRootPolynomial = true;
    if (isZeroAtomOrTensor(k[0])) {
      isSimpleRootPolynomial = false;
    }

    for (let i = 1; i < k.length - 1; i++) {
      //console.log "hasImaginaryCoeff - coeff.:" + stack[tos-i].toString()
      if (!isZeroAtomOrTensor(k[i])) {
        isSimpleRootPolynomial = false;
        break;
      }
    }
  }

  return isSimpleRootPolynomial;
}

function normalisedCoeff(poly: U, x: U): U[] {
  const miniStack = coeff(poly, x);
  miniStack.reverse();
  const divideBy = miniStack[0];

  const result = [];
  for (let i = miniStack.length - 1; i >= 0; i--) {
    result.push(divide(miniStack[i], divideBy));
  }
  //console.log(tos)
  return result;
}

// takes the polynomial and the
// variable on the stack

export function roots() {
  // the simplification of nested radicals uses
  // "roots", which in turn uses simplification
  // of nested radicals. Usually there is no problem,
  // one level of recursion does the job. Beyond that,
  // we probably got stuck in a strange case of infinite
  // recursion, so bail out and return NIL.
  if (defs.recursionLevelNestedRadicalsRemoval > 1) {
    pop();
    pop();
    push(symbol(NIL));
    return;
  }

  performing_roots = true;
  const h = defs.tos - 2;

  if (DEBUG) {
    console.log(`checking if ${top()} is a case of simple roots`);
  }

  const p2 = pop();
  let p1 = pop();

  const k = normalisedCoeff(p1, p2);

  if (isSimpleRoot(k)) {
    if (DEBUG) {
      console.log(`yes, ${k[k.length - 1]} is a case of simple roots`);
    }
    const kn = k.length;
    const lastCoeff = k[0];
    const leadingCoeff = k.pop();
    getSimpleRoots(kn, leadingCoeff, lastCoeff);
  } else {
    push(p1);
    push(p2);

    roots2();
  }

  const n = defs.tos - h;
  if (n === 0) {
    stop('roots: the polynomial is not factorable, try nroots');
  }
  if (n === 1) {
    performing_roots = false;
    return;
  }
  sort_stack(n);
  p1 = alloc_tensor(n);
  p1.tensor.ndim = 1;
  p1.tensor.dim[0] = n;
  for (let i = 0; i < n; i++) {
    p1.tensor.elem[i] = defs.stack[h + i];
  }
  moveTos(h);
  push(p1);
  performing_roots = false;
}

// ok to generate these roots take a look at their form
// in the case of even and odd exponents here:
// http://www.wolframalpha.com/input/?i=roots+x%5E14+%2B+1
// http://www.wolframalpha.com/input/?i=roots+ax%5E14+%2B+b
// http://www.wolframalpha.com/input/?i=roots+x%5E15+%2B+1
// http://www.wolframalpha.com/input/?i=roots+a*x%5E15+%2B+b
function getSimpleRoots(n: number, leadingCoeff: U, lastCoeff: U) {
  if (DEBUG) {
    console.log('getSimpleRoots');
  }

  //tos-n    Coefficient of x^0
  //tos-1    Coefficient of x^(n-1)

  n = n - 1;

  const commonPart = divide(
    power(lastCoeff, rational(1, n)),
    power(leadingCoeff, rational(1, n))
  );

  if (n % 2 === 0) {
    for (let rootsOfOne = 1; rootsOfOne <= n; rootsOfOne += 2) {
      const aSol = multiply(
        commonPart,
        power(Constants.negOne, rational(rootsOfOne, n))
      );
      push(aSol);
      push(negate(aSol));
    }
  } else {
    for (let rootsOfOne = 1; rootsOfOne <= n; rootsOfOne++) {
      push(
        multiply(commonPart, power(Constants.negOne, rational(rootsOfOne, n)))
      );
      if (rootsOfOne % 2 === 0) {
        push(negate(pop()));
      }
    }
  }
}

function roots2() {
  let p2: U, p1: U;

  p2 = pop(); // the polynomial variable
  p1 = pop(); // the polynomial

  const k = normalisedCoeff(p1, p2);

  if (!hasImaginaryCoeff(k)) {
    p1 = factorpoly(p1, p2);
  }

  if (ismultiply(p1)) {
    // scan through all the factors and find the roots of each of them
    p1.tail().forEach((p) => {
      push(p);
      push(p2);
      roots3();
    });
  } else {
    push(p1);
    push(p2);
    roots3();
  }
}

function roots3() {
  let p2 = pop();
  let p1 = pop();
  if (ispower(p1) && ispolyexpandedform(cadr(p1), p2) && isposint(caddr(p1))) {
    const n = normalisedCoeff(cadr(p1), p2);
    mini_solve(n);
  } else if (ispolyexpandedform(p1, p2)) {
    const n = normalisedCoeff(p1, p2);
    mini_solve(n);
  }
}

// note that for many quadratic, cubic and quartic polynomials we don't
// actually end up using the quadratic/cubic/quartic formulas in here,
// since there is a chance we factored the polynomial and in so
// doing we found some solutions and lowered the degree.
function mini_solve(coefficients: U[]) {
  const n = coefficients.length;
  let p3: U, p4: U, p5: U, p6: U, p7: U;

  // AX + B, X = -B/A

  if (n === 2) {
    //console.log "mini_solve >>>>>>>>> 1st degree"
    const A = coefficients.pop();
    const B = coefficients.pop();
    push_all(_handle2(A, B));
    return;
  }

  // AX^2 + BX + C, X = (-B +/- (B^2 - 4AC)^(1/2)) / (2A)

  if (n === 3) {
    //console.log "mini_solve >>>>>>>>> 2nd degree"
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    push_all(_handle3(A, B, C));
    return;
  }

  if (n === 4 || n === 5) {
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    const D = coefficients.pop();
    const E = n === 5 ? coefficients.pop() : undefined;
    push_all(_handle4and5(n, A, B, C, D, E));
    return;
  }
}

function _handle2(A: U, B: U): U[] {
  return [negate(divide(B, A))];
}

function _handle3(A: U, B: U, C: U): U[] {
  // (B^2 - 4AC)^(1/2)
  const p6 = power(
    // prettier-ignore
    subtract(
        power(B, integer(2)), 
        multiply(multiply(integer(4), A), C)
      ),
    rational(1, 2)
  );

  // ((B^2 - 4AC)^(1/2) - B)/ (2A)
  const result1 = divide(subtract(p6, B), multiply(A, integer(2)));

  // 1/2 * -(B + (B^2 - 4AC)^(1/2)) / A
  const result2 = multiply(divide(negate(add(p6, B)), A), rational(1, 2));
  return [result1, result2];
}

function _handle4and5(n: number, A: U, B: U, C: U, D: U, E: U): U[] {
  const results = [];
  let R_DELTA1: U, R_determinant: U;

  // C - only related calculations
  const R_c2 = multiply(C, C);

  const R_c3 = multiply(R_c2, C);

  // B - only related calculations
  const R_b2 = multiply(B, B);

  const R_b3 = multiply(R_b2, B);

  const R_b3_d = multiply(R_b3, D);

  const R_m4_b3_d = multiply(R_b3_d, integer(-4));

  const R_2_b3 = multiply(R_b3, integer(2));

  // A - only related calculations
  const R_a2 = multiply(A, A);

  const R_a3 = multiply(R_a2, A);

  const R_3_a = multiply(integer(3), A);

  const R_a2_d = multiply(R_a2, D);

  const R_a2_d2 = multiply(R_a2_d, D);

  const R_27_a2_d = multiply(R_a2_d, integer(27));

  const R_m27_a2_d2 = multiply(R_a2_d2, integer(-27));

  const R_6_a = multiply(R_3_a, integer(2));

  // mixed calculations
  const R_a_c = multiply(A, C);

  const R_a_b_c = multiply(R_a_c, B);

  const R_a_b_c_d = multiply(R_a_b_c, D);

  const R_3_a_c = multiply(R_a_c, integer(3));

  let arg2 = multiply(A, R_c3);
  const R_m4_a_c3 = multiply(integer(-4), arg2);

  const R_m9_a_b_c = negate(multiply(R_a_b_c, integer(9)));

  const R_18_a_b_c_d = multiply(R_a_b_c_d, integer(18));

  let R_DELTA0 = subtract(R_b2, R_3_a_c);

  const R_b2_c2 = multiply(R_b2, R_c2);

  let arg1 = negate(B);
  const R_m_b_over_3a = divide(arg1, R_3_a);

  if (n === 4) {
    let R_C: U;
    if (DEBUG) {
      console.log(
        '>>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< '
      );
      console.log(`cubic: D0: ${R_DELTA0.toString()}`);
    }

    const R_4_DELTA03 = multiply(power(R_DELTA0, integer(3)), integer(4));

    const R_DELTA0_toBeCheckedIfZero = absValFloat(simplify(R_DELTA0));
    if (DEBUG) {
      console.log(`cubic: D0 as float: ${R_DELTA0_toBeCheckedIfZero}`);
    }
    // DETERMINANT
    R_determinant = absValFloat(
      simplify(
        add_all([R_18_a_b_c_d, R_m4_b3_d, R_b2_c2, R_m4_a_c3, R_m27_a2_d2])
      )
    );
    if (DEBUG) {
      console.log(`cubic: DETERMINANT: ${R_determinant}`);
    }

    // R_DELTA1
    R_DELTA1 = add_all([R_2_b3, R_m9_a_b_c, R_27_a2_d]);
    if (DEBUG) {
      console.log(`cubic: D1: ${R_DELTA1}`);
    }

    // R_Q
    let R_Q = simplify(
      power(subtract(power(R_DELTA1, integer(2)), R_4_DELTA03), rational(1, 2))
    );

    if (isZeroAtomOrTensor(R_determinant)) {
      if (isZeroAtomOrTensor(R_DELTA0_toBeCheckedIfZero)) {
        if (DEBUG) {
          console.log(' cubic: DETERMINANT IS ZERO and delta0 is zero');
        }
        results.push(R_m_b_over_3a); // just same solution three times
        return results;
      } else {
        if (DEBUG) {
          console.log(' cubic: DETERMINANT IS ZERO and delta0 is not zero');
        }
        const root_solution = divide(
          subtract(multiply(A, multiply(D, integer(9))), multiply(B, C)),
          multiply(R_DELTA0, integer(2))
        ); // first solution
        results.push(root_solution); // pushing two of them on the stack
        results.push(root_solution);

        // second solution here

        // -9*b^3
        const numer_term1 = negate(R_b3);
        // -9a*a*d
        const numer_term2 = negate(
          multiply(A, multiply(A, multiply(D, integer(9))))
        );
        // 4*a*b*c
        const numer_term3 = multiply(R_a_b_c, integer(4));

        // build the fraction
        // numerator: sum the three terms
        // denominator: a*delta0
        results.push(
          divide(
            add_all([numer_term3, numer_term2, numer_term1]),
            multiply(A, R_DELTA0)
          )
        );

        return results;
      }
    }

    let C_CHECKED_AS_NOT_ZERO = false;
    let flipSignOFQSoCIsNotZero = false;

    // C will go as denominator, we have to check
    // that is not zero
    while (!C_CHECKED_AS_NOT_ZERO) {
      // R_C
      let arg1 = R_Q;
      if (flipSignOFQSoCIsNotZero) {
        arg1 = negate(arg1);
      }
      R_C = simplify(
        power(multiply(add(arg1, R_DELTA1), rational(1, 2)), rational(1, 3))
      );
      if (DEBUG) {
        console.log(`cubic: C: ${R_C}`);
      }

      const R_C_simplified_toCheckIfZero = absValFloat(simplify(R_C));
      if (DEBUG) {
        console.log(
          `cubic: C as absval and float: ${R_C_simplified_toCheckIfZero}`
        );
      }

      if (isZeroAtomOrTensor(R_C_simplified_toCheckIfZero)) {
        if (DEBUG) {
          console.log(' cubic: C IS ZERO flipping the sign');
        }
        flipSignOFQSoCIsNotZero = true;
      } else {
        C_CHECKED_AS_NOT_ZERO = true;
      }
    }

    const R_3_a_C = multiply(R_C, R_3_a);

    const R_6_a_C = multiply(R_3_a_C, integer(2));

    // imaginary parts calculations
    const i_sqrt3 = multiply(
      Constants.imaginaryunit,
      power(integer(3), rational(1, 2))
    );
    const one_plus_i_sqrt3 = add(Constants.one, i_sqrt3);

    const one_minus_i_sqrt3 = subtract(Constants.one, i_sqrt3);

    const R_C_over_3a = divide(R_C, R_3_a);

    // first solution
    const firstSolTerm1 = R_m_b_over_3a; // first term
    const firstSolTerm2 = negate(R_C_over_3a); // second term
    const firstSolTerm3 = negate(divide(R_DELTA0, R_3_a_C)); // third term
    // now add the three terms together
    results.push(
      simplify(add_all([firstSolTerm1, firstSolTerm2, firstSolTerm3]))
    );

    // second solution
    const secondSolTerm1 = R_m_b_over_3a; // first term
    const secondSolTerm2 = divide(
      multiply(R_C_over_3a, one_plus_i_sqrt3),
      integer(2)
    ); // second term
    const secondSolTerm3 = divide(
      multiply(one_minus_i_sqrt3, R_DELTA0),
      R_6_a_C
    ); // third term
    // now add the three terms together
    results.push(
      simplify(add_all([secondSolTerm1, secondSolTerm2, secondSolTerm3]))
    );

    // third solution
    const thirdSolTerm1 = R_m_b_over_3a; // first term
    const thirdSolTerm2 = divide(
      multiply(R_C_over_3a, one_minus_i_sqrt3),
      integer(2)
    ); // second term
    const thirdSolTerm3 = divide(multiply(one_plus_i_sqrt3, R_DELTA0), R_6_a_C); // third term
    // now add the three terms together
    results.push(
      simplify(add_all([thirdSolTerm1, thirdSolTerm2, thirdSolTerm3]))
    );

    return results;
  }

  // See http://www.sscc.edu/home/jdavidso/Math/Catalog/Polynomials/Fourth/Fourth.html
  // for a description of general shapes and properties of fourth degree polynomials
  if (n === 5) {
    let eachSolution: U, R_r: U, R_S: U;
    if (DEBUG) {
      console.log(
        '>>>>>>>>>>>>>>>> actually using quartic formula <<<<<<<<<<<<<<< '
      );
    }

    if (
      isZeroAtomOrTensor(B) &&
      isZeroAtomOrTensor(D) &&
      !isZeroAtomOrTensor(C) &&
      !isZeroAtomOrTensor(E)
    ) {
      if (DEBUG) {
        console.log('biquadratic case');
      }
      results.push(
        add(
          multiply(A, power(symbol(SECRETX), integer(2))),
          add(multiply(C, symbol(SECRETX)), E)
        )
      );

      results.push(symbol(SECRETX));
      push_all(results);
      roots();

      const biquadraticSolutions = pop() as Tensor;

      for (eachSolution of Array.from(biquadraticSolutions.tensor.elem)) {
        results.push(simplify(power(eachSolution, rational(1, 2))));
        results.push(simplify(negate(power(eachSolution, rational(1, 2)))));
      }

      return results;
    }

    // D - only related calculations
    const R_d2 = multiply(D, D);

    // E - only related calculations
    const R_e2 = multiply(E, E);

    const R_e3 = multiply(R_e2, E);

    // DETERMINANT
    const terms: U[] = [];
    // first term 256 a^3 e^3
    terms.push(multiply(integer(256), multiply(R_a3, R_e3)));

    // second term -192 a^3 b d e^2
    terms.push(multiply(integer(-192), multiply(R_a2_d, multiply(R_e2, B))));

    // third term -128 a^2 c^2 e^2
    terms.push(multiply(integer(-128), multiply(R_a2, multiply(R_c2, R_e2))));

    // fourth term 144 a^2 c d^2 e
    terms.push(multiply(integer(144), multiply(R_a2_d2, multiply(C, E))));

    // fifth term -27 a^2 d^4
    terms.push(multiply(R_m27_a2_d2, R_d2));

    // sixth term 144 a b^2 c e^2
    terms.push(multiply(integer(144), multiply(R_a_b_c, multiply(B, R_e2))));

    // seventh term -6 a b^2 d^2 e
    terms.push(
      multiply(integer(-6), multiply(A, multiply(R_b2, multiply(R_d2, E))))
    );

    // eigth term -80 a b c^2 d e
    terms.push(multiply(integer(-80), multiply(R_a_b_c_d, multiply(C, E))));

    // ninth term 18 a b c d^3
    terms.push(multiply(integer(18), multiply(R_a_b_c_d, R_d2)));

    // tenth term 16 a c^4 e
    terms.push(multiply(integer(16), multiply(R_a_c, multiply(R_c3, E))));

    // eleventh term -4 a c^3 d^2
    terms.push(multiply(integer(-4), multiply(R_a_c, multiply(R_c2, R_d2))));

    // twelveth term -27 b^4 e^2
    terms.push(multiply(integer(-27), multiply(R_b3, multiply(B, R_e2))));

    // thirteenth term 18 b^3 c d e
    terms.push(multiply(integer(18), multiply(R_b3_d, multiply(C, E))));

    // fourteenth term -4 b^3 d^3
    terms.push(multiply(R_m4_b3_d, R_d2));

    // fifteenth term -4 b^2 c^3 e
    terms.push(multiply(integer(-4), multiply(R_b2_c2, multiply(C, E))));

    // sixteenth term b^2 c^2 d^2
    terms.push(multiply(R_b2_c2, R_d2));

    // add together the sixteen terms
    R_determinant = add_all(terms);

    if (DEBUG) {
      console.log('R_determinant: ' + R_determinant.toString());
    }

    // DELTA0
    const DELTA0_term1 = R_c2; // term one of DELTA0
    const DELTA0_term2 = multiply(integer(-3), multiply(B, D)); // term two of DELTA0
    const DELTA0_term3 = multiply(integer(12), multiply(A, E)); // term three of DELTA0

    // add the three terms together
    R_DELTA0 = add_all([DELTA0_term1, DELTA0_term2, DELTA0_term3]);

    if (DEBUG) {
      console.log('R_DELTA0: ' + R_DELTA0.toString());
    }

    // DELTA1
    const DELTA1_term1 = multiply(integer(2), R_c3);
    const DELTA1_term2 = multiply(integer(-9), multiply(B, multiply(C, D)));
    const DELTA1_term3 = multiply(integer(27), multiply(R_b2, E));
    const DELTA1_term4 = multiply(integer(27), multiply(A, R_d2));
    const DELTA1_term5 = multiply(integer(-72), multiply(R_a_c, E));

    // add the five terms together
    R_DELTA1 = add_all([
      DELTA1_term1,
      DELTA1_term2,
      DELTA1_term3,
      DELTA1_term4,
      DELTA1_term5,
    ]);

    if (DEBUG) {
      console.log('R_DELTA1: ' + R_DELTA1.toString());
    }

    // p
    let R_p = divide(
      add(multiply(integer(8), R_a_c), multiply(integer(-3), R_b2)),
      multiply(integer(8), R_a2)
    );

    if (DEBUG) {
      console.log('p: ' + R_p.toString());
    }

    // q
    let R_q = divide(
      add(
        R_b3,
        add(multiply(integer(-4), R_a_b_c), multiply(integer(8), R_a2_d))
      ),
      multiply(integer(8), R_a3)
    );

    if (DEBUG) {
      console.log('q: ' + R_q.toString());
      console.log('tos 1 ' + defs.tos);
    }
    if (!isZeroAtomOrTensor(B)) {
      if (DEBUG) {
        console.log('tos 2 ' + defs.tos);
      }

      R_p = divide(
        add(
          multiply(integer(8), multiply(C, A)),
          multiply(integer(-3), power(B, integer(2)))
        ),
        multiply(integer(8), power(A, integer(2)))
      );

      if (DEBUG) {
        console.log('p for depressed quartic: ' + R_p.toString());
      }

      R_q = divide(
        add(
          power(B, integer(3)),
          add(
            multiply(integer(-4), multiply(A, multiply(B, C))),
            multiply(integer(8), multiply(D, power(A, integer(2))))
          )
        ),
        multiply(integer(8), power(A, integer(3)))
      );

      if (DEBUG) {
        console.log('q for depressed quartic: ' + R_q.toString());
      }

      // convert to depressed quartic

      R_r = divide(
        add(
          multiply(power(B, integer(4)), integer(-3)),
          add(
            multiply(integer(256), multiply(R_a3, E)),
            add(
              multiply(integer(-64), multiply(R_a2_d, B)),
              multiply(integer(16), multiply(R_b2, multiply(A, C)))
            )
          )
        ),
        multiply(integer(256), power(A, integer(4)))
      );

      if (DEBUG) {
        console.log('r for depressed quartic: ' + R_r.toString());
        console.log('tos 4 ' + defs.tos);
      }

      const arg1c = power(symbol(SECRETX), integer(4));
      if (DEBUG) {
        console.log('4 * x^4: ' + arg1c.toString());
      }

      const arg1b = multiply(R_p, power(symbol(SECRETX), integer(2)));
      if (DEBUG) {
        console.log('R_p * x^2: ' + arg1b.toString());
      }

      const arg1a = multiply(R_q, symbol(SECRETX));
      if (DEBUG) {
        console.log('R_q * x: ' + arg1a.toString());
        console.log('R_r: ' + R_r.toString());
      }

      results.push(simplify(add_all([arg1c, arg1b, arg1a, R_r])));
      if (DEBUG) {
        console.log('solving depressed quartic: ' + top().toString());
      }

      results.push(symbol(SECRETX));

      push_all(results);
      roots();

      const depressedSolutions = pop() as Tensor;
      if (DEBUG) {
        console.log(`depressedSolutions: ${depressedSolutions}`);
      }

      for (eachSolution of Array.from(depressedSolutions.tensor.elem)) {
        results.push(
          simplify(subtract(eachSolution, divide(B, multiply(integer(4), A))))
        );
        if (DEBUG) {
          console.log('solution from depressed: ' + top().toString());
        }
      }
      return results;
    } else {
      R_p = C;
      R_q = D;
      R_r = E;

      // Ferrari's solution
      // https://en.wikipedia.org/wiki/Quartic_function#Ferrari.27s_solution
      // finding the "m" in the depressed equation
      const coeff2 = multiply(rational(5, 2), R_p);

      const coeff3 = subtract(
        multiply(integer(2), power(R_p, integer(2))),
        R_r
      );

      const coeff4 = add(
        multiply(rational(-1, 2), multiply(R_p, R_r)),
        add(
          divide(power(R_p, integer(3)), integer(2)),
          multiply(rational(-1, 8), power(R_q, integer(2)))
        )
      );

      results.push(
        add(
          power(symbol(SECRETX), integer(3)),
          add(
            multiply(coeff2, power(symbol(SECRETX), integer(2))),
            add(multiply(coeff3, symbol(SECRETX)), coeff4)
          )
        )
      );

      if (DEBUG) {
        console.log('resolventCubic: ' + top().toString());
      }
      results.push(symbol(SECRETX));

      push_all(results);
      roots();

      const resolventCubicSolutions = pop() as Tensor;
      if (DEBUG) {
        console.log(`resolventCubicSolutions: ${resolventCubicSolutions}`);
      }

      let R_m = null;
      //R_m = resolventCubicSolutions.tensor.elem[1]
      for (eachSolution of Array.from(resolventCubicSolutions.tensor.elem)) {
        if (DEBUG) {
          console.log(`examining solution: ${eachSolution}`);
        }

        const toBeCheckedIFZero = absValFloat(
          add(multiply(eachSolution, integer(2)), R_p)
        );
        if (DEBUG) {
          console.log(`abs value is: ${eachSolution}`);
        }
        if (!isZeroAtomOrTensor(toBeCheckedIFZero)) {
          R_m = eachSolution;
          break;
        }
      }

      if (DEBUG) {
        console.log(`chosen solution: ${R_m}`);
      }

      const sqrtPPlus2M = simplify(
        power(add(multiply(R_m, integer(2)), R_p), rational(1, 2))
      );

      const TwoQOversqrtPPlus2M = simplify(
        divide(multiply(R_q, integer(2)), sqrtPPlus2M)
      );

      const ThreePPlus2M = add(
        multiply(R_p, integer(3)),
        multiply(R_m, integer(2))
      );

      // solution1
      arg2 = simplify(
        power(negate(add(ThreePPlus2M, TwoQOversqrtPPlus2M)), rational(1, 2))
      );
      results.push(divide(add(sqrtPPlus2M, arg2), integer(2)));

      // solution2
      arg2 = simplify(
        power(negate(add(ThreePPlus2M, TwoQOversqrtPPlus2M)), rational(1, 2))
      );
      results.push(divide(subtract(sqrtPPlus2M, arg2), integer(2)));

      // solution3
      arg2 = simplify(
        power(
          negate(subtract(ThreePPlus2M, TwoQOversqrtPPlus2M)),
          rational(1, 2)
        )
      );
      results.push(divide(add(negate(sqrtPPlus2M), arg2), integer(2)));

      // solution4
      arg2 = simplify(
        power(
          negate(subtract(ThreePPlus2M, TwoQOversqrtPPlus2M)),
          rational(1, 2)
        )
      );
      results.push(divide(subtract(negate(sqrtPPlus2M), arg2), integer(2)));

      return results;
    }

    // Q ---------------------------
  }
  return results;
}
