/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import {
  caadr,
  caar,
  cadadr,
  caddddr,
  cadddr,
  caddr,
  cadr,
  car,
  cdadr,
  cdar,
  cdddr,
  cddr,
  cdr,
  CONS,
  DOUBLE,
  isadd,
  iscons,
  isdouble,
  isfactorial,
  iskeyword,
  ismultiply,
  isNumericAtom,
  ispower,
  isrational,
  isstr,
  issymbol,
  istensor,
  NUM,
  STR,
  SYM,
  symbol,
  TENSOR,
  version,
  cadar,
  cddar,
  caaddr,
  caddar,
  cdaddr,
  cddddr,
  cadaddr,
  cddaddr,
  caddadr,
  cdddaddr,
  caddaddr,
  defs,
} from './runtime/defs';
import { Find } from './runtime/find';
import { init } from './runtime/init';
import { pop, push, restore, save, swap, dupl } from './runtime/stack';
import {
  collectUserSymbols,
  get_binding,
  set_binding,
  usr_symbol,
} from './runtime/symbol';
import { exec, parse } from './runtime/zombocom';
import {
  iscomplexnumber,
  iseveninteger,
  isfloating,
  isfraction,
  isimaginaryunit,
  isinteger,
  isminusone,
  isminusoneoversqrttwo,
  isnegative,
  isnegativenumber,
  isnegativeterm,
  isnonnegativeinteger,
  isnpi,
  isoneoversqrttwo,
  isplusone,
  isposint,
  isquarterturn,
  isZeroAtomOrTensor,
  isimaginarynumber,
  issymbolic,
  isintegerfactor,
  isoneover,
} from './sources/is';
import { equal, length } from './sources/misc';
import { scan } from './sources/scan';
import {
  approxRadicals,
  approxRationalsOfLogs,
  approxAll,
  testApprox,
} from './sources/approxratio';
import { make_hashed_itab } from './sources/integral';
import { run } from './runtime/run';

export const $: { [key: string]: unknown } = {};
$.version = version;
$.isadd = isadd;
$.ismultiply = ismultiply;
$.ispower = ispower;
$.isfactorial = isfactorial;
$.car = car;
$.cdr = cdr;
$.caar = caar;
$.cadr = cadr;
$.cdar = cdar;
$.cddr = cddr;
$.caadr = caadr;
$.caddr = caddr;
$.cadar = cadar;
$.cdadr = cdadr;
$.cddar = cddar;
$.cdddr = cdddr;
$.caaddr = caaddr;
$.cadadr = cadadr;
$.caddar = caddar;
$.cdaddr = cdaddr;
$.cadddr = cadddr;
$.cddddr = cddddr;
$.caddddr = caddddr;
$.cadaddr = cadaddr;
$.cddaddr = cddaddr;
$.caddadr = caddadr;
$.cdddaddr = cdddaddr;
$.caddaddr = caddaddr;
$.symbol = symbol;
$.iscons = iscons;
$.isrational = isrational;
$.isdouble = isdouble;
$.isNumericAtom = isNumericAtom;
$.isstr = isstr;
$.istensor = istensor;
$.issymbol = issymbol;
$.iskeyword = iskeyword;
$.CONS = CONS;
$.NUM = NUM;
$.DOUBLE = DOUBLE;
$.STR = STR;
$.TENSOR = TENSOR;
$.SYM = SYM;
$.approxRadicals = approxRadicals;
$.approxRationalsOfLogs = approxRationalsOfLogs;
$.approxAll = approxAll;
$.testApprox = testApprox;
$.make_hashed_itab = make_hashed_itab;
$.isZeroAtomOrTensor = isZeroAtomOrTensor;
$.isnegativenumber = isnegativenumber;
$.isplusone = isplusone;
$.isminusone = isminusone;
$.isinteger = isinteger;
$.isnonnegativeinteger = isnonnegativeinteger;
$.isposint = isposint;
$.isnegativeterm = isnegativeterm;
$.isimaginarynumber = isimaginarynumber;
$.iscomplexnumber = iscomplexnumber;
$.iseveninteger = iseveninteger;
$.isnegative = isnegative;
$.issymbolic = issymbolic;
$.isintegerfactor = isintegerfactor;
$.isoneover = isoneover;
$.isfraction = isfraction;
$.isoneoversqrttwo = isoneoversqrttwo;
$.isminusoneoversqrttwo = isminusoneoversqrttwo;
$.isfloating = isfloating;
$.isimaginaryunit = isimaginaryunit;
$.isquarterturn = isquarterturn;
$.isnpi = isnpi;
$.equal = equal;
$.length = length;
$.scan = scan;
$.Find = Find;
$.dupl = dupl;
$.swap = swap;
$.restore = restore;
$.save = save;
$.push = push;
$.pop = pop;
$.get_binding = get_binding;
$.set_binding = set_binding;
$.usr_symbol = usr_symbol;
$.collectUserSymbols = collectUserSymbols;
$.init = init;
$.exec = exec;
$.parse = parse;
$.run = run;

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

Array.from(builtin_fns).map(fn => ($[fn] = exec.bind(this, fn)));
defs.fullDoubleOutput = true;
(globalThis as any).Algebrite = $;

