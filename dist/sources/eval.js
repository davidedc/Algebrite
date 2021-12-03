"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_predicate = exports.Eval = exports.evaluate_integer = void 0;
const _1 = require(".");
const alloc_1 = require("../runtime/alloc");
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const misc_1 = require("../sources/misc");
const abs_1 = require("./abs");
const add_1 = require("./add");
const adj_1 = require("./adj");
const approxratio_1 = require("./approxratio");
const arccos_1 = require("./arccos");
const arccosh_1 = require("./arccosh");
const arcsin_1 = require("./arcsin");
const arcsinh_1 = require("./arcsinh");
const arctan_1 = require("./arctan");
const arctanh_1 = require("./arctanh");
const arg_1 = require("./arg");
const besselj_1 = require("./besselj");
const bessely_1 = require("./bessely");
const bignum_1 = require("./bignum");
const binomial_1 = require("./binomial");
const ceiling_1 = require("./ceiling");
const choose_1 = require("./choose");
const circexp_1 = require("./circexp");
const clear_1 = require("./clear");
const clock_1 = require("./clock");
const coeff_1 = require("./coeff");
const cofactor_1 = require("./cofactor");
const condense_1 = require("./condense");
const conj_1 = require("./conj");
const contract_1 = require("./contract");
const cos_1 = require("./cos");
const cosh_1 = require("./cosh");
const decomp_1 = require("./decomp");
const define_1 = require("./define");
const defint_1 = require("./defint");
const degree_1 = require("./degree");
const denominator_1 = require("./denominator");
const derivative_1 = require("./derivative");
const det_1 = require("./det");
const dirac_1 = require("./dirac");
const divisors_1 = require("./divisors");
const eigen_1 = require("./eigen");
const erf_1 = require("./erf");
const erfc_1 = require("./erfc");
const expand_1 = require("./expand");
const expcos_1 = require("./expcos");
const expsin_1 = require("./expsin");
const factor_1 = require("./factor");
const factorial_1 = require("./factorial");
const factorpoly_1 = require("./factorpoly");
const filter_1 = require("./filter");
const float_1 = require("./float");
const floor_1 = require("./floor");
const for_1 = require("./for");
const gamma_1 = require("./gamma");
const gcd_1 = require("./gcd");
const hermite_1 = require("./hermite");
const hilbert_1 = require("./hilbert");
const imag_1 = require("./imag");
const inner_1 = require("./inner");
const integral_1 = require("./integral");
const inv_1 = require("./inv");
const is_1 = require("./is");
const isprime_1 = require("./isprime");
const laguerre_1 = require("./laguerre");
const lcm_1 = require("./lcm");
const leading_1 = require("./leading");
const legendre_1 = require("./legendre");
const list_1 = require("./list");
const log_1 = require("./log");
const lookup_1 = require("./lookup");
const mod_1 = require("./mod");
const multiply_1 = require("./multiply");
const nroots_1 = require("./nroots");
const numerator_1 = require("./numerator");
const outer_1 = require("./outer");
const pattern_1 = require("./pattern");
const polar_1 = require("./polar");
const power_1 = require("./power");
const prime_1 = require("./prime");
const print_1 = require("./print");
const product_1 = require("./product");
const quotient_1 = require("./quotient");
const rationalize_1 = require("./rationalize");
const real_1 = require("./real");
const rect_1 = require("./rect");
const roots_1 = require("./roots");
const round_1 = require("./round");
const sgn_1 = require("./sgn");
const shape_1 = require("./shape");
const simplify_1 = require("./simplify");
const sin_1 = require("./sin");
const sinh_1 = require("./sinh");
const subst_1 = require("./subst");
const sum_1 = require("./sum");
const tan_1 = require("./tan");
const tanh_1 = require("./tanh");
const taylor_1 = require("./taylor");
const tensor_1 = require("./tensor");
const test_1 = require("./test");
const transpose_1 = require("./transpose");
const userfunc_1 = require("./userfunc");
const zero_1 = require("./zero");
function evaluate_integer(p) {
    return bignum_1.nativeInt(Eval(p));
}
exports.evaluate_integer = evaluate_integer;
// Evaluate an expression, for example...
//
//  push(p1)
//  Eval()
//  p2 = pop()
function Eval(p1) {
    let willEvaluateAsFloats;
    run_1.check_esc_flag();
    if (p1 == null) {
        defs_1.breakpoint;
    }
    if (!defs_1.defs.evaluatingAsFloats && is_1.isfloating(p1)) {
        willEvaluateAsFloats = true;
        defs_1.defs.evaluatingAsFloats = true;
    }
    let result;
    switch (p1.k) {
        case defs_1.CONS:
            Eval_cons(p1);
            result = stack_1.pop();
            break;
        case defs_1.NUM:
            result = defs_1.defs.evaluatingAsFloats
                ? bignum_1.double(bignum_1.convert_rational_to_double(p1))
                : p1;
            break;
        case defs_1.DOUBLE:
        case defs_1.STR:
            result = p1;
            break;
        case defs_1.TENSOR:
            tensor_1.Eval_tensor(p1);
            result = stack_1.pop();
            break;
        case defs_1.SYM:
            Eval_sym(p1);
            result = stack_1.pop();
            break;
        default:
            run_1.stop('atom?');
    }
    if (willEvaluateAsFloats) {
        defs_1.defs.evaluatingAsFloats = false;
    }
    return result;
}
exports.Eval = Eval;
function Eval_sym(p1) {
    // note that function calls are not processed here
    // because, since they have an argument (at least an empty one)
    // they are actually CONs, which is a branch of the
    // switch before the one that calls this function
    // bare keyword?
    // If it's a keyword, then we don't look
    // at the binding array, because keywords
    // are not redefinable.
    if (defs_1.iskeyword(p1)) {
        stack_1.push(Eval(list_1.makeList(p1, defs_1.symbol(defs_1.LAST))));
        return;
    }
    else if (p1 === defs_1.symbol(defs_1.PI) && defs_1.defs.evaluatingAsFloats) {
        stack_1.push(defs_1.Constants.piAsDouble);
        return;
    }
    // Evaluate symbol's binding
    const p2 = symbol_1.get_binding(p1);
    if (defs_1.DEBUG) {
        console.log(`looked up: ${p1} which contains: ${p2}`);
    }
    stack_1.push(p2);
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
        const positionIfSymbolAlreadyBeingEvaluated = defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.indexOf(p1);
        if (positionIfSymbolAlreadyBeingEvaluated !== -1) {
            let cycleString = '';
            for (let i = positionIfSymbolAlreadyBeingEvaluated; i < defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.length; i++) {
                cycleString +=
                    defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated[i].printname +
                        ' -> ';
            }
            cycleString += p1.printname;
            run_1.stop('recursive evaluation of symbols: ' + cycleString);
            return;
        }
        defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.push(p1);
        stack_1.push(Eval(stack_1.pop()));
        defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.pop();
    }
}
function Eval_cons(p1) {
    const cons_head = defs_1.car(p1);
    // normally the cons_head is a symbol,
    // but sometimes in the case of
    // functions we don't have a symbol,
    // we have to evaluate something to get to the
    // symbol. For example if a function is inside
    // a tensor, then we need to evaluate an index
    // access first to get to the function.
    // In those cases, we find an EVAL here,
    // so we proceed to EVAL
    if (defs_1.car(cons_head) === defs_1.symbol(defs_1.EVAL)) {
        userfunc_1.Eval_user_function(p1);
        return;
    }
    // If we didn't fall in the EVAL case above
    // then at this point we must have a symbol.
    if (!defs_1.issymbol(cons_head)) {
        run_1.stop('cons?');
    }
    switch (symbol_1.symnum(cons_head)) {
        case defs_1.ABS:
            return abs_1.Eval_abs(p1);
        case defs_1.ADD:
            return add_1.Eval_add(p1);
        case defs_1.ADJ:
            return adj_1.Eval_adj(p1);
        case defs_1.AND:
            return test_1.Eval_and(p1);
        case defs_1.ARCCOS:
            return arccos_1.Eval_arccos(p1);
        case defs_1.ARCCOSH:
            return arccosh_1.Eval_arccosh(p1);
        case defs_1.ARCSIN:
            return arcsin_1.Eval_arcsin(p1);
        case defs_1.ARCSINH:
            return arcsinh_1.Eval_arcsinh(p1);
        case defs_1.ARCTAN:
            return arctan_1.Eval_arctan(p1);
        case defs_1.ARCTANH:
            return arctanh_1.Eval_arctanh(p1);
        case defs_1.ARG:
            return arg_1.Eval_arg(p1);
        // case ATOMIZE: return Eval_atomize();
        case defs_1.BESSELJ:
            return besselj_1.Eval_besselj(p1);
        case defs_1.BESSELY:
            return bessely_1.Eval_bessely(p1);
        case defs_1.BINDING:
            return Eval_binding(p1);
        case defs_1.BINOMIAL:
            return binomial_1.Eval_binomial(p1);
        case defs_1.CEILING:
            return ceiling_1.Eval_ceiling(p1);
        case defs_1.CHECK:
            return Eval_check(p1);
        case defs_1.CHOOSE:
            return choose_1.Eval_choose(p1);
        case defs_1.CIRCEXP:
            return circexp_1.Eval_circexp(p1);
        case defs_1.CLEAR:
            return clear_1.Eval_clear(p1);
        case defs_1.CLEARALL:
            return clear_1.Eval_clearall();
        case defs_1.CLEARPATTERNS:
            return pattern_1.Eval_clearpatterns();
        case defs_1.CLOCK:
            return clock_1.Eval_clock(p1);
        case defs_1.COEFF:
            return coeff_1.Eval_coeff(p1);
        case defs_1.COFACTOR:
            return cofactor_1.Eval_cofactor(p1);
        case defs_1.CONDENSE:
            return condense_1.Eval_condense(p1);
        case defs_1.CONJ:
            return conj_1.Eval_conj(p1);
        case defs_1.CONTRACT:
            return contract_1.Eval_contract(p1);
        case defs_1.COS:
            return cos_1.Eval_cos(p1);
        case defs_1.COSH:
            return cosh_1.Eval_cosh(p1);
        case defs_1.DECOMP:
            return decomp_1.Eval_decomp(p1);
        case defs_1.DEGREE:
            return degree_1.Eval_degree(p1);
        case defs_1.DEFINT:
            return defint_1.Eval_defint(p1);
        case defs_1.DENOMINATOR:
            return denominator_1.Eval_denominator(p1);
        case defs_1.DERIVATIVE:
            return derivative_1.Eval_derivative(p1);
        case defs_1.DET:
            return Eval_det(p1);
        case defs_1.DIM:
            return Eval_dim(p1);
        case defs_1.DIRAC:
            return dirac_1.Eval_dirac(p1);
        case defs_1.DIVISORS:
            return Eval_divisors(p1);
        case defs_1.DO:
            return Eval_do(p1);
        case defs_1.DOT:
            return inner_1.Eval_inner(p1);
        // case DRAW: return Eval_draw();
        // case DSOLVE: return Eval_dsolve();
        case defs_1.EIGEN:
            return eigen_1.Eval_eigen(p1);
        case defs_1.EIGENVAL:
            return eigen_1.Eval_eigenval(p1);
        case defs_1.EIGENVEC:
            return eigen_1.Eval_eigenvec(p1);
        case defs_1.ERF:
            return erf_1.Eval_erf(p1);
        case defs_1.ERFC:
            return erfc_1.Eval_erfc(p1);
        case defs_1.EVAL:
            return Eval_Eval(p1);
        case defs_1.EXP:
            return Eval_exp(p1);
        case defs_1.EXPAND:
            return expand_1.Eval_expand(p1);
        case defs_1.EXPCOS:
            return expcos_1.Eval_expcos(p1);
        case defs_1.EXPSIN:
            return expsin_1.Eval_expsin(p1);
        case defs_1.FACTOR:
            return factor_1.Eval_factor(p1);
        case defs_1.FACTORIAL:
            return Eval_factorial(p1);
        case defs_1.FACTORPOLY:
            return Eval_factorpoly(p1);
        case defs_1.FILTER:
            return filter_1.Eval_filter(p1);
        case defs_1.FLOATF:
            return float_1.Eval_float(p1);
        case defs_1.APPROXRATIO:
            return approxratio_1.Eval_approxratio(p1);
        case defs_1.FLOOR:
            return floor_1.Eval_floor(p1);
        case defs_1.FOR:
            return for_1.Eval_for(p1);
        // this is invoked only when we
        // evaluate a function that is NOT being called
        // e.g. when f is a function as we do
        //  g = f
        case defs_1.FUNCTION:
            return define_1.Eval_function_reference(p1);
        case defs_1.GAMMA:
            return gamma_1.Eval_gamma(p1);
        case defs_1.GCD:
            return gcd_1.Eval_gcd(p1);
        case defs_1.HERMITE:
            return Eval_hermite(p1);
        case defs_1.HILBERT:
            return Eval_hilbert(p1);
        case defs_1.IMAG:
            return imag_1.Eval_imag(p1);
        case defs_1.INDEX:
            return Eval_index(p1);
        case defs_1.INNER:
            return inner_1.Eval_inner(p1);
        case defs_1.INTEGRAL:
            return integral_1.Eval_integral(p1);
        case defs_1.INV:
            return Eval_inv(p1);
        case defs_1.INVG:
            return Eval_invg(p1);
        case defs_1.ISINTEGER:
            return Eval_isinteger(p1);
        case defs_1.ISPRIME:
            return isprime_1.Eval_isprime(p1);
        case defs_1.LAGUERRE:
            return laguerre_1.Eval_laguerre(p1);
        //  when LAPLACE then Eval_laplace()
        case defs_1.LCM:
            return lcm_1.Eval_lcm(p1);
        case defs_1.LEADING:
            return leading_1.Eval_leading(p1);
        case defs_1.LEGENDRE:
            return legendre_1.Eval_legendre(p1);
        case defs_1.LOG:
            return log_1.Eval_log(p1);
        case defs_1.LOOKUP:
            return lookup_1.Eval_lookup(p1);
        case defs_1.MOD:
            return mod_1.Eval_mod(p1);
        case defs_1.MULTIPLY:
            return multiply_1.Eval_multiply(p1);
        case defs_1.NOT:
            return test_1.Eval_not(p1);
        case defs_1.NROOTS:
            return nroots_1.Eval_nroots(p1);
        case defs_1.NUMBER:
            return Eval_number(p1);
        case defs_1.NUMERATOR:
            return numerator_1.Eval_numerator(p1);
        case defs_1.OPERATOR:
            return Eval_operator(p1);
        case defs_1.OR:
            return test_1.Eval_or(p1);
        case defs_1.OUTER:
            return outer_1.Eval_outer(p1);
        case defs_1.PATTERN:
            return pattern_1.Eval_pattern(p1);
        case defs_1.PATTERNSINFO:
            return pattern_1.Eval_patternsinfo();
        case defs_1.POLAR:
            return polar_1.Eval_polar(p1);
        case defs_1.POWER:
            return power_1.Eval_power(p1);
        case defs_1.PRIME:
            return prime_1.Eval_prime(p1);
        case defs_1.PRINT:
            return print_1.Eval_print(p1);
        case defs_1.PRINT2DASCII:
            return print_1.Eval_print2dascii(p1);
        case defs_1.PRINTFULL:
            return print_1.Eval_printcomputer(p1);
        case defs_1.PRINTLATEX:
            return print_1.Eval_printlatex(p1);
        case defs_1.PRINTLIST:
            return print_1.Eval_printlist(p1);
        case defs_1.PRINTPLAIN:
            return print_1.Eval_printhuman(p1);
        case defs_1.PRODUCT:
            return product_1.Eval_product(p1);
        case defs_1.QUOTE:
            return Eval_quote(p1);
        case defs_1.QUOTIENT:
            return quotient_1.Eval_quotient(p1);
        case defs_1.RANK:
            return Eval_rank(p1);
        case defs_1.RATIONALIZE:
            return rationalize_1.Eval_rationalize(p1);
        case defs_1.REAL:
            return real_1.Eval_real(p1);
        case defs_1.ROUND:
            return round_1.Eval_round(p1);
        case defs_1.YYRECT:
            return rect_1.Eval_rect(p1);
        case defs_1.ROOTS:
            return roots_1.Eval_roots(p1);
        case defs_1.SETQ:
            return Eval_setq(p1);
        case defs_1.SGN:
            return sgn_1.Eval_sgn(p1);
        case defs_1.SILENTPATTERN:
            return pattern_1.Eval_silentpattern(p1);
        case defs_1.SIMPLIFY:
            return simplify_1.Eval_simplify(p1);
        case defs_1.SIN:
            return sin_1.Eval_sin(p1);
        case defs_1.SINH:
            return sinh_1.Eval_sinh(p1);
        case defs_1.SHAPE:
            return shape_1.Eval_shape(p1);
        case defs_1.SQRT:
            return Eval_sqrt(p1);
        case defs_1.STOP:
            return Eval_stop();
        case defs_1.SUBST:
            return Eval_subst(p1);
        case defs_1.SUM:
            return sum_1.Eval_sum(p1);
        case defs_1.SYMBOLSINFO:
            return symbol_1.Eval_symbolsinfo();
        case defs_1.TAN:
            return tan_1.Eval_tan(p1);
        case defs_1.TANH:
            return tanh_1.Eval_tanh(p1);
        case defs_1.TAYLOR:
            return taylor_1.Eval_taylor(p1);
        case defs_1.TEST:
            return test_1.Eval_test(p1);
        case defs_1.TESTEQ:
            return test_1.Eval_testeq(p1);
        case defs_1.TESTGE:
            return test_1.Eval_testge(p1);
        case defs_1.TESTGT:
            return test_1.Eval_testgt(p1);
        case defs_1.TESTLE:
            return test_1.Eval_testle(p1);
        case defs_1.TESTLT:
            return test_1.Eval_testlt(p1);
        case defs_1.TRANSPOSE:
            return transpose_1.Eval_transpose(p1);
        case defs_1.UNIT:
            return Eval_unit(p1);
        case defs_1.ZERO:
            return zero_1.Eval_zero(p1);
        default:
            return userfunc_1.Eval_user_function(p1);
    }
}
function Eval_binding(p1) {
    stack_1.push(symbol_1.get_binding(defs_1.cadr(p1)));
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
function Eval_check(p1) {
    // check the argument
    const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.cadr(p1));
    if (checkResult == null) {
        // returned null: unknown result
        // leave the whole check unevalled
        stack_1.push(p1);
    }
    else {
        // returned true or false -> 1 or 0
        bignum_1.push_integer(Number(checkResult));
    }
}
function Eval_det(p1) {
    const arg = Eval(defs_1.cadr(p1));
    stack_1.push(det_1.det(arg));
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
function Eval_dim(p1) {
    //int n
    const p2 = Eval(defs_1.cadr(p1));
    const n = defs_1.iscons(defs_1.cddr(p1)) ? evaluate_integer(defs_1.caddr(p1)) : 1;
    if (!defs_1.istensor(p2)) {
        stack_1.push(defs_1.Constants.one); // dim of scalar is 1
    }
    else if (n < 1 || n > p2.tensor.ndim) {
        stack_1.push(p1);
    }
    else {
        bignum_1.push_integer(p2.tensor.dim[n - 1]);
    }
}
function Eval_divisors(p1) {
    stack_1.push(divisors_1.divisors(Eval(defs_1.cadr(p1))));
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
function Eval_do(p1) {
    stack_1.push(defs_1.car(p1));
    p1 = defs_1.cdr(p1);
    while (defs_1.iscons(p1)) {
        stack_1.pop();
        stack_1.push(Eval(defs_1.car(p1)));
        p1 = defs_1.cdr(p1);
    }
}
function Eval_dsolve(p1) {
    stack_1.push(Eval(defs_1.cadr(p1)));
    stack_1.push(Eval(defs_1.caddr(p1)));
    stack_1.push(Eval(defs_1.cadddr(p1)));
    run_1.stop('dsolve');
    //dsolve();
}
// for example, Eval(f,x,2)
function Eval_Eval(p1) {
    let tmp = Eval(defs_1.cadr(p1));
    p1 = defs_1.cddr(p1);
    while (defs_1.iscons(p1)) {
        tmp = subst_1.subst(tmp, Eval(defs_1.car(p1)), Eval(defs_1.cadr(p1)));
        p1 = defs_1.cddr(p1);
    }
    stack_1.push(Eval(tmp));
}
// exp evaluation: it replaces itself with
// a POWER(E,something) node and evals that one
function Eval_exp(p1) {
    stack_1.push(misc_1.exponential(Eval(defs_1.cadr(p1))));
}
function Eval_factorial(p1) {
    stack_1.push(factorial_1.factorial(Eval(defs_1.cadr(p1))));
}
function Eval_factorpoly(p1) {
    p1 = defs_1.cdr(p1);
    const arg1 = Eval(defs_1.car(p1));
    p1 = defs_1.cdr(p1);
    const arg2 = Eval(defs_1.car(p1));
    let temp = factorpoly_1.factorpoly(arg1, arg2);
    if (defs_1.iscons(p1)) {
        temp = p1.tail().reduce((a, b) => factorpoly_1.factorpoly(a, Eval(b)), temp);
    }
    stack_1.push(temp);
}
function Eval_hermite(p1) {
    const arg2 = Eval(defs_1.caddr(p1));
    const arg1 = Eval(defs_1.cadr(p1));
    stack_1.push(hermite_1.hermite(arg1, arg2));
}
function Eval_hilbert(p1) {
    stack_1.push(hilbert_1.hilbert(Eval(defs_1.cadr(p1))));
}
function Eval_index(p1) {
    const result = _index(p1);
    stack_1.push(result);
}
function _index(p1) {
    const orig = p1;
    // look into the head of the list,
    // when evaluated it should be a tensor
    p1 = defs_1.cdr(p1);
    const theTensor = Eval(defs_1.car(p1));
    if (defs_1.isNumericAtom(theTensor)) {
        run_1.stop('trying to access a scalar as a tensor');
    }
    if (!defs_1.istensor(theTensor)) {
        // the tensor is not allocated yet, so
        // leaving the expression unevalled
        return orig;
    }
    const stack = [theTensor];
    // we examined the head of the list which was the tensor,
    // now look into the indexes
    p1 = defs_1.cdr(p1);
    while (defs_1.iscons(p1)) {
        stack.push(Eval(defs_1.car(p1)));
        if (!is_1.isintegerorintegerfloat(stack[stack.length - 1])) {
            // index with something other than an integer
            return orig;
        }
        p1 = defs_1.cdr(p1);
    }
    return _1.index_function(stack);
}
function Eval_inv(p1) {
    const arg = Eval(defs_1.cadr(p1));
    stack_1.push(inv_1.inv(arg));
}
function Eval_invg(p1) {
    const arg = Eval(defs_1.cadr(p1));
    stack_1.push(inv_1.invg(arg));
}
function Eval_isinteger(p1) {
    p1 = Eval(defs_1.cadr(p1));
    const result = _isinteger(p1);
    stack_1.push(result);
}
function _isinteger(p1) {
    if (defs_1.isrational(p1)) {
        return is_1.isinteger(p1) ? defs_1.Constants.one : defs_1.Constants.zero;
    }
    if (defs_1.isdouble(p1)) {
        const n = Math.floor(p1.d);
        return n === p1.d ? defs_1.Constants.one : defs_1.Constants.zero;
    }
    return list_1.makeList(defs_1.symbol(defs_1.ISINTEGER), p1);
}
function Eval_number(p1) {
    p1 = Eval(defs_1.cadr(p1));
    const result = p1.k === defs_1.NUM || p1.k === defs_1.DOUBLE ? defs_1.Constants.one : defs_1.Constants.zero;
    stack_1.push(result);
}
function Eval_operator(p1) {
    const mapped = defs_1.iscons(p1) ? p1.tail().map(Eval) : [];
    const result = list_1.makeList(defs_1.symbol(defs_1.OPERATOR), ...mapped);
    stack_1.push(result);
}
// quote definition
function Eval_quote(p1) {
    stack_1.push(defs_1.cadr(p1));
}
// rank definition
function Eval_rank(p1) {
    p1 = Eval(defs_1.cadr(p1));
    const rank = defs_1.istensor(p1) ? bignum_1.integer(p1.tensor.ndim) : defs_1.Constants.zero;
    stack_1.push(rank);
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
function Eval_setq(p1) {
    // case of tensor
    if (defs_1.caadr(p1) === defs_1.symbol(defs_1.INDEX)) {
        setq_indexed(p1);
        return;
    }
    // case of function definition
    if (defs_1.iscons(defs_1.cadr(p1))) {
        define_1.define_user_function(p1);
        return;
    }
    if (!defs_1.issymbol(defs_1.cadr(p1))) {
        run_1.stop('symbol assignment: error in symbol');
    }
    const p2 = Eval(defs_1.caddr(p1));
    symbol_1.set_binding(defs_1.cadr(p1), p2);
    // An assignment returns nothing.
    // This is unlike most programming languages
    // where an assignment does return the
    // assigned value.
    // TODO Could be changed.
    stack_1.push(defs_1.symbol(defs_1.NIL));
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
function setq_indexed(p1) {
    const p4 = defs_1.cadadr(p1);
    console.log(`p4: ${p4}`);
    if (!defs_1.issymbol(p4)) {
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
        run_1.stop('indexed assignment: expected a symbol name');
    }
    const h = defs_1.defs.tos;
    stack_1.push(Eval(defs_1.caddr(p1)));
    let p2 = defs_1.cdadr(p1);
    if (defs_1.iscons(p2)) {
        stack_1.push_all([...p2].map(Eval));
    }
    _1.set_component(defs_1.defs.tos - h);
    const p3 = stack_1.pop();
    symbol_1.set_binding(p4, p3);
    stack_1.push(defs_1.symbol(defs_1.NIL));
}
function Eval_sqrt(p1) {
    const base = Eval(defs_1.cadr(p1));
    stack_1.push(power_1.power(base, bignum_1.rational(1, 2)));
}
function Eval_stop() {
    run_1.stop('user stop');
}
function Eval_subst(p1) {
    const newExpr = Eval(defs_1.cadr(p1));
    const oldExpr = Eval(defs_1.caddr(p1));
    const expr = Eval(defs_1.cadddr(p1));
    stack_1.push(Eval(subst_1.subst(expr, oldExpr, newExpr)));
}
// always returns a matrix with rank 2
// i.e. two dimensions,
// the passed parameter is the size
function Eval_unit(p1) {
    const n = evaluate_integer(defs_1.cadr(p1));
    if (isNaN(n)) {
        stack_1.push(p1);
        return;
    }
    if (n < 1) {
        stack_1.push(p1);
        return;
    }
    p1 = alloc_1.alloc_tensor(n * n);
    p1.tensor.ndim = 2;
    p1.tensor.dim[0] = n;
    p1.tensor.dim[1] = n;
    for (let i = 0; i < n; i++) {
        p1.tensor.elem[n * i + i] = defs_1.Constants.one;
    }
    tensor_1.check_tensor_dimensions(p1);
    stack_1.push(p1);
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
function Eval_predicate(p1) {
    if (defs_1.car(p1) === defs_1.symbol(defs_1.SETQ)) {
        // replace the assignment in the
        // head with an equality test
        p1 = list_1.makeList(defs_1.symbol(defs_1.TESTEQ), defs_1.cadr(p1), defs_1.caddr(p1));
    }
    return Eval(p1);
}
exports.Eval_predicate = Eval_predicate;
