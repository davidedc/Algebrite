"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.absval = exports.abs = exports.absValFloat = exports.Eval_abs = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const conj_1 = require("./conj");
const denominator_1 = require("./denominator");
const eval_1 = require("./eval");
const float_1 = require("./float");
const imag_1 = require("./imag");
const inner_1 = require("./inner");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const numerator_1 = require("./numerator");
const power_1 = require("./power");
const real_1 = require("./real");
const rect_1 = require("./rect");
const simplify_1 = require("./simplify");
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
function Eval_abs(p1) {
    const result = abs(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_abs = Eval_abs;
function absValFloat(p1) {
    return float_1.zzfloat(eval_1.Eval(absval(eval_1.Eval(p1))));
}
exports.absValFloat = absValFloat;
// zzfloat of an abs doesn't necessarily result in a double
// , for example if there are variables. But
// in many of the tests there should be indeed
// a float, these two lines come handy to highlight
// when that doesn't happen for those tests.
//if !isdouble(stack[tos-1])
//  stop("absValFloat should return a double and instead got: " + stack[tos-1])
function abs(p1) {
    const numer = numerator_1.numerator(p1);
    const absNumer = absval(numer);
    const denom = denominator_1.denominator(p1);
    const absDenom = absval(denom);
    const result = multiply_1.divide(absNumer, absDenom);
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
exports.abs = abs;
function absval(p1) {
    const input = p1;
    if (DEBUG_ABS) {
        console.log(`ABS of ${p1}`);
    }
    // handle all the "number" cases first -----------------------------------------
    if (is_1.isZeroAtomOrTensor(p1)) {
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} just zero`);
            console.log(' --> ABS of ' + input + ' : ' + defs_1.Constants.zero);
        }
        return defs_1.Constants.zero;
    }
    if (is_1.isnegativenumber(p1)) {
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} just a negative`);
        }
        return multiply_1.negate(p1);
    }
    if (is_1.ispositivenumber(p1)) {
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} just a positive`);
            console.log(` --> ABS of ${input} : ${p1}`);
        }
        return p1;
    }
    if (p1 === defs_1.symbol(defs_1.PI)) {
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
    if (defs_1.isadd(p1) &&
        (find_1.findPossibleClockForm(p1, p1) ||
            find_1.findPossibleExponentialForm(p1) ||
            find_1.Find(p1, defs_1.Constants.imaginaryunit))) {
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} is a sum`);
            console.log('abs of a sum');
        }
        // sum
        p1 = rect_1.rect(p1); // convert polar terms, if any
        const result = simplify_1.simplify_trig(power_1.power(
        // prettier-ignore
        add_1.add(power_1.power(real_1.real(p1), bignum_1.integer(2)), power_1.power(imag_1.imag(p1), bignum_1.integer(2))), bignum_1.rational(1, 2)));
        if (DEBUG_ABS) {
            console.log(` --> ABS of ${input} : ${result}`);
        }
        return result;
    }
    if (defs_1.ispower(p1) && is_1.equaln(defs_1.cadr(p1), -1)) {
        // -1 to any power
        const one = defs_1.Constants.One();
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} is -1 to any power`);
            const msg = defs_1.defs.evaluatingAsFloats
                ? ' abs: numeric, so result is 1.0'
                : ' abs: symbolic, so result is 1';
            console.log(msg);
            console.log(` --> ABS of ${input} : ${one}`);
        }
        return one;
    }
    // abs(a^b) is equal to abs(a)^b IF b is positive
    if (defs_1.ispower(p1) && is_1.ispositivenumber(defs_1.caddr(p1))) {
        const result = power_1.power(abs(defs_1.cadr(p1)), defs_1.caddr(p1));
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} is something to the power of a positive number`);
            console.log(` --> ABS of ${input} : ${result}`);
        }
        return result;
    }
    // abs(e^something)
    if (defs_1.ispower(p1) && defs_1.cadr(p1) === defs_1.symbol(defs_1.E)) {
        // exponential
        const result = misc_1.exponential(real_1.real(defs_1.caddr(p1)));
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} is an exponential`);
            console.log(` --> ABS of ${input} : ${result}`);
        }
        return result;
    }
    if (defs_1.ismultiply(p1)) {
        // product
        const result = p1.tail().map(absval).reduce(multiply_1.multiply);
        if (DEBUG_ABS) {
            console.log(` abs: ${p1} is a product`);
            console.log(` --> ABS of ${input} : ${result}`);
        }
        return result;
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.ABS)) {
        const absOfAbs = list_1.makeList(defs_1.symbol(defs_1.ABS), defs_1.cadr(p1));
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
    if (defs_1.istensor(p1)) {
        return absval_tensor(p1);
    }
    if (is_1.isnegativeterm(p1) || (defs_1.isadd(p1) && is_1.isnegativeterm(defs_1.cadr(p1)))) {
        p1 = multiply_1.negate(p1);
    }
    const l = list_1.makeList(defs_1.symbol(defs_1.ABS), p1);
    if (DEBUG_ABS) {
        console.log(` abs: ${p1} is nothing decomposable`);
        console.log(` --> ABS of ${input} : ${l}`);
    }
    return l;
}
exports.absval = absval;
// also called the "norm" of a vector
function absval_tensor(p1) {
    if (p1.tensor.ndim !== 1) {
        run_1.stop('abs(tensor) with tensor rank > 1');
    }
    return eval_1.Eval(simplify_1.simplify(power_1.power(inner_1.inner(p1, conj_1.conjugate(p1)), bignum_1.rational(1, 2))));
}
