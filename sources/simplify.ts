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
  symbol,
  Tensor,
  TRANSPOSE,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { stop } from '../runtime/run';
import { pop, push, top, push_all } from '../runtime/stack';
import { get_binding } from '../runtime/symbol';
import { equal, length } from '../sources/misc';
import { add } from './add';
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
  isnegativenumber,
  isZeroAtomOrTensor,
} from './is';
import { list, makeList } from './list';
import { divide, inverse, multiply, negate } from './multiply';
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
  let p1 = noexpand(Eval, p);
  push(p1);
  if (DEBUG) {
    console.log(`runUserDefinedSimplifications after eval no expanding: ${p1}`);
    console.log('patterns to be checked: ');
    for (const simplification of Array.from(
      defs.userSimplificationsInListForm
    )) {
      console.log(`...${simplification}`);
    }
  }

  let atLeastOneSuccessInRouldOfRulesApplications = true;
  let numberOfRulesApplications = 0;

  let F1 = pop();
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
            `simplify - tos: ${defs.tos} checking pattern: ${eachSimplification} on: ${p1}`
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
  let temp: U = Constants.zero;
  while (iscons(p2)) {
    temp = add(temp, simplify(car(p2)));
    p2 = cdr(p2);
  }
  p2 = temp;
  if (count(p2) < count(p1)) {
    p1 = p2;
  }
  return p1;
}

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

  push(p1);
  const somethingSimplified: boolean = take_care_of_nested_radicals();

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
  const simplificationWithoutCondense = top();
  const simplificationWithCondense = noexpand(yycondense, pop());

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

function take_care_of_nested_radicals(): boolean {
  if (defs.recursionLevelNestedRadicalsRemoval > 0) {
    if (DEBUG) {
      console.log('denesting bailing out because of too much recursion');
    }
    return false;
  }

  let p1 = pop();
  //console.log("take_care_of_nested_radicals p1: " + p1.toString())

  if (equal(car(p1), symbol(POWER))) {
    //console.log("ok it's a power ")
    const base = cadr(p1);
    const exponent = caddr(p1);
    //console.log("possible double radical base: " + base)
    //console.log("possible double radical exponent: " + exponent)

    if (
      !isminusone(exponent) &&
      equal(car(base), symbol(ADD)) &&
      isfraction(exponent) &&
      (equalq(exponent, 1, 3) || equalq(exponent, 1, 2))
    ) {
      //console.log("ok there is a radix with a term inside")
      let checkSize, i, innerbase, innerexponent, lowercase_a;
      const firstTerm = cadr(base);
      push(firstTerm);
      take_care_of_nested_radicals();
      pop();
      const secondTerm = caddr(base);
      push(secondTerm);
      take_care_of_nested_radicals();
      pop();

      //console.log("possible double radical term1: " + firstTerm)
      //console.log("possible double radical term2: " + secondTerm)

      let numberOfTerms = 0;
      let countingTerms = base;
      while (cdr(countingTerms) !== symbol(NIL)) {
        numberOfTerms++;
        countingTerms = cdr(countingTerms);
      }
      //console.log("number of terms: " + numberOfTerms)
      if (numberOfTerms > 2) {
        //console.log("too many terms under outer radix ")
        push(p1);
        return false;
      }

      // list here all the factors
      let commonInnerExponent = null;
      const commonBases = [];
      const termsThatAreNotPowers = [];
      if (ismultiply(secondTerm)) {
        // product of factors
        let secondTermFactor = cdr(secondTerm);
        if (iscons(secondTermFactor)) {
          while (iscons(secondTermFactor)) {
            //console.log("second term factor BIS: " + car(secondTermFactor).toString())
            const potentialPower = car(secondTermFactor);
            if (ispower(potentialPower)) {
              innerbase = cadr(potentialPower);
              innerexponent = caddr(potentialPower);
              if (equalq(innerexponent, 1, 2)) {
                //console.log("tackling double radical 1: " + p1.toString())
                if (commonInnerExponent == null) {
                  commonInnerExponent = innerexponent;
                  commonBases.push(innerbase);
                } else {
                  if (equal(innerexponent, commonInnerExponent)) {
                    //console.log("common base: " + innerbase.toString())
                    commonBases.push(innerbase);
                  }
                }
              }
              //console.log("no common bases here ")
              //console.log("this one is a power base: " + innerbase + " , exponent: " + innerexponent)
            } else {
              termsThatAreNotPowers.push(potentialPower);
            }
            secondTermFactor = cdr(secondTermFactor);
          }
        }
      } else if (ispower(secondTerm)) {
        innerbase = cadr(secondTerm);
        innerexponent = caddr(secondTerm);
        if (commonInnerExponent == null && equalq(innerexponent, 1, 2)) {
          //console.log("tackling double radical 2: " + p1.toString())
          commonInnerExponent = innerexponent;
          commonBases.push(innerbase);
        }
      }

      if (commonBases.length === 0) {
        push(p1);
        return false;
      }

      const A = firstTerm;
      //console.log("A: " + A.toString())

      const C = commonBases.reduce(multiply, Constants.one);
      //console.log("basis with common exponent: " + i.toString())
      //console.log("C: " + C.toString())

      const B = termsThatAreNotPowers.reduce(multiply, Constants.one);
      //console.log("terms that are not powers: " + i.toString())
      //console.log("B: " + B.toString())

      if (equalq(exponent, 1, 3)) {
        checkSize = divide(multiply(negate(A), C), B); // 4th coeff
        //console.log("constant coeff " + stack[tos-1].toString())
        const result1 = nativeDouble(yyfloat(real(checkSize)));
        if (Math.abs(result1) > Math.pow(2, 32)) {
          push(p1);
          return false;
        }
        push(checkSize);

        checkSize = multiply(integer(3), C); // 3rd coeff
        //console.log("next coeff " + stack[tos-1].toString())
        const result2 = nativeDouble(yyfloat(real(checkSize)));
        if (Math.abs(result2) > Math.pow(2, 32)) {
          pop();
          push(p1);
          return false;
        }
        push(multiply(checkSize, symbol(SECRETX)));

        checkSize = divide(multiply(integer(-3), A), B); // 2nd coeff
        const result3 = nativeDouble(yyfloat(real(checkSize)));
        if (Math.abs(result3) > Math.pow(2, 32)) {
          pop();
          pop();
          push(p1);
          return false;
        }

        //console.log("next coeff " + stack[tos-1].toString())
        let arg2 = power(symbol(SECRETX), integer(2));
        push(multiply(checkSize, arg2));

        const coeff1 = Constants.one; // 1st coeff
        //console.log("next coeff " + stack[tos-1].toString())

        const arg1a = pop();
        const arg1b = pop();
        const arg1c = pop();
        push(
          add(
            arg1c,
            add(
              arg1b,
              add(arg1a, multiply(coeff1, power(symbol(SECRETX), integer(3))))
            )
          )
        );
      } else if (equalq(exponent, 1, 2)) {
        checkSize = C; // 3th coeff
        const result1 = nativeDouble(yyfloat(real(checkSize)));
        if (Math.abs(result1) > Math.pow(2, 32)) {
          push(p1);
          return false;
        }
        push(checkSize);
        //console.log("constant coeff " + stack[tos-1].toString())

        checkSize = divide(multiply(integer(-2), A), B); // 2nd coeff
        const result2 = nativeDouble(yyfloat(real(checkSize)));
        if (Math.abs(result2) > Math.pow(2, 32)) {
          pop();
          push(p1);
          return false;
        }

        //console.log("next coeff " + stack[tos-1].toString())
        push(multiply(checkSize, symbol(SECRETX)));

        const coeff1 = Constants.one; // 1st coeff
        //console.log("next coeff " + stack[tos-1].toString())

        const arg1a = pop();
        const arg1b = pop();
        push(
          add(
            arg1b,
            add(arg1a, multiply(coeff1, power(symbol(SECRETX), integer(2))))
          )
        );
      }

      //console.log("whole polynomial: " + stack[tos-1].toString())

      defs.recursionLevelNestedRadicalsRemoval++;
      //console.log("invoking roots at recursion level: " + recursionLevelNestedRadicalsRemoval)
      let arg1 = pop();
      push_all(roots(arg1, symbol(SECRETX)));
      defs.recursionLevelNestedRadicalsRemoval--;
      if (equal(top(), symbol(NIL))) {
        if (DEBUG) {
          console.log('roots bailed out because of too much recursion');
        }
        pop();
        push(p1);
        return false;
      }

      //console.log("all solutions: " + stack[tos-1].toString())

      // exclude the solutions with radicals
      const possibleSolutions: U[] = [];
      for (let eachSolution of (top() as Tensor).elem) {
        if (!Find(eachSolution, symbol(POWER))) {
          possibleSolutions.push(eachSolution);
        }
      }

      pop(); // popping the tensor with the solutions

      //console.log("possible solutions: " + possibleSolutions.toString())
      if (possibleSolutions.length === 0) {
        push(p1);
        return false;
      }

      const possibleRationalSolutions: U[] = [];
      const realOfpossibleRationalSolutions: number[] = [];
      //console.log("checking the one with maximum real part ")
      for (i of Array.from(possibleSolutions)) {
        const result = nativeDouble(yyfloat(real(i)));
        possibleRationalSolutions.push(i);
        realOfpossibleRationalSolutions.push(result);
      }

      const whichRationalSolution = realOfpossibleRationalSolutions.indexOf(
        Math.max.apply(Math, realOfpossibleRationalSolutions)
      );
      const SOLUTION = possibleRationalSolutions[whichRationalSolution];
      //console.log("picked solution: " + SOLUTION)

      /*
      *possibleNewExpressions = []
      *realOfPossibleNewExpressions = []
      * pick the solution which cubic root has no radicals
      lowercase_b = null
      for SOLUTION in possibleSolutions
        console.log("testing solution: " + SOLUTION.toString())

        breakpoint
        if equalq(exponent,1,3)
          push(A)
          push(SOLUTION)
          push_integer(3)
          power()
          push_integer(3)
          push(C)
          multiply()
          push(SOLUTION)
          multiply()
          add()
          divide()
          console.log("argument of cubic root: " + stack[tos-1].toString())
          push_rational(1,3)
          power()
        else if equalq(exponent,1,2)
          push(A)
          push(SOLUTION)
          push_integer(2)
          power()
          push(C)
          add()
          divide()
          console.log("argument of cubic root: " + stack[tos-1].toString())
          push_rational(1,2)
          power()
        console.log("b is: " + stack[tos-1].toString())

        lowercase_b = pop()

        if !Find(lowercase_b, symbol(POWER))
          break
      */

      if (equalq(exponent, 1, 3)) {
        //console.log("argument of cubic root: " + stack[tos-1].toString())
        push(
          power(
            divide(
              A,
              add(
                power(SOLUTION, integer(3)),
                multiply(multiply(integer(3), C), SOLUTION)
              )
            ),
            rational(1, 3)
          )
        );
      } else if (equalq(exponent, 1, 2)) {
        const base = divide(A, add(power(SOLUTION, integer(2)), C));
        //console.log("argument of cubic root: " + stack[tos-1].toString())
        push(power(base, rational(1, 2)));
      }
      //console.log("b is: " + stack[tos-1].toString())

      let lowercase_b = pop();
      if (lowercase_b == null) {
        push(p1);
        return false;
      }

      lowercase_a = multiply(lowercase_b, SOLUTION);

      if (equalq(exponent, 1, 3)) {
        //console.log("a is: " + stack[tos-1].toString())
        push(
          simplify(
            add(multiply(lowercase_b, power(C, rational(1, 2))), lowercase_a)
          )
        );
      } else if (equalq(exponent, 1, 2)) {
        //console.log("a could be: " + stack[tos-1].toString())
        const possibleNewExpression = simplify(
          add(multiply(lowercase_b, power(C, rational(1, 2))), lowercase_a)
        );
        //console.log("verifying if  " + possibleNewExpression + " is positive")
        const possibleNewExpressionValue = yyfloat(real(possibleNewExpression));
        if (!isnegativenumber(possibleNewExpressionValue)) {
          //console.log("... it is positive")
          push(possibleNewExpression);
        } else {
          //console.log("... it is NOT positive")
          lowercase_b = negate(lowercase_b);
          lowercase_a = negate(lowercase_a);
          push(
            simplify(
              add(multiply(lowercase_b, power(C, rational(1, 2))), lowercase_a)
            )
          );
        }
      }
      // possibleNewExpression is now at top of stack

      //console.log("potential new expression: " + stack[tos-1].toString())
      p1 = pop();
      //newExpression = pop()
      //breakpoint
      //push(newExpression)
      //real()
      //yyfloat()
      //possibleNewExpressions.push(newExpression)
      //realOfPossibleNewExpressions.push(pop_double())

      //whichExpression = realOfPossibleNewExpressions.indexOf(Math.max.apply(Math, realOfPossibleNewExpressions))
      //p1 = possibleNewExpressions[whichExpression]
      //console.log("final new expression: " + p1.toString())

      push(p1);
      return true;
    } else {
      push(p1);
      return false;
    }
  } else if (iscons(p1)) {
    const h = defs.tos;
    let anyRadicalSimplificationWorked = false;
    while (iscons(p1)) {
      //console.log("recursing on: " + car(p1).toString())
      push(car(p1));
      anyRadicalSimplificationWorked =
        anyRadicalSimplificationWorked || take_care_of_nested_radicals();
      //console.log("...transformed into: " + stack[tos-1].toString())
      p1 = cdr(p1);
    }
    list(defs.tos - h);
    return anyRadicalSimplificationWorked;
  } else {
    push(p1);
    return false;
  }

  throw new Error('control flow should never reach here');
}
