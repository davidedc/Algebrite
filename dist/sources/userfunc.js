"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_user_function = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const derivative_1 = require("./derivative");
const eval_1 = require("./eval");
const list_1 = require("./list");
const tensor_1 = require("./tensor");
// Evaluate a user defined function
// F is the function body
// A is the formal argument list
// B is the calling argument list
// S is the argument substitution list
// we got here because there was a function invocation and
// it's not been parsed (and consequently tagged) as any
// system function.
// So we are dealing with another function.
// The function could be actually defined, or not yet,
// so we'll deal with both cases.
/* d =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
f,x

General description
-------------------
Returns the partial derivative of f with respect to x. x can be a vector e.g. [x,y].

*/
function Eval_user_function(p1) {
    // Use "derivative" instead of "d" if there is no user function "d"
    if (defs_1.DEBUG) {
        console.log(`Eval_user_function evaluating: ${defs_1.car(p1)}`);
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.SYMBOL_D) &&
        symbol_1.get_binding(defs_1.symbol(defs_1.SYMBOL_D)) === defs_1.symbol(defs_1.SYMBOL_D)) {
        derivative_1.Eval_derivative(p1);
        return;
    }
    // normally car(p1) is a symbol with the function name
    // but it could be something that has to be
    // evaluated to get to the function definition instead
    // (e.g. the function is an element of an array)
    // so we do an eval to sort it all out.
    // we expect to find either the body and
    // formula arguments, OR, if the function
    // has not been defined yet, then the
    // function will just contain its own name, as
    // all undefined variables do.
    const bodyAndFormalArguments = eval_1.Eval(defs_1.car(p1));
    if (defs_1.isNumericAtom(bodyAndFormalArguments)) {
        run_1.stop("expected function invocation, found multiplication instead. Use '*' symbol explicitly for multiplication.");
    }
    else if (defs_1.istensor(bodyAndFormalArguments)) {
        run_1.stop("expected function invocation, found tensor product instead. Use 'dot/inner' explicitly.");
    }
    else if (defs_1.isstr(bodyAndFormalArguments)) {
        run_1.stop('expected function, found string instead.');
    }
    let F = defs_1.car(defs_1.cdr(bodyAndFormalArguments));
    // p4 is the formal argument list
    // that is also contained here in the FUNCTION node
    let A = defs_1.car(defs_1.cdr(defs_1.cdr(bodyAndFormalArguments)));
    let B = defs_1.cdr(p1);
    // example:
    //  f(x) = x+2
    // then:
    //  F.toString() = "x + 2"
    //  A = x
    //  B = 2
    // first check is whether we don't obtain a function
    if (defs_1.car(bodyAndFormalArguments) !== defs_1.symbol(defs_1.FUNCTION) ||
        // next check is whether evaluation did nothing, so the function is undefined
        bodyAndFormalArguments === defs_1.car(p1)) {
        // leave everything as it was and return
        const h = defs_1.defs.tos;
        stack_1.push(bodyAndFormalArguments);
        p1 = B;
        while (defs_1.iscons(p1)) {
            stack_1.push(eval_1.Eval(defs_1.car(p1)));
            p1 = defs_1.cdr(p1);
        }
        list_1.list(defs_1.defs.tos - h);
        return;
    }
    // Create the argument substitution list S
    p1 = A;
    let p2 = B;
    const h = defs_1.defs.tos;
    while (defs_1.iscons(p1) && defs_1.iscons(p2)) {
        stack_1.push(defs_1.car(p1));
        stack_1.push(defs_1.car(p2));
        // why explicitly Eval the parameters when
        // the body of the function is
        // evalled anyways? Commenting it out. All tests pass...
        //Eval()
        p1 = defs_1.cdr(p1);
        p2 = defs_1.cdr(p2);
    }
    list_1.list(defs_1.defs.tos - h);
    const S = stack_1.pop();
    // Evaluate the function body
    stack_1.push(F);
    if (defs_1.iscons(S)) {
        stack_1.push(S);
        rewrite_args();
    }
    //console.log "rewritten body: " + stack[tos-1]
    stack_1.push(eval_1.Eval(stack_1.pop()));
}
exports.Eval_user_function = Eval_user_function;
// Rewrite by expanding symbols that contain args
function rewrite_args() {
    let n = 0;
    // subst. list which is a list
    // where each consecutive pair
    // is what needs to be substituted and with what
    const p2 = stack_1.pop();
    //console.log "subst. list " + p2
    // expr to substitute in i.e. the
    // function body
    let p1 = stack_1.pop();
    //console.log "expr: " + p1
    if (defs_1.istensor(p1)) {
        n = rewrite_args_tensor(p1, p2);
        return n;
    }
    if (defs_1.iscons(p1)) {
        const h = defs_1.defs.tos;
        if (defs_1.car(p1) === defs_1.car(p2)) {
            // rewrite a function in
            // the body with the one
            // passed from the paramaters
            stack_1.push(list_1.makeList(defs_1.symbol(defs_1.EVAL), defs_1.car(defs_1.cdr(p2))));
        }
        else {
            // if there is no match
            // then no substitution necessary
            stack_1.push(defs_1.car(p1));
        }
        // continue recursively to
        // rewrite the rest of the body
        p1 = defs_1.cdr(p1);
        while (defs_1.iscons(p1)) {
            stack_1.push(defs_1.car(p1));
            stack_1.push(p2);
            n += rewrite_args();
            p1 = defs_1.cdr(p1);
        }
        list_1.list(defs_1.defs.tos - h);
        return n;
    }
    // ground cases here
    // (apart from function name which has
    // already been substituted as it's in the head
    // of the cons)
    // -----------------
    // If not a symbol then no
    // substitution to be done
    if (!defs_1.issymbol(p1)) {
        stack_1.push(p1);
        return 0;
    }
    // Here we are in a symbol case
    // so we need to substitute
    // Check if there is a direct match
    // of symbols right away
    let p3 = p2;
    while (defs_1.iscons(p3)) {
        if (p1 === defs_1.car(p3)) {
            stack_1.push(defs_1.cadr(p3));
            return 1;
        }
        p3 = defs_1.cddr(p3);
    }
    // Get the symbol's content, if _that_
    // matches then do the substitution
    p3 = symbol_1.get_binding(p1);
    stack_1.push(p3);
    if (p1 !== p3) {
        stack_1.push(p2); // subst. list
        n = rewrite_args();
        if (n === 0) {
            stack_1.pop();
            stack_1.push(p1); // restore if not rewritten with arg
        }
    }
    return n;
}
function rewrite_args_tensor(p1, p2) {
    let n = 0;
    p1 = tensor_1.copy_tensor(p1);
    p1.tensor.elem = p1.tensor.elem.map((el) => {
        stack_1.push(el);
        stack_1.push(p2);
        n += rewrite_args();
        return stack_1.pop();
    });
    tensor_1.check_tensor_dimensions(p1);
    stack_1.push(p1);
    return n;
}
