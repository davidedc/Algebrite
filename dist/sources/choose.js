"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_choose = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const eval_1 = require("./eval");
const factorial_1 = require("./factorial");
const multiply_1 = require("./multiply");
/* choose =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
n,k

General description
-------------------

Returns the number of combinations of n items taken k at a time.

For example, the number of five card hands is choose(52,5)

```
                          n!
      choose(n,k) = -------------
                     k! (n - k)!
```
*/
function Eval_choose(p1) {
    const N = eval_1.Eval(defs_1.cadr(p1));
    const K = eval_1.Eval(defs_1.caddr(p1));
    const result = choose(N, K);
    stack_1.push(result);
}
exports.Eval_choose = Eval_choose;
function choose(N, K) {
    if (!choose_check_args(N, K)) {
        return defs_1.Constants.zero;
    }
    return multiply_1.divide(multiply_1.divide(factorial_1.factorial(N), factorial_1.factorial(K)), factorial_1.factorial(add_1.subtract(N, K)));
}
// Result vanishes for k < 0 or k > n. (A=B, p. 19)
function choose_check_args(N, K) {
    if (defs_1.isNumericAtom(N) && misc_1.lessp(N, defs_1.Constants.zero)) {
        return false;
    }
    else if (defs_1.isNumericAtom(K) && misc_1.lessp(K, defs_1.Constants.zero)) {
        return false;
    }
    else if (defs_1.isNumericAtom(N) && defs_1.isNumericAtom(K) && misc_1.lessp(N, K)) {
        return false;
    }
    else {
        return true;
    }
}
