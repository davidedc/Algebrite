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
import { sort } from '../sources/misc';
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
  // A == B -> A - B

  let p2 = cadr(p1);

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

  const X = p2 === symbol(NIL) ? guess(top()) : p2;
  const POLY = pop();

  if (!ispolyexpandedform(POLY, X)) {
    stop('roots: 1st argument is not a polynomial');
  }

  push_all(roots(POLY, X));
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

// polycoeff = tos
// k[0]      Coefficient of x^0
// k[n-1]    Coefficient of x^(n-1)
function isSimpleRoot(k: U[]) {
  if (k.length <= 2) {
    return false;
  }
  if (isZeroAtomOrTensor(k[0])) {
    return false;
  }
  return k.slice(1, k.length - 1).every((el) => isZeroAtomOrTensor(el));
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

export function roots(POLY: U, X: U): (U | Tensor)[] {
  performing_roots = true;
  const result = _roots(POLY, X);
  performing_roots = false;
  return result;
}

function _roots(POLY: U, X: U): (U | Tensor)[] {
  // the simplification of nested radicals uses
  // "roots", which in turn uses simplification
  // of nested radicals. Usually there is no problem,
  // one level of recursion does the job. Beyond that,
  // we probably got stuck in a strange case of infinite
  // recursion, so bail out and return NIL.
  if (defs.recursionLevelNestedRadicalsRemoval > 1) {
    return [symbol(NIL)];
  }

  if (DEBUG) {
    console.log(`checking if ${top()} is a case of simple roots`);
  }

  const k = normalisedCoeff(POLY, X);

  const results = [];
  if (isSimpleRoot(k)) {
    if (DEBUG) {
      console.log(`yes, ${k[k.length - 1]} is a case of simple roots`);
    }
    const kn = k.length;
    const lastCoeff = k[0];
    const leadingCoeff = k.pop();
    results.push(...getSimpleRoots(kn, leadingCoeff, lastCoeff));
  } else {
    results.push(...roots2(POLY, X));
  }

  const n = results.length;
  if (n === 0) {
    stop('roots: the polynomial is not factorable, try nroots');
  }
  if (n === 1) {
    return results;
  }
  sort(results);
  POLY = alloc_tensor(n);
  POLY.tensor.ndim = 1;
  POLY.tensor.dim[0] = n;
  for (let i = 0; i < n; i++) {
    POLY.tensor.elem[i] = results[i];
  }
  return [POLY];
}

// ok to generate these roots take a look at their form
// in the case of even and odd exponents here:
// http://www.wolframalpha.com/input/?i=roots+x%5E14+%2B+1
// http://www.wolframalpha.com/input/?i=roots+ax%5E14+%2B+b
// http://www.wolframalpha.com/input/?i=roots+x%5E15+%2B+1
// http://www.wolframalpha.com/input/?i=roots+a*x%5E15+%2B+b
// leadingCoeff    Coefficient of x^0
// lastCoeff       Coefficient of x^(n-1)
function getSimpleRoots(n: number, leadingCoeff: U, lastCoeff: U): U[] {
  if (DEBUG) console.log('getSimpleRoots');

  n = n - 1;

  const commonPart = divide(
    power(lastCoeff, rational(1, n)),
    power(leadingCoeff, rational(1, n))
  );
  const results = [];

  if (n % 2 === 0) {
    for (let i = 1; i <= n; i += 2) {
      const aSol = multiply(
        commonPart,
        power(Constants.negOne, rational(i, n))
      );
      results.push(aSol);
      results.push(negate(aSol));
    }
    return results;
  }

  for (let i = 1; i <= n; i++) {
    let sol = multiply(commonPart, power(Constants.negOne, rational(i, n)));
    if (i % 2 === 0) {
      sol = negate(sol);
    }
    results.push(sol);
  }
  return results;
}

function roots2(POLY: U, X: U): U[] {
  const k = normalisedCoeff(POLY, X);

  if (!hasImaginaryCoeff(k)) {
    POLY = factorpoly(POLY, X);
  }

  if (ismultiply(POLY)) {
    // scan through all the factors and find the roots of each of them
    const mapped = POLY.tail().map((p) => roots3(p, X));
    const flatten = (arr: any[]) => [].concat(...arr);
    return flatten(mapped);
  }

  return roots3(POLY, X);
}

function roots3(POLY: U, X: U): U[] {
  if (
    ispower(POLY) &&
    ispolyexpandedform(cadr(POLY), X) &&
    isposint(caddr(POLY))
  ) {
    const n = normalisedCoeff(cadr(POLY), X);
    return mini_solve(n);
  }
  if (ispolyexpandedform(POLY, X)) {
    const n = normalisedCoeff(POLY, X);
    return mini_solve(n);
  }
  return [];
}

// note that for many quadratic, cubic and quartic polynomials we don't
// actually end up using the quadratic/cubic/quartic formulas in here,
// since there is a chance we factored the polynomial and in so
// doing we found some solutions and lowered the degree.
function mini_solve(coefficients: U[]): U[] {
  const n = coefficients.length;

  // AX + B, X = -B/A
  if (n === 2) {
    //console.log "mini_solve >>>>>>>>> 1st degree"
    const A = coefficients.pop();
    const B = coefficients.pop();
    return _mini_solve2Coeffs(A, B);
  }

  // AX^2 + BX + C, X = (-B +/- (B^2 - 4AC)^(1/2)) / (2A)
  if (n === 3) {
    //console.log "mini_solve >>>>>>>>> 2nd degree"
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    return _mini_solve3Coeffs(A, B, C);
  }

  if (n === 4) {
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    const D = coefficients.pop();
    return _mini_solve4Coeffs(A, B, C, D);
  }

  // See http://www.sscc.edu/home/jdavidso/Math/Catalog/Polynomials/Fourth/Fourth.html
  // for a description of general shapes and properties of fourth degree polynomials
  if (n === 5) {
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    const D = coefficients.pop();
    const E = coefficients.pop();
    return _mini_solve5Coeffs(A, B, C, D, E);
  }

  return [];
}

function _mini_solve2Coeffs(A: U, B: U): U[] {
  return [negate(divide(B, A))];
}

function _mini_solve3Coeffs(A: U, B: U, C: U): U[] {
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

function _mini_solve4Coeffs(A: U, B: U, C: U, D: U): U[] {
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

  const R_m4_a_c3 = multiply(integer(-4), multiply(A, R_c3));

  const R_m9_a_b_c = negate(multiply(R_a_b_c, integer(9)));

  const R_18_a_b_c_d = multiply(R_a_b_c_d, integer(18));

  let R_DELTA0 = subtract(R_b2, R_3_a_c);

  const R_b2_c2 = multiply(R_b2, R_c2);

  const R_m_b_over_3a = divide(negate(B), R_3_a);

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
  const R_determinant = absValFloat(
    simplify(
      add_all([R_18_a_b_c_d, R_m4_b3_d, R_b2_c2, R_m4_a_c3, R_m27_a2_d2])
    )
  );
  if (DEBUG) {
    console.log(`cubic: DETERMINANT: ${R_determinant}`);
  }

  // R_DELTA1
  const R_DELTA1 = add_all([R_2_b3, R_m9_a_b_c, R_27_a2_d]);
  if (DEBUG) {
    console.log(`cubic: D1: ${R_DELTA1}`);
  }

  // R_Q
  let R_Q = simplify(
    power(subtract(power(R_DELTA1, integer(2)), R_4_DELTA03), rational(1, 2))
  );

  const results = [];
  if (isZeroAtomOrTensor(R_determinant)) {
    const data = {
      R_DELTA0_toBeCheckedIfZero,
      R_m_b_over_3a,
      R_DELTA0,
      R_b3,
      R_a_b_c,
    };
    return _mini_solve4CoeffsZeroRDeterminant(A, B, C, D, data);
  }

  let C_CHECKED_AS_NOT_ZERO = false;
  let flipSignOFQSoCIsNotZero = false;

  let R_C: U;
  // C will go as denominator, we have to check
  // that is not zero
  while (!C_CHECKED_AS_NOT_ZERO) {
    // R_C
    const arg1 = flipSignOFQSoCIsNotZero ? negate(R_Q) : R_Q;
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

  const R_6_a_C = multiply(multiply(R_C, R_3_a), integer(2));

  // imaginary parts calculations
  const i_sqrt3 = multiply(
    Constants.imaginaryunit,
    power(integer(3), rational(1, 2))
  );
  const one_plus_i_sqrt3 = add(Constants.one, i_sqrt3);
  const one_minus_i_sqrt3 = subtract(Constants.one, i_sqrt3);
  const R_C_over_3a = divide(R_C, R_3_a);

  // first solution
  const firstSolTerm1 = R_m_b_over_3a;
  const firstSolTerm2 = negate(R_C_over_3a);
  const firstSolTerm3 = negate(divide(R_DELTA0, multiply(R_C, R_3_a)));
  const firstSolution = simplify(
    add_all([firstSolTerm1, firstSolTerm2, firstSolTerm3])
  );

  // second solution
  const secondSolTerm1 = R_m_b_over_3a;
  const secondSolTerm2 = divide(
    multiply(R_C_over_3a, one_plus_i_sqrt3),
    integer(2)
  );
  const secondSolTerm3 = divide(multiply(one_minus_i_sqrt3, R_DELTA0), R_6_a_C);
  const secondSolution = simplify(
    add_all([secondSolTerm1, secondSolTerm2, secondSolTerm3])
  );

  // third solution
  const thirdSolTerm1 = R_m_b_over_3a;
  const thirdSolTerm2 = divide(
    multiply(R_C_over_3a, one_minus_i_sqrt3),
    integer(2)
  );
  const thirdSolTerm3 = divide(multiply(one_plus_i_sqrt3, R_DELTA0), R_6_a_C);
  const thirdSolution = simplify(
    add_all([thirdSolTerm1, thirdSolTerm2, thirdSolTerm3])
  );

  return [firstSolution, secondSolution, thirdSolution];
}

interface CommonArgs4ZeroRDeterminant {
  R_DELTA0_toBeCheckedIfZero: U;
  R_m_b_over_3a: U;
  R_DELTA0: U;
  R_b3: U;
  R_a_b_c: U;
}

function _mini_solve4CoeffsZeroRDeterminant(
  A: U,
  B: U,
  C: U,
  D: U,
  common: CommonArgs4ZeroRDeterminant
): U[] {
  const {
    R_DELTA0_toBeCheckedIfZero,
    R_m_b_over_3a,
    R_DELTA0,
    R_b3,
    R_a_b_c,
  } = common;
  if (isZeroAtomOrTensor(R_DELTA0_toBeCheckedIfZero)) {
    if (DEBUG) console.log(' cubic: DETERMINANT IS ZERO and delta0 is zero');
    return [R_m_b_over_3a]; // just same solution three times
  }
  if (DEBUG) {
    console.log(' cubic: DETERMINANT IS ZERO and delta0 is not zero');
  }
  const rootSolution = divide(
    subtract(multiply(A, multiply(D, integer(9))), multiply(B, C)),
    multiply(R_DELTA0, integer(2))
  );

  // second solution here

  // -9*b^3
  const numer_term1 = negate(R_b3);
  // -9a*a*d
  const numer_term2 = negate(multiply(A, multiply(A, multiply(D, integer(9)))));
  // 4*a*b*c
  const numer_term3 = multiply(R_a_b_c, integer(4));

  // build the fraction
  // numerator: sum the three terms
  // denominator: a*delta0
  const secondSolution = divide(
    add_all([numer_term3, numer_term2, numer_term1]),
    multiply(A, R_DELTA0)
  );

  return [rootSolution, rootSolution, secondSolution];
}

function _mini_solve5Coeffs(A: U, B: U, C: U, D: U, E: U): U[] {
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
    return _mini_solve5CoeffsBiquadratic(A, B, C, D, E);
  }

  if (!isZeroAtomOrTensor(B)) {
    return _mini_solve5CoeffsNonzeroB(A, B, C, D, E);
  } else {
    return _mini_solve5CoeffsZeroB(A, B, C, D, E);
  }
}

function _mini_solve5CoeffsBiquadratic(A: U, B: U, C: U, D: U, E: U): U[] {
  if (DEBUG) {
    console.log('biquadratic case');
  }

  const biquadraticSolutions = roots(
    add(
      multiply(A, power(symbol(SECRETX), integer(2))),
      add(multiply(C, symbol(SECRETX)), E)
    ),
    symbol(SECRETX)
  )[0] as Tensor;

  const results = [];
  for (const eachSolution of Array.from(biquadraticSolutions.tensor.elem)) {
    results.push(simplify(power(eachSolution, rational(1, 2))));
    results.push(simplify(negate(power(eachSolution, rational(1, 2)))));
  }

  return results;
}

function _mini_solve5CoeffsZeroB(A: U, B: U, C: U, D: U, E: U): U[] {
  const R_p = C;
  const R_q = D;
  const R_r = E;

  // Ferrari's solution
  // https://en.wikipedia.org/wiki/Quartic_function#Ferrari.27s_solution
  // finding the "m" in the depressed equation
  const coeff2 = multiply(rational(5, 2), R_p);
  const coeff3 = subtract(multiply(integer(2), power(R_p, integer(2))), R_r);
  const coeff4 = add(
    multiply(rational(-1, 2), multiply(R_p, R_r)),
    add(
      divide(power(R_p, integer(3)), integer(2)),
      multiply(rational(-1, 8), power(R_q, integer(2)))
    )
  );

  const arg1 = add(
    power(symbol(SECRETX), integer(3)),
    add(
      multiply(coeff2, power(symbol(SECRETX), integer(2))),
      add(multiply(coeff3, symbol(SECRETX)), coeff4)
    )
  );

  if (DEBUG) {
    console.log(`resolventCubic: ${top()}`);
  }

  const resolventCubicSolutions = roots(arg1, symbol(SECRETX))[0] as Tensor;
  if (DEBUG) {
    console.log(`resolventCubicSolutions: ${resolventCubicSolutions}`);
  }

  let R_m = null;
  //R_m = resolventCubicSolutions.tensor.elem[1]
  for (const eachSolution of resolventCubicSolutions.tensor.elem) {
    if (DEBUG) {
      console.log(`examining solution: ${eachSolution}`);
    }

    const toBeCheckedIfZero = absValFloat(
      add(multiply(eachSolution, integer(2)), R_p)
    );
    if (DEBUG) {
      console.log(`abs value is: ${eachSolution}`);
    }
    if (!isZeroAtomOrTensor(toBeCheckedIfZero)) {
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

  const twoQOversqrtPPlus2M = simplify(
    divide(multiply(R_q, integer(2)), sqrtPPlus2M)
  );

  const threePPlus2M = add(
    multiply(R_p, integer(3)),
    multiply(R_m, integer(2))
  );

  // solution1
  let arg2 = simplify(
    power(negate(add(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution1 = divide(add(sqrtPPlus2M, arg2), integer(2));

  // solution2
  arg2 = simplify(
    power(negate(add(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution2 = divide(subtract(sqrtPPlus2M, arg2), integer(2));

  // solution3
  arg2 = simplify(
    power(negate(subtract(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution3 = divide(add(negate(sqrtPPlus2M), arg2), integer(2));

  // solution4
  arg2 = simplify(
    power(negate(subtract(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution4 = divide(subtract(negate(sqrtPPlus2M), arg2), integer(2));

  return [solution1, solution2, solution3, solution4];
}

function _mini_solve5CoeffsNonzeroB(A: U, B: U, C: U, D: U, E: U): U[] {
  if (DEBUG) {
    console.log(`tos 2 ${defs.tos}`);
  }

  const R_p = divide(
    add(
      multiply(integer(8), multiply(C, A)),
      multiply(integer(-3), power(B, integer(2)))
    ),
    multiply(integer(8), power(A, integer(2)))
  );

  if (DEBUG) {
    console.log(`p for depressed quartic: ${R_p}`);
  }

  const R_q = divide(
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
    console.log(`q for depressed quartic: ${R_q}`);
  }

  const R_a3 = multiply(multiply(A, A), A);
  const R_b2 = multiply(B, B);
  const R_a2_d = multiply(multiply(A, A), D);

  // convert to depressed quartic
  let R_r = divide(
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
    console.log(`r for depressed quartic: ${R_r}`);
    console.log(`tos 4 ${defs.tos}`);
  }

  const four_x_4 = power(symbol(SECRETX), integer(4));
  if (DEBUG) {
    console.log(`4 * x^4: ${four_x_4}`);
  }

  const r_q_x_2 = multiply(R_p, power(symbol(SECRETX), integer(2)));
  if (DEBUG) {
    console.log(`R_p * x^2: ${r_q_x_2}`);
  }

  const r_q_x = multiply(R_q, symbol(SECRETX));
  if (DEBUG) {
    console.log(`R_q * x: ${r_q_x}`);
    console.log(`R_r: ${R_r}`);
  }

  const arg1 = simplify(add_all([four_x_4, r_q_x_2, r_q_x, R_r]));
  if (DEBUG) {
    console.log(`solving depressed quartic: ${arg1}`);
  }

  const depressedSolutions = roots(arg1, symbol(SECRETX))[0] as Tensor;
  if (DEBUG) {
    console.log(`depressedSolutions: ${depressedSolutions}`);
  }

  return depressedSolutions.tensor.elem.map((sol) => {
    const result = simplify(subtract(sol, divide(B, multiply(integer(4), A))));
    if (DEBUG) {
      console.log(`solution from depressed: ${result}`);
    }
    return result;
  });
}
