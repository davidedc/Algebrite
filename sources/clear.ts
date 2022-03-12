import {car, cdr, defs, iscons, NIL, SYM, U,} from '../runtime/defs';
import {defn} from '../runtime/init';
import {clear_term} from '../runtime/otherCFunctions';
import {run, stop} from '../runtime/run';
import {push} from '../runtime/stack';
import {clear_symbol, clear_symbols, symbol} from '../runtime/symbol';
import {do_clearPatterns} from './pattern';

/* clearall =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

General description
-------------------

Completely wipes all variables from the environment.

*/
export function Eval_clearall() {
  do_clearall();
  push(symbol(NIL));
}

export function do_clearall() {
  if (!defs.test_flag) {
    clear_term();
  }

  do_clearPatterns();
  clear_symbols();
  defn();
  return (defs.codeGen = false);
}

// clearall from application GUI code
function clearall() {
  return run('clearall');
}

/* clear =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Completely wipes a variable from the environment (while doing x = quote(x) just unassigns it).

*/
export function Eval_clear(p1: U) {
  let p2: U;
  p2 = cdr(p1);

  while (iscons(p2)) {
    const variableToBeCleared = car(p2);
    //console.log variableToBeCleared + ""

    if (variableToBeCleared.k !== SYM) {
      stop('symbol error');
    }

    //console.log "getting binding of " + p.toString()
    //if p.toString() == "aaa"
    //  breakpoint

    clear_symbol(variableToBeCleared);

    p2 = cdr(p2);
  }

  push(symbol(NIL));
}
