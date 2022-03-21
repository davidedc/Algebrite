import bigInt from 'big-integer';
import {collectLatexStringFromReturnValue, print_expr,} from '../sources/print';
import {symbol} from './symbol';

export function breakpoint() {}

// also change the version in the package.json file
export const version = '1.3.1';

const SELFTEST = 1;

// size of the symbol table
export const NSYM = 1000;

export const DEBUG = false;
export const PRINTOUTRESULT = false;

// printing-related constants
export const PRINTMODE_LATEX = 'PRINTMODE_LATEX';
export const PRINTMODE_2DASCII = 'PRINTMODE_2DASCII';
export const PRINTMODE_COMPUTER = 'PRINTMODE_COMPUTER';
export const PRINTMODE_HUMAN = 'PRINTMODE_HUMAN';
export const PRINTMODE_LIST = 'PRINTMODE_LIST';

export type PrintMode =
  | typeof PRINTMODE_LATEX
  | typeof PRINTMODE_2DASCII
  | typeof PRINTMODE_COMPUTER
  | typeof PRINTMODE_HUMAN
  | typeof PRINTMODE_LIST;

class Defs {
  // when the user uses the generic "print" statement
  // this setting kicks-in.
  public printMode: PrintMode = PRINTMODE_COMPUTER;

  public recursionLevelNestedRadicalsRemoval = 0;
  public errorMessage = '';

  // needed for the mechanism to
  // find all dependencies between variables
  // in a script
  public symbolsDependencies: { [key: string]: string[] } = {};

  public symbolsHavingReassignments: string[] = [];
  public symbolsInExpressionsWithoutAssignments: string[] = [];
  public patternHasBeenFound = false;
  public inited = false;
  public chainOfUserSymbolsNotFunctionsBeingEvaluated: Sym[] = [];
  public stringsEmittedByUserPrintouts = '';

  // flag use to potentially switch on/off some quirks "deep"
  // in the code due to call from Algebra block.
  // Currently not used.
  public called_from_Algebra_block = false;

  public expanding = false;
  public evaluatingAsFloats = false;
  public evaluatingPolar = false;
  public esc_flag = false;
  public trigmode: 0 | 1 | 2 = 0;

  public out_count = 0;
  public test_flag = false;
  public codeGen = false;
  public userSimplificationsInListForm: U[] = [];
  public userSimplificationsInStringForm: string[] = [];
  public fullDoubleOutput = false;
}

export const defs = new Defs();

export const dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication = true;
export const do_simplify_nested_radicals = true;
export const avoidCalculatingPowersIntoArctans = true;

// Symbolic expressions are built by connecting U structs.
//
// For example, (a b + c) is built like this:
//
//           _______      _______                                _______
//          |CONS   |--->|CONS   |----------------------------->|CONS   |
//          |       |    |       |                              |       |
//          |_______|    |_______|                              |_______|
//              |            |                                      |
//           ___v___      ___v___      _______      _______      ___v___
//          |ADD    |    |CONS   |--->|CONS   |--->|CONS   |    |SYM c  |
//          |       |    |       |    |       |    |       |    |       |
//          |_______|    |_______|    |_______|    |_______|    |_______|
//                           |            |            |
//                        ___v___      ___v___      ___v___
//                       |MUL    |    |SYM a  |    |SYM b  |
//                       |       |    |       |    |       |
//                       |_______|    |_______|    |_______|
export abstract class BaseAtom {
  public abstract readonly k: number;
  public toString() {
    return print_expr(this);
  }
  public toLatexString() {
    return collectLatexStringFromReturnValue(this);
  }
}

export class Cons extends BaseAtom {
  public readonly cons: { car: U; cdr: U };
  public k: typeof CONS = CONS;

  constructor(car: U, cdr: U) {
    super();
    this.cons = { car, cdr };
  }

  public *[Symbol.iterator]() {
    let u: U = this;
    while (iscons(u)) {
      yield car(u);
      u = cdr(u);
    }
  }

  // Return everything except the first item in the list
  public tail(): U[] {
    if (iscons(this.cons.cdr)) {
      return [...this.cons.cdr];
    }
    return [];
  }

  public map(f: (a: U) => U): Cons {
    const a = car(this);
    let b = cdr(this);
    if (iscons(b)) {
      b = b.map(f);
    }
    return new Cons(f(a), b);
  }
}

export class Num extends BaseAtom {
  public readonly q: Num = this;
  public k: typeof NUM = NUM;
  constructor(
    public a: bigInt.BigInteger,
    public b: bigInt.BigInteger = bigInt.one
  ) {
    super();
  }

  // These flags are not actually set, they're only used for typechecking.
  // Don't use them directly.
  __ts_sign?: -1 | 0 | 1;
  __ts_integer?: boolean;
  __ts_special?: number;
}

export class Double extends BaseAtom {
  public k: typeof DOUBLE = DOUBLE;
  constructor(public d: number) {
    super();
  }

  // These flags are not actually set, they're only used for typechecking.
  // Don't use them directly.
  __ts_sign?: -1 | 0 | 1;
  __ts_integer?: boolean;
  __ts_special?: number;
}

export class Str extends BaseAtom {
  public k: typeof STR = STR;
  constructor(public str: string) {
    super();
  }
}

export class Tensor<T extends U = U> extends BaseAtom {
  public readonly tensor = this;
  public k: typeof TENSOR = TENSOR;

  public ndim = 0; // number of dimensions
  public dim: number[] = []; // dimension length, for each dimension
  public elem: T[] = []; // an array containing all the data

  public get nelem() {
    return this.elem.length;
  }
}

export class Sym extends BaseAtom {
  public k: typeof SYM = SYM;
  public latexPrint?: string;
  constructor(public printname: string) {
    super();
  }

  public keyword:(p1:Cons)=>U;
}

export type U = Cons | Num | Double | Str | Tensor | Sym;

// the following enum is for struct U, member k

export const CONS = 0;
export const NUM = 1;
export const DOUBLE = 2;
export const STR = 3;
export const TENSOR = 4;
export const SYM = 5;

// the following enum is for indexing the symbol table
// standard functions first, then nil, then everything else

let counter = 0;
export const ABS = 'abs';
export const ADD = 'add';
export const ADJ = 'adj';
export const AND = 'and';
export const APPROXRATIO = 'approxratio';
export const ARCCOS = 'arccos';
export const ARCCOSH = 'arccosh';
export const ARCSIN = 'arcsin';
export const ARCSINH = 'arcsinh';
export const ARCTAN = 'arctan';
export const ARCTANH = 'arctanh';
export const ARG = 'arg';
export const ATOMIZE = 'atomize';
export const BESSELJ = 'besselj';
export const BESSELY = 'bessely';
export const BINDING = 'binding';
export const BINOMIAL = 'binomial';
export const CEILING = 'ceiling';
export const CHECK = 'check';
export const CHOOSE = 'choose';
export const CIRCEXP = 'circexp';
export const CLEAR = 'clear';
export const CLEARALL = 'clearall';
export const CLEARPATTERNS = 'clearpatterns';
export const CLOCK = 'clock';
export const COEFF = 'coeff';
export const COFACTOR = 'cofactor';
export const CONDENSE = 'condense';
export const CONJ = 'conj';
export const CONTRACT = 'contract';
export const COS = 'cos';
export const COSH = 'cosh';
export const DECOMP = 'decomp';
export const DEFINT = 'defint';
export const DEGREE = 'deg';
export const DENOMINATOR = 'denominator';
export const DERIVATIVE = 'derivative';
export const DET = 'det';
export const DIM = 'dim';
export const DIRAC = 'dirac';
export const DIVISORS = 'divisors';
export const DO = 'do';
export const DOT = 'dot';
export const DRAW = 'draw';
export const DSOLVE = 'dsolve';
export const EIGEN = 'eigen';
export const EIGENVAL = 'eigenval';
export const EIGENVEC = 'eigenvec';
export const ERF = 'erf';
export const ERFC = 'erfc';
export const EVAL = 'eval';
export const EXP = 'exp';
export const EXPAND = 'expand';
export const EXPCOS = 'expcos';
export const EXPSIN = 'expsin';
export const FACTOR = 'factor';
export const FACTORIAL = 'factorial';
export const FACTORPOLY = 'factorpoly';
export const FILTER = 'filter';
export const FLOATF = 'float';
export const FLOOR = 'floor';
export const FOR = 'for';
export const FUNCTION = 'function';
export const GAMMA = 'Gamma';
export const GCD = 'gcd';
export const HERMITE = 'hermite';
export const HILBERT = 'hilbert';
export const IMAG = 'imag';
export const INDEX = 'component';
export const INNER = 'inner';
export const INTEGRAL = 'integral';
export const INV = 'inv';
export const INVG = 'invg';
export const ISINTEGER = 'isinteger';
export const ISPRIME = 'isprime';
export const LAGUERRE = 'laguerre';
//  LAPLACE = 
export const LCM = 'lcm';
export const LEADING = 'leading';
export const LEGENDRE = 'legendre';
export const LOG = 'log';
export const LOOKUP = 'lookup';
export const MOD = 'mod';
export const MULTIPLY = 'multiply';
export const NOT = 'not';
export const NROOTS = 'nroots';
export const NUMBER = 'number';
export const NUMERATOR = 'numerator';
export const OPERATOR = 'operator';
export const OR = 'or';
export const OUTER = 'outer';
export const PATTERN = 'pattern';
export const PATTERNSINFO = 'patternsinfo';
export const POLAR = 'polar';
export const POWER = 'power';
export const PRIME = 'prime';
export const PRINT_LEAVE_E_ALONE = 'printLeaveEAlone';
export const PRINT_LEAVE_X_ALONE = 'printLeaveXAlone';
export const PRINT = 'print';
export const PRINT2DASCII = 'print2dascii';
export const PRINTFULL = 'printcomputer';
export const PRINTLATEX = 'printlatex';
export const PRINTLIST = 'printlist';
export const PRINTPLAIN = 'printhuman';
export const PRODUCT = 'product';
export const QUOTE = 'quote';
export const QUOTIENT = 'quotient';
export const RANK = 'rank';
export const RATIONALIZE = 'rationalize';
export const REAL = 'real';
export const ROUND = 'round';
export const YYRECT = 'rect';
export const ROOTS = 'roots';
export const SETQ = 'equals';
export const SGN = 'sgn';
export const SILENTPATTERN = 'silentpattern';
export const SIMPLIFY = 'simplify';
export const SIN = 'sin';
export const SINH = 'sinh';
export const SHAPE = 'shape';
export const SQRT = 'sqrt';
export const STOP = 'stop';
export const SUBST = 'subst';
export const SUM = 'sum';
export const SYMBOLSINFO = 'symbolsinfo';
export const TAN = 'tan';
export const TANH = 'tanh';
export const TAYLOR = 'taylor';
export const TEST = 'test';
export const TESTEQ = 'testeq';
export const TESTGE = 'testge';
export const TESTGT = 'testgt';
export const TESTLE = 'testle';
export const TESTLT = 'testlt';
export const TRANSPOSE = 'transpose';
export const UNIT = 'unit';
export const ZERO = 'zero';

// ALL THE SYMBOLS ABOVE NIL ARE KEYWORDS,
// WHICH MEANS THAT USER CANNOT REDEFINE THEM
export const NIL = 'nil'; // nil goes here, after standard functions
export const LAST = 'last';

export const LAST_PRINT = 'lastprint';
export const LAST_2DASCII_PRINT = 'last2dasciiprint';
export const LAST_FULL_PRINT = 'lastfullprint';
export const LAST_LATEX_PRINT = 'lastlatexprint';
export const LAST_LIST_PRINT = 'lastlistprint';
export const LAST_PLAIN_PRINT = 'lastplainprint';

export const AUTOEXPAND = 'autoexpand';
export const BAKE = 'bake';
export const ASSUME_REAL_VARIABLES = 'assumeRealVariables';
export const TRACE = 'trace';
export const FORCE_FIXED_PRINTOUT = 'forceFixedPrintout';
export const MAX_FIXED_PRINTOUT_DIGITS = 'maxFixedPrintoutDigits';

export const YYE = '~'; // tilde so sort puts it after other symbols

export const DRAWX = '$DRAWX'; // special purpose internal symbols
export const METAA = '$METAA';
export const METAB = '$METAB';
export const METAX = '$METAX';
export const SECRETX = '$SECRETX';

export const VERSION = 'version';

export const PI = 'pi';
export const SYMBOL_A = 'a';
export const SYMBOL_B = 'b';
export const SYMBOL_C = 'c';
export const SYMBOL_D = 'd';
export const SYMBOL_I = 'i';
export const SYMBOL_J = 'j';
export const SYMBOL_N = 'n';
export const SYMBOL_R = 'r';
export const SYMBOL_S = 's';
export const SYMBOL_T = 't';
export const SYMBOL_X = 'x';
export const SYMBOL_Y = 'y';
export const SYMBOL_Z = 'z';
export const SYMBOL_IDENTITY_MATRIX = 'I';

export const SYMBOL_A_UNDERSCORE = 'a_';
export const SYMBOL_B_UNDERSCORE = 'b_';
export const SYMBOL_X_UNDERSCORE = 'x_';

export const C1 = '$C1';
export const C2 = '$C2';
export const C3 = '$C3';
export const C4 = '$C4';
export const C5 = '$C5';
export const C6 = '$C6';

export const E = YYE;

export const MAXPRIMETAB = 10000;
export const MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES = 5;
export const MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE = 10;

//define _USE_MATH_DEFINES // for MS C++

export const MAXDIM = 24;

export const predefinedSymbolsInGlobalScope_doNotTrackInDependencies = [
  'rationalize',
  'abs',
  'e',
  'i',
  'pi',
  'sin',
  'ceiling',
  'cos',
  'roots',
  'integral',
  'derivative',
  'defint',
  'sqrt',
  'eig',
  'cov',
  'deig',
  'dcov',
  'float',
  'floor',
  'product',
  'root',
  'round',
  'sum',
  'test',
  'unit',
];

// you can do some little simplifications
// at parse time, such as calculating away
// immediately simple operations on
// constants, removing 1s from products
// etc.
export const parse_time_simplifications = true;

export const primetab = (function () {
  const primes = [2];
  let i = 3;
  while (primes.length < MAXPRIMETAB) {
    let j = 0;
    const ceil = Math.sqrt(i);
    while (j < primes.length && primes[j] <= ceil) {
      if (i % primes[j] === 0) {
        j = -1;
        break;
      }
      j++;
    }
    if (j !== -1) {
      primes.push(i);
    }
    i += 2;
  }
  primes[MAXPRIMETAB] = 0;
  return primes;
})();

let draw_flag = false;
export const mtotal = 0;
export const logbuf = '';

const arglist = []; // will contain U

const draw_stop_return = null; // extern jmp_buf ?????

export const transpose_unicode = 7488;
export const dotprod_unicode = 183;

export function iscons(p: BaseAtom): p is Cons {
  return p.k === CONS;
}

export function isrational(p: BaseAtom): p is Num {
  return p.k === NUM;
}

export function isdouble(p: BaseAtom): p is Double {
  return p.k === DOUBLE;
}

export function isNumericAtom(p: BaseAtom): p is Double | Num {
  return isrational(p) || isdouble(p);
}

export function isstr(p: BaseAtom): p is Str {
  return p.k === STR;
}

export function istensor(p: BaseAtom): p is Tensor {
  return p.k === TENSOR;
}

export type NumbericTensor = Double | Num | Tensor<NumbericTensor>;

// because of recursion, we consider a scalar to be
// a tensor, so a numeric scalar will return true
export function isNumericAtomOrTensor(p: U): p is NumbericTensor {
  if (isNumericAtom(p) || p === symbol(SYMBOL_IDENTITY_MATRIX)) {
    return true;
  }

  if (!istensor(p)) {
    //console.log "p not an atom nor a tensor: " + p
    return false;
  }

  const n = p.tensor.nelem;
  const a = p.tensor.elem;

  for (let i = 0; i < n; i++) {
    if (!isNumericAtomOrTensor(a[i])) {
      //console.log "non-numeric element: " + a[i]
      return false;
    }
  }
  return true;
}

export function issymbol(p: U): p is Sym {
  return p.k === SYM;
}

export function car(p: BaseAtom): U {
  if (iscons(p)) {
    return p.cons.car;
  } else {
    return symbol(NIL);
  }
}

export function cdr(p: BaseAtom): U {
  if (iscons(p)) {
    return p.cons.cdr;
  } else {
    return symbol(NIL);
  }
}

export function caar(p: BaseAtom): U {
  return car(car(p));
}

export function cadr(p: BaseAtom): U {
  return car(cdr(p));
}

export function cdar(p: BaseAtom): U {
  return cdr(car(p));
}

export function cddr(p: BaseAtom): U {
  return cdr(cdr(p));
}

export function caadr(p: BaseAtom): U {
  return car(car(cdr(p)));
}

export function caddr(p: BaseAtom): U {
  return car(cdr(cdr(p)));
}

export function cadar(p: BaseAtom): U {
  return car(cdr(car(p)));
}

export function cdadr(p: BaseAtom): U {
  return cdr(car(cdr(p)));
}

export function cddar(p: BaseAtom): U {
  return cdr(cdr(car(p)));
}

export function cdddr(p: BaseAtom): U {
  return cdr(cdr(cdr(p)));
}

export function caaddr(p: BaseAtom): U {
  return car(car(cdr(cdr(p))));
}

export function cadadr(p: BaseAtom): U {
  return car(cdr(car(cdr(p))));
}

export function caddar(p: BaseAtom): U {
  return car(cdr(cdr(car(p))));
}

export function cdaddr(p: BaseAtom): U {
  return cdr(car(cdr(cdr(p))));
}

export function cadddr(p: BaseAtom): U {
  return car(cdr(cdr(cdr(p))));
}

export function cddddr(p: BaseAtom): U {
  return cdr(cdr(cdr(cdr(p))));
}

export function caddddr(p: BaseAtom): U {
  return car(cdr(cdr(cdr(cdr(p)))));
}

export function cadaddr(p: BaseAtom): U {
  return car(cdr(car(cdr(cdr(p)))));
}

export function cddaddr(p: BaseAtom): U {
  return cdr(cdr(car(cdr(cdr(p)))));
}

export function caddadr(p: BaseAtom): U {
  return car(cdr(cdr(car(cdr(p)))));
}

export function cdddaddr(p: BaseAtom): U {
  return cdr(cdr(cdr(car(cdr(cdr(p))))));
}

export function caddaddr(p: BaseAtom): U {
  return car(cdr(cdr(car(cdr(cdr(p))))));
}

export function isadd(p: BaseAtom): p is Cons & { __ts_sym: '+' } {
  return car(p) === symbol(ADD);
}

export function ismultiply(p: BaseAtom): p is Cons & { __ts_sym: '*' } {
  return car(p) === symbol(MULTIPLY);
}

export function ispower(p: BaseAtom): p is Cons & { __ts_sym: '^' } {
  return car(p) === symbol(POWER);
}

export function isfactorial(p: BaseAtom): p is Cons & { __ts_sym: '!' } {
  return car(p) === symbol(FACTORIAL);
}

export function isinnerordot(p: BaseAtom): boolean {
  return car(p) === symbol(INNER) || car(p) === symbol(DOT);
}

export function istranspose(p: BaseAtom): boolean {
  return car(p) === symbol(TRANSPOSE);
}

export function isinv(p: BaseAtom): boolean {
  return car(p) === symbol(INV);
}

// TODO this is a bit of a shallow check, we should
// check when we are passed an actual tensor and possibly
// cache the test result.
export function isidentitymatrix(p: BaseAtom): p is Sym & { identity: true } {
  return p === symbol(SYMBOL_IDENTITY_MATRIX);
}

export type Sign = -1 | 0 | 1;
export function MSIGN(p: bigInt.BigInteger): Sign {
  if (p.isPositive()) {
    return 1;
  } else if (p.isZero()) {
    return 0;
  } else {
    return -1;
  }
}

function MLENGTH(p: bigInt.BigInteger): number {
  return p.toString().length;
}

export function MZERO(p: bigInt.BigInteger): boolean {
  return p.isZero();
}

export function MEQUAL(p: bigInt.BigInteger, n: number): boolean {
  if (p == null) {
    breakpoint;
  }
  return p.equals(n);
}

export function reset_after_error() {
    defs.esc_flag = false;
  draw_flag = false;
  defs.evaluatingAsFloats = false;
  defs.evaluatingPolar = false;
}

export const $: { [key: string]: unknown } = {};

export class Constants {
  public static readonly one = new Num(bigInt(1));
  private static oneAsDouble = new Double(1.0);
  public static readonly negOne = new Num(bigInt(-1));
  private static negOneAsDouble = new Double(-1.0);
  public static readonly zero = new Num(bigInt(0));
  public static readonly zeroAsDouble = new Double(0.0);
  public static readonly piAsDouble = new Double(Math.PI);

  // i is the square root of -1 i.e. -1 ^ 1/2
  public static imaginaryunit: U;

  public static One(): Num | Double {
    return defs.evaluatingAsFloats ? Constants.oneAsDouble : Constants.one;
  }

  public static NegOne(): Num | Double {
    return defs.evaluatingAsFloats
      ? Constants.negOneAsDouble
      : Constants.negOne;
  }

  public static Zero(): Num | Double {
    return defs.evaluatingAsFloats ? Constants.zeroAsDouble : Constants.zero;
  }

  public static Pi(): Sym | Double {
    return defs.evaluatingAsFloats ? Constants.piAsDouble : symbol(PI);
  }
}

// Call a function temporarily setting "expanding" to false
export function noexpand<T extends any[], V>(
  func: (...args: T) => V,
  ...args: T
): V {
  const prev_expanding = defs.expanding;
  defs.expanding = false;
  try {
    return func(...args);
  } finally {
    defs.expanding = prev_expanding;
  }
}

// Call a function temporarily setting "expanding" to true
export function doexpand<T extends any[], V>(
  func: (...args: T) => V,
  ...args: T
): V {
  const prev_expanding = defs.expanding;
  defs.expanding = true;
  try {
    return func(...args);
  } finally {
    defs.expanding = prev_expanding;
  }
}

// Call a function temporarily setting "evaluatingPolar" to true
export function evalPolar<T extends any[], V>(
  func: (...args: T) => V,
  ...args: T
): V {
  const prev_evaluatingPolar = defs.evaluatingPolar;
  defs.evaluatingPolar = true;
  try {
    return func(...args);
  } finally {
    defs.evaluatingPolar = prev_evaluatingPolar;
  }
}

// Call a function temporarily setting "evaluatingAsFloats" to true
export function evalFloats<T extends any[], V>(
  func: (...args: T) => V,
  ...args: T
): V {
  const prev_evaluatingAsFloats = defs.evaluatingAsFloats;
  defs.evaluatingAsFloats = true;
  try {
    return func(...args);
  } finally {
    defs.evaluatingAsFloats = prev_evaluatingAsFloats;
  }
}
