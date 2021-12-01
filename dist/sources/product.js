"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_product = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
// 'product' function
//define A p3
//define B p4
//define I p5
//define X p6
// leaves the product at the top of the stack
function Eval_product(p1) {
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
        stack_1.push(p1);
        return;
    }
    // 4th arg (upper limit)
    const k = eval_1.evaluate_integer(defs_1.caddddr(p1));
    if (isNaN(k)) {
        stack_1.push(p1);
        return;
    }
    // remember contents of the index
    // variable so we can put it back after the loop
    const oldIndexVariableValue = symbol_1.get_binding(indexVariable);
    let temp = defs_1.Constants.one;
    for (let i = j; i <= k; i++) {
        symbol_1.set_binding(indexVariable, bignum_1.integer(i));
        const arg2 = eval_1.Eval(body);
        temp = multiply_1.multiply(temp, arg2);
        if (defs_1.DEBUG) {
            console.log(`product - factor 1: ${arg2}`);
            console.log(`product - factor 2: ${temp}`);
            console.log(`product - result: ${stack_1.top()}`);
        }
    }
    stack_1.push(temp);
    // put back the index variable to original content
    symbol_1.set_binding(indexVariable, oldIndexVariableValue);
}
exports.Eval_product = Eval_product;
