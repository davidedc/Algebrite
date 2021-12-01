"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.erfc = exports.Eval_erfc = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
//-----------------------------------------------------------------------------
//
//  Author : philippe.billet@noos.fr
//
//  erfc(x)
//
//  GW  Added erfc() from Numerical Recipes in C
//
//-----------------------------------------------------------------------------
function Eval_erfc(p1) {
    const result = yerfc(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_erfc = Eval_erfc;
function yerfc(p1) {
    if (defs_1.isdouble(p1)) {
        const d = erfc(p1.d);
        return bignum_1.double(d);
    }
    if (is_1.isZeroAtomOrTensor(p1)) {
        return defs_1.Constants.one;
    }
    return list_1.makeList(defs_1.symbol(defs_1.ERFC), p1);
}
// from Numerical Recipes in C
function erfc(x) {
    if (x === 0) {
        return 1.0;
    }
    const z = Math.abs(x);
    const t = 1.0 / (1.0 + 0.5 * z);
    const ans = t *
        Math.exp(-z * z -
            1.26551223 +
            t *
                (1.00002368 +
                    t *
                        (0.37409196 +
                            t *
                                (0.09678418 +
                                    t *
                                        (-0.18628806 +
                                            t *
                                                (0.27886807 +
                                                    t *
                                                        (-1.13520398 +
                                                            t *
                                                                (1.48851587 +
                                                                    t * (-0.82215223 + t * 0.17087277)))))))));
    if (x >= 0.0) {
        return ans;
    }
    return 2.0 - ans;
}
exports.erfc = erfc;
