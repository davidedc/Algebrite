import {
  ABS,
  ARCCOS,
  ARCCOSH,
  ARCSIN,
  ARCSINH,
  ARCTAN,
  ARCTANH,
  BESSELJ,
  BESSELY,
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  COS,
  COSH,
  DERIVATIVE,
  ERF,
  ERFC,
  HERMITE,
  INTEGRAL,
  isadd,
  iscons,
  isNumericAtom,
  issymbol,
  istensor,
  LOG,
  MULTIPLY,
  NIL,
  POWER,
  SECRETX,
  SGN,
  SIN,
  SINH,
  Sym,
  symbol,
  TAN,
  TANH,
  U,
} from '../runtime/defs';
import { Find } from '../runtime/find';
import { stop } from '../runtime/run';
import { pop, push, top } from '../runtime/stack';
import { equal, exponential, length, lessp } from '../sources/misc';
import { add, add_all, subtract } from './add';
import { besselj } from './besselj';
import { bessely } from './bessely';
import { integer, rational, nativeInt } from './bignum';
import { cosine } from './cos';
import { ycosh } from './cosh';
import { dirac } from './dirac';
import { Eval } from './eval';
import { guess } from './guess';
import { hermite } from './hermite';
import { integral } from './integral';
import { isZeroAtomOrTensor } from './is';
import { makeList } from './list';
import { logarithm } from './log';
import { divide, inverse, multiply, multiply_all, negate } from './multiply';
import { power } from './power';
import { sgn } from './sgn';
import { simplify } from './simplify';
import { sine } from './sin';
import { ysinh } from './sinh';
import { subst } from './subst';
import { d_scalar_tensor, d_tensor_scalar, d_tensor_tensor } from './tensor';

// derivative

//define F p3
//define X p4
//define N p5

export function Eval_derivative(p1: U) {
  // evaluate 1st arg to get function F
  p1 = cdr(p1);
  push(Eval(car(p1)));

  // evaluate 2nd arg and then...

  // example  result of 2nd arg  what to do
  //
  // d(f)    nil      guess X, N = nil
  // d(f,2)  2      guess X, N = 2
  // d(f,x)  x      X = x, N = nil
  // d(f,x,2)  x      X = x, N = 2
  // d(f,x,y)  x      X = x, N = y

  p1 = cdr(p1);

  const p2 = Eval(car(p1));
  if (p2 === symbol(NIL)) {
    push(guess(top()));
    push(symbol(NIL));
  } else if (isNumericAtom(p2)) {
    push(guess(top()));
    push(p2);
  } else {
    push(p2);
    p1 = cdr(p1);
    push(Eval(car(p1)));
  }

  let N = pop();
  let X = pop();
  let F = pop();

  while (true) {
    // p5 (N) might be a symbol instead of a number
    let n: number;
    if (isNumericAtom(N)) {
      n = nativeInt(N);
      if (isNaN(n)) {
        stop('nth derivative: check n');
      }
    } else {
      n = 1;
    }

    let temp = F;
    if (n >= 0) {
      for (let i = 0; i < n; i++) {
        temp = derivative(temp, X);
      }
    } else {
      n = -n;
      for (let i = 0; i < n; i++) {
        temp = integral(temp, X);
      }
    }

    F = temp;

    // if p5 (N) is nil then arglist is exhausted
    if (N === symbol(NIL)) {
      break;
    }

    // otherwise...

    // N    arg1    what to do
    //
    // number  nil    break
    // number  number    N = arg1, continue
    // number  symbol    X = arg1, N = arg2, continue
    //
    // symbol  nil    X = N, N = nil, continue
    // symbol  number    X = N, N = arg1, continue
    // symbol  symbol    X = N, N = arg1, continue

    if (isNumericAtom(N)) {
      p1 = cdr(p1);
      N = Eval(car(p1));
      if (N === symbol(NIL)) {
        break; // arglist exhausted
      }
      if (!isNumericAtom(N)) {
        X = N;
        p1 = cdr(p1);
        N = Eval(car(p1));
      }
    } else {
      X = N;
      p1 = cdr(p1);
      N = Eval(car(p1));
    }
  }

  push(F); // final result
}

export function derivative(p1: U, p2: U): U {
  if (isNumericAtom(p2)) {
    stop('undefined function');
  }
  if (istensor(p1)) {
    if (istensor(p2)) {
      return d_tensor_tensor(p1, p2);
    } else {
      return d_tensor_scalar(p1, p2);
    }
  } else {
    if (istensor(p2)) {
      return d_scalar_tensor(p1, p2);
    } else {
      return d_scalar_scalar(p1, p2);
    }
  }
}

function d_scalar_scalar(p1: U, p2: U): U {
  if (issymbol(p2)) {
    return d_scalar_scalar_1(p1, p2);
  }

  // Example: d(sin(cos(x)),cos(x))
  // Replace cos(x) <- X, find derivative, then do X <- cos(x)
  const arg1 = subst(p1, p2, symbol(SECRETX)); // p1: sin(cos(x)), p2: cos(x), symbol(SECRETX): X => sin(cos(x)) -> sin(X)
  return subst(derivative(arg1, symbol(SECRETX)), symbol(SECRETX), p2); // p2:  cos(x)  =>  cos(X) -> cos(cos(x))
}

type DerivativeFunction = (p1: U, p2: Sym) => U;

function d_scalar_scalar_1(p1: U, p2: Sym): U {
  // d(x,x)?
  if (equal(p1, p2)) {
    return Constants.one;
  }

  // d(a,x)?
  if (!iscons(p1)) {
    return Constants.zero;
  }

  if (isadd(p1)) {
    return dsum(p1, p2);
  }

  switch (car(p1)) {
    case symbol(MULTIPLY):
      return dproduct(p1, p2);
    case symbol(POWER):
      return dpower(p1, p2);
    case symbol(DERIVATIVE):
      return dd(p1, p2);
    case symbol(LOG):
      return dlog(p1, p2);
    case symbol(SIN):
      return dsin(p1, p2);
    case symbol(COS):
      return dcos(p1, p2);
    case symbol(TAN):
      return dtan(p1, p2);
    case symbol(ARCSIN):
      return darcsin(p1, p2);
    case symbol(ARCCOS):
      return darccos(p1, p2);
    case symbol(ARCTAN):
      return darctan(p1, p2);
    case symbol(SINH):
      return dsinh(p1, p2);
    case symbol(COSH):
      return dcosh(p1, p2);
    case symbol(TANH):
      return dtanh(p1, p2);
    case symbol(ARCSINH):
      return darcsinh(p1, p2);
    case symbol(ARCCOSH):
      return darccosh(p1, p2);
    case symbol(ARCTANH):
      return darctanh(p1, p2);
    case symbol(ABS):
      return dabs(p1, p2);
    case symbol(SGN):
      return dsgn(p1, p2);
    case symbol(HERMITE):
      return dhermite(p1, p2);
    case symbol(ERF):
      return derf(p1, p2);
    case symbol(ERFC):
      return derfc(p1, p2);
    case symbol(BESSELJ):
      return dbesselj(p1, p2);
    case symbol(BESSELY):
      return dbessely(p1, p2);
    default:
    // pass through
  }

  if (car(p1) === symbol(INTEGRAL) && caddr(p1) === p2) {
    return derivative_of_integral(p1);
  }

  return dfunction(p1, p2);
}

function dsum(p1: U, p2: Sym): U {
  const toAdd = iscons(p1) ? p1.tail().map((el) => derivative(el, p2)) : [];
  return add_all(toAdd);
}

function dproduct(p1: U, p2: Sym): U {
  const n = length(p1) - 1;
  const toAdd: U[] = [];
  for (let i = 0; i < n; i++) {
    const arr: U[] = [];
    let p3 = cdr(p1);
    for (let j = 0; j < n; j++) {
      let temp = car(p3);
      if (i === j) {
        temp = derivative(temp, p2);
      }
      arr.push(temp);
      p3 = cdr(p3);
    }
    toAdd.push(multiply_all(arr));
  }
  return add_all(toAdd);
}

//-----------------------------------------------------------------------------
//
//       v
//  y = u
//
//  log y = v log u
//
//  1 dy   v du           dv
//  - -- = - -- + (log u) --
//  y dx   u dx           dx
//
//  dy    v  v du           dv
//  -- = u  (- -- + (log u) --)
//  dx       u dx           dx
//
//-----------------------------------------------------------------------------

function dpower(p1: U, p2: Sym): U {
  // v/u
  const arg1 = divide(caddr(p1), cadr(p1));

  // du/dx
  const deriv_1 = derivative(cadr(p1), p2);

  // log u
  const log_1 = logarithm(cadr(p1));

  // dv/dx
  const deriv_2 = derivative(caddr(p1), p2);

  // u^v
  return multiply(add(multiply(arg1, deriv_1), multiply(log_1, deriv_2)), p1);
}

function dlog(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return divide(deriv, cadr(p1));
}

//  derivative of derivative
//
//  example: d(d(f(x,y),y),x)
//
//  p1 = d(f(x,y),y)
//
//  p2 = x
//
//  cadr(p1) = f(x,y)
//
//  caddr(p1) = y
function dd(p1: U, p2: Sym): U {
  // d(f(x,y),x)
  const p3 = derivative(cadr(p1), p2);

  if (car(p3) === symbol(DERIVATIVE)) {
    // sort dx terms
    if (lessp(caddr(p3), caddr(p1))) {
      return makeList(
        symbol(DERIVATIVE),
        makeList(symbol(DERIVATIVE), cadr(p3), caddr(p3)),
        caddr(p1)
      );
    } else {
      return makeList(
        symbol(DERIVATIVE),
        makeList(symbol(DERIVATIVE), cadr(p3), caddr(p1)),
        caddr(p3)
      );
    }
  }

  return derivative(p3, caddr(p1));
}

// derivative of a generic function
function dfunction(p1: U, p2: Sym): U {
  const p3 = cdr(p1); // p3 is the argument list for the function

  if (p3 === symbol(NIL) || Find(p3, p2)) {
    return makeList(symbol(DERIVATIVE), p1, p2);
  }
  return Constants.zero;
}

function dsin(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(deriv, cosine(cadr(p1)));
}

function dcos(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return negate(multiply(deriv, sine(cadr(p1))));
}

function dtan(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(deriv, power(cosine(cadr(p1)), integer(-2)));
}

function darcsin(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    deriv,
    power(subtract(Constants.one, power(cadr(p1), integer(2))), rational(-1, 2))
  );
}

function darccos(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return negate(
    multiply(
      deriv,
      power(
        subtract(Constants.one, power(cadr(p1), integer(2))),
        rational(-1, 2)
      )
    )
  );
}

//        Without simplify  With simplify
//
//  d(arctan(y/x),x)  -y/(x^2*(y^2/x^2+1))  -y/(x^2+y^2)
//
//  d(arctan(y/x),y)  1/(x*(y^2/x^2+1))  x/(x^2+y^2)
function darctan(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return simplify(
    multiply(deriv, inverse(add(Constants.one, power(cadr(p1), integer(2)))))
  );
}

function dsinh(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(deriv, ycosh(cadr(p1)));
}

function dcosh(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(deriv, ysinh(cadr(p1)));
}

function dtanh(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(deriv, power(ycosh(cadr(p1)), integer(-2)));
}

function darcsinh(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    deriv,
    power(add(power(cadr(p1), integer(2)), Constants.one), rational(-1, 2))
  );
}

function darccosh(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    deriv,
    power(add(power(cadr(p1), integer(2)), Constants.negOne), rational(-1, 2))
  );
}

function darctanh(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    deriv,
    inverse(subtract(Constants.one, power(cadr(p1), integer(2))))
  );
}

function dabs(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(deriv, sgn(cadr(p1)));
}

function dsgn(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(multiply(deriv, dirac(cadr(p1))), integer(2));
}

function dhermite(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    multiply(deriv, multiply(integer(2), caddr(p1))),
    hermite(cadr(p1), add(caddr(p1), Constants.negOne))
  );
}

function derf(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    multiply(
      multiply(
        exponential(multiply(power(cadr(p1), integer(2)), Constants.negOne)),
        power(Constants.Pi(), rational(-1, 2))
      ),
      integer(2)
    ),
    deriv
  );
}

function derfc(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    multiply(
      multiply(
        exponential(multiply(power(cadr(p1), integer(2)), Constants.negOne)),
        power(Constants.Pi(), rational(-1, 2))
      ),
      integer(-2)
    ),
    deriv
  );
}

function dbesselj(p1: U, p2: Sym): U {
  if (isZeroAtomOrTensor(caddr(p1))) {
    return dbesselj0(p1, p2);
  }
  return dbesseljn(p1, p2);
}

function dbesselj0(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    multiply(deriv, besselj(cadr(p1), Constants.one)),
    Constants.negOne
  );
}

function dbesseljn(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    deriv,
    add(
      besselj(cadr(p1), add(caddr(p1), Constants.negOne)),
      multiply(
        divide(multiply(caddr(p1), Constants.negOne), cadr(p1)),
        besselj(cadr(p1), caddr(p1))
      )
    )
  );
}

function dbessely(p1: U, p2: Sym): U {
  if (isZeroAtomOrTensor(caddr(p1))) {
    return dbessely0(p1, p2);
  }
  return dbesselyn(p1, p2);
}

function dbessely0(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    multiply(deriv, besselj(cadr(p1), Constants.one)),
    Constants.negOne
  );
}

function dbesselyn(p1: U, p2: Sym): U {
  const deriv = derivative(cadr(p1), p2);
  return multiply(
    deriv,
    add(
      bessely(cadr(p1), add(caddr(p1), Constants.negOne)),
      multiply(
        divide(multiply(caddr(p1), Constants.negOne), cadr(p1)),
        bessely(cadr(p1), caddr(p1))
      )
    )
  );
}

function derivative_of_integral(p1: U): U {
  return cadr(p1);
}
