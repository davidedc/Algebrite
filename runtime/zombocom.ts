import { check_stack, top_level_eval } from './run';
import { pop, push } from './stack';
import { push_double, push_integer } from '../sources/bignum';
import { list } from '../sources/list';
import { scan } from '../sources/scan';
import { BaseAtom, defs, NIL, reset_after_error, U } from './defs';
import { init } from './init';
import {get_binding, symbol, usr_symbol} from './symbol';
if (!defs.inited) {
  defs.inited = true;
  init();
}

function parse_internal(argu: string | number | U | any) {
  if (typeof argu === 'string') {
    scan(argu);
    // now its in the stack
  } else if (typeof argu === 'number') {
    if (argu % 1 === 0) {
      push_integer(argu);
    } else {
      push_double(argu);
    }
  } else if (argu instanceof BaseAtom) {
    // hey look its a U
    push(argu as U);
  } else {
    console.warn('unknown argument type', argu);
    push(symbol(NIL));
  }
}

export function parse(argu: string | number | U | any) {
  let data: U;
  try {
    parse_internal(argu);
    data = pop();
    check_stack();
  } catch (error) {
    reset_after_error();
    throw error;
  }
  return data;
}

// exec handles the running ia JS of all the algebrite
// functions. The function name is passed in "name" and
// the corresponding function is pushed at the top of the stack
export function exec(name: string, ...argus: (string | number | U | any)[]) {
  let result: U;
  const fn = get_binding(usr_symbol(name));
  check_stack();
  push(fn);

  for (let argu of Array.from(argus)) {
    parse_internal(argu);
  }

  list(1 + argus.length);

  const p1 = pop();
  push(p1);

  try {
    top_level_eval();
    result = pop();
    check_stack();
  } catch (error) {
    reset_after_error();
    throw error;
  }

  return result;
}
