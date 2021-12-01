"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_sum = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
// 'sum' function
//define A p3
//define B p4
//define I p5
//define X p6
// leaves the sum at the top of the stack
function Eval_sum(p1) {
    const result = _sum(p1);
    stack_1.push(result);
}
exports.Eval_sum = Eval_sum;
function _sum(p1) {
    // 1st arg
    const body = defs_1.cadr(p1);
    // 2nd arg (index)
    const indexVariable = defs_1.caddr(p1);
    if (!defs_1.issymbol(indexVariable)) {
        run_1.stop('sum: 2nd arg?');
    }
    // 3rd arg (lower limit)
    const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
    if (isNaN(j)) {
        return p1;
    }
    // 4th arg (upper limit)
    const k = eval_1.evaluate_integer(defs_1.caddddr(p1));
    if (isNaN(k)) {
        return p1;
    }
    // remember contents of the index
    // variable so we can put it back after the loop
    const p4 = symbol_1.get_binding(indexVariable);
    let temp = defs_1.Constants.zero;
    for (let i = j; i <= k; i++) {
        symbol_1.set_binding(indexVariable, bignum_1.integer(i));
        temp = add_1.add(temp, eval_1.Eval(body));
    }
    // put back the index variable to original content
    symbol_1.set_binding(indexVariable, p4);
    return temp;
}
