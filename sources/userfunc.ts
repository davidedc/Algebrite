import {
  cadr,
  car,
  cddr,
  cdr,
  DEBUG,
  defs,
  EVAL,
  FUNCTION,
  iscons,
  isNumericAtom,
  isstr,
  issymbol,
  istensor,
  SYMBOL_D,
  Tensor,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import {get_binding, symbol} from '../runtime/symbol';
import { Eval_derivative } from './derivative';
import { Eval } from './eval';
import { list, makeList } from './list';
import { check_tensor_dimensions, copy_tensor } from './tensor';

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
export function Eval_user_function(p1: U) {
  // Use "derivative" instead of "d" if there is no user function "d"

  if (DEBUG) {
    console.log(`Eval_user_function evaluating: ${car(p1)}`);
  }
  if (
    car(p1) === symbol(SYMBOL_D) &&
    get_binding(symbol(SYMBOL_D)) === symbol(SYMBOL_D)
  ) {
    Eval_derivative(p1);
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
  const bodyAndFormalArguments = Eval(car(p1));

  if (isNumericAtom(bodyAndFormalArguments)) {
    stop(
      "expected function invocation, found multiplication instead. Use '*' symbol explicitly for multiplication."
    );
  } else if (istensor(bodyAndFormalArguments)) {
    stop(
      "expected function invocation, found tensor product instead. Use 'dot/inner' explicitly."
    );
  } else if (isstr(bodyAndFormalArguments)) {
    stop('expected function, found string instead.');
  }

  let F = car(cdr(bodyAndFormalArguments));
  // p4 is the formal argument list
  // that is also contained here in the FUNCTION node
  let A = car(cdr(cdr(bodyAndFormalArguments)));

  let B = cdr(p1);

  // example:
  //  f(x) = x+2
  // then:
  //  F.toString() = "x + 2"
  //  A = x
  //  B = 2

  // first check is whether we don't obtain a function
  if (
    car(bodyAndFormalArguments) !== symbol(FUNCTION) ||
    // next check is whether evaluation did nothing, so the function is undefined
    bodyAndFormalArguments === car(p1)
  ) {
    // leave everything as it was and return
    const h = defs.tos;
    push(bodyAndFormalArguments);
    p1 = B;
    while (iscons(p1)) {
      push(Eval(car(p1)));
      p1 = cdr(p1);
    }
    list(defs.tos - h);
    return;
  }

  // Create the argument substitution list S
  p1 = A;
  let p2 = B;
  const h = defs.tos;
  while (iscons(p1) && iscons(p2)) {
    push(car(p1));
    push(car(p2));
    // why explicitly Eval the parameters when
    // the body of the function is
    // evalled anyways? Commenting it out. All tests pass...
    //Eval()
    p1 = cdr(p1);
    p2 = cdr(p2);
  }

  list(defs.tos - h);
  const S = pop();

  // Evaluate the function body
  push(F);
  if (iscons(S)) {
    push(S);
    rewrite_args();
  }
  //console.log "rewritten body: " + stack[tos-1]
  push(Eval(pop()));
}

// Rewrite by expanding symbols that contain args
function rewrite_args() {
  let n = 0;

  // subst. list which is a list
  // where each consecutive pair
  // is what needs to be substituted and with what
  const p2 = pop();
  //console.log "subst. list " + p2

  // expr to substitute in i.e. the
  // function body
  let p1 = pop();
  //console.log "expr: " + p1

  if (istensor(p1)) {
    n = rewrite_args_tensor(p1, p2);
    return n;
  }

  if (iscons(p1)) {
    const h = defs.tos;
    if (car(p1) === car(p2)) {
      // rewrite a function in
      // the body with the one
      // passed from the paramaters
      push(makeList(symbol(EVAL), car(cdr(p2))));
    } else {
      // if there is no match
      // then no substitution necessary
      push(car(p1));
    }

    // continue recursively to
    // rewrite the rest of the body
    p1 = cdr(p1);
    while (iscons(p1)) {
      push(car(p1));
      push(p2);
      n += rewrite_args();
      p1 = cdr(p1);
    }
    list(defs.tos - h);
    return n;
  }

  // ground cases here
  // (apart from function name which has
  // already been substituted as it's in the head
  // of the cons)
  // -----------------

  // If not a symbol then no
  // substitution to be done
  if (!issymbol(p1)) {
    push(p1);
    return 0;
  }

  // Here we are in a symbol case
  // so we need to substitute

  // Check if there is a direct match
  // of symbols right away
  let p3 = p2;
  while (iscons(p3)) {
    if (p1 === car(p3)) {
      push(cadr(p3));
      return 1;
    }
    p3 = cddr(p3);
  }

  // Get the symbol's content, if _that_
  // matches then do the substitution
  p3 = get_binding(p1);
  push(p3);
  if (p1 !== p3) {
    push(p2); // subst. list
    n = rewrite_args();
    if (n === 0) {
      pop();
      push(p1); // restore if not rewritten with arg
    }
  }

  return n;
}

function rewrite_args_tensor(p1: Tensor, p2: U) {
  let n = 0;
  p1 = copy_tensor(p1);
  p1.tensor.elem = p1.tensor.elem.map((el) => {
    push(el);
    push(p2);
    n += rewrite_args();
    return pop();
  });

  check_tensor_dimensions(p1);

  push(p1);
  return n;
}
