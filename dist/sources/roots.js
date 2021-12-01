"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roots = exports.Eval_roots = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const abs_1 = require("./abs");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const coeff_1 = require("./coeff");
const eval_1 = require("./eval");
const factorpoly_1 = require("./factorpoly");
const guess_1 = require("./guess");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const simplify_1 = require("./simplify");
const log = {
    debug: (str) => {
        if (defs_1.DEBUG) {
            console.log(str);
        }
    },
};
const flatten = (arr) => [].concat(...arr);
//define POLY p1
//define X p2
//define A p3
//define B p4
//define C p5
//define Y p6
function Eval_roots(POLY) {
    // A == B -> A - B
    let X = defs_1.cadr(POLY);
    let POLY1;
    if (defs_1.car(X) === defs_1.symbol(defs_1.SETQ) || defs_1.car(X) === defs_1.symbol(defs_1.TESTEQ)) {
        POLY1 = add_1.subtract(eval_1.Eval(defs_1.cadr(X)), eval_1.Eval(defs_1.caddr(X)));
    }
    else {
        X = eval_1.Eval(X);
        if (defs_1.car(X) === defs_1.symbol(defs_1.SETQ) || defs_1.car(X) === defs_1.symbol(defs_1.TESTEQ)) {
            POLY1 = add_1.subtract(eval_1.Eval(defs_1.cadr(X)), eval_1.Eval(defs_1.caddr(X)));
        }
        else {
            POLY1 = X;
        }
    }
    // 2nd arg, x
    X = eval_1.Eval(defs_1.caddr(POLY));
    const X1 = X === defs_1.symbol(defs_1.NIL) ? guess_1.guess(POLY1) : X;
    if (!is_1.ispolyexpandedform(POLY1, X1)) {
        run_1.stop('roots: 1st argument is not a polynomial in the variable ' + X1);
    }
    stack_1.push_all(roots(POLY1, X1));
}
exports.Eval_roots = Eval_roots;
function hasImaginaryCoeff(k) {
    return k.some((c) => is_1.iscomplexnumber(c));
}
// polycoeff = tos
// k[0]      Coefficient of x^0
// k[n-1]    Coefficient of x^(n-1)
function isSimpleRoot(k) {
    if (k.length <= 2) {
        return false;
    }
    if (is_1.isZeroAtomOrTensor(k[0])) {
        return false;
    }
    return k.slice(1, k.length - 1).every((el) => is_1.isZeroAtomOrTensor(el));
}
function normalisedCoeff(poly, x) {
    const miniStack = coeff_1.coeff(poly, x);
    const divideBy = miniStack[miniStack.length - 1];
    return miniStack.map((item) => multiply_1.divide(item, divideBy));
}
function roots(POLY, X) {
    // the simplification of nested radicals uses "roots", which in turn uses
    // simplification of nested radicals. Usually there is no problem, one level
    // of recursion does the job. Beyond that, we probably got stuck in a
    // strange case of infinite recursion, so bail out and return NIL.
    if (defs_1.defs.recursionLevelNestedRadicalsRemoval > 1) {
        return [defs_1.symbol(defs_1.NIL)];
    }
    log.debug(`checking if ${stack_1.top()} is a case of simple roots`);
    const k = normalisedCoeff(POLY, X);
    const results = [];
    if (isSimpleRoot(k)) {
        log.debug(`yes, ${k[k.length - 1]} is a case of simple roots`);
        const kn = k.length;
        const lastCoeff = k[0];
        const leadingCoeff = k.pop();
        const simpleRoots = getSimpleRoots(kn, leadingCoeff, lastCoeff);
        results.push(...simpleRoots);
    }
    else {
        const roots = roots2(POLY, X);
        results.push(...roots);
    }
    const n = results.length;
    if (n === 0) {
        run_1.stop('roots: the polynomial is not factorable, try nroots');
    }
    if (n === 1) {
        return results;
    }
    misc_1.sort(results);
    POLY = alloc_1.alloc_tensor(n);
    POLY.tensor.ndim = 1;
    POLY.tensor.dim[0] = n;
    for (let i = 0; i < n; i++) {
        POLY.tensor.elem[i] = results[i];
    }
    return [POLY];
}
exports.roots = roots;
// ok to generate these roots take a look at their form
// in the case of even and odd exponents here:
// http://www.wolframalpha.com/input/?i=roots+x%5E14+%2B+1
// http://www.wolframalpha.com/input/?i=roots+ax%5E14+%2B+b
// http://www.wolframalpha.com/input/?i=roots+x%5E15+%2B+1
// http://www.wolframalpha.com/input/?i=roots+a*x%5E15+%2B+b
// leadingCoeff    Coefficient of x^0
// lastCoeff       Coefficient of x^(n-1)
function getSimpleRoots(n, leadingCoeff, lastCoeff) {
    log.debug('getSimpleRoots');
    n = n - 1;
    const commonPart = multiply_1.divide(power_1.power(lastCoeff, bignum_1.rational(1, n)), power_1.power(leadingCoeff, bignum_1.rational(1, n)));
    const results = [];
    if (n % 2 === 0) {
        for (let i = 1; i <= n; i += 2) {
            const aSol = multiply_1.multiply(commonPart, power_1.power(defs_1.Constants.negOne, bignum_1.rational(i, n)));
            results.push(aSol);
            results.push(multiply_1.negate(aSol));
        }
        return results;
    }
    for (let i = 1; i <= n; i++) {
        let sol = multiply_1.multiply(commonPart, power_1.power(defs_1.Constants.negOne, bignum_1.rational(i, n)));
        if (i % 2 === 0) {
            sol = multiply_1.negate(sol);
        }
        results.push(sol);
    }
    return results;
}
function roots2(POLY, X) {
    const k = normalisedCoeff(POLY, X);
    if (!hasImaginaryCoeff(k)) {
        POLY = factorpoly_1.factorpoly(POLY, X);
    }
    if (defs_1.ismultiply(POLY)) {
        // scan through all the factors and find the roots of each of them
        const mapped = POLY.tail().map((p) => roots3(p, X));
        return flatten(mapped);
    }
    return roots3(POLY, X);
}
function roots3(POLY, X) {
    if (defs_1.ispower(POLY) &&
        is_1.ispolyexpandedform(defs_1.cadr(POLY), X) &&
        is_1.isposint(defs_1.caddr(POLY))) {
        const n = normalisedCoeff(defs_1.cadr(POLY), X);
        return mini_solve(n);
    }
    if (is_1.ispolyexpandedform(POLY, X)) {
        const n = normalisedCoeff(POLY, X);
        return mini_solve(n);
    }
    return [];
}
// note that for many quadratic, cubic and quartic polynomials we don't
// actually end up using the quadratic/cubic/quartic formulas in here,
// since there is a chance we factored the polynomial and in so
// doing we found some solutions and lowered the degree.
function mini_solve(coefficients) {
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
function _solveDegree1(A, B) {
    return [multiply_1.negate(multiply_1.divide(B, A))];
}
function _solveDegree2(A, B, C) {
    // (B^2 - 4AC)^(1/2)
    const p6 = power_1.power(
    // prettier-ignore
    add_1.subtract(power_1.power(B, bignum_1.integer(2)), multiply_1.multiply(multiply_1.multiply(bignum_1.integer(4), A), C)), bignum_1.rational(1, 2));
    // ((B^2 - 4AC)^(1/2) - B)/ (2A)
    const result1 = multiply_1.divide(add_1.subtract(p6, B), multiply_1.multiply(A, bignum_1.integer(2)));
    // 1/2 * -(B + (B^2 - 4AC)^(1/2)) / A
    const result2 = multiply_1.multiply(multiply_1.divide(multiply_1.negate(add_1.add(p6, B)), A), bignum_1.rational(1, 2));
    return [result1, result2];
}
function _solveDegree3(A, B, C, D) {
    // C - only related calculations
    const R_c3 = multiply_1.multiply(multiply_1.multiply(C, C), C);
    // B - only related calculations
    const R_b2 = multiply_1.multiply(B, B);
    const R_b3 = multiply_1.multiply(R_b2, B);
    const R_m4_b3_d = multiply_1.multiply(multiply_1.multiply(R_b3, D), bignum_1.integer(-4));
    const R_2_b3 = multiply_1.multiply(R_b3, bignum_1.integer(2));
    // A - only related calculations
    const R_3_a = multiply_1.multiply(bignum_1.integer(3), A);
    const R_a2_d = multiply_1.multiply(multiply_1.multiply(A, A), D);
    const R_27_a2_d = multiply_1.multiply(R_a2_d, bignum_1.integer(27));
    const R_m27_a2_d2 = multiply_1.multiply(multiply_1.multiply(R_a2_d, D), bignum_1.integer(-27));
    // mixed calculations
    const R_a_b_c = multiply_1.multiply(multiply_1.multiply(A, C), B);
    const R_3_a_c = multiply_1.multiply(multiply_1.multiply(A, C), bignum_1.integer(3));
    const R_m4_a_c3 = multiply_1.multiply(bignum_1.integer(-4), multiply_1.multiply(A, R_c3));
    const R_m9_a_b_c = multiply_1.negate(multiply_1.multiply(R_a_b_c, bignum_1.integer(9)));
    const R_18_a_b_c_d = multiply_1.multiply(multiply_1.multiply(R_a_b_c, D), bignum_1.integer(18));
    const R_DELTA0 = add_1.subtract(R_b2, R_3_a_c);
    const R_b2_c2 = multiply_1.multiply(R_b2, multiply_1.multiply(C, C));
    const R_m_b_over_3a = multiply_1.divide(multiply_1.negate(B), R_3_a);
    const R_4_DELTA03 = multiply_1.multiply(power_1.power(R_DELTA0, bignum_1.integer(3)), bignum_1.integer(4));
    const R_DELTA0_toBeCheckedIfZero = abs_1.absValFloat(simplify_1.simplify(R_DELTA0));
    const R_determinant = abs_1.absValFloat(simplify_1.simplify(add_1.add_all([R_18_a_b_c_d, R_m4_b3_d, R_b2_c2, R_m4_a_c3, R_m27_a2_d2])));
    const R_DELTA1 = add_1.add_all([R_2_b3, R_m9_a_b_c, R_27_a2_d]);
    const R_Q = simplify_1.simplify(power_1.power(add_1.subtract(power_1.power(R_DELTA1, bignum_1.integer(2)), R_4_DELTA03), bignum_1.rational(1, 2)));
    log.debug('>>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< ');
    log.debug(`cubic: D0: ${R_DELTA0}`);
    log.debug(`cubic: D0 as float: ${R_DELTA0_toBeCheckedIfZero}`);
    log.debug(`cubic: DETERMINANT: ${R_determinant}`);
    log.debug(`cubic: D1: ${R_DELTA1}`);
    if (is_1.isZeroAtomOrTensor(R_determinant)) {
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
    let R_C;
    // C will go as denominator, we have to check that is not zero
    while (!C_CHECKED_AS_NOT_ZERO) {
        const arg1 = flipSignOFQSoCIsNotZero ? multiply_1.negate(R_Q) : R_Q;
        R_C = simplify_1.simplify(power_1.power(multiply_1.multiply(add_1.add(arg1, R_DELTA1), bignum_1.rational(1, 2)), bignum_1.rational(1, 3)));
        const R_C_simplified_toCheckIfZero = abs_1.absValFloat(simplify_1.simplify(R_C));
        log.debug(`cubic: C: ${R_C}`);
        log.debug(`cubic: C as absval and float: ${R_C_simplified_toCheckIfZero}`);
        if (is_1.isZeroAtomOrTensor(R_C_simplified_toCheckIfZero)) {
            log.debug(' cubic: C IS ZERO flipping the sign');
            flipSignOFQSoCIsNotZero = true;
        }
        else {
            C_CHECKED_AS_NOT_ZERO = true;
        }
    }
    const R_6_a_C = multiply_1.multiply(multiply_1.multiply(R_C, R_3_a), bignum_1.integer(2));
    // imaginary parts calculations
    const i_sqrt3 = multiply_1.multiply(defs_1.Constants.imaginaryunit, power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
    const one_plus_i_sqrt3 = add_1.add(defs_1.Constants.one, i_sqrt3);
    const one_minus_i_sqrt3 = add_1.subtract(defs_1.Constants.one, i_sqrt3);
    const R_C_over_3a = multiply_1.divide(R_C, R_3_a);
    // first solution
    const firstSolTerm1 = R_m_b_over_3a;
    const firstSolTerm2 = multiply_1.negate(R_C_over_3a);
    const firstSolTerm3 = multiply_1.negate(multiply_1.divide(R_DELTA0, multiply_1.multiply(R_C, R_3_a)));
    const firstSolution = simplify_1.simplify(add_1.add_all([firstSolTerm1, firstSolTerm2, firstSolTerm3]));
    // second solution
    const secondSolTerm1 = R_m_b_over_3a;
    const secondSolTerm2 = multiply_1.divide(multiply_1.multiply(R_C_over_3a, one_plus_i_sqrt3), bignum_1.integer(2));
    const secondSolTerm3 = multiply_1.divide(multiply_1.multiply(one_minus_i_sqrt3, R_DELTA0), R_6_a_C);
    const secondSolution = simplify_1.simplify(add_1.add_all([secondSolTerm1, secondSolTerm2, secondSolTerm3]));
    // third solution
    const thirdSolTerm1 = R_m_b_over_3a;
    const thirdSolTerm2 = multiply_1.divide(multiply_1.multiply(R_C_over_3a, one_minus_i_sqrt3), bignum_1.integer(2));
    const thirdSolTerm3 = multiply_1.divide(multiply_1.multiply(one_plus_i_sqrt3, R_DELTA0), R_6_a_C);
    const thirdSolution = simplify_1.simplify(add_1.add_all([thirdSolTerm1, thirdSolTerm2, thirdSolTerm3]));
    return [firstSolution, secondSolution, thirdSolution];
}
function _solveDegree3ZeroRDeterminant(A, B, C, D, common) {
    const { R_DELTA0_toBeCheckedIfZero, R_m_b_over_3a, R_DELTA0, R_b3, R_a_b_c, } = common;
    if (is_1.isZeroAtomOrTensor(R_DELTA0_toBeCheckedIfZero)) {
        log.debug(' cubic: DETERMINANT IS ZERO and delta0 is zero');
        return [R_m_b_over_3a]; // just same solution three times
    }
    log.debug(' cubic: DETERMINANT IS ZERO and delta0 is not zero');
    const rootSolution = multiply_1.divide(add_1.subtract(multiply_1.multiply(A, multiply_1.multiply(D, bignum_1.integer(9))), multiply_1.multiply(B, C)), multiply_1.multiply(R_DELTA0, bignum_1.integer(2)));
    // second solution here
    // -9*b^3
    const numer_term1 = multiply_1.negate(R_b3);
    // -9a*a*d
    const numer_term2 = multiply_1.negate(multiply_1.multiply(A, multiply_1.multiply(A, multiply_1.multiply(D, bignum_1.integer(9)))));
    // 4*a*b*c
    const numer_term3 = multiply_1.multiply(R_a_b_c, bignum_1.integer(4));
    // build the fraction
    // numerator: sum the three terms
    // denominator: a*delta0
    const secondSolution = multiply_1.divide(add_1.add_all([numer_term3, numer_term2, numer_term1]), multiply_1.multiply(A, R_DELTA0));
    return [rootSolution, rootSolution, secondSolution];
}
function _solveDegree4(A, B, C, D, E) {
    log.debug('>>>>>>>>>>>>>>>> actually using quartic formula <<<<<<<<<<<<<<< ');
    if (is_1.isZeroAtomOrTensor(B) &&
        is_1.isZeroAtomOrTensor(D) &&
        !is_1.isZeroAtomOrTensor(C) &&
        !is_1.isZeroAtomOrTensor(E)) {
        return _solveDegree4Biquadratic(A, B, C, D, E);
    }
    if (!is_1.isZeroAtomOrTensor(B)) {
        return _solveDegree4NonzeroB(A, B, C, D, E);
    }
    else {
        return _solveDegree4ZeroB(A, B, C, D, E);
    }
}
function _solveDegree4Biquadratic(A, B, C, D, E) {
    log.debug('biquadratic case');
    const biquadraticSolutions = roots(add_1.add(multiply_1.multiply(A, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2))), add_1.add(multiply_1.multiply(C, defs_1.symbol(defs_1.SECRETX)), E)), defs_1.symbol(defs_1.SECRETX))[0];
    const results = [];
    for (const sol of biquadraticSolutions.tensor.elem) {
        results.push(simplify_1.simplify(power_1.power(sol, bignum_1.rational(1, 2))));
        results.push(simplify_1.simplify(multiply_1.negate(power_1.power(sol, bignum_1.rational(1, 2)))));
    }
    return results;
}
function _solveDegree4ZeroB(A, B, C, D, E) {
    const R_p = C;
    const R_q = D;
    const R_r = E;
    // Ferrari's solution
    // https://en.wikipedia.org/wiki/Quartic_function#Ferrari.27s_solution
    // finding the "m" in the depressed equation
    const coeff2 = multiply_1.multiply(bignum_1.rational(5, 2), R_p);
    const coeff3 = add_1.subtract(multiply_1.multiply(bignum_1.integer(2), power_1.power(R_p, bignum_1.integer(2))), R_r);
    const coeff4 = add_1.add(multiply_1.multiply(bignum_1.rational(-1, 2), multiply_1.multiply(R_p, R_r)), add_1.add(multiply_1.divide(power_1.power(R_p, bignum_1.integer(3)), bignum_1.integer(2)), multiply_1.multiply(bignum_1.rational(-1, 8), power_1.power(R_q, bignum_1.integer(2)))));
    const arg1 = add_1.add(power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(3)), add_1.add(multiply_1.multiply(coeff2, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2))), add_1.add(multiply_1.multiply(coeff3, defs_1.symbol(defs_1.SECRETX)), coeff4)));
    log.debug(`resolventCubic: ${stack_1.top()}`);
    const resolventCubicSolutions = roots(arg1, defs_1.symbol(defs_1.SECRETX))[0];
    log.debug(`resolventCubicSolutions: ${resolventCubicSolutions}`);
    let R_m = null;
    //R_m = resolventCubicSolutions.tensor.elem[1]
    for (const sol of resolventCubicSolutions.tensor.elem) {
        log.debug(`examining solution: ${sol}`);
        const toBeCheckedIfZero = abs_1.absValFloat(add_1.add(multiply_1.multiply(sol, bignum_1.integer(2)), R_p));
        log.debug(`abs value is: ${sol}`);
        if (!is_1.isZeroAtomOrTensor(toBeCheckedIfZero)) {
            R_m = sol;
            break;
        }
    }
    log.debug(`chosen solution: ${R_m}`);
    const sqrtPPlus2M = simplify_1.simplify(power_1.power(add_1.add(multiply_1.multiply(R_m, bignum_1.integer(2)), R_p), bignum_1.rational(1, 2)));
    const twoQOversqrtPPlus2M = simplify_1.simplify(multiply_1.divide(multiply_1.multiply(R_q, bignum_1.integer(2)), sqrtPPlus2M));
    const threePPlus2M = add_1.add(multiply_1.multiply(R_p, bignum_1.integer(3)), multiply_1.multiply(R_m, bignum_1.integer(2)));
    // solution1
    const sol1Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.add(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
    const solution1 = multiply_1.divide(add_1.add(sqrtPPlus2M, sol1Arg), bignum_1.integer(2));
    // solution2
    const sol2Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.add(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
    const solution2 = multiply_1.divide(add_1.subtract(sqrtPPlus2M, sol2Arg), bignum_1.integer(2));
    // solution3
    const sol3Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.subtract(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
    const solution3 = multiply_1.divide(add_1.add(multiply_1.negate(sqrtPPlus2M), sol3Arg), bignum_1.integer(2));
    // solution4
    const sol4Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.subtract(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
    const solution4 = multiply_1.divide(add_1.subtract(multiply_1.negate(sqrtPPlus2M), sol4Arg), bignum_1.integer(2));
    return [solution1, solution2, solution3, solution4];
}
function _solveDegree4NonzeroB(A, B, C, D, E) {
    const R_p = multiply_1.divide(add_1.add(multiply_1.multiply(bignum_1.integer(8), multiply_1.multiply(C, A)), multiply_1.multiply(bignum_1.integer(-3), power_1.power(B, bignum_1.integer(2)))), multiply_1.multiply(bignum_1.integer(8), power_1.power(A, bignum_1.integer(2))));
    const R_q = multiply_1.divide(add_1.add(power_1.power(B, bignum_1.integer(3)), add_1.add(multiply_1.multiply(bignum_1.integer(-4), multiply_1.multiply(A, multiply_1.multiply(B, C))), multiply_1.multiply(bignum_1.integer(8), multiply_1.multiply(D, power_1.power(A, bignum_1.integer(2)))))), multiply_1.multiply(bignum_1.integer(8), power_1.power(A, bignum_1.integer(3))));
    const R_a3 = multiply_1.multiply(multiply_1.multiply(A, A), A);
    const R_b2 = multiply_1.multiply(B, B);
    const R_a2_d = multiply_1.multiply(multiply_1.multiply(A, A), D);
    // convert to depressed quartic
    let R_r = multiply_1.divide(add_1.add(multiply_1.multiply(power_1.power(B, bignum_1.integer(4)), bignum_1.integer(-3)), add_1.add(multiply_1.multiply(bignum_1.integer(256), multiply_1.multiply(R_a3, E)), add_1.add(multiply_1.multiply(bignum_1.integer(-64), multiply_1.multiply(R_a2_d, B)), multiply_1.multiply(bignum_1.integer(16), multiply_1.multiply(R_b2, multiply_1.multiply(A, C)))))), multiply_1.multiply(bignum_1.integer(256), power_1.power(A, bignum_1.integer(4))));
    const four_x_4 = power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(4));
    const r_q_x_2 = multiply_1.multiply(R_p, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2)));
    const r_q_x = multiply_1.multiply(R_q, defs_1.symbol(defs_1.SECRETX));
    const simplified = simplify_1.simplify(add_1.add_all([four_x_4, r_q_x_2, r_q_x, R_r]));
    const depressedSolutions = roots(simplified, defs_1.symbol(defs_1.SECRETX))[0];
    log.debug(`p for depressed quartic: ${R_p}`);
    log.debug(`q for depressed quartic: ${R_q}`);
    log.debug(`r for depressed quartic: ${R_r}`);
    log.debug(`tos 4 ${defs_1.defs.tos}`);
    log.debug(`4 * x^4: ${four_x_4}`);
    log.debug(`R_p * x^2: ${r_q_x_2}`);
    log.debug(`R_q * x: ${r_q_x}`);
    log.debug(`R_r: ${R_r}`);
    log.debug(`solving depressed quartic: ${simplified}`);
    log.debug(`depressedSolutions: ${depressedSolutions}`);
    return depressedSolutions.tensor.elem.map((sol) => {
        const result = simplify_1.simplify(add_1.subtract(sol, multiply_1.divide(B, multiply_1.multiply(bignum_1.integer(4), A))));
        log.debug(`solution from depressed: ${result}`);
        return result;
    });
}
