"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_patternsinfo = exports.Eval_clearpatterns = exports.do_clearPatterns = exports.Eval_pattern = exports.Eval_silentpattern = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const misc_1 = require("../sources/misc");
const list_1 = require("./list");
const print_1 = require("./print");
/*
  Add a pattern i.e. a substitution rule.
  Substitution rule needs a template as first argument
  and what to transform it to as second argument.
  Optional third argument is a boolean test which
  adds conditions to when the rule is applied.
*/
// same as Eval_pattern but only leaves
// NIL on stack at return, hence gives no
// printout
function Eval_silentpattern(p1) {
    Eval_pattern(p1);
    stack_1.pop();
    symbol_1.push_symbol(defs_1.NIL);
}
exports.Eval_silentpattern = Eval_silentpattern;
function Eval_pattern(p1) {
    // check that the parameters are allright
    let thirdArgument;
    if (!defs_1.iscons(defs_1.cdr(p1))) {
        run_1.stop('pattern needs at least a template and a transformed version');
    }
    const firstArgument = defs_1.car(defs_1.cdr(p1));
    const secondArgument = defs_1.car(defs_1.cdr(defs_1.cdr(p1)));
    if (secondArgument === defs_1.symbol(defs_1.NIL)) {
        run_1.stop('pattern needs at least a template and a transformed version');
    }
    // third argument is optional and contains the tests
    if (!defs_1.iscons(defs_1.cdr(defs_1.cdr(p1)))) {
        thirdArgument = defs_1.symbol(defs_1.NIL);
    }
    else {
        thirdArgument = defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.cdr(p1))));
    }
    if (misc_1.equal(firstArgument, secondArgument)) {
        run_1.stop('recursive pattern');
    }
    // console.log "Eval_pattern of " + cdr(p1)
    // this is likely to create garbage collection
    // problems in the C version as it's an
    // untracked reference
    let stringKey = 'template: ' + print_1.print_list(firstArgument);
    stringKey += ' tests: ' + print_1.print_list(thirdArgument);
    if (defs_1.DEBUG) {
        console.log(`pattern stringkey: ${stringKey}`);
    }
    const patternPosition = defs_1.defs.userSimplificationsInStringForm.indexOf(stringKey);
    // if pattern is not there yet, add it, otherwise replace it
    if (patternPosition === -1) {
        //console.log "adding pattern because it doesn't exist: " + cdr(p1)
        defs_1.defs.userSimplificationsInStringForm.push(stringKey);
        defs_1.defs.userSimplificationsInListForm.push(defs_1.cdr(p1));
    }
    else {
        if (defs_1.DEBUG) {
            console.log(`pattern already exists, replacing. ${defs_1.cdr(p1)}`);
        }
        defs_1.defs.userSimplificationsInStringForm[patternPosition] = stringKey;
        defs_1.defs.userSimplificationsInListForm[patternPosition] = defs_1.cdr(p1);
    }
    // return the pattern node itself so we can
    // give some printout feedback
    stack_1.push(list_1.makeList(defs_1.symbol(defs_1.PATTERN), defs_1.cdr(p1)));
}
exports.Eval_pattern = Eval_pattern;
/*
  Clear all patterns
*/
function do_clearPatterns() {
    defs_1.defs.userSimplificationsInListForm = [];
    defs_1.defs.userSimplificationsInStringForm = [];
}
exports.do_clearPatterns = do_clearPatterns;
function Eval_clearpatterns() {
    // this is likely to create garbage collection
    // problems in the C version as it's an
    // untracked reference
    do_clearPatterns();
    // return nothing
    symbol_1.push_symbol(defs_1.NIL);
}
exports.Eval_clearpatterns = Eval_clearpatterns;
function Eval_patternsinfo() {
    const patternsinfoToBePrinted = patternsinfo();
    if (patternsinfoToBePrinted !== '') {
        misc_1.new_string(patternsinfoToBePrinted);
    }
    else {
        symbol_1.push_symbol(defs_1.NIL);
    }
}
exports.Eval_patternsinfo = Eval_patternsinfo;
function patternsinfo() {
    let patternsinfoToBePrinted = '';
    for (let i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
        patternsinfoToBePrinted += defs_1.defs.userSimplificationsInListForm + '\n';
    }
    return patternsinfoToBePrinted;
}
