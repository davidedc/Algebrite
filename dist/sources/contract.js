"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_contract = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
/* contract =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,i,j

General description
-------------------
Contract across tensor indices i.e. returns "a" summed over indices i and j.
If i and j are omitted then 1 and 2 are used.
contract(m) is equivalent to the trace of matrix m.

*/
function Eval_contract(p1) {
    const p1_prime = eval_1.Eval(defs_1.cadr(p1));
    let p2, p3;
    if (defs_1.cddr(p1) === defs_1.symbol(defs_1.NIL)) {
        p2 = defs_1.Constants.one;
        p3 = bignum_1.integer(2);
    }
    else {
        p2 = eval_1.Eval(defs_1.caddr(p1));
        p3 = eval_1.Eval(defs_1.cadddr(p1));
    }
    const result = contract(p1_prime, p2, p3);
    stack_1.push(result);
}
exports.Eval_contract = Eval_contract;
function contract(p1, p2, p3) {
    const ai = [];
    const an = [];
    if (!defs_1.istensor(p1)) {
        if (!is_1.isZeroAtomOrTensor(p1)) {
            run_1.stop('contract: tensor expected, 1st arg is not a tensor');
        }
        return defs_1.Constants.zero;
    }
    let l = bignum_1.nativeInt(p2);
    let m = bignum_1.nativeInt(p3);
    const { ndim } = p1.tensor;
    if (l < 1 ||
        l > ndim ||
        m < 1 ||
        m > ndim ||
        l === m ||
        p1.tensor.dim[l - 1] !== p1.tensor.dim[m - 1]) {
        run_1.stop('contract: index out of range');
    }
    l--;
    m--;
    const n = p1.tensor.dim[l];
    // nelem is the number of elements in "b"
    let nelem = 1;
    for (let i = 0; i < ndim; i++) {
        if (i !== l && i !== m) {
            nelem *= p1.tensor.dim[i];
        }
    }
    p2 = alloc_1.alloc_tensor(nelem);
    p2.tensor.ndim = ndim - 2;
    let j = 0;
    for (let i = 0; i < ndim; i++) {
        if (i !== l && i !== m) {
            p2.tensor.dim[j++] = p1.tensor.dim[i];
        }
    }
    const a = p1.tensor.elem;
    const b = p2.tensor.elem;
    for (let i = 0; i < ndim; i++) {
        ai[i] = 0;
        an[i] = p1.tensor.dim[i];
    }
    for (let i = 0; i < nelem; i++) {
        let temp = defs_1.Constants.zero;
        for (let j = 0; j < n; j++) {
            ai[l] = j;
            ai[m] = j;
            let h = 0;
            for (let k = 0; k < ndim; k++) {
                h = h * an[k] + ai[k];
            }
            //console.log "a[h]: " + a[h]
            temp = add_1.add(temp, a[h]);
        }
        //console.log "tos: " + stack[tos-1]
        b[i] = temp;
        //console.log "b[i]: " + b[i]
        for (let j = ndim - 1; j >= 0; j--) {
            if (j === l || j === m) {
                continue;
            }
            if (++ai[j] < an[j]) {
                break;
            }
            ai[j] = 0;
        }
    }
    if (nelem === 1) {
        return b[0];
    }
    return p2;
}
