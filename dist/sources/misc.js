"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sort = exports.sort_stack = exports.square = exports.exponential = exports.yyexpand = exports.length = exports.cmp_expr = exports.sign = exports.lessp = exports.equal = exports.zero_matrix = exports.new_string = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const otherCFunctions_1 = require("../runtime/otherCFunctions");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const power_1 = require("./power");
const tensor_1 = require("./tensor");
function new_string(s) {
    stack_1.push(new defs_1.Str(s.toString()));
}
exports.new_string = new_string;
// both ints
function zero_matrix(i, j) {
    const m = alloc_1.alloc_tensor(i * j);
    m.ndim = 2;
    m.dim[0] = i;
    m.dim[1] = j;
    return m;
}
exports.zero_matrix = zero_matrix;
// see cmp_expr definition, this
// function alone just does simple structure comparison
// or compares numbers (either rationals or integers or doubles)
// but can't be used alone to test
// more complex mathematical equalities...
function equal(p1, p2) {
    return cmp_expr(p1, p2) === 0;
}
exports.equal = equal;
function lessp(p1, p2) {
    return cmp_expr(p1, p2) < 0;
}
exports.lessp = lessp;
function sign(n) {
    if (n < 0) {
        return -1;
    }
    else if (n > 0) {
        return 1;
    }
    else {
        return 0;
    }
}
exports.sign = sign;
// compares whether two expressions
// have the same structure.
// For example this method alone
// would compare "1+1" and "2"
// as different.
// It just so happens though that one oftens
// evaluates the two sides before passing them
// to this function, so chances are that the two
// sides have the same normal form.
// Even a simple evaluation might not cut it
// though... a simplification of both sides
// would then help. And even that might not
// cut it in some cases...
function cmp_expr(p1, p2) {
    let n = 0;
    if (p1 === p2) {
        return 0;
    }
    if (p1 === defs_1.symbol(defs_1.NIL)) {
        return -1;
    }
    if (p2 === defs_1.symbol(defs_1.NIL)) {
        return 1;
    }
    if (defs_1.isNumericAtom(p1) && defs_1.isNumericAtom(p2)) {
        return sign(bignum_1.compare_numbers(p1, p2));
    }
    if (defs_1.isNumericAtom(p1)) {
        return -1;
    }
    if (defs_1.isNumericAtom(p2)) {
        return 1;
    }
    if (defs_1.isstr(p1) && defs_1.isstr(p2)) {
        return sign(otherCFunctions_1.strcmp(p1.str, p2.str));
    }
    if (defs_1.isstr(p1)) {
        return -1;
    }
    if (defs_1.isstr(p2)) {
        return 1;
    }
    if (defs_1.issymbol(p1) && defs_1.issymbol(p2)) {
        return sign(otherCFunctions_1.strcmp(symbol_1.get_printname(p1), symbol_1.get_printname(p2)));
    }
    if (defs_1.issymbol(p1)) {
        return -1;
    }
    if (defs_1.issymbol(p2)) {
        return 1;
    }
    if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
        return tensor_1.compare_tensors(p1, p2);
    }
    if (defs_1.istensor(p1)) {
        return -1;
    }
    if (defs_1.istensor(p2)) {
        return 1;
    }
    // recursion here
    while (defs_1.iscons(p1) && defs_1.iscons(p2)) {
        n = cmp_expr(defs_1.car(p1), defs_1.car(p2));
        if (n !== 0) {
            return n;
        }
        p1 = defs_1.cdr(p1);
        p2 = defs_1.cdr(p2);
    }
    if (defs_1.iscons(p2)) {
        return -1;
    }
    if (defs_1.iscons(p1)) {
        return 1;
    }
    return 0;
}
exports.cmp_expr = cmp_expr;
function length(p) {
    const n = defs_1.iscons(p) ? [...p].length : 0;
    return n;
}
exports.length = length;
function unique(p) {
    let p1 = defs_1.symbol(defs_1.NIL);
    const p2 = defs_1.symbol(defs_1.NIL);
    unique_f(p, p1, p2);
    if (p2 !== defs_1.symbol(defs_1.NIL)) {
        p1 = defs_1.symbol(defs_1.NIL);
    }
    p = p1;
    return p;
}
function unique_f(p, p1, p2) {
    if (defs_1.isstr(p)) {
        if (p1 === defs_1.symbol(defs_1.NIL)) {
            p1 = p;
        }
        else if (p !== p1) {
            p2 = p;
        }
        return;
    }
    while (defs_1.iscons(p)) {
        unique_f(defs_1.car(p), p1, p2);
        if (p2 !== defs_1.symbol(defs_1.NIL)) {
            return;
        }
        p = defs_1.cdr(p);
    }
}
function yyexpand(p1) {
    return defs_1.doexpand(eval_1.Eval, p1);
}
exports.yyexpand = yyexpand;
function exponential(p1) {
    return power_1.power(defs_1.symbol(defs_1.E), p1);
}
exports.exponential = exponential;
function square(p1) {
    return power_1.power(p1, bignum_1.integer(2));
}
exports.square = square;
//__cmp = (p1, p2) ->
//  return cmp_expr(p1, p2)
// n an integer
function sort_stack(n) {
    //qsort(stack + tos - n, n, sizeof (U *), __cmp)
    const h = defs_1.defs.tos - n;
    const subsetOfStack = defs_1.defs.stack.slice(h, h + n);
    subsetOfStack.sort(cmp_expr);
    defs_1.defs.stack = defs_1.defs.stack
        .slice(0, h)
        .concat(subsetOfStack)
        .concat(defs_1.defs.stack.slice(h + n));
}
exports.sort_stack = sort_stack;
function sort(arr) {
    arr.sort(cmp_expr);
}
exports.sort = sort;
