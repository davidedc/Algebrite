import bigInt from 'big-integer';
import { moveTos } from './stack';
import {
  collectLatexStringFromReturnValue,
  print_expr,
} from '../sources/print';
import { symnum } from './symbol';

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

  // top of stack
  public tos = 0;

  public expanding = false;
  public evaluatingAsFloats = false;
  public evaluatingPolar = false;
  public esc_flag = false;
  public trigmode: 0 | 1 | 2 = 0;

  // will contain *U
  public stack: (U | undefined | null)[] = [];

  public frame = 0;

  public p0?: U;
  public p1?: U;
  public p2?: U;
  public p3?: U;
  public p4?: U;
  public p5?: U;
  public p6?: U;
  public p7?: U;
  public p8?: U;
  public p9?: U;

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
export const ABS = counter++;
export const ADD = counter++;
export const ADJ = counter++;
export const AND = counter++;
export const APPROXRATIO = counter++;
export const ARCCOS = counter++;
export const ARCCOSH = counter++;
export const ARCSIN = counter++;
export const ARCSINH = counter++;
export const ARCTAN = counter++;
export const ARCTANH = counter++;
export const ARG = counter++;
export const ATOMIZE = counter++;
export const BESSELJ = counter++;
export const BESSELY = counter++;
export const BINDING = counter++;
export const BINOMIAL = counter++;
export const CEILING = counter++;
export const CHECK = counter++;
export const CHOOSE = counter++;
export const CIRCEXP = counter++;
export const CLEAR = counter++;
export const CLEARALL = counter++;
export const CLEARPATTERNS = counter++;
export const CLOCK = counter++;
export const COEFF = counter++;
export const COFACTOR = counter++;
export const CONDENSE = counter++;
export const CONJ = counter++;
export const CONTRACT = counter++;
export const COS = counter++;
export const COSH = counter++;
export const DECOMP = counter++;
export const DEFINT = counter++;
export const DEGREE = counter++;
export const DENOMINATOR = counter++;
export const DERIVATIVE = counter++;
export const DET = counter++;
export const DIM = counter++;
export const DIRAC = counter++;
export const DIVISORS = counter++;
export const DO = counter++;
export const DOT = counter++;
export const DRAW = counter++;
export const DSOLVE = counter++;
export const EIGEN = counter++;
export const EIGENVAL = counter++;
export const EIGENVEC = counter++;
export const ERF = counter++;
export const ERFC = counter++;
export const EVAL = counter++;
export const EXP = counter++;
export const EXPAND = counter++;
export const EXPCOS = counter++;
export const EXPSIN = counter++;
export const FACTOR = counter++;
export const FACTORIAL = counter++;
export const FACTORPOLY = counter++;
export const FILTER = counter++;
export const FLOATF = counter++;
export const FLOOR = counter++;
export const FOR = counter++;
export const FUNCTION = counter++;
export const GAMMA = counter++;
export const GCD = counter++;
export const HERMITE = counter++;
export const HILBERT = counter++;
export const IMAG = counter++;
export const INDEX = counter++;
export const INNER = counter++;
export const INTEGRAL = counter++;
export const INV = counter++;
export const INVG = counter++;
export const ISINTEGER = counter++;
export const ISPRIME = counter++;
export const LAGUERRE = counter++;
//  LAPLACE = counter++
export const LCM = counter++;
export const LEADING = counter++;
export const LEGENDRE = counter++;
export const LOG = counter++;
export const LOOKUP = counter++;
export const MOD = counter++;
export const MULTIPLY = counter++;
export const NOT = counter++;
export const NROOTS = counter++;
export const NUMBER = counter++;
export const NUMERATOR = counter++;
export const OPERATOR = counter++;
export const OR = counter++;
export const OUTER = counter++;
export const PATTERN = counter++;
export const PATTERNSINFO = counter++;
export const POLAR = counter++;
export const POWER = counter++;
export const PRIME = counter++;
export const PRINT_LEAVE_E_ALONE = counter++;
export const PRINT_LEAVE_X_ALONE = counter++;
export const PRINT = counter++;
export const PRINT2DASCII = counter++;
export const PRINTFULL = counter++;
export const PRINTLATEX = counter++;
export const PRINTLIST = counter++;
export const PRINTPLAIN = counter++;
export const PRODUCT = counter++;
export const QUOTE = counter++;
export const QUOTIENT = counter++;
export const RANK = counter++;
export const RATIONALIZE = counter++;
export const REAL = counter++;
export const ROUND = counter++;
export const YYRECT = counter++;
export const ROOTS = counter++;
export const SETQ = counter++;
export const SGN = counter++;
export const SILENTPATTERN = counter++;
export const SIMPLIFY = counter++;
export const SIN = counter++;
export const SINH = counter++;
export const SHAPE = counter++;
export const SQRT = counter++;
export const STOP = counter++;
export const SUBST = counter++;
export const SUM = counter++;
export const SYMBOLSINFO = counter++;
export const TAN = counter++;
export const TANH = counter++;
export const TAYLOR = counter++;
export const TEST = counter++;
export const TESTEQ = counter++;
export const TESTGE = counter++;
export const TESTGT = counter++;
export const TESTLE = counter++;
export const TESTLT = counter++;
export const TRANSPOSE = counter++;
export const UNIT = counter++;
export const ZERO = counter++;

// ALL THE SYMBOLS ABOVE NIL ARE KEYWORDS,
// WHICH MEANS THAT USER CANNOT REDEFINE THEM
export const NIL = counter++; // nil goes here, after standard functions
export const LAST = counter++;

export const LAST_PRINT = counter++;
export const LAST_2DASCII_PRINT = counter++;
export const LAST_FULL_PRINT = counter++;
export const LAST_LATEX_PRINT = counter++;
export const LAST_LIST_PRINT = counter++;
export const LAST_PLAIN_PRINT = counter++;

export const AUTOEXPAND = counter++;
export const BAKE = counter++;
export const ASSUME_REAL_VARIABLES = counter++;
export const TRACE = counter++;
export const FORCE_FIXED_PRINTOUT = counter++;
export const MAX_FIXED_PRINTOUT_DIGITS = counter++;

export const YYE = counter++;

export const DRAWX = counter++; // special purpose internal symbols
export const METAA = counter++;
export const METAB = counter++;
export const METAX = counter++;
export const SECRETX = counter++;

export const VERSION = counter++;

export const PI = counter++;
export const SYMBOL_A = counter++;
export const SYMBOL_B = counter++;
export const SYMBOL_C = counter++;
export const SYMBOL_D = counter++;
export const SYMBOL_I = counter++;
export const SYMBOL_J = counter++;
export const SYMBOL_N = counter++;
export const SYMBOL_R = counter++;
export const SYMBOL_S = counter++;
export const SYMBOL_T = counter++;
export const SYMBOL_X = counter++;
export const SYMBOL_Y = counter++;
export const SYMBOL_Z = counter++;
export const SYMBOL_IDENTITY_MATRIX = counter++;

export const SYMBOL_A_UNDERSCORE = counter++;
export const SYMBOL_B_UNDERSCORE = counter++;
export const SYMBOL_X_UNDERSCORE = counter++;

export const C1 = counter++;
export const C2 = counter++;
export const C3 = counter++;
export const C4 = counter++;
export const C5 = counter++;
export const C6 = counter++;

const USR_SYMBOLS = counter++; // this must be last

export const E = YYE;

// TOS cannot be arbitrarily large because the OS seg faults on deep recursion.
// For example, a circular evaluation like x=x+1 can cause a seg fault.
// At this setting (100,000) the evaluation stack overruns before seg fault.

export const TOS = 100000;

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

// will contain the variable names
export const symtab: Sym[] = [];
// will contain the contents of the variable
// in the corresponding position in symtab array
export const binding: U[] = [];
export const isSymbolReclaimable: boolean[] = [];

const arglist = []; // will contain U

const draw_stop_return = null; // extern jmp_buf ?????

export const transpose_unicode = 7488;
export const dotprod_unicode = 183;

export function symbol(x: number): Sym {
  return symtab[x];
}

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

export function iskeyword(p: U): boolean {
  return issymbol(p) && symnum(p) < NIL;
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
  moveTos(0);
  defs.esc_flag = false;
  draw_flag = false;
  defs.frame = TOS;
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
