"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_mod = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const mmul_1 = require("./mmul");
function Eval_mod(p1) {
    const arg2 = eval_1.Eval(defs_1.caddr(p1));
    const arg1 = eval_1.Eval(defs_1.cadr(p1));
    stack_1.push(mod(arg1, arg2));
}
exports.Eval_mod = Eval_mod;
function mod(p1, p2) {
    if (is_1.isZeroAtomOrTensor(p2)) {
        run_1.stop('mod function: divide by zero');
    }
    if (!defs_1.isNumericAtom(p1) || !defs_1.isNumericAtom(p2)) {
        return list_1.makeList(defs_1.symbol(defs_1.MOD), p1, p2);
    }
    if (defs_1.isdouble(p1)) {
        const n = bignum_1.nativeInt(p1);
        if (isNaN(n)) {
            run_1.stop('mod function: cannot convert float value to integer');
        }
        p1 = bignum_1.integer(n);
    }
    if (defs_1.isdouble(p2)) {
        const n = bignum_1.nativeInt(p2);
        if (isNaN(n)) {
            run_1.stop('mod function: cannot convert float value to integer');
        }
        p2 = bignum_1.integer(n);
    }
    if (!is_1.isinteger(p1) || !is_1.isinteger(p2)) {
        run_1.stop('mod function: integer arguments expected');
    }
    return new defs_1.Num(mmul_1.mmod(p1.q.a, p2.q.a));
}
