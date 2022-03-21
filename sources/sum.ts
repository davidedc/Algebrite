import {
  caddddr,
  cadddr,
  caddr,
  cadr,
  Constants,
  issymbol,
  U
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { get_binding, set_binding } from '../runtime/symbol';
import { add } from './add';
import { integer, nativeInt } from './bignum';
import { Eval, evaluate_integer } from './eval';

// 'sum' function

//define A p3
//define B p4
//define I p5
//define X p6

// leaves the sum at the top of the stack
export function Eval_sum(p1: U) {
  // 1st arg
  const body = cadr(p1);

  // 2nd arg (index)
  const indexVariable = caddr(p1);
  if (!issymbol(indexVariable)) {
    stop('sum: 2nd arg?');
  }

  // 3rd arg (lower limit)
  const j = evaluate_integer(cadddr(p1));
  if (isNaN(j)) {
    return p1;
  }

  // 4th arg (upper limit)
  const k = evaluate_integer(caddddr(p1));
  if (isNaN(k)) {
    return p1;
  }

  // remember contents of the index
  // variable so we can put it back after the loop
  const p4 = get_binding(indexVariable);

  let temp: U = Constants.zero;
  for (let i = j; i <= k; i++) {
    set_binding(indexVariable, integer(i));
    temp = add(temp, Eval(body));
  }

  // put back the index variable to original content
  set_binding(indexVariable, p4);
  return temp;
}
