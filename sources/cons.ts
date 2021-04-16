import { Cons, DEBUG, defs } from '../runtime/defs';
import { pop, push } from '../runtime/stack';

let consCount = 0;

// Cons two things on the stack.
export function cons() {
  consCount++;
  if (DEBUG) {
    console.log(`cons tos: ${defs.tos} # ${consCount}`);
  }
  //if consCount == 444
  //  breakpoint
  // auto var ok, no opportunity for garbage collection after p = alloc()
  const cdr = pop();
  const car = pop();
  const p = new Cons(car, cdr);

  /*
  console.log "cons new cdr.k = " + p.cons.cdr.k + "\nor more in detail:"
  console.log print_list p.cons.cdr
  console.log "cons new car.k = " + p.cons.car.k + "\nor more in detail:"
  console.log print_list p.cons.car
  */

  return push(p);
}
