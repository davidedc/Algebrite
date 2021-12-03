import { loadavg } from 'os';
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
import { pop, push, push_all, top } from '../runtime/stack';
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

const log = {
  debug: (str: string) => {
    if (DEBUG) {
      console.log(str);
    }
  },
};

const flatten = (arr: any[]) => [].concat(...arr);

//define POLY p1
//define X p2
//define A p3
//define B p4
//define C p5
//define Y p6

export function Eval_roots(POLY: U) {
  // A == B -> A - B
  let X = cadr(POLY);
  let POLY1: U;
  if (car(X) === symbol(SETQ) || car(X) === symbol(TESTEQ)) {
    POLY1 = subtract(Eval(cadr(X)), Eval(caddr(X)));
  } else {
    X = Eval(X);
    if (car(X) === symbol(SETQ) || car(X) === symbol(TESTEQ)) {
      POLY1 = subtract(Eval(cadr(X)), Eval(caddr(X)));
    } else {
      POLY1 = X;
    }
  }

  // 2nd arg, x
  X = Eval(caddr(POLY));

  const X1 = X === symbol(NIL) ? guess(POLY1) : X;

  if (!ispolyexpandedform(POLY1, X1)) {
    stop('roots: 1st argument is not a polynomial in the variable ' + X1);
  }

  push_all(roots(POLY1, X1));
}

function hasImaginaryCoeff(k: U[]): boolean {
  return k.some((c) => iscomplexnumber(c));
}

// polycoeff = tos
// k[0]      Coefficient of x^0
// k[n-1]    Coefficient of x^(n-1)
function isSimpleRoot(k: U[]): boolean {
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
  const divideBy = miniStack[miniStack.length - 1];
  return miniStack.map((item) => divide(item, divideBy));
}

export function roots(POLY: U, X: U): (U | Tensor)[] {
  // the simplification of nested radicals uses "roots", which in turn uses
  // simplification of nested radicals. Usually there is no problem, one level
  // of recursion does the job. Beyond that, we probably got stuck in a
  // strange case of infinite recursion, so bail out and return NIL.
  if (defs.recursionLevelNestedRadicalsRemoval > 1) {
    return [symbol(NIL)];
  }

  log.debug(`checking if ${top()} is a case of simple roots`);

  const k = normalisedCoeff(POLY, X);

  const results = [];
  if (isSimpleRoot(k)) {
    log.debug(`yes, ${k[k.length - 1]} is a case of simple roots`);
    const kn = k.length;
    const lastCoeff = k[0];
    const leadingCoeff = k.pop();
    const simpleRoots = getSimpleRoots(kn, leadingCoeff, lastCoeff);
    results.push(...simpleRoots);
  } else {
    const roots = roots2(POLY, X);
    results.push(...roots);
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
  log.debug('getSimpleRoots');

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
    const A = coefficients.pop();
    const B = coefficients.pop();
    return _solveDegree1(A, B);
  }

  // AX^2 + BX + C, X = (-B +/- (B^2 - 4AC)^(1/2)) / (2A)
  if (n === 3) {
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    return _solveDegree2(A, B, C);
  }

  if (n === 4) {
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    const D = coefficients.pop();
    return _solveDegree3(A, B, C, D);
  }

  // See http://www.sscc.edu/home/jdavidso/Math/Catalog/Polynomials/Fourth/Fourth.html
  // for a description of general shapes and properties of fourth degree polynomials
  if (n === 5) {
    const A = coefficients.pop();
    const B = coefficients.pop();
    const C = coefficients.pop();
    const D = coefficients.pop();
    const E = coefficients.pop();
    return _solveDegree4(A, B, C, D, E);
  }

  return [];
}

function _solveDegree1(A: U, B: U): U[] {
  return [negate(divide(B, A))];
}

function _solveDegree2(A: U, B: U, C: U): U[] {
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

function _solveDegree3(A: U, B: U, C: U, D: U): U[] {
  // C - only related calculations
  const R_c3 = multiply(multiply(C, C), C);

  // B - only related calculations
  const R_b2 = multiply(B, B);

  const R_b3 = multiply(R_b2, B);

  const R_m4_b3_d = multiply(multiply(R_b3, D), integer(-4));

  const R_2_b3 = multiply(R_b3, integer(2));

  // A - only related calculations
  const R_3_a = multiply(integer(3), A);

  const R_a2_d = multiply(multiply(A, A), D);

  const R_27_a2_d = multiply(R_a2_d, integer(27));

  const R_m27_a2_d2 = multiply(multiply(R_a2_d, D), integer(-27));

  // mixed calculations
  const R_a_b_c = multiply(multiply(A, C), B);

  const R_3_a_c = multiply(multiply(A, C), integer(3));

  const R_m4_a_c3 = multiply(integer(-4), multiply(A, R_c3));

  const R_m9_a_b_c = negate(multiply(R_a_b_c, integer(9)));

  const R_18_a_b_c_d = multiply(multiply(R_a_b_c, D), integer(18));

  const R_DELTA0 = subtract(R_b2, R_3_a_c);

  const R_b2_c2 = multiply(R_b2, multiply(C, C));

  const R_m_b_over_3a = divide(negate(B), R_3_a);

  const R_4_DELTA03 = multiply(power(R_DELTA0, integer(3)), integer(4));

  const R_DELTA0_toBeCheckedIfZero = absValFloat(simplify(R_DELTA0));

  const R_determinant = absValFloat(
    simplify(
      add_all([R_18_a_b_c_d, R_m4_b3_d, R_b2_c2, R_m4_a_c3, R_m27_a2_d2])
    )
  );
  const R_DELTA1 = add_all([R_2_b3, R_m9_a_b_c, R_27_a2_d]);
  const R_Q = simplify(
    power(subtract(power(R_DELTA1, integer(2)), R_4_DELTA03), rational(1, 2))
  );

  log.debug('>>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< ');
  log.debug(`cubic: D0: ${R_DELTA0}`);
  log.debug(`cubic: D0 as float: ${R_DELTA0_toBeCheckedIfZero}`);
  log.debug(`cubic: DETERMINANT: ${R_determinant}`);
  log.debug(`cubic: D1: ${R_DELTA1}`);

  if (isZeroAtomOrTensor(R_determinant)) {
    const data = {
      R_DELTA0_toBeCheckedIfZero,
      R_m_b_over_3a,
      R_DELTA0,
      R_b3,
      R_a_b_c,
    };
    return _solveDegree3ZeroRDeterminant(A, B, C, D, data);
  }

  let C_CHECKED_AS_NOT_ZERO = false;
  let flipSignOFQSoCIsNotZero = false;

  let R_C: U;
  // C will go as denominator, we have to check that is not zero
  while (!C_CHECKED_AS_NOT_ZERO) {
    const arg1 = flipSignOFQSoCIsNotZero ? negate(R_Q) : R_Q;
    R_C = simplify(
      power(multiply(add(arg1, R_DELTA1), rational(1, 2)), rational(1, 3))
    );
    const R_C_simplified_toCheckIfZero = absValFloat(simplify(R_C));

    log.debug(`cubic: C: ${R_C}`);
    log.debug(`cubic: C as absval and float: ${R_C_simplified_toCheckIfZero}`);

    if (isZeroAtomOrTensor(R_C_simplified_toCheckIfZero)) {
      log.debug(' cubic: C IS ZERO flipping the sign');
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

function _solveDegree3ZeroRDeterminant(
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
    log.debug(' cubic: DETERMINANT IS ZERO and delta0 is zero');
    return [R_m_b_over_3a]; // just same solution three times
  }
  log.debug(' cubic: DETERMINANT IS ZERO and delta0 is not zero');

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

function _solveDegree4(A: U, B: U, C: U, D: U, E: U): U[] {
  log.debug('>>>>>>>>>>>>>>>> actually using quartic formula <<<<<<<<<<<<<<< ');

  if (
    isZeroAtomOrTensor(B) &&
    isZeroAtomOrTensor(D) &&
    !isZeroAtomOrTensor(C) &&
    !isZeroAtomOrTensor(E)
  ) {
    return _solveDegree4Biquadratic(A, B, C, D, E);
  }

  if (!isZeroAtomOrTensor(B)) {
    return _solveDegree4NonzeroB(A, B, C, D, E);
  } else {
    return _solveDegree4ZeroB(A, B, C, D, E);
  }
}

function _solveDegree4Biquadratic(A: U, B: U, C: U, D: U, E: U): U[] {
  log.debug('biquadratic case');

  const biquadraticSolutions = roots(
    add(
      multiply(A, power(symbol(SECRETX), integer(2))),
      add(multiply(C, symbol(SECRETX)), E)
    ),
    symbol(SECRETX)
  )[0] as Tensor;

  const results = [];
  for (const sol of biquadraticSolutions.tensor.elem) {
    results.push(simplify(power(sol, rational(1, 2))));
    results.push(simplify(negate(power(sol, rational(1, 2)))));
  }

  return results;
}

function _solveDegree4ZeroB(A: U, B: U, C: U, D: U, E: U): U[] {
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

  log.debug(`resolventCubic: ${top()}`);

  const resolventCubicSolutions = roots(arg1, symbol(SECRETX))[0] as Tensor;
  log.debug(`resolventCubicSolutions: ${resolventCubicSolutions}`);

  let R_m = null;
  //R_m = resolventCubicSolutions.tensor.elem[1]
  for (const sol of resolventCubicSolutions.tensor.elem) {
    log.debug(`examining solution: ${sol}`);

    const toBeCheckedIfZero = absValFloat(add(multiply(sol, integer(2)), R_p));
    log.debug(`abs value is: ${sol}`);

    if (!isZeroAtomOrTensor(toBeCheckedIfZero)) {
      R_m = sol;
      break;
    }
  }

  log.debug(`chosen solution: ${R_m}`);

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
  const sol1Arg = simplify(
    power(negate(add(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution1 = divide(add(sqrtPPlus2M, sol1Arg), integer(2));

  // solution2
  const sol2Arg = simplify(
    power(negate(add(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution2 = divide(subtract(sqrtPPlus2M, sol2Arg), integer(2));

  // solution3
  const sol3Arg = simplify(
    power(negate(subtract(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution3 = divide(add(negate(sqrtPPlus2M), sol3Arg), integer(2));

  // solution4
  const sol4Arg = simplify(
    power(negate(subtract(threePPlus2M, twoQOversqrtPPlus2M)), rational(1, 2))
  );
  const solution4 = divide(subtract(negate(sqrtPPlus2M), sol4Arg), integer(2));

  return [solution1, solution2, solution3, solution4];
}

function _solveDegree4NonzeroB(A: U, B: U, C: U, D: U, E: U): U[] {
  const R_p = divide(
    add(
      multiply(integer(8), multiply(C, A)),
      multiply(integer(-3), power(B, integer(2)))
    ),
    multiply(integer(8), power(A, integer(2)))
  );
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
  const four_x_4 = power(symbol(SECRETX), integer(4));
  const r_q_x_2 = multiply(R_p, power(symbol(SECRETX), integer(2)));
  const r_q_x = multiply(R_q, symbol(SECRETX));
  const simplified = simplify(add_all([four_x_4, r_q_x_2, r_q_x, R_r]));
  const depressedSolutions = roots(simplified, symbol(SECRETX))[0] as Tensor;

  log.debug(`p for depressed quartic: ${R_p}`);
  log.debug(`q for depressed quartic: ${R_q}`);
  log.debug(`r for depressed quartic: ${R_r}`);
  log.debug(`tos 4 ${defs.tos}`);
  log.debug(`4 * x^4: ${four_x_4}`);
  log.debug(`R_p * x^2: ${r_q_x_2}`);
  log.debug(`R_q * x: ${r_q_x}`);
  log.debug(`R_r: ${R_r}`);
  log.debug(`solving depressed quartic: ${simplified}`);
  log.debug(`depressedSolutions: ${depressedSolutions}`);

  return depressedSolutions.tensor.elem.map((sol) => {
    const result = simplify(subtract(sol, divide(B, multiply(integer(4), A))));
    log.debug(`solution from depressed: ${result}`);
    return result;
  });
}
