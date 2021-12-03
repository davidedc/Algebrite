"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ycosh = exports.Eval_cosh = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
/* cosh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the hyperbolic cosine of x

```
            exp(x) + exp(-x)
  cosh(x) = ----------------
                   2
```

*/
function Eval_cosh(p1) {
    const result = ycosh(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_cosh = Eval_cosh;
function ycosh(p1) {
    if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCCOSH)) {
        return defs_1.cadr(p1);
    }
    if (defs_1.isdouble(p1)) {
        let d = Math.cosh(p1.d);
        if (Math.abs(d) < 1e-10) {
            d = 0.0;
        }
        return bignum_1.double(d);
    }
    if (is_1.isZeroAtomOrTensor(p1)) {
        return defs_1.Constants.one;
    }
    return list_1.makeList(defs_1.symbol(defs_1.COSH), p1);
}
exports.ycosh = ycosh;
