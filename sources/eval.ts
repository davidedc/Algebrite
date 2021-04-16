import { index_function, set_component } from '.';
import { alloc_tensor } from '../runtime/alloc';
import {
  ABS,
  ADD,
  ADJ,
  AND,
  APPROXRATIO,
  ARCCOS,
  ARCCOSH,
  ARCSIN,
  ARCSINH,
  ARCTAN,
  ARCTANH,
  ARG,
  BESSELJ,
  BESSELY,
  BINDING,
  BINOMIAL,
  breakpoint,
  caadr,
  cadadr,
  cadddr,
  caddr,
  cadr,
  car,
  cdadr,
  cddr,
  cdr,
  CEILING,
  CHECK,
  CHOOSE,
  CIRCEXP,
  CLEAR,
  CLEARALL,
  CLEARPATTERNS,
  CLOCK,
  COEFF,
  COFACTOR,
  CONDENSE,
  CONJ,
  CONS,
  Cons,
  Constants,
  CONTRACT,
  COS,
  COSH,
  DEBUG,
  DECOMP,
  DEFINT,
  defs,
  DEGREE,
  DENOMINATOR,
  DERIVATIVE,
  DET,
  DIM,
  DIRAC,
  DIVISORS,
  DO,
  DOT,
  DOUBLE,
  EIGEN,
  EIGENVAL,
  EIGENVEC,
  ERF,
  ERFC,
  EVAL,
  EXP,
  EXPAND,
  EXPCOS,
  EXPSIN,
  FACTOR,
  FACTORIAL,
  FACTORPOLY,
  FILTER,
  FLOATF,
  FLOOR,
  FOR,
  FUNCTION,
  GAMMA,
  GCD,
  HERMITE,
  HILBERT,
  IMAG,
  INDEX,
  INNER,
  INTEGRAL,
  INV,
  INVG,
  iscons,
  isdouble,
  ISINTEGER,
  iskeyword,
  isNumericAtom,
  ISPRIME,
  isrational,
  issymbol,
  istensor,
  LAGUERRE,
  LAST,
  LCM,
  LEADING,
  LEGENDRE,
  LOG,
  LOOKUP,
  MOD,
  MULTIPLY,
  NIL,
  NOT,
  NROOTS,
  NUM,
  NUMBER,
  NUMERATOR,
  OPERATOR,
  OR,
  OUTER,
  PATTERN,
  PATTERNSINFO,
  PI,
  POLAR,
  POWER,
  PRIME,
  PRINT,
  PRINT2DASCII,
  PRINTFULL,
  PRINTLATEX,
  PRINTLIST,
  PRINTPLAIN,
  PRODUCT,
  QUOTE,
  QUOTIENT,
  RANK,
  RATIONALIZE,
  REAL,
  ROOTS,
  ROUND,
  SETQ,
  SGN,
  SHAPE,
  SILENTPATTERN,
  SIMPLIFY,
  SIN,
  SINH,
  SQRT,
  STOP,
  STR,
  SUBST,
  SUM,
  SYM,
  Sym,
  symbol,
  SYMBOLSINFO,
  TAN,
  TANH,
  TAYLOR,
  TENSOR,
  Tensor,
  TEST,
  TESTEQ,
  TESTGE,
  TESTGT,
  TESTLE,
  TESTLT,
  TRANSPOSE,
  U,
  UNIT,
  YYRECT,
  ZERO,
  noexpand,
} from '../runtime/defs';
import { check_esc_flag, stop } from '../runtime/run';
import { moveTos, pop, push, top } from '../runtime/stack';
import {
  Eval_symbolsinfo,
  get_binding,
  push_symbol,
  set_binding,
  symnum,
} from '../runtime/symbol';
import { exponential } from '../sources/misc';
import { Eval_abs } from './abs';
import { Eval_add } from './add';
import { Eval_adj } from './adj';
import { Eval_approxratio } from './approxratio';
import { Eval_arccos } from './arccos';
import { Eval_arccosh } from './arccosh';
import { Eval_arcsin } from './arcsin';
import { Eval_arcsinh } from './arcsinh';
import { Eval_arctan } from './arctan';
import { Eval_arctanh } from './arctanh';
import { Eval_arg } from './arg';
import { Eval_besselj } from './besselj';
import { Eval_bessely } from './bessely';
import {
  convert_rational_to_double,
  double,
  pop_integer,
  push_integer,
  rational,
} from './bignum';
import { Eval_binomial } from './binomial';
import { Eval_ceiling } from './ceiling';
import { Eval_choose } from './choose';
import { Eval_circexp } from './circexp';
import { Eval_clear, Eval_clearall } from './clear';
import { Eval_clock } from './clock';
import { Eval_coeff } from './coeff';
import { Eval_cofactor } from './cofactor';
import { Eval_condense } from './condense';
import { Eval_conj } from './conj';
import { Eval_contract } from './contract';
import { Eval_cos } from './cos';
import { Eval_cosh } from './cosh';
import { Eval_decomp } from './decomp';
import { define_user_function, Eval_function_reference } from './define';
import { Eval_defint } from './defint';
import { Eval_degree } from './degree';
import { Eval_denominator } from './denominator';
import { Eval_derivative } from './derivative';
import { det } from './det';
import { Eval_dirac } from './dirac';
import { divisors } from './divisors';
import { Eval_eigen, Eval_eigenval, Eval_eigenvec } from './eigen';
import { Eval_erf } from './erf';
import { Eval_erfc } from './erfc';
import { Eval_expand } from './expand';
import { Eval_expcos } from './expcos';
import { Eval_expsin } from './expsin';
import { Eval_factor } from './factor';
import { factorial } from './factorial';
import { factorpoly } from './factorpoly';
import { Eval_filter } from './filter';
import { Eval_float } from './float';
import { Eval_floor } from './floor';
import { Eval_for } from './for';
import { Eval_gamma } from './gamma';
import { Eval_gcd } from './gcd';
import { hermite } from './hermite';
import { hilbert } from './hilbert';
import { Eval_imag } from './imag';
import { Eval_inner } from './inner';
import { Eval_integral } from './integral';
import { inv, invg } from './inv';
import {
  isfloating,
  isinteger,
  isintegerorintegerfloat,
  isZeroLikeOrNonZeroLikeOrUndetermined,
} from './is';
import { Eval_isprime } from './isprime';
import { Eval_laguerre } from './laguerre';
import { Eval_lcm } from './lcm';
import { Eval_leading } from './leading';
import { Eval_legendre } from './legendre';
import { list, makeList } from './list';
import { Eval_log } from './log';
import { Eval_lookup } from './lookup';
import { Eval_mod } from './mod';
import { Eval_multiply } from './multiply';
import { Eval_nroots } from './nroots';
import { Eval_numerator } from './numerator';
import { Eval_outer } from './outer';
import {
  Eval_clearpatterns,
  Eval_pattern,
  Eval_patternsinfo,
  Eval_silentpattern,
} from './pattern';
import { Eval_polar } from './polar';
import { Eval_power, power } from './power';
import { Eval_prime } from './prime';
import {
  Eval_print,
  Eval_print2dascii,
  Eval_printcomputer,
  Eval_printhuman,
  Eval_printlatex,
  Eval_printlist,
} from './print';
import { Eval_product } from './product';
import { Eval_quotient } from './quotient';
import { Eval_rationalize } from './rationalize';
import { Eval_real } from './real';
import { Eval_rect } from './rect';
import { Eval_roots } from './roots';
import { Eval_round } from './round';
import { Eval_sgn } from './sgn';
import { Eval_shape } from './shape';
import { Eval_simplify } from './simplify';
import { Eval_sin } from './sin';
import { Eval_sinh } from './sinh';
import { subst } from './subst';
import { Eval_sum } from './sum';
import { Eval_tan } from './tan';
import { Eval_tanh } from './tanh';
import { Eval_taylor } from './taylor';
import { check_tensor_dimensions, Eval_tensor } from './tensor';
import {
  Eval_and,
  Eval_not,
  Eval_or,
  Eval_test,
  Eval_testeq,
  Eval_testge,
  Eval_testgt,
  Eval_testle,
  Eval_testlt,
} from './test';
import { Eval_transpose } from './transpose';
import { Eval_user_function } from './userfunc';
import { Eval_zero } from './zero';

// Evaluate an expression, for example...
//
//  push(p1)
//  Eval()
//  p2 = pop()
export function Eval() {
  let willEvaluateAsFloats: boolean;
  check_esc_flag();
  const p1: U = pop();
  if (p1 == null) {
    breakpoint;
  }

  if (!defs.evaluatingAsFloats && isfloating(p1)) {
    willEvaluateAsFloats = true;
    defs.evaluatingAsFloats = true;
  }

  switch (p1.k) {
    case CONS:
      Eval_cons(p1);
      break;
    case NUM:
      const result = defs.evaluatingAsFloats
        ? double(convert_rational_to_double(p1))
        : p1;
      push(result);
      break;
    case DOUBLE:
    case STR:
      push(p1);
      break;
    case TENSOR:
      Eval_tensor(p1);
      break;
    case SYM:
      Eval_sym(p1);
      break;
    default:
      stop('atom?');
  }

  if (willEvaluateAsFloats) {
    defs.evaluatingAsFloats = false;
  }
}

function Eval_sym(p1: Sym) {
  // note that function calls are not processed here
  // because, since they have an argument (at least an empty one)
  // they are actually CONs, which is a branch of the
  // switch before the one that calls this function

  // bare keyword?
  // If it's a keyword, then we don't look
  // at the binding array, because keywords
  // are not redefinable.
  if (iskeyword(p1)) {
    push(makeList(p1, symbol(LAST)));
    Eval();
    return;
  } else if (p1 === symbol(PI) && defs.evaluatingAsFloats) {
    push(Constants.piAsDouble);
    return;
  }

  // Evaluate symbol's binding
  const p2 = get_binding(p1);
  if (DEBUG) {
    console.log(`looked up: ${p1} which contains: ${p2}`);
  }

  push(p2);

  // differently from standard Lisp,
  // here the evaluation is not
  // one-step only, rather it keeps evaluating
  // "all the way" until a symbol is
  // defined as itself.
  // Uncomment these two lines to get Lisp
  // behaviour (and break most tests)
  if (p1 !== p2) {
    // detect recursive lookup of symbols, which would otherwise
    // cause a stack overflow.
    // Note that recursive functions will still work because
    // as mentioned at the top, this method doesn't look
    // up and evaluate function calls.
    const positionIfSymbolAlreadyBeingEvaluated = defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.indexOf(
      p1
    );
    if (positionIfSymbolAlreadyBeingEvaluated !== -1) {
      let cycleString = '';
      for (
        let i = positionIfSymbolAlreadyBeingEvaluated;
        i < defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.length;
        i++
      ) {
        cycleString +=
          defs.chainOfUserSymbolsNotFunctionsBeingEvaluated[i].printname +
          ' -> ';
      }
      cycleString += p1.printname;

      stop('recursive evaluation of symbols: ' + cycleString);
      return;
    }

    defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.push(p1);

    Eval();

    defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.pop();
  }
}

function Eval_cons(p1: Cons) {
  const cons_head = car(p1);

  // normally the cons_head is a symbol,
  // but sometimes in the case of
  // functions we don't have a symbol,
  // we have to evaluate something to get to the
  // symbol. For example if a function is inside
  // a tensor, then we need to evaluate an index
  // access first to get to the function.
  // In those cases, we find an EVAL here,
  // so we proceed to EVAL
  if (car(cons_head) === symbol(EVAL)) {
    Eval_user_function(p1);
    return;
  }

  // If we didn't fall in the EVAL case above
  // then at this point we must have a symbol.
  if (!issymbol(cons_head)) {
    stop('cons?');
  }

  switch (symnum(cons_head)) {
    case ABS:
      return Eval_abs(p1);
    case ADD:
      return Eval_add(p1);
    case ADJ:
      return Eval_adj(p1);
    case AND:
      return Eval_and(p1);
    case ARCCOS:
      return Eval_arccos(p1);
    case ARCCOSH:
      return Eval_arccosh(p1);
    case ARCSIN:
      return Eval_arcsin(p1);
    case ARCSINH:
      return Eval_arcsinh(p1);
    case ARCTAN:
      return Eval_arctan(p1);
    case ARCTANH:
      return Eval_arctanh(p1);
    case ARG:
      return Eval_arg(p1);
    // case ATOMIZE: return Eval_atomize();
    case BESSELJ:
      return Eval_besselj(p1);
    case BESSELY:
      return Eval_bessely(p1);
    case BINDING:
      return Eval_binding(p1);
    case BINOMIAL:
      return Eval_binomial(p1);
    case CEILING:
      return Eval_ceiling(p1);
    case CHECK:
      return Eval_check(p1);
    case CHOOSE:
      return Eval_choose(p1);
    case CIRCEXP:
      return Eval_circexp(p1);
    case CLEAR:
      return Eval_clear(p1);
    case CLEARALL:
      return Eval_clearall();
    case CLEARPATTERNS:
      return Eval_clearpatterns();
    case CLOCK:
      return Eval_clock(p1);
    case COEFF:
      return Eval_coeff(p1);
    case COFACTOR:
      return Eval_cofactor(p1);
    case CONDENSE:
      return Eval_condense(p1);
    case CONJ:
      return Eval_conj(p1);
    case CONTRACT:
      return Eval_contract(p1);
    case COS:
      return Eval_cos(p1);
    case COSH:
      return Eval_cosh(p1);
    case DECOMP:
      return Eval_decomp(p1);
    case DEGREE:
      return Eval_degree(p1);
    case DEFINT:
      return Eval_defint(p1);
    case DENOMINATOR:
      return Eval_denominator(p1);
    case DERIVATIVE:
      return Eval_derivative(p1);
    case DET:
      return Eval_det(p1);
    case DIM:
      return Eval_dim(p1);
    case DIRAC:
      return Eval_dirac(p1);
    case DIVISORS:
      return Eval_divisors(p1);
    case DO:
      return Eval_do(p1);
    case DOT:
      return Eval_inner(p1);
    // case DRAW: return Eval_draw();
    // case DSOLVE: return Eval_dsolve();
    case EIGEN:
      return Eval_eigen(p1);
    case EIGENVAL:
      return Eval_eigenval(p1);
    case EIGENVEC:
      return Eval_eigenvec(p1);
    case ERF:
      return Eval_erf(p1);
    case ERFC:
      return Eval_erfc(p1);
    case EVAL:
      return Eval_Eval(p1);
    case EXP:
      return Eval_exp(p1);
    case EXPAND:
      return Eval_expand(p1);
    case EXPCOS:
      return Eval_expcos(p1);
    case EXPSIN:
      return Eval_expsin(p1);
    case FACTOR:
      return Eval_factor(p1);
    case FACTORIAL:
      return Eval_factorial(p1);
    case FACTORPOLY:
      return Eval_factorpoly(p1);
    case FILTER:
      return Eval_filter(p1);
    case FLOATF:
      return Eval_float(p1);
    case APPROXRATIO:
      return Eval_approxratio(p1);
    case FLOOR:
      return Eval_floor(p1);
    case FOR:
      return Eval_for(p1);
    // this is invoked only when we
    // evaluate a function that is NOT being called
    // e.g. when f is a function as we do
    //  g = f
    case FUNCTION:
      return Eval_function_reference(p1);
    case GAMMA:
      return Eval_gamma(p1);
    case GCD:
      return Eval_gcd(p1);
    case HERMITE:
      return Eval_hermite(p1);
    case HILBERT:
      return Eval_hilbert(p1);
    case IMAG:
      return Eval_imag(p1);
    case INDEX:
      return Eval_index(p1);
    case INNER:
      return Eval_inner(p1);
    case INTEGRAL:
      return Eval_integral(p1);
    case INV:
      return Eval_inv(p1);
    case INVG:
      return Eval_invg(p1);
    case ISINTEGER:
      return Eval_isinteger(p1);
    case ISPRIME:
      return Eval_isprime(p1);
    case LAGUERRE:
      return Eval_laguerre(p1);
    //  when LAPLACE then Eval_laplace()
    case LCM:
      return Eval_lcm(p1);
    case LEADING:
      return Eval_leading(p1);
    case LEGENDRE:
      return Eval_legendre(p1);
    case LOG:
      return Eval_log(p1);
    case LOOKUP:
      return Eval_lookup(p1);
    case MOD:
      return Eval_mod(p1);
    case MULTIPLY:
      return Eval_multiply(p1);
    case NOT:
      return Eval_not(p1);
    case NROOTS:
      return Eval_nroots(p1);
    case NUMBER:
      return Eval_number(p1);
    case NUMERATOR:
      return Eval_numerator(p1);
    case OPERATOR:
      return Eval_operator(p1);
    case OR:
      return Eval_or(p1);
    case OUTER:
      return Eval_outer(p1);
    case PATTERN:
      return Eval_pattern(p1);
    case PATTERNSINFO:
      return Eval_patternsinfo();
    case POLAR:
      return Eval_polar(p1);
    case POWER:
      return Eval_power(p1);
    case PRIME:
      return Eval_prime(p1);
    case PRINT:
      return Eval_print(p1);
    case PRINT2DASCII:
      return Eval_print2dascii(p1);
    case PRINTFULL:
      return Eval_printcomputer(p1);
    case PRINTLATEX:
      return Eval_printlatex(p1);
    case PRINTLIST:
      return Eval_printlist(p1);
    case PRINTPLAIN:
      return Eval_printhuman(p1);
    case PRODUCT:
      return Eval_product(p1);
    case QUOTE:
      return Eval_quote(p1);
    case QUOTIENT:
      return Eval_quotient(p1);
    case RANK:
      return Eval_rank(p1);
    case RATIONALIZE:
      return Eval_rationalize(p1);
    case REAL:
      return Eval_real(p1);
    case ROUND:
      return Eval_round(p1);
    case YYRECT:
      return Eval_rect(p1);
    case ROOTS:
      return Eval_roots(p1);
    case SETQ:
      return Eval_setq(p1);
    case SGN:
      return Eval_sgn(p1);
    case SILENTPATTERN:
      return Eval_silentpattern(p1);
    case SIMPLIFY:
      return Eval_simplify(p1);
    case SIN:
      return Eval_sin(p1);
    case SINH:
      return Eval_sinh(p1);
    case SHAPE:
      return Eval_shape(p1);
    case SQRT:
      return Eval_sqrt(p1);
    case STOP:
      return Eval_stop();
    case SUBST:
      return Eval_subst(p1);
    case SUM:
      return Eval_sum(p1);
    case SYMBOLSINFO:
      return Eval_symbolsinfo();
    case TAN:
      return Eval_tan(p1);
    case TANH:
      return Eval_tanh(p1);
    case TAYLOR:
      return Eval_taylor(p1);
    case TEST:
      return Eval_test(p1);
    case TESTEQ:
      return Eval_testeq(p1);
    case TESTGE:
      return Eval_testge(p1);
    case TESTGT:
      return Eval_testgt(p1);
    case TESTLE:
      return Eval_testle(p1);
    case TESTLT:
      return Eval_testlt(p1);
    case TRANSPOSE:
      return Eval_transpose(p1);
    case UNIT:
      return Eval_unit(p1);
    case ZERO:
      return Eval_zero(p1);
    default:
      return Eval_user_function(p1);
  }
}

function Eval_binding(p1: U) {
  push(get_binding(cadr(p1)));
}

/* check =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p

General description
-------------------
Returns whether the predicate p is true/false or unknown:
0 if false, 1 if true or remains unevaluated if unknown.
Note that if "check" is passed an assignment, it turns it into a test,
i.e. check(a = b) is turned into check(a==b) 
so "a" is not assigned anything.
Like in many programming languages, "check" also gives truthyness/falsyness
for numeric values. In which case, "true" is returned for non-zero values.
Potential improvements: "check" can't evaluate strings yet.

*/
function Eval_check(p1: U) {
  // check the argument
  const checkResult = isZeroLikeOrNonZeroLikeOrUndetermined(cadr(p1));

  if (checkResult == null) {
    // returned null: unknown result
    // leave the whole check unevalled
    push(p1);
  } else {
    // returned true or false -> 1 or 0
    push_integer(Number(checkResult));
  }
}

function Eval_det(p1: U) {
  push(cadr(p1));
  Eval();
  const arg = pop() as Tensor;
  push(det(arg));
}

/* dim =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m,n

General description
-------------------
Returns the cardinality of the nth index of tensor "m".

*/
function Eval_dim(p1: U) {
  //int n
  let n: number;
  push(cadr(p1));
  Eval();
  const p2 = pop();
  if (iscons(cddr(p1))) {
    push(caddr(p1));
    Eval();
    n = pop_integer();
  } else {
    n = 1;
  }
  if (!istensor(p2)) {
    push(Constants.one); // dim of scalar is 1
  } else if (n < 1 || n > p2.tensor.ndim) {
    push(p1);
  } else {
    push_integer(p2.tensor.dim[n - 1]);
  }
}

function Eval_divisors(p1: U) {
  push(cadr(p1));
  Eval();
  push(divisors(pop()));
}

/* do =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,b,...

General description
-------------------
Evaluates each argument from left to right. Returns the result of the last argument.

*/
function Eval_do(p1: U) {
  push(car(p1));
  p1 = cdr(p1);

  while (iscons(p1)) {
    pop();
    push(car(p1));
    Eval();
    p1 = cdr(p1);
  }
}

function Eval_dsolve(p1: U) {
  push(cadr(p1));
  Eval();
  push(caddr(p1));
  Eval();
  push(cadddr(p1));
  Eval();
  stop('dsolve');
  //dsolve();
}

// for example, Eval(f,x,2)

function Eval_Eval(p1: U) {
  push(cadr(p1));
  Eval();
  p1 = cddr(p1);
  while (iscons(p1)) {
    push(car(p1));
    Eval();
    push(cadr(p1));
    Eval();
    const newExpr = pop();
    const oldExpr = pop();
    const expr = pop();
    push(subst(expr, oldExpr, newExpr));
    p1 = cddr(p1);
  }
  Eval();
}

// exp evaluation: it replaces itself with
// a POWER(E,something) node and evals that one
function Eval_exp(p1: U) {
  push(cadr(p1));
  Eval();
  push(exponential(pop()));
}

function Eval_factorial(p1: U) {
  push(cadr(p1));
  Eval();
  push(factorial(pop()));
}

function Eval_factorpoly(p1: U) {
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  const arg2 = pop();
  const arg1 = pop();
  let temp = factorpoly(arg1, arg2);
  if (iscons(p1)) {
    temp = p1.tail().reduce((a: U, b: U) => {
      push(b);
      Eval();
      const arg2 = pop();
      return factorpoly(a, arg2);
    }, temp);
  }
  push(temp);
}

function Eval_hermite(p1: U) {
  push(cadr(p1));
  Eval();
  push(caddr(p1));
  Eval();
  const arg2 = pop();
  const arg1 = pop();
  push(hermite(arg1, arg2));
}

function Eval_hilbert(p1: U) {
  push(cadr(p1));
  Eval();
  push(hilbert(pop()));
}

function Eval_index(p1: U) {
  const h = defs.tos;
  const orig = p1;

  // look into the head of the list,
  // when evaluated it should be a tensor
  p1 = cdr(p1);
  push(car(p1));
  Eval();
  const theTensor = top();

  if (isNumericAtom(theTensor)) {
    stop('trying to access a scalar as a tensor');
  }

  if (!istensor(theTensor)) {
    // the tensor is not allocated yet, so
    // leaving the expression unevalled
    moveTos(h);
    push(orig);
    return;
  }

  // we examined the head of the list which
  // was the tensor, now look into
  // the indexes
  p1 = cdr(p1);
  while (iscons(p1)) {
    push(car(p1));
    Eval();
    if (!isintegerorintegerfloat(top())) {
      // index with something other than
      // an integer
      moveTos(h);
      push(orig);
      return;
    }
    p1 = cdr(p1);
  }
  index_function(defs.tos - h);
}

function Eval_inv(p1: U) {
  push(cadr(p1));
  Eval();
  const arg = pop();
  push(inv(arg));
}

function Eval_invg(p1: U) {
  push(cadr(p1));
  Eval();
  const arg = pop();
  push(invg(arg));
}

function Eval_isinteger(p1: U) {
  push(cadr(p1));
  Eval();
  p1 = pop();
  if (isrational(p1)) {
    if (isinteger(p1)) {
      push(Constants.one);
    } else {
      push(Constants.zero);
    }
    return;
  }
  if (isdouble(p1)) {
    const n = Math.floor(p1.d);
    if (n === p1.d) {
      push(Constants.one);
    } else {
      push(Constants.zero);
    }
    return;
  }
  push(makeList(symbol(ISINTEGER), p1));
}

function Eval_number(p1: U) {
  push(cadr(p1));
  Eval();
  p1 = pop();
  if (p1.k === NUM || p1.k === DOUBLE) {
    push(Constants.one);
  } else {
    push(Constants.zero);
  }
}

function Eval_operator(p1: U) {
  const h = defs.tos;
  push_symbol(OPERATOR);
  if (iscons(p1)) {
    p1.tail().forEach((p) => {
      push(p);
      Eval();
    });
  }
  list(defs.tos - h);
}

// quote definition
function Eval_quote(p1: U) {
  push(cadr(p1));
}

// rank definition
function Eval_rank(p1: U) {
  push(cadr(p1));
  Eval();
  p1 = pop();
  if (istensor(p1)) {
    push_integer(p1.tensor.ndim);
  } else {
    push(Constants.zero);
  }
}

// Evaluates the right side and assigns the
// result of the evaluation to the left side.
// It's called setq because it stands for "set quoted" from Lisp,
// see:
//   http://stackoverflow.com/questions/869529/difference-between-set-setq-and-setf-in-common-lisp
// Note that this also takes case of assigning to a tensor
// element, which is something that setq wouldn't do
// in list, see comments further down below.

// Example:
//   f = x
//   // f evaluates to x, so x is assigned to g really
//   // rather than actually f being assigned to g
//   g = f
//   f = y
//   g
//   > x
function Eval_setq(p1: U) {
  // case of tensor
  if (caadr(p1) === symbol(INDEX)) {
    setq_indexed(p1);
    return;
  }

  // case of function definition
  if (iscons(cadr(p1))) {
    define_user_function(p1);
    return;
  }

  if (!issymbol(cadr(p1))) {
    stop('symbol assignment: error in symbol');
  }

  push(caddr(p1));
  Eval();
  const p2 = pop();
  set_binding(cadr(p1), p2);

  // An assignment returns nothing.
  // This is unlike most programming languages
  // where an assignment does return the
  // assigned value.
  // TODO Could be changed.
  push(symbol(NIL));
}

// Here "setq" is a misnomer because
// setq wouldn't work in Lisp to set array elements
// since setq stands for "set quoted" and you wouldn't
// quote an array element access.
// You'd rather use setf, which is a macro that can
// assign a value to anything.
//   (setf (aref YourArray 2) "blue")
// see
//   http://stackoverflow.com/questions/18062016/common-lisp-how-to-set-an-element-in-a-2d-array
//-----------------------------------------------------------------------------
//
//  Example: a[1] = b
//
//  p1  *-------*-----------------------*
//    |  |      |
//    setq  *-------*-------*  b
//      |  |  |
//      index  a  1
//
//  cadadr(p1) -> a
//
//-----------------------------------------------------------------------------
function setq_indexed(p1: U) {
  const p4 = cadadr(p1);
  console.log(`p4: ${p4}`);
  if (!issymbol(p4)) {
    // this is likely to happen when one tries to
    // do assignments like these
    //   1[2] = 3
    // or
    //   f(x)[1] = 2
    // or
    //   [[1,2],[3,4]][5] = 6
    //
    // In other words, one can only do
    // a straight assignment like
    //   existingMatrix[index] = something
    stop('indexed assignment: expected a symbol name');
  }
  const h = defs.tos;
  push(caddr(p1));
  Eval();
  let p2 = cdadr(p1);
  while (iscons(p2)) {
    push(car(p2));
    Eval();
    p2 = cdr(p2);
  }
  set_component(defs.tos - h);
  const p3 = pop();
  set_binding(p4, p3);
  push(symbol(NIL));
}

function Eval_sqrt(p1: U) {
  push(cadr(p1));
  Eval();
  const base = pop();
  push(power(base, rational(1, 2)));
}

function Eval_stop() {
  stop('user stop');
}

function Eval_subst(p1: U) {
  push(cadddr(p1));
  Eval();
  push(caddr(p1));
  Eval();
  push(cadr(p1));
  Eval();
  const newExpr = pop();
  const oldExpr = pop();
  const expr = pop();
  push(subst(expr, oldExpr, newExpr));
  Eval(); // normalize
}

// always returns a matrix with rank 2
// i.e. two dimensions,
// the passed parameter is the size
function Eval_unit(p1: U) {
  push(cadr(p1));
  Eval();
  const n = pop_integer();

  if (isNaN(n)) {
    push(p1);
    return;
  }

  if (n < 1) {
    push(p1);
    return;
  }

  p1 = alloc_tensor(n * n);
  p1.tensor.ndim = 2;
  p1.tensor.dim[0] = n;
  p1.tensor.dim[1] = n;
  for (let i = 0; i < n; i++) {
    p1.tensor.elem[n * i + i] = Constants.one;
  }
  check_tensor_dimensions(p1);
  push(p1);
}

export function Eval_noexpand() {
  noexpand(Eval);
}

// like Eval() except "=" (assignment) is treated
// as "==" (equality test)
// This is because
//  * this allows users to be lazy and just
//    use "=" instead of "==" as per more common
//    mathematical notation
//  * in many places we don't expect an assignment
//    e.g. we don't expect to test the zero-ness
//    of an assignment or the truth value of
//    an assignment
// Note that these are questionable assumptions
// as for example in most programming languages one
// can indeed test the value of an assignment (the
// value is just the evaluation of the right side)

export function Eval_predicate() {
  const p1 = top();
  if (car(p1) === symbol(SETQ)) {
    // replace the assignment in the
    // head with an equality test
    pop();
    push(makeList(symbol(TESTEQ), cadr(p1), caddr(p1)));
  }

  Eval();
}
