import {
  caadr,
  caddr,
  cadr,
  car,
  cdadr,
  EVAL,
  FUNCTION,
  issymbol,
  NIL,
  symbol,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { push_symbol, set_binding } from '../runtime/symbol';
import { Eval } from './eval';
import { makeList } from './list';

// Store a function definition
//
// Example:
//
//      f(x,y)=x^y
//
// For this definition, p1 points to the following structure.
//
//     p1
//      |
//   ___v__    ______                        ______
//  |CONS  |->|CONS  |--------------------->|CONS  |
//  |______|  |______|                      |______|
//      |         |                             |
//   ___v__    ___v__    ______    ______    ___v__    ______    ______
//  |SETQ  |  |CONS  |->|CONS  |->|CONS  |  |CONS  |->|CONS  |->|CONS  |
//  |______|  |______|  |______|  |______|  |______|  |______|  |______|
//                |         |         |         |         |         |
//             ___v__    ___v__    ___v__    ___v__    ___v__    ___v__
//            |SYM f |  |SYM x |  |SYM y |  |POWER |  |SYM x |  |SYM y |
//            |______|  |______|  |______|  |______|  |______|  |______|
//
// the result (in f) is a FUNCTION node
// that contains both the body and the argument list.
//
// We have
//
//  caadr(p1) points to the function name i.e. f
//  cdadr(p1) points to the arguments i.e. the list (x y)
//  caddr(p1) points to the function body i.e. (power x y)
// F function name
// A argument list
// B function body
export function define_user_function(p1: U) {
  const F = caadr(p1);
  const A = cdadr(p1);
  let B = caddr(p1);

  if (!issymbol(F)) {
    stop('function name?');
  }

  // evaluate function body (maybe)

  if (car(B) === symbol(EVAL)) {
    push(cadr(B));
    Eval();
    B = pop();
  }

  // note how, unless explicitly forced by an eval,
  // (handled by the if just above)
  // we don't eval/simplify
  // the body.
  // Why? because it's the easiest way
  // to solve scope problems i.e.
  //   x = 0
  //   f(x) = x + 1
  //   f(4) # would reply 1
  // which would need to otherwise
  // be solved by some scope device
  // somehow
  B = makeList(symbol(FUNCTION), B, A);

  set_binding(F, B);

  // return value is nil

  push_symbol(NIL);
}

export function Eval_function_reference(p1: U) {
  push(p1);
}
