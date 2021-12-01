"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adj = exports.Eval_adj = void 0;
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const cofactor_1 = require("./cofactor");
const eval_1 = require("./eval");
const tensor_1 = require("./tensor");
/* adj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Returns the adjunct of matrix m. The inverse of m is equal to adj(m) divided by det(m).

*/
function Eval_adj(p1) {
    const result = adj(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_adj = Eval_adj;
function adj(p1) {
    if (!tensor_1.is_square_matrix(p1)) {
        run_1.stop('adj: square matrix expected');
    }
    const n = p1.tensor.dim[0];
    const p2 = alloc_1.alloc_tensor(n * n);
    p2.tensor.ndim = 2;
    p2.tensor.dim[0] = n;
    p2.tensor.dim[1] = n;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            p2.tensor.elem[n * j + i] = cofactor_1.cofactor(p1, n, i, j);
        }
    } // transpose
    return p2;
}
exports.adj = adj;
