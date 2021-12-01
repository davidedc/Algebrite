"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtract = exports.add_all = exports.add = exports.Eval_add = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("./misc");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const print_1 = require("./print");
const tensor_1 = require("./tensor");
/*
 Symbolic addition

  Terms in a sum are combined if they are identical modulo rational
  coefficients.

  For example, A + 2A becomes 3A.

  However, the sum A + sqrt(2) A is not modified.

  Combining terms can lead to second-order effects.

  For example, consider the case of

    1/sqrt(2) A + 3/sqrt(2) A + sqrt(2) A

  The first two terms are combined to yield 2 sqrt(2) A.

  This result can now be combined with the third term to yield

    3 sqrt(2) A
*/
let flag = 0;
function Eval_add(p1) {
    const terms = [];
    p1 = defs_1.cdr(p1);
    for (const t of p1) {
        const p2 = eval_1.Eval(t);
        push_terms(terms, p2);
    }
    stack_1.push(add_terms(terms));
}
exports.Eval_add = Eval_add;
// Add terms, returns one expression.
function add_terms(terms) {
    // ensure no infinite loop, use "for"
    if (defs_1.DEBUG) {
        for (const term of terms) {
            console.log(print_1.print_list(term));
        }
    }
    for (let i = 0; i < 10; i++) {
        if (terms.length < 2) {
            break;
        }
        flag = 0;
        terms.sort(cmp_terms);
        if (flag === 0) {
            break;
        }
        combine_terms(terms);
    }
    switch (terms.length) {
        case 0:
            return defs_1.Constants.Zero();
        case 1:
            return terms[0];
        default:
            terms.unshift(defs_1.symbol(defs_1.ADD));
            return list_1.makeList(...terms);
    }
}
let cmp_terms_count = 0;
// Compare terms for order.
function cmp_terms(p1, p2) {
    cmp_terms_count++;
    //if cmp_terms_count == 52
    //  breakpoint
    // numbers can be combined
    if (defs_1.isNumericAtom(p1) && defs_1.isNumericAtom(p2)) {
        flag = 1;
        //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 0"
        return 0;
    }
    // congruent tensors can be combined
    if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
        if (p1.tensor.ndim < p2.tensor.ndim) {
            //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns -1"
            return -1;
        }
        if (p1.tensor.ndim > p2.tensor.ndim) {
            //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 1"
            return 1;
        }
        for (let i = 0; i < p1.tensor.ndim; i++) {
            if (p1.tensor.dim[i] < p2.tensor.dim[i]) {
                //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns -1"
                return -1;
            }
            if (p1.tensor.dim[i] > p2.tensor.dim[i]) {
                //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 1"
                return 1;
            }
        }
        flag = 1;
        //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 0"
        return 0;
    }
    if (defs_1.ismultiply(p1)) {
        p1 = defs_1.cdr(p1);
        if (defs_1.isNumericAtom(defs_1.car(p1))) {
            p1 = defs_1.cdr(p1);
            if (defs_1.cdr(p1) === defs_1.symbol(defs_1.NIL)) {
                p1 = defs_1.car(p1);
            }
        }
    }
    if (defs_1.ismultiply(p2)) {
        p2 = defs_1.cdr(p2);
        if (defs_1.isNumericAtom(defs_1.car(p2))) {
            p2 = defs_1.cdr(p2);
            if (defs_1.cdr(p2) === defs_1.symbol(defs_1.NIL)) {
                p2 = defs_1.car(p2);
            }
        }
    }
    const t = misc_1.cmp_expr(p1, p2);
    if (t === 0) {
        flag = 1;
    }
    //if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns " + t
    return t;
}
/*
 Compare adjacent terms in terms[] and combine if possible.
*/
function combine_terms(terms) {
    // I had to turn the coffeescript for loop into
    // a more mundane while loop because the i
    // variable was changed from within the body,
    // which is something that is not supposed to
    // happen in the coffeescript 'vector' form.
    // Also this means I had to add a 'i++' jus before
    // the end of the body and before the "continue"s
    let i = 0;
    while (i < terms.length - 1) {
        run_1.check_esc_flag();
        let p1, p2;
        let p3 = terms[i];
        let p4 = terms[i + 1];
        if (defs_1.istensor(p3) && defs_1.istensor(p4)) {
            p1 = tensor_1.tensor_plus_tensor(p3, p4);
            if (p1 !== defs_1.symbol(defs_1.NIL)) {
                terms.splice(i, 2, p1);
                i--;
            }
            i++;
            continue;
        }
        if (defs_1.istensor(p3) || defs_1.istensor(p4)) {
            i++;
            continue;
        }
        if (defs_1.isNumericAtom(p3) && defs_1.isNumericAtom(p4)) {
            p1 = bignum_1.add_numbers(p3, p4);
            if (is_1.isZeroAtomOrTensor(p1)) {
                terms.splice(i, 2);
            }
            else {
                terms.splice(i, 2, p1);
            }
            i--;
            i++;
            continue;
        }
        if (defs_1.isNumericAtom(p3) || defs_1.isNumericAtom(p4)) {
            i++;
            continue;
        }
        p1 = defs_1.Constants.One();
        p2 = defs_1.Constants.One();
        let t = 0;
        if (defs_1.ismultiply(p3)) {
            p3 = defs_1.cdr(p3);
            t = 1; // p3 is now denormal
            if (defs_1.isNumericAtom(defs_1.car(p3))) {
                p1 = defs_1.car(p3);
                p3 = defs_1.cdr(p3);
                if (defs_1.cdr(p3) === defs_1.symbol(defs_1.NIL)) {
                    p3 = defs_1.car(p3);
                    t = 0;
                }
            }
        }
        if (defs_1.ismultiply(p4)) {
            p4 = defs_1.cdr(p4);
            if (defs_1.isNumericAtom(defs_1.car(p4))) {
                p2 = defs_1.car(p4);
                p4 = defs_1.cdr(p4);
                if (defs_1.cdr(p4) === defs_1.symbol(defs_1.NIL)) {
                    p4 = defs_1.car(p4);
                }
            }
        }
        if (!misc_1.equal(p3, p4)) {
            i++;
            continue;
        }
        p1 = bignum_1.add_numbers(p1, p2);
        if (is_1.isZeroAtomOrTensor(p1)) {
            terms.splice(i, 2);
            i--;
            i++;
            continue;
        }
        const arg2 = t ? new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), p3) : p3;
        terms.splice(i, 2, multiply_1.multiply(p1, arg2));
        i--;
        // this i++ is to match the while
        i++;
    }
}
function push_terms(array, p) {
    if (defs_1.isadd(p)) {
        array.push(...p.tail());
    }
    else if (!is_1.isZeroAtom(p)) {
        // omit zeroes
        array.push(p);
    }
}
// add two expressions
function add(p1, p2) {
    const terms = [];
    push_terms(terms, p1);
    push_terms(terms, p2);
    return add_terms(terms);
}
exports.add = add;
function add_all(terms) {
    const flattened = [];
    for (const t of terms) {
        push_terms(flattened, t);
    }
    return add_terms(flattened);
}
exports.add_all = add_all;
function subtract(p1, p2) {
    return add(p1, multiply_1.negate(p2));
}
exports.subtract = subtract;
