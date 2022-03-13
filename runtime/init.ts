import { version } from './defs';
import { pop, top } from './stack';
import { integer, rational } from '../sources/bignum';
import { Eval, Eval_binding, Eval_check, Eval_det, Eval_dim, Eval_divisors, Eval_do, Eval_Eval, Eval_exp, Eval_factorial, Eval_factorpoly, Eval_hermite, Eval_hilbert, Eval_index, Eval_inv, Eval_invg, Eval_isinteger, Eval_number, Eval_operator, Eval_quote, Eval_rank, Eval_setq, Eval_sqrt, Eval_stop, Eval_subst, Eval_unit } from '../sources/eval';
import { makeList } from '../sources/list';
import { Eval_print, Eval_print2dascii, Eval_printcomputer, Eval_printhuman, Eval_printlatex, Eval_printlist, print_list } from '../sources/print';
import { scan } from '../sources/scan';
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
  ASSUME_REAL_VARIABLES,
  ATOMIZE,
  AUTOEXPAND,
  BAKE,
  BESSELJ,
  BESSELY,
  BINDING,
  BINOMIAL,
  C1,
  C2,
  C3,
  C4,
  C5,
  C6,
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
  DRAW,
  DRAWX,
  DSOLVE,
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
  FORCE_FIXED_PRINTOUT,
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
  ISINTEGER,
  ISPRIME,
  LAGUERRE,
  LAST,
  LAST_2DASCII_PRINT,
  LAST_FULL_PRINT,
  LAST_LATEX_PRINT,
  LAST_LIST_PRINT,
  LAST_PLAIN_PRINT,
  LAST_PRINT,
  LCM,
  LEADING,
  LEGENDRE,
  LOG,
  LOOKUP,
  MAX_FIXED_PRINTOUT_DIGITS,
  METAA,
  METAB,
  METAX,
  MOD,
  MULTIPLY,
  NIL,
  NOT,
  NROOTS,
  NSYM,
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
  PRINT_LEAVE_E_ALONE,
  PRINT_LEAVE_X_ALONE,
  PRODUCT,
  QUOTE,
  QUOTIENT,
  RANK,
  RATIONALIZE,
  REAL,
  reset_after_error,
  ROOTS,
  ROUND,
  SECRETX,
  SETQ,
  SGN,
  SHAPE,
  SILENTPATTERN,
  SIMPLIFY,
  SIN,
  SINH,
  SQRT,
  STOP,
  SUBST,
  SUM,
  Sym,
  SYMBOLSINFO,
  SYMBOL_A,
  SYMBOL_A_UNDERSCORE,
  SYMBOL_B,
  SYMBOL_B_UNDERSCORE,
  SYMBOL_C,
  SYMBOL_D,
  SYMBOL_I,
  SYMBOL_IDENTITY_MATRIX,
  SYMBOL_J,
  SYMBOL_N,
  SYMBOL_R,
  SYMBOL_S,
  SYMBOL_T,
  SYMBOL_X,
  SYMBOL_X_UNDERSCORE,
  SYMBOL_Y,
  SYMBOL_Z,
  TAN,
  TANH,
  TAYLOR,
  TEST,
  TESTEQ,
  TESTGE,
  TESTGT,
  TESTLE,
  TESTLT,
  TRACE,
  TRANSPOSE,
  U,
  UNIT,
  VERSION,
  YYE,
  YYRECT,
  ZERO,
} from './defs';
import {Eval_symbolsinfo, reset_symbols, std_symbol, symbol} from './symbol';
import { Eval_abs } from '../sources/abs';
import { Eval_add } from '../sources/add';
import { Eval_adj } from '../sources/adj';
import { Eval_and, Eval_not, Eval_or, Eval_test, Eval_testeq, Eval_testge, Eval_testgt, Eval_testle, Eval_testlt } from '../sources/test';
import { Eval_arccos } from '../sources/arccos';
import { Eval_approxratio } from '../sources/approxratio';
import { Eval_arccosh } from '../sources/arccosh';
import { Eval_arcsin } from '../sources/arcsin';
import { Eval_arcsinh } from '../sources/arcsinh';
import { Eval_arctan } from '../sources/arctan';
import { Eval_arctanh } from '../sources/arctanh';
import { Eval_arg } from '../sources/arg';
import { Eval_besselj } from '../sources/besselj';
import { Eval_bessely } from '../sources/bessely';
import { Eval_binomial } from '../sources/binomial';
import { Eval_ceiling } from '../sources/ceiling';
import { Eval_choose } from '../sources/choose';
import { Eval_circexp } from '../sources/circexp';
import { Eval_clear, Eval_clearall } from '../sources/clear';
import { Eval_clock } from '../sources/clock';
import { Eval_coeff } from '../sources/coeff';
import { Eval_cofactor } from '../sources/cofactor';
import { Eval_condense } from '../sources/condense';
import { Eval_conj } from '../sources/conj';
import { Eval_contract } from '../sources/contract';
import { Eval_cos } from '../sources/cos';
import { Eval_cosh } from '../sources/cosh';
import { Eval_decomp } from '../sources/decomp';
import { Eval_function_reference } from '../sources/define';
import { Eval_defint } from '../sources/defint';
import { Eval_degree } from '../sources/degree';
import { Eval_denominator } from '../sources/denominator';
import { Eval_derivative } from '../sources/derivative';
import { Eval_dirac } from '../sources/dirac';
import { Eval_eigen, Eval_eigenval, Eval_eigenvec } from '../sources/eigen';
import { Eval_erf } from '../sources/erf';
import { Eval_erfc } from '../sources/erfc';
import { Eval_expand } from '../sources/expand';
import { Eval_expcos } from '../sources/expcos';
import { Eval_expsin } from '../sources/expsin';
import { Eval_factor } from '../sources/factor';
import { Eval_filter } from '../sources/filter';
import { Eval_float } from '../sources/float';
import { Eval_floor } from '../sources/floor';
import { Eval_for } from '../sources/for';
import { Eval_gamma } from '../sources/gamma';
import { Eval_gcd } from '../sources/gcd';
import { Eval_imag } from '../sources/imag';
import { Eval_inner } from '../sources/inner';
import { Eval_integral } from '../sources/integral';
import { Eval_isprime } from '../sources/isprime';
import { Eval_laguerre } from '../sources/laguerre';
import { Eval_lcm } from '../sources/lcm';
import { Eval_leading } from '../sources/leading';
import { Eval_legendre } from '../sources/legendre';
import { Eval_log } from '../sources/log';
import { Eval_lookup } from '../sources/lookup';
import { Eval_mod } from '../sources/mod';
import { Eval_multiply } from '../sources/multiply';
import { Eval_nroots } from '../sources/nroots';
import { Eval_numerator } from '../sources/numerator';
import { Eval_outer } from '../sources/outer';
import { Eval_clearpatterns, Eval_pattern, Eval_patternsinfo, Eval_silentpattern } from '../sources/pattern';
import { Eval_polar } from '../sources/polar';
import { Eval_power } from '../sources/power';
import { Eval_prime } from '../sources/prime';
import { Eval_product } from '../sources/product';
import { Eval_quotient } from '../sources/quotient';
import { Eval_rationalize } from '../sources/rationalize';
import { Eval_real } from '../sources/real';
import { Eval_rect } from '../sources/rect';
import { Eval_roots } from '../sources/roots';
import { Eval_round } from '../sources/round';
import { Eval_sgn } from '../sources/sgn';
import { Eval_shape } from '../sources/shape';
import { Eval_simplify } from '../sources/simplify';
import { Eval_sin } from '../sources/sin';
import { Eval_sinh } from '../sources/sinh';
import { Eval_sum } from '../sources/sum';
import { Eval_tan } from '../sources/tan';
import { Eval_tanh } from '../sources/tanh';
import { Eval_taylor } from '../sources/taylor';
import { Eval_transpose } from '../sources/transpose';
import { Eval_zero } from '../sources/zero';

let init_flag = 0;

export function init() {
  init_flag = 0;

  reset_after_error();
  defs.chainOfUserSymbolsNotFunctionsBeingEvaluated = [];

  if (init_flag) {
    return; // already initted
  }

  init_flag = 1;

  reset_symbols();

  defn();
}

/* cross =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept, script_defined

Parameters
----------
u,v

General description
-------------------
Returns the cross product of vectors u and v.

*/

/* curl =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept, script_defined

Parameters
----------
u

General description
-------------------
Returns the curl of vector u.

*/
const defn_str = [
  'version="' + version + '"',
  'e=exp(1)',
  'i=sqrt(-1)',
  'autoexpand=1',
  'assumeRealVariables=1',
  'trange=[-pi,pi]',
  'xrange=[-10,10]',
  'yrange=[-10,10]',
  'last=0',
  'trace=0',
  'forceFixedPrintout=1',
  'maxFixedPrintoutDigits=6',
  'printLeaveEAlone=1',
  'printLeaveXAlone=0',
  // cross definition
  'cross(u,v)=[u[2]*v[3]-u[3]*v[2],u[3]*v[1]-u[1]*v[3],u[1]*v[2]-u[2]*v[1]]',
  // curl definition
  'curl(v)=[d(v[3],y)-d(v[2],z),d(v[1],z)-d(v[3],x),d(v[2],x)-d(v[1],y)]',
  // div definition
  'div(v)=d(v[1],x)+d(v[2],y)+d(v[3],z)',
  // Note that we use the mathematics / Javascript / Mathematica
  // convention that "log" is indeed the natural logarithm.
  //
  // In engineering, biology, astronomy, "log" can stand instead
  // for the "common" logarithm i.e. base 10. Also note that Google
  // calculations use log for the common logarithm.
  'ln(x)=log(x)',
];

export function defn() {
  std_symbol(ABS, Eval_abs);
  std_symbol(ADD, Eval_add);
  std_symbol(ADJ, Eval_adj);
  std_symbol(AND, Eval_and);
  std_symbol(APPROXRATIO, Eval_approxratio);
  std_symbol(ARCCOS, Eval_arccos);
  std_symbol(ARCCOSH, Eval_arccosh);
  std_symbol(ARCSIN, Eval_arcsin);
  std_symbol(ARCSINH, Eval_arcsinh);
  std_symbol(ARCTAN, Eval_arctan);
  std_symbol(ARCTANH, Eval_arctanh);
  std_symbol(ARG, Eval_arg);
  std_symbol(ATOMIZE);
  std_symbol(BESSELJ, Eval_besselj);
  std_symbol(BESSELY, Eval_bessely);
  std_symbol(BINDING, Eval_binding);
  std_symbol(BINOMIAL, Eval_binomial);
  std_symbol(CEILING, Eval_ceiling);
  std_symbol(CHECK, Eval_check);
  std_symbol(CHOOSE, Eval_choose);
  std_symbol(CIRCEXP, Eval_circexp);
  std_symbol(CLEAR, Eval_clear);
  std_symbol(CLEARALL, Eval_clearall);
  std_symbol(CLEARPATTERNS, Eval_clearpatterns);
  std_symbol(CLOCK, Eval_clock);
  std_symbol(COEFF, Eval_coeff);
  std_symbol(COFACTOR, Eval_cofactor);
  std_symbol(CONDENSE, Eval_condense);
  std_symbol(CONJ, Eval_conj);
  std_symbol(CONTRACT, Eval_contract);
  std_symbol(COS, Eval_cos);
  std_symbol(COSH, Eval_cosh);
  std_symbol(DECOMP, Eval_decomp);
  std_symbol(DEFINT, Eval_defint);
  std_symbol(DEGREE, Eval_degree);
  std_symbol(DENOMINATOR, Eval_denominator);
  std_symbol(DET, Eval_det);
  std_symbol(DERIVATIVE, Eval_derivative);
  std_symbol(DIM, Eval_dim);
  std_symbol(DIRAC, Eval_dirac);
  std_symbol(DIVISORS, Eval_divisors);
  std_symbol(DO, Eval_do);
  std_symbol(DOT, Eval_inner);
  std_symbol(DRAW);
  std_symbol(DSOLVE);
  std_symbol(ERF, Eval_erf);
  std_symbol(ERFC, Eval_erfc);
  std_symbol(EIGEN, Eval_eigen);
  std_symbol(EIGENVAL, Eval_eigenval);
  std_symbol(EIGENVEC, Eval_eigenvec);
  std_symbol(EVAL, Eval_Eval);
  std_symbol(EXP, Eval_exp);
  std_symbol(EXPAND, Eval_expand);
  std_symbol(EXPCOS, Eval_expcos);
  std_symbol(EXPSIN, Eval_expsin);
  std_symbol(FACTOR, Eval_factor);
  std_symbol(FACTORIAL, Eval_factorial);
  std_symbol(FACTORPOLY, Eval_factorpoly);
  std_symbol(FILTER, Eval_filter);
  std_symbol(FLOATF, Eval_float);
  std_symbol(FLOOR, Eval_floor);
  std_symbol(FOR, Eval_for);
  std_symbol(FUNCTION, Eval_function_reference);
  std_symbol(GAMMA, Eval_gamma);
  std_symbol(GCD, Eval_gcd);
  std_symbol(HERMITE, Eval_hermite);
  std_symbol(HILBERT, Eval_hilbert);
  std_symbol(IMAG, Eval_imag);
  std_symbol(INDEX, Eval_index);
  std_symbol(INNER, Eval_inner);
  std_symbol(INTEGRAL, Eval_integral);
  std_symbol(INV, Eval_inv);
  std_symbol(INVG, Eval_invg);
  std_symbol(ISINTEGER, Eval_isinteger);
  std_symbol(ISPRIME, Eval_isprime);
  std_symbol(LAGUERRE, Eval_laguerre);
  //  std_symbol(LAPLACE, Eval_laplace)
  std_symbol(LCM, Eval_lcm);
  std_symbol(LEADING, Eval_leading);
  std_symbol(LEGENDRE, Eval_legendre);
  std_symbol(LOG, Eval_log);
  std_symbol(LOOKUP, Eval_lookup);
  std_symbol(MOD, Eval_mod);
  std_symbol(MULTIPLY, Eval_multiply);
  std_symbol(NOT, Eval_not);
  std_symbol(NROOTS, Eval_nroots);
  std_symbol(NUMBER, Eval_number);
  std_symbol(NUMERATOR, Eval_numerator);
  std_symbol(OPERATOR, Eval_operator);
  std_symbol(OR, Eval_or);
  std_symbol(OUTER, Eval_outer);
  std_symbol(PATTERN, Eval_pattern);
  std_symbol(PATTERNSINFO, Eval_patternsinfo);
  std_symbol(POLAR, Eval_polar);
  std_symbol(POWER, Eval_power);
  std_symbol(PRIME, Eval_prime);
  std_symbol(PRINT, Eval_print);
  std_symbol(PRINT2DASCII, Eval_print2dascii);
  std_symbol(PRINTFULL, Eval_printcomputer);
  std_symbol(PRINTLATEX, Eval_printlatex);
  std_symbol(PRINTLIST, Eval_printlist);
  std_symbol(PRINTPLAIN, Eval_printhuman);
  std_symbol(PRINT_LEAVE_E_ALONE);
  std_symbol(PRINT_LEAVE_X_ALONE);
  std_symbol(PRODUCT, Eval_product);
  std_symbol(QUOTE, Eval_quote);
  std_symbol(QUOTIENT, Eval_quotient);
  std_symbol(RANK, Eval_rank);
  std_symbol(RATIONALIZE, Eval_rationalize);
  std_symbol(REAL, Eval_real);
  std_symbol(YYRECT, Eval_rect);
  std_symbol(ROOTS, Eval_roots);
  std_symbol(ROUND, Eval_round);
  std_symbol(SETQ, Eval_setq);
  std_symbol(SGN, Eval_sgn);
  std_symbol(SILENTPATTERN, Eval_silentpattern);
  std_symbol(SIMPLIFY, Eval_simplify);
  std_symbol(SIN, Eval_sin);
  std_symbol(SINH, Eval_sinh);
  std_symbol(SHAPE, Eval_shape);
  std_symbol(SQRT, Eval_sqrt);
  std_symbol(STOP, Eval_stop);
  std_symbol(SUBST, Eval_subst);
  std_symbol(SUM, Eval_sum);
  std_symbol(SYMBOLSINFO, Eval_symbolsinfo);
  std_symbol(TAN, Eval_tan);
  std_symbol(TANH, Eval_tanh);
  std_symbol(TAYLOR, Eval_taylor);
  std_symbol(TEST, Eval_test);
  std_symbol(TESTEQ, Eval_testeq);
  std_symbol(TESTGE, Eval_testge);
  std_symbol(TESTGT, Eval_testgt);
  std_symbol(TESTLE, Eval_testle);
  std_symbol(TESTLT, Eval_testlt);
  std_symbol(TRANSPOSE, Eval_transpose);
  std_symbol(UNIT, Eval_unit);
  std_symbol(ZERO, Eval_zero);

  std_symbol(NIL);

  std_symbol(AUTOEXPAND);
  std_symbol(BAKE);
  std_symbol(ASSUME_REAL_VARIABLES);

  std_symbol(LAST);

  std_symbol(LAST_PRINT);
  std_symbol(LAST_2DASCII_PRINT);
  std_symbol(LAST_FULL_PRINT);
  std_symbol(LAST_LATEX_PRINT);
  std_symbol(LAST_LIST_PRINT);
  std_symbol(LAST_PLAIN_PRINT);

  std_symbol(TRACE);

  std_symbol(FORCE_FIXED_PRINTOUT);
  std_symbol(MAX_FIXED_PRINTOUT_DIGITS);

  std_symbol(YYE); 

  std_symbol(DRAWX); // special purpose internal symbols
  std_symbol(METAA);
  std_symbol(METAB);
  std_symbol(METAX);
  std_symbol(SECRETX);

  std_symbol(VERSION);

  std_symbol(PI);
  std_symbol(SYMBOL_A);
  std_symbol(SYMBOL_B);
  std_symbol(SYMBOL_C);
  std_symbol(SYMBOL_D);
  std_symbol(SYMBOL_I);
  std_symbol(SYMBOL_J);
  std_symbol(SYMBOL_N);
  std_symbol(SYMBOL_R);
  std_symbol(SYMBOL_S);
  std_symbol(SYMBOL_T);
  std_symbol(SYMBOL_X);
  std_symbol(SYMBOL_Y);
  std_symbol(SYMBOL_Z);
  std_symbol(SYMBOL_IDENTITY_MATRIX);

  std_symbol(SYMBOL_A_UNDERSCORE);
  std_symbol(SYMBOL_B_UNDERSCORE);
  std_symbol(SYMBOL_X_UNDERSCORE);

  std_symbol(C1);
  std_symbol(C2);
  std_symbol(C3);
  std_symbol(C4);
  std_symbol(C5);
  std_symbol(C6);

  defineSomeHandyConstants();

  // don't add all these functions to the
  // symbolsDependencies, clone the original
  const originalCodeGen = defs.codeGen;
  defs.codeGen = false;

  for (let defn_i = 0; defn_i < defn_str.length; defn_i++) {
    const definitionOfInterest = defn_str[defn_i];
    const [,def] = scan(definitionOfInterest);
    if (DEBUG) {
      console.log(`... evaling ${definitionOfInterest}`);
      console.log('top of stack:');
      console.log(print_list(def));
    }
    Eval(def);
  }

  // restore the symbol dependencies as they were before.
  defs.codeGen = originalCodeGen;
}

function defineSomeHandyConstants() {
  // i is the square root of -1 i.e. -1 ^ 1/2
  const imaginaryunit = makeList(symbol(POWER), integer(-1), rational(1, 2));
  if (DEBUG) {
    console.log(print_list(imaginaryunit));
  }
  Constants.imaginaryunit = imaginaryunit; // must be untagged in gc
}
