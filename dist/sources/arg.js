"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arg = exports.Eval_arg = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const add_1 = require("./add");
const arctan_1 = require("./arctan");
const denominator_1 = require("./denominator");
const eval_1 = require("./eval");
const imag_1 = require("./imag");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const numerator_1 = require("./numerator");
const real_1 = require("./real");
const rect_1 = require("./rect");
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
function Eval_arg(z) {
    stack_1.push(arg(eval_1.Eval(defs_1.cadr(z))));
}
exports.Eval_arg = Eval_arg;
function arg(z) {
    return add_1.subtract(yyarg(numerator_1.numerator(z)), yyarg(denominator_1.denominator(z)));
}
exports.arg = arg;
function yyarg(p1) {
    // case of plain number
    if (is_1.ispositivenumber(p1) || p1 === defs_1.symbol(defs_1.PI)) {
        return defs_1.isdouble(p1) || defs_1.defs.evaluatingAsFloats
            ? defs_1.Constants.zeroAsDouble
            : defs_1.Constants.zero;
    }
    if (is_1.isnegativenumber(p1)) {
        const pi = defs_1.isdouble(p1) || defs_1.defs.evaluatingAsFloats
            ? defs_1.Constants.piAsDouble
            : defs_1.symbol(defs_1.PI);
        return multiply_1.negate(pi);
    }
    // you'd think that something like
    // arg(a) is always 0 when a is real but no,
    // arg(a) is pi when a is negative so we have
    // to leave unexpressed
    if (defs_1.issymbol(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.ARG), p1);
    }
    if (defs_1.ispower(p1) && is_1.equaln(defs_1.cadr(p1), -1)) {
        // -1 to a power
        return multiply_1.multiply(defs_1.Constants.Pi(), defs_1.caddr(p1));
    }
    if (defs_1.ispower(p1) && defs_1.cadr(p1) === defs_1.symbol(defs_1.E)) {
        // exponential
        // arg(a^(1/2)) is always equal to 1/2 * arg(a)
        // this can obviously be made more generic TODO
        return imag_1.imag(defs_1.caddr(p1));
    }
    if (defs_1.ispower(p1) && is_1.isoneovertwo(defs_1.caddr(p1))) {
        const arg1 = arg(defs_1.cadr(p1));
        if (DEBUG_ARG) {
            console.log(`arg of a sqrt: ${p1}`);
            defs_1.breakpoint;
            console.log(` = 1/2 * ${arg1}`);
        }
        return multiply_1.multiply(arg1, defs_1.caddr(p1));
    }
    if (defs_1.ismultiply(p1)) {
        // product of factors
        return p1.tail().map(arg).reduce(add_1.add, defs_1.Constants.zero);
    }
    if (defs_1.isadd(p1)) {
        // sum of terms
        p1 = rect_1.rect(p1);
        const RE = real_1.real(p1);
        const IM = imag_1.imag(p1);
        if (is_1.isZeroAtomOrTensor(RE)) {
            if (is_1.isnegative(IM)) {
                return multiply_1.negate(defs_1.Constants.Pi());
            }
            else {
                return defs_1.Constants.Pi();
            }
        }
        else {
            const arg1 = arctan_1.arctan(multiply_1.divide(IM, RE));
            if (is_1.isnegative(RE)) {
                if (is_1.isnegative(IM)) {
                    return add_1.subtract(arg1, defs_1.Constants.Pi()); // quadrant 1 -> 3
                }
                else {
                    return add_1.add(arg1, defs_1.Constants.Pi()); // quadrant 4 -> 2
                }
            }
            return arg1;
        }
    }
    if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
        // if we assume all passed values are real
        return defs_1.Constants.zero;
    }
    // if we don't assume all passed values are real, all
    // we con do is to leave unexpressed
    return list_1.makeList(defs_1.symbol(defs_1.ARG), p1);
}
