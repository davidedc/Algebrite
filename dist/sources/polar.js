"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polar = exports.Eval_polar = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const abs_1 = require("./abs");
const arg_1 = require("./arg");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
/*
Convert complex z to polar form

  Input:    p1  z
  Output:    Result

  polar(z) = abs(z) * exp(i * arg(z))
*/
function Eval_polar(p1) {
    const result = polar(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_polar = Eval_polar;
function polar(p1) {
    // there are points where we turn polar
    // representations into rect, we set a "stack flag"
    // here to avoid that, so we don't undo the
    // work that we are trying to do.
    return defs_1.evalPolar(() => {
        return multiply_1.multiply(abs_1.abs(p1), misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, arg_1.arg(p1))));
    });
}
exports.polar = polar;
