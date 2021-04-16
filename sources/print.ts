import {
  ABS,
  ADD,
  ARCCOS,
  ARCSIN,
  ARCTAN,
  BaseAtom,
  BINOMIAL,
  breakpoint,
  caadr,
  caar,
  caddddr,
  cadddr,
  caddr,
  cadr,
  car,
  cddr,
  cdr,
  CEILING,
  CONS,
  Constants,
  COS,
  DEBUG,
  DEFINT,
  defs,
  DERIVATIVE,
  DO,
  DOUBLE,
  Double,
  E,
  FACTORIAL,
  FLOOR,
  FOR,
  FUNCTION,
  INDEX,
  INV,
  isadd,
  iscons,
  isfactorial,
  isinnerordot,
  isinv,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational,
  isstr,
  issymbol,
  istensor,
  istranspose,
  LAST_2DASCII_PRINT,
  LAST_FULL_PRINT,
  LAST_LATEX_PRINT,
  LAST_LIST_PRINT,
  LAST_PLAIN_PRINT,
  MULTIPLY,
  NIL,
  Num,
  NUM,
  PATTERN,
  PI,
  POWER,
  PRINTMODE_2DASCII,
  PRINTMODE_COMPUTER,
  PRINTMODE_HUMAN,
  PRINTMODE_LATEX,
  PRINTMODE_LIST,
  PRINT_LEAVE_E_ALONE,
  PRINT_LEAVE_X_ALONE,
  PRODUCT,
  ROUND,
  SETQ,
  SIN,
  SQRT,
  STR,
  Str,
  SUM,
  Sym,
  SYM,
  symbol,
  TAN,
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
} from '../runtime/defs';
import { pop, push } from '../runtime/stack';
import { get_binding, get_printname, set_binding } from '../runtime/symbol';
import { lessp } from '../sources/misc';
import { absval } from './abs';
import { integer, mp_denominator, mp_numerator, print_number } from './bignum';
import { denominator } from './denominator';
import { Eval } from './eval';
import {
  equaln,
  isfraction,
  isminusone,
  isnegativenumber,
  isnegativeterm,
  isNumberOneOverSomething,
  isoneovertwo,
  isplusone,
  isplustwo,
} from './is';
import { multiply, negate } from './multiply';
import { numerator } from './numerator';
import { print2dascii } from './print2d';
import { scan } from './scan';

const power_str = '^';

// this is only invoked when user invokes
// "print" explicitly
export function Eval_print(p1: U) {
  defs.stringsEmittedByUserPrintouts += _print(cdr(p1), defs.printMode);
  push(symbol(NIL));
}

// this is only invoked when user invokes
// "print2dascii" explicitly
export function Eval_print2dascii(p1: U) {
  defs.stringsEmittedByUserPrintouts += _print(cdr(p1), PRINTMODE_2DASCII);
  push(symbol(NIL));
}

// this is only invoked when user invokes
// "printcomputer" explicitly
export function Eval_printcomputer(p1: U) {
  defs.stringsEmittedByUserPrintouts += _print(cdr(p1), PRINTMODE_COMPUTER);
  push(symbol(NIL));
}

// this is only invoked when user invokes
// "printlatex" explicitly
export function Eval_printlatex(p1: U) {
  defs.stringsEmittedByUserPrintouts += _print(cdr(p1), PRINTMODE_LATEX);
  push(symbol(NIL));
}

// this is only invoked when user invokes
// "printhuman" explicitly
export function Eval_printhuman(p1: U) {
  // test flag needs to be suspended
  // because otherwise "printcomputer" mode
  // will happen.
  const original_test_flag = defs.test_flag;
  defs.test_flag = false;
  defs.stringsEmittedByUserPrintouts += _print(cdr(p1), PRINTMODE_HUMAN);
  defs.test_flag = original_test_flag;
  push(symbol(NIL));
}

// this is only invoked when user invokes
// "printlist" explicitly
export function Eval_printlist(p1: U) {
  const beenPrinted = _print(cdr(p1), PRINTMODE_LIST);
  defs.stringsEmittedByUserPrintouts += beenPrinted;
  push(symbol(NIL));
}

function _print(p: U, passedPrintMode: string): string {
  let accumulator = '';

  while (iscons(p)) {
    push(car(p));
    Eval();
    const p2 = pop();

    // display single symbol as "symbol = result"
    // but don't display "symbol = symbol"

    /*
    if (issymbol(car(p)) && car(p) != p2)
      p2 = makeList(symbol(SETQ), (car(p)), (p2));
    */
    const origPrintMode = defs.printMode;
    if (passedPrintMode === PRINTMODE_COMPUTER) {
      defs.printMode = PRINTMODE_COMPUTER;
      accumulator = printline(p2);
      rememberPrint(accumulator, LAST_FULL_PRINT);
    } else if (passedPrintMode === PRINTMODE_HUMAN) {
      defs.printMode = PRINTMODE_HUMAN;
      accumulator = printline(p2);
      rememberPrint(accumulator, LAST_PLAIN_PRINT);
    } else if (passedPrintMode === PRINTMODE_2DASCII) {
      defs.printMode = PRINTMODE_2DASCII;
      accumulator = print2dascii(p2);
      rememberPrint(accumulator, LAST_2DASCII_PRINT);
    } else if (passedPrintMode === PRINTMODE_LATEX) {
      defs.printMode = PRINTMODE_LATEX;
      accumulator = printline(p2);
      rememberPrint(accumulator, LAST_LATEX_PRINT);
    } else if (passedPrintMode === PRINTMODE_LIST) {
      defs.printMode = PRINTMODE_LIST;
      accumulator = print_list(p2);
      rememberPrint(accumulator, LAST_LIST_PRINT);
    }
    defs.printMode = origPrintMode;

    p = cdr(p);
  }

  if (DEBUG) {
    console.log(
      `emttedString from display: ${defs.stringsEmittedByUserPrintouts}`
    );
  }
  return accumulator;
}

function rememberPrint(theString: string, theTypeOfPrint: number) {
  scan('"' + theString + '"');
  const parsedString = pop();
  set_binding(symbol(theTypeOfPrint), parsedString);
}

export function print_str(s: string): string {
  if (DEBUG) {
    console.log(
      `emttedString from print_str: ${defs.stringsEmittedByUserPrintouts}`
    );
  }
  return s;
}

function print_char(c: string): string {
  return c;
}

export function collectLatexStringFromReturnValue(p: BaseAtom): string {
  const origPrintMode = defs.printMode;
  defs.printMode = PRINTMODE_LATEX;
  const originalCodeGen = defs.codeGen;
  defs.codeGen = false;
  let returnedString = print_expr(p);
  // some variables might contain underscores, escape those
  returnedString = returnedString.replace(/_/g, '\\_');
  defs.printMode = origPrintMode;
  defs.codeGen = originalCodeGen;
  if (DEBUG) {
    console.log(
      `emttedString from collectLatexStringFromReturnValue: ${defs.stringsEmittedByUserPrintouts}`
    );
  }
  return returnedString;
}

export function printline(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_expr(p);
  return accumulator;
}

function print_base_of_denom(BASE: BaseAtom): string {
  let accumulator = '';
  if (
    isfraction(BASE) ||
    isadd(BASE) ||
    ismultiply(BASE) ||
    ispower(BASE) ||
    lessp(BASE as U, Constants.zero)
  ) {
    accumulator += print_char('(');
    accumulator += print_expr(BASE);
    accumulator += print_char(')');
  } else {
    accumulator += print_expr(BASE);
  }
  return accumulator;
}

function print_expo_of_denom(EXPO: BaseAtom): string {
  let accumulator = '';
  if (isfraction(EXPO) || isadd(EXPO) || ismultiply(EXPO) || ispower(EXPO)) {
    accumulator += print_char('(');
    accumulator += print_expr(EXPO);
    accumulator += print_char(')');
  } else {
    accumulator += print_expr(EXPO);
  }
  return accumulator;
}

// prints stuff after the divide symbol "/"

// d is the number of denominators
function print_denom(p: BaseAtom, d: number): string {
  let accumulator = '';

  const BASE = cadr(p);
  let EXPO = caddr(p);

  // i.e. 1 / (2^(1/3))

  // get the cases like BASE^(-1) out of
  // the way, they just become 1/BASE
  if (isminusone(EXPO)) {
    accumulator += print_base_of_denom(BASE);
    return accumulator;
  }

  if (d === 1) {
    accumulator += print_char('(');
  }

  // prepare the exponent
  // (needs to be negated)
  // before printing it out
  EXPO = negate(EXPO);
  accumulator += print_power(BASE, EXPO);
  if (d === 1) {
    accumulator += print_char(')');
  }
  return accumulator;
}

function print_a_over_b(p: BaseAtom): string {
  let A: U, B: U;
  let accumulator = '';
  let flag = 0;

  // count numerators and denominators
  let n = 0;
  let d = 0;

  let p1 = cdr(p);
  let p2 = car(p1);

  if (isrational(p2)) {
    A = absval(mp_numerator(p2));
    B = mp_denominator(p2);
    if (!isplusone(A)) {
      n++;
    }
    if (!isplusone(B)) {
      d++;
    }
    p1 = cdr(p1);
  } else {
    A = Constants.one;
    B = Constants.one;
  }

  while (iscons(p1)) {
    p2 = car(p1);
    if (is_denominator(p2)) {
      d++;
    } else {
      n++;
    }
    p1 = cdr(p1);
  }

  //breakpoint
  if (defs.printMode === PRINTMODE_LATEX) {
    accumulator += print_str('\\frac{');
  }

  if (n === 0) {
    accumulator += print_char('1');
  } else {
    flag = 0;
    p1 = cdr(p);
    if (isrational(car(p1))) {
      p1 = cdr(p1);
    }
    if (!isplusone(A)) {
      accumulator += print_factor(A);
      flag = 1;
    }
    while (iscons(p1)) {
      p2 = car(p1);
      if (!is_denominator(p2)) {
        if (flag) {
          accumulator += print_multiply_sign();
        }
        accumulator += print_factor(p2);
        flag = 1;
      }
      p1 = cdr(p1);
    }
  }

  if (defs.printMode === PRINTMODE_LATEX) {
    accumulator += print_str('}{');
  } else if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
    accumulator += print_str(' / ');
  } else {
    accumulator += print_str('/');
  }

  if (d > 1 && defs.printMode !== PRINTMODE_LATEX) {
    accumulator += print_char('(');
  }

  flag = 0;
  p1 = cdr(p);

  if (isrational(car(p1))) {
    p1 = cdr(p1);
  }

  if (!isplusone(B)) {
    accumulator += print_factor(B);
    flag = 1;
  }

  while (iscons(p1)) {
    p2 = car(p1);
    if (is_denominator(p2)) {
      if (flag) {
        accumulator += print_multiply_sign();
      }
      accumulator += print_denom(p2, d);
      flag = 1;
    }
    p1 = cdr(p1);
  }

  if (d > 1 && defs.printMode !== PRINTMODE_LATEX) {
    accumulator += print_char(')');
  }

  if (defs.printMode === PRINTMODE_LATEX) {
    accumulator += print_str('}');
  }

  return accumulator;
}

export function print_expr(p: BaseAtom): string {
  let accumulator = '';
  if (isadd(p)) {
    p = cdr(p);
    if (sign_of_term(car(p)) === '-') {
      accumulator += print_str('-');
    }
    accumulator += print_term(car(p));
    p = cdr(p);
    while (iscons(p)) {
      if (sign_of_term(car(p)) === '+') {
        if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
          accumulator += print_str(' + ');
        } else {
          accumulator += print_str('+');
        }
      } else {
        if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
          accumulator += print_str(' - ');
        } else {
          accumulator += print_str('-');
        }
      }
      accumulator += print_term(car(p));
      p = cdr(p);
    }
  } else {
    if (sign_of_term(p) === '-') {
      accumulator += print_str('-');
    }
    accumulator += print_term(p);
  }
  return accumulator;
}

function sign_of_term(p: BaseAtom): string {
  let accumulator = '';
  if (
    ismultiply(p) &&
    isNumericAtom(cadr(p)) &&
    lessp(cadr(p), Constants.zero)
  ) {
    accumulator += '-';
  } else if (isNumericAtom(p) && lessp(p, Constants.zero)) {
    accumulator += '-';
  } else {
    accumulator += '+';
  }
  return accumulator;
}

function print_term(p: BaseAtom): string {
  let accumulator = '';
  if (ismultiply(p) && any_denominators(p)) {
    accumulator += print_a_over_b(p);
    return accumulator;
  }

  if (ismultiply(p)) {
    let denom: string;
    let origAccumulator: string;
    p = cdr(p);

    // coeff -1?
    if (isminusone(car(p))) {
      //      print_char('-')
      p = cdr(p);
    }

    let previousFactorWasANumber = false;

    // print the first factor ------------
    if (isNumericAtom(car(p))) {
      previousFactorWasANumber = true;
    }

    // this numberOneOverSomething thing is so that
    // we show things of the form
    //   numericFractionOfForm1/something * somethingElse
    // as
    //   somethingElse / something
    // so for example 1/2 * sqrt(2) is rendered as
    //   sqrt(2)/2
    // rather than the first form, which looks confusing.
    // NOTE that you might want to avoid this
    // when printing polynomials, as it could be nicer
    // to show the numeric coefficients well separated from
    // the variable, but we'll see when we'll
    // come to it if it's an issue.
    let numberOneOverSomething = false;
    if (
      defs.printMode === PRINTMODE_LATEX &&
      iscons(cdr(p)) &&
      isNumberOneOverSomething(car(p))
    ) {
      numberOneOverSomething = true;
      denom = (car(p) as Num).q.b.toString();
    }

    if (numberOneOverSomething) {
      origAccumulator = accumulator;
      accumulator = '';
    } else {
      accumulator += print_factor(car(p));
    }

    p = cdr(p);

    // print all the other factors -------
    while (iscons(p)) {
      // check if we end up having a case where two numbers
      // are next to each other. In those cases, latex needs
      // to insert a \cdot otherwise they end up
      // right next to each other and read like one big number
      if (defs.printMode === PRINTMODE_LATEX) {
        if (previousFactorWasANumber) {
          // if what comes next is a power and the base
          // is a number, then we are in the case
          // of consecutive numbers.
          // Note that sqrt() i.e when exponent is 1/2
          // doesn't count because the radical gives
          // a nice graphical separation already.
          if (caar(p) === symbol(POWER)) {
            if (isNumericAtom(car(cdr(car(p))))) {
              // rule out square root
              if (!isfraction(car(cdr(cdr(car(p)))))) {
                accumulator += ' \\cdot ';
              }
            }
          }
        }
      }
      accumulator += print_multiply_sign();
      accumulator += print_factor(car(p), false, true);

      previousFactorWasANumber = false;
      if (isNumericAtom(car(p))) {
        previousFactorWasANumber = true;
      }

      p = cdr(p);
    }

    if (numberOneOverSomething) {
      accumulator =
        origAccumulator + '\\frac{' + accumulator + '}{' + denom + '}';
    }
  } else {
    accumulator += print_factor(p);
  }
  return accumulator;
}

function print_subexpr(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_char('(');
  accumulator += print_expr(p);
  accumulator += print_char(')');
  return accumulator;
}

function print_factorial_function(p: BaseAtom): string {
  let accumulator = '';
  p = cadr(p);
  if (
    isfraction(p) ||
    isadd(p) ||
    ismultiply(p) ||
    ispower(p) ||
    isfactorial(p)
  ) {
    accumulator += print_subexpr(p);
  } else {
    accumulator += print_expr(p);
  }
  accumulator += print_char('!');
  return accumulator;
}

function print_ABS_latex(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('\\left |');
  accumulator += print_expr(cadr(p));
  accumulator += print_str(' \\right |');
  return accumulator;
}

function print_BINOMIAL_latex(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('\\binom{');
  accumulator += print_expr(cadr(p));
  accumulator += print_str('}{');
  accumulator += print_expr(caddr(p));
  accumulator += print_str('} ');
  return accumulator;
}

function print_DOT_latex(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_expr(cadr(p));
  accumulator += print_str(' \\cdot ');
  accumulator += print_expr(caddr(p));
  return accumulator;
}

function print_DOT_codegen(p: BaseAtom): string {
  let accumulator = 'dot(';
  accumulator += print_expr(cadr(p));
  accumulator += ', ';
  accumulator += print_expr(caddr(p));
  accumulator += ')';
  return accumulator;
}

function print_SIN_codegen(p: BaseAtom): string {
  let accumulator = 'Math.sin(';
  accumulator += print_expr(cadr(p));
  accumulator += ')';
  return accumulator;
}

function print_COS_codegen(p: BaseAtom): string {
  let accumulator = 'Math.cos(';
  accumulator += print_expr(cadr(p));
  accumulator += ')';
  return accumulator;
}

function print_TAN_codegen(p: BaseAtom): string {
  let accumulator = 'Math.tan(';
  accumulator += print_expr(cadr(p));
  accumulator += ')';
  return accumulator;
}

function print_ARCSIN_codegen(p: BaseAtom): string {
  let accumulator = 'Math.asin(';
  accumulator += print_expr(cadr(p));
  accumulator += ')';
  return accumulator;
}

function print_ARCCOS_codegen(p: BaseAtom): string {
  let accumulator = 'Math.acos(';
  accumulator += print_expr(cadr(p));
  accumulator += ')';
  return accumulator;
}

function print_ARCTAN_codegen(p: BaseAtom): string {
  let accumulator = 'Math.atan(';
  accumulator += print_expr(cadr(p));
  accumulator += ')';
  return accumulator;
}

function print_SQRT_latex(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('\\sqrt{');
  accumulator += print_expr(cadr(p));
  accumulator += print_str('} ');
  return accumulator;
}

function print_TRANSPOSE_latex(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('{');
  if (iscons(cadr(p))) {
    accumulator += print_str('(');
  }
  accumulator += print_expr(cadr(p));
  if (iscons(cadr(p))) {
    accumulator += print_str(')');
  }
  accumulator += print_str('}');
  accumulator += print_str('^T');
  return accumulator;
}

function print_TRANSPOSE_codegen(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('transpose(');
  accumulator += print_expr(cadr(p));
  accumulator += print_str(')');
  return accumulator;
}

function print_UNIT_codegen(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('identity(');
  accumulator += print_expr(cadr(p));
  accumulator += print_str(')');
  return accumulator;
}

function print_INV_latex(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('{');
  if (iscons(cadr(p))) {
    accumulator += print_str('(');
  }
  accumulator += print_expr(cadr(p));
  if (iscons(cadr(p))) {
    accumulator += print_str(')');
  }
  accumulator += print_str('}');
  accumulator += print_str('^{-1}');
  return accumulator;
}

function print_INV_codegen(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_str('inv(');
  accumulator += print_expr(cadr(p));
  accumulator += print_str(')');
  return accumulator;
}

function print_DEFINT_latex(p: BaseAtom): string {
  let accumulator = '';
  const functionBody = car(cdr(p));

  p = cdr(p);
  const originalIntegral = p;
  let numberOfIntegrals = 0;

  while (iscons(cdr(cdr(p)))) {
    numberOfIntegrals++;
    const theIntegral = cdr(cdr(p));

    accumulator += print_str('\\int^{');
    accumulator += print_expr(car(cdr(theIntegral)));
    accumulator += print_str('}_{');
    accumulator += print_expr(car(theIntegral));
    accumulator += print_str('} \\! ');
    p = cdr(theIntegral);
  }

  accumulator += print_expr(functionBody);
  accumulator += print_str(' \\,');

  p = originalIntegral;

  for (let i = 1; i <= numberOfIntegrals; i++) {
    const theVariable = cdr(p);
    accumulator += print_str(' \\mathrm{d} ');
    accumulator += print_expr(car(theVariable));
    if (i < numberOfIntegrals) {
      accumulator += print_str(' \\, ');
    }
    p = cdr(cdr(theVariable));
  }
  return accumulator;
}

function print_tensor(p: Tensor<U>): string {
  let accumulator = '';
  accumulator += print_tensor_inner(p, 0, 0)[1];
  return accumulator;
}

// j scans the dimensions
// k is an increment for all the printed elements
//   since they are all together in sequence in one array
function print_tensor_inner(
  p: Tensor<U>,
  j: number,
  k: number
): [number, string] {
  let accumulator = '';

  accumulator += print_str('[');

  // only the last dimension prints the actual elements
  // e.g. in a matrix, the first dimension contains
  // vectors, not elements, and the second dimension
  // actually contains the elements

  // if not the last dimension, we are just printing wrappers
  // and recursing down i.e. we print the next dimension
  if (j < p.tensor.ndim - 1) {
    for (let i = 0; i < p.tensor.dim[j]; i++) {
      let retString: string;
      [k, retString] = Array.from(print_tensor_inner(p, j + 1, k)) as [
        number,
        string
      ];
      accumulator += retString;
      // add separator between elements dimensions
      // "above" the inner-most dimension
      if (i !== p.tensor.dim[j] - 1) {
        accumulator += print_str(',');
      }
    }
    // if we reached the last dimension, we print the actual
    // elements
  } else {
    for (let i = 0; i < p.tensor.dim[j]; i++) {
      accumulator += print_expr(p.tensor.elem[k]);
      // add separator between elements in the
      // inner-most dimension
      if (i !== p.tensor.dim[j] - 1) {
        accumulator += print_str(',');
      }
      k++;
    }
  }

  accumulator += print_str(']');
  return [k, accumulator];
}

function print_tensor_latex(p: Tensor<U>): string {
  let accumulator = '';
  if (p.tensor.ndim <= 2) {
    accumulator += print_tensor_inner_latex(true, p, 0, 0)[1];
  }
  return accumulator;
}

// firstLevel is needed because printing a matrix
// is not exactly an elegant recursive procedure:
// the vector on the first level prints the latex
// "wrap", while the vectors that make up the
// rows don't. so it's a bit asymmetric and this
// flag helps.
// j scans the dimensions
// k is an increment for all the printed elements
//   since they are all together in sequence in one array
function print_tensor_inner_latex(
  firstLevel: boolean,
  p: Tensor<U>,
  j: number,
  k: number
): [number, string] {
  let accumulator = '';

  // open the outer latex wrap
  if (firstLevel) {
    accumulator += '\\begin{bmatrix} ';
  }

  // only the last dimension prints the actual elements
  // e.g. in a matrix, the first dimension contains
  // vectors, not elements, and the second dimension
  // actually contains the elements

  // if not the last dimension, we are just printing wrappers
  // and recursing down i.e. we print the next dimension
  if (j < p.tensor.ndim - 1) {
    for (let i = 0; i < p.tensor.dim[j]; i++) {
      let retString: string;
      [k, retString] = Array.from(
        print_tensor_inner_latex(false, p, j + 1, k)
      ) as [number, string];
      accumulator += retString;
      if (i !== p.tensor.dim[j] - 1) {
        // add separator between rows
        accumulator += print_str(' \\\\ ');
      }
    }
    // if we reached the last dimension, we print the actual
    // elements
  } else {
    for (let i = 0; i < p.tensor.dim[j]; i++) {
      accumulator += print_expr(p.tensor.elem[k]);
      // separator between elements in each row
      if (i !== p.tensor.dim[j] - 1) {
        accumulator += print_str(' & ');
      }
      k++;
    }
  }

  // close the outer latex wrap
  if (firstLevel) {
    accumulator += ' \\end{bmatrix}';
  }

  return [k, accumulator];
}

function print_SUM_latex(p: BaseAtom): string {
  let accumulator = '\\sum_{';
  accumulator += print_expr(caddr(p));
  accumulator += '=';
  accumulator += print_expr(cadddr(p));
  accumulator += '}^{';
  accumulator += print_expr(caddddr(p));
  accumulator += '}{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  return accumulator;
}

function print_SUM_codegen(p: BaseAtom): string {
  const body = cadr(p);
  const variable = caddr(p);
  const lowerlimit = cadddr(p);
  const upperlimit = caddddr(p);

  const accumulator =
    '(function(){' +
    ' var ' +
    variable +
    '; ' +
    ' var holderSum = 0; ' +
    ' var lowerlimit = ' +
    print_expr(lowerlimit) +
    '; ' +
    ' var upperlimit = ' +
    print_expr(upperlimit) +
    '; ' +
    ' for (' +
    variable +
    ' = lowerlimit; ' +
    variable +
    ' < upperlimit; ' +
    variable +
    '++) { ' +
    '   holderSum += ' +
    print_expr(body) +
    ';' +
    ' } ' +
    ' return holderSum;' +
    '})()';

  return accumulator;
}

function print_TEST_latex(p: BaseAtom): string {
  let accumulator = '\\left\\{ \\begin{array}{ll}';

  p = cdr(p);
  while (iscons(p)) {
    // odd number of parameters means that the
    // last argument becomes the default case
    // i.e. the one without a test.
    if (cdr(p) === symbol(NIL)) {
      accumulator += '{';
      accumulator += print_expr(car(p));
      accumulator += '} & otherwise ';
      accumulator += ' \\\\\\\\';
      break;
    }

    accumulator += '{';
    accumulator += print_expr(cadr(p));
    accumulator += '} & if & ';
    accumulator += print_expr(car(p));
    accumulator += ' \\\\\\\\';

    // test unsuccessful, continue to the
    // next pair of test,value
    p = cddr(p);
  }
  accumulator = accumulator.substring(0, accumulator.length - 4);
  return (accumulator += '\\end{array} \\right.');
}

function print_TEST_codegen(p: BaseAtom): string {
  let accumulator = '(function(){';

  p = cdr(p);
  let howManyIfs = 0;
  while (iscons(p)) {
    // odd number of parameters means that the
    // last argument becomes the default case
    // i.e. the one without a test.
    if (cdr(p) === symbol(NIL)) {
      accumulator += 'else {';
      accumulator += 'return (' + print_expr(car(p)) + ');';
      accumulator += '}';
      break;
    }

    if (howManyIfs) {
      accumulator += ' else ';
    }

    accumulator += 'if (' + print_expr(car(p)) + '){';
    accumulator += 'return (' + print_expr(cadr(p)) + ');';
    accumulator += '}';

    // test unsuccessful, continue to the
    // next pair of test,value
    howManyIfs++;
    p = cddr(p);
  }

  accumulator += '})()';

  return accumulator;
}

function print_TESTLT_latex(p: BaseAtom): string {
  let accumulator = '{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  accumulator += ' < ';
  accumulator += '{';
  accumulator += print_expr(caddr(p));
  return (accumulator += '}');
}

function print_TESTLE_latex(p: BaseAtom): string {
  let accumulator = '{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  accumulator += ' \\leq ';
  accumulator += '{';
  accumulator += print_expr(caddr(p));
  return (accumulator += '}');
}

function print_TESTGT_latex(p: BaseAtom): string {
  let accumulator = '{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  accumulator += ' > ';
  accumulator += '{';
  accumulator += print_expr(caddr(p));
  return (accumulator += '}');
}

function print_TESTGE_latex(p: BaseAtom): string {
  let accumulator = '{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  accumulator += ' \\geq ';
  accumulator += '{';
  accumulator += print_expr(caddr(p));
  return (accumulator += '}');
}

function print_TESTEQ_latex(p: BaseAtom): string {
  let accumulator = '{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  accumulator += ' = ';
  accumulator += '{';
  accumulator += print_expr(caddr(p));
  return (accumulator += '}');
}

function print_FOR_codegen(p: BaseAtom): string {
  const body = cadr(p);
  const variable = caddr(p);
  const lowerlimit = cadddr(p);
  const upperlimit = caddddr(p);

  const accumulator =
    '(function(){' +
    ' var ' +
    variable +
    '; ' +
    ' var lowerlimit = ' +
    print_expr(lowerlimit) +
    '; ' +
    ' var upperlimit = ' +
    print_expr(upperlimit) +
    '; ' +
    ' for (' +
    variable +
    ' = lowerlimit; ' +
    variable +
    ' < upperlimit; ' +
    variable +
    '++) { ' +
    '   ' +
    print_expr(body) +
    ' } ' +
    '})()';

  return accumulator;
}

function print_DO_codegen(p: BaseAtom): string {
  let accumulator = '';

  p = cdr(p);
  while (iscons(p)) {
    accumulator += print_expr(car(p));
    p = cdr(p);
  }

  return accumulator;
}

function print_SETQ_codegen(p: BaseAtom): string {
  let accumulator = '';
  accumulator += print_expr(cadr(p));
  accumulator += ' = ';
  accumulator += print_expr(caddr(p));
  accumulator += '; ';
  return accumulator;
}

function print_PRODUCT_latex(p: BaseAtom): string {
  let accumulator = '\\prod_{';
  accumulator += print_expr(caddr(p));
  accumulator += '=';
  accumulator += print_expr(cadddr(p));
  accumulator += '}^{';
  accumulator += print_expr(caddddr(p));
  accumulator += '}{';
  accumulator += print_expr(cadr(p));
  accumulator += '}';
  return accumulator;
}

function print_PRODUCT_codegen(p: BaseAtom): string {
  const body = cadr(p);
  const variable = caddr(p);
  const lowerlimit = cadddr(p);
  const upperlimit = caddddr(p);

  const accumulator =
    '(function(){' +
    ' var ' +
    variable +
    '; ' +
    ' var holderProduct = 1; ' +
    ' var lowerlimit = ' +
    print_expr(lowerlimit) +
    '; ' +
    ' var upperlimit = ' +
    print_expr(upperlimit) +
    '; ' +
    ' for (' +
    variable +
    ' = lowerlimit; ' +
    variable +
    ' < upperlimit; ' +
    variable +
    '++) { ' +
    '   holderProduct *= ' +
    print_expr(body) +
    ';' +
    ' } ' +
    ' return holderProduct;' +
    '})()';

  return accumulator;
}

function print_power(base: BaseAtom, exponent: BaseAtom) {
  let accumulator = '';

  //breakpoint
  if (DEBUG) {
    console.log('power base: ' + base + ' ' + ' exponent: ' + exponent);
  }

  // quick check is this is actually a square root.
  if (isoneovertwo(exponent)) {
    if (equaln(base as U, 2)) {
      if (defs.codeGen) {
        accumulator += print_str('Math.SQRT2');
        return accumulator;
      }
    } else {
      if (defs.printMode === PRINTMODE_LATEX) {
        accumulator += print_str('\\sqrt{');
        accumulator += print_expr(base);
        accumulator += print_str('}');
        return accumulator;
      } else if (defs.codeGen) {
        accumulator += print_str('Math.sqrt(');
        accumulator += print_expr(base);
        accumulator += print_str(')');
        return accumulator;
      }
    }
  }

  if (
    equaln(get_binding(symbol(PRINT_LEAVE_E_ALONE)), 1) &&
    base === symbol(E)
  ) {
    if (defs.codeGen) {
      accumulator += print_str('Math.exp(');
      accumulator += print_expo_of_denom(exponent);
      accumulator += print_str(')');
      return accumulator;
    }

    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_str('e^{');
      accumulator += print_expr(exponent);
      accumulator += print_str('}');
    } else {
      accumulator += print_str('exp(');
      accumulator += print_expr(exponent);
      accumulator += print_str(')');
    }
    return accumulator;
  }

  if (defs.codeGen) {
    accumulator += print_str('Math.pow(');
    accumulator += print_base_of_denom(base);
    accumulator += print_str(', ');
    accumulator += print_expo_of_denom(exponent);
    accumulator += print_str(')');
    return accumulator;
  }

  if (
    equaln(get_binding(symbol(PRINT_LEAVE_X_ALONE)), 0) ||
    (base as Sym).printname !== 'x'
  ) {
    // if the exponent is negative then
    // we invert the base BUT we don't do
    // that if the base is "e", because for
    // example when trigonometric functions are
    // expressed in terms of exponential functions
    // that would be really confusing, one wants to
    // keep "e" as the base and the negative exponent
    if (base !== symbol(E)) {
      if (isminusone(exponent)) {
        if (defs.printMode === PRINTMODE_LATEX) {
          accumulator += print_str('\\frac{1}{');
        } else if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
          accumulator += print_str('1 / ');
        } else {
          accumulator += print_str('1/');
        }

        if (iscons(base) && defs.printMode !== PRINTMODE_LATEX) {
          accumulator += print_str('(');
          accumulator += print_expr(base);
          accumulator += print_str(')');
        } else {
          accumulator += print_expr(base);
        }

        if (defs.printMode === PRINTMODE_LATEX) {
          accumulator += print_str('}');
        }

        return accumulator;
      }

      if (isnegativeterm(exponent)) {
        if (defs.printMode === PRINTMODE_LATEX) {
          accumulator += print_str('\\frac{1}{');
        } else if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
          accumulator += print_str('1 / ');
        } else {
          accumulator += print_str('1/');
        }

        const newExponent = multiply(exponent as U, Constants.negOne);

        if (iscons(base) && defs.printMode !== PRINTMODE_LATEX) {
          accumulator += print_str('(');
          accumulator += print_power(base, newExponent);
          accumulator += print_str(')');
        } else {
          accumulator += print_power(base, newExponent);
        }

        if (defs.printMode === PRINTMODE_LATEX) {
          accumulator += print_str('}');
        }

        return accumulator;
      }
    }

    if (isfraction(exponent) && defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_str('\\sqrt');
      const denomExponent = denominator(exponent);
      // we omit the "2" on the radical
      if (!isplustwo(denomExponent)) {
        accumulator += print_str('[');
        accumulator += print_expr(denomExponent);
        accumulator += print_str(']');
      }
      accumulator += print_str('{');
      exponent = numerator(exponent);
      accumulator += print_power(base, exponent);
      accumulator += print_str('}');
      return accumulator;
    }
  }

  if (defs.printMode === PRINTMODE_LATEX && isplusone(exponent)) {
    // if we are in latex mode we turn many
    // radicals into a radix sign with a power
    // underneath, and the power is often one
    // (e.g. square root turns into a radical
    // with a power one underneath) so handle
    // this case simply here, just print the base
    accumulator += print_expr(base);
  } else {
    // print the base,
    // determining if it needs to be
    // wrapped in parentheses or not
    if (isadd(base) || isnegativenumber(base)) {
      accumulator += print_str('(');
      accumulator += print_expr(base);
      accumulator += print_str(')');
    } else if (ismultiply(base) || ispower(base)) {
      if (defs.printMode !== PRINTMODE_LATEX) {
        accumulator += print_str('(');
      }
      accumulator += print_factor(base, true);
      if (defs.printMode !== PRINTMODE_LATEX) {
        accumulator += print_str(')');
      }
    } else if (
      isNumericAtom(base) &&
      (lessp(base, Constants.zero) || isfraction(base))
    ) {
      accumulator += print_str('(');
      accumulator += print_factor(base);
      accumulator += print_str(')');
    } else {
      accumulator += print_factor(base);
    }

    // print the power symbol
    //breakpoint
    if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
      //print_str(" ^ ")
      accumulator += print_str(power_str);
    } else {
      accumulator += print_str('^');
    }

    // print the exponent
    if (defs.printMode === PRINTMODE_LATEX) {
      // in latex mode, one can omit the curly braces
      // wrapping the exponent if the exponent is only
      // one character long
      if (print_expr(exponent).length > 1) {
        accumulator += print_str('{');
        accumulator += print_expr(exponent);
        accumulator += print_str('}');
      } else {
        accumulator += print_expr(exponent);
      }
    } else if (
      iscons(exponent) ||
      isfraction(exponent) ||
      (isNumericAtom(exponent) && lessp(exponent, Constants.zero))
    ) {
      accumulator += print_str('(');
      accumulator += print_expr(exponent);
      accumulator += print_str(')');
    } else {
      accumulator += print_factor(exponent);
    }
  }
  return accumulator;
}

function print_index_function(p: BaseAtom): string {
  let accumulator = '';
  p = cdr(p);
  if (
    caar(p) === symbol(ADD) ||
    caar(p) === symbol(MULTIPLY) ||
    caar(p) === symbol(POWER) ||
    caar(p) === symbol(FACTORIAL)
  ) {
    accumulator += print_subexpr(car(p));
  } else {
    accumulator += print_expr(car(p));
  }
  accumulator += print_str('[');
  p = cdr(p);
  if (iscons(p)) {
    accumulator += print_expr(car(p));
    p = cdr(p);
    while (iscons(p)) {
      accumulator += print_str(',');
      accumulator += print_expr(car(p));
      p = cdr(p);
    }
  }
  accumulator += print_str(']');
  return accumulator;
}

function print_factor(p: BaseAtom, omitParens = false, pastFirstFactor=false): string {
  // breakpoint
  let accumulator = '';
  if (isNumericAtom(p)) {
    // in an evaluated term, all the numeric parts
    // are at the beginning of the term.
    // When printing the EXPRESSION,
    // we peek into the first factor of the term and we
    // look at whether it's a number less then zero.
    // if it is, we print the "-" as the "leading" part of the
    // print of the EXPRESSION, and then we proceed printint the factors
    // of the term. This means that when we come here, we must
    // skip printing the minus if the number is negative,
    // because it's already been printed.
    if (pastFirstFactor && lessp(p, Constants.zero)) {
      accumulator += '(';
    }
    accumulator += print_number(p, pastFirstFactor);
    if (pastFirstFactor && lessp(p, Constants.zero)) {
      accumulator += ')';
    }
    return accumulator;
  }

  if (isstr(p)) {
    accumulator += print_str('"');
    accumulator += print_str(p.str);
    accumulator += print_str('"');
    return accumulator;
  }

  if (istensor(p)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_tensor_latex(p);
    } else {
      accumulator += print_tensor(p);
    }
    return accumulator;
  }

  if (ismultiply(p)) {
    if (!omitParens) {
      if (sign_of_term(p) === '-' || defs.printMode !== PRINTMODE_LATEX) {
        if (defs.printMode === PRINTMODE_LATEX) {
          accumulator += print_str(' \\left (');
        } else {
          accumulator += print_str('(');
        }
      }
    }
    accumulator += print_expr(p);
    if (!omitParens) {
      if (sign_of_term(p) === '-' || defs.printMode !== PRINTMODE_LATEX) {
        if (defs.printMode === PRINTMODE_LATEX) {
          accumulator += print_str(' \\right ) ');
        } else {
          accumulator += print_str(')');
        }
      }
    }
    return accumulator;
  } else if (isadd(p)) {
    if (!omitParens) {
      accumulator += print_str('(');
    }
    accumulator += print_expr(p);
    if (!omitParens) {
      accumulator += print_str(')');
    }
    return accumulator;
  }

  if (ispower(p)) {
    const base = cadr(p);
    const exponent = caddr(p);
    accumulator += print_power(base, exponent);
    return accumulator;
  }

  //  if (car(p) == _list) {
  //    print_str("{")
  //    p = cdr(p)
  //    if (iscons(p)) {
  //      print_expr(car(p))
  //      p = cdr(p)
  //    }
  //    while (iscons(p)) {
  //      print_str(",")
  //      print_expr(car(p))
  //      p = cdr(p)
  //    }
  //    print_str("}")
  //    return
  //  }

  if (car(p) === symbol(FUNCTION)) {
    const fbody = cadr(p);

    if (!defs.codeGen) {
      const parameters = caddr(p);
      accumulator += print_str('function ');
      if (DEBUG) {
        console.log(
          `emittedString from print_factor ${defs.stringsEmittedByUserPrintouts}`
        );
      }
      const returned = print_list(parameters);
      accumulator += returned;
      accumulator += print_str(' -> ');
    }
    accumulator += print_expr(fbody);
    return accumulator;
  }

  if (car(p) === symbol(PATTERN)) {
    accumulator += print_expr(caadr(p));
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_str(' \\rightarrow ');
    } else {
      if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag) {
        accumulator += print_str(' -> ');
      } else {
        accumulator += print_str('->');
      }
    }

    accumulator += print_expr(car(cdr(cadr(p))));
    return accumulator;
  }

  if (car(p) === symbol(INDEX) && issymbol(cadr(p))) {
    accumulator += print_index_function(p);
    return accumulator;
  }

  if (isfactorial(p)) {
    accumulator += print_factorial_function(p);
    return accumulator;
  } else if (car(p) === symbol(ABS) && defs.printMode === PRINTMODE_LATEX) {
    accumulator += print_ABS_latex(p);
    return accumulator;
  } else if (car(p) === symbol(SQRT) && defs.printMode === PRINTMODE_LATEX) {
    //breakpoint
    accumulator += print_SQRT_latex(p);
    return accumulator;
  } else if (isfactorial(p)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TRANSPOSE_latex(p);
      return accumulator;
    } else if (defs.codeGen) {
      accumulator += print_TRANSPOSE_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(UNIT)) {
    if (defs.codeGen) {
      accumulator += print_UNIT_codegen(p);
      return accumulator;
    }
  } else if (isinv(p)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_INV_latex(p);
      return accumulator;
    } else if (defs.codeGen) {
      accumulator += print_INV_codegen(p);
      return accumulator;
    }
  } else if (
    car(p) === symbol(BINOMIAL) &&
    defs.printMode === PRINTMODE_LATEX
  ) {
    accumulator += print_BINOMIAL_latex(p);
    return accumulator;
  } else if (car(p) === symbol(DEFINT) && defs.printMode === PRINTMODE_LATEX) {
    accumulator += print_DEFINT_latex(p);
    return accumulator;
  } else if (isinnerordot(p)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_DOT_latex(p);
      return accumulator;
    } else if (defs.codeGen) {
      accumulator += print_DOT_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(SIN)) {
    if (defs.codeGen) {
      accumulator += print_SIN_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(COS)) {
    if (defs.codeGen) {
      accumulator += print_COS_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TAN)) {
    if (defs.codeGen) {
      accumulator += print_TAN_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(ARCSIN)) {
    if (defs.codeGen) {
      accumulator += print_ARCSIN_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(ARCCOS)) {
    if (defs.codeGen) {
      accumulator += print_ARCCOS_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(ARCTAN)) {
    if (defs.codeGen) {
      accumulator += print_ARCTAN_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(SUM)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_SUM_latex(p);
      return accumulator;
    } else if (defs.codeGen) {
      accumulator += print_SUM_codegen(p);
      return accumulator;
    }
    //else if car(p) == symbol(QUOTE)
    //  if printMode == PRINTMODE_LATEX
    //    print_expr(cadr(p))
    //    return accumulator
  } else if (car(p) === symbol(PRODUCT)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_PRODUCT_latex(p);
      return accumulator;
    } else if (defs.codeGen) {
      accumulator += print_PRODUCT_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(FOR)) {
    if (defs.codeGen) {
      accumulator += print_FOR_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(DO)) {
    if (defs.codeGen) {
      accumulator += print_DO_codegen(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TEST)) {
    if (defs.codeGen) {
      accumulator += print_TEST_codegen(p);
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TEST_latex(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TESTLT)) {
    if (defs.codeGen) {
      accumulator +=
        '((' + print_expr(cadr(p)) + ') < (' + print_expr(caddr(p)) + '))';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TESTLT_latex(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TESTLE)) {
    if (defs.codeGen) {
      accumulator +=
        '((' + print_expr(cadr(p)) + ') <= (' + print_expr(caddr(p)) + '))';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TESTLE_latex(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TESTGT)) {
    if (defs.codeGen) {
      accumulator +=
        '((' + print_expr(cadr(p)) + ') > (' + print_expr(caddr(p)) + '))';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TESTGT_latex(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TESTGE)) {
    if (defs.codeGen) {
      accumulator +=
        '((' + print_expr(cadr(p)) + ') >= (' + print_expr(caddr(p)) + '))';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TESTGE_latex(p);
      return accumulator;
    }
  } else if (car(p) === symbol(TESTEQ)) {
    if (defs.codeGen) {
      accumulator +=
        '((' + print_expr(cadr(p)) + ') === (' + print_expr(caddr(p)) + '))';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_TESTEQ_latex(p);
      return accumulator;
    }
  } else if (car(p) === symbol(FLOOR)) {
    if (defs.codeGen) {
      accumulator += 'Math.floor(' + print_expr(cadr(p)) + ')';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += ' \\lfloor {' + print_expr(cadr(p)) + '} \\rfloor ';
      return accumulator;
    }
  } else if (car(p) === symbol(CEILING)) {
    if (defs.codeGen) {
      accumulator += 'Math.ceiling(' + print_expr(cadr(p)) + ')';
      return accumulator;
    }
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += ' \\lceil {' + print_expr(cadr(p)) + '} \\rceil ';
      return accumulator;
    }
  } else if (car(p) === symbol(ROUND)) {
    if (defs.codeGen) {
      accumulator += 'Math.round(' + print_expr(cadr(p)) + ')';
      return accumulator;
    }
  } else if (car(p) === symbol(SETQ)) {
    if (defs.codeGen) {
      accumulator += print_SETQ_codegen(p);
      return accumulator;
    } else {
      accumulator += print_expr(cadr(p));
      accumulator += print_str('=');
      accumulator += print_expr(caddr(p));
      return accumulator;
    }
  }

  if (iscons(p)) {
    //if (car(p) == symbol(FORMAL) && cadr(p)->k == SYM) {
    //  print_str(((struct symbol *) cadr(p))->name)
    //  return
    //}
    accumulator += print_factor(car(p));
    p = cdr(p);
    if (!omitParens) {
      accumulator += print_str('(');
    }
    if (iscons(p)) {
      accumulator += print_expr(car(p));
      p = cdr(p);
      while (iscons(p)) {
        accumulator += print_str(',');
        accumulator += print_expr(car(p));
        p = cdr(p);
      }
    }
    if (!omitParens) {
      accumulator += print_str(')');
    }
    return accumulator;
  }

  if (p === symbol(DERIVATIVE)) {
    accumulator += print_char('d');
  } else if (p === symbol(E)) {
    if (defs.codeGen) {
      accumulator += print_str('Math.E');
    } else {
      accumulator += print_str('e');
    }
  } else if (p === symbol(PI)) {
    if (defs.printMode === PRINTMODE_LATEX) {
      accumulator += print_str('\\pi');
    } else {
      accumulator += print_str('pi');
    }
  } else {
    accumulator += print_str(get_printname(p));
  }
  return accumulator;
}

export function print_list(p: BaseAtom): string {
  let accumulator = '';
  switch (p.k) {
    case CONS:
      accumulator += '(';
      accumulator += print_list(car(p));
      if (p === cdr(p)) {
        console.log('oh no recursive!');
        breakpoint;
      }
      p = cdr(p);
      while (iscons(p)) {
        accumulator += ' ';
        accumulator += print_list(car(p));
        p = cdr(p);
        if (p === cdr(p) && p !== symbol(NIL)) {
          console.log('oh no recursive!');
          breakpoint;
        }
      }
      if (p !== symbol(NIL)) {
        accumulator += ' . ';
        accumulator += print_list(p);
      }
      accumulator += ')';
      break;
    case STR:
      //print_str("\"")
      accumulator += (p as Str).str;
      break;
    //print_str("\"")
    case NUM:
    case DOUBLE:
      accumulator += print_number(p as Num | Double, true);
      break;
    case SYM:
      accumulator += get_printname(p as Sym);
      break;
    default:
      accumulator += '<tensor>';
  }
  return accumulator;
}

function print_multiply_sign(): string {
  let accumulator = '';
  if (defs.printMode === PRINTMODE_LATEX) {
    return accumulator;
  }

  if (defs.printMode === PRINTMODE_HUMAN && !defs.test_flag && !defs.codeGen) {
    accumulator += print_str(' ');
  } else {
    accumulator += print_str('*');
  }
  return accumulator;
}

function is_denominator(p: BaseAtom): boolean {
  return ispower(p) && cadr(p) !== symbol(E) && isnegativeterm(caddr(p));
}

// don't consider the leading fraction
// we want 2/3*a*b*c instead of 2*a*b*c/3
function any_denominators(p: BaseAtom): boolean {
  p = cdr(p);
  //  if (isfraction(car(p)))
  //    return 1
  while (iscons(p)) {
    const q = car(p);
    if (is_denominator(q)) {
      return true;
    }
    p = cdr(p);
  }
  return false;
}
