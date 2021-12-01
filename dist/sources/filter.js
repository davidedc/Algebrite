"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = exports.Eval_filter = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const eval_1 = require("./eval");
/*
Remove terms that involve a given symbol or expression. For example...

  filter(x^2 + x + 1, x)    =>  1

  filter(x^2 + x + 1, x^2)  =>  x + 1
*/
function Eval_filter(p1) {
    p1 = defs_1.cdr(p1);
    let result = eval_1.Eval(defs_1.car(p1));
    if (defs_1.iscons(p1)) {
        result = p1.tail().reduce((acc, p) => filter(acc, eval_1.Eval(p)), result);
    }
    stack_1.push(result);
}
exports.Eval_filter = Eval_filter;
function filter(F, X) {
    return filter_main(F, X);
}
exports.filter = filter;
function filter_main(F, X) {
    if (defs_1.isadd(F)) {
        return filter_sum(F, X);
    }
    if (defs_1.istensor(F)) {
        return filter_tensor(F, X);
    }
    if (find_1.Find(F, X)) {
        return defs_1.Constants.zero;
    }
    return F;
}
function filter_sum(F, X) {
    return defs_1.iscons(F)
        ? F.tail().reduce((a, b) => add_1.add(a, filter(b, X)), defs_1.Constants.zero)
        : defs_1.Constants.zero;
}
function filter_tensor(F, X) {
    const n = F.tensor.nelem;
    const p3 = alloc_1.alloc_tensor(n);
    p3.tensor.ndim = F.tensor.ndim;
    p3.tensor.dim = Array.from(F.tensor.dim);
    p3.tensor.elem = F.tensor.elem.map((el) => filter(el, X));
    return p3;
}
