"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print_list = exports.print_expr = exports.printline = exports.collectLatexStringFromReturnValue = exports.print_str = exports.Eval_printlist = exports.Eval_printhuman = exports.Eval_printlatex = exports.Eval_printcomputer = exports.Eval_print2dascii = exports.Eval_print = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const misc_1 = require("../sources/misc");
const abs_1 = require("./abs");
const bignum_1 = require("./bignum");
const denominator_1 = require("./denominator");
const eval_1 = require("./eval");
const is_1 = require("./is");
const multiply_1 = require("./multiply");
const numerator_1 = require("./numerator");
const print2d_1 = require("./print2d");
const scan_1 = require("./scan");
const power_str = '^';
// this is only invoked when user invokes
// "print" explicitly
function Eval_print(p1) {
    defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.defs.printMode);
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_print = Eval_print;
// this is only invoked when user invokes
// "print2dascii" explicitly
function Eval_print2dascii(p1) {
    defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_2DASCII);
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_print2dascii = Eval_print2dascii;
// this is only invoked when user invokes
// "printcomputer" explicitly
function Eval_printcomputer(p1) {
    defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_COMPUTER);
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_printcomputer = Eval_printcomputer;
// this is only invoked when user invokes
// "printlatex" explicitly
function Eval_printlatex(p1) {
    defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_LATEX);
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_printlatex = Eval_printlatex;
// this is only invoked when user invokes
// "printhuman" explicitly
function Eval_printhuman(p1) {
    // test flag needs to be suspended
    // because otherwise "printcomputer" mode
    // will happen.
    const original_test_flag = defs_1.defs.test_flag;
    defs_1.defs.test_flag = false;
    defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_HUMAN);
    defs_1.defs.test_flag = original_test_flag;
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_printhuman = Eval_printhuman;
// this is only invoked when user invokes
// "printlist" explicitly
function Eval_printlist(p1) {
    const beenPrinted = _print(defs_1.cdr(p1), defs_1.PRINTMODE_LIST);
    defs_1.defs.stringsEmittedByUserPrintouts += beenPrinted;
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
exports.Eval_printlist = Eval_printlist;
function _print(p, passedPrintMode) {
    let accumulator = '';
    while (defs_1.iscons(p)) {
        const p2 = eval_1.Eval(defs_1.car(p));
        // display single symbol as "symbol = result"
        // but don't display "symbol = symbol"
        /*
        if (issymbol(car(p)) && car(p) != p2)
          p2 = makeList(symbol(SETQ), (car(p)), (p2));
        */
        const origPrintMode = defs_1.defs.printMode;
        if (passedPrintMode === defs_1.PRINTMODE_COMPUTER) {
            defs_1.defs.printMode = defs_1.PRINTMODE_COMPUTER;
            accumulator = printline(p2);
            rememberPrint(accumulator, defs_1.LAST_FULL_PRINT);
        }
        else if (passedPrintMode === defs_1.PRINTMODE_HUMAN) {
            defs_1.defs.printMode = defs_1.PRINTMODE_HUMAN;
            accumulator = printline(p2);
            rememberPrint(accumulator, defs_1.LAST_PLAIN_PRINT);
        }
        else if (passedPrintMode === defs_1.PRINTMODE_2DASCII) {
            defs_1.defs.printMode = defs_1.PRINTMODE_2DASCII;
            accumulator = print2d_1.print2dascii(p2);
            rememberPrint(accumulator, defs_1.LAST_2DASCII_PRINT);
        }
        else if (passedPrintMode === defs_1.PRINTMODE_LATEX) {
            defs_1.defs.printMode = defs_1.PRINTMODE_LATEX;
            accumulator = printline(p2);
            rememberPrint(accumulator, defs_1.LAST_LATEX_PRINT);
        }
        else if (passedPrintMode === defs_1.PRINTMODE_LIST) {
            defs_1.defs.printMode = defs_1.PRINTMODE_LIST;
            accumulator = print_list(p2);
            rememberPrint(accumulator, defs_1.LAST_LIST_PRINT);
        }
        defs_1.defs.printMode = origPrintMode;
        p = defs_1.cdr(p);
    }
    if (defs_1.DEBUG) {
        console.log(`emttedString from display: ${defs_1.defs.stringsEmittedByUserPrintouts}`);
    }
    return accumulator;
}
function rememberPrint(theString, theTypeOfPrint) {
    scan_1.scan('"' + theString + '"');
    const parsedString = stack_1.pop();
    symbol_1.set_binding(defs_1.symbol(theTypeOfPrint), parsedString);
}
function print_str(s) {
    if (defs_1.DEBUG) {
        console.log(`emttedString from print_str: ${defs_1.defs.stringsEmittedByUserPrintouts}`);
    }
    return s;
}
exports.print_str = print_str;
function print_char(c) {
    return c;
}
function collectLatexStringFromReturnValue(p) {
    const origPrintMode = defs_1.defs.printMode;
    defs_1.defs.printMode = defs_1.PRINTMODE_LATEX;
    const originalCodeGen = defs_1.defs.codeGen;
    defs_1.defs.codeGen = false;
    let returnedString = print_expr(p);
    // some variables might contain underscores, escape those
    returnedString = returnedString.replace(/_/g, '\\_');
    defs_1.defs.printMode = origPrintMode;
    defs_1.defs.codeGen = originalCodeGen;
    if (defs_1.DEBUG) {
        console.log(`emttedString from collectLatexStringFromReturnValue: ${defs_1.defs.stringsEmittedByUserPrintouts}`);
    }
    return returnedString;
}
exports.collectLatexStringFromReturnValue = collectLatexStringFromReturnValue;
function printline(p) {
    let accumulator = '';
    accumulator += print_expr(p);
    return accumulator;
}
exports.printline = printline;
function print_base_of_denom(BASE) {
    let accumulator = '';
    if (is_1.isfraction(BASE) ||
        defs_1.isadd(BASE) ||
        defs_1.ismultiply(BASE) ||
        defs_1.ispower(BASE) ||
        misc_1.lessp(BASE, defs_1.Constants.zero)) {
        accumulator += print_char('(');
        accumulator += print_expr(BASE);
        accumulator += print_char(')');
    }
    else {
        accumulator += print_expr(BASE);
    }
    return accumulator;
}
function print_expo_of_denom(EXPO) {
    let accumulator = '';
    if (is_1.isfraction(EXPO) || defs_1.isadd(EXPO) || defs_1.ismultiply(EXPO) || defs_1.ispower(EXPO)) {
        accumulator += print_char('(');
        accumulator += print_expr(EXPO);
        accumulator += print_char(')');
    }
    else {
        accumulator += print_expr(EXPO);
    }
    return accumulator;
}
// prints stuff after the divide symbol "/"
// d is the number of denominators
function print_denom(p, d) {
    let accumulator = '';
    const BASE = defs_1.cadr(p);
    let EXPO = defs_1.caddr(p);
    // i.e. 1 / (2^(1/3))
    // get the cases like BASE^(-1) out of
    // the way, they just become 1/BASE
    if (is_1.isminusone(EXPO)) {
        accumulator += print_base_of_denom(BASE);
        return accumulator;
    }
    if (d === 1) {
        accumulator += print_char('(');
    }
    // prepare the exponent
    // (needs to be negated)
    // before printing it out
    EXPO = multiply_1.negate(EXPO);
    accumulator += print_power(BASE, EXPO);
    if (d === 1) {
        accumulator += print_char(')');
    }
    return accumulator;
}
function print_a_over_b(p) {
    let A, B;
    let accumulator = '';
    let flag = 0;
    // count numerators and denominators
    let n = 0;
    let d = 0;
    let p1 = defs_1.cdr(p);
    let p2 = defs_1.car(p1);
    if (defs_1.isrational(p2)) {
        A = abs_1.absval(bignum_1.mp_numerator(p2));
        B = bignum_1.mp_denominator(p2);
        if (!is_1.isplusone(A)) {
            n++;
        }
        if (!is_1.isplusone(B)) {
            d++;
        }
        p1 = defs_1.cdr(p1);
    }
    else {
        A = defs_1.Constants.one;
        B = defs_1.Constants.one;
    }
    while (defs_1.iscons(p1)) {
        p2 = defs_1.car(p1);
        if (is_denominator(p2)) {
            d++;
        }
        else {
            n++;
        }
        p1 = defs_1.cdr(p1);
    }
    //breakpoint
    if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        accumulator += print_str('\\frac{');
    }
    if (n === 0) {
        accumulator += print_char('1');
    }
    else {
        flag = 0;
        p1 = defs_1.cdr(p);
        if (defs_1.isrational(defs_1.car(p1))) {
            p1 = defs_1.cdr(p1);
        }
        if (!is_1.isplusone(A)) {
            accumulator += print_factor(A);
            flag = 1;
        }
        while (defs_1.iscons(p1)) {
            p2 = defs_1.car(p1);
            if (!is_denominator(p2)) {
                if (flag) {
                    accumulator += print_multiply_sign();
                }
                accumulator += print_factor(p2);
                flag = 1;
            }
            p1 = defs_1.cdr(p1);
        }
    }
    if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        accumulator += print_str('}{');
    }
    else if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
        accumulator += print_str(' / ');
    }
    else {
        accumulator += print_str('/');
    }
    if (d > 1 && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
        accumulator += print_char('(');
    }
    flag = 0;
    p1 = defs_1.cdr(p);
    if (defs_1.isrational(defs_1.car(p1))) {
        p1 = defs_1.cdr(p1);
    }
    if (!is_1.isplusone(B)) {
        accumulator += print_factor(B);
        flag = 1;
    }
    while (defs_1.iscons(p1)) {
        p2 = defs_1.car(p1);
        if (is_denominator(p2)) {
            if (flag) {
                accumulator += print_multiply_sign();
            }
            accumulator += print_denom(p2, d);
            flag = 1;
        }
        p1 = defs_1.cdr(p1);
    }
    if (d > 1 && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
        accumulator += print_char(')');
    }
    if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        accumulator += print_str('}');
    }
    return accumulator;
}
function print_expr(p) {
    let accumulator = '';
    if (defs_1.isadd(p)) {
        p = defs_1.cdr(p);
        if (sign_of_term(defs_1.car(p)) === '-') {
            accumulator += print_str('-');
        }
        accumulator += print_term(defs_1.car(p));
        p = defs_1.cdr(p);
        while (defs_1.iscons(p)) {
            if (sign_of_term(defs_1.car(p)) === '+') {
                if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                    accumulator += print_str(' + ');
                }
                else {
                    accumulator += print_str('+');
                }
            }
            else {
                if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                    accumulator += print_str(' - ');
                }
                else {
                    accumulator += print_str('-');
                }
            }
            accumulator += print_term(defs_1.car(p));
            p = defs_1.cdr(p);
        }
    }
    else {
        if (sign_of_term(p) === '-') {
            accumulator += print_str('-');
        }
        accumulator += print_term(p);
    }
    return accumulator;
}
exports.print_expr = print_expr;
function sign_of_term(p) {
    let accumulator = '';
    if (defs_1.ismultiply(p) &&
        defs_1.isNumericAtom(defs_1.cadr(p)) &&
        misc_1.lessp(defs_1.cadr(p), defs_1.Constants.zero)) {
        accumulator += '-';
    }
    else if (defs_1.isNumericAtom(p) && misc_1.lessp(p, defs_1.Constants.zero)) {
        accumulator += '-';
    }
    else {
        accumulator += '+';
    }
    return accumulator;
}
function print_term(p) {
    let accumulator = '';
    if (defs_1.ismultiply(p) && any_denominators(p)) {
        accumulator += print_a_over_b(p);
        return accumulator;
    }
    if (defs_1.ismultiply(p)) {
        let denom;
        let origAccumulator;
        p = defs_1.cdr(p);
        // coeff -1?
        if (is_1.isminusone(defs_1.car(p))) {
            //      print_char('-')
            p = defs_1.cdr(p);
        }
        let previousFactorWasANumber = false;
        // print the first factor ------------
        if (defs_1.isNumericAtom(defs_1.car(p))) {
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
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX &&
            defs_1.iscons(defs_1.cdr(p)) &&
            is_1.isNumberOneOverSomething(defs_1.car(p))) {
            numberOneOverSomething = true;
            denom = defs_1.car(p).q.b.toString();
        }
        if (numberOneOverSomething) {
            origAccumulator = accumulator;
            accumulator = '';
        }
        else {
            accumulator += print_factor(defs_1.car(p));
        }
        p = defs_1.cdr(p);
        // print all the other factors -------
        while (defs_1.iscons(p)) {
            // check if we end up having a case where two numbers
            // are next to each other. In those cases, latex needs
            // to insert a \cdot otherwise they end up
            // right next to each other and read like one big number
            if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                if (previousFactorWasANumber) {
                    // if what comes next is a power and the base
                    // is a number, then we are in the case
                    // of consecutive numbers.
                    // Note that sqrt() i.e when exponent is 1/2
                    // doesn't count because the radical gives
                    // a nice graphical separation already.
                    if (defs_1.caar(p) === defs_1.symbol(defs_1.POWER)) {
                        if (defs_1.isNumericAtom(defs_1.car(defs_1.cdr(defs_1.car(p))))) {
                            // rule out square root
                            if (!is_1.isfraction(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(p)))))) {
                                accumulator += ' \\cdot ';
                            }
                        }
                    }
                }
            }
            accumulator += print_multiply_sign();
            accumulator += print_factor(defs_1.car(p), false, true);
            previousFactorWasANumber = false;
            if (defs_1.isNumericAtom(defs_1.car(p))) {
                previousFactorWasANumber = true;
            }
            p = defs_1.cdr(p);
        }
        if (numberOneOverSomething) {
            accumulator =
                origAccumulator + '\\frac{' + accumulator + '}{' + denom + '}';
        }
    }
    else {
        accumulator += print_factor(p);
    }
    return accumulator;
}
function print_subexpr(p) {
    let accumulator = '';
    accumulator += print_char('(');
    accumulator += print_expr(p);
    accumulator += print_char(')');
    return accumulator;
}
function print_factorial_function(p) {
    let accumulator = '';
    p = defs_1.cadr(p);
    if (is_1.isfraction(p) ||
        defs_1.isadd(p) ||
        defs_1.ismultiply(p) ||
        defs_1.ispower(p) ||
        defs_1.isfactorial(p)) {
        accumulator += print_subexpr(p);
    }
    else {
        accumulator += print_expr(p);
    }
    accumulator += print_char('!');
    return accumulator;
}
function print_ABS_latex(p) {
    let accumulator = '';
    accumulator += print_str('\\left |');
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str(' \\right |');
    return accumulator;
}
function print_BINOMIAL_latex(p) {
    let accumulator = '';
    accumulator += print_str('\\binom{');
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str('}{');
    accumulator += print_expr(defs_1.caddr(p));
    accumulator += print_str('} ');
    return accumulator;
}
function print_DOT_latex(p) {
    let accumulator = '';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str(' \\cdot ');
    accumulator += print_expr(defs_1.caddr(p));
    return accumulator;
}
function print_DOT_codegen(p) {
    let accumulator = 'dot(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ', ';
    accumulator += print_expr(defs_1.caddr(p));
    accumulator += ')';
    return accumulator;
}
function print_SIN_codegen(p) {
    let accumulator = 'Math.sin(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ')';
    return accumulator;
}
function print_COS_codegen(p) {
    let accumulator = 'Math.cos(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ')';
    return accumulator;
}
function print_TAN_codegen(p) {
    let accumulator = 'Math.tan(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ')';
    return accumulator;
}
function print_ARCSIN_codegen(p) {
    let accumulator = 'Math.asin(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ')';
    return accumulator;
}
function print_ARCCOS_codegen(p) {
    let accumulator = 'Math.acos(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ')';
    return accumulator;
}
function print_ARCTAN_codegen(p) {
    let accumulator = 'Math.atan(';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ')';
    return accumulator;
}
function print_SQRT_latex(p) {
    let accumulator = '';
    accumulator += print_str('\\sqrt{');
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str('} ');
    return accumulator;
}
function print_TRANSPOSE_latex(p) {
    let accumulator = '';
    accumulator += print_str('{');
    if (defs_1.iscons(defs_1.cadr(p))) {
        accumulator += print_str('(');
    }
    accumulator += print_expr(defs_1.cadr(p));
    if (defs_1.iscons(defs_1.cadr(p))) {
        accumulator += print_str(')');
    }
    accumulator += print_str('}');
    accumulator += print_str('^T');
    return accumulator;
}
function print_TRANSPOSE_codegen(p) {
    let accumulator = '';
    accumulator += print_str('transpose(');
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str(')');
    return accumulator;
}
function print_UNIT_codegen(p) {
    let accumulator = '';
    accumulator += print_str('identity(');
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str(')');
    return accumulator;
}
function print_INV_latex(p) {
    let accumulator = '';
    accumulator += print_str('{');
    if (defs_1.iscons(defs_1.cadr(p))) {
        accumulator += print_str('(');
    }
    accumulator += print_expr(defs_1.cadr(p));
    if (defs_1.iscons(defs_1.cadr(p))) {
        accumulator += print_str(')');
    }
    accumulator += print_str('}');
    accumulator += print_str('^{-1}');
    return accumulator;
}
function print_INV_codegen(p) {
    let accumulator = '';
    accumulator += print_str('inv(');
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += print_str(')');
    return accumulator;
}
function print_DEFINT_latex(p) {
    let accumulator = '';
    const functionBody = defs_1.car(defs_1.cdr(p));
    p = defs_1.cdr(p);
    const originalIntegral = p;
    let numberOfIntegrals = 0;
    while (defs_1.iscons(defs_1.cdr(defs_1.cdr(p)))) {
        numberOfIntegrals++;
        const theIntegral = defs_1.cdr(defs_1.cdr(p));
        accumulator += print_str('\\int^{');
        accumulator += print_expr(defs_1.car(defs_1.cdr(theIntegral)));
        accumulator += print_str('}_{');
        accumulator += print_expr(defs_1.car(theIntegral));
        accumulator += print_str('} \\! ');
        p = defs_1.cdr(theIntegral);
    }
    accumulator += print_expr(functionBody);
    accumulator += print_str(' \\,');
    p = originalIntegral;
    for (let i = 1; i <= numberOfIntegrals; i++) {
        const theVariable = defs_1.cdr(p);
        accumulator += print_str(' \\mathrm{d} ');
        accumulator += print_expr(defs_1.car(theVariable));
        if (i < numberOfIntegrals) {
            accumulator += print_str(' \\, ');
        }
        p = defs_1.cdr(defs_1.cdr(theVariable));
    }
    return accumulator;
}
function print_tensor(p) {
    let accumulator = '';
    accumulator += print_tensor_inner(p, 0, 0)[1];
    return accumulator;
}
// j scans the dimensions
// k is an increment for all the printed elements
//   since they are all together in sequence in one array
function print_tensor_inner(p, j, k) {
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
            let retString;
            [k, retString] = Array.from(print_tensor_inner(p, j + 1, k));
            accumulator += retString;
            // add separator between elements dimensions
            // "above" the inner-most dimension
            if (i !== p.tensor.dim[j] - 1) {
                accumulator += print_str(',');
            }
        }
        // if we reached the last dimension, we print the actual
        // elements
    }
    else {
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
function print_tensor_latex(p) {
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
function print_tensor_inner_latex(firstLevel, p, j, k) {
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
            let retString;
            [k, retString] = Array.from(print_tensor_inner_latex(false, p, j + 1, k));
            accumulator += retString;
            if (i !== p.tensor.dim[j] - 1) {
                // add separator between rows
                accumulator += print_str(' \\\\ ');
            }
        }
        // if we reached the last dimension, we print the actual
        // elements
    }
    else {
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
function print_SUM_latex(p) {
    let accumulator = '\\sum_{';
    accumulator += print_expr(defs_1.caddr(p));
    accumulator += '=';
    accumulator += print_expr(defs_1.cadddr(p));
    accumulator += '}^{';
    accumulator += print_expr(defs_1.caddddr(p));
    accumulator += '}{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    return accumulator;
}
function print_SUM_codegen(p) {
    const body = defs_1.cadr(p);
    const variable = defs_1.caddr(p);
    const lowerlimit = defs_1.cadddr(p);
    const upperlimit = defs_1.caddddr(p);
    const accumulator = '(function(){' +
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
function print_TEST_latex(p) {
    let accumulator = '\\left\\{ \\begin{array}{ll}';
    p = defs_1.cdr(p);
    while (defs_1.iscons(p)) {
        // odd number of parameters means that the
        // last argument becomes the default case
        // i.e. the one without a test.
        if (defs_1.cdr(p) === defs_1.symbol(defs_1.NIL)) {
            accumulator += '{';
            accumulator += print_expr(defs_1.car(p));
            accumulator += '} & otherwise ';
            accumulator += ' \\\\\\\\';
            break;
        }
        accumulator += '{';
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += '} & if & ';
        accumulator += print_expr(defs_1.car(p));
        accumulator += ' \\\\\\\\';
        // test unsuccessful, continue to the
        // next pair of test,value
        p = defs_1.cddr(p);
    }
    accumulator = accumulator.substring(0, accumulator.length - 4);
    return (accumulator += '\\end{array} \\right.');
}
function print_TEST_codegen(p) {
    let accumulator = '(function(){';
    p = defs_1.cdr(p);
    let howManyIfs = 0;
    while (defs_1.iscons(p)) {
        // odd number of parameters means that the
        // last argument becomes the default case
        // i.e. the one without a test.
        if (defs_1.cdr(p) === defs_1.symbol(defs_1.NIL)) {
            accumulator += 'else {';
            accumulator += 'return (' + print_expr(defs_1.car(p)) + ');';
            accumulator += '}';
            break;
        }
        if (howManyIfs) {
            accumulator += ' else ';
        }
        accumulator += 'if (' + print_expr(defs_1.car(p)) + '){';
        accumulator += 'return (' + print_expr(defs_1.cadr(p)) + ');';
        accumulator += '}';
        // test unsuccessful, continue to the
        // next pair of test,value
        howManyIfs++;
        p = defs_1.cddr(p);
    }
    accumulator += '})()';
    return accumulator;
}
function print_TESTLT_latex(p) {
    let accumulator = '{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    accumulator += ' < ';
    accumulator += '{';
    accumulator += print_expr(defs_1.caddr(p));
    return (accumulator += '}');
}
function print_TESTLE_latex(p) {
    let accumulator = '{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    accumulator += ' \\leq ';
    accumulator += '{';
    accumulator += print_expr(defs_1.caddr(p));
    return (accumulator += '}');
}
function print_TESTGT_latex(p) {
    let accumulator = '{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    accumulator += ' > ';
    accumulator += '{';
    accumulator += print_expr(defs_1.caddr(p));
    return (accumulator += '}');
}
function print_TESTGE_latex(p) {
    let accumulator = '{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    accumulator += ' \\geq ';
    accumulator += '{';
    accumulator += print_expr(defs_1.caddr(p));
    return (accumulator += '}');
}
function print_TESTEQ_latex(p) {
    let accumulator = '{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    accumulator += ' = ';
    accumulator += '{';
    accumulator += print_expr(defs_1.caddr(p));
    return (accumulator += '}');
}
function print_FOR_codegen(p) {
    const body = defs_1.cadr(p);
    const variable = defs_1.caddr(p);
    const lowerlimit = defs_1.cadddr(p);
    const upperlimit = defs_1.caddddr(p);
    const accumulator = '(function(){' +
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
function print_DO_codegen(p) {
    let accumulator = '';
    p = defs_1.cdr(p);
    while (defs_1.iscons(p)) {
        accumulator += print_expr(defs_1.car(p));
        p = defs_1.cdr(p);
    }
    return accumulator;
}
function print_SETQ_codegen(p) {
    let accumulator = '';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += ' = ';
    accumulator += print_expr(defs_1.caddr(p));
    accumulator += '; ';
    return accumulator;
}
function print_PRODUCT_latex(p) {
    let accumulator = '\\prod_{';
    accumulator += print_expr(defs_1.caddr(p));
    accumulator += '=';
    accumulator += print_expr(defs_1.cadddr(p));
    accumulator += '}^{';
    accumulator += print_expr(defs_1.caddddr(p));
    accumulator += '}{';
    accumulator += print_expr(defs_1.cadr(p));
    accumulator += '}';
    return accumulator;
}
function print_PRODUCT_codegen(p) {
    const body = defs_1.cadr(p);
    const variable = defs_1.caddr(p);
    const lowerlimit = defs_1.cadddr(p);
    const upperlimit = defs_1.caddddr(p);
    const accumulator = '(function(){' +
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
function print_power(base, exponent) {
    let accumulator = '';
    //breakpoint
    if (defs_1.DEBUG) {
        console.log('power base: ' + base + ' ' + ' exponent: ' + exponent);
    }
    // quick check is this is actually a square root.
    if (is_1.isoneovertwo(exponent)) {
        if (is_1.equaln(base, 2)) {
            if (defs_1.defs.codeGen) {
                accumulator += print_str('Math.SQRT2');
                return accumulator;
            }
        }
        else {
            if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str('\\sqrt{');
                accumulator += print_expr(base);
                accumulator += print_str('}');
                return accumulator;
            }
            else if (defs_1.defs.codeGen) {
                accumulator += print_str('Math.sqrt(');
                accumulator += print_expr(base);
                accumulator += print_str(')');
                return accumulator;
            }
        }
    }
    if (is_1.equaln(symbol_1.get_binding(defs_1.symbol(defs_1.PRINT_LEAVE_E_ALONE)), 1) &&
        base === defs_1.symbol(defs_1.E)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_str('Math.exp(');
            accumulator += print_expo_of_denom(exponent);
            accumulator += print_str(')');
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str('e^{');
            accumulator += print_expr(exponent);
            accumulator += print_str('}');
        }
        else {
            accumulator += print_str('exp(');
            accumulator += print_expr(exponent);
            accumulator += print_str(')');
        }
        return accumulator;
    }
    if (defs_1.defs.codeGen) {
        accumulator += print_str('Math.pow(');
        accumulator += print_base_of_denom(base);
        accumulator += print_str(', ');
        accumulator += print_expo_of_denom(exponent);
        accumulator += print_str(')');
        return accumulator;
    }
    if (is_1.equaln(symbol_1.get_binding(defs_1.symbol(defs_1.PRINT_LEAVE_X_ALONE)), 0) ||
        base.printname !== 'x') {
        // if the exponent is negative then
        // we invert the base BUT we don't do
        // that if the base is "e", because for
        // example when trigonometric functions are
        // expressed in terms of exponential functions
        // that would be really confusing, one wants to
        // keep "e" as the base and the negative exponent
        if (base !== defs_1.symbol(defs_1.E)) {
            if (is_1.isminusone(exponent)) {
                if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str('\\frac{1}{');
                }
                else if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                    accumulator += print_str('1 / ');
                }
                else {
                    accumulator += print_str('1/');
                }
                if (defs_1.iscons(base) && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str('(');
                    accumulator += print_expr(base);
                    accumulator += print_str(')');
                }
                else {
                    accumulator += print_expr(base);
                }
                if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str('}');
                }
                return accumulator;
            }
            if (is_1.isnegativeterm(exponent)) {
                if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str('\\frac{1}{');
                }
                else if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                    accumulator += print_str('1 / ');
                }
                else {
                    accumulator += print_str('1/');
                }
                const newExponent = multiply_1.multiply(exponent, defs_1.Constants.negOne);
                if (defs_1.iscons(base) && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str('(');
                    accumulator += print_power(base, newExponent);
                    accumulator += print_str(')');
                }
                else {
                    accumulator += print_power(base, newExponent);
                }
                if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str('}');
                }
                return accumulator;
            }
        }
        if (is_1.isfraction(exponent) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str('\\sqrt');
            const denomExponent = denominator_1.denominator(exponent);
            // we omit the "2" on the radical
            if (!is_1.isplustwo(denomExponent)) {
                accumulator += print_str('[');
                accumulator += print_expr(denomExponent);
                accumulator += print_str(']');
            }
            accumulator += print_str('{');
            exponent = numerator_1.numerator(exponent);
            accumulator += print_power(base, exponent);
            accumulator += print_str('}');
            return accumulator;
        }
    }
    if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX && is_1.isplusone(exponent)) {
        // if we are in latex mode we turn many
        // radicals into a radix sign with a power
        // underneath, and the power is often one
        // (e.g. square root turns into a radical
        // with a power one underneath) so handle
        // this case simply here, just print the base
        accumulator += print_expr(base);
    }
    else {
        // print the base,
        // determining if it needs to be
        // wrapped in parentheses or not
        if (defs_1.isadd(base) || is_1.isnegativenumber(base)) {
            accumulator += print_str('(');
            accumulator += print_expr(base);
            accumulator += print_str(')');
        }
        else if (defs_1.ismultiply(base) || defs_1.ispower(base)) {
            if (defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                accumulator += print_str('(');
            }
            accumulator += print_factor(base, true);
            if (defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                accumulator += print_str(')');
            }
        }
        else if (defs_1.isNumericAtom(base) &&
            (misc_1.lessp(base, defs_1.Constants.zero) || is_1.isfraction(base))) {
            accumulator += print_str('(');
            accumulator += print_factor(base);
            accumulator += print_str(')');
        }
        else {
            accumulator += print_factor(base);
        }
        // print the power symbol
        //breakpoint
        if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
            //print_str(" ^ ")
            accumulator += print_str(power_str);
        }
        else {
            accumulator += print_str('^');
        }
        // print the exponent
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            // in latex mode, one can omit the curly braces
            // wrapping the exponent if the exponent is only
            // one character long
            if (print_expr(exponent).length > 1) {
                accumulator += print_str('{');
                accumulator += print_expr(exponent);
                accumulator += print_str('}');
            }
            else {
                accumulator += print_expr(exponent);
            }
        }
        else if (defs_1.iscons(exponent) ||
            is_1.isfraction(exponent) ||
            (defs_1.isNumericAtom(exponent) && misc_1.lessp(exponent, defs_1.Constants.zero))) {
            accumulator += print_str('(');
            accumulator += print_expr(exponent);
            accumulator += print_str(')');
        }
        else {
            accumulator += print_factor(exponent);
        }
    }
    return accumulator;
}
function print_index_function(p) {
    let accumulator = '';
    p = defs_1.cdr(p);
    if (defs_1.caar(p) === defs_1.symbol(defs_1.ADD) ||
        defs_1.caar(p) === defs_1.symbol(defs_1.MULTIPLY) ||
        defs_1.caar(p) === defs_1.symbol(defs_1.POWER) ||
        defs_1.caar(p) === defs_1.symbol(defs_1.FACTORIAL)) {
        accumulator += print_subexpr(defs_1.car(p));
    }
    else {
        accumulator += print_expr(defs_1.car(p));
    }
    accumulator += print_str('[');
    p = defs_1.cdr(p);
    if (defs_1.iscons(p)) {
        accumulator += print_expr(defs_1.car(p));
        p = defs_1.cdr(p);
        while (defs_1.iscons(p)) {
            accumulator += print_str(',');
            accumulator += print_expr(defs_1.car(p));
            p = defs_1.cdr(p);
        }
    }
    accumulator += print_str(']');
    return accumulator;
}
function print_factor(p, omitParens = false, pastFirstFactor = false) {
    // breakpoint
    let accumulator = '';
    if (defs_1.isNumericAtom(p)) {
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
        if (pastFirstFactor && misc_1.lessp(p, defs_1.Constants.zero)) {
            accumulator += '(';
        }
        accumulator += bignum_1.print_number(p, pastFirstFactor);
        if (pastFirstFactor && misc_1.lessp(p, defs_1.Constants.zero)) {
            accumulator += ')';
        }
        return accumulator;
    }
    if (defs_1.isstr(p)) {
        accumulator += print_str('"');
        accumulator += print_str(p.str);
        accumulator += print_str('"');
        return accumulator;
    }
    if (defs_1.istensor(p)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_tensor_latex(p);
        }
        else {
            accumulator += print_tensor(p);
        }
        return accumulator;
    }
    if (defs_1.ismultiply(p)) {
        if (!omitParens) {
            if (sign_of_term(p) === '-' || defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str(' \\left (');
                }
                else {
                    accumulator += print_str('(');
                }
            }
        }
        accumulator += print_expr(p);
        if (!omitParens) {
            if (sign_of_term(p) === '-' || defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                    accumulator += print_str(' \\right ) ');
                }
                else {
                    accumulator += print_str(')');
                }
            }
        }
        return accumulator;
    }
    else if (defs_1.isadd(p)) {
        if (!omitParens) {
            accumulator += print_str('(');
        }
        accumulator += print_expr(p);
        if (!omitParens) {
            accumulator += print_str(')');
        }
        return accumulator;
    }
    if (defs_1.ispower(p)) {
        const base = defs_1.cadr(p);
        const exponent = defs_1.caddr(p);
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
    if (defs_1.car(p) === defs_1.symbol(defs_1.FUNCTION)) {
        const fbody = defs_1.cadr(p);
        if (!defs_1.defs.codeGen) {
            const parameters = defs_1.caddr(p);
            accumulator += print_str('function ');
            if (defs_1.DEBUG) {
                console.log(`emittedString from print_factor ${defs_1.defs.stringsEmittedByUserPrintouts}`);
            }
            const returned = print_list(parameters);
            accumulator += returned;
            accumulator += print_str(' -> ');
        }
        accumulator += print_expr(fbody);
        return accumulator;
    }
    if (defs_1.car(p) === defs_1.symbol(defs_1.PATTERN)) {
        accumulator += print_expr(defs_1.caadr(p));
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str(' \\rightarrow ');
        }
        else {
            if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                accumulator += print_str(' -> ');
            }
            else {
                accumulator += print_str('->');
            }
        }
        accumulator += print_expr(defs_1.car(defs_1.cdr(defs_1.cadr(p))));
        return accumulator;
    }
    if (defs_1.car(p) === defs_1.symbol(defs_1.INDEX) && defs_1.issymbol(defs_1.cadr(p))) {
        accumulator += print_index_function(p);
        return accumulator;
    }
    if (defs_1.isfactorial(p)) {
        accumulator += print_factorial_function(p);
        return accumulator;
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.ABS) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        accumulator += print_ABS_latex(p);
        return accumulator;
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.SQRT) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        //breakpoint
        accumulator += print_SQRT_latex(p);
        return accumulator;
    }
    else if (defs_1.isfactorial(p)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TRANSPOSE_latex(p);
            return accumulator;
        }
        else if (defs_1.defs.codeGen) {
            accumulator += print_TRANSPOSE_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.UNIT)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_UNIT_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.isinv(p)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_INV_latex(p);
            return accumulator;
        }
        else if (defs_1.defs.codeGen) {
            accumulator += print_INV_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.BINOMIAL) &&
        defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        accumulator += print_BINOMIAL_latex(p);
        return accumulator;
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.DEFINT) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        accumulator += print_DEFINT_latex(p);
        return accumulator;
    }
    else if (defs_1.isinnerordot(p)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_DOT_latex(p);
            return accumulator;
        }
        else if (defs_1.defs.codeGen) {
            accumulator += print_DOT_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.SIN)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_SIN_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.COS)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_COS_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TAN)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_TAN_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.ARCSIN)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_ARCSIN_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.ARCCOS)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_ARCCOS_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.ARCTAN)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_ARCTAN_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.SUM)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_SUM_latex(p);
            return accumulator;
        }
        else if (defs_1.defs.codeGen) {
            accumulator += print_SUM_codegen(p);
            return accumulator;
        }
        //else if car(p) == symbol(QUOTE)
        //  if printMode == PRINTMODE_LATEX
        //    print_expr(cadr(p))
        //    return accumulator
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.PRODUCT)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_PRODUCT_latex(p);
            return accumulator;
        }
        else if (defs_1.defs.codeGen) {
            accumulator += print_PRODUCT_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.FOR)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_FOR_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.DO)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_DO_codegen(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TEST)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_TEST_codegen(p);
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TEST_latex(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTLT)) {
        if (defs_1.defs.codeGen) {
            accumulator +=
                '((' + print_expr(defs_1.cadr(p)) + ') < (' + print_expr(defs_1.caddr(p)) + '))';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTLT_latex(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTLE)) {
        if (defs_1.defs.codeGen) {
            accumulator +=
                '((' + print_expr(defs_1.cadr(p)) + ') <= (' + print_expr(defs_1.caddr(p)) + '))';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTLE_latex(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTGT)) {
        if (defs_1.defs.codeGen) {
            accumulator +=
                '((' + print_expr(defs_1.cadr(p)) + ') > (' + print_expr(defs_1.caddr(p)) + '))';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTGT_latex(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTGE)) {
        if (defs_1.defs.codeGen) {
            accumulator +=
                '((' + print_expr(defs_1.cadr(p)) + ') >= (' + print_expr(defs_1.caddr(p)) + '))';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTGE_latex(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTEQ)) {
        if (defs_1.defs.codeGen) {
            accumulator +=
                '((' + print_expr(defs_1.cadr(p)) + ') === (' + print_expr(defs_1.caddr(p)) + '))';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTEQ_latex(p);
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.FLOOR)) {
        if (defs_1.defs.codeGen) {
            accumulator += 'Math.floor(' + print_expr(defs_1.cadr(p)) + ')';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += ' \\lfloor {' + print_expr(defs_1.cadr(p)) + '} \\rfloor ';
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.CEILING)) {
        if (defs_1.defs.codeGen) {
            accumulator += 'Math.ceiling(' + print_expr(defs_1.cadr(p)) + ')';
            return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += ' \\lceil {' + print_expr(defs_1.cadr(p)) + '} \\rceil ';
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.ROUND)) {
        if (defs_1.defs.codeGen) {
            accumulator += 'Math.round(' + print_expr(defs_1.cadr(p)) + ')';
            return accumulator;
        }
    }
    else if (defs_1.car(p) === defs_1.symbol(defs_1.SETQ)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_SETQ_codegen(p);
            return accumulator;
        }
        else {
            accumulator += print_expr(defs_1.cadr(p));
            accumulator += print_str('=');
            accumulator += print_expr(defs_1.caddr(p));
            return accumulator;
        }
    }
    if (defs_1.iscons(p)) {
        //if (car(p) == symbol(FORMAL) && cadr(p)->k == SYM) {
        //  print_str(((struct symbol *) cadr(p))->name)
        //  return
        //}
        accumulator += print_factor(defs_1.car(p));
        p = defs_1.cdr(p);
        if (!omitParens) {
            accumulator += print_str('(');
        }
        if (defs_1.iscons(p)) {
            accumulator += print_expr(defs_1.car(p));
            p = defs_1.cdr(p);
            while (defs_1.iscons(p)) {
                accumulator += print_str(',');
                accumulator += print_expr(defs_1.car(p));
                p = defs_1.cdr(p);
            }
        }
        if (!omitParens) {
            accumulator += print_str(')');
        }
        return accumulator;
    }
    if (p === defs_1.symbol(defs_1.DERIVATIVE)) {
        accumulator += print_char('d');
    }
    else if (p === defs_1.symbol(defs_1.E)) {
        if (defs_1.defs.codeGen) {
            accumulator += print_str('Math.E');
        }
        else {
            accumulator += print_str('e');
        }
    }
    else if (p === defs_1.symbol(defs_1.PI)) {
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str('\\pi');
        }
        else {
            accumulator += print_str('pi');
        }
    }
    else {
        accumulator += print_str(symbol_1.get_printname(p));
    }
    return accumulator;
}
function print_list(p) {
    let accumulator = '';
    switch (p.k) {
        case defs_1.CONS:
            accumulator += '(';
            accumulator += print_list(defs_1.car(p));
            if (p === defs_1.cdr(p)) {
                console.log('oh no recursive!');
                defs_1.breakpoint;
            }
            p = defs_1.cdr(p);
            while (defs_1.iscons(p)) {
                accumulator += ' ';
                accumulator += print_list(defs_1.car(p));
                p = defs_1.cdr(p);
                if (p === defs_1.cdr(p) && p !== defs_1.symbol(defs_1.NIL)) {
                    console.log('oh no recursive!');
                    defs_1.breakpoint;
                }
            }
            if (p !== defs_1.symbol(defs_1.NIL)) {
                accumulator += ' . ';
                accumulator += print_list(p);
            }
            accumulator += ')';
            break;
        case defs_1.STR:
            //print_str("\"")
            accumulator += p.str;
            break;
        //print_str("\"")
        case defs_1.NUM:
        case defs_1.DOUBLE:
            accumulator += bignum_1.print_number(p, true);
            break;
        case defs_1.SYM:
            accumulator += symbol_1.get_printname(p);
            break;
        default:
            accumulator += '<tensor>';
    }
    return accumulator;
}
exports.print_list = print_list;
function print_multiply_sign() {
    let accumulator = '';
    if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
        return accumulator;
    }
    if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag && !defs_1.defs.codeGen) {
        accumulator += print_str(' ');
    }
    else {
        accumulator += print_str('*');
    }
    return accumulator;
}
function is_denominator(p) {
    return defs_1.ispower(p) && defs_1.cadr(p) !== defs_1.symbol(defs_1.E) && is_1.isnegativeterm(defs_1.caddr(p));
}
// don't consider the leading fraction
// we want 2/3*a*b*c instead of 2*a*b*c/3
function any_denominators(p) {
    p = defs_1.cdr(p);
    //  if (isfraction(car(p)))
    //    return 1
    while (defs_1.iscons(p)) {
        const q = defs_1.car(p);
        if (is_denominator(q)) {
            return true;
        }
        p = defs_1.cdr(p);
    }
    return false;
}
