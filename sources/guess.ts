import {
  SYMBOL_S,
  SYMBOL_T,
  SYMBOL_X,
  SYMBOL_Y,
  SYMBOL_Z,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import {symbol} from "../runtime/symbol";

// Guess which symbol to use for derivative, integral, etc.
export function guess(p: U): U {
  if (Find(p, symbol(SYMBOL_X))) {
    return symbol(SYMBOL_X);
  } else if (Find(p, symbol(SYMBOL_Y))) {
    return symbol(SYMBOL_Y);
  } else if (Find(p, symbol(SYMBOL_Z))) {
    return symbol(SYMBOL_Z);
  } else if (Find(p, symbol(SYMBOL_T))) {
    return symbol(SYMBOL_T);
  } else if (Find(p, symbol(SYMBOL_S))) {
    return symbol(SYMBOL_S);
  } else {
    return symbol(SYMBOL_X);
  }
}
