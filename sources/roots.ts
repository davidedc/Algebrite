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
import { moveTos, pop, push, top } from '../runtime/stack';
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
  const h = defs.tos;
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

  let isSimpleRootPolynomial;
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
  } else {
    isSimpleRootPolynomial = false;
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
    p3 = coefficients.pop();
    p4 = coefficients.pop();
    push(negate(divide(p4, p3)));
    return;
  }

  // AX^2 + BX + C, X = (-B +/- (B^2 - 4AC)^(1/2)) / (2A)

  if (n === 3) {
    //console.log "mini_solve >>>>>>>>> 2nd degree"
    p3 = coefficients.pop(); // A
    p4 = coefficients.pop(); // B
    p5 = coefficients.pop(); // C

    // B^2
    push(power(p4, integer(2)));

    // 4AC
    let arg1 = multiply(integer(4), p3);
    let arg2 = multiply(arg1, p5);

    // B^2 - 4AC
    arg1 = pop();
    const base = subtract(arg1, arg2);

    //(B^2 - 4AC)^(1/2)
    p6 = power(base, rational(1, 2));

    //p6 is (B^2 - 4AC)^(1/2)

    // B
    arg1 = subtract(p6, p4); // -B + (B^2 - 4AC)^(1/2)

    // 1/2A
    push(divide(arg1, multiply(p3, integer(2))));
    //simplify()
    //rationalize()
    // tos - 1 now is 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

    // tos - 1 now is (B^2 - 4AC)^(1/2)
    // tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

    // add B to tos
    arg1 = add(p6, p4);
    // tos - 1 now is  B + (B^2 - 4AC)^(1/2)
    // tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

    arg1 = negate(arg1);
    // tos - 1 now is  -B -(B^2 - 4AC)^(1/2)
    // tos - 2: 1st root: (-B + (B^2 - 4AC)^(1/2)) / (2A)

    // 1/2A again
    push(multiply(divide(arg1, p3), rational(1, 2)));
    return;
  }

  //if (n == 4)
  if (n === 4 || n === 5) {
    let R_DELTA1: U, R_determinant: U;
    p3 = coefficients.pop(); // A
    p4 = coefficients.pop(); // B
    p5 = coefficients.pop(); // C
    p6 = coefficients.pop(); // D

    // C - only related calculations
    const R_c2 = multiply(p5, p5);

    const R_c3 = multiply(R_c2, p5);

    // B - only related calculations
    const R_b2 = multiply(p4, p4);

    const R_b3 = multiply(R_b2, p4);

    const R_b3_d = multiply(R_b3, p6);

    const R_m4_b3_d = multiply(R_b3_d, integer(-4));

    const R_2_b3 = multiply(R_b3, integer(2));

    // A - only related calculations
    const R_a2 = multiply(p3, p3);

    const R_a3 = multiply(R_a2, p3);

    const R_3_a = multiply(integer(3), p3);

    const R_a2_d = multiply(R_a2, p6);

    const R_a2_d2 = multiply(R_a2_d, p6);

    const R_27_a2_d = multiply(R_a2_d, integer(27));

    const R_m27_a2_d2 = multiply(R_a2_d2, integer(-27));

    const R_6_a = multiply(R_3_a, integer(2));

    // mixed calculations
    const R_a_c = multiply(p3, p5);

    const R_a_b_c = multiply(R_a_c, p4);

    const R_a_b_c_d = multiply(R_a_b_c, p6);

    const R_3_a_c = multiply(R_a_c, integer(3));

    let arg2 = multiply(p3, R_c3);
    const R_m4_a_c3 = multiply(integer(-4), arg2);

    const R_m9_a_b_c = negate(multiply(R_a_b_c, integer(9)));

    const R_18_a_b_c_d = multiply(R_a_b_c_d, integer(18));

    let R_DELTA0 = subtract(R_b2, R_3_a_c);

    const R_b2_c2 = multiply(R_b2, R_c2);

    let arg1 = negate(p4);
    const R_m_b_over_3a = divide(arg1, R_3_a);

    if (n === 4) {
      let R_C: U;
      if (DEBUG) {
        console.log(
          '>>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< '
        );
      }

      //console.log ">>>> A:" + p3.toString()
      //console.log ">>>> B:" + p4.toString()
      //console.log ">>>> C:" + p5.toString()
      //console.log ">>>> D:" + p6.toString()

      if (DEBUG) {
        console.log('cubic: D0: ' + R_DELTA0.toString());
      }

      const R_4_DELTA03 = multiply(power(R_DELTA0, integer(3)), integer(4));

      push(simplify(R_DELTA0));
      absValFloat();
      const R_DELTA0_toBeCheckedIfZero = pop();
      if (DEBUG) {
        console.log(`cubic: D0 as float: ${R_DELTA0_toBeCheckedIfZero}`);
      }
      //if isZeroAtomOrTensor(R_DELTA0_toBeCheckedIfZero)
      //  console.log " *********************************** D0 IS ZERO"

      // DETERMINANT
      push(
        simplify(
          add_all([R_18_a_b_c_d, R_m4_b3_d, R_b2_c2, R_m4_a_c3, R_m27_a2_d2])
        )
      );

      absValFloat();
      R_determinant = pop();
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
        power(
          subtract(power(R_DELTA1, integer(2)), R_4_DELTA03),
          rational(1, 2)
        )
      );

      if (isZeroAtomOrTensor(R_determinant)) {
        if (isZeroAtomOrTensor(R_DELTA0_toBeCheckedIfZero)) {
          if (DEBUG) {
            console.log(' cubic: DETERMINANT IS ZERO and delta0 is zero');
          }
          push(R_m_b_over_3a); // just same solution three times
          return;
        } else {
          if (DEBUG) {
            console.log(' cubic: DETERMINANT IS ZERO and delta0 is not zero');
          }
          const root_solution = divide(
            subtract(multiply(p3, multiply(p6, integer(9))), multiply(p4, p5)),
            multiply(R_DELTA0, integer(2))
          ); // first solution
          push(root_solution); // pushing two of them on the stack
          push(root_solution);

          // second solution here

          // -9*b^3
          const numer_term1 = negate(R_b3);
          // -9a*a*d
          const numer_term2 = negate(
            multiply(p3, multiply(p3, multiply(p6, integer(9))))
          );
          // 4*a*b*c
          const numer_term3 = multiply(R_a_b_c, integer(4));

          // build the fraction
          // numerator: sum the three terms
          // denominator: a*delta0
          push(
            divide(
              add_all([numer_term3, numer_term2, numer_term1]),
              multiply(p3, R_DELTA0)
            )
          );

          return;
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

        push(simplify(R_C));
        absValFloat();
        const R_C_simplified_toCheckIfZero = pop();
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
      push(simplify(add_all([firstSolTerm1, firstSolTerm2, firstSolTerm3])));

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
      push(simplify(add_all([secondSolTerm1, secondSolTerm2, secondSolTerm3])));

      // third solution
      const thirdSolTerm1 = R_m_b_over_3a; // first term
      const thirdSolTerm2 = divide(
        multiply(R_C_over_3a, one_minus_i_sqrt3),
        integer(2)
      ); // second term
      const thirdSolTerm3 = divide(
        multiply(one_plus_i_sqrt3, R_DELTA0),
        R_6_a_C
      ); // third term
      // now add the three terms together
      push(simplify(add_all([thirdSolTerm1, thirdSolTerm2, thirdSolTerm3])));

      return;
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
      p7 = coefficients.pop(); // E

      if (
        isZeroAtomOrTensor(p4) &&
        isZeroAtomOrTensor(p6) &&
        !isZeroAtomOrTensor(p5) &&
        !isZeroAtomOrTensor(p7)
      ) {
        if (DEBUG) {
          console.log('biquadratic case');
        }
        push(
          add(
            multiply(p3, power(symbol(SECRETX), integer(2))),
            add(multiply(p5, symbol(SECRETX)), p7)
          )
        );

        push(symbol(SECRETX));
        roots();

        const biquadraticSolutions = pop() as Tensor;

        for (eachSolution of Array.from(biquadraticSolutions.tensor.elem)) {
          push(simplify(power(eachSolution, rational(1, 2))));
          push(simplify(negate(power(eachSolution, rational(1, 2)))));
        }

        return;
      }

      // D - only related calculations
      const R_d2 = multiply(p6, p6);

      // E - only related calculations
      const R_e2 = multiply(p7, p7);

      const R_e3 = multiply(R_e2, p7);

      // DETERMINANT
      const terms: U[] = [];
      // first term 256 a^3 e^3
      terms.push(multiply(integer(256), multiply(R_a3, R_e3)));

      // second term -192 a^3 b d e^2
      terms.push(multiply(integer(-192), multiply(R_a2_d, multiply(R_e2, p4))));

      // third term -128 a^2 c^2 e^2
      terms.push(multiply(integer(-128), multiply(R_a2, multiply(R_c2, R_e2))));

      // fourth term 144 a^2 c d^2 e
      terms.push(multiply(integer(144), multiply(R_a2_d2, multiply(p5, p7))));

      // fifth term -27 a^2 d^4
      terms.push(multiply(R_m27_a2_d2, R_d2));

      // sixth term 144 a b^2 c e^2
      terms.push(multiply(integer(144), multiply(R_a_b_c, multiply(p4, R_e2))));

      // seventh term -6 a b^2 d^2 e
      terms.push(
        multiply(integer(-6), multiply(p3, multiply(R_b2, multiply(R_d2, p7))))
      );

      // eigth term -80 a b c^2 d e
      terms.push(multiply(integer(-80), multiply(R_a_b_c_d, multiply(p5, p7))));

      // ninth term 18 a b c d^3
      terms.push(multiply(integer(18), multiply(R_a_b_c_d, R_d2)));

      // tenth term 16 a c^4 e
      terms.push(multiply(integer(16), multiply(R_a_c, multiply(R_c3, p7))));

      // eleventh term -4 a c^3 d^2
      terms.push(multiply(integer(-4), multiply(R_a_c, multiply(R_c2, R_d2))));

      // twelveth term -27 b^4 e^2
      terms.push(multiply(integer(-27), multiply(R_b3, multiply(p4, R_e2))));

      // thirteenth term 18 b^3 c d e
      terms.push(multiply(integer(18), multiply(R_b3_d, multiply(p5, p7))));

      // fourteenth term -4 b^3 d^3
      terms.push(multiply(R_m4_b3_d, R_d2));

      // fifteenth term -4 b^2 c^3 e
      terms.push(multiply(integer(-4), multiply(R_b2_c2, multiply(p5, p7))));

      // sixteenth term b^2 c^2 d^2
      terms.push(multiply(R_b2_c2, R_d2));

      // add together the sixteen terms
      R_determinant = add_all(terms);

      if (DEBUG) {
        console.log('R_determinant: ' + R_determinant.toString());
      }

      // DELTA0
      const DELTA0_term1 = R_c2; // term one of DELTA0
      const DELTA0_term2 = multiply(integer(-3), multiply(p4, p6)); // term two of DELTA0
      const DELTA0_term3 = multiply(integer(12), multiply(p3, p7)); // term three of DELTA0

      // add the three terms together
      R_DELTA0 = add_all([DELTA0_term1, DELTA0_term2, DELTA0_term3]);

      if (DEBUG) {
        console.log('R_DELTA0: ' + R_DELTA0.toString());
      }

      // DELTA1
      const DELTA1_term1 = multiply(integer(2), R_c3);
      const DELTA1_term2 = multiply(
        integer(-9),
        multiply(p4, multiply(p5, p6))
      );
      const DELTA1_term3 = multiply(integer(27), multiply(R_b2, p7));
      const DELTA1_term4 = multiply(integer(27), multiply(p3, R_d2));
      const DELTA1_term5 = multiply(integer(-72), multiply(R_a_c, p7));

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
      if (!isZeroAtomOrTensor(p4)) {
        if (DEBUG) {
          console.log('tos 2 ' + defs.tos);
        }

        R_p = divide(
          add(
            multiply(integer(8), multiply(p5, p3)),
            multiply(integer(-3), power(p4, integer(2)))
          ),
          multiply(integer(8), power(p3, integer(2)))
        );

        if (DEBUG) {
          console.log('p for depressed quartic: ' + R_p.toString());
        }

        R_q = divide(
          add(
            power(p4, integer(3)),
            add(
              multiply(integer(-4), multiply(p3, multiply(p4, p5))),
              multiply(integer(8), multiply(p6, power(p3, integer(2))))
            )
          ),
          multiply(integer(8), power(p3, integer(3)))
        );

        if (DEBUG) {
          console.log('q for depressed quartic: ' + R_q.toString());
        }

        // convert to depressed quartic

        R_r = divide(
          add(
            multiply(power(p4, integer(4)), integer(-3)),
            add(
              multiply(integer(256), multiply(R_a3, p7)),
              add(
                multiply(integer(-64), multiply(R_a2_d, p4)),
                multiply(integer(16), multiply(R_b2, multiply(p3, p5)))
              )
            )
          ),
          multiply(integer(256), power(p3, integer(4)))
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

        push(simplify(add_all([arg1c, arg1b, arg1a, R_r])));
        if (DEBUG) {
          console.log('solving depressed quartic: ' + top().toString());
        }

        push(symbol(SECRETX));

        roots();

        const depressedSolutions = pop() as Tensor;
        if (DEBUG) {
          console.log(`depressedSolutions: ${depressedSolutions}`);
        }

        for (eachSolution of Array.from(depressedSolutions.tensor.elem)) {
          push(
            simplify(
              subtract(eachSolution, divide(p4, multiply(integer(4), p3)))
            )
          );
          if (DEBUG) {
            console.log('solution from depressed: ' + top().toString());
          }
        }
        return;
      } else {
        R_p = p5;
        R_q = p6;
        R_r = p7;

        /*
        * Descartes' solution
        * https://en.wikipedia.org/wiki/Quartic_function#Descartes.27_solution
        * finding the "u" in the depressed equation

        push_integer(2)
        push(R_p)
        multiply()
        coeff2 = pop()

        push_integer(-4)
        push(R_p)
        push_integer(2)
        power()
        multiply()
        push(R_r)
        multiply()
        coeff3 = pop()

        push(R_q)
        push_integer(2)
        power()
        negate()
        coeff4 = pop()

        * now build the polynomial
        push(symbol(SECRETX))
        push_integer(3)
        power()

        push(coeff2)
        push(symbol(SECRETX))
        push_integer(2)
        power()
        multiply()

        push(coeff3)
        push(symbol(SECRETX))
        multiply()

        push(coeff4)

        add()
        add()
        add()

        console.log("Descarte's resolventCubic: " +  stack[tos-1].toString())
        push(symbol(SECRETX))

        roots()

        resolventCubicSolutions = pop()
        console.log("Descarte's resolventCubic solutions: " +  resolventCubicSolutions)
        console.log("tos: " +  tos)

        R_u = null
        *R_u = resolventCubicSolutions.tensor.elem[1]
        for eachSolution in resolventCubicSolutions.tensor.elem
          console.log("examining solution: " +  eachSolution)
          push(eachSolution)
          push_integer(2)
          multiply()
          push(R_p)
          add()

          absValFloat()
          toBeCheckedIFZero = pop()
          console.log("abs value is: " +  eachSolution)
          if !isZeroAtomOrTensor(toBeCheckedIFZero)
            R_u = eachSolution
            break

        console.log("chosen solution: " +  R_u)

        push(R_u)
        negate()
        R_s = pop()

        push(R_p)
        push(R_u)
        push_integer(2)
        power()
        push(R_q)
        push(R_u)
        divide()
        add()
        add()
        push_integer(2)
        divide()
        R_t = pop()

        push(R_p)
        push(R_u)
        push_integer(2)
        power()
        push(R_q)
        push(R_u)
        divide()
        subtract()
        add()
        push_integer(2)
        divide()
        R_v = pop()

        * factoring the quartic into two quadratics:

        * now build the polynomial
        push(symbol(SECRETX))
        push_integer(2)
        power()

        push(R_s)
        push(symbol(SECRETX))
        multiply()

        push(R_t)

        add()
        add()

        console.log("factored quartic 1: " + stack[tos-1].toString())

        push(symbol(SECRETX))
        push_integer(2)
        power()

        push(R_u)
        push(symbol(SECRETX))
        multiply()

        push(R_v)

        add()
        add()

        console.log("factored quartic 2: " + stack[tos-1].toString())
        pop()

        restore()
        return
        */

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

        push(
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
        push(symbol(SECRETX));

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

          push(add(multiply(eachSolution, integer(2)), R_p));

          absValFloat();
          const toBeCheckedIFZero = pop();
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
        push(divide(add(sqrtPPlus2M, arg2), integer(2)));

        // solution2
        arg2 = simplify(
          power(negate(add(ThreePPlus2M, TwoQOversqrtPPlus2M)), rational(1, 2))
        );
        push(divide(subtract(sqrtPPlus2M, arg2), integer(2)));

        // solution3
        arg2 = simplify(
          power(
            negate(subtract(ThreePPlus2M, TwoQOversqrtPPlus2M)),
            rational(1, 2)
          )
        );
        push(divide(add(negate(sqrtPPlus2M), arg2), integer(2)));

        // solution4
        arg2 = simplify(
          power(
            negate(subtract(ThreePPlus2M, TwoQOversqrtPPlus2M)),
            rational(1, 2)
          )
        );
        push(divide(subtract(negate(sqrtPPlus2M), arg2), integer(2)));

        return;
      }

      // Q ---------------------------
    }
  }
}
