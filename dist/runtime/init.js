"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defn = exports.init = void 0;
const defs_1 = require("./defs");
const stack_1 = require("./stack");
const bignum_1 = require("../sources/bignum");
const eval_1 = require("../sources/eval");
const list_1 = require("../sources/list");
const print_1 = require("../sources/print");
const scan_1 = require("../sources/scan");
const defs_2 = require("./defs");
const symbol_1 = require("./symbol");
let init_flag = 0;
function init() {
    init_flag = 0;
    defs_2.reset_after_error();
    defs_2.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated = [];
    if (init_flag) {
        return; // already initted
    }
    init_flag = 1;
    // total clearout of symbol table
    for (let i = 0; i < defs_2.NSYM; i++) {
        defs_2.symtab[i] = new defs_2.Sym('');
        defs_2.binding[i] = defs_2.symtab[i];
        defs_2.isSymbolReclaimable[i] = false;
    }
    const [p1, p6] = defn();
}
exports.init = init;
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
    'version="' + defs_1.version + '"',
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
function defn() {
    const p1 = defs_2.symbol(defs_2.NIL);
    const p6 = defs_2.symbol(defs_2.NIL);
    symbol_1.std_symbol('abs', defs_2.ABS);
    symbol_1.std_symbol('add', defs_2.ADD);
    symbol_1.std_symbol('adj', defs_2.ADJ);
    symbol_1.std_symbol('and', defs_2.AND);
    symbol_1.std_symbol('approxratio', defs_2.APPROXRATIO);
    symbol_1.std_symbol('arccos', defs_2.ARCCOS);
    symbol_1.std_symbol('arccosh', defs_2.ARCCOSH);
    symbol_1.std_symbol('arcsin', defs_2.ARCSIN);
    symbol_1.std_symbol('arcsinh', defs_2.ARCSINH);
    symbol_1.std_symbol('arctan', defs_2.ARCTAN);
    symbol_1.std_symbol('arctanh', defs_2.ARCTANH);
    symbol_1.std_symbol('arg', defs_2.ARG);
    symbol_1.std_symbol('atomize', defs_2.ATOMIZE);
    symbol_1.std_symbol('besselj', defs_2.BESSELJ);
    symbol_1.std_symbol('bessely', defs_2.BESSELY);
    symbol_1.std_symbol('binding', defs_2.BINDING);
    symbol_1.std_symbol('binomial', defs_2.BINOMIAL);
    symbol_1.std_symbol('ceiling', defs_2.CEILING);
    symbol_1.std_symbol('check', defs_2.CHECK);
    symbol_1.std_symbol('choose', defs_2.CHOOSE);
    symbol_1.std_symbol('circexp', defs_2.CIRCEXP);
    symbol_1.std_symbol('clear', defs_2.CLEAR);
    symbol_1.std_symbol('clearall', defs_2.CLEARALL);
    symbol_1.std_symbol('clearpatterns', defs_2.CLEARPATTERNS);
    symbol_1.std_symbol('clock', defs_2.CLOCK);
    symbol_1.std_symbol('coeff', defs_2.COEFF);
    symbol_1.std_symbol('cofactor', defs_2.COFACTOR);
    symbol_1.std_symbol('condense', defs_2.CONDENSE);
    symbol_1.std_symbol('conj', defs_2.CONJ);
    symbol_1.std_symbol('contract', defs_2.CONTRACT);
    symbol_1.std_symbol('cos', defs_2.COS);
    symbol_1.std_symbol('cosh', defs_2.COSH);
    symbol_1.std_symbol('decomp', defs_2.DECOMP);
    symbol_1.std_symbol('defint', defs_2.DEFINT);
    symbol_1.std_symbol('deg', defs_2.DEGREE);
    symbol_1.std_symbol('denominator', defs_2.DENOMINATOR);
    symbol_1.std_symbol('det', defs_2.DET);
    symbol_1.std_symbol('derivative', defs_2.DERIVATIVE);
    symbol_1.std_symbol('dim', defs_2.DIM);
    symbol_1.std_symbol('dirac', defs_2.DIRAC);
    symbol_1.std_symbol('divisors', defs_2.DIVISORS);
    symbol_1.std_symbol('do', defs_2.DO);
    symbol_1.std_symbol('dot', defs_2.DOT);
    symbol_1.std_symbol('draw', defs_2.DRAW);
    symbol_1.std_symbol('dsolve', defs_2.DSOLVE);
    symbol_1.std_symbol('erf', defs_2.ERF);
    symbol_1.std_symbol('erfc', defs_2.ERFC);
    symbol_1.std_symbol('eigen', defs_2.EIGEN);
    symbol_1.std_symbol('eigenval', defs_2.EIGENVAL);
    symbol_1.std_symbol('eigenvec', defs_2.EIGENVEC);
    symbol_1.std_symbol('eval', defs_2.EVAL);
    symbol_1.std_symbol('exp', defs_2.EXP);
    symbol_1.std_symbol('expand', defs_2.EXPAND);
    symbol_1.std_symbol('expcos', defs_2.EXPCOS);
    symbol_1.std_symbol('expsin', defs_2.EXPSIN);
    symbol_1.std_symbol('factor', defs_2.FACTOR);
    symbol_1.std_symbol('factorial', defs_2.FACTORIAL);
    symbol_1.std_symbol('factorpoly', defs_2.FACTORPOLY);
    symbol_1.std_symbol('filter', defs_2.FILTER);
    symbol_1.std_symbol('float', defs_2.FLOATF);
    symbol_1.std_symbol('floor', defs_2.FLOOR);
    symbol_1.std_symbol('for', defs_2.FOR);
    symbol_1.std_symbol('function', defs_2.FUNCTION);
    symbol_1.std_symbol('Gamma', defs_2.GAMMA);
    symbol_1.std_symbol('gcd', defs_2.GCD);
    symbol_1.std_symbol('hermite', defs_2.HERMITE);
    symbol_1.std_symbol('hilbert', defs_2.HILBERT);
    symbol_1.std_symbol('imag', defs_2.IMAG);
    symbol_1.std_symbol('component', defs_2.INDEX);
    symbol_1.std_symbol('inner', defs_2.INNER);
    symbol_1.std_symbol('integral', defs_2.INTEGRAL);
    symbol_1.std_symbol('inv', defs_2.INV);
    symbol_1.std_symbol('invg', defs_2.INVG);
    symbol_1.std_symbol('isinteger', defs_2.ISINTEGER);
    symbol_1.std_symbol('isprime', defs_2.ISPRIME);
    symbol_1.std_symbol('laguerre', defs_2.LAGUERRE);
    //  std_symbol("laplace", LAPLACE)
    symbol_1.std_symbol('lcm', defs_2.LCM);
    symbol_1.std_symbol('leading', defs_2.LEADING);
    symbol_1.std_symbol('legendre', defs_2.LEGENDRE);
    symbol_1.std_symbol('log', defs_2.LOG);
    symbol_1.std_symbol('lookup', defs_2.LOOKUP);
    symbol_1.std_symbol('mod', defs_2.MOD);
    symbol_1.std_symbol('multiply', defs_2.MULTIPLY);
    symbol_1.std_symbol('not', defs_2.NOT);
    symbol_1.std_symbol('nroots', defs_2.NROOTS);
    symbol_1.std_symbol('number', defs_2.NUMBER);
    symbol_1.std_symbol('numerator', defs_2.NUMERATOR);
    symbol_1.std_symbol('operator', defs_2.OPERATOR);
    symbol_1.std_symbol('or', defs_2.OR);
    symbol_1.std_symbol('outer', defs_2.OUTER);
    symbol_1.std_symbol('pattern', defs_2.PATTERN);
    symbol_1.std_symbol('patternsinfo', defs_2.PATTERNSINFO);
    symbol_1.std_symbol('polar', defs_2.POLAR);
    symbol_1.std_symbol('power', defs_2.POWER);
    symbol_1.std_symbol('prime', defs_2.PRIME);
    symbol_1.std_symbol('print', defs_2.PRINT);
    symbol_1.std_symbol('print2dascii', defs_2.PRINT2DASCII);
    symbol_1.std_symbol('printcomputer', defs_2.PRINTFULL);
    symbol_1.std_symbol('printlatex', defs_2.PRINTLATEX);
    symbol_1.std_symbol('printlist', defs_2.PRINTLIST);
    symbol_1.std_symbol('printhuman', defs_2.PRINTPLAIN);
    symbol_1.std_symbol('printLeaveEAlone', defs_2.PRINT_LEAVE_E_ALONE);
    symbol_1.std_symbol('printLeaveXAlone', defs_2.PRINT_LEAVE_X_ALONE);
    symbol_1.std_symbol('product', defs_2.PRODUCT);
    symbol_1.std_symbol('quote', defs_2.QUOTE);
    symbol_1.std_symbol('quotient', defs_2.QUOTIENT);
    symbol_1.std_symbol('rank', defs_2.RANK);
    symbol_1.std_symbol('rationalize', defs_2.RATIONALIZE);
    symbol_1.std_symbol('real', defs_2.REAL);
    symbol_1.std_symbol('rect', defs_2.YYRECT);
    symbol_1.std_symbol('roots', defs_2.ROOTS);
    symbol_1.std_symbol('round', defs_2.ROUND);
    symbol_1.std_symbol('equals', defs_2.SETQ);
    symbol_1.std_symbol('sgn', defs_2.SGN);
    symbol_1.std_symbol('silentpattern', defs_2.SILENTPATTERN);
    symbol_1.std_symbol('simplify', defs_2.SIMPLIFY);
    symbol_1.std_symbol('sin', defs_2.SIN);
    symbol_1.std_symbol('sinh', defs_2.SINH);
    symbol_1.std_symbol('shape', defs_2.SHAPE);
    symbol_1.std_symbol('sqrt', defs_2.SQRT);
    symbol_1.std_symbol('stop', defs_2.STOP);
    symbol_1.std_symbol('subst', defs_2.SUBST);
    symbol_1.std_symbol('sum', defs_2.SUM);
    symbol_1.std_symbol('symbolsinfo', defs_2.SYMBOLSINFO);
    symbol_1.std_symbol('tan', defs_2.TAN);
    symbol_1.std_symbol('tanh', defs_2.TANH);
    symbol_1.std_symbol('taylor', defs_2.TAYLOR);
    symbol_1.std_symbol('test', defs_2.TEST);
    symbol_1.std_symbol('testeq', defs_2.TESTEQ);
    symbol_1.std_symbol('testge', defs_2.TESTGE);
    symbol_1.std_symbol('testgt', defs_2.TESTGT);
    symbol_1.std_symbol('testle', defs_2.TESTLE);
    symbol_1.std_symbol('testlt', defs_2.TESTLT);
    symbol_1.std_symbol('transpose', defs_2.TRANSPOSE);
    symbol_1.std_symbol('unit', defs_2.UNIT);
    symbol_1.std_symbol('zero', defs_2.ZERO);
    symbol_1.std_symbol('nil', defs_2.NIL);
    symbol_1.std_symbol('autoexpand', defs_2.AUTOEXPAND);
    symbol_1.std_symbol('bake', defs_2.BAKE);
    symbol_1.std_symbol('assumeRealVariables', defs_2.ASSUME_REAL_VARIABLES);
    symbol_1.std_symbol('last', defs_2.LAST);
    symbol_1.std_symbol('lastprint', defs_2.LAST_PRINT);
    symbol_1.std_symbol('last2dasciiprint', defs_2.LAST_2DASCII_PRINT);
    symbol_1.std_symbol('lastfullprint', defs_2.LAST_FULL_PRINT);
    symbol_1.std_symbol('lastlatexprint', defs_2.LAST_LATEX_PRINT);
    symbol_1.std_symbol('lastlistprint', defs_2.LAST_LIST_PRINT);
    symbol_1.std_symbol('lastplainprint', defs_2.LAST_PLAIN_PRINT);
    symbol_1.std_symbol('trace', defs_2.TRACE);
    symbol_1.std_symbol('forceFixedPrintout', defs_2.FORCE_FIXED_PRINTOUT);
    symbol_1.std_symbol('maxFixedPrintoutDigits', defs_2.MAX_FIXED_PRINTOUT_DIGITS);
    symbol_1.std_symbol('~', defs_2.YYE); // tilde so sort puts it after other symbols
    symbol_1.std_symbol('$DRAWX', defs_2.DRAWX); // special purpose internal symbols
    symbol_1.std_symbol('$METAA', defs_2.METAA);
    symbol_1.std_symbol('$METAB', defs_2.METAB);
    symbol_1.std_symbol('$METAX', defs_2.METAX);
    symbol_1.std_symbol('$SECRETX', defs_2.SECRETX);
    symbol_1.std_symbol('version', defs_2.VERSION);
    symbol_1.std_symbol('pi', defs_2.PI);
    symbol_1.std_symbol('a', defs_2.SYMBOL_A);
    symbol_1.std_symbol('b', defs_2.SYMBOL_B);
    symbol_1.std_symbol('c', defs_2.SYMBOL_C);
    symbol_1.std_symbol('d', defs_2.SYMBOL_D);
    symbol_1.std_symbol('i', defs_2.SYMBOL_I);
    symbol_1.std_symbol('j', defs_2.SYMBOL_J);
    symbol_1.std_symbol('n', defs_2.SYMBOL_N);
    symbol_1.std_symbol('r', defs_2.SYMBOL_R);
    symbol_1.std_symbol('s', defs_2.SYMBOL_S);
    symbol_1.std_symbol('t', defs_2.SYMBOL_T);
    symbol_1.std_symbol('x', defs_2.SYMBOL_X);
    symbol_1.std_symbol('y', defs_2.SYMBOL_Y);
    symbol_1.std_symbol('z', defs_2.SYMBOL_Z);
    symbol_1.std_symbol('I', defs_2.SYMBOL_IDENTITY_MATRIX);
    symbol_1.std_symbol('a_', defs_2.SYMBOL_A_UNDERSCORE);
    symbol_1.std_symbol('b_', defs_2.SYMBOL_B_UNDERSCORE);
    symbol_1.std_symbol('x_', defs_2.SYMBOL_X_UNDERSCORE);
    symbol_1.std_symbol('$C1', defs_2.C1);
    symbol_1.std_symbol('$C2', defs_2.C2);
    symbol_1.std_symbol('$C3', defs_2.C3);
    symbol_1.std_symbol('$C4', defs_2.C4);
    symbol_1.std_symbol('$C5', defs_2.C5);
    symbol_1.std_symbol('$C6', defs_2.C6);
    defineSomeHandyConstants();
    // don't add all these functions to the
    // symbolsDependencies, clone the original
    const originalCodeGen = defs_2.defs.codeGen;
    defs_2.defs.codeGen = false;
    for (let defn_i = 0; defn_i < defn_str.length; defn_i++) {
        const definitionOfInterest = defn_str[defn_i];
        scan_1.scan(definitionOfInterest);
        if (defs_2.DEBUG) {
            console.log(`... evaling ${definitionOfInterest}`);
            console.log('top of stack:');
            console.log(print_1.print_list(stack_1.top()));
        }
        eval_1.Eval(stack_1.pop());
    }
    // restore the symbol dependencies as they were before.
    defs_2.defs.codeGen = originalCodeGen;
    return [p1, p6];
}
exports.defn = defn;
function defineSomeHandyConstants() {
    // i is the square root of -1 i.e. -1 ^ 1/2
    const imaginaryunit = list_1.makeList(defs_2.symbol(defs_2.POWER), bignum_1.integer(-1), bignum_1.rational(1, 2));
    if (defs_2.DEBUG) {
        console.log(print_1.print_list(imaginaryunit));
    }
    defs_2.Constants.imaginaryunit = imaginaryunit; // must be untagged in gc
}
