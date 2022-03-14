import {
  caddddr,
  cadddr,
  caddr,
  cadr,
  Constants,
  DEBUG,
  issymbol,
  U
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { push, top } from '../runtime/stack';
import { get_binding, set_binding } from '../runtime/symbol';
import { integer, nativeInt } from './bignum';
import { Eval, evaluate_integer } from './eval';
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
  const oldIndexVariableValue = get_binding(indexVariable);

  let temp: U = Constants.one;

  for (let i = j; i <= k; i++) {
    set_binding(indexVariable, integer(i));
    const arg2 = Eval(body);
    temp = multiply(temp, arg2);

    if (DEBUG) {
      console.log(`product - factor 1: ${arg2}`);
      console.log(`product - factor 2: ${temp}`);
      console.log(`product - result: ${top()}`);
    }
  }

  // put back the index variable to original content
  set_binding(indexVariable, oldIndexVariableValue);
  return temp;
}
