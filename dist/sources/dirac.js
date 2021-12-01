"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirac = exports.Eval_dirac = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const mmul_1 = require("./mmul");
const multiply_1 = require("./multiply");
//-----------------------------------------------------------------------------
//
//  Author : philippe.billet@noos.fr
//
//  Dirac function dirac(x)
//  dirac(-x)=dirac(x)
//  dirac(b-a)=dirac(a-b)
//-----------------------------------------------------------------------------
function Eval_dirac(p1) {
    const result = dirac(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_dirac = Eval_dirac;
function dirac(p1) {
    return ydirac(p1);
}
exports.dirac = dirac;
function ydirac(p1) {
    if (defs_1.isdouble(p1)) {
        if (p1.d === 0) {
            return defs_1.Constants.one;
        }
        return defs_1.Constants.zero;
    }
    if (defs_1.isrational(p1)) {
        if (defs_1.MZERO(mmul_1.mmul(p1.q.a, p1.q.b))) {
            return defs_1.Constants.one;
        }
        return defs_1.Constants.zero;
    }
    if (defs_1.ispower(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.DIRAC), defs_1.cadr(p1));
    }
    if (is_1.isnegativeterm(p1)) {
        return list_1.makeList(defs_1.symbol(defs_1.DIRAC), multiply_1.negate(p1));
    }
    if (is_1.isnegativeterm(p1) || (defs_1.isadd(p1) && is_1.isnegativeterm(defs_1.cadr(p1)))) {
        p1 = multiply_1.negate(p1);
    }
    return list_1.makeList(defs_1.symbol(defs_1.DIRAC), p1);
}
