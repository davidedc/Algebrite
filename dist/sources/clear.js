"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_clear = exports.clearRenamedVariablesToAvoidBindingToExternalScope = exports.do_clearall = exports.Eval_clearall = void 0;
const defs_1 = require("../runtime/defs");
const init_1 = require("../runtime/init");
const otherCFunctions_1 = require("../runtime/otherCFunctions");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const pattern_1 = require("./pattern");
/* clearall =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

General description
-------------------

Completely wipes all variables from the environment.

*/
function Eval_clearall() {
    let [p1, p6] = do_clearall();
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_clearall = Eval_clearall;
function do_clearall() {
    if (!defs_1.defs.test_flag) {
        otherCFunctions_1.clear_term();
    }
    pattern_1.do_clearPatterns();
    symbol_1.clear_symbols();
    let [p1, p6] = init_1.defn();
    return [(defs_1.defs.codeGen = false), p1, p6];
}
exports.do_clearall = do_clearall;
// clearall from application GUI code
function clearall() {
    return run_1.run('clearall');
}
// this transformation is done in run.coffee, see there
// for more info.
function clearRenamedVariablesToAvoidBindingToExternalScope() {
    for (let i = 0; i < defs_1.symtab.length; i++) {
        if (defs_1.symtab[i].printname.indexOf('AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE') !==
            -1) {
            // just clear it
            defs_1.symtab[i].k = defs_1.SYM;
            defs_1.symtab[i].printname = '';
            defs_1.binding[i] = defs_1.symtab[i];
            defs_1.isSymbolReclaimable[i] = true;
        }
    }
}
exports.clearRenamedVariablesToAvoidBindingToExternalScope = clearRenamedVariablesToAvoidBindingToExternalScope;
/* clear =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Completely wipes a variable from the environment (while doing x = quote(x) just unassigns it).

*/
function Eval_clear(p1) {
    let p2;
    p2 = defs_1.cdr(p1);
    while (defs_1.iscons(p2)) {
        const variableToBeCleared = defs_1.car(p2);
        //console.log variableToBeCleared + ""
        if (variableToBeCleared.k !== defs_1.SYM) {
            run_1.stop('symbol error');
        }
        //console.log "getting binding of " + p.toString()
        //if p.toString() == "aaa"
        //  breakpoint
        const indexFound = defs_1.symtab.indexOf(variableToBeCleared);
        defs_1.symtab[indexFound].k = defs_1.SYM;
        defs_1.symtab[indexFound].printname = '';
        defs_1.binding[indexFound] = defs_1.symtab[indexFound];
        defs_1.isSymbolReclaimable[indexFound] = true;
        p2 = defs_1.cdr(p2);
    }
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_clear = Eval_clear;
