"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lcm = exports.Eval_lcm = void 0;
const gcd_1 = require("./gcd");
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
// Find the least common multiple of two expressions.
function Eval_lcm(p1) {
    p1 = defs_1.cdr(p1);
    let result = eval_1.Eval(defs_1.car(p1));
    if (defs_1.iscons(p1)) {
        result = p1.tail().reduce((a, b) => lcm(a, eval_1.Eval(b)), result);
    }
    stack_1.push(result);
}
exports.Eval_lcm = Eval_lcm;
function lcm(p1, p2) {
    return defs_1.doexpand(yylcm, p1, p2);
}
exports.lcm = lcm;
function yylcm(p1, p2) {
    return multiply_1.inverse(multiply_1.divide(multiply_1.divide(gcd_1.gcd(p1, p2), p1), p2));
}
