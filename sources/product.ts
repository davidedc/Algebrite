import {
  caddddr,
  cadddr,
  caddr,
  cadr,
  Constants,
  DEBUG,
  issymbol,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push, top } from '../runtime/stack';
import { get_binding, set_binding } from '../runtime/symbol';
import { integer, pop_integer } from './bignum';
import { Eval } from './eval';
import { multiply } from './multiply';

// 'product' function

//define A p3
//define B p4
//define I p5
//define X p6

// leaves the product at the top of the stack
export function Eval_product(p1: U) {
  // 1st arg
  const body = cadr(p1);

  // 2nd arg (index)
  const indexVariable = caddr(p1);
  if (!issymbol(indexVariable)) {
    stop('sum: 2nd arg?');
  }

  // 3rd arg (lower limit)
  push(cadddr(p1));
  Eval();
  const j = pop_integer();
  if (isNaN(j)) {
    push(p1);
    return;
  }

  // 4th arg (upper limit)
  push(caddddr(p1));
  Eval();
  const k = pop_integer();
  if (isNaN(k)) {
    push(p1);
    return;
  }

  // remember contents of the index
  // variable so we can put it back after the loop
  const oldIndexVariableValue = get_binding(indexVariable);

  let temp: U = Constants.one;

  for (let i = j; i <= k; i++) {
    set_binding(indexVariable, integer(i));
    push(body);
    Eval();
    const arg2 = pop();
    temp = multiply(temp, arg2);

    if (DEBUG) {
      console.log('product - factor 1: ' + arg2.toString());
      console.log('product - factor 2: ' + temp.toString());
      console.log('product - result: ' + top().toString());
    }
  }
  push(temp);

  // put back the index variable to original content
  set_binding(indexVariable, oldIndexVariableValue);
}
