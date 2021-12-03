"use strict";
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
const defs_1 = require("./runtime/defs");
const find_1 = require("./runtime/find");
const init_1 = require("./runtime/init");
const stack_1 = require("./runtime/stack");
const symbol_1 = require("./runtime/symbol");
const zombocom_1 = require("./runtime/zombocom");
const is_1 = require("./sources/is");
const misc_1 = require("./sources/misc");
const scan_1 = require("./sources/scan");
const approxratio_1 = require("./sources/approxratio");
const integral_1 = require("./sources/integral");
const run_1 = require("./runtime/run");
const $ = {};
$.version = defs_1.version;
$.isadd = defs_1.isadd;
$.ismultiply = defs_1.ismultiply;
$.ispower = defs_1.ispower;
$.isfactorial = defs_1.isfactorial;
$.car = defs_1.car;
$.cdr = defs_1.cdr;
$.caar = defs_1.caar;
$.cadr = defs_1.cadr;
$.cdar = defs_1.cdar;
$.cddr = defs_1.cddr;
$.caadr = defs_1.caadr;
$.caddr = defs_1.caddr;
$.cadar = defs_1.cadar;
$.cdadr = defs_1.cdadr;
$.cddar = defs_1.cddar;
$.cdddr = defs_1.cdddr;
$.caaddr = defs_1.caaddr;
$.cadadr = defs_1.cadadr;
$.caddar = defs_1.caddar;
$.cdaddr = defs_1.cdaddr;
$.cadddr = defs_1.cadddr;
$.cddddr = defs_1.cddddr;
$.caddddr = defs_1.caddddr;
$.cadaddr = defs_1.cadaddr;
$.cddaddr = defs_1.cddaddr;
$.caddadr = defs_1.caddadr;
$.cdddaddr = defs_1.cdddaddr;
$.caddaddr = defs_1.caddaddr;
$.symbol = defs_1.symbol;
$.iscons = defs_1.iscons;
$.isrational = defs_1.isrational;
$.isdouble = defs_1.isdouble;
$.isNumericAtom = defs_1.isNumericAtom;
$.isstr = defs_1.isstr;
$.istensor = defs_1.istensor;
$.issymbol = defs_1.issymbol;
$.iskeyword = defs_1.iskeyword;
$.CONS = defs_1.CONS;
$.NUM = defs_1.NUM;
$.DOUBLE = defs_1.DOUBLE;
$.STR = defs_1.STR;
$.TENSOR = defs_1.TENSOR;
$.SYM = defs_1.SYM;
$.approxRadicals = approxratio_1.approxRadicals;
$.approxRationalsOfLogs = approxratio_1.approxRationalsOfLogs;
$.approxAll = approxratio_1.approxAll;
$.testApprox = approxratio_1.testApprox;
$.make_hashed_itab = integral_1.make_hashed_itab;
$.isZeroAtomOrTensor = is_1.isZeroAtomOrTensor;
$.isnegativenumber = is_1.isnegativenumber;
$.isplusone = is_1.isplusone;
$.isminusone = is_1.isminusone;
$.isinteger = is_1.isinteger;
$.isnonnegativeinteger = is_1.isnonnegativeinteger;
$.isposint = is_1.isposint;
$.isnegativeterm = is_1.isnegativeterm;
$.isimaginarynumber = is_1.isimaginarynumber;
$.iscomplexnumber = is_1.iscomplexnumber;
$.iseveninteger = is_1.iseveninteger;
$.isnegative = is_1.isnegative;
$.issymbolic = is_1.issymbolic;
$.isintegerfactor = is_1.isintegerfactor;
$.isoneover = is_1.isoneover;
$.isfraction = is_1.isfraction;
$.isoneoversqrttwo = is_1.isoneoversqrttwo;
$.isminusoneoversqrttwo = is_1.isminusoneoversqrttwo;
$.isfloating = is_1.isfloating;
$.isimaginaryunit = is_1.isimaginaryunit;
$.isquarterturn = is_1.isquarterturn;
$.isnpi = is_1.isnpi;
$.equal = misc_1.equal;
$.length = misc_1.length;
$.scan = scan_1.scan;
$.Find = find_1.Find;
$.dupl = stack_1.dupl;
$.swap = stack_1.swap;
$.restore = stack_1.restore;
$.save = stack_1.save;
$.push = stack_1.push;
$.pop = stack_1.pop;
$.get_binding = symbol_1.get_binding;
$.set_binding = symbol_1.set_binding;
$.usr_symbol = symbol_1.usr_symbol;
$.collectUserSymbols = symbol_1.collectUserSymbols;
$.init = init_1.init;
$.exec = zombocom_1.exec;
$.parse = zombocom_1.parse;
$.run = run_1.run;
const builtin_fns = [
    'abs',
    'add',
    'adj',
    'and',
    'approxratio',
    'arccos',
    'arccosh',
    'arcsin',
    'arcsinh',
    'arctan',
    'arctanh',
    'arg',
    'atomize',
    'besselj',
    'bessely',
    'binding',
    'binomial',
    'ceiling',
    'check',
    'choose',
    'circexp',
    'clear',
    'clearall',
    'clearpatterns',
    'clock',
    'coeff',
    'cofactor',
    'condense',
    'conj',
    'contract',
    'cos',
    'cosh',
    'decomp',
    'defint',
    'deg',
    'denominator',
    'det',
    'derivative',
    'dim',
    'dirac',
    'divisors',
    'do',
    'dot',
    'draw',
    'dsolve',
    'eigen',
    'eigenval',
    'eigenvec',
    'erf',
    'erfc',
    'eval',
    'exp',
    'expand',
    'expcos',
    'expsin',
    'factor',
    'factorial',
    'factorpoly',
    'filter',
    'float',
    'floor',
    'for',
    'Gamma',
    'gcd',
    'hermite',
    'hilbert',
    'imag',
    'component',
    'inner',
    'integral',
    'inv',
    'invg',
    'isinteger',
    'isprime',
    'laguerre',
    'lcm',
    'leading',
    'legendre',
    'log',
    'mod',
    'multiply',
    'not',
    'nroots',
    'number',
    'numerator',
    'operator',
    'or',
    'outer',
    'pattern',
    'patternsinfo',
    'polar',
    'power',
    'prime',
    'print',
    'print2dascii',
    'printcomputer',
    'printlatex',
    'printlist',
    'printhuman',
    'product',
    'quote',
    'quotient',
    'rank',
    'rationalize',
    'real',
    'rect',
    'roots',
    'round',
    'equals',
    'shape',
    'sgn',
    'silentpattern',
    'simplify',
    'sin',
    'sinh',
    'sqrt',
    'stop',
    'subst',
    'sum',
    'symbolsinfo',
    'tan',
    'tanh',
    'taylor',
    'test',
    'testeq',
    'testge',
    'testgt',
    'testle',
    'testlt',
    'transpose',
    'unit',
    'zero',
];
Array.from(builtin_fns).map(fn => ($[fn] = zombocom_1.exec.bind(this, fn)));
exports.default = $;
