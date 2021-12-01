"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_gamma = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const sin_1 = require("./sin");
//-----------------------------------------------------------------------------
//
//  Author : philippe.billet@noos.fr
//
//  Gamma function gamma(x)
//
//-----------------------------------------------------------------------------
function Eval_gamma(p1) {
    const result = gamma(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_gamma = Eval_gamma;
function gamma(p1) {
    return gammaf(p1);
}
function gammaf(p1) {
    if (defs_1.isrational(p1) && defs_1.MEQUAL(p1.q.a, 1) && defs_1.MEQUAL(p1.q.b, 2)) {
        return power_1.power(defs_1.Constants.Pi(), bignum_1.rational(1, 2));
    }
    if (defs_1.isrational(p1) && defs_1.MEQUAL(p1.q.a, 3) && defs_1.MEQUAL(p1.q.b, 2)) {
        return multiply_1.multiply(power_1.power(defs_1.Constants.Pi(), bignum_1.rational(1, 2)), bignum_1.rational(1, 2));
    }
    //  if (p1->k == DOUBLE) {
    //    d = exp(lgamma(p1.d))
    //    push_double(d)
    //    return
    //  }
    if (is_1.isnegativeterm(p1)) {
        return multiply_1.divide(multiply_1.multiply(defs_1.Constants.Pi(), defs_1.Constants.negOne), multiply_1.multiply(multiply_1.multiply(sin_1.sine(multiply_1.multiply(defs_1.Constants.Pi(), p1)), p1), gamma(multiply_1.negate(p1))));
    }
    if (defs_1.isadd(p1)) {
        return gamma_of_sum(p1);
    }
    return list_1.makeList(defs_1.symbol(defs_1.GAMMA), p1);
}
function gamma_of_sum(p1) {
    const p3 = defs_1.cdr(p1);
    if (defs_1.isrational(defs_1.car(p3)) &&
        defs_1.MEQUAL(defs_1.car(p3).q.a, 1) &&
        defs_1.MEQUAL(defs_1.car(p3).q.b, 1)) {
        return multiply_1.multiply(defs_1.cadr(p3), gamma(defs_1.cadr(p3)));
    }
    if (defs_1.isrational(defs_1.car(p3)) &&
        defs_1.MEQUAL(defs_1.car(p3).q.a, -1) &&
        defs_1.MEQUAL(defs_1.car(p3).q.b, 1)) {
        return multiply_1.divide(gamma(defs_1.cadr(p3)), add_1.add(defs_1.cadr(p3), defs_1.Constants.negOne));
    }
    return list_1.makeList(defs_1.symbol(defs_1.GAMMA), p1);
}
