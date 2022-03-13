import bigInt from 'big-integer';
import {
  breakpoint,
  Constants,
  DEBUG,
  defs,
  Double,
  DOUBLE,
  isdouble,
  isNumericAtom,
  isrational,
  Num,
  NUM,
  PRINTMODE_LATEX,
  Sign,
  Tensor,
  U,
} from '../runtime/defs';
import { mcmp } from '../runtime/mcmp';
import { doubleToReasonableString } from '../runtime/otherCFunctions';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { isfraction, isinteger, isZeroAtomOrTensor } from './is';
import { mgcd } from './mgcd';
import { mdiv, mmul } from './mmul';
import { mpow } from './mpow';
import { negate } from './multiply';
import { qadd } from './qadd';
import { qdiv } from './qdiv';
import { qmul } from './qmul';

//double convert_rational_to_double(U *)
//double convert_bignum_to_double(unsigned int *)
//int ge(unsigned int *, unsigned int *, int)

export function mint(a: number): bigInt.BigInteger {
  return bigInt(a);
}

export function isSmall(a: bigInt.BigInteger): boolean {
  return a.geq(Number.MIN_SAFE_INTEGER) && a.leq(Number.MAX_SAFE_INTEGER);
}

// b is +1 or -1
export function setSignTo(a: bigInt.BigInteger, b: Sign): bigInt.BigInteger {
  if (a.isPositive()) {
    if (b < 0) {
      return a.multiply(bigInt(-1));
    }
  } else {
    // a is negative
    if (b > 0) {
      return a.multiply(bigInt(-1));
    }
  }
  return a;
}

export function makeSignSameAs(
  a: bigInt.BigInteger,
  b: bigInt.BigInteger
): bigInt.BigInteger {
  if (a.isPositive()) {
    if (b.isNegative()) {
      return a.multiply(bigInt(-1));
    }
  } else {
    // a is negative
    if (b.isPositive()) {
      return a.multiply(bigInt(-1));
    }
  }
  return a;
}

export function makePositive(a: bigInt.BigInteger): bigInt.BigInteger {
  if (a.isNegative()) {
    return a.multiply(bigInt(-1));
  }
  return a;
}

// n is an int
/*
mtotal = 0
MP_MIN_SIZE = 2
MP_MAX_FREE  = 1000

mnew = (n) ->
  if (n < MP_MIN_SIZE)
    n = MP_MIN_SIZE
  if (n == MP_MIN_SIZE && mfreecount)
    p = free_stack[--mfreecount]
  else
    p = [] #(unsigned int *) malloc((n + 3) * sizeof (int))
    *if (p == 0)
    *  stop("malloc failure")
  p[0] = n
  mtotal += n
  return p[3]
*/

// p is the index of array of ints
// !!! array wasn't passed here
/*
free_stack = []

mfree = (array, p) ->
  p -= 3
  mtotal -= array[p]
  if (array[p] == MP_MIN_SIZE && mfreecount < MP_MAX_FREE)
    free_stack[mfreecount++] = p
  else
    free(p)
*/

// convert int to bignum

// n is an int
/*
mint = (n) ->
  p = mnew(1)
  if (n < 0)
    * !!! this is FU
    * MSIGN(p) = -1
    fu = true
  else
    * !!! this is FU
    *MSIGN(p) = 1
    fu = true
  * !!! this is FU
  *MLENGTH(p) = 1
  p[0] = Math.abs(n)
  return p
*/

// copy bignum

// a is an array of ints
/*
mcopy = (a) ->
  *unsigned int *b

  b = mnew(MLENGTH(a))

  * !!! fu
  *MSIGN(b) = MSIGN(a)
  *MLENGTH(b) = MLENGTH(a)

  for i in [0...MLENGTH(a)]
    b[i] = a[i]

  return b
*/

/*
* 
* ge not invoked from anywhere - is you need ge
* just use the bigNum's ge implementation
* leaving it here just in case I decide to backport to C
*
* a >= b ?
* and and b arrays of ints, len is an int
ge = (a, b, len) ->
  i = 0
  for i in [0...len]
    if (a[i] == b[i])
      continue
    else
      break
  if (a[i] >= b[i])
    return 1
  else
    return 0
*/
export function add_numbers(p1: Num | Double, p2: Num | Double): Num | Double {
  //if DEBUG then console.log("add_numbers adding numbers: " + print_list(stack[tos - 1]) + " and " + print_list(stack[tos - 2]))

  if (isrational(p1) && isrational(p2)) {
    return qadd(p1, p2);
  }

  const a = isdouble(p1) ? p1.d : convert_rational_to_double(p1);
  const b = isdouble(p2) ? p2.d : convert_rational_to_double(p2);

  return double(a + b);
}

export function multiply_numbers(
  p1: Num | Double,
  p2: Num | Double
): Num | Double {
  if (isrational(p1) && isrational(p2)) {
    return qmul(p1, p2);
  }

  const a = isdouble(p1) ? p1.d : convert_rational_to_double(p1);
  const b = isdouble(p2) ? p2.d : convert_rational_to_double(p2);

  return new Double(a * b);
}

export function divide_numbers(
  p1: Num | Double,
  p2: Num | Double
): Num | Double {
  if (isrational(p1) && isrational(p2)) {
    return qdiv(p1, p2);
  }

  if (isZeroAtomOrTensor(p2)) {
    stop('divide by zero');
  }

  const a = isdouble(p1) ? p1.d : convert_rational_to_double(p1);
  const b = isdouble(p2) ? p2.d : convert_rational_to_double(p2);

  return new Double(a / b);
}

export function invert_number(p1: Num | Double): Num | Double {
  if (isZeroAtomOrTensor(p1)) {
    stop('divide by zero');
  }

  if (isdouble(p1)) {
    return new Double(1 / p1.d);
  }

  let a = bigInt(p1.q.a);
  let b = bigInt(p1.q.b);

  b = makeSignSameAs(b, a);
  a = setSignTo(a, 1);

  return new Num(b, a);
}

function compare_rationals(a: Num, b: Num): Sign {
  //unsigned int *ab, *ba
  const ab = mmul(a.q.a, b.q.b);
  const ba = mmul(a.q.b, b.q.a);
  return mcmp(ab, ba);
}

export function compare_numbers(a: Num | Double, b: Num | Double): Sign {
  if (isrational(a) && isrational(b)) {
    return compare_rationals(a, b);
  }

  const x = isdouble(a) ? a.d : convert_rational_to_double(a);
  const y = isdouble(b) ? b.d : convert_rational_to_double(b);

  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  return 0;
}

export function negate_number(p1: U): Num | Double | Tensor {
  if (isZeroAtomOrTensor(p1)) {
    return p1;
  }

  switch (p1.k) {
    case NUM:
      return new Num(bigInt(p1.q.a.multiply(bigInt.minusOne)), bigInt(p1.q.b));
    case DOUBLE:
      return new Double(-p1.d);
    default:
      stop('bug caught in mp_negate_number');
  }
}

export function bignum_truncate(p1: Num): Num {
  const a = mdiv(p1.q.a, p1.q.b);
  return new Num(a);
}

export function mp_numerator(p1: U): Num {
  if (!isrational(p1)) {
    return Constants.one;
  }
  return new Num(bigInt(p1.q.a));
}

export function mp_denominator(p1: U): Num {
  if (!isrational(p1)) {
    return Constants.one;
  }
  return new Num(bigInt(p1.q.b));
}

// expo is an integer
export function bignum_power_number(base: Num, expo: number): Num {
  let a = mpow(base.q.a, Math.abs(expo));
  let b = mpow(base.q.b, Math.abs(expo));

  if (expo < 0) {
    // swap a and b
    const t = a;
    a = b;
    b = t;

    a = makeSignSameAs(a, b);
    b = setSignTo(b, 1);
  }

  return new Num(a, b);
}

// p an array of ints
function convert_bignum_to_double(p) {
  return p.toJSNumber();
}

export function convert_rational_to_double(p: Num): number {
  if (p.q == null) {
    breakpoint;
  }
  const quotientAndRemainder = p.q.a.divmod(p.q.b);
  const result =
    quotientAndRemainder.quotient.toJSNumber() +
    quotientAndRemainder.remainder.toJSNumber() / p.q.b.toJSNumber();

  return result;
}

// n an integer
export function push_integer(n: number): void {
  if (DEBUG) {
    console.log(`pushing integer ${n}`);
  }
  push(integer(n));
}

export function integer(n: number): Num {
  return new Num(bigInt(n));
}

export function push_double(d: number): void {
  push(double(d));
}

export function double(d: number): Double {
  return new Double(d);
}

export function push_rational(
  a: number | bigInt.BigInteger,
  b: number | bigInt.BigInteger
): void {
  push(rational(a, b));
}

export function rational(
  a: number | bigInt.BigInteger,
  b: number | bigInt.BigInteger
): Num {
  // `as any as number` cast added because bigInt(number) and bigInt(bigInt.BigInteger)
  // are both accepted signatures, but bigInt(number|bigInt.BigInteger) is not
  return new Num(bigInt((a as any) as number), bigInt((b as any) as number));
}

export function pop_integer(): number {
  const p1 = pop();
  return nativeInt(p1);
}

export function nativeInt(p1: U): number {
  let n = NaN;
  switch (p1.k) {
    case NUM:
      if (isinteger(p1) && isSmall(p1.q.a)) {
        n = p1.q.a.toJSNumber();
      }
      break;
    case DOUBLE:
      if (DEBUG) {
        console.log('popping integer but double is found');
      }
      if (Math.floor(p1.d) === p1.d) {
        if (DEBUG) {
          console.log("...although it's an integer");
        }
        n = p1.d;
      }
      break;
  }
  return n;
}

export function bignum_scan_integer(s: string): U {
  let scounter = 0;

  const sign_ = s[scounter];

  if (sign_ === '+' || sign_ === '-') {
    scounter++;
  }

  // !!!! some mess in here, added an argument
  const a = bigInt(s.substring(scounter));

  let p1: U = new Num(a);

  if (sign_ === '-') {
    p1 = negate(p1);
  }
  return p1;
}

export function bignum_scan_float(s: string) {
  return double(parseFloat(s));
}

// gives the capability of printing the unsigned
// value. This is handy because printing of the sign
// might be taken care of "upstream"
// e.g. when printing a base elevated to a negative exponent
// prints the inverse of the base powered to the unsigned
// exponent.
export function print_number(p: U, signed: boolean): string {
  let accumulator = '';

  let denominatorString = '';
  const buf = '';
  switch (p.k) {
    case NUM:
      var aAsString = p.q.a.toString();
      if (!signed) {
        if (aAsString[0] === '-') {
          aAsString = aAsString.substring(1);
        }
      }

      if (defs.printMode === PRINTMODE_LATEX && isfraction(p)) {
        aAsString = '\\frac{' + aAsString + '}{';
      }

      accumulator += aAsString;

      if (isfraction(p)) {
        if (defs.printMode !== PRINTMODE_LATEX) {
          accumulator += '/';
        }
        denominatorString = p.q.b.toString();
        if (defs.printMode === PRINTMODE_LATEX) {
          denominatorString += '}';
        }

        accumulator += denominatorString;
      }
      break;

    case DOUBLE:
      aAsString = doubleToReasonableString(p.d);
      if (!signed) {
        if (aAsString[0] === '-') {
          aAsString = aAsString.substring(1);
        }
      }

      accumulator += aAsString;
      break;
  }

  return accumulator;
}

export function gcd_numbers(p1: Num, p2: Num): Num {
  //  if (!isinteger(p1) || !isinteger(p2))
  //    stop("integer args expected for gcd")

  const a = mgcd(p1.q.a, p2.q.a);
  const b = mgcd(p1.q.b, p2.q.b);

  return new Num(setSignTo(a, 1), b);
}

export function pop_double(): number {
  const p1 = pop();
  return nativeDouble(p1);
}

export function nativeDouble(p1: U): number {
  let d = 0.0;
  switch (p1.k) {
    case NUM:
      d = convert_rational_to_double(p1);
      break;
    case DOUBLE:
      ({ d } = p1);
      break;
    default:
      d = 0.0;
  }
  return d;
}

export function pop_number(): Num | Double {
  const n = pop();
  if (!isNumericAtom(n)) {
    stop('not a number');
  }
  return n;
}

export function bignum_float(n: Num): Double {
  const d = convert_rational_to_double(n);
  return new Double(d);
}

//static unsigned int *__factorial(int)

// n is an int
export function bignum_factorial(n: number): Num {
  return new Num(__factorial(n));
}

// n is an int
function __factorial(n: number): bigInt.BigInteger {
  let a: bigInt.BigInteger;
  // unsigned int *a, *b, *t

  if (n === 0 || n === 1) {
    a = bigInt(1);
    return a;
  }

  a = bigInt(2);

  let b = bigInt(0);

  if (3 <= n) {
    for (let i = 3; i <= n; i++) {
      b = bigInt(i);
      a = mmul(a, b);
    }
  }

  return a;
}

const mask = [
  0x00000001,
  0x00000002,
  0x00000004,
  0x00000008,
  0x00000010,
  0x00000020,
  0x00000040,
  0x00000080,
  0x00000100,
  0x00000200,
  0x00000400,
  0x00000800,
  0x00001000,
  0x00002000,
  0x00004000,
  0x00008000,
  0x00010000,
  0x00020000,
  0x00040000,
  0x00080000,
  0x00100000,
  0x00200000,
  0x00400000,
  0x00800000,
  0x01000000,
  0x02000000,
  0x04000000,
  0x08000000,
  0x10000000,
  0x20000000,
  0x40000000,
  0x80000000,
];

// unsigned int *x, unsigned int k
function mp_clr_bit(x, k) {
  console.log('not implemented yet');
  breakpoint;
  return (x[k / 32] &= ~mask[k % 32]);
}
