"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yycondense = exports.Condense = exports.Eval_condense = void 0;
const gcd_1 = require("./gcd");
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
// Condense an expression by factoring common terms.
function Eval_condense(p1) {
    const result = Condense(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_condense = Eval_condense;
function Condense(p1) {
    return defs_1.noexpand(yycondense, p1);
}
exports.Condense = Condense;
function yycondense(p1) {
    //expanding = 0
    if (!defs_1.isadd(p1)) {
        return p1;
    }
    // get gcd of all terms
    const termsGCD = p1.tail().reduce(gcd_1.gcd);
    //console.log "condense: this is the gcd of all the terms: " + stack[tos - 1]
    // divide each term by gcd
    const p2 = multiply_1.inverse(termsGCD);
    const temp2 = p1
        .tail()
        .reduce((a, b) => add_1.add(a, multiply_1.multiply_noexpand(p2, b)), defs_1.Constants.zero);
    // We multiplied above w/o expanding so some factors cancelled.
    // Now we expand which normalizes the result and, in some cases,
    // simplifies it too (see test case H).
    const arg1 = misc_1.yyexpand(temp2);
    // multiply result by gcd
    return multiply_1.divide(arg1, p2);
}
exports.yycondense = yycondense;
