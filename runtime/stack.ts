import { stop } from './run';
import { breakpoint, DEBUG, defs, NIL, TOS, U } from './defs';
import {symbol} from "./symbol";
//   _______
//  |  | <- stack
//  |  |
//  |_______|
//  |  | <- stack + tos
//  |  |
//  |  |
//  |_______|
//  |  | <- frame
//  |_______|
//      <- stack + TOS
//
//  The stack grows from low memory towards high memory. This is so that
//  multiple expressions can be pushed on the stack and then accessed as an
//  array.
//
//  The frame area holds local variables and grows from high memory towards
//  low memory. The frame area makes local variables visible to the garbage
//  collector.

// p is a U
let nil_symbols = 0;

// Push onto stack
export function push(p: U) {
  if (p == null) {
    breakpoint;
  }

  //console.log "pushing "
  //console.log print_list(p)

  if (p === symbol(NIL)) {
    nil_symbols++;
    if (DEBUG) {
      console.log(`pushing symbol(NIL) #${nil_symbols}`);
    }
  }
  //if nil_symbols == 111
  //  breakpoint
  if (defs.tos >= defs.frame) {
    stop('stack overflow');
  }
  return (defs.stack[defs.tos++] = p);
}

// returns a U
export function moveTos(stackPos: number) {
  if (defs.tos <= stackPos) {
    // we are moving the stack pointer
    // "up" the stack (as if we were doing a push)
    defs.tos = stackPos;
    return;
  }
  // we are moving the stack pointer
  // "down" the stack i.e. as if we were
  // doing a pop, we can zero-
  // out all the elements that we pass
  // so we can reclaim the memory
  while (defs.tos > stackPos) {
    defs.stack[defs.tos] = null;
    defs.tos--;
  }
}

export function top() {
  return defs.stack[defs.tos - 1];
}

export function pop() {
  //popsNum++
  //console.log "pop #" + popsNum
  if (defs.tos === 0) {
    breakpoint;
    stop('stack underflow');
  }
  if (top() == null) {
    breakpoint;
  }
  const elementToBeReturned = defs.stack[--defs.tos];

  // give a chance to the garbage
  // collection to reclaim space
  // This is JS-specific, it would
  // actually make the C garbage
  // collector useless.
  defs.stack[defs.tos] = null;

  return elementToBeReturned;
}
