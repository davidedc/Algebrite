"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_function_reference = exports.define_user_function = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const eval_1 = require("./eval");
const list_1 = require("./list");
// Store a function definition
//
// Example:
//
//      f(x,y)=x^y
//
// For this definition, p1 points to the following structure.
//
//     p1
//      |
//   ___v__    ______                        ______
//  |CONS  |->|CONS  |--------------------->|CONS  |
//  |______|  |______|                      |______|
//      |         |                             |
//   ___v__    ___v__    ______    ______    ___v__    ______    ______
//  |SETQ  |  |CONS  |->|CONS  |->|CONS  |  |CONS  |->|CONS  |->|CONS  |
//  |______|  |______|  |______|  |______|  |______|  |______|  |______|
//                |         |         |         |         |         |
//             ___v__    ___v__    ___v__    ___v__    ___v__    ___v__
//            |SYM f |  |SYM x |  |SYM y |  |POWER |  |SYM x |  |SYM y |
//            |______|  |______|  |______|  |______|  |______|  |______|
//
// the result (in f) is a FUNCTION node
// that contains both the body and the argument list.
//
// We have
//
//  caadr(p1) points to the function name i.e. f
//  cdadr(p1) points to the arguments i.e. the list (x y)
//  caddr(p1) points to the function body i.e. (power x y)
// F function name
// A argument list
// B function body
function define_user_function(p1) {
    const F = defs_1.caadr(p1);
    const A = defs_1.cdadr(p1);
    let B = defs_1.caddr(p1);
    if (!defs_1.issymbol(F)) {
        run_1.stop('function name?');
    }
    // evaluate function body (maybe)
    if (defs_1.car(B) === defs_1.symbol(defs_1.EVAL)) {
        B = eval_1.Eval(defs_1.cadr(B));
    }
    // note how, unless explicitly forced by an eval,
    // (handled by the if just above)
    // we don't eval/simplify
    // the body.
    // Why? because it's the easiest way
    // to solve scope problems i.e.
    //   x = 0
    //   f(x) = x + 1
    //   f(4) # would reply 1
    // which would need to otherwise
    // be solved by some scope device
    // somehow
    B = list_1.makeList(defs_1.symbol(defs_1.FUNCTION), B, A);
    symbol_1.set_binding(F, B);
    // return value is nil
    symbol_1.push_symbol(defs_1.NIL);
}
exports.define_user_function = define_user_function;
function Eval_function_reference(p1) {
    stack_1.push(p1);
}
exports.Eval_function_reference = Eval_function_reference;
