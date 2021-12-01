"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decomp = exports.Eval_decomp = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const eval_1 = require("./eval");
const guess_1 = require("./guess");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
// this function extract parts subtrees from a tree.
// It is used in two
// places that have to do with pattern matching.
// One is for integrals, where an expression or its
// subparts are matched against cases in an
// integrals table.
// Another one is for applyging tranformation patterns
// defined via PATTERN, again patterns are applied to
// either the whole expression or any of its parts.
// unclear to me at the moment
// why this is exposed as something that can
// be evalled. Never called.
function Eval_decomp(p1) {
    console.log('Eval_decomp is being called!!!!!!!!!!!!!!!!!!!!');
    const arg = eval_1.Eval(defs_1.cadr(p1));
    p1 = eval_1.Eval(defs_1.caddr(p1));
    const variable = p1 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(arg) : p1;
    const result = decomp(false, arg, variable);
    stack_1.push(list_1.makeList(defs_1.symbol(defs_1.NIL), ...result));
}
exports.Eval_decomp = Eval_decomp;
function pushTryNotToDuplicateLocal(localStack, item) {
    if (localStack.length > 0 && misc_1.equal(item, localStack[localStack.length - 1])) {
        return false;
    }
    localStack.push(item);
    return true;
}
// returns constant expressions on the stack
function decomp(generalTransform, p1, p2) {
    if (defs_1.DEBUG) {
        console.log(`DECOMPOSING ${p1}`);
    }
    // is the entire expression constant?
    if (generalTransform) {
        if (!defs_1.iscons(p1)) {
            if (defs_1.DEBUG) {
                console.log(` ground thing: ${p1}`);
            }
            return [p1];
        }
    }
    else {
        if (!find_1.Find(p1, p2)) {
            if (defs_1.DEBUG) {
                console.log(' entire expression is constant');
            }
            return [p1];
        }
    }
    // sum?
    if (defs_1.isadd(p1)) {
        return decomp_sum(generalTransform, p1, p2);
    }
    // product?
    if (defs_1.ismultiply(p1)) {
        return decomp_product(generalTransform, p1, p2);
    }
    let p3 = defs_1.cdr(p1);
    // naive decomp if not sum or product
    if (defs_1.DEBUG) {
        console.log(' naive decomp');
        console.log(`startig p3: ${p3}`);
    }
    const stack = [];
    while (defs_1.iscons(p3)) {
        // for a general transformations,
        // we want to match any part of the tree so
        // we need to push the subtree as well
        // as recurse to its parts
        if (generalTransform) {
            stack.push(defs_1.car(p3));
        }
        if (defs_1.DEBUG) {
            console.log('recursive decomposition');
            console.log(`car(p3): ${defs_1.car(p3)}`);
            console.log(`p2: ${p2}`);
        }
        stack.push(...decomp(generalTransform, defs_1.car(p3), p2));
        p3 = defs_1.cdr(p3);
    }
    return stack;
}
exports.decomp = decomp;
function decomp_sum(generalTransform, p1, p2) {
    if (defs_1.DEBUG) {
        console.log(' decomposing the sum ');
    }
    // decomp terms involving x
    let p3 = defs_1.cdr(p1);
    const stack = [];
    while (defs_1.iscons(p3)) {
        if (find_1.Find(defs_1.car(p3), p2) || generalTransform) {
            stack.push(...decomp(generalTransform, defs_1.car(p3), p2));
        }
        p3 = defs_1.cdr(p3);
    }
    // add together all constant terms
    p3 = defs_1.cdr(p1);
    const constantTerms = [...p3].filter((t) => !find_1.Find(t, p2));
    if (constantTerms.length) {
        p3 = add_1.add_all(constantTerms);
        pushTryNotToDuplicateLocal(stack, p3);
        stack.push(multiply_1.negate(p3)); // need both +a, -a for some integrals
    }
    return stack;
}
function decomp_product(generalTransform, p1, p2) {
    if (defs_1.DEBUG) {
        console.log(' decomposing the product ');
    }
    // decomp factors involving x
    let p3 = defs_1.cdr(p1);
    const stack = [];
    while (defs_1.iscons(p3)) {
        if (find_1.Find(defs_1.car(p3), p2) || generalTransform) {
            stack.push(...decomp(generalTransform, defs_1.car(p3), p2));
        }
        p3 = defs_1.cdr(p3);
    }
    // multiply together all constant factors
    p3 = defs_1.cdr(p1);
    const constantFactors = [];
    while (defs_1.iscons(p3)) {
        const item = defs_1.car(p3);
        if (!find_1.Find(item, p2)) {
            if (constantFactors.length < 1 ||
                !misc_1.equal(item, constantFactors[constantFactors.length - 1])) {
                constantFactors.push(item);
            }
        }
        p3 = defs_1.cdr(p3);
    }
    if (constantFactors.length > 0) {
        stack.push(multiply_1.multiply_all(constantFactors));
    }
    return stack;
}
