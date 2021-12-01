"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_binomial = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const eval_1 = require("./eval");
const factorial_1 = require("./factorial");
const multiply_1 = require("./multiply");
//  Binomial coefficient
//
//  Input:    tos-2    n
//
//      tos-1    k
//
//  Output:    Binomial coefficient on stack
//
//  binomial(n, k) = n! / k! / (n - k)!
//
//  The binomial coefficient vanishes for k < 0 or k > n. (A=B, p. 19)
function Eval_binomial(p1) {
    const N = eval_1.Eval(defs_1.cadr(p1));
    const K = eval_1.Eval(defs_1.caddr(p1));
    const result = binomial(N, K);
    stack_1.push(result);
}
exports.Eval_binomial = Eval_binomial;
function binomial(N, K) {
    return ybinomial(N, K);
}
function ybinomial(N, K) {
    if (!BINOM_check_args(N, K)) {
        return defs_1.Constants.zero;
    }
    return multiply_1.divide(multiply_1.divide(factorial_1.factorial(N), factorial_1.factorial(K)), factorial_1.factorial(add_1.subtract(N, K)));
}
function BINOM_check_args(N, K) {
    if (defs_1.isNumericAtom(N) && misc_1.lessp(N, defs_1.Constants.zero)) {
        return false;
    }
    else if (defs_1.isNumericAtom(K) && misc_1.lessp(K, defs_1.Constants.zero)) {
        return false;
    }
    else if (defs_1.isNumericAtom(N) && defs_1.isNumericAtom(K) && misc_1.lessp(N, K)) {
        return false;
    }
    else {
        return true;
    }
}
