import { alloc_tensor } from '../runtime/alloc';
import {
  BaseAtom,
  car,
  cdr,
  defs,
  E,
  iscons,
  isNumericAtom,
  isstr,
  issymbol,
  istensor,
  NIL,
  Sign,
  Str,
  symbol,
  U,
} from '../runtime/defs';
import { strcmp } from '../runtime/otherCFunctions';
import { push } from '../runtime/stack';
import { get_printname } from '../runtime/symbol';
import { compare_numbers, integer } from './bignum';
import { Eval } from './eval';
import { power } from './power';
import { compare_tensors } from './tensor';

export function new_string(s: string | number) {
  push(new Str(s.toString()));
}

// both ints
export function zero_matrix(i: number, j: number) {
  const m = alloc_tensor(i * j);
  m.ndim = 2;
  m.dim[0] = i;
  m.dim[1] = j;
  return m;
}

// see cmp_expr definition, this
// function alone just does simple structure comparison
// or compares numbers (either rationals or integers or doubles)
// but can't be used alone to test
// more complex mathematical equalities...
export function equal(p1: U, p2: U): boolean {
  return cmp_expr(p1, p2) === 0;
}

export function lessp(p1: U, p2: U): boolean {
  return cmp_expr(p1, p2) < 0;
}

export function sign(n: number): Sign {
  if (n < 0) {
    return -1;
  } else if (n > 0) {
    return 1;
  } else {
    return 0;
  }
}

// compares whether two expressions
// have the same structure.
// For example this method alone
// would compare "1+1" and "2"
// as different.
// It just so happens though that one oftens
// evaluates the two sides before passing them
// to this function, so chances are that the two
// sides have the same normal form.
// Even a simple evaluation might not cut it
// though... a simplification of both sides
// would then help. And even that might not
// cut it in some cases...
export function cmp_expr(p1: U, p2: U): Sign {
  let n: Sign = 0;

  if (p1 === p2) {
    return 0;
  }

  if (p1 === symbol(NIL)) {
    return -1;
  }

  if (p2 === symbol(NIL)) {
    return 1;
  }

  if (isNumericAtom(p1) && isNumericAtom(p2)) {
    return sign(compare_numbers(p1, p2));
  }

  if (isNumericAtom(p1)) {
    return -1;
  }

  if (isNumericAtom(p2)) {
    return 1;
  }

  if (isstr(p1) && isstr(p2)) {
    return sign(strcmp(p1.str, p2.str));
  }

  if (isstr(p1)) {
    return -1;
  }

  if (isstr(p2)) {
    return 1;
  }

  if (issymbol(p1) && issymbol(p2)) {
    return sign(strcmp(get_printname(p1), get_printname(p2)));
  }

  if (issymbol(p1)) {
    return -1;
  }

  if (issymbol(p2)) {
    return 1;
  }

  if (istensor(p1) && istensor(p2)) {
    return compare_tensors(p1, p2);
  }

  if (istensor(p1)) {
    return -1;
  }

  if (istensor(p2)) {
    return 1;
  }

  // recursion here
  while (iscons(p1) && iscons(p2)) {
    n = cmp_expr(car(p1), car(p2));
    if (n !== 0) {
      return n;
    }
    p1 = cdr(p1);
    p2 = cdr(p2);
  }

  if (iscons(p2)) {
    return -1;
  }

  if (iscons(p1)) {
    return 1;
  }

  return 0;
}

export function length(p: BaseAtom) {
  let n = 0;
  while (iscons(p)) {
    p = cdr(p);
    n++;
  }
  return n;
}

function unique(p: U) {
  let p1 = symbol(NIL);
  const p2 = symbol(NIL);
  unique_f(p, p1, p2);
  if (p2 !== symbol(NIL)) {
    p1 = symbol(NIL);
  }
  p = p1;
  return p;
}

function unique_f(p: U, p1: U, p2: U) {
  if (isstr(p)) {
    if (p1 === symbol(NIL)) {
      p1 = p;
    } else if (p !== p1) {
      p2 = p;
    }
    return;
  }
  while (iscons(p)) {
    unique_f(car(p), p1, p2);
    if (p2 !== symbol(NIL)) {
      return;
    }
    p = cdr(p);
  }
}

export function yyexpand(p1: U): U {
  const prev_expanding = defs.expanding;
  defs.expanding = true;
  const result = Eval(p1);
  defs.expanding = prev_expanding;
  return result;
}

export function exponential(p1: U): U {
  return power(symbol(E), p1);
}

export function square(p1: U): U {
  return power(p1, integer(2));
}

//__cmp = (p1, p2) ->
//  return cmp_expr(p1, p2)

// n an integer
export function sort_stack(n: number) {
  //qsort(stack + tos - n, n, sizeof (U *), __cmp)

  const h = defs.tos - n;
  const subsetOfStack = defs.stack.slice(h, h + n);
  subsetOfStack.sort(cmp_expr);
  defs.stack = defs.stack
    .slice(0, h)
    .concat(subsetOfStack)
    .concat(defs.stack.slice(h + n));
}

export function sort(arr: U[]): void {
  arr.sort(cmp_expr);
}
