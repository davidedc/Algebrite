import { alloc_tensor } from '../runtime/alloc';
import { count, countOccurrencesOfSymbol } from '../runtime/count';
import {
  ADD,
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  COS,
  DEBUG,
  defs,
  do_simplify_nested_radicals,
  FACTORIAL,
  FUNCTION,
  INTEGRAL,
  isadd,
  iscons,
  isinnerordot,
  ismultiply,
  ispower,
  istensor,
  MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES,
  MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE,
  METAA,
  METAB,
  METAX,
  MULTIPLY,
  NIL,
  noexpand,
  POWER,
  SECRETX,
  SIN,
  Tensor,
  TRANSPOSE,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { get_binding, symbol } from '../runtime/symbol';
import { equal, length } from '../sources/misc';
import { add, add_all } from './add';
import { integer, nativeDouble, rational } from './bignum';
import { clockform } from './clock';
import { Condense, yycondense } from './condense';
import { Eval } from './eval';
import { yyfloat } from './float';
import { inner } from './inner';
import {
  equalq,
  isfraction,
  isimaginaryunit,
  isminusone,
  isnegativenumber, isone,
  isZeroAtomOrTensor,
} from './is';
import { makeList } from './list';
import { divide, inverse, multiply, multiply_noexpand, negate } from './multiply';
import { polar } from './polar';
import { power } from './power';
import { rationalize } from './rationalize';
import { real } from './real';
import { rect } from './rect';
import { roots } from './roots';
import { simfac } from './simfac';
import { check_tensor_dimensions } from './tensor';
import { transform } from './transform';
import { transpose } from './transpose';
import { denominator } from "./denominator";
import { areunivarpolysfactoredorexpandedform, gcd } from "./gcd";
import { factor } from "./factor";
import { numerator } from "./numerator";

export function Eval_simplify(p1: U) {
  const arg = runUserDefinedSimplifications(cadr(p1));
  const result = simplify(Eval(arg));
  push(result);
}

function runUserDefinedSimplifications(p: U): U {
  // -----------------------
  // unfortunately for the time being user
  // specified simplifications are only
  // run in things which don't contain
  // integrals.
  // Doesn't work yet, could be because of
  // some clobbering as "transform" is called
  // recursively?
  if (
    defs.userSimplificationsInListForm.length === 0 ||
    Find(p, symbol(INTEGRAL))
  ) {
    return p;
  }

    if (DEBUG) {
    console.log(`runUserDefinedSimplifications passed: ${p}`);
  }
  let F1 = noexpand(Eval, p);
  if (DEBUG) {
    console.log(`runUserDefinedSimplifications after eval no expanding: ${F1}`);
      console.log('patterns to be checked: ');
    for (const simplification of Array.from(
      defs.userSimplificationsInListForm
    )) {
      console.log(`...${simplification}`);
      }
    }

    let atLeastOneSuccessInRouldOfRulesApplications = true;
    let numberOfRulesApplications = 0;

    while (
      atLeastOneSuccessInRouldOfRulesApplications &&
      numberOfRulesApplications < MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES
    ) {
      atLeastOneSuccessInRouldOfRulesApplications = false;
      numberOfRulesApplications++;
      for (const eachSimplification of Array.from(
        defs.userSimplificationsInListForm
      )) {
        let success = true;
        let eachConsecutiveRuleApplication = 0;
        while (
          success &&
          eachConsecutiveRuleApplication <
            MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE
        ) {
          eachConsecutiveRuleApplication++;
          if (DEBUG) {
            console.log(
            `simplify - tos: ${defs.tos} checking pattern: ${eachSimplification} on: ${F1}`
            );
          }
        [F1, success] = transform(F1, symbol(NIL), eachSimplification, true);
          if (success) {
            atLeastOneSuccessInRouldOfRulesApplications = true;
          }
          if (DEBUG) {
          console.log(`p1 at this stage of simplification: ${F1}`);
          }
        }
        if (
          eachConsecutiveRuleApplication ===
          MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE
        ) {
          stop(
            `maximum application of single transformation rule exceeded: ${eachSimplification}`
          );
        }
      }
    }

  if (numberOfRulesApplications === MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES) {
      stop('maximum application of all transformation rules exceeded ');
    }

    if (DEBUG) {
      console.log(`METAX = ${get_binding(symbol(METAX))}`);
      console.log(`METAA = ${get_binding(symbol(METAA))}`);
      console.log(`METAB = ${get_binding(symbol(METAB))}`);
    }
  return F1;
}

// ------------------------

export function simplifyForCodeGeneration(p: U): U {
  const arg = runUserDefinedSimplifications(p);
  defs.codeGen = true;
  // in "codeGen" mode we completely
  // eval and simplify the function bodies
  // because we really want to resolve all
  // the variables indirections and apply
  // all the simplifications we can.
  const result = simplify(arg);
  defs.codeGen = false;
  return result;
}

export function simplify(p1: U): U {
  // when we do code generation, we proceed to
  // fully evaluate and simplify the body of
  // a function, so we resolve all variables
  // indirections and we simplify everything
  // we can given the current assignments.
  if (defs.codeGen && car(p1) === symbol(FUNCTION)) {
    const fbody = cadr(p1);
    // let's simplify the body so we give it a
    // compact form
    const p3 = simplify(Eval(fbody));

    // replace the evaled body
    const args = caddr(p1); // p5 is B

    p1 = makeList(symbol(FUNCTION), p3, args);
  }

  if (istensor(p1)) {
    return simplify_tensor(p1);
  }

  if (Find(p1, symbol(FACTORIAL))) {
    const p2 = simfac(p1);
    const p3 = simfac(rationalize(p1));
    p1 = count(p2) < count(p3) ? p2 : p3;
  }

  p1 = f10(p1);
  p1 = f1(p1);
  p1 = f2(p1);
  p1 = f3(p1);
  p1 = f4(p1);
  p1 = f5(p1);
  p1 = f9(p1);
  [p1] = simplify_polarRect(p1);
  if (do_simplify_nested_radicals) {
    let simplify_nested_radicalsResult: boolean;
    [simplify_nested_radicalsResult, p1] = simplify_nested_radicals(p1);
    // if there is some de-nesting then
    // re-run a simplification because
    // the shape of the expression might
    // have changed significantly.
    // e.g. simplify(14^(1/2) - (16 - 4*7^(1/2))^(1/2))
    // needs some more semplification after the de-nesting.
    if (simplify_nested_radicalsResult) {
      if (DEBUG) {
        console.log('de-nesting successful into: ' + p1.toString());
      }
      return simplify(p1);
    }
  }

  [p1] = simplify_rectToClock(p1);
  p1 = simplify_rational_expressions(p1);

  return p1;
}

function simplify_tensor(p1: Tensor) {
  let p2: U = alloc_tensor(p1.tensor.nelem);
  p2.tensor.ndim = p1.tensor.ndim;
  p2.tensor.dim = Array.from(p1.tensor.dim);
  p2.tensor.elem = p1.tensor.elem.map(simplify);

  check_tensor_dimensions(p2);

  if (isZeroAtomOrTensor(p2)) {
    p2 = Constants.zero; // null tensor becomes scalar zero
  }
  return p2;
}

// try rationalizing
function f1(p1: U): U {
  if (!isadd(p1)) {
    return p1;
  }
  const p2 = rationalize(p1);
  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return p1;
}

// try condensing
function f2(p1: U): U {
  if (!isadd(p1)) {
    return p1;
  }
  const p2 = Condense(p1);
  if (count(p2) <= count(p1)) {
    p1 = p2;
  }
  return p1;
}

// this simplifies forms like (A-B) / (B-A)
function f3(p1: U): U {
  const p2 = rationalize(negate(rationalize(negate(rationalize(p1)))));
  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return p1;
}

function f10(p1: U): U {
  const carp1 = car(p1);
  if (carp1 === symbol(MULTIPLY) || isinnerordot(p1)) {
    // both operands a transpose?

    if (
      car(car(cdr(p1))) === symbol(TRANSPOSE) &&
      car(car(cdr(cdr(p1)))) === symbol(TRANSPOSE)
    ) {
      if (DEBUG) {
        console.log(`maybe collecting a transpose ${p1}`);
      }
      const a = cadr(car(cdr(p1)));
      const b = cadr(car(cdr(cdr(p1))));
      let arg1: U;
      if (carp1 === symbol(MULTIPLY)) {
        arg1 = multiply(a, b);
      } else if (isinnerordot(p1)) {
        arg1 = inner(b, a);
      } else {
        arg1 = pop();
      }

      // const p2 = noexpand(transpose, arg1, Constants.one, integer(2));
      const p2 = noexpand(() => {
        return transpose(arg1, Constants.one, integer(2));
      });

      if (count(p2) < count(p1)) {
        p1 = p2;
      }
      if (DEBUG) {
        console.log(`collecting a transpose ${p2}`);
      }
    }
  }
  return p1;
}

// try expanding denominators
function f4(p1: U): U {
  if (isZeroAtomOrTensor(p1)) {
    return p1;
  }
  const p2 = rationalize(inverse(rationalize(inverse(rationalize(p1)))));
  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return p1;
}

// simplifies trig forms
export function simplify_trig(p1: U): U {
  return f5(p1);
}

function f5(p1: U): U {
  if (!Find(p1, symbol(SIN)) && !Find(p1, symbol(COS))) {
    return p1;
  }

  const p2 = p1;

  defs.trigmode = 1;
  let p3 = Eval(p2);

  defs.trigmode = 2;
  let p4 = Eval(p2);

  defs.trigmode = 0;

  if (count(p4) < count(p3) || nterms(p4) < nterms(p3)) {
    p3 = p4;
  }

  if (count(p3) < count(p1) || nterms(p3) < nterms(p1)) {
    p1 = p3;
  }
  return p1;
}

// if it's a sum then try to simplify each term
function f9(p1: U): U {

  if (!isadd(p1)) {
    return p1;
  }

  let p2 = cdr(p1);
  if (iscons(p2)) {
    p2 = [...p2].reduce((acc: U, p: U) =>
        simplify_rational_expressions(
          add(acc,simplify(p))
        )
      , Constants.zero);
  }

  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return p1;
}

function simplify_rational_expressions(p1: U): U {
  var denom, num, p2, polyVar, theGCD;

  denom = denominator(p1);
  if (isone(denom)) {
    return p1;
  }
  num = numerator(p1);
  if (isone(num)) {
    return p1;
  }
  if (!(polyVar = areunivarpolysfactoredorexpandedform(num, denom))) {
    return p1;
  }

  theGCD = factor(gcd(num, denom), polyVar);
  if (isone(theGCD)) {
    return p1;
  }

  let factoredNum:U = factor(num, polyVar);
  let theGCDInverse:U = inverse(theGCD);
  let multipliedNoeExpandNum:U = multiply_noexpand(factoredNum, theGCDInverse);
  let simplifiedNum:U = simplify(multipliedNoeExpandNum);

  let factoredDenom:U = factor(denom, polyVar);
  let multipliedNoeExpandDenom:U = multiply_noexpand(factoredDenom, theGCDInverse);
  let simplifiedDenom:U = simplify(multipliedNoeExpandDenom);

  let numDividedDenom:U = divide(simplifiedNum, simplifiedDenom);

  p2 = Condense(numDividedDenom);

  if (count(p2) < count(p1)) {
    return p2;
  }
  else {
    return p1;
  }
};

// things like 6*(cos(2/9*pi)+i*sin(2/9*pi))
// where we have sin and cos, those might start to
// look better in clock form i.e.  6*(-1)^(2/9)
function simplify_rectToClock(p1: U): [U] {
  let p2: U;
  //breakpoint

  if (!Find(p1, symbol(SIN)) && !Find(p1, symbol(COS))) {
    return [p1];
  }

  p2 = clockform(Eval(p1)); // put new (hopefully simplified expr) in p2

  if (DEBUG) {
    console.log(`before simplification clockform: ${p1} after: ${p2}`);
  }

  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return [p1];
}

function simplify_polarRect(p1: U): [U] {
  const tmp = polarRectAMinusOneBase(p1);

  const p2 = Eval(tmp); // put new (hopefully simplified expr) in p2

  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return [p1];
}

function polarRectAMinusOneBase(p1: U): U {
  if (isimaginaryunit(p1)) {
    return p1;
  }
  if (equal(car(p1), symbol(POWER)) && isminusone(cadr(p1))) {
    // base we just said is minus 1
    const base = negate(Constants.one);

    // exponent
    const exponent = polarRectAMinusOneBase(caddr(p1));
    // try to simplify it using polar and rect
    return rect(polar(power(base, exponent)));
  }
  if (iscons(p1)) {
    const arr = [];
    while (iscons(p1)) {
      //console.log("recursing on: " + car(p1).toString())
      arr.push(polarRectAMinusOneBase(car(p1)));
      //console.log("...transformed into: " + stack[tos-1].toString())
      p1 = cdr(p1);
    }

    return makeList(...arr);
  }
  return p1;
}

function nterms(p: U) {
  if (!isadd(p)) {
    return 1;
  } else {
    return length(p) - 1;
  }
}

function simplify_nested_radicals(p1: U): [boolean, U] {
  if (defs.recursionLevelNestedRadicalsRemoval > 0) {
    if (DEBUG) {
      console.log('denesting bailing out because of too much recursion');
    }
    return [false, p1];
  }

  const [
    simplificationWithoutCondense,
    somethingSimplified,
  ] = take_care_of_nested_radicals(p1);

  // in this paragraph we check whether we can collect
  // common factors without complicating the expression
  // in particular we want to avoid
  // collecting radicals like in this case where
  // we collect sqrt(2):
  //   2-2^(1/2) into 2^(1/2)*(-1+2^(1/2))
  // but we do like to collect other non-radicals e.g.
  //   17/2+3/2*5^(1/2) into 1/2*(17+3*5^(1/2))
  // so what we do is we count the powers and we check
  // which version has the least number of them.
  const simplificationWithCondense = noexpand(
    yycondense,
    simplificationWithoutCondense
  );

  //console.log("occurrences of powers in " + simplificationWithoutCondense + " :" + countOccurrencesOfSymbol(symbol(POWER),simplificationWithoutCondense))
  //console.log("occurrences of powers in " + simplificationWithCondense + " :" + countOccurrencesOfSymbol(symbol(POWER),simplificationWithCondense))

  p1 =
    countOccurrencesOfSymbol(symbol(POWER), simplificationWithoutCondense) <
    countOccurrencesOfSymbol(symbol(POWER), simplificationWithCondense)
      ? simplificationWithoutCondense
      : simplificationWithCondense;

  // we got out result, wrap up
  return [somethingSimplified, p1];
}

function take_care_of_nested_radicals(p1: U): [U, boolean] {
  if (defs.recursionLevelNestedRadicalsRemoval > 0) {
    if (DEBUG) {
      console.log('denesting bailing out because of too much recursion');
    }
    return [p1, false];
  }

  if (equal(car(p1), symbol(POWER))) {
    return _nestedPowerSymbol(p1);
  }

  if (iscons(p1)) {
    return _nestedCons(p1);
  }

  return [p1, false];
}

function _nestedPowerSymbol(p1: U): [U, boolean] {
    //console.log("ok it's a power ")
    const base = cadr(p1);
    const exponent = caddr(p1);
    //console.log("possible double radical base: " + base)
    //console.log("possible double radical exponent: " + exponent)

    if (
    isminusone(exponent) ||
    !equal(car(base), symbol(ADD)) ||
    !isfraction(exponent) ||
    (!equalq(exponent, 1, 3) && !equalq(exponent, 1, 2))
    ) {
    return [p1, false];
  }

      //console.log("ok there is a radix with a term inside")
      const firstTerm = cadr(base);
  take_care_of_nested_radicals(firstTerm);
      const secondTerm = caddr(base);
  take_care_of_nested_radicals(secondTerm);

      let numberOfTerms = 0;
      let countingTerms = base;
      while (cdr(countingTerms) !== symbol(NIL)) {
        numberOfTerms++;
        countingTerms = cdr(countingTerms);
      }
      if (numberOfTerms > 2) {
    return [p1, false];
      }

      // list here all the factors
  const { commonBases, termsThatAreNotPowers } = _listAll(secondTerm);

      if (commonBases.length === 0) {
    return [p1, false];
      }

      const A = firstTerm;
      const C = commonBases.reduce(multiply, Constants.one);
      const B = termsThatAreNotPowers.reduce(multiply, Constants.one);

  let temp: U;
      if (equalq(exponent, 1, 3)) {
    const checkSize1 = divide(multiply(negate(A), C), B); // 4th coeff
    const result1 = nativeDouble(yyfloat(real(checkSize1)));
        if (Math.abs(result1) > Math.pow(2, 32)) {
      return [p1, false];
        }

    const checkSize2 = multiply(integer(3), C); // 3rd coeff
    const result2 = nativeDouble(yyfloat(real(checkSize2)));
        if (Math.abs(result2) > Math.pow(2, 32)) {
      return [p1, false];
        }
    const arg1b = multiply(checkSize2, symbol(SECRETX));

    const checkSize3 = divide(multiply(integer(-3), A), B); // 2nd coeff
    const result3 = nativeDouble(yyfloat(real(checkSize3)));
        if (Math.abs(result3) > Math.pow(2, 32)) {
      return [p1, false];
        }

    const result = add_all([
      checkSize1,
              arg1b,
      multiply(checkSize3, power(symbol(SECRETX), integer(2))),
      multiply(Constants.one, power(symbol(SECRETX), integer(3))),
    ]);
    temp = result;
      } else if (equalq(exponent, 1, 2)) {
    const result1 = nativeDouble(yyfloat(real(C)));
        if (Math.abs(result1) > Math.pow(2, 32)) {
      return [p1, false];
        }

    const checkSize = divide(multiply(integer(-2), A), B);
        const result2 = nativeDouble(yyfloat(real(checkSize)));
        if (Math.abs(result2) > Math.pow(2, 32)) {
      return [p1, false];
        }
    temp = add(
      C,
          add(
        multiply(checkSize, symbol(SECRETX)),
        multiply(Constants.one, power(symbol(SECRETX), integer(2)))
          )
        );
      }

      defs.recursionLevelNestedRadicalsRemoval++;
  const r = roots(temp, symbol(SECRETX));
      defs.recursionLevelNestedRadicalsRemoval--;
  if (equal(r[r.length - 1], symbol(NIL))) {
        if (DEBUG) {
          console.log('roots bailed out because of too much recursion');
        }
    return [p1, false];
      }

      // exclude the solutions with radicals
  const possibleSolutions: U[] = (r[r.length - 1] as Tensor).elem.filter(
    (sol) => !Find(sol, symbol(POWER))
  );

      if (possibleSolutions.length === 0) {
    return [p1, false];
      }

      const possibleRationalSolutions: U[] = [];
      const realOfpossibleRationalSolutions: number[] = [];
      //console.log("checking the one with maximum real part ")
  for (const i of Array.from(possibleSolutions)) {
        const result = nativeDouble(yyfloat(real(i)));
        possibleRationalSolutions.push(i);
        realOfpossibleRationalSolutions.push(result);
      }

      const whichRationalSolution = realOfpossibleRationalSolutions.indexOf(
        Math.max.apply(Math, realOfpossibleRationalSolutions)
      );
      const SOLUTION = possibleRationalSolutions[whichRationalSolution];

  if (!equalq(exponent, 1, 3) && !equalq(exponent, 1, 2)) {
    return [p1, false];
  }

      if (equalq(exponent, 1, 3)) {
    const lowercase_b = power(
            divide(
              A,
              add(
                power(SOLUTION, integer(3)),
                multiply(multiply(integer(3), C), SOLUTION)
              )
            ),
            rational(1, 3)
    );
    const lowercase_a = multiply(lowercase_b, SOLUTION);
    const result = simplify(
      add(multiply(lowercase_b, power(C, rational(1, 2))), lowercase_a)
    );
    return [result, true];
  }

  if (equalq(exponent, 1, 2)) {
    const lowercase_b = power(
      divide(A, add(power(SOLUTION, integer(2)), C)),
      rational(1, 2)
        );
    const lowercase_a = multiply(lowercase_b, SOLUTION);
        const possibleNewExpression = simplify(
          add(multiply(lowercase_b, power(C, rational(1, 2))), lowercase_a)
        );
        const possibleNewExpressionValue = yyfloat(real(possibleNewExpression));
        if (!isnegativenumber(possibleNewExpressionValue)) {
      return [possibleNewExpression, true];
    }

    const result = simplify(
      add(
        multiply(negate(lowercase_b), power(C, rational(1, 2))),
        negate(lowercase_a)
            )
          );
    return [result, true];
  }

  return [null, true];
}

function _listAll(
  secondTerm: U
): { commonBases: U[]; termsThatAreNotPowers: U[] } {
  let commonInnerExponent = null;
  const commonBases: U[] = [];
  const termsThatAreNotPowers: U[] = [];
  if (ismultiply(secondTerm)) {
    // product of factors
    let secondTermFactor = cdr(secondTerm);
    if (iscons(secondTermFactor)) {
      while (iscons(secondTermFactor)) {
        const potentialPower = car(secondTermFactor);
        if (ispower(potentialPower)) {
          const innerbase = cadr(potentialPower);
          const innerexponent = caddr(potentialPower);
          if (equalq(innerexponent, 1, 2)) {
            if (commonInnerExponent == null) {
              commonInnerExponent = innerexponent;
              commonBases.push(innerbase);
            } else if (equal(innerexponent, commonInnerExponent)) {
              commonBases.push(innerbase);
            }
          }
    } else {
          termsThatAreNotPowers.push(potentialPower);
        }
        secondTermFactor = cdr(secondTermFactor);
      }
    }
  } else if (ispower(secondTerm)) {
    const innerbase = cadr(secondTerm);
    const innerexponent = caddr(secondTerm);
    if (commonInnerExponent == null && equalq(innerexponent, 1, 2)) {
      commonInnerExponent = innerexponent;
      commonBases.push(innerbase);
    }
  }
  return { commonBases, termsThatAreNotPowers };
}

function _nestedCons(p1: U): [U, boolean] {
    let anyRadicalSimplificationWorked = false;
  const arr = [];
  if (iscons(p1)) {
    const items = Array.from(p1).map((p) => {
      if (!anyRadicalSimplificationWorked) {
        let p2: U;
        [p2, anyRadicalSimplificationWorked] = take_care_of_nested_radicals(p);
        return p2;
      }
      return p;
    });
    arr.push(...items);
  }
  return [makeList(...arr), anyRadicalSimplificationWorked];
}
