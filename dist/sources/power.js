"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.power = exports.Eval_power = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const stack_1 = require("../runtime/stack");
const symbol_1 = require("../runtime/symbol");
const misc_1 = require("../sources/misc");
const abs_1 = require("./abs");
const add_1 = require("./add");
const arg_1 = require("./arg");
const bignum_1 = require("./bignum");
const conj_1 = require("./conj");
const cos_1 = require("./cos");
const dpow_1 = require("./dpow");
const eval_1 = require("./eval");
const factorial_1 = require("./factorial");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const qpow_1 = require("./qpow");
const rect_1 = require("./rect");
const sin_1 = require("./sin");
const tensor_1 = require("./tensor");
/* Power function

  Input:    push  Base
            push  Exponent

  Output:    Result on stack
*/
const DEBUG_POWER = false;
function Eval_power(p1) {
    if (DEBUG_POWER) {
        defs_1.breakpoint;
    }
    const exponent = eval_1.Eval(defs_1.caddr(p1));
    const base = eval_1.Eval(defs_1.cadr(p1));
    stack_1.push(power(base, exponent));
}
exports.Eval_power = Eval_power;
function power(p1, p2) {
    return yypower(p1, p2);
}
exports.power = power;
function yypower(base, exponent) {
    if (DEBUG_POWER) {
        defs_1.breakpoint;
    }
    const inputExp = exponent;
    const inputBase = base;
    //breakpoint
    if (DEBUG_POWER) {
        console.log(`POWER: ${base} ^ ${exponent}`);
    }
    // first, some very basic simplifications right away
    //  1 ^ a    ->  1
    //  a ^ 0    ->  1
    if (misc_1.equal(base, defs_1.Constants.one) || is_1.isZeroAtomOrTensor(exponent)) {
        const one = defs_1.Constants.One();
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${one}`);
        }
        return one;
    }
    //  a ^ 1    ->  a
    if (misc_1.equal(exponent, defs_1.Constants.one)) {
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${base}`);
        }
        return base;
    }
    //   -1 ^ -1    ->  -1
    if (is_1.isminusone(base) && is_1.isminusone(exponent)) {
        const negOne = multiply_1.negate(defs_1.Constants.One());
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${negOne}`);
        }
        return negOne;
    }
    //   -1 ^ 1/2  ->  i
    if (is_1.isminusone(base) && is_1.isoneovertwo(exponent)) {
        const result = defs_1.Constants.imaginaryunit;
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    //   -1 ^ -1/2  ->  -i
    if (is_1.isminusone(base) && is_1.isminusoneovertwo(exponent)) {
        const result = multiply_1.negate(defs_1.Constants.imaginaryunit);
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    let tmp;
    //   -1 ^ rational
    if (is_1.isminusone(base) &&
        !defs_1.isdouble(base) &&
        defs_1.isrational(exponent) &&
        !is_1.isinteger(exponent) &&
        is_1.ispositivenumber(exponent) &&
        !defs_1.defs.evaluatingAsFloats) {
        if (DEBUG_POWER) {
            console.log('   power: -1 ^ rational');
            console.log(` trick: exponent.q.a , exponent.q.b ${exponent.q.a} , ${exponent.q.b}`);
        }
        if (exponent.q.a < exponent.q.b) {
            tmp = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
        }
        else {
            tmp = list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), base, list_1.makeList(defs_1.symbol(defs_1.POWER), base, bignum_1.rational(exponent.q.a.mod(exponent.q.b), exponent.q.b)));
            if (DEBUG_POWER) {
                console.log(` trick applied : ${tmp}`);
            }
        }
        // evaluates clock form into
        // rectangular form. This seems to give
        // slightly better form to some test results.
        const result = rect_1.rect(tmp);
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // both base and exponent are rational numbers?
    if (defs_1.isrational(base) && defs_1.isrational(exponent)) {
        if (DEBUG_POWER) {
            console.log('   power: isrational(base) && isrational(exponent)');
        }
        const result = qpow_1.qpow(base, exponent);
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // both base and exponent are either rational or double?
    if (defs_1.isNumericAtom(base) && defs_1.isNumericAtom(exponent)) {
        const result = dpow_1.dpow(bignum_1.nativeDouble(base), bignum_1.nativeDouble(exponent));
        if (DEBUG_POWER) {
            console.log('   power: both base and exponent are either rational or double ');
            console.log('POWER - isNumericAtom(base) && isNumericAtom(exponent)');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    if (defs_1.istensor(base)) {
        const result = tensor_1.power_tensor(base, exponent);
        if (DEBUG_POWER) {
            console.log('   power: istensor(base) ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // if we only assume variables to be real, then |a|^2 = a^2
    // (if x is complex this doesn't hold e.g. i, which makes 1 and -1
    if (defs_1.car(base) === defs_1.symbol(defs_1.ABS) &&
        is_1.iseveninteger(exponent) &&
        !is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
        const result = power(defs_1.cadr(base), exponent);
        if (DEBUG_POWER) {
            console.log('   power: even power of absolute of real value ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // e^log(...)
    if (base === defs_1.symbol(defs_1.E) && defs_1.car(exponent) === defs_1.symbol(defs_1.LOG)) {
        const result = defs_1.cadr(exponent);
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // e^some_float
    if (base === defs_1.symbol(defs_1.E) && defs_1.isdouble(exponent)) {
        const result = bignum_1.double(Math.exp(exponent.d));
        if (DEBUG_POWER) {
            console.log('   power: base == symbol(E) && isdouble(exponent) ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // complex number in exponential form, get it to rectangular
    // but only if we are not in the process of calculating a polar form,
    // otherwise we'd just undo the work we want to do
    if (base === defs_1.symbol(defs_1.E) &&
        find_1.Find(exponent, defs_1.Constants.imaginaryunit) &&
        find_1.Find(exponent, defs_1.symbol(defs_1.PI)) &&
        !defs_1.defs.evaluatingPolar) {
        let tmp = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
        if (DEBUG_POWER) {
            console.log(`   power: turning complex exponential to rect: ${stack_1.top()}`);
        }
        const hopefullySimplified = rect_1.rect(tmp); // put new (hopefully simplified expr) in exponent
        if (!find_1.Find(hopefullySimplified, defs_1.symbol(defs_1.PI))) {
            if (DEBUG_POWER) {
                console.log(`   power: turned complex exponential to rect: ${hopefullySimplified}`);
            }
            return hopefullySimplified;
        }
    }
    //  (a * b) ^ c  ->  (a ^ c) * (b ^ c)
    // note that we can't in general do this, for example
    // sqrt(x*y) != x^(1/2) y^(1/2) (counterexample" x = -1 and y = -1)
    // BUT we can carve-out here some cases where this
    // transformation is correct
    if (defs_1.ismultiply(base) && is_1.isinteger(exponent)) {
        base = defs_1.cdr(base);
        let result = power(defs_1.car(base), exponent);
        if (defs_1.iscons(base)) {
            result = base
                .tail()
                .reduce((a, b) => multiply_1.multiply(a, power(b, exponent)), result);
        }
        if (DEBUG_POWER) {
            console.log('   power: (a * b) ^ c  ->  (a ^ c) * (b ^ c) ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // (a ^ b) ^ c  ->  a ^ (b * c)
    // note that we can't in general do this, for example
    // sqrt(x^y) !=  x^(1/2 y) (counterexample x = -1)
    // BUT we can carve-out here some cases where this
    // transformation is correct
    // simple numeric check to see if a is a number > 0
    let is_a_moreThanZero = false;
    if (defs_1.isNumericAtom(defs_1.cadr(base))) {
        is_a_moreThanZero =
            misc_1.sign(bignum_1.compare_numbers(defs_1.cadr(base), defs_1.Constants.zero)) > 0;
    }
    if (defs_1.ispower(base) && // when c is an integer
        (is_1.isinteger(exponent) || is_a_moreThanZero) // when a is >= 0
    ) {
        const result = power(defs_1.cadr(base), multiply_1.multiply(defs_1.caddr(base), exponent));
        if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    let b_isEven_and_c_isItsInverse = false;
    if (is_1.iseveninteger(defs_1.caddr(base))) {
        const isThisOne = multiply_1.multiply(defs_1.caddr(base), exponent);
        if (is_1.isone(isThisOne)) {
            b_isEven_and_c_isItsInverse = true;
        }
    }
    if (defs_1.ispower(base) && b_isEven_and_c_isItsInverse) {
        const result = abs_1.abs(defs_1.cadr(base));
        if (DEBUG_POWER) {
            console.log('   power: car(base) == symbol(POWER) && b_isEven_and_c_isItsInverse ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    //  when expanding,
    //  (a + b) ^ n  ->  (a + b) * (a + b) ...
    if (defs_1.defs.expanding && defs_1.isadd(base) && defs_1.isNumericAtom(exponent)) {
        const n = bignum_1.nativeInt(exponent);
        if (n > 1 && !isNaN(n)) {
            if (DEBUG_POWER) {
                console.log('   power: expanding && isadd(base) && isNumericAtom(exponent) ');
            }
            let result = power_sum(n, base);
            if (DEBUG_POWER) {
                console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
            }
            return result;
        }
    }
    //  sin(x) ^ 2n -> (1 - cos(x) ^ 2) ^ n
    if (defs_1.defs.trigmode === 1 &&
        defs_1.car(base) === defs_1.symbol(defs_1.SIN) &&
        is_1.iseveninteger(exponent)) {
        const result = power(add_1.subtract(defs_1.Constants.one, power(cos_1.cosine(defs_1.cadr(base)), bignum_1.integer(2))), multiply_1.multiply(exponent, bignum_1.rational(1, 2)));
        if (DEBUG_POWER) {
            console.log('   power: trigmode == 1 && car(base) == symbol(SIN) && iseveninteger(exponent) ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    //  cos(x) ^ 2n -> (1 - sin(x) ^ 2) ^ n
    if (defs_1.defs.trigmode === 2 &&
        defs_1.car(base) === defs_1.symbol(defs_1.COS) &&
        is_1.iseveninteger(exponent)) {
        const result = power(add_1.subtract(defs_1.Constants.one, power(sin_1.sine(defs_1.cadr(base)), bignum_1.integer(2))), multiply_1.multiply(exponent, bignum_1.rational(1, 2)));
        if (DEBUG_POWER) {
            console.log('   power: trigmode == 2 && car(base) == symbol(COS) && iseveninteger(exponent) ');
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
    }
    // complex number? (just number, not expression)
    if (is_1.iscomplexnumber(base)) {
        if (DEBUG_POWER) {
            console.log(' power - handling the case (a + ib) ^ n');
        }
        // integer power?
        // n will be negative here, positive n already handled
        if (is_1.isinteger(exponent)) {
            //               /        \  n
            //         -n   |  a - ib  |
            // (a + ib)   = | -------- |
            //              |   2   2  |
            //               \ a + b  /
            const p3 = conj_1.conjugate(base);
            // gets the denominator
            let result = multiply_1.divide(p3, multiply_1.multiply(p3, base));
            if (!is_1.isone(exponent)) {
                result = power(result, multiply_1.negate(exponent));
            }
            if (DEBUG_POWER) {
                console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
            }
            return result;
        }
        // noninteger or floating power?
        if (defs_1.isNumericAtom(exponent)) {
            // remember that the "double" type is
            // toxic, i.e. it propagates, so we do
            // need to evaluate PI to its actual double
            // value
            //console.log("power pushing PI when base is: " + base + " and exponent is:" + exponent)
            const pi = defs_1.defs.evaluatingAsFloats ||
                (is_1.iscomplexnumberdouble(base) && defs_1.isdouble(exponent))
                ? bignum_1.double(Math.PI)
                : defs_1.symbol(defs_1.PI);
            let tmp = multiply_1.multiply(power(abs_1.abs(base), exponent), power(defs_1.Constants.negOne, multiply_1.divide(multiply_1.multiply(arg_1.arg(base), exponent), pi)));
            // if we calculate the power making use of arctan:
            //  * it prevents nested radicals from being simplified
            //  * results become really hard to manipulate afterwards
            //  * we can't go back to other forms.
            // so leave the power as it is.
            if (defs_1.avoidCalculatingPowersIntoArctans && find_1.Find(tmp, defs_1.symbol(defs_1.ARCTAN))) {
                tmp = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
            }
            if (DEBUG_POWER) {
                console.log(`   power of ${inputBase} ^ ${inputExp}: ${tmp}`);
            }
            return tmp;
        }
    }
    const polarResult = simplify_polar(exponent);
    if (polarResult !== undefined) {
        if (DEBUG_POWER) {
            console.log('   power: using simplify_polar');
        }
        return polarResult;
    }
    const result = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
    if (DEBUG_POWER) {
        console.log('   power: nothing can be done ');
        console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
    }
    return result;
}
//-----------------------------------------------------------------------------
//
//  Compute the power of a sum
//
//  Input:    p1  sum
//
//      n  exponent
//
//  Output:    Result on stack
//
//  Note:
//
//  Uses the multinomial series (see Math World)
//
//                          n              n!          n1   n2       nk
//  (a1 + a2 + ... + ak)  = sum (--------------- a1   a2   ... ak  )
//                               n1! n2! ... nk!
//
//  The sum is over all n1 ... nk such that n1 + n2 + ... + nk = n.
//
//-----------------------------------------------------------------------------
// first index is the term number 0..k-1, second index is the exponent 0..n
//define A(i, j) frame[(i) * (n + 1) + (j)]
function power_sum(n, p1) {
    const a = [];
    // number of terms in the sum
    const k = misc_1.length(p1) - 1;
    // array of powers
    const powers = [];
    p1 = defs_1.cdr(p1);
    for (let i = 0; i < k; i++) {
        for (let j = 0; j <= n; j++) {
            powers[i * (n + 1) + j] = power(defs_1.car(p1), bignum_1.integer(j));
        }
        p1 = defs_1.cdr(p1);
    }
    p1 = factorial_1.factorial(bignum_1.integer(n));
    for (let i = 0; i < k; i++) {
        a[i] = 0;
    }
    return multinomial_sum(k, n, a, 0, n, powers, p1, defs_1.Constants.zero);
}
//-----------------------------------------------------------------------------
//
//  Compute multinomial sum
//
//  Input:    k  number of factors
//
//      n  overall exponent
//
//      a  partition array
//
//      i  partition array index
//
//      m  partition remainder
//
//      p1  n!
//
//      A  factor array
//
//  Output:    Result on stack
//
//  Note:
//
//  Uses recursive descent to fill the partition array.
//
//-----------------------------------------------------------------------------
function multinomial_sum(k, n, a, i, m, A, p1, p2) {
    if (i < k - 1) {
        for (let j = 0; j <= m; j++) {
            a[i] = j;
            p2 = multinomial_sum(k, n, a, i + 1, m - j, A, p1, p2);
        }
        return p2;
    }
    a[i] = m;
    // coefficient
    let temp = p1;
    for (let j = 0; j < k; j++) {
        temp = multiply_1.divide(temp, factorial_1.factorial(bignum_1.integer(a[j])));
    }
    // factors
    for (let j = 0; j < k; j++) {
        temp = multiply_1.multiply(temp, A[j * (n + 1) + a[j]]);
    }
    return add_1.add(p2, temp);
}
// exp(n/2 i pi) ?
// clobbers p3
function simplify_polar(exponent) {
    let n = is_1.isquarterturn(exponent);
    switch (n) {
        case 0:
            // do nothing
            break;
        case 1:
            return defs_1.Constants.one;
        case 2:
            return defs_1.Constants.negOne;
        case 3:
            return defs_1.Constants.imaginaryunit;
        case 4:
            return multiply_1.negate(defs_1.Constants.imaginaryunit);
    }
    if (defs_1.isadd(exponent)) {
        let p3 = defs_1.cdr(exponent);
        while (defs_1.iscons(p3)) {
            n = is_1.isquarterturn(defs_1.car(p3));
            if (n) {
                break;
            }
            p3 = defs_1.cdr(p3);
        }
        let arg1;
        switch (n) {
            case 0:
                return undefined;
            case 1:
                arg1 = defs_1.Constants.one;
                break;
            case 2:
                arg1 = defs_1.Constants.negOne;
                break;
            case 3:
                arg1 = defs_1.Constants.imaginaryunit;
                break;
            case 4:
                arg1 = multiply_1.negate(defs_1.Constants.imaginaryunit);
                break;
        }
        return multiply_1.multiply(arg1, misc_1.exponential(add_1.subtract(exponent, defs_1.car(p3))));
    }
    return undefined;
}
