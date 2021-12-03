"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logarithm = exports.Eval_log = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const denominator_1 = require("./denominator");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const numerator_1 = require("./numerator");
// Natural logarithm.
//
// Note that we use the mathematics / Javascript / Mathematica
// convention that "log" is indeed the natural logarithm.
//
// In engineering, biology, astronomy, "log" can stand instead
// for the "common" logarithm i.e. base 10. Also note that Google
// calculations use log for the common logarithm.
function Eval_log(p1) {
    const result = logarithm(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_log = Eval_log;
function logarithm(p1) {
    if (p1 === defs_1.symbol(defs_1.E)) {
        return defs_1.Constants.one;
    }
    if (is_1.equaln(p1, 1)) {
        return defs_1.Constants.zero;
    }
    if (is_1.isnegativenumber(p1)) {
        return add_1.add(logarithm(multiply_1.negate(p1)), multiply_1.multiply(defs_1.Constants.imaginaryunit, defs_1.Constants.Pi()));
    }
    if (defs_1.isdouble(p1)) {
        return bignum_1.double(Math.log(p1.d));
    }
    // rational number and not an integer?
    if (is_1.isfraction(p1)) {
        return add_1.subtract(logarithm(numerator_1.numerator(p1)), logarithm(denominator_1.denominator(p1)));
    }
    // log(a ^ b) --> b log(a)
    if (defs_1.ispower(p1)) {
        return multiply_1.multiply(defs_1.caddr(p1), logarithm(defs_1.cadr(p1)));
    }
    // log(a * b) --> log(a) + log(b)
    if (defs_1.ismultiply(p1)) {
        return p1.tail().map(logarithm).reduce(add_1.add, defs_1.Constants.zero);
    }
    return list_1.makeList(defs_1.symbol(defs_1.LOG), p1);
}
exports.logarithm = logarithm;
