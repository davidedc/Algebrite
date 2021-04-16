import {
  caddddr,
  cadddr,
  caddr,
  cadr,
  issymbol,
  NIL,
  U,
} from '../runtime/defs';
import { stop } from '../runtime/run';
import { pop, push } from '../runtime/stack';
import { get_binding, push_symbol, set_binding } from '../runtime/symbol';
import { integer, pop_integer } from './bignum';
import { Eval } from './eval';

// 'for' function

/*
x=0
y=2
for(do(x=sqrt(2+x),y=2*y/x),k,1,9)
float(y)

X: k
B: 1...9

1st parameter is the body
2nd parameter is the variable to loop with
3rd and 4th are the limits

*/

//define A p3
//define B p4
//define I p5
//define X p6
export function Eval_for(p1: U) {
  const loopingVariable = caddr(p1);
  if (!issymbol(loopingVariable)) {
    stop('for: 2nd arg should be the variable to loop over');
  }

  push(cadddr(p1));
  Eval();
  const j = pop_integer();
  if (isNaN(j)) {
    push(p1);
    return;
  }

  push(caddddr(p1));
  Eval();
  const k = pop_integer();
  if (isNaN(k)) {
    push(p1);
    return;
  }

  // remember contents of the index
  // variable so we can put it back after the loop
  const p4: U = get_binding(loopingVariable);

  for (let i = j; i <= k; i++) {
    set_binding(loopingVariable, integer(i));
    push(cadr(p1));
    Eval();
    pop();
  }

  // put back the index variable to original content
  set_binding(loopingVariable, p4);

  // return value

  push_symbol(NIL);
}
