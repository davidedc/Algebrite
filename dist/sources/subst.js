"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subst = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const misc_1 = require("../sources/misc");
const tensor_1 = require("./tensor");
/*
  Substitute new expr for old expr in expr.

  Input:  expr     expr
          oldExpr  old expr
          newExpr  new expr

  Output:  Result
*/
function subst(expr, oldExpr, newExpr) {
    if (oldExpr === defs_1.symbol(defs_1.NIL) || newExpr === defs_1.symbol(defs_1.NIL)) {
        return expr;
    }
    if (defs_1.istensor(expr)) {
        const p4 = alloc_1.alloc_tensor(expr.tensor.nelem);
        p4.tensor.ndim = expr.tensor.ndim;
        p4.tensor.dim = Array.from(expr.tensor.dim);
        p4.tensor.elem = expr.tensor.elem.map((el) => {
            const result = subst(el, oldExpr, newExpr);
            tensor_1.check_tensor_dimensions(p4);
            return result;
        });
        return p4;
    }
    if (misc_1.equal(expr, oldExpr)) {
        return newExpr;
    }
    if (defs_1.iscons(expr)) {
        return new defs_1.Cons(subst(defs_1.car(expr), oldExpr, newExpr), subst(defs_1.cdr(expr), oldExpr, newExpr));
    }
    return expr;
}
exports.subst = subst;
