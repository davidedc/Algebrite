"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalFloats = exports.evalPolar = exports.doexpand = exports.noexpand = exports.Constants = exports.$ = exports.reset_after_error = exports.MEQUAL = exports.MZERO = exports.MSIGN = exports.isidentitymatrix = exports.isinv = exports.istranspose = exports.isinnerordot = exports.isfactorial = exports.ispower = exports.ismultiply = exports.isadd = exports.caddaddr = exports.cdddaddr = exports.caddadr = exports.cddaddr = exports.cadaddr = exports.caddddr = exports.cddddr = exports.cadddr = exports.cdaddr = exports.caddar = exports.cadadr = exports.caaddr = exports.cdddr = exports.cddar = exports.cdadr = exports.cadar = exports.caddr = exports.caadr = exports.cddr = exports.cdar = exports.cadr = exports.caar = exports.cdr = exports.car = exports.iskeyword = exports.issymbol = exports.isNumericAtomOrTensor = exports.istensor = exports.isstr = exports.isNumericAtom = exports.isdouble = exports.isrational = exports.iscons = exports.symbol = exports.dotprod_unicode = exports.transpose_unicode = exports.isSymbolReclaimable = exports.binding = exports.symtab = exports.logbuf = exports.mtotal = exports.primetab = exports.parse_time_simplifications = exports.predefinedSymbolsInGlobalScope_doNotTrackInDependencies = exports.MAXDIM = exports.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE = exports.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES = exports.MAXPRIMETAB = exports.TOS = exports.E = exports.C6 = exports.C5 = exports.C4 = exports.C3 = exports.C2 = exports.C1 = exports.SYMBOL_X_UNDERSCORE = exports.SYMBOL_B_UNDERSCORE = exports.SYMBOL_A_UNDERSCORE = exports.SYMBOL_IDENTITY_MATRIX = exports.SYMBOL_Z = exports.SYMBOL_Y = exports.SYMBOL_X = exports.SYMBOL_T = exports.SYMBOL_S = exports.SYMBOL_R = exports.SYMBOL_N = exports.SYMBOL_J = exports.SYMBOL_I = exports.SYMBOL_D = exports.SYMBOL_C = exports.SYMBOL_B = exports.SYMBOL_A = exports.PI = exports.VERSION = exports.SECRETX = exports.METAX = exports.METAB = exports.METAA = exports.DRAWX = exports.YYE = exports.MAX_FIXED_PRINTOUT_DIGITS = exports.FORCE_FIXED_PRINTOUT = exports.TRACE = exports.ASSUME_REAL_VARIABLES = exports.BAKE = exports.AUTOEXPAND = exports.LAST_PLAIN_PRINT = exports.LAST_LIST_PRINT = exports.LAST_LATEX_PRINT = exports.LAST_FULL_PRINT = exports.LAST_2DASCII_PRINT = exports.LAST_PRINT = exports.LAST = exports.NIL = exports.ZERO = exports.UNIT = exports.TRANSPOSE = exports.TESTLT = exports.TESTLE = exports.TESTGT = exports.TESTGE = exports.TESTEQ = exports.TEST = exports.TAYLOR = exports.TANH = exports.TAN = exports.SYMBOLSINFO = exports.SUM = exports.SUBST = exports.STOP = exports.SQRT = exports.SHAPE = exports.SINH = exports.SIN = exports.SIMPLIFY = exports.SILENTPATTERN = exports.SGN = exports.SETQ = exports.ROOTS = exports.YYRECT = exports.ROUND = exports.REAL = exports.RATIONALIZE = exports.RANK = exports.QUOTIENT = exports.QUOTE = exports.PRODUCT = exports.PRINTPLAIN = exports.PRINTLIST = exports.PRINTLATEX = exports.PRINTFULL = exports.PRINT2DASCII = exports.PRINT = exports.PRINT_LEAVE_X_ALONE = exports.PRINT_LEAVE_E_ALONE = exports.PRIME = exports.POWER = exports.POLAR = exports.PATTERNSINFO = exports.PATTERN = exports.OUTER = exports.OR = exports.OPERATOR = exports.NUMERATOR = exports.NUMBER = exports.NROOTS = exports.NOT = exports.MULTIPLY = exports.MOD = exports.LOOKUP = exports.LOG = exports.LEGENDRE = exports.LEADING = exports.LCM = exports.LAGUERRE = exports.ISPRIME = exports.ISINTEGER = exports.INVG = exports.INV = exports.INTEGRAL = exports.INNER = exports.INDEX = exports.IMAG = exports.HILBERT = exports.HERMITE = exports.GCD = exports.GAMMA = exports.FUNCTION = exports.FOR = exports.FLOOR = exports.FLOATF = exports.FILTER = exports.FACTORPOLY = exports.FACTORIAL = exports.FACTOR = exports.EXPSIN = exports.EXPCOS = exports.EXPAND = exports.EXP = exports.EVAL = exports.ERFC = exports.ERF = exports.EIGENVEC = exports.EIGENVAL = exports.EIGEN = exports.DSOLVE = exports.DRAW = exports.DOT = exports.DO = exports.DIVISORS = exports.DIRAC = exports.DIM = exports.DET = exports.DERIVATIVE = exports.DENOMINATOR = exports.DEGREE = exports.DEFINT = exports.DECOMP = exports.COSH = exports.COS = exports.CONTRACT = exports.CONJ = exports.CONDENSE = exports.COFACTOR = exports.COEFF = exports.CLOCK = exports.CLEARPATTERNS = exports.CLEARALL = exports.CLEAR = exports.CIRCEXP = exports.CHOOSE = exports.CHECK = exports.CEILING = exports.BINOMIAL = exports.BINDING = exports.BESSELY = exports.BESSELJ = exports.ATOMIZE = exports.ARG = exports.ARCTANH = exports.ARCTAN = exports.ARCSINH = exports.ARCSIN = exports.ARCCOSH = exports.ARCCOS = exports.APPROXRATIO = exports.AND = exports.ADJ = exports.ADD = exports.ABS = exports.SYM = exports.TENSOR = exports.STR = exports.DOUBLE = exports.NUM = exports.CONS = exports.Sym = exports.Tensor = exports.Str = exports.Double = exports.Num = exports.Cons = exports.BaseAtom = exports.avoidCalculatingPowersIntoArctans = exports.do_simplify_nested_radicals = exports.dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication = exports.defs = exports.PRINTMODE_LIST = exports.PRINTMODE_HUMAN = exports.PRINTMODE_COMPUTER = exports.PRINTMODE_2DASCII = exports.PRINTMODE_LATEX = exports.PRINTOUTRESULT = exports.DEBUG = exports.NSYM = exports.version = exports.breakpoint = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const stack_1 = require("./stack");
const print_1 = require("../sources/print");
const symbol_1 = require("./symbol");
function breakpoint() { }
exports.breakpoint = breakpoint;
// also change the version in the package.json file
exports.version = '1.3.1';
const SELFTEST = 1;
// size of the symbol table
exports.NSYM = 1000;
exports.DEBUG = false;
exports.PRINTOUTRESULT = false;
// printing-related constants
exports.PRINTMODE_LATEX = 'PRINTMODE_LATEX';
exports.PRINTMODE_2DASCII = 'PRINTMODE_2DASCII';
exports.PRINTMODE_COMPUTER = 'PRINTMODE_COMPUTER';
exports.PRINTMODE_HUMAN = 'PRINTMODE_HUMAN';
exports.PRINTMODE_LIST = 'PRINTMODE_LIST';
class Defs {
    constructor() {
        // when the user uses the generic "print" statement
        // this setting kicks-in.
        this.printMode = exports.PRINTMODE_COMPUTER;
        this.recursionLevelNestedRadicalsRemoval = 0;
        this.errorMessage = '';
        // needed for the mechanism to
        // find all dependencies between variables
        // in a script
        this.symbolsDependencies = {};
        this.symbolsHavingReassignments = [];
        this.symbolsInExpressionsWithoutAssignments = [];
        this.patternHasBeenFound = false;
        this.inited = false;
        this.chainOfUserSymbolsNotFunctionsBeingEvaluated = [];
        this.stringsEmittedByUserPrintouts = '';
        // flag use to potentially switch on/off some quirks "deep"
        // in the code due to call from Algebra block.
        // Currently not used.
        this.called_from_Algebra_block = false;
        // top of stack
        this.tos = 0;
        this.expanding = false;
        this.evaluatingAsFloats = false;
        this.evaluatingPolar = false;
        this.esc_flag = false;
        this.trigmode = 0;
        // will contain *U
        this.stack = [];
        this.frame = 0;
        this.out_count = 0;
        this.test_flag = false;
        this.codeGen = false;
        this.userSimplificationsInListForm = [];
        this.userSimplificationsInStringForm = [];
        this.fullDoubleOutput = false;
    }
}
exports.defs = new Defs();
exports.dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication = true;
exports.do_simplify_nested_radicals = true;
exports.avoidCalculatingPowersIntoArctans = true;
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
class BaseAtom {
    toString() {
        return print_1.print_expr(this);
    }
    toLatexString() {
        return print_1.collectLatexStringFromReturnValue(this);
    }
}
exports.BaseAtom = BaseAtom;
class Cons extends BaseAtom {
    constructor(car, cdr) {
        super();
        this.k = exports.CONS;
        this.cons = { car, cdr };
    }
    *[Symbol.iterator]() {
        let u = this;
        while (iscons(u)) {
            yield car(u);
            u = cdr(u);
        }
    }
    // Return everything except the first item in the list
    tail() {
        if (iscons(this.cons.cdr)) {
            return [...this.cons.cdr];
        }
        return [];
    }
    map(f) {
        const a = car(this);
        let b = cdr(this);
        if (iscons(b)) {
            b = b.map(f);
        }
        return new Cons(f(a), b);
    }
}
exports.Cons = Cons;
class Num extends BaseAtom {
    constructor(a, b = big_integer_1.default.one) {
        super();
        this.a = a;
        this.b = b;
        this.q = this;
        this.k = exports.NUM;
    }
}
exports.Num = Num;
class Double extends BaseAtom {
    constructor(d) {
        super();
        this.d = d;
        this.k = exports.DOUBLE;
    }
}
exports.Double = Double;
class Str extends BaseAtom {
    constructor(str) {
        super();
        this.str = str;
        this.k = exports.STR;
    }
}
exports.Str = Str;
class Tensor extends BaseAtom {
    constructor() {
        super(...arguments);
        this.tensor = this;
        this.k = exports.TENSOR;
        this.ndim = 0; // number of dimensions
        this.dim = []; // dimension length, for each dimension
        this.elem = []; // an array containing all the data
    }
    get nelem() {
        return this.elem.length;
    }
}
exports.Tensor = Tensor;
class Sym extends BaseAtom {
    constructor(printname) {
        super();
        this.printname = printname;
        this.k = exports.SYM;
    }
}
exports.Sym = Sym;
// the following enum is for struct U, member k
exports.CONS = 0;
exports.NUM = 1;
exports.DOUBLE = 2;
exports.STR = 3;
exports.TENSOR = 4;
exports.SYM = 5;
// the following enum is for indexing the symbol table
// standard functions first, then nil, then everything else
let counter = 0;
exports.ABS = counter++;
exports.ADD = counter++;
exports.ADJ = counter++;
exports.AND = counter++;
exports.APPROXRATIO = counter++;
exports.ARCCOS = counter++;
exports.ARCCOSH = counter++;
exports.ARCSIN = counter++;
exports.ARCSINH = counter++;
exports.ARCTAN = counter++;
exports.ARCTANH = counter++;
exports.ARG = counter++;
exports.ATOMIZE = counter++;
exports.BESSELJ = counter++;
exports.BESSELY = counter++;
exports.BINDING = counter++;
exports.BINOMIAL = counter++;
exports.CEILING = counter++;
exports.CHECK = counter++;
exports.CHOOSE = counter++;
exports.CIRCEXP = counter++;
exports.CLEAR = counter++;
exports.CLEARALL = counter++;
exports.CLEARPATTERNS = counter++;
exports.CLOCK = counter++;
exports.COEFF = counter++;
exports.COFACTOR = counter++;
exports.CONDENSE = counter++;
exports.CONJ = counter++;
exports.CONTRACT = counter++;
exports.COS = counter++;
exports.COSH = counter++;
exports.DECOMP = counter++;
exports.DEFINT = counter++;
exports.DEGREE = counter++;
exports.DENOMINATOR = counter++;
exports.DERIVATIVE = counter++;
exports.DET = counter++;
exports.DIM = counter++;
exports.DIRAC = counter++;
exports.DIVISORS = counter++;
exports.DO = counter++;
exports.DOT = counter++;
exports.DRAW = counter++;
exports.DSOLVE = counter++;
exports.EIGEN = counter++;
exports.EIGENVAL = counter++;
exports.EIGENVEC = counter++;
exports.ERF = counter++;
exports.ERFC = counter++;
exports.EVAL = counter++;
exports.EXP = counter++;
exports.EXPAND = counter++;
exports.EXPCOS = counter++;
exports.EXPSIN = counter++;
exports.FACTOR = counter++;
exports.FACTORIAL = counter++;
exports.FACTORPOLY = counter++;
exports.FILTER = counter++;
exports.FLOATF = counter++;
exports.FLOOR = counter++;
exports.FOR = counter++;
exports.FUNCTION = counter++;
exports.GAMMA = counter++;
exports.GCD = counter++;
exports.HERMITE = counter++;
exports.HILBERT = counter++;
exports.IMAG = counter++;
exports.INDEX = counter++;
exports.INNER = counter++;
exports.INTEGRAL = counter++;
exports.INV = counter++;
exports.INVG = counter++;
exports.ISINTEGER = counter++;
exports.ISPRIME = counter++;
exports.LAGUERRE = counter++;
//  LAPLACE = counter++
exports.LCM = counter++;
exports.LEADING = counter++;
exports.LEGENDRE = counter++;
exports.LOG = counter++;
exports.LOOKUP = counter++;
exports.MOD = counter++;
exports.MULTIPLY = counter++;
exports.NOT = counter++;
exports.NROOTS = counter++;
exports.NUMBER = counter++;
exports.NUMERATOR = counter++;
exports.OPERATOR = counter++;
exports.OR = counter++;
exports.OUTER = counter++;
exports.PATTERN = counter++;
exports.PATTERNSINFO = counter++;
exports.POLAR = counter++;
exports.POWER = counter++;
exports.PRIME = counter++;
exports.PRINT_LEAVE_E_ALONE = counter++;
exports.PRINT_LEAVE_X_ALONE = counter++;
exports.PRINT = counter++;
exports.PRINT2DASCII = counter++;
exports.PRINTFULL = counter++;
exports.PRINTLATEX = counter++;
exports.PRINTLIST = counter++;
exports.PRINTPLAIN = counter++;
exports.PRODUCT = counter++;
exports.QUOTE = counter++;
exports.QUOTIENT = counter++;
exports.RANK = counter++;
exports.RATIONALIZE = counter++;
exports.REAL = counter++;
exports.ROUND = counter++;
exports.YYRECT = counter++;
exports.ROOTS = counter++;
exports.SETQ = counter++;
exports.SGN = counter++;
exports.SILENTPATTERN = counter++;
exports.SIMPLIFY = counter++;
exports.SIN = counter++;
exports.SINH = counter++;
exports.SHAPE = counter++;
exports.SQRT = counter++;
exports.STOP = counter++;
exports.SUBST = counter++;
exports.SUM = counter++;
exports.SYMBOLSINFO = counter++;
exports.TAN = counter++;
exports.TANH = counter++;
exports.TAYLOR = counter++;
exports.TEST = counter++;
exports.TESTEQ = counter++;
exports.TESTGE = counter++;
exports.TESTGT = counter++;
exports.TESTLE = counter++;
exports.TESTLT = counter++;
exports.TRANSPOSE = counter++;
exports.UNIT = counter++;
exports.ZERO = counter++;
// ALL THE SYMBOLS ABOVE NIL ARE KEYWORDS,
// WHICH MEANS THAT USER CANNOT REDEFINE THEM
exports.NIL = counter++; // nil goes here, after standard functions
exports.LAST = counter++;
exports.LAST_PRINT = counter++;
exports.LAST_2DASCII_PRINT = counter++;
exports.LAST_FULL_PRINT = counter++;
exports.LAST_LATEX_PRINT = counter++;
exports.LAST_LIST_PRINT = counter++;
exports.LAST_PLAIN_PRINT = counter++;
exports.AUTOEXPAND = counter++;
exports.BAKE = counter++;
exports.ASSUME_REAL_VARIABLES = counter++;
exports.TRACE = counter++;
exports.FORCE_FIXED_PRINTOUT = counter++;
exports.MAX_FIXED_PRINTOUT_DIGITS = counter++;
exports.YYE = counter++;
exports.DRAWX = counter++; // special purpose internal symbols
exports.METAA = counter++;
exports.METAB = counter++;
exports.METAX = counter++;
exports.SECRETX = counter++;
exports.VERSION = counter++;
exports.PI = counter++;
exports.SYMBOL_A = counter++;
exports.SYMBOL_B = counter++;
exports.SYMBOL_C = counter++;
exports.SYMBOL_D = counter++;
exports.SYMBOL_I = counter++;
exports.SYMBOL_J = counter++;
exports.SYMBOL_N = counter++;
exports.SYMBOL_R = counter++;
exports.SYMBOL_S = counter++;
exports.SYMBOL_T = counter++;
exports.SYMBOL_X = counter++;
exports.SYMBOL_Y = counter++;
exports.SYMBOL_Z = counter++;
exports.SYMBOL_IDENTITY_MATRIX = counter++;
exports.SYMBOL_A_UNDERSCORE = counter++;
exports.SYMBOL_B_UNDERSCORE = counter++;
exports.SYMBOL_X_UNDERSCORE = counter++;
exports.C1 = counter++;
exports.C2 = counter++;
exports.C3 = counter++;
exports.C4 = counter++;
exports.C5 = counter++;
exports.C6 = counter++;
const USR_SYMBOLS = counter++; // this must be last
exports.E = exports.YYE;
// TOS cannot be arbitrarily large because the OS seg faults on deep recursion.
// For example, a circular evaluation like x=x+1 can cause a seg fault.
// At this setting (100,000) the evaluation stack overruns before seg fault.
exports.TOS = 100000;
exports.MAXPRIMETAB = 10000;
exports.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES = 5;
exports.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE = 10;
//define _USE_MATH_DEFINES // for MS C++
exports.MAXDIM = 24;
exports.predefinedSymbolsInGlobalScope_doNotTrackInDependencies = [
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
exports.parse_time_simplifications = true;
exports.primetab = (function () {
    const primes = [2];
    let i = 3;
    while (primes.length < exports.MAXPRIMETAB) {
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
    primes[exports.MAXPRIMETAB] = 0;
    return primes;
})();
let draw_flag = false;
exports.mtotal = 0;
exports.logbuf = '';
// will contain the variable names
exports.symtab = [];
// will contain the contents of the variable
// in the corresponding position in symtab array
exports.binding = [];
exports.isSymbolReclaimable = [];
const arglist = []; // will contain U
const draw_stop_return = null; // extern jmp_buf ?????
exports.transpose_unicode = 7488;
exports.dotprod_unicode = 183;
function symbol(x) {
    return exports.symtab[x];
}
exports.symbol = symbol;
function iscons(p) {
    return p.k === exports.CONS;
}
exports.iscons = iscons;
function isrational(p) {
    return p.k === exports.NUM;
}
exports.isrational = isrational;
function isdouble(p) {
    return p.k === exports.DOUBLE;
}
exports.isdouble = isdouble;
function isNumericAtom(p) {
    return isrational(p) || isdouble(p);
}
exports.isNumericAtom = isNumericAtom;
function isstr(p) {
    return p.k === exports.STR;
}
exports.isstr = isstr;
function istensor(p) {
    return p.k === exports.TENSOR;
}
exports.istensor = istensor;
// because of recursion, we consider a scalar to be
// a tensor, so a numeric scalar will return true
function isNumericAtomOrTensor(p) {
    if (isNumericAtom(p) || p === symbol(exports.SYMBOL_IDENTITY_MATRIX)) {
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
exports.isNumericAtomOrTensor = isNumericAtomOrTensor;
function issymbol(p) {
    return p.k === exports.SYM;
}
exports.issymbol = issymbol;
function iskeyword(p) {
    return issymbol(p) && symbol_1.symnum(p) < exports.NIL;
}
exports.iskeyword = iskeyword;
function car(p) {
    if (iscons(p)) {
        return p.cons.car;
    }
    else {
        return symbol(exports.NIL);
    }
}
exports.car = car;
function cdr(p) {
    if (iscons(p)) {
        return p.cons.cdr;
    }
    else {
        return symbol(exports.NIL);
    }
}
exports.cdr = cdr;
function caar(p) {
    return car(car(p));
}
exports.caar = caar;
function cadr(p) {
    return car(cdr(p));
}
exports.cadr = cadr;
function cdar(p) {
    return cdr(car(p));
}
exports.cdar = cdar;
function cddr(p) {
    return cdr(cdr(p));
}
exports.cddr = cddr;
function caadr(p) {
    return car(car(cdr(p)));
}
exports.caadr = caadr;
function caddr(p) {
    return car(cdr(cdr(p)));
}
exports.caddr = caddr;
function cadar(p) {
    return car(cdr(car(p)));
}
exports.cadar = cadar;
function cdadr(p) {
    return cdr(car(cdr(p)));
}
exports.cdadr = cdadr;
function cddar(p) {
    return cdr(cdr(car(p)));
}
exports.cddar = cddar;
function cdddr(p) {
    return cdr(cdr(cdr(p)));
}
exports.cdddr = cdddr;
function caaddr(p) {
    return car(car(cdr(cdr(p))));
}
exports.caaddr = caaddr;
function cadadr(p) {
    return car(cdr(car(cdr(p))));
}
exports.cadadr = cadadr;
function caddar(p) {
    return car(cdr(cdr(car(p))));
}
exports.caddar = caddar;
function cdaddr(p) {
    return cdr(car(cdr(cdr(p))));
}
exports.cdaddr = cdaddr;
function cadddr(p) {
    return car(cdr(cdr(cdr(p))));
}
exports.cadddr = cadddr;
function cddddr(p) {
    return cdr(cdr(cdr(cdr(p))));
}
exports.cddddr = cddddr;
function caddddr(p) {
    return car(cdr(cdr(cdr(cdr(p)))));
}
exports.caddddr = caddddr;
function cadaddr(p) {
    return car(cdr(car(cdr(cdr(p)))));
}
exports.cadaddr = cadaddr;
function cddaddr(p) {
    return cdr(cdr(car(cdr(cdr(p)))));
}
exports.cddaddr = cddaddr;
function caddadr(p) {
    return car(cdr(cdr(car(cdr(p)))));
}
exports.caddadr = caddadr;
function cdddaddr(p) {
    return cdr(cdr(cdr(car(cdr(cdr(p))))));
}
exports.cdddaddr = cdddaddr;
function caddaddr(p) {
    return car(cdr(cdr(car(cdr(cdr(p))))));
}
exports.caddaddr = caddaddr;
function isadd(p) {
    return car(p) === symbol(exports.ADD);
}
exports.isadd = isadd;
function ismultiply(p) {
    return car(p) === symbol(exports.MULTIPLY);
}
exports.ismultiply = ismultiply;
function ispower(p) {
    return car(p) === symbol(exports.POWER);
}
exports.ispower = ispower;
function isfactorial(p) {
    return car(p) === symbol(exports.FACTORIAL);
}
exports.isfactorial = isfactorial;
function isinnerordot(p) {
    return car(p) === symbol(exports.INNER) || car(p) === symbol(exports.DOT);
}
exports.isinnerordot = isinnerordot;
function istranspose(p) {
    return car(p) === symbol(exports.TRANSPOSE);
}
exports.istranspose = istranspose;
function isinv(p) {
    return car(p) === symbol(exports.INV);
}
exports.isinv = isinv;
// TODO this is a bit of a shallow check, we should
// check when we are passed an actual tensor and possibly
// cache the test result.
function isidentitymatrix(p) {
    return p === symbol(exports.SYMBOL_IDENTITY_MATRIX);
}
exports.isidentitymatrix = isidentitymatrix;
function MSIGN(p) {
    if (p.isPositive()) {
        return 1;
    }
    else if (p.isZero()) {
        return 0;
    }
    else {
        return -1;
    }
}
exports.MSIGN = MSIGN;
function MLENGTH(p) {
    return p.toString().length;
}
function MZERO(p) {
    return p.isZero();
}
exports.MZERO = MZERO;
function MEQUAL(p, n) {
    if (p == null) {
        breakpoint;
    }
    return p.equals(n);
}
exports.MEQUAL = MEQUAL;
function reset_after_error() {
    stack_1.moveTos(0);
    exports.defs.esc_flag = false;
    draw_flag = false;
    exports.defs.frame = exports.TOS;
    exports.defs.evaluatingAsFloats = false;
    exports.defs.evaluatingPolar = false;
}
exports.reset_after_error = reset_after_error;
exports.$ = {};
class Constants {
    static One() {
        return exports.defs.evaluatingAsFloats ? Constants.oneAsDouble : Constants.one;
    }
    static NegOne() {
        return exports.defs.evaluatingAsFloats
            ? Constants.negOneAsDouble
            : Constants.negOne;
    }
    static Zero() {
        return exports.defs.evaluatingAsFloats ? Constants.zeroAsDouble : Constants.zero;
    }
    static Pi() {
        return exports.defs.evaluatingAsFloats ? Constants.piAsDouble : symbol(exports.PI);
    }
}
exports.Constants = Constants;
Constants.one = new Num(big_integer_1.default(1));
Constants.oneAsDouble = new Double(1.0);
Constants.negOne = new Num(big_integer_1.default(-1));
Constants.negOneAsDouble = new Double(-1.0);
Constants.zero = new Num(big_integer_1.default(0));
Constants.zeroAsDouble = new Double(0.0);
Constants.piAsDouble = new Double(Math.PI);
// Call a function temporarily setting "expanding" to false
function noexpand(func, ...args) {
    const prev_expanding = exports.defs.expanding;
    exports.defs.expanding = false;
    try {
        return func(...args);
    }
    finally {
        exports.defs.expanding = prev_expanding;
    }
}
exports.noexpand = noexpand;
// Call a function temporarily setting "expanding" to true
function doexpand(func, ...args) {
    const prev_expanding = exports.defs.expanding;
    exports.defs.expanding = true;
    try {
        return func(...args);
    }
    finally {
        exports.defs.expanding = prev_expanding;
    }
}
exports.doexpand = doexpand;
// Call a function temporarily setting "evaluatingPolar" to true
function evalPolar(func, ...args) {
    const prev_evaluatingPolar = exports.defs.evaluatingPolar;
    exports.defs.evaluatingPolar = true;
    try {
        return func(...args);
    }
    finally {
        exports.defs.evaluatingPolar = prev_evaluatingPolar;
    }
}
exports.evalPolar = evalPolar;
// Call a function temporarily setting "evaluatingAsFloats" to true
function evalFloats(func, ...args) {
    const prev_evaluatingAsFloats = exports.defs.evaluatingAsFloats;
    exports.defs.evaluatingAsFloats = true;
    try {
        return func(...args);
    }
    finally {
        exports.defs.evaluatingAsFloats = prev_evaluatingAsFloats;
    }
}
exports.evalFloats = evalFloats;
