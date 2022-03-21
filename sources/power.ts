import {
  ABS,
  ARCTAN,
  ASSUME_REAL_VARIABLES,
  avoidCalculatingPowersIntoArctans,
  breakpoint,
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  COS,
  defs,
  Double,
  E,
  isadd,
  iscons,
  isdouble,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational,
  istensor,
  LOG,
  MULTIPLY,
  Num,
  PI,
  POWER,
  SIN,
  U
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { get_binding, symbol } from '../runtime/symbol';
import { equal, exponential, length, sign } from '../sources/misc';
import { abs } from './abs';
import { add, subtract } from './add';
import { arg } from './arg';
import {
  compare_numbers,
  double,
  integer,
  nativeDouble, nativeInt, rational
} from './bignum';
import { conjugate } from './conj';
import { cosine } from './cos';
import { dpow } from './dpow';
import { Eval } from './eval';
import { factorial } from './factorial';
import {
  iscomplexnumber,
  iscomplexnumberdouble,
  iseveninteger,
  isinteger,
  isminusone,
  isminusoneovertwo,
  isone,
  isoneovertwo,
  ispositivenumber,
  isquarterturn,
  isZeroAtomOrTensor
} from './is';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { qpow } from './qpow';
import { rect } from './rect';
import { sine } from './sin';
import { power_tensor } from './tensor';

/* Power function

  Input:    push  Base
      push  Exponent

  Output:    Result on stack
*/
const DEBUG_POWER = false;

export function Eval_power(p1: U) {
  if (DEBUG_POWER) {
    breakpoint;
  }
  const base = Eval(cadr(p1));
  const exponent = Eval(caddr(p1));
  return power(base, exponent);
}

export function power(p1: U, p2: U): U {
  return yypower(p1, p2);
}

function yypower(base: U, exponent: U): U {
  if (DEBUG_POWER) {
    breakpoint;
  }

  const inputExp = exponent;
  const inputBase = base;
  //breakpoint

  if (DEBUG_POWER) {
    console.log(`POWER: ${base} ^ ${exponent}`);
  }

  // first, some very basic simplifications right away

  //  1 ^ a    ->  1
  //  a ^ 0    ->  1
  if (equal(base, Constants.one) || isZeroAtomOrTensor(exponent)) {
    const one = Constants.One();
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${one}`);
    }
    return one;
  }

  //  a ^ 1    ->  a
  if (equal(exponent, Constants.one)) {
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${base}`);
    }
    return base;
  }

  //   -1 ^ -1    ->  -1
  if (isminusone(base) && isminusone(exponent)) {
    const negOne = negate(Constants.One());
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${negOne}`);
    }
    return negOne;
  }

  //   -1 ^ 1/2  ->  i
  if (isminusone(base) && isoneovertwo(exponent)) {
    const result = Constants.imaginaryunit;
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  //   -1 ^ -1/2  ->  -i
  if (isminusone(base) && isminusoneovertwo(exponent)) {
    const result = negate(Constants.imaginaryunit);
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  let tmp: U;
  //   -1 ^ rational
  if (
    isminusone(base) &&
    !isdouble(base) &&
    isrational(exponent) &&
    !isinteger(exponent) &&
    ispositivenumber(exponent) &&
    !defs.evaluatingAsFloats
  ) {
    if (DEBUG_POWER) {
      console.log('   power: -1 ^ rational');
      console.log(
        ` trick: exponent.q.a , exponent.q.b ${exponent.q.a} , ${exponent.q.b}`
      );
    }
    if (exponent.q.a < exponent.q.b) {
      tmp = makeList(symbol(POWER), base, exponent);
    } else {
      tmp = makeList(
        symbol(MULTIPLY),
        base,
        makeList(
          symbol(POWER),
          base,
          rational(exponent.q.a.mod(exponent.q.b), exponent.q.b)
        )
      );
      if (DEBUG_POWER) {
        console.log(` trick applied : ${tmp}`);
      }
    }

    // evaluates clock form into
    // rectangular form. This seems to give
    // slightly better form to some test results.
    const result = rect(tmp);
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // both base and exponent are rational numbers?
  if (isrational(base) && isrational(exponent)) {
    if (DEBUG_POWER) {
      console.log('   power: isrational(base) && isrational(exponent)');
    }
    const result = qpow(base, exponent);
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // both base and exponent are either rational or double?
  if (isNumericAtom(base) && isNumericAtom(exponent)) {
    const result = dpow(nativeDouble(base), nativeDouble(exponent));
    if (DEBUG_POWER) {
      console.log(
        '   power: both base and exponent are either rational or double '
      );
      console.log('POWER - isNumericAtom(base) && isNumericAtom(exponent)');
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  if (istensor(base)) {
    const result = power_tensor(base, exponent);
    if (DEBUG_POWER) {
      console.log('   power: istensor(base) ');
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // if we only assume variables to be real, then |a|^2 = a^2
  // (if x is complex this doesn't hold e.g. i, which makes 1 and -1
  if (
    car(base) === symbol(ABS) &&
    iseveninteger(exponent) &&
    !isZeroAtomOrTensor(get_binding(symbol(ASSUME_REAL_VARIABLES)))
  ) {
    const result = power(cadr(base), exponent);

    if (DEBUG_POWER) {
      console.log('   power: even power of absolute of real value ');
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // e^log(...)
  if (base === symbol(E) && car(exponent) === symbol(LOG)) {
    const result = cadr(exponent);
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // e^some_float
  if (base === symbol(E) && isdouble(exponent)) {
    const result = double(Math.exp(exponent.d));
    if (DEBUG_POWER) {
      console.log('   power: base == symbol(E) && isdouble(exponent) ');
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // complex number in exponential form, get it to rectangular
  // but only if we are not in the process of calculating a polar form,
  // otherwise we'd just undo the work we want to do
  if (
    base === symbol(E) &&
    Find(exponent, Constants.imaginaryunit) &&
    Find(exponent, symbol(PI)) &&
    !defs.evaluatingPolar
  ) {
    let tmp = makeList(symbol(POWER), base, exponent);
    if (DEBUG_POWER) {
      console.log(`   power: turning complex exponential to rect: ${tmp}`);
    }

    const hopefullySimplified = rect(tmp); // put new (hopefully simplified expr) in exponent
    if (!Find(hopefullySimplified, symbol(PI))) {
      if (DEBUG_POWER) {
        console.log(
          `   power: turned complex exponential to rect: ${hopefullySimplified}`
        );
      }
      return hopefullySimplified;
    }
  }

  //  (a * b) ^ c  ->  (a ^ c) * (b ^ c)
  // note that we can't in general do this, for example
  // sqrt(x*y) != x^(1/2) y^(1/2) (counterexample" x = -1 and y = -1)
  // BUT we can carve-out here some cases where this
  // transformation is correct
  if (ismultiply(base) && isinteger(exponent)) {
    base = cdr(base);
    let result = power(car(base), exponent);
    if (iscons(base)) {
      result = base
        .tail()
        .reduce((a: U, b: U) => multiply(a, power(b, exponent)), result);
    }
    if (DEBUG_POWER) {
      console.log('   power: (a * b) ^ c  ->  (a ^ c) * (b ^ c) ');
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // (a ^ b) ^ c  ->  a ^ (b * c)
  // note that we can't in general do this, for example
  // sqrt(x^y) !=  x^(1/2 y) (counterexample x = -1)
  // BUT we can carve-out here some cases where this
  // transformation is correct
  // simple numeric check to see if a is a number > 0
  let is_a_moreThanZero = false;
  if (isNumericAtom(cadr(base))) {
    is_a_moreThanZero =
      sign(compare_numbers(cadr(base) as Num | Double, Constants.zero)) > 0;
  }

  if (
    ispower(base) && // when c is an integer
    (isinteger(exponent) || is_a_moreThanZero) // when a is >= 0
  ) {
    const result = power(cadr(base), multiply(caddr(base), exponent));
    if (DEBUG_POWER) {
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  let b_isEven_and_c_isItsInverse = false;
  if (iseveninteger(caddr(base))) {
    const isThisOne = multiply(caddr(base), exponent);
    if (isone(isThisOne)) {
      b_isEven_and_c_isItsInverse = true;
    }
  }

  if (ispower(base) && b_isEven_and_c_isItsInverse) {
    const result = abs(cadr(base));
    if (DEBUG_POWER) {
      console.log(
        '   power: car(base) == symbol(POWER) && b_isEven_and_c_isItsInverse '
      );
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  //  when expanding,
  //  (a + b) ^ n  ->  (a + b) * (a + b) ...
  if (defs.expanding && isadd(base) && isNumericAtom(exponent)) {
    const n = nativeInt(exponent);
    if (n > 1 && !isNaN(n)) {
      if (DEBUG_POWER) {
        console.log(
          '   power: expanding && isadd(base) && isNumericAtom(exponent) '
        );
      }
      let result = power_sum(n, base);
      if (DEBUG_POWER) {
        console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
      }
      return result;
    }
  }

  //  sin(x) ^ 2n -> (1 - cos(x) ^ 2) ^ n
  if (
    defs.trigmode === 1 &&
    car(base) === symbol(SIN) &&
    iseveninteger(exponent)
  ) {
    const result = power(
      subtract(Constants.one, power(cosine(cadr(base)), integer(2))),
      multiply(exponent, rational(1, 2))
    );
    if (DEBUG_POWER) {
      console.log(
        '   power: trigmode == 1 && car(base) == symbol(SIN) && iseveninteger(exponent) '
      );
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  //  cos(x) ^ 2n -> (1 - sin(x) ^ 2) ^ n
  if (
    defs.trigmode === 2 &&
    car(base) === symbol(COS) &&
    iseveninteger(exponent)
  ) {
    const result = power(
      subtract(Constants.one, power(sine(cadr(base)), integer(2))),
      multiply(exponent, rational(1, 2))
    );
    if (DEBUG_POWER) {
      console.log(
        '   power: trigmode == 2 && car(base) == symbol(COS) && iseveninteger(exponent) '
      );
      console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
  }

  // complex number? (just number, not expression)
  if (iscomplexnumber(base)) {
    if (DEBUG_POWER) {
      console.log(' power - handling the case (a + ib) ^ n');
    }
    // integer power?
    // n will be negative here, positive n already handled
    if (isinteger(exponent)) {
      //               /        \  n
      //         -n   |  a - ib  |
      // (a + ib)   = | -------- |
      //              |   2   2  |
      //               \ a + b  /
      const p3 = conjugate(base);

      // gets the denominator
      let result = divide(p3, multiply(p3, base));

      if (!isone(exponent)) {
        result = power(result, negate(exponent));
      }

      if (DEBUG_POWER) {
        console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
      }
      return result;
    }

    // noninteger or floating power?
    if (isNumericAtom(exponent)) {
      // remember that the "double" type is
      // toxic, i.e. it propagates, so we do
      // need to evaluate PI to its actual double
      // value

      //console.log("power pushing PI when base is: " + base + " and exponent is:" + exponent)
      const pi =
        defs.evaluatingAsFloats ||
          (iscomplexnumberdouble(base) && isdouble(exponent))
          ? double(Math.PI)
          : symbol(PI);
      let tmp = multiply(
        power(abs(base), exponent),
        power(Constants.negOne, divide(multiply(arg(base), exponent), pi))
      );

      // if we calculate the power making use of arctan:
      //  * it prevents nested radicals from being simplified
      //  * results become really hard to manipulate afterwards
      //  * we can't go back to other forms.
      // so leave the power as it is.
      if (avoidCalculatingPowersIntoArctans && Find(tmp, symbol(ARCTAN))) {
        tmp = makeList(symbol(POWER), base, exponent);
      }

      if (DEBUG_POWER) {
        console.log(`   power of ${inputBase} ^ ${inputExp}: ${tmp}`);
      }
      return tmp;
    }
  }

  const polarResult = simplify_polar(exponent);
  if (polarResult !== undefined) {
    if (DEBUG_POWER) {
      console.log('   power: using simplify_polar');
    }
    return polarResult;
  }

  const result = makeList(symbol(POWER), base, exponent);
  if (DEBUG_POWER) {
    console.log('   power: nothing can be done ');
    console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
  }
  return result;
}

//-----------------------------------------------------------------------------
//
//  Compute the power of a sum
//
//  Input:    p1  sum
//
//      n  exponent
//
//  Output:    Result on stack
//
//  Note:
//
//  Uses the multinomial series (see Math World)
//
//                          n              n!          n1   n2       nk
//  (a1 + a2 + ... + ak)  = sum (--------------- a1   a2   ... ak  )
//                               n1! n2! ... nk!
//
//  The sum is over all n1 ... nk such that n1 + n2 + ... + nk = n.
//
//-----------------------------------------------------------------------------

// first index is the term number 0..k-1, second index is the exponent 0..n
//define A(i, j) frame[(i) * (n + 1) + (j)]
function power_sum(n: number, p1: U): U {
  const a: number[] = [];
  // number of terms in the sum
  const k = length(p1) - 1;

  // array of powers
  const powers: U[] = [];

  p1 = cdr(p1);
  for (let i = 0; i < k; i++) {
    for (let j = 0; j <= n; j++) {
      powers[i * (n + 1) + j] = power(car(p1), integer(j));
    }
    p1 = cdr(p1);
  }

  p1 = factorial(integer(n));

  for (let i = 0; i < k; i++) {
    a[i] = 0;
  }

  return multinomial_sum(k, n, a, 0, n, powers, p1, Constants.zero);
}

//-----------------------------------------------------------------------------
//
//  Compute multinomial sum
//
//  Input:    k  number of factors
//
//      n  overall exponent
//
//      a  partition array
//
//      i  partition array index
//
//      m  partition remainder
//
//      p1  n!
//
//      A  factor array
//
//  Output:    Result on stack
//
//  Note:
//
//  Uses recursive descent to fill the partition array.
//
//-----------------------------------------------------------------------------
function multinomial_sum(
  k: number,
  n: number,
  a: number[],
  i: number,
  m: number,
  A: U[],
  p1: U,
  p2: U
): U {
  if (i < k - 1) {
    for (let j = 0; j <= m; j++) {
      a[i] = j;
      p2 = multinomial_sum(k, n, a, i + 1, m - j, A, p1, p2);
    }
    return p2;
  }

  a[i] = m;

  // coefficient
  let temp = p1;
  for (let j = 0; j < k; j++) {
    temp = divide(temp, factorial(integer(a[j])));
  }

  // factors
  for (let j = 0; j < k; j++) {
    temp = multiply(temp, A[j * (n + 1) + a[j]]);
  }

  return add(p2, temp);
}

// exp(n/2 i pi) ?
// clobbers p3
function simplify_polar(exponent: U): U | undefined {
  let n = isquarterturn(exponent);
  switch (n) {
    case 0:
      // do nothing
      break;
    case 1:
      return Constants.one;
    case 2:
      return Constants.negOne;
    case 3:
      return Constants.imaginaryunit;
    case 4:
      return negate(Constants.imaginaryunit);
  }

  if (isadd(exponent)) {
    let p3 = cdr(exponent);
    while (iscons(p3)) {
      n = isquarterturn(car(p3));
      if (n) {
        break;
      }
      p3 = cdr(p3);
    }
    let arg1: U;
    switch (n) {
      case 0:
        return undefined;
      case 1:
        arg1 = Constants.one;
        break;
      case 2:
        arg1 = Constants.negOne;
        break;
      case 3:
        arg1 = Constants.imaginaryunit;
        break;
      case 4:
        arg1 = negate(Constants.imaginaryunit);
        break;
    }
    return multiply(arg1, exponential(subtract(exponent, car(p3))));
  }

  return undefined;
}
