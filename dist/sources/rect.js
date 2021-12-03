"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rect = exports.Eval_rect = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const abs_1 = require("./abs");
const add_1 = require("./add");
const arg_1 = require("./arg");
const cos_1 = require("./cos");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const sin_1 = require("./sin");
/*
Convert complex z to rectangular form

  Input:    push  z

  Output:    Result on stack
*/
const DEBUG_RECT = false;
function Eval_rect(p1) {
    const result = rect(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_rect = Eval_rect;
function rect(p1) {
    const input = p1;
    if (DEBUG_RECT) {
        console.log(`RECT of ${input}`);
        console.log(`any clock forms in : ${input} ? ${find_1.findPossibleClockForm(input, p1)}`);
    }
    // if we assume real variables, then the
    // rect of any symbol is the symbol itself
    // (note that 'i' is not a symbol, it's made of (-1)^(1/2))
    // otherwise we have to leave unevalled
    if (defs_1.issymbol(p1)) {
        if (DEBUG_RECT) {
            console.log(` rect: simple symbol: ${input}`);
        }
        if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
            return p1;
        }
        return list_1.makeList(defs_1.symbol(defs_1.YYRECT), p1);
        // TODO this is quite dirty, ideally we don't need this
        // but removing this creates a few failings in the tests
        // that I can't investigate right now.
        // --
        // if we assume all variables are real AND
        // it's not an exponential nor a polar nor a clock form
        // THEN rect(_) = _
        // note that these matches can be quite sloppy, one can find expressions
        // which shouldn't match but do
        //
    }
    if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES))) &&
        !find_1.findPossibleExponentialForm(p1) && // no exp form?
        !find_1.findPossibleClockForm(p1, p1) && // no clock form?
        !(find_1.Find(p1, defs_1.symbol(defs_1.SIN)) &&
            find_1.Find(p1, defs_1.symbol(defs_1.COS)) &&
            find_1.Find(p1, defs_1.Constants.imaginaryunit))) {
        // no polar form?
        if (DEBUG_RECT) {
            console.log(` rect: simple symbol: ${input}`);
        }
        return p1; // ib
    }
    if (defs_1.ismultiply(p1) &&
        is_1.isimaginaryunit(defs_1.cadr(p1)) &&
        !is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
        return p1; // sum
    }
    if (defs_1.isadd(p1)) {
        if (DEBUG_RECT) {
            console.log(` rect - ${input} is a sum `);
        }
        return p1.tail().reduce((a, b) => add_1.add(a, rect(b)), defs_1.Constants.zero);
    }
    // try to get to the rectangular form by doing
    // abs(p1) * (cos (theta) + i * sin(theta))
    // where theta is arg(p1)
    // abs(z) * (cos(arg(z)) + i sin(arg(z)))
    const result = multiply_1.multiply(abs_1.abs(p1), add_1.add(cos_1.cosine(arg_1.arg(p1)), multiply_1.multiply(defs_1.Constants.imaginaryunit, sin_1.sine(arg_1.arg(p1)))));
    if (DEBUG_RECT) {
        console.log(` rect - ${input} is NOT a sum `);
        console.log(` rect - ${input} abs: ${abs_1.abs(p1)}`);
        console.log(` rect - ${input} arg of ${p1} : ${p1}`);
        console.log(` rect - ${input} cosine: ${cos_1.cosine(arg_1.arg(p1))}`);
        console.log(` rect - ${input} sine: ${sin_1.sine(arg_1.arg(p1))}`);
        console.log(` rect - ${input} i * sine: ${multiply_1.multiply(defs_1.Constants.imaginaryunit, sin_1.sine(arg_1.arg(p1)))}`);
        console.log(` rect - ${input} cos + i * sine: ${add_1.add(cos_1.cosine(arg_1.arg(p1)), multiply_1.multiply(defs_1.Constants.imaginaryunit, sin_1.sine(arg_1.arg(p1))))}`);
        console.log(`rect of ${input} : ${result}`);
    }
    return result;
}
exports.rect = rect;
