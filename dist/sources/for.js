"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_for = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
// 'for' function
/*
x=0
y=2
for(do(x=sqrt(2+x),y=2*y/x),k,1,9)
float(y)

X: k
B: 1...9

1st parameter is the body
2nd parameter is the variable to loop with
3rd and 4th are the limits

*/
//define A p3
//define B p4
//define I p5
//define X p6
function Eval_for(p1) {
    const loopingVariable = defs_1.caddr(p1);
    if (!defs_1.issymbol(loopingVariable)) {
        run_1.stop('for: 2nd arg should be the variable to loop over');
    }
    const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
    if (isNaN(j)) {
        stack_1.push(p1);
        return;
    }
    const k = eval_1.evaluate_integer(defs_1.caddddr(p1));
    if (isNaN(k)) {
        stack_1.push(p1);
        return;
    }
    // remember contents of the index
    // variable so we can put it back after the loop
    const p4 = symbol_1.get_binding(loopingVariable);
    for (let i = j; i <= k; i++) {
        symbol_1.set_binding(loopingVariable, bignum_1.integer(i));
        eval_1.Eval(defs_1.cadr(p1));
    }
    // put back the index variable to original content
    symbol_1.set_binding(loopingVariable, p4);
    // return value
    symbol_1.push_symbol(defs_1.NIL);
}
exports.Eval_for = Eval_for;
