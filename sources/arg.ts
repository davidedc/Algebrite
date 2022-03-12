import {
  ARG,
  ASSUME_REAL_VARIABLES,
  breakpoint,
  caddr,
  cadr,
  Constants,
  defs,
  E,
  isadd,
  isdouble,
  ismultiply,
  ispower,
  issymbol,
  PI,
  U,
} from '../runtime/defs';
import { push } from '../runtime/stack';
import {get_binding, symbol} from '../runtime/symbol';
import { add, subtract } from './add';
import { arctan } from './arctan';
import { denominator } from './denominator';
import { Eval } from './eval';
import { imag } from './imag';
import {
  equaln,
  isnegative,
  isnegativenumber,
  isoneovertwo,
  ispositivenumber,
  isZeroAtomOrTensor,
} from './is';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { numerator } from './numerator';
import { real } from './real';
import { rect } from './rect';

/* arg =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
z

General description
-------------------
Returns the angle of complex z.

*/

/*
 Argument (angle) of complex z

  z    arg(z)
  -    ------

  a    0

  -a    -pi      See note 3 below

  (-1)^a    a pi

  exp(a + i b)  b

  a b    arg(a) + arg(b)

  a + i b    arctan(b/a)

Result by quadrant

  z    arg(z)
  -    ------

  1 + i    1/4 pi

  1 - i    -1/4 pi

  -1 + i    3/4 pi

  -1 - i    -3/4 pi

Notes

  1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

  2. Symbols in z are assumed to be positive and real.

  3. Negative direction adds -pi to angle.

     Example: z = (-1)^(1/3), abs(z) = 1/3 pi, abs(-z) = -2/3 pi

  4. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

    arg(numerator(z)) - arg(denominator(z))

     must be used to get the correct answer. Now the operation is
     automatic.
*/

const DEBUG_ARG = false;

export function Eval_arg(z: U) {
  push(arg(Eval(cadr(z))));
}

export function arg(z: U): U {
  return subtract(yyarg(numerator(z)), yyarg(denominator(z)));
}

function yyarg(p1: U): U {
  // case of plain number
  if (ispositivenumber(p1) || p1 === symbol(PI)) {
    return isdouble(p1) || defs.evaluatingAsFloats
      ? Constants.zeroAsDouble
      : Constants.zero;
  }

  if (isnegativenumber(p1)) {
    const pi =
      isdouble(p1) || defs.evaluatingAsFloats
        ? Constants.piAsDouble
        : symbol(PI);
    return negate(pi);
  }

  // you'd think that something like
  // arg(a) is always 0 when a is real but no,
  // arg(a) is pi when a is negative so we have
  // to leave unexpressed
  if (issymbol(p1)) {
    return makeList(symbol(ARG), p1);
  }

  if (ispower(p1) && equaln(cadr(p1), -1)) {
    // -1 to a power
    return multiply(Constants.Pi(), caddr(p1));
  }

  if (ispower(p1) && cadr(p1) === symbol(E)) {
    // exponential
    // arg(a^(1/2)) is always equal to 1/2 * arg(a)
    // this can obviously be made more generic TODO
    return imag(caddr(p1));
  }

  if (ispower(p1) && isoneovertwo(caddr(p1))) {
    const arg1 = arg(cadr(p1));
    if (DEBUG_ARG) {
      console.log(`arg of a sqrt: ${p1}`);
      breakpoint;
      console.log(` = 1/2 * ${arg1}`);
    }
    return multiply(arg1, caddr(p1));
  }

  if (ismultiply(p1)) {
    // product of factors
    return p1.tail().map(arg).reduce(add, Constants.zero);
  }

  if (isadd(p1)) {
    // sum of terms
    p1 = rect(p1);
    const RE = real(p1);
    const IM = imag(p1);
    if (isZeroAtomOrTensor(RE)) {
      if (isnegative(IM)) {
        return negate(Constants.Pi());
      } else {
        return Constants.Pi();
      }
    } else {
      const arg1 = arctan(divide(IM, RE));
      if (isnegative(RE)) {
        if (isnegative(IM)) {
          return subtract(arg1, Constants.Pi()); // quadrant 1 -> 3
        } else {
          return add(arg1, Constants.Pi()); // quadrant 4 -> 2
        }
      }
      return arg1;
    }
  }
  if (!isZeroAtomOrTensor(get_binding(symbol(ASSUME_REAL_VARIABLES)))) {
    // if we assume all passed values are real
    return Constants.zero;
  }

  // if we don't assume all passed values are real, all
  // we con do is to leave unexpressed
  return makeList(symbol(ARG), p1);
}
