"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_eigenvec = exports.Eval_eigenval = exports.Eval_eigen = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const float_1 = require("./float");
const list_1 = require("./list");
const print_1 = require("./print");
const tensor_1 = require("./tensor");
/* eigen =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Compute eigenvalues and eigenvectors. Matrix m must be both numerical and symmetric.
The eigenval function returns a matrix with the eigenvalues along the diagonal.
The eigenvec function returns a matrix with the eigenvectors arranged as row vectors.
The eigen function does not return anything but stores the eigenvalue matrix in D
and the eigenvector matrix in Q.

Input:    stack[tos - 1]    symmetric matrix

Output:    D      diagnonal matrix
      Q      eigenvector matrix

D and Q have the property that

  A == dot(transpose(Q),D,Q)

where A is the original matrix.

The eigenvalues are on the diagonal of D.
The eigenvectors are row vectors in Q.

The eigenvalue relation:

  A X = lambda X

can be checked as follows:

  lambda = D[1,1]
  X = Q[1]
  dot(A,X) - lambda X

Example 1. Check the relation AX = lambda X where lambda is an eigenvalue and X is the associated eigenvector.

Enter:

     A = hilbert(3)

     eigen(A)

     lambda = D[1,1]

     X = Q[1]

     dot(A,X) - lambda X

Result:

     -1.16435e-14
 
     -6.46705e-15
 
     -4.55191e-15

Example 2: Check the relation A = QTDQ.

Enter:

  A - dot(transpose(Q),D,Q)

Result:

  6.27365e-12    -1.58236e-11   1.81902e-11
 
  -1.58236e-11   -1.95365e-11   2.56514e-12
 
  1.81902e-11    2.56514e-12    1.32627e-11

*/
//define D(i, j) yydd[EIG_N * (i) + (j)]
//define Q(i, j) yyqq[EIG_N * (i) + (j)]
let EIG_N = 0;
const EIG_yydd = [];
const EIG_yyqq = [];
function Eval_eigen(p1) {
    const { arg } = EIG_check_arg(p1);
    if (!arg) {
        run_1.stop('eigen: argument is not a square matrix');
    }
    let [p2, p3] = eigen(defs_1.EIGEN, arg);
    p1 = symbol_1.usr_symbol('D');
    symbol_1.set_binding(p1, p2);
    p1 = symbol_1.usr_symbol('Q');
    symbol_1.set_binding(p1, p3);
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_eigen = Eval_eigen;
/* eigenval =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Compute eigenvalues of m. See "eigen" for more info.

*/
function Eval_eigenval(p1) {
    const result = _eigenval(p1);
    stack_1.push(result);
}
exports.Eval_eigenval = Eval_eigenval;
function _eigenval(p1) {
    const { arg, invalid } = EIG_check_arg(p1);
    if (invalid) {
        return list_1.makeList(defs_1.symbol(defs_1.EIGENVAL), invalid);
    }
    let [p2, p3] = eigen(defs_1.EIGENVAL, arg);
    return p2;
}
/* eigenvec =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Compute eigenvectors of m. See "eigen" for more info.

*/
function Eval_eigenvec(p1) {
    const result = _eigenvec(p1);
    stack_1.push(result);
}
exports.Eval_eigenvec = Eval_eigenvec;
function _eigenvec(p1) {
    const { arg, invalid } = EIG_check_arg(p1);
    if (invalid) {
        return list_1.makeList(defs_1.symbol(defs_1.EIGENVEC), invalid);
    }
    let [_, p3] = eigen(defs_1.EIGENVEC, arg);
    return p3;
}
function EIG_check_arg(p1) {
    p1 = eval_1.Eval(float_1.yyfloat(eval_1.Eval(defs_1.cadr(p1))));
    if (!defs_1.istensor(p1)) {
        return { invalid: p1 };
    }
    if (p1.tensor.ndim !== 2 || p1.tensor.dim[0] !== p1.tensor.dim[1]) {
        run_1.stop('eigen: argument is not a square matrix');
    }
    EIG_N = p1.tensor.dim[0];
    if (!eigIsDoubleTensor(p1)) {
        run_1.stop('eigen: matrix is not numerical');
    }
    for (let i = 0; i < EIG_N - 1; i++) {
        for (let j = i + 1; j < EIG_N; j++) {
            const eli = p1.tensor.elem[EIG_N * i + j];
            const elj = p1.tensor.elem[EIG_N * j + i];
            if (Math.abs(eli.d - elj.d) > 1e-10) {
                run_1.stop('eigen: matrix is not symmetrical');
            }
        }
    }
    return { arg: p1 };
}
function eigIsDoubleTensor(p1) {
    for (let i = 0; i < EIG_N; i++) {
        for (let j = 0; j < EIG_N; j++) {
            if (!defs_1.isdouble(p1.tensor.elem[EIG_N * i + j])) {
                return false;
            }
        }
    }
    return true;
}
//-----------------------------------------------------------------------------
//
//  Input:    p1    matrix
//
//  Output:    p2    eigenvalues
//
//      p3    eigenvectors
//
//-----------------------------------------------------------------------------
function eigen(op, p1) {
    // malloc working vars
    //EIG_yydd = (double *) malloc(n * n * sizeof (double))
    for (let i = 0; i < EIG_N * EIG_N; i++) {
        EIG_yydd[i] = 0.0;
    }
    //if (EIG_yydd == NULL)
    //  stop("malloc failure")
    //EIG_yyqq = (double *) malloc(n * n * sizeof (double))
    for (let i = 0; i < EIG_N * EIG_N; i++) {
        EIG_yyqq[i] = 0.0;
    }
    //if (EIG_yyqq == NULL)
    //  stop("malloc failure")
    // initialize D
    for (let i = 0; i < EIG_N; i++) {
        EIG_yydd[EIG_N * i + i] = p1.tensor.elem[EIG_N * i + i].d;
        for (let j = i + 1; j < EIG_N; j++) {
            EIG_yydd[EIG_N * i + j] = p1.tensor.elem[EIG_N * i + j].d;
            EIG_yydd[EIG_N * j + i] = p1.tensor.elem[EIG_N * i + j].d;
        }
    }
    // initialize Q
    for (let i = 0; i < EIG_N; i++) {
        EIG_yyqq[EIG_N * i + i] = 1.0;
        for (let j = i + 1; j < EIG_N; j++) {
            EIG_yyqq[EIG_N * i + j] = 0.0;
            EIG_yyqq[EIG_N * j + i] = 0.0;
        }
    }
    // step up to 100 times
    let i = 0;
    for (i = 0; i < 100; i++) {
        if (step() === 0) {
            break;
        }
    }
    if (i === 100) {
        print_1.print_str('\nnote: eigen did not converge\n');
    }
    let D;
    if (op === defs_1.EIGEN || op === defs_1.EIGENVAL) {
        D = tensor_1.copy_tensor(p1);
        for (let i = 0; i < EIG_N; i++) {
            for (let j = 0; j < EIG_N; j++) {
                D.tensor.elem[EIG_N * i + j] = bignum_1.double(EIG_yydd[EIG_N * i + j]);
            }
        }
    }
    let Q;
    if (op === defs_1.EIGEN || op === defs_1.EIGENVEC) {
        Q = tensor_1.copy_tensor(p1);
        for (let i = 0; i < EIG_N; i++) {
            for (let j = 0; j < EIG_N; j++) {
                Q.tensor.elem[EIG_N * i + j] = bignum_1.double(EIG_yyqq[EIG_N * i + j]);
            }
        }
    }
    return [D, Q];
}
// free working vars
//-----------------------------------------------------------------------------
//
//  Example: p = 1, q = 3
//
//    c  0  s  0
//
//    0  1  0  0
//  G =
//    -s  0  c  0
//
//    0  0  0  1
//
//  The effect of multiplying G times A is...
//
//  row 1 of A    = c (row 1 of A ) + s (row 3 of A )
//            n+1                n                 n
//
//  row 3 of A    = c (row 3 of A ) - s (row 1 of A )
//            n+1                n                 n
//
//  In terms of components the overall effect is...
//
//  row 1 = c row 1 + s row 3
//
//    A[1,1] = c A[1,1] + s A[3,1]
//
//    A[1,2] = c A[1,2] + s A[3,2]
//
//    A[1,3] = c A[1,3] + s A[3,3]
//
//    A[1,4] = c A[1,4] + s A[3,4]
//
//  row 3 = c row 3 - s row 1
//
//    A[3,1] = c A[3,1] - s A[1,1]
//
//    A[3,2] = c A[3,2] - s A[1,2]
//
//    A[3,3] = c A[3,3] - s A[1,3]
//
//    A[3,4] = c A[3,4] - s A[1,4]
//
//                                     T
//  The effect of multiplying A times G  is...
//
//  col 1 of A    = c (col 1 of A ) + s (col 3 of A )
//            n+1                n                 n
//
//  col 3 of A    = c (col 3 of A ) - s (col 1 of A )
//            n+1                n                 n
//
//  In terms of components the overall effect is...
//
//  col 1 = c col 1 + s col 3
//
//    A[1,1] = c A[1,1] + s A[1,3]
//
//    A[2,1] = c A[2,1] + s A[2,3]
//
//    A[3,1] = c A[3,1] + s A[3,3]
//
//    A[4,1] = c A[4,1] + s A[4,3]
//
//  col 3 = c col 3 - s col 1
//
//    A[1,3] = c A[1,3] - s A[1,1]
//
//    A[2,3] = c A[2,3] - s A[2,1]
//
//    A[3,3] = c A[3,3] - s A[3,1]
//
//    A[4,3] = c A[4,3] - s A[4,1]
//
//  What we want to do is just compute the upper triangle of A since we
//  know the lower triangle is identical.
//
//  In other words, we just want to update components A[i,j] where i < j.
//
//-----------------------------------------------------------------------------
//
//  Example: p = 2, q = 5
//
//        p      q
//
//      j=1  j=2  j=3  j=4  j=5  j=6
//
//    i=1  .  A[1,2]  .  .  A[1,5]  .
//
//  p  i=2  A[2,1]  A[2,2]  A[2,3]  A[2,4]  A[2,5]  A[2,6]
//
//    i=3  .  A[3,2]  .  .  A[3,5]  .
//
//    i=4  .  A[4,2]  .  .  A[4,5]  .
//
//  q  i=5  A[5,1]  A[5,2]  A[5,3]  A[5,4]  A[5,5]  A[5,6]
//
//    i=6  .  A[6,2]  .  .  A[6,5]  .
//
//-----------------------------------------------------------------------------
//
//  This is what B = GA does:
//
//  row 2 = c row 2 + s row 5
//
//    B[2,1] = c * A[2,1] + s * A[5,1]
//    B[2,2] = c * A[2,2] + s * A[5,2]
//    B[2,3] = c * A[2,3] + s * A[5,3]
//    B[2,4] = c * A[2,4] + s * A[5,4]
//    B[2,5] = c * A[2,5] + s * A[5,5]
//    B[2,6] = c * A[2,6] + s * A[5,6]
//
//  row 5 = c row 5 - s row 2
//
//    B[5,1] = c * A[5,1] + s * A[2,1]
//    B[5,2] = c * A[5,2] + s * A[2,2]
//    B[5,3] = c * A[5,3] + s * A[2,3]
//    B[5,4] = c * A[5,4] + s * A[2,4]
//    B[5,5] = c * A[5,5] + s * A[2,5]
//    B[5,6] = c * A[5,6] + s * A[2,6]
//
//                 T
//  This is what BG  does:
//
//  col 2 = c col 2 + s col 5
//
//    B[1,2] = c * A[1,2] + s * A[1,5]
//    B[2,2] = c * A[2,2] + s * A[2,5]
//    B[3,2] = c * A[3,2] + s * A[3,5]
//    B[4,2] = c * A[4,2] + s * A[4,5]
//    B[5,2] = c * A[5,2] + s * A[5,5]
//    B[6,2] = c * A[6,2] + s * A[6,5]
//
//  col 5 = c col 5 - s col 2
//
//    B[1,5] = c * A[1,5] - s * A[1,2]
//    B[2,5] = c * A[2,5] - s * A[2,2]
//    B[3,5] = c * A[3,5] - s * A[3,2]
//    B[4,5] = c * A[4,5] - s * A[4,2]
//    B[5,5] = c * A[5,5] - s * A[5,2]
//    B[6,5] = c * A[6,5] - s * A[6,2]
//
//-----------------------------------------------------------------------------
//
//  Step 1: Just do upper triangle (i < j), B[2,5] = 0
//
//    B[1,2] = c * A[1,2] + s * A[1,5]
//
//    B[2,3] = c * A[2,3] + s * A[5,3]
//    B[2,4] = c * A[2,4] + s * A[5,4]
//    B[2,6] = c * A[2,6] + s * A[5,6]
//
//    B[1,5] = c * A[1,5] - s * A[1,2]
//    B[3,5] = c * A[3,5] - s * A[3,2]
//    B[4,5] = c * A[4,5] - s * A[4,2]
//
//    B[5,6] = c * A[5,6] + s * A[2,6]
//
//-----------------------------------------------------------------------------
//
//  Step 2: Transpose where i > j since A[i,j] == A[j,i]
//
//    B[1,2] = c * A[1,2] + s * A[1,5]
//
//    B[2,3] = c * A[2,3] + s * A[3,5]
//    B[2,4] = c * A[2,4] + s * A[4,5]
//    B[2,6] = c * A[2,6] + s * A[5,6]
//
//    B[1,5] = c * A[1,5] - s * A[1,2]
//    B[3,5] = c * A[3,5] - s * A[2,3]
//    B[4,5] = c * A[4,5] - s * A[2,4]
//
//    B[5,6] = c * A[5,6] + s * A[2,6]
//
//-----------------------------------------------------------------------------
//
//  Step 3: Same as above except reorder
//
//  k < p    (k = 1)
//
//    A[1,2] = c * A[1,2] + s * A[1,5]
//    A[1,5] = c * A[1,5] - s * A[1,2]
//
//  p < k < q  (k = 3..4)
//
//    A[2,3] = c * A[2,3] + s * A[3,5]
//    A[3,5] = c * A[3,5] - s * A[2,3]
//
//    A[2,4] = c * A[2,4] + s * A[4,5]
//    A[4,5] = c * A[4,5] - s * A[2,4]
//
//  q < k    (k = 6)
//
//    A[2,6] = c * A[2,6] + s * A[5,6]
//    A[5,6] = c * A[5,6] - s * A[2,6]
//
//-----------------------------------------------------------------------------
function step() {
    let count = 0;
    // for each upper triangle "off-diagonal" component do step2
    for (let i = 0; i < EIG_N - 1; i++) {
        for (let j = i + 1; j < EIG_N; j++) {
            if (EIG_yydd[EIG_N * i + j] !== 0.0) {
                step2(i, j);
                count++;
            }
        }
    }
    return count;
}
function step2(p, q) {
    // compute c and s
    // from Numerical Recipes (except they have a_qq - a_pp)
    const theta = (0.5 * (EIG_yydd[EIG_N * p + p] - EIG_yydd[EIG_N * q + q])) /
        EIG_yydd[EIG_N * p + q];
    let t = 1.0 / (Math.abs(theta) + Math.sqrt(theta * theta + 1.0));
    if (theta < 0.0) {
        t = -t;
    }
    const c = 1.0 / Math.sqrt(t * t + 1.0);
    const s = t * c;
    // D = GD
    // which means "add rows"
    for (let k = 0; k < EIG_N; k++) {
        const cc = EIG_yydd[EIG_N * p + k];
        const ss = EIG_yydd[EIG_N * q + k];
        EIG_yydd[EIG_N * p + k] = c * cc + s * ss;
        EIG_yydd[EIG_N * q + k] = c * ss - s * cc;
    }
    // D = D transpose(G)
    // which means "add columns"
    for (let k = 0; k < EIG_N; k++) {
        const cc = EIG_yydd[EIG_N * k + p];
        const ss = EIG_yydd[EIG_N * k + q];
        EIG_yydd[EIG_N * k + p] = c * cc + s * ss;
        EIG_yydd[EIG_N * k + q] = c * ss - s * cc;
    }
    // Q = GQ
    // which means "add rows"
    for (let k = 0; k < EIG_N; k++) {
        const cc = EIG_yyqq[EIG_N * p + k];
        const ss = EIG_yyqq[EIG_N * q + k];
        EIG_yyqq[EIG_N * p + k] = c * cc + s * ss;
        EIG_yyqq[EIG_N * q + k] = c * ss - s * cc;
    }
    EIG_yydd[EIG_N * p + q] = 0.0;
    EIG_yydd[EIG_N * q + p] = 0.0;
}
