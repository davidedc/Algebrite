"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplify_trig = exports.simplify = exports.simplifyForCodeGeneration = exports.Eval_simplify = void 0;
const alloc_1 = require("../runtime/alloc");
const count_1 = require("../runtime/count");
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const clock_1 = require("./clock");
const condense_1 = require("./condense");
const eval_1 = require("./eval");
const float_1 = require("./float");
const inner_1 = require("./inner");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const polar_1 = require("./polar");
const power_1 = require("./power");
const rationalize_1 = require("./rationalize");
const real_1 = require("./real");
const rect_1 = require("./rect");
const roots_1 = require("./roots");
const simfac_1 = require("./simfac");
const tensor_1 = require("./tensor");
const transform_1 = require("./transform");
const transpose_1 = require("./transpose");
const denominator_1 = require("./denominator");
const gcd_1 = require("./gcd");
const factor_1 = require("./factor");
const numerator_1 = require("./numerator");
function Eval_simplify(p1) {
    const arg = runUserDefinedSimplifications(defs_1.cadr(p1));
    const result = simplify(eval_1.Eval(arg));
    stack_1.push(result);
}
exports.Eval_simplify = Eval_simplify;
function runUserDefinedSimplifications(p) {
    // -----------------------
    // unfortunately for the time being user
    // specified simplifications are only
    // run in things which don't contain
    // integrals.
    // Doesn't work yet, could be because of
    // some clobbering as "transform" is called
    // recursively?
    if (defs_1.defs.userSimplificationsInListForm.length === 0 ||
        find_1.Find(p, defs_1.symbol(defs_1.INTEGRAL))) {
        return p;
    }
    if (defs_1.DEBUG) {
        console.log(`runUserDefinedSimplifications passed: ${p}`);
    }
    let F1 = defs_1.noexpand(eval_1.Eval, p);
    if (defs_1.DEBUG) {
        console.log(`runUserDefinedSimplifications after eval no expanding: ${F1}`);
        console.log('patterns to be checked: ');
        for (const simplification of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            console.log(`...${simplification}`);
        }
    }
    let atLeastOneSuccessInRouldOfRulesApplications = true;
    let numberOfRulesApplications = 0;
    while (atLeastOneSuccessInRouldOfRulesApplications &&
        numberOfRulesApplications < defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES) {
        atLeastOneSuccessInRouldOfRulesApplications = false;
        numberOfRulesApplications++;
        for (const eachSimplification of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            let success = true;
            let eachConsecutiveRuleApplication = 0;
            while (success &&
                eachConsecutiveRuleApplication <
                    defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE) {
                eachConsecutiveRuleApplication++;
                if (defs_1.DEBUG) {
                    console.log(`simplify - tos: ${defs_1.defs.tos} checking pattern: ${eachSimplification} on: ${F1}`);
                }
                [F1, success] = transform_1.transform(F1, defs_1.symbol(defs_1.NIL), eachSimplification, true);
                if (success) {
                    atLeastOneSuccessInRouldOfRulesApplications = true;
                }
                if (defs_1.DEBUG) {
                    console.log(`p1 at this stage of simplification: ${F1}`);
                }
            }
            if (eachConsecutiveRuleApplication ===
                defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE) {
                run_1.stop(`maximum application of single transformation rule exceeded: ${eachSimplification}`);
            }
        }
    }
    if (numberOfRulesApplications === defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES) {
        run_1.stop('maximum application of all transformation rules exceeded ');
    }
    if (defs_1.DEBUG) {
        console.log(`METAX = ${symbol_1.get_binding(defs_1.symbol(defs_1.METAX))}`);
        console.log(`METAA = ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))}`);
        console.log(`METAB = ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))}`);
    }
    return F1;
}
// ------------------------
function simplifyForCodeGeneration(p) {
    const arg = runUserDefinedSimplifications(p);
    defs_1.defs.codeGen = true;
    // in "codeGen" mode we completely
    // eval and simplify the function bodies
    // because we really want to resolve all
    // the variables indirections and apply
    // all the simplifications we can.
    const result = simplify(arg);
    defs_1.defs.codeGen = false;
    return result;
}
exports.simplifyForCodeGeneration = simplifyForCodeGeneration;
function simplify(p1) {
    // when we do code generation, we proceed to
    // fully evaluate and simplify the body of
    // a function, so we resolve all variables
    // indirections and we simplify everything
    // we can given the current assignments.
    if (defs_1.defs.codeGen && defs_1.car(p1) === defs_1.symbol(defs_1.FUNCTION)) {
        const fbody = defs_1.cadr(p1);
        // let's simplify the body so we give it a
        // compact form
        const p3 = simplify(eval_1.Eval(fbody));
        // replace the evaled body
        const args = defs_1.caddr(p1); // p5 is B
        p1 = list_1.makeList(defs_1.symbol(defs_1.FUNCTION), p3, args);
    }
    if (defs_1.istensor(p1)) {
        return simplify_tensor(p1);
    }
    if (find_1.Find(p1, defs_1.symbol(defs_1.FACTORIAL))) {
        const p2 = simfac_1.simfac(p1);
        const p3 = simfac_1.simfac(rationalize_1.rationalize(p1));
        p1 = count_1.count(p2) < count_1.count(p3) ? p2 : p3;
    }
    p1 = f10(p1);
    p1 = f1(p1);
    p1 = f2(p1);
    p1 = f3(p1);
    p1 = f4(p1);
    p1 = f5(p1);
    p1 = f9(p1);
    [p1] = simplify_polarRect(p1);
    if (defs_1.do_simplify_nested_radicals) {
        let simplify_nested_radicalsResult;
        [simplify_nested_radicalsResult, p1] = simplify_nested_radicals(p1);
        // if there is some de-nesting then
        // re-run a simplification because
        // the shape of the expression might
        // have changed significantly.
        // e.g. simplify(14^(1/2) - (16 - 4*7^(1/2))^(1/2))
        // needs some more semplification after the de-nesting.
        if (simplify_nested_radicalsResult) {
            if (defs_1.DEBUG) {
                console.log('de-nesting successful into: ' + p1.toString());
            }
            return simplify(p1);
        }
    }
    [p1] = simplify_rectToClock(p1);
    p1 = simplify_rational_expressions(p1);
    return p1;
}
exports.simplify = simplify;
function simplify_tensor(p1) {
    let p2 = alloc_1.alloc_tensor(p1.tensor.nelem);
    p2.tensor.ndim = p1.tensor.ndim;
    p2.tensor.dim = Array.from(p1.tensor.dim);
    p2.tensor.elem = p1.tensor.elem.map(simplify);
    tensor_1.check_tensor_dimensions(p2);
    if (is_1.isZeroAtomOrTensor(p2)) {
        p2 = defs_1.Constants.zero; // null tensor becomes scalar zero
    }
    return p2;
}
// try rationalizing
function f1(p1) {
    if (!defs_1.isadd(p1)) {
        return p1;
    }
    const p2 = rationalize_1.rationalize(p1);
    if (count_1.count(p2) < count_1.count(p1)) {
        p1 = p2;
    }
    return p1;
}
// try condensing
function f2(p1) {
    if (!defs_1.isadd(p1)) {
        return p1;
    }
    const p2 = condense_1.Condense(p1);
    if (count_1.count(p2) <= count_1.count(p1)) {
        p1 = p2;
    }
    return p1;
}
// this simplifies forms like (A-B) / (B-A)
function f3(p1) {
    const p2 = rationalize_1.rationalize(multiply_1.negate(rationalize_1.rationalize(multiply_1.negate(rationalize_1.rationalize(p1)))));
    if (count_1.count(p2) < count_1.count(p1)) {
        p1 = p2;
    }
    return p1;
}
function f10(p1) {
    const carp1 = defs_1.car(p1);
    if (carp1 === defs_1.symbol(defs_1.MULTIPLY) || defs_1.isinnerordot(p1)) {
        // both operands a transpose?
        if (defs_1.car(defs_1.car(defs_1.cdr(p1))) === defs_1.symbol(defs_1.TRANSPOSE) &&
            defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(p1)))) === defs_1.symbol(defs_1.TRANSPOSE)) {
            if (defs_1.DEBUG) {
                console.log(`maybe collecting a transpose ${p1}`);
            }
            const a = defs_1.cadr(defs_1.car(defs_1.cdr(p1)));
            const b = defs_1.cadr(defs_1.car(defs_1.cdr(defs_1.cdr(p1))));
            let arg1;
            if (carp1 === defs_1.symbol(defs_1.MULTIPLY)) {
                arg1 = multiply_1.multiply(a, b);
            }
            else if (defs_1.isinnerordot(p1)) {
                arg1 = inner_1.inner(b, a);
            }
            else {
                arg1 = stack_1.pop();
            }
            // const p2 = noexpand(transpose, arg1, Constants.one, integer(2));
            const p2 = defs_1.noexpand(() => {
                return transpose_1.transpose(arg1, defs_1.Constants.one, bignum_1.integer(2));
            });
            if (count_1.count(p2) < count_1.count(p1)) {
                p1 = p2;
            }
            if (defs_1.DEBUG) {
                console.log(`collecting a transpose ${p2}`);
            }
        }
    }
    return p1;
}
// try expanding denominators
function f4(p1) {
    if (is_1.isZeroAtomOrTensor(p1)) {
        return p1;
    }
    const p2 = rationalize_1.rationalize(multiply_1.inverse(rationalize_1.rationalize(multiply_1.inverse(rationalize_1.rationalize(p1)))));
    if (count_1.count(p2) < count_1.count(p1)) {
        p1 = p2;
    }
    return p1;
}
// simplifies trig forms
function simplify_trig(p1) {
    return f5(p1);
}
exports.simplify_trig = simplify_trig;
function f5(p1) {
    if (!find_1.Find(p1, defs_1.symbol(defs_1.SIN)) && !find_1.Find(p1, defs_1.symbol(defs_1.COS))) {
        return p1;
    }
    const p2 = p1;
    defs_1.defs.trigmode = 1;
    let p3 = eval_1.Eval(p2);
    defs_1.defs.trigmode = 2;
    let p4 = eval_1.Eval(p2);
    defs_1.defs.trigmode = 0;
    if (count_1.count(p4) < count_1.count(p3) || nterms(p4) < nterms(p3)) {
        p3 = p4;
    }
    if (count_1.count(p3) < count_1.count(p1) || nterms(p3) < nterms(p1)) {
        p1 = p3;
    }
    return p1;
}
// if it's a sum then try to simplify each term
function f9(p1) {
    if (!defs_1.isadd(p1)) {
        return p1;
    }
    let p2 = defs_1.cdr(p1);
    if (defs_1.iscons(p2)) {
        p2 = [...p2].reduce((acc, p) => simplify_rational_expressions(add_1.add(acc, simplify(p))), defs_1.Constants.zero);
    }
    if (count_1.count(p2) < count_1.count(p1)) {
        p1 = p2;
    }
    return p1;
}
function simplify_rational_expressions(p1) {
    var denom, num, p2, polyVar, theGCD;
    denom = denominator_1.denominator(p1);
    if (is_1.isone(denom)) {
        return p1;
    }
    num = numerator_1.numerator(p1);
    if (is_1.isone(num)) {
        return p1;
    }
    if (!(polyVar = gcd_1.areunivarpolysfactoredorexpandedform(num, denom))) {
        return p1;
    }
    theGCD = factor_1.factor(gcd_1.gcd(num, denom), polyVar);
    if (is_1.isone(theGCD)) {
        return p1;
    }
    let factoredNum = factor_1.factor(num, polyVar);
    let theGCDInverse = multiply_1.inverse(theGCD);
    let multipliedNoeExpandNum = multiply_1.multiply_noexpand(factoredNum, theGCDInverse);
    let simplifiedNum = simplify(multipliedNoeExpandNum);
    let factoredDenom = factor_1.factor(denom, polyVar);
    let multipliedNoeExpandDenom = multiply_1.multiply_noexpand(factoredDenom, theGCDInverse);
    let simplifiedDenom = simplify(multipliedNoeExpandDenom);
    let numDividedDenom = multiply_1.divide(simplifiedNum, simplifiedDenom);
    p2 = condense_1.Condense(numDividedDenom);
    if (count_1.count(p2) < count_1.count(p1)) {
        return p2;
    }
    else {
        return p1;
    }
}
;
// things like 6*(cos(2/9*pi)+i*sin(2/9*pi))
// where we have sin and cos, those might start to
// look better in clock form i.e.  6*(-1)^(2/9)
function simplify_rectToClock(p1) {
    let p2;
    //breakpoint
    if (!find_1.Find(p1, defs_1.symbol(defs_1.SIN)) && !find_1.Find(p1, defs_1.symbol(defs_1.COS))) {
        return [p1];
    }
    p2 = clock_1.clockform(eval_1.Eval(p1)); // put new (hopefully simplified expr) in p2
    if (defs_1.DEBUG) {
        console.log(`before simplification clockform: ${p1} after: ${p2}`);
    }
    if (count_1.count(p2) < count_1.count(p1)) {
        p1 = p2;
    }
    return [p1];
}
function simplify_polarRect(p1) {
    const tmp = polarRectAMinusOneBase(p1);
    const p2 = eval_1.Eval(tmp); // put new (hopefully simplified expr) in p2
    if (count_1.count(p2) < count_1.count(p1)) {
        p1 = p2;
    }
    return [p1];
}
function polarRectAMinusOneBase(p1) {
    if (is_1.isimaginaryunit(p1)) {
        return p1;
    }
    if (misc_1.equal(defs_1.car(p1), defs_1.symbol(defs_1.POWER)) && is_1.isminusone(defs_1.cadr(p1))) {
        // base we just said is minus 1
        const base = multiply_1.negate(defs_1.Constants.one);
        // exponent
        const exponent = polarRectAMinusOneBase(defs_1.caddr(p1));
        // try to simplify it using polar and rect
        return rect_1.rect(polar_1.polar(power_1.power(base, exponent)));
    }
    if (defs_1.iscons(p1)) {
        const arr = [];
        while (defs_1.iscons(p1)) {
            //console.log("recursing on: " + car(p1).toString())
            arr.push(polarRectAMinusOneBase(defs_1.car(p1)));
            //console.log("...transformed into: " + stack[tos-1].toString())
            p1 = defs_1.cdr(p1);
        }
        return list_1.makeList(...arr);
    }
    return p1;
}
function nterms(p) {
    if (!defs_1.isadd(p)) {
        return 1;
    }
    else {
        return misc_1.length(p) - 1;
    }
}
function simplify_nested_radicals(p1) {
    if (defs_1.defs.recursionLevelNestedRadicalsRemoval > 0) {
        if (defs_1.DEBUG) {
            console.log('denesting bailing out because of too much recursion');
        }
        return [false, p1];
    }
    const [simplificationWithoutCondense, somethingSimplified,] = take_care_of_nested_radicals(p1);
    // in this paragraph we check whether we can collect
    // common factors without complicating the expression
    // in particular we want to avoid
    // collecting radicals like in this case where
    // we collect sqrt(2):
    //   2-2^(1/2) into 2^(1/2)*(-1+2^(1/2))
    // but we do like to collect other non-radicals e.g.
    //   17/2+3/2*5^(1/2) into 1/2*(17+3*5^(1/2))
    // so what we do is we count the powers and we check
    // which version has the least number of them.
    const simplificationWithCondense = defs_1.noexpand(condense_1.yycondense, simplificationWithoutCondense);
    //console.log("occurrences of powers in " + simplificationWithoutCondense + " :" + countOccurrencesOfSymbol(symbol(POWER),simplificationWithoutCondense))
    //console.log("occurrences of powers in " + simplificationWithCondense + " :" + countOccurrencesOfSymbol(symbol(POWER),simplificationWithCondense))
    p1 =
        count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.POWER), simplificationWithoutCondense) <
            count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.POWER), simplificationWithCondense)
            ? simplificationWithoutCondense
            : simplificationWithCondense;
    // we got out result, wrap up
    return [somethingSimplified, p1];
}
function take_care_of_nested_radicals(p1) {
    if (defs_1.defs.recursionLevelNestedRadicalsRemoval > 0) {
        if (defs_1.DEBUG) {
            console.log('denesting bailing out because of too much recursion');
        }
        return [p1, false];
    }
    if (misc_1.equal(defs_1.car(p1), defs_1.symbol(defs_1.POWER))) {
        return _nestedPowerSymbol(p1);
    }
    if (defs_1.iscons(p1)) {
        return _nestedCons(p1);
    }
    return [p1, false];
}
function _nestedPowerSymbol(p1) {
    //console.log("ok it's a power ")
    const base = defs_1.cadr(p1);
    const exponent = defs_1.caddr(p1);
    //console.log("possible double radical base: " + base)
    //console.log("possible double radical exponent: " + exponent)
    if (is_1.isminusone(exponent) ||
        !misc_1.equal(defs_1.car(base), defs_1.symbol(defs_1.ADD)) ||
        !is_1.isfraction(exponent) ||
        (!is_1.equalq(exponent, 1, 3) && !is_1.equalq(exponent, 1, 2))) {
        return [p1, false];
    }
    //console.log("ok there is a radix with a term inside")
    const firstTerm = defs_1.cadr(base);
    take_care_of_nested_radicals(firstTerm);
    const secondTerm = defs_1.caddr(base);
    take_care_of_nested_radicals(secondTerm);
    let numberOfTerms = 0;
    let countingTerms = base;
    while (defs_1.cdr(countingTerms) !== defs_1.symbol(defs_1.NIL)) {
        numberOfTerms++;
        countingTerms = defs_1.cdr(countingTerms);
    }
    if (numberOfTerms > 2) {
        return [p1, false];
    }
    // list here all the factors
    const { commonBases, termsThatAreNotPowers } = _listAll(secondTerm);
    if (commonBases.length === 0) {
        return [p1, false];
    }
    const A = firstTerm;
    const C = commonBases.reduce(multiply_1.multiply, defs_1.Constants.one);
    const B = termsThatAreNotPowers.reduce(multiply_1.multiply, defs_1.Constants.one);
    let temp;
    if (is_1.equalq(exponent, 1, 3)) {
        const checkSize1 = multiply_1.divide(multiply_1.multiply(multiply_1.negate(A), C), B); // 4th coeff
        const result1 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize1)));
        if (Math.abs(result1) > Math.pow(2, 32)) {
            return [p1, false];
        }
        const checkSize2 = multiply_1.multiply(bignum_1.integer(3), C); // 3rd coeff
        const result2 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize2)));
        if (Math.abs(result2) > Math.pow(2, 32)) {
            return [p1, false];
        }
        const arg1b = multiply_1.multiply(checkSize2, defs_1.symbol(defs_1.SECRETX));
        const checkSize3 = multiply_1.divide(multiply_1.multiply(bignum_1.integer(-3), A), B); // 2nd coeff
        const result3 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize3)));
        if (Math.abs(result3) > Math.pow(2, 32)) {
            return [p1, false];
        }
        const result = add_1.add_all([
            checkSize1,
            arg1b,
            multiply_1.multiply(checkSize3, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2))),
            multiply_1.multiply(defs_1.Constants.one, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(3))),
        ]);
        temp = result;
    }
    else if (is_1.equalq(exponent, 1, 2)) {
        const result1 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(C)));
        if (Math.abs(result1) > Math.pow(2, 32)) {
            return [p1, false];
        }
        const checkSize = multiply_1.divide(multiply_1.multiply(bignum_1.integer(-2), A), B);
        const result2 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize)));
        if (Math.abs(result2) > Math.pow(2, 32)) {
            return [p1, false];
        }
        temp = add_1.add(C, add_1.add(multiply_1.multiply(checkSize, defs_1.symbol(defs_1.SECRETX)), multiply_1.multiply(defs_1.Constants.one, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2)))));
    }
    defs_1.defs.recursionLevelNestedRadicalsRemoval++;
    const r = roots_1.roots(temp, defs_1.symbol(defs_1.SECRETX));
    defs_1.defs.recursionLevelNestedRadicalsRemoval--;
    if (misc_1.equal(r[r.length - 1], defs_1.symbol(defs_1.NIL))) {
        if (defs_1.DEBUG) {
            console.log('roots bailed out because of too much recursion');
        }
        return [p1, false];
    }
    // exclude the solutions with radicals
    const possibleSolutions = r[r.length - 1].elem.filter((sol) => !find_1.Find(sol, defs_1.symbol(defs_1.POWER)));
    if (possibleSolutions.length === 0) {
        return [p1, false];
    }
    const possibleRationalSolutions = [];
    const realOfpossibleRationalSolutions = [];
    //console.log("checking the one with maximum real part ")
    for (const i of Array.from(possibleSolutions)) {
        const result = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(i)));
        possibleRationalSolutions.push(i);
        realOfpossibleRationalSolutions.push(result);
    }
    const whichRationalSolution = realOfpossibleRationalSolutions.indexOf(Math.max.apply(Math, realOfpossibleRationalSolutions));
    const SOLUTION = possibleRationalSolutions[whichRationalSolution];
    if (!is_1.equalq(exponent, 1, 3) && !is_1.equalq(exponent, 1, 2)) {
        return [p1, false];
    }
    if (is_1.equalq(exponent, 1, 3)) {
        const lowercase_b = power_1.power(multiply_1.divide(A, add_1.add(power_1.power(SOLUTION, bignum_1.integer(3)), multiply_1.multiply(multiply_1.multiply(bignum_1.integer(3), C), SOLUTION))), bignum_1.rational(1, 3));
        const lowercase_a = multiply_1.multiply(lowercase_b, SOLUTION);
        const result = simplify(add_1.add(multiply_1.multiply(lowercase_b, power_1.power(C, bignum_1.rational(1, 2))), lowercase_a));
        return [result, true];
    }
    if (is_1.equalq(exponent, 1, 2)) {
        const lowercase_b = power_1.power(multiply_1.divide(A, add_1.add(power_1.power(SOLUTION, bignum_1.integer(2)), C)), bignum_1.rational(1, 2));
        const lowercase_a = multiply_1.multiply(lowercase_b, SOLUTION);
        const possibleNewExpression = simplify(add_1.add(multiply_1.multiply(lowercase_b, power_1.power(C, bignum_1.rational(1, 2))), lowercase_a));
        const possibleNewExpressionValue = float_1.yyfloat(real_1.real(possibleNewExpression));
        if (!is_1.isnegativenumber(possibleNewExpressionValue)) {
            return [possibleNewExpression, true];
        }
        const result = simplify(add_1.add(multiply_1.multiply(multiply_1.negate(lowercase_b), power_1.power(C, bignum_1.rational(1, 2))), multiply_1.negate(lowercase_a)));
        return [result, true];
    }
    return [null, true];
}
function _listAll(secondTerm) {
    let commonInnerExponent = null;
    const commonBases = [];
    const termsThatAreNotPowers = [];
    if (defs_1.ismultiply(secondTerm)) {
        // product of factors
        let secondTermFactor = defs_1.cdr(secondTerm);
        if (defs_1.iscons(secondTermFactor)) {
            while (defs_1.iscons(secondTermFactor)) {
                const potentialPower = defs_1.car(secondTermFactor);
                if (defs_1.ispower(potentialPower)) {
                    const innerbase = defs_1.cadr(potentialPower);
                    const innerexponent = defs_1.caddr(potentialPower);
                    if (is_1.equalq(innerexponent, 1, 2)) {
                        if (commonInnerExponent == null) {
                            commonInnerExponent = innerexponent;
                            commonBases.push(innerbase);
                        }
                        else if (misc_1.equal(innerexponent, commonInnerExponent)) {
                            commonBases.push(innerbase);
                        }
                    }
                }
                else {
                    termsThatAreNotPowers.push(potentialPower);
                }
                secondTermFactor = defs_1.cdr(secondTermFactor);
            }
        }
    }
    else if (defs_1.ispower(secondTerm)) {
        const innerbase = defs_1.cadr(secondTerm);
        const innerexponent = defs_1.caddr(secondTerm);
        if (commonInnerExponent == null && is_1.equalq(innerexponent, 1, 2)) {
            commonInnerExponent = innerexponent;
            commonBases.push(innerbase);
        }
    }
    return { commonBases, termsThatAreNotPowers };
}
function _nestedCons(p1) {
    let anyRadicalSimplificationWorked = false;
    const arr = [];
    if (defs_1.iscons(p1)) {
        const items = Array.from(p1).map((p) => {
            if (!anyRadicalSimplificationWorked) {
                let p2;
                [p2, anyRadicalSimplificationWorked] = take_care_of_nested_radicals(p);
                return p2;
            }
            return p;
        });
        arr.push(...items);
    }
    return [list_1.makeList(...arr), anyRadicalSimplificationWorked];
}
