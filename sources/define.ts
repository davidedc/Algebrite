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
  U
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { set_binding, symbol } from '../runtime/symbol';
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
export function define_user_function(p1: U): U {
  const F = caadr(p1);
  const A = cdadr(p1);
  let B = caddr(p1);

  if (!issymbol(F)) {
    stop('function name?');
  }

  // evaluate function body (maybe)

  if (car(B) === symbol(EVAL)) {
    B = Eval(cadr(B));
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

  return symbol(NIL);
}

export function Eval_function_reference(p1: U) {
  return p1;
}
