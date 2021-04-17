import {
  ABS,
  caddr,
  cadr,
  car,
  Constants,
  defs,
  E,
  isadd,
  ismultiply,
  ispower,
  istensor,
  PI,
  symbol,
  Tensor,
  U,
} from '../runtime/defs';
import {
  Find,
  findPossibleClockForm,
  findPossibleExponentialForm,
} from '../runtime/find';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { exponential } from '../sources/misc';
import { add } from './add';
import { integer, rational } from './bignum';
import { conjugate } from './conj';
import { denominator } from './denominator';
import { Eval } from './eval';
import { zzfloat } from './float';
import { imag } from './imag';
import { inner } from './inner';
import {
  equaln,
  isnegativenumber,
  isnegativeterm,
  ispositivenumber,
  isZeroAtomOrTensor,
} from './is';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { numerator } from './numerator';
import { power } from './power';
import { real } from './real';
import { rect } from './rect';
import { simplify, simplify_trig } from './simplify';

//(docs are generated from top-level comments, keep an eye on the formatting!)

/* abs =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the absolute value of a real number, the magnitude of a complex number, or the vector length.

*/

/*
 Absolute value of a number,or magnitude of complex z, or norm of a vector

  z    abs(z)
  -    ------

  a    a

  -a    a

  (-1)^a    1

  exp(a + i b)  exp(a)

  a b    abs(a) abs(b)

  a + i b    sqrt(a^2 + b^2)

Notes

  1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

  2. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

    abs(numerator(z)) / abs(denominator(z))

     must be used to get the correct answer. Now the operation is
     automatic.
*/

const DEBUG_ABS = false;

export function Eval_abs(p1: U) {
  push(cadr(p1));
  Eval();
  push(abs(pop()));
}

export function absValFloat(p1: U): U {
  push(p1);
  Eval();
  push(absval(pop()));
  Eval(); // normalize
  return zzfloat(pop());
}
// zzfloat of an abs doesn't necessarily result in a double
// , for example if there are variables. But
// in many of the tests there should be indeed
// a float, these two lines come handy to highlight
// when that doesn't happen for those tests.
//if !isdouble(stack[tos-1])
//  stop("absValFloat should return a double and instead got: " + stack[tos-1])

export function abs(p1: U): U {
  const numer = numerator(p1);
  const absNumer = absval(numer);
  const denom = denominator(p1);
  const absDenom = absval(denom);
  const result = divide(absNumer, absDenom);

  if (DEBUG_ABS) {
    console.trace('>>>>  ABS of ' + p1);
    console.log(`ABS numerator ${numer}`);
    console.log(`ABSVAL numerator: ${absNumer}`);
    console.log(`ABS denominator: ${denom}`);
    console.log(`ABSVAL denominator: ${absDenom}`);
    console.log(`ABSVAL divided: ${result}`);
    console.log('<<<<<<<  ABS');
  }
  return result;
}

export function absval(p1: U): U {
  const input = p1;

  if (DEBUG_ABS) {
    console.log(`ABS of ${p1}`);
  }

  // handle all the "number" cases first -----------------------------------------
  if (isZeroAtomOrTensor(p1)) {
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} just zero`);
      console.log(' --> ABS of ' + input + ' : ' + Constants.zero);
    }
    return Constants.zero;
  }

  if (isnegativenumber(p1)) {
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} just a negative`);
    }
    return negate(p1);
  }

  if (ispositivenumber(p1)) {
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} just a positive`);
      console.log(` --> ABS of ${input} : ${p1}`);
    }
    return p1;
  }

  if (p1 === symbol(PI)) {
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} of PI`);
      console.log(` --> ABS of ${input} : ${p1}`);
    }
    return p1;
  }

  // ??? should there be a shortcut case here for the imaginary unit?

  // now handle decomposition cases ----------------------------------------------

  // we catch the "add", "power", "multiply" cases first,
  // before falling back to the
  // negative/positive cases because there are some
  // simplification thay we might be able to do.
  // Note that for this routine to give a correct result, this
  // must be a sum where a complex number appears.
  // If we apply this to "a+b", we get an incorrect result.
  if (
    isadd(p1) &&
    (findPossibleClockForm(p1, p1) ||
      findPossibleExponentialForm(p1) ||
      Find(p1, Constants.imaginaryunit))
  ) {
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} is a sum`);
      console.log('abs of a sum');
    }
    // sum
    p1 = rect(p1); // convert polar terms, if any

    const result = simplify_trig(
      power(
        // prettier-ignore
        add(
          power(real(p1), integer(2)),
          power(imag(p1), integer(2))
        ),
        rational(1, 2)
      )
    );
    if (DEBUG_ABS) {
      console.log(` --> ABS of ${input} : ${result}`);
    }
    return result;
  }

  if (ispower(p1) && equaln(cadr(p1), -1)) {
    // -1 to any power
    const one = Constants.One();

    if (DEBUG_ABS) {
      console.log(` abs: ${p1} is -1 to any power`);
      if (defs.evaluatingAsFloats) {
        console.log(' abs: numeric, so result is 1.0');
      } else {
        console.log(' abs: symbolic, so result is 1');
      }
      console.log(` --> ABS of ${input} : ${one}`);
    }

    return one;
  }

  // abs(a^b) is equal to abs(a)^b IF b is positive
  if (ispower(p1) && ispositivenumber(caddr(p1))) {
    const result = power(abs(cadr(p1)), caddr(p1));
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} is something to the power of a positive number`);
      console.log(` --> ABS of ${input} : ${result}`);
    }
    return result;
  }

  // abs(e^something)
  if (ispower(p1) && cadr(p1) === symbol(E)) {
    // exponential
    const result = exponential(real(caddr(p1)));
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} is an exponential`);
      console.log(` --> ABS of ${input} : ${result}`);
    }
    return result;
  }

  if (ismultiply(p1)) {
    // product
    const result = p1.tail().map(absval).reduce(multiply);

    if (DEBUG_ABS) {
      console.log(` abs: ${p1} is a product`);
      console.log(` --> ABS of ${input} : ${result}`);
    }
    return result;
  }

  if (car(p1) === symbol(ABS)) {
    const absOfAbs = makeList(symbol(ABS), cadr(p1));
    if (DEBUG_ABS) {
      console.log(` abs: ${p1} is abs of a abs`);
      console.log(` --> ABS of ${input} : ${absOfAbs}`);
    }
    return absOfAbs;
  }

  /*
  * Evaluation via zzfloat()
  * ...while this is in theory a powerful mechanism, I've commented it
  * out because I've refined this method enough to not need this.
  * Evaling via zzfloat() is in principle more problematic because it could
  * require further evaluations which could end up in further "abs" which
  * would end up in infinite loops. Better not use it if not necessary.

  * we look directly at the float evaluation of the argument
  * to see if we end up with a number, which would mean that there
  * is no imaginary component and we can just return the input
  * (or its negation) as the result.
  push p1
  zzfloat()
  floatEvaluation = pop()

  if (isnegativenumber(floatEvaluation))
    if DEBUG_ABS then console.log " abs: " + p1 + " just a negative"
    push(p1)
    negate()
    restore()
    return

  if (ispositivenumber(floatEvaluation))
    if DEBUG_ABS then console.log " abs: " + p1 + " just a positive"
    push(p1)
    if DEBUG_ABS then console.log " --> ABS of " + input + " : " + stack[tos-1]
    restore()
    return
  */

  if (istensor(p1)) {
    return absval_tensor(p1);
  }

  if (isnegativeterm(p1) || (isadd(p1) && isnegativeterm(cadr(p1)))) {
    p1 = negate(p1);
  }

  const l = makeList(symbol(ABS), p1);
  if (DEBUG_ABS) {
    console.log(` abs: ${p1} is nothing decomposable`);
    console.log(` --> ABS of ${input} : ${l}`);
  }
  return l;
}

// also called the "norm" of a vector
function absval_tensor(p1: Tensor): U {
  if (p1.tensor.ndim !== 1) {
    stop('abs(tensor) with tensor rank > 1');
  }

  push(simplify(power(inner(p1, conjugate(p1)), rational(1, 2))));
  Eval();
  return pop();
}
