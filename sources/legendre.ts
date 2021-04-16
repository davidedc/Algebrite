import {
  cadddr,
  caddr,
  cadr,
  car,
  Constants,
  COS,
  issymbol,
  LEGENDRE,
  NIL,
  SECRETX,
  SIN,
  symbol,
  U,
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { square } from '../sources/misc';
import { subtract } from './add';
import { integer, rational, nativeInt } from './bignum';
import { cosine } from './cos';
import { derivative } from './derivative';
import { Eval } from './eval';
import { makeList } from './list';
import { divide, multiply, negate } from './multiply';
import { power } from './power';
import { sine } from './sin';
import { subst } from './subst';

/*
 Legendre function

Example

  legendre(x,3,0)

Result

   5   3    3
  --- x  - --- x
   2        2

The computation uses the following recurrence relation.

  P(x,0) = 1

  P(x,1) = x

  n*P(x,n) = (2*(n-1)+1)*x*P(x,n-1) - (n-1)*P(x,n-2)

In the "for" loop we have i = n-1 so the recurrence relation becomes

  (i+1)*P(x,n) = (2*i+1)*x*P(x,n-1) - i*P(x,n-2)

For m > 0

  P(x,n,m) = (-1)^m * (1-x^2)^(m/2) * d^m/dx^m P(x,n)
*/
export function Eval_legendre(p1: U) {
  // 1st arg
  push(cadr(p1));
  Eval();
  const X = pop();

  // 2nd arg
  push(caddr(p1));
  Eval();
  const N = pop();

  // 3rd arg (optional)
  push(cadddr(p1));
  Eval();
  const p2 = pop();
  const M = p2 === symbol(NIL) ? Constants.zero : p2;

  push(legendre(X, N, M));
}

function legendre(X: U, N: U, M: U): U {
  return __legendre(X, N, M);
}

function __legendre(X: U, N: U, M: U): U {
  let n = nativeInt(N);
  let m = nativeInt(M);

  if (n < 0 || isNaN(n) || m < 0 || isNaN(m)) {
    return makeList(symbol(LEGENDRE), X, N, M);
  }

  let result: U;
  if (issymbol(X)) {
    result = __legendre2(n, m, X);
  } else {
    const expr = __legendre2(n, m, symbol(SECRETX));
    push(subst(expr, symbol(SECRETX), X));
    Eval();
    result = pop();
  }
  result = __legendre3(result, m, X) || result;
  return result;
}

function __legendre2(n: number, m: number, X: U): U {
  let Y0: U = Constants.zero;
  let Y1: U = Constants.one;

  //  i=1  Y0 = 0
  //    Y1 = 1
  //    ((2*i+1)*x*Y1 - i*Y0) / i = x
  //
  //  i=2  Y0 = 1
  //    Y1 = x
  //    ((2*i+1)*x*Y1 - i*Y0) / i = -1/2 + 3/2*x^2
  //
  //  i=3  Y0 = x
  //    Y1 = -1/2 + 3/2*x^2
  //    ((2*i+1)*x*Y1 - i*Y0) / i = -3/2*x + 5/2*x^3
  for (let i = 0; i < n; i++) {
    const divided = divide(
      subtract(
        multiply(multiply(integer(2 * i + 1), X), Y1),
        multiply(integer(i), Y0)
      ),
      integer(i + 1)
    );
    Y0 = Y1;
    Y1 = divided;
  }

  for (let i = 0; i < m; i++) {
    Y1 = derivative(Y1, X);
  }

  return Y1;
}

// moveTos tos * (-1)^m * (1-x^2)^(m/2)
function __legendre3(p1: U, m: number, X: U): U | undefined {
  if (m === 0) {
    return;
  }

  let base = subtract(Constants.one, square(X));
  if (car(X) === symbol(COS)) {
    base = square(sine(cadr(X)));
  } else if (car(X) === symbol(SIN)) {
    base = square(cosine(cadr(X)));
  }

  let result = multiply(p1, power(base, multiply(integer(m), rational(1, 2))));

  if (m % 2) {
    result = negate(result);
  }
  return result;
}
