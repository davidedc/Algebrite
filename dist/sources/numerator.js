"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numerator = exports.Eval_numerator = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const rationalize_1 = require("./rationalize");
function Eval_numerator(p1) {
    const result = numerator(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_numerator = Eval_numerator;
function numerator(p1) {
    if (defs_1.isadd(p1)) {
        //console.trace "rationalising "
        p1 = rationalize_1.rationalize(p1);
    }
    //console.log "rationalised: " + p1
    if (defs_1.ismultiply(p1) && !is_1.isplusone(defs_1.car(defs_1.cdr(p1)))) {
        //console.log "p1 inside multiply: " + p1
        //console.log "first term: " + car(p1)
        return multiply_1.multiply_all(p1.tail().map(numerator));
    }
    if (defs_1.isrational(p1)) {
        return bignum_1.mp_numerator(p1);
    }
    if (defs_1.ispower(p1) && is_1.isnegativeterm(defs_1.caddr(p1))) {
        return defs_1.Constants.one;
    }
    return p1;
}
exports.numerator = numerator;
