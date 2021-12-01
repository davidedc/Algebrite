"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cofactor = exports.Eval_cofactor = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const det_1 = require("./det");
const eval_1 = require("./eval");
const multiply_1 = require("./multiply");
const tensor_1 = require("./tensor");
/* cofactor =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m,i,j

General description
-------------------
Cofactor of a matrix component.
Let c be the cofactor matrix of matrix m, i.e. tranpose(c) = adj(m).
This function returns c[i,j].

*/
function Eval_cofactor(p1) {
    const p2 = eval_1.Eval(defs_1.cadr(p1));
    if (!tensor_1.is_square_matrix(p2)) {
        run_1.stop('cofactor: 1st arg: square matrix expected');
    }
    const n = p2.tensor.dim[0];
    const i = eval_1.evaluate_integer(defs_1.caddr(p1));
    if (i < 1 || i > n) {
        run_1.stop('cofactor: 2nd arg: row index expected');
    }
    const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
    if (j < 1 || j > n) {
        run_1.stop('cofactor: 3rd arg: column index expected');
    }
    stack_1.push(cofactor(p2, n, i - 1, j - 1));
}
exports.Eval_cofactor = Eval_cofactor;
function cofactor(p, n, row, col) {
    const elements = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== row && j !== col) {
                elements.push(p.tensor.elem[n * i + j]);
            }
        }
    }
    let result = det_1.determinant(elements, n - 1);
    if ((row + col) % 2) {
        result = multiply_1.negate(result);
    }
    return result;
}
exports.cofactor = cofactor;
