import { Cons, NIL, symbol, U } from '../runtime/defs';
import { pop, push } from '../runtime/stack';

// Create a list from n things on the stack.
// n is an integer
export function list(n: number) {
  push(symbol(NIL));
  for (let listIterator = 0; listIterator < n; listIterator++) {
    const arg2 = pop();
    const arg1 = pop();
    push(new Cons(arg1, arg2));
  }
}

// Convert an array into a CONS list.
export function makeList(...items: U[]): U {
  let node: U = symbol(NIL);
  for (let i = items.length - 1; i >= 0; i--) {
    node = new Cons(items[i], node);
  }
  return node;
}
