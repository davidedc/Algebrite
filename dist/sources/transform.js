"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const add_1 = require("./add");
const bake_1 = require("./bake");
const decomp_1 = require("./decomp");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const scan_1 = require("./scan");
const subst_1 = require("./subst");
/*
Transform an expression using a pattern. The
pattern can come from the integrals table or
the user-defined patterns.

The expression and free variable are on the stack.

The argument s is a null terminated list of transform rules.

For example, see the itab (integrals table)

Internally, the following symbols are used:

  F  input expression

  X  free variable, i.e. F of X

  A  template expression

  B  result expression

  C  list of conditional expressions

Puts the final expression on top of stack
(whether it's transformed or not) and returns
true is successful, false if not.

*/
// p1 and p2 are tmps
//define F p3
//define X p4
//define A p5
//define B p6
//define C p7
function transform(F, X, s, generalTransform) {
    if (defs_1.DEBUG) {
        console.log(`         !!!!!!!!!   transform on: ${F}`);
    }
    const state = saveMetaBindings();
    symbol_1.set_binding(defs_1.symbol(defs_1.METAX), X);
    const arg = bake_1.polyform(F, X); // collect coefficients of x, x^2, etc.
    const result = decomp_1.decomp(generalTransform, arg, X);
    if (defs_1.DEBUG) {
        console.log(`  ${result.length} decomposed elements ====== `);
        for (let i = 0; i < result.length; i++) {
            console.log(`  decomposition element ${i}: ${result[i]}`);
        }
    }
    let transformationSuccessful = false;
    let B;
    if (generalTransform) {
        // "general tranform" mode is supposed to be more generic than
        // "integrals" mode.
        // In general transform mode we get only one transformation
        // in s
        // simple numbers can end up matching complicated templates,
        // which we don't want.
        // for example "1" ends up matching "inner(transpose(a_),a_)"
        // since "1" is decomposed to "1" and replacing "a_" with "1"
        // there is a match.
        // Although this match is OK at some fundamental level, we want to
        // avoid it because that's not what the spirit of this match
        // is: "1" does not have any structural resemblance with
        // "inner(transpose(a_),a_)". There are probably better ways
        // to so this, for example we might notice that "inner" is an
        // anchor since it "sits above" any meta variables, so we
        // might want to mandate it to be matched at the top
        // of the tree. For the time
        // being let's just skip matching on simple numbers.
        if (!defs_1.isNumericAtom(F)) {
            const theTransform = s;
            if (defs_1.DEBUG) {
                console.log(`applying transform: ${theTransform}`);
                console.log(`scanning table entry ${theTransform}`);
            }
            // replacements of meta variables. Note that we don't
            // use scan_meta because the pattern is not a string
            // that we have to parse, it's a tree already.
            // replace a_ with METAA in the passed transformation
            let expr = subst_1.subst(theTransform, defs_1.symbol(defs_1.SYMBOL_A_UNDERSCORE), defs_1.symbol(defs_1.METAA));
            // replace b_ with METAB in the passed transformation
            expr = subst_1.subst(expr, defs_1.symbol(defs_1.SYMBOL_B_UNDERSCORE), defs_1.symbol(defs_1.METAB));
            // replace x_ with METAX in the passed transformation
            const p1 = subst_1.subst(expr, defs_1.symbol(defs_1.SYMBOL_X_UNDERSCORE), defs_1.symbol(defs_1.METAX));
            const A = defs_1.car(p1);
            if (defs_1.DEBUG) {
                console.log(`template expression: ${A}`);
            }
            B = defs_1.cadr(p1);
            const C = defs_1.cddr(p1);
            if (f_equals_a([defs_1.Constants.one, ...result], generalTransform, F, A, C)) {
                // successful transformation, transformed result is in p6
                transformationSuccessful = true;
            }
            else {
                // the match failed but perhaps we can match something lower down in
                // the tree, so let's recurse the tree
                if (defs_1.DEBUG) {
                    console.log(`p3 at this point: ${F}`);
                    console.log(`car(p3): ${defs_1.car(F)}`);
                }
                const transformedTerms = [];
                let restTerm = F;
                if (defs_1.iscons(restTerm)) {
                    transformedTerms.push(defs_1.car(F));
                    restTerm = defs_1.cdr(F);
                }
                while (defs_1.iscons(restTerm)) {
                    const secondTerm = defs_1.car(restTerm);
                    restTerm = defs_1.cdr(restTerm);
                    if (defs_1.DEBUG) {
                        console.log('tos before recursive transform: ' + defs_1.defs.tos);
                        console.log(`testing: ${secondTerm}`);
                        console.log(`about to try to simplify other term: ${secondTerm}`);
                    }
                    const [t, success] = transform(secondTerm, defs_1.symbol(defs_1.NIL), s, generalTransform);
                    transformationSuccessful = transformationSuccessful || success;
                    transformedTerms.push(t);
                    if (defs_1.DEBUG) {
                        console.log(`tried to simplify other term: ${secondTerm} ...successful?: ${success} ...transformed: ${transformedTerms[transformedTerms.length - 1]}`);
                    }
                }
                // recreate the tree we were passed,
                // but with all the terms being transformed
                if (transformedTerms.length !== 0) {
                    B = list_1.makeList(...transformedTerms);
                }
            }
        }
    }
    else {
        // "integrals" mode
        for (let eachTransformEntry of Array.from(s)) {
            if (defs_1.DEBUG) {
                console.log(`scanning table entry ${eachTransformEntry}`);
                if ((eachTransformEntry + '').indexOf('f(sqrt(a+b*x),2/3*1/b*sqrt((a+b*x)^3))') !== -1) {
                    defs_1.breakpoint;
                }
            }
            if (eachTransformEntry) {
                scan_1.scan_meta(eachTransformEntry);
                const temp = stack_1.pop();
                const p5 = defs_1.cadr(temp);
                B = defs_1.caddr(temp);
                const p7 = defs_1.cdddr(temp);
                if (f_equals_a([defs_1.Constants.one, ...result], generalTransform, F, p5, p7)) {
                    // there is a successful transformation, transformed result is in p6
                    transformationSuccessful = true;
                    break;
                }
            }
        }
    }
    const temp = transformationSuccessful
        ? eval_1.Eval(B)
        : generalTransform
            ? F
            : defs_1.symbol(defs_1.NIL);
    restoreMetaBindings(state);
    return [temp, transformationSuccessful];
}
exports.transform = transform;
function saveMetaBindings() {
    return {
        METAA: symbol_1.get_binding(defs_1.symbol(defs_1.METAA)),
        METAB: symbol_1.get_binding(defs_1.symbol(defs_1.METAB)),
        METAX: symbol_1.get_binding(defs_1.symbol(defs_1.METAX)),
    };
}
function restoreMetaBindings(state) {
    symbol_1.set_binding(defs_1.symbol(defs_1.METAX), state.METAX);
    symbol_1.set_binding(defs_1.symbol(defs_1.METAB), state.METAB);
    symbol_1.set_binding(defs_1.symbol(defs_1.METAA), state.METAA);
}
// search for a METAA and METAB such that F = A
function f_equals_a(stack, generalTransform, F, A, C) {
    for (const fea_i of stack) {
        symbol_1.set_binding(defs_1.symbol(defs_1.METAA), fea_i);
        if (defs_1.DEBUG) {
            console.log(`  binding METAA to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))}`);
        }
        for (const fea_j of stack) {
            symbol_1.set_binding(defs_1.symbol(defs_1.METAB), fea_j);
            if (defs_1.DEBUG) {
                console.log(`  binding METAB to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))}`);
            }
            // now test all the conditions (it's an and between them)
            let temp = C;
            while (defs_1.iscons(temp)) {
                const p2 = eval_1.Eval(defs_1.car(temp));
                if (is_1.isZeroAtomOrTensor(p2)) {
                    break;
                }
                temp = defs_1.cdr(temp);
            }
            if (defs_1.iscons(temp)) {
                // conditions are not met, skip to the next binding of metas
                continue;
            }
            const arg2 = generalTransform ? defs_1.noexpand(eval_1.Eval, A) : eval_1.Eval(A);
            if (defs_1.DEBUG) {
                console.log(`about to evaluate template expression: ${A} binding METAA to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))} and binding METAB to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))} and binding METAX to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAX))}`);
                console.log(`  comparing ${arg2} to: ${F}`);
            }
            if (is_1.isZeroAtomOrTensor(add_1.subtract(F, arg2))) {
                if (defs_1.DEBUG) {
                    console.log(`binding METAA to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))}`);
                    console.log(`binding METAB to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))}`);
                    console.log(`binding METAX to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAX))}`);
                    console.log(`comparing ${F} to: ${A}`);
                }
                return true; // yes
            }
        }
    }
    return false; // no
}
