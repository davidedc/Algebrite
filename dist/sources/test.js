"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_or = exports.Eval_and = exports.Eval_not = exports.Eval_testlt = exports.Eval_testle = exports.Eval_testgt = exports.Eval_testge = exports.Eval_testeq = exports.Eval_test = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const eval_1 = require("./eval");
const float_1 = require("./float");
const is_1 = require("./is");
const simplify_1 = require("./simplify");
// If the number of args is odd then the last arg is the default result.
// Works like a switch statement. Could also be used for piecewise
// functions? TODO should probably be called "switch"?
function Eval_test(p1) {
    stack_1.push(_test(p1));
}
exports.Eval_test = Eval_test;
function _test(p1) {
    const orig = p1;
    p1 = defs_1.cdr(p1);
    while (defs_1.iscons(p1)) {
        // odd number of parameters means that the
        // last argument becomes the default case
        // i.e. the one without a test.
        if (defs_1.cdr(p1) === defs_1.symbol(defs_1.NIL)) {
            return eval_1.Eval(defs_1.car(p1)); // default case
        }
        const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.car(p1));
        if (checkResult == null) {
            // we couldn't determine the result
            // of a test. This means we can't conclude
            // anything about the result of the
            // overall test, so we must bail
            // with the unevalled test
            return orig;
        }
        else if (checkResult) {
            // test succesful, we found out output
            return eval_1.Eval(defs_1.cadr(p1));
        }
        else {
            // test unsuccessful, continue to the
            // next pair of test,value
            p1 = defs_1.cddr(p1);
        }
    }
    // no test matched and there was no
    // catch-all case, so we return zero.
    return defs_1.Constants.zero;
}
// we test A==B by first subtracting and checking if we symbolically
// get zero. If not, we evaluate to float and check if we get a zero.
// If we get another NUMBER then we know they are different.
// If we get something else, then we don't know and we return the
// unaveluated test, which is the same as saying "maybe".
function Eval_testeq(p1) {
    // first try without simplifyng both sides
    const orig = p1;
    let subtractionResult = add_1.subtract(eval_1.Eval(defs_1.cadr(p1)), eval_1.Eval(defs_1.caddr(p1)));
    // OK so we are doing something tricky here
    // we are using isZeroLikeOrNonZeroLikeOrUndetermined to check if the result
    // is zero or not zero or unknown.
    // isZeroLikeOrNonZeroLikeOrUndetermined has some routines
    // to determine the zero-ness/non-zero-ness or
    // undeterminate-ness of things so we use
    // that here and down below.
    let checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(subtractionResult);
    if (checkResult) {
        stack_1.push(defs_1.Constants.zero);
        return;
    }
    else if (checkResult != null && !checkResult) {
        stack_1.push(defs_1.Constants.one);
        return;
    }
    // we didn't get a simple numeric result but
    // let's try again after doing
    // a simplification on both sides
    const arg1 = simplify_1.simplify(eval_1.Eval(defs_1.cadr(p1)));
    const arg2 = simplify_1.simplify(eval_1.Eval(defs_1.caddr(p1)));
    subtractionResult = add_1.subtract(arg1, arg2);
    checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(subtractionResult);
    if (checkResult) {
        stack_1.push(defs_1.Constants.zero);
        return;
    }
    else if (checkResult != null && !checkResult) {
        stack_1.push(defs_1.Constants.one);
        return;
    }
    // if we didn't get to a number then we
    // don't know whether the quantities are
    // different so do nothing
    stack_1.push(orig);
}
exports.Eval_testeq = Eval_testeq;
// Relational operators expect a numeric result for operand difference.
function Eval_testge(p1) {
    const orig = p1;
    const comparison = cmp_args(p1);
    if (comparison == null) {
        stack_1.push(orig);
        return;
    }
    if (comparison >= 0) {
        stack_1.push(defs_1.Constants.one);
    }
    else {
        stack_1.push(defs_1.Constants.zero);
    }
}
exports.Eval_testge = Eval_testge;
function Eval_testgt(p1) {
    const orig = p1;
    const comparison = cmp_args(p1);
    if (comparison == null) {
        stack_1.push(orig);
        return;
    }
    if (comparison > 0) {
        stack_1.push(defs_1.Constants.one);
    }
    else {
        stack_1.push(defs_1.Constants.zero);
    }
}
exports.Eval_testgt = Eval_testgt;
function Eval_testle(p1) {
    const orig = p1;
    const comparison = cmp_args(p1);
    if (comparison == null) {
        stack_1.push(orig);
        return;
    }
    if (comparison <= 0) {
        stack_1.push(defs_1.Constants.one);
    }
    else {
        stack_1.push(defs_1.Constants.zero);
    }
}
exports.Eval_testle = Eval_testle;
function Eval_testlt(p1) {
    const orig = p1;
    const comparison = cmp_args(p1);
    if (comparison == null) {
        stack_1.push(orig);
        return;
    }
    if (comparison < 0) {
        stack_1.push(defs_1.Constants.one);
    }
    else {
        stack_1.push(defs_1.Constants.zero);
    }
}
exports.Eval_testlt = Eval_testlt;
// not definition
function Eval_not(p1) {
    const wholeAndExpression = p1;
    const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.cadr(p1));
    if (checkResult == null) {
        // inconclusive test on predicate
        stack_1.push(wholeAndExpression);
    }
    else if (checkResult) {
        // true -> false
        stack_1.push(defs_1.Constants.zero);
    }
    else {
        // false -> true
        stack_1.push(defs_1.Constants.one);
    }
}
exports.Eval_not = Eval_not;
/* and =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,b,...

General description
-------------------
Logical-and of predicate expressions.

*/
// and definition
function Eval_and(p1) {
    const wholeAndExpression = p1;
    let andPredicates = defs_1.cdr(wholeAndExpression);
    let somePredicateUnknown = false;
    while (defs_1.iscons(andPredicates)) {
        // eval each predicate
        const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.car(andPredicates));
        if (checkResult == null) {
            // here we have stuff that is not reconducible to any
            // numeric value (or tensor with numeric values) e.g.
            // 'a+b', so it just means that we just don't know the
            // truth value of this particular predicate.
            // We'll track the fact that we found an unknown
            // predicate and we continue with the other predicates.
            // (note that in case some subsequent predicate will be false,
            // it won't matter that we found some unknowns and
            // the whole test will be immediately zero).
            somePredicateUnknown = true;
            andPredicates = defs_1.cdr(andPredicates);
        }
        else if (checkResult) {
            // found a true, move on to the next predicate
            andPredicates = defs_1.cdr(andPredicates);
        }
        else if (!checkResult) {
            // found a false, enough to falsify everything and return
            stack_1.push(defs_1.Constants.zero);
            return;
        }
    }
    // We checked all the predicates and none of them
    // was false. So they were all either true or unknown.
    // Now, if even just one was unknown, we'll have to call this
    // test as inconclusive and return the whole test expression.
    // If all the predicates were known, then we can conclude
    // that the test returns true.
    if (somePredicateUnknown) {
        stack_1.push(wholeAndExpression);
    }
    else {
        stack_1.push(defs_1.Constants.one);
    }
}
exports.Eval_and = Eval_and;
// or definition
function Eval_or(p1) {
    const wholeOrExpression = p1;
    let orPredicates = defs_1.cdr(wholeOrExpression);
    let somePredicateUnknown = false;
    while (defs_1.iscons(orPredicates)) {
        // eval each predicate
        const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.car(orPredicates));
        if (checkResult == null) {
            // here we have stuff that is not reconducible to any
            // numeric value (or tensor with numeric values) e.g.
            // 'a+b', so it just means that we just don't know the
            // truth value of this particular predicate.
            // We'll track the fact that we found an unknown
            // predicate and we continue with the other predicates.
            // (note that in case some subsequent predicate will be false,
            // it won't matter that we found some unknowns and
            // the whole test will be immediately zero).
            somePredicateUnknown = true;
            orPredicates = defs_1.cdr(orPredicates);
        }
        else if (checkResult) {
            // found a true, enough to return true
            stack_1.push(defs_1.Constants.one);
            return;
        }
        else if (!checkResult) {
            // found a false, move on to the next predicate
            orPredicates = defs_1.cdr(orPredicates);
        }
    }
    // We checked all the predicates and none of them
    // was true. So they were all either false or unknown.
    // Now, if even just one was unknown, we'll have to call this
    // test as inconclusive and return the whole test expression.
    // If all the predicates were known, then we can conclude
    // that the test returns false.
    if (somePredicateUnknown) {
        stack_1.push(wholeOrExpression);
    }
    else {
        stack_1.push(defs_1.Constants.zero);
    }
}
exports.Eval_or = Eval_or;
// use subtract for cases like A < A + 1
// TODO you could be smarter here and
// simplify both sides only in the case
// of "relational operator: cannot determine..."
// a bit like we do in Eval_testeq
function cmp_args(p1) {
    let t = 0;
    const arg1 = simplify_1.simplify(eval_1.Eval(defs_1.cadr(p1)));
    const arg2 = simplify_1.simplify(eval_1.Eval(defs_1.caddr(p1)));
    p1 = add_1.subtract(arg1, arg2);
    // try floating point if necessary
    if (p1.k !== defs_1.NUM && p1.k !== defs_1.DOUBLE) {
        p1 = eval_1.Eval(float_1.yyfloat(p1));
    }
    //console.log "comparison: " + p1.toString()
    if (is_1.isZeroAtomOrTensor(p1)) {
        //console.log "comparison isZero "
        return 0;
    }
    switch (p1.k) {
        case defs_1.NUM:
            if (defs_1.MSIGN(p1.q.a) === -1) {
                t = -1;
            }
            else {
                t = 1;
            }
            break;
        case defs_1.DOUBLE:
            //console.log "comparison p1.d: " + p1.d
            if (p1.d < 0.0) {
                t = -1;
            }
            else {
                t = 1;
            }
            break;
        default:
            //console.log "comparison is null"
            t = null;
    }
    return t;
}
